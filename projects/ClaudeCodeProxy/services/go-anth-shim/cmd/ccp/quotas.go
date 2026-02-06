package main

import (
	"context"
	"encoding/json"
	"errors"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

type quotaModelCfg struct {
	Provider         string  `json:"provider"`
	RollingTokens    int64   `json:"rolling_tokens"`
	WeeklyLimitType  string  `json:"weekly_limit_type"` // "hours" | "tokens"
	WeeklyLimitValue int64   `json:"weekly_limit_value"`
	WarnPct          float64 `json:"warn_pct"`
}

type quotasFile struct {
	Windows struct {
		RollingSeconds int64 `json:"rolling_seconds"`
		WeeklySeconds  int64 `json:"weekly_seconds"`
	} `json:"windows"`
	Models map[string]quotaModelCfg `json:"models"`
}

type usageSample struct {
	TS            time.Time
	Model         string
	InTokens      int64
	OutTokens     int64
	DirtySeconds  float64
	StreamSeconds float64
	TTFTMillis    int
}

type modelCounters struct {
	samples       []usageSample
	sessionIn     int64
	sessionOut    int64
	sessionDirty  float64
	sessionStream float64
	sessionTTFT   float64
	sessionCount  int64
}

type calibrationStats struct {
	warnPctAuto    float64
	warnConfidence float64
	gapSecondsP50  float64
	gapSecondsP95  float64
	gapSamples     int
}

type probeGap struct {
	Model         string  `json:"model"`
	GapSecondsP50 float64 `json:"gap_seconds_p50"`
	GapSecondsP95 float64 `json:"gap_seconds_p95"`
	Samples       int     `json:"samples"`
}

type speedSnapshot struct {
	OutELR     float64 `json:"out_elr_tps"`
	OutDirty   float64 `json:"out_dirty_tps"`
	InELR      float64 `json:"in_elr_tps"`
	InDirty    float64 `json:"in_dirty_tps"`
	TotalELR   float64 `json:"total_elr_tps"`
	TotalDirty float64 `json:"total_dirty_tps"`
}

type ttftSnapshot struct {
	P50 float64 `json:"p50"`
	P90 float64 `json:"p90"`
	P99 float64 `json:"p99"`
}

type hourSpeed struct {
	Hour     int      `json:"hour"`
	Samples  int      `json:"samples"`
	OutELR   *float64 `json:"out_elr_tps,omitempty"`
	OutDirty *float64 `json:"out_dirty_tps,omitempty"`
}

type modelSpeeds struct {
	Rolling        speedSnapshot `json:"rolling"`
	Session        speedSnapshot `json:"session"`
	TTFT           ttftSnapshot  `json:"ttft_ms"`
	Hourly         []hourSpeed   `json:"hourly"`
	RollingSamples int           `json:"rolling_samples"`
	WeeklySamples  int           `json:"weekly_samples"`
}

func calcTPS(tokens int64, seconds float64) float64 {
	if tokens <= 0 || seconds <= 0 {
		return 0
	}
	return float64(tokens) / seconds
}

const minHODSamples = 10

func computeTTFTQuantiles(vals []int) ttftSnapshot {
	if len(vals) == 0 {
		return ttftSnapshot{}
	}
	sorted := append([]int(nil), vals...)
	sort.Ints(sorted)
	return ttftSnapshot{
		P50: percentileInt(sorted, 0.50),
		P90: percentileInt(sorted, 0.90),
		P99: percentileInt(sorted, 0.99),
	}
}

func percentileInt(vals []int, p float64) float64 {
	n := len(vals)
	if n == 0 {
		return 0
	}
	if p <= 0 {
		return float64(vals[0])
	}
	if p >= 1 {
		return float64(vals[n-1])
	}
	pos := p * float64(n-1)
	lower := int(math.Floor(pos))
	upper := int(math.Ceil(pos))
	if lower == upper {
		return float64(vals[lower])
	}
	weight := pos - float64(lower)
	return float64(vals[lower])*(1-weight) + float64(vals[upper])*weight
}

type quotaSnapshot struct {
	RollingUsed     int64
	RollingCapacity int64
	WeeklyUsed      int64
	WeeklyCapacity  int64
}

func (q *quotasEngine) snapshot(model string) quotaSnapshot {
	var snap quotaSnapshot
	if q == nil {
		return snap
	}
	q.mu.Lock()
	defer q.mu.Unlock()
	now := time.Now()
	q.pruneLocked(now)
	cfg := q.cfg.Models[model]
	if cfg.RollingTokens > 0 {
		snap.RollingCapacity = cfg.RollingTokens
	}
	if strings.EqualFold(cfg.WeeklyLimitType, "tokens") && cfg.WeeklyLimitValue > 0 {
		snap.WeeklyCapacity = cfg.WeeklyLimitValue
	}
	mc := q.models[model]
	if mc == nil {
		return snap
	}
	cutoffR := now.Add(-q.rollingWindow)
	cutoffW := now.Add(-q.weeklyWindow)
	var inR, outR int64
	var weeklyTokens int64
	for _, s := range mc.samples {
		if s.TS.After(cutoffR) {
			inR += s.InTokens
			outR += s.OutTokens
		}
		if s.TS.After(cutoffW) {
			weeklyTokens += s.InTokens + s.OutTokens
		}
	}
	snap.RollingUsed = inR + outR
	snap.WeeklyUsed = weeklyTokens
	return snap
}

type quotasEngine struct {
    mu            sync.Mutex
    cfg           quotasFile
    path          string
    loaded        time.Time
    rollingWindow time.Duration
    weeklyWindow  time.Duration
    models        map[string]*modelCounters
    calibration   map[string]*calibrationStats
    // optional license summary for /v1/usage (additive)
    licenseOK      bool
    licensePlan    string
    licenseFeatures []string
}

func defaultQuotaPaths(root string) []string {
	user := ""
	if home, _ := os.UserHomeDir(); home != "" {
		user = filepath.Join(home, ".config", "ccp", "quotas.json")
	}
	project := filepath.Join(root, "configs", "quotas.json")
	example := filepath.Join(root, "configs", "quotas.example.json")
	if env := strings.TrimSpace(os.Getenv("CCP_QUOTAS_FILE")); env != "" {
		return []string{env, user, project, example}
	}
	return []string{user, project, example}
}

func loadQuotas(paths []string) (quotasFile, string, error) {
	var q quotasFile
	for _, p := range paths {
		if p == "" {
			continue
		}
		b, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		if err := json.Unmarshal(b, &q); err != nil {
			return quotasFile{}, "", err
		}
		return q, p, nil
	}
	return quotasFile{}, "", errors.New("no quotas config found")
}

func InitQuotas(root string) *quotasEngine {
	qf, path, err := loadQuotas(defaultQuotaPaths(root))
	if err != nil {
		// provide a small default if nothing found
		qf.Windows.RollingSeconds = 5 * 60 * 60
		qf.Windows.WeeklySeconds = 7 * 24 * 60 * 60
		qf.Models = map[string]quotaModelCfg{}
	}
    eng := &quotasEngine{
        cfg:           qf,
        path:          path,
        loaded:        time.Now(),
        rollingWindow: time.Duration(qf.Windows.RollingSeconds) * time.Second,
        weeklyWindow:  time.Duration(qf.Windows.WeeklySeconds) * time.Second,
        models:        map[string]*modelCounters{},
        calibration:   map[string]*calibrationStats{},
    }
    return eng
}

// SetLicenseSummary provides an optional license plan/features snapshot for inclusion in /v1/usage.
func (q *quotasEngine) SetLicenseSummary(ok bool, plan string, features []string) {
    if q == nil { return }
    q.mu.Lock()
    q.licenseOK = ok
    q.licensePlan = plan
    q.licenseFeatures = append([]string(nil), features...)
    q.mu.Unlock()
}

func (q *quotasEngine) pruneLocked(now time.Time) {
	cutoff := now.Add(-q.weeklyWindow)
	for _, mc := range q.models {
		filtered := mc.samples[:0]
		for _, s := range mc.samples {
			if s.TS.After(cutoff) {
				filtered = append(filtered, s)
			}
		}
		mc.samples = filtered
	}
}

// evaluateModelLocked computes warn/block flags for a single model at the given time.
// Caller must hold q.mu.
func (q *quotasEngine) evaluateModelLocked(model string, now time.Time) (warn, block bool, rollingPct, weeklyPct float64) {
	cfg := q.cfg.Models[model]
	var inR, outR int64
	var dirtyR, weeklyDirty float64
	var weeklyTokens int64
	cutoffR := now.Add(-q.rollingWindow)
	cutoffW := now.Add(-q.weeklyWindow)
	for _, s := range q.models[model].samples {
		effStream := s.StreamSeconds
		if effStream <= 0 {
			effStream = s.DirtySeconds
		}
		if s.TS.After(cutoffR) {
			inR += s.InTokens
			outR += s.OutTokens
			dirtyR += s.DirtySeconds
		}
		if s.TS.After(cutoffW) {
			weeklyTokens += s.InTokens + s.OutTokens
			weeklyDirty += s.DirtySeconds
		}
	}
	denom := cfg.RollingTokens
	if denom > 0 {
		rollingPct = float64(inR+outR) / float64(denom)
	}
	if strings.EqualFold(cfg.WeeklyLimitType, "hours") && cfg.WeeklyLimitValue > 0 {
		weeklyPct = weeklyDirty / float64(cfg.WeeklyLimitValue*3600)
	} else if strings.EqualFold(cfg.WeeklyLimitType, "tokens") && cfg.WeeklyLimitValue > 0 {
		weeklyPct = float64(weeklyTokens) / float64(cfg.WeeklyLimitValue)
	}
	if cfg.WarnPct > 0 && rollingPct >= cfg.WarnPct {
		warn = true
	}
	if denom > 0 && rollingPct >= 1.0 {
		block = true
	}
	if strings.EqualFold(cfg.WeeklyLimitType, "tokens") && cfg.WeeklyLimitValue > 0 && weeklyPct >= 1.0 {
		block = true
	}
	return
}

// ShouldBlock returns true if quotas indicate the model should be blocked (>=100%)
// considering rolling or weekly caps.
func (q *quotasEngine) ShouldBlock(model string) bool {
	if q == nil {
		return false
	}
	q.mu.Lock()
	defer q.mu.Unlock()
	if q.models[model] == nil {
		q.models[model] = &modelCounters{}
	}
	q.pruneLocked(time.Now())
	_, block, _, _ := q.evaluateModelLocked(model, time.Now())
	return block
}

func (q *quotasEngine) RecordUsage(model string, in, out int, dirty, stream, ttft time.Duration) {
	if q == nil {
		return
	}
	q.mu.Lock()
	defer q.mu.Unlock()
	mc := q.models[model]
	if mc == nil {
		mc = &modelCounters{}
		q.models[model] = mc
	}
	ds := dirty.Seconds()
	ss := stream.Seconds()
	if ds < 0 {
		ds = 0
	}
	if ss <= 0 {
		ss = ds
	}
	ttftMs := int(ttft / time.Millisecond)
	if ttftMs < 0 {
		ttftMs = 0
	}
	mc.samples = append(mc.samples, usageSample{
		TS:            time.Now(),
		Model:         model,
		InTokens:      int64(in),
		OutTokens:     int64(out),
		DirtySeconds:  ds,
		StreamSeconds: ss,
		TTFTMillis:    ttftMs,
	})
	mc.sessionIn += int64(in)
	mc.sessionOut += int64(out)
	mc.sessionDirty += ds
	mc.sessionStream += ss
	mc.sessionTTFT += float64(ttftMs)
	mc.sessionCount++
	q.pruneLocked(time.Now())
}

func (q *quotasEngine) getCalibrationLocked(model string) *calibrationStats {
	if q.calibration == nil {
		q.calibration = make(map[string]*calibrationStats)
	}
	stats := q.calibration[model]
	if stats == nil {
		stats = &calibrationStats{}
		if cfg, ok := q.cfg.Models[model]; ok && cfg.WarnPct > 0 {
			stats.warnPctAuto = cfg.WarnPct
		}
		q.calibration[model] = stats
	}
	return stats
}

func (q *quotasEngine) decisionInfo(model string) quotaDecisionInfo {
	var info quotaDecisionInfo
	if q == nil {
		return info
	}
	q.mu.Lock()
	defer q.mu.Unlock()
	now := time.Now()
	q.pruneLocked(now)
	cfg := q.cfg.Models[model]
	info.WarnPctConfig = cfg.WarnPct
	if cfg.RollingTokens > 0 {
		info.RollingCapacity = cfg.RollingTokens
	}
	if strings.EqualFold(cfg.WeeklyLimitType, "tokens") && cfg.WeeklyLimitValue > 0 {
		info.WeeklyCapacity = cfg.WeeklyLimitValue
	}
	if q.models[model] == nil {
		q.models[model] = &modelCounters{}
	}
	mc := q.models[model]
	stats := q.getCalibrationLocked(model)
	if stats != nil {
		info.WarnPctAuto = stats.warnPctAuto
		info.WarnConfidence = stats.warnConfidence
		info.GapSecondsP50 = stats.gapSecondsP50
		info.GapSecondsP95 = stats.gapSecondsP95
		info.GapSamples = stats.gapSamples
	}
	if info.WarnPctAuto <= 0 {
		info.WarnPctAuto = cfg.WarnPct
	}
	cutoffR := now.Add(-q.rollingWindow)
	cutoffW := now.Add(-q.weeklyWindow)
	var inR, outR int64
	var weeklyTokens int64
	for _, s := range mc.samples {
		if s.TS.After(cutoffR) {
			inR += s.InTokens
			outR += s.OutTokens
		}
		if s.TS.After(cutoffW) {
			weeklyTokens += s.InTokens + s.OutTokens
		}
	}
	info.RollingUsed = inR + outR
	info.WeeklyUsed = weeklyTokens
	if info.RollingCapacity > 0 {
		info.RollingPct = float64(info.RollingUsed) / float64(info.RollingCapacity)
	}
	if info.WeeklyCapacity > 0 {
		info.WeeklyPct = float64(info.WeeklyUsed) / float64(info.WeeklyCapacity)
	}
	warn, block, rollingPct, weeklyPct := q.evaluateModelLocked(model, now)
	info.Warn = warn
	info.Block = block
	info.RollingPct = rollingPct
	info.WeeklyPct = weeklyPct
	return info
}

func (q *quotasEngine) noteQuota429(model string) {
	if q == nil {
		return
	}
	q.mu.Lock()
	defer q.mu.Unlock()
	stats := q.getCalibrationLocked(model)
	stats.gapSamples++
}

func (q *quotasEngine) autoWarnPct(model string) float64 {
	if q == nil {
		return 0
	}
	q.mu.Lock()
	defer q.mu.Unlock()
	stats := q.getCalibrationLocked(model)
	if stats == nil {
		return 0
	}
	return stats.warnPctAuto
}

func loadProbeGaps(path string) map[string]probeGap {
	data, err := os.ReadFile(path)
	if err != nil {
		return map[string]probeGap{}
	}
	block, ok := extractJSONProbeBlock(string(data))
	if !ok {
		return map[string]probeGap{}
	}
	var entries []probeGap
	if err := json.Unmarshal([]byte(block), &entries); err != nil {
		return map[string]probeGap{}
	}
	result := make(map[string]probeGap)
	for _, entry := range entries {
		if entry.Model == "" {
			continue
		}
		result[strings.ToLower(entry.Model)] = entry
	}
	return result
}

func extractJSONProbeBlock(src string) (string, bool) {
	start := strings.LastIndex(src, "```json")
	if start == -1 {
		return "", false
	}
	start += len("```json")
	end := strings.Index(src[start:], "```")
	if end == -1 {
		return "", false
	}
	block := strings.TrimSpace(src[start : start+end])
	return block, true
}

func (q *quotasEngine) runCalibrationTick(now time.Time) {
	probe := loadProbeGaps(filepath.Join(repoRoot(), "results", "GLM_LIMIT_PROBE.md"))
	q.mu.Lock()
	defer q.mu.Unlock()
	for model, mc := range q.models {
		stats := q.getCalibrationLocked(model)
		cfg := q.cfg.Models[model]
		if cfg.WarnPct > 0 {
			stats.warnPctAuto = cfg.WarnPct
		} else if stats.warnPctAuto <= 0 {
			stats.warnPctAuto = 0.9
		}
		count := len(mc.samples)
		if count > 0 {
			stats.warnConfidence = math.Min(1.0, float64(count)/50.0)
		} else {
			stats.warnConfidence = 0
		}
		if entry, ok := probe[strings.ToLower(model)]; ok {
			if entry.GapSecondsP50 > 0 {
				stats.gapSecondsP50 = entry.GapSecondsP50
			}
			if entry.GapSecondsP95 > 0 {
				stats.gapSecondsP95 = entry.GapSecondsP95
			}
			if entry.Samples > 0 {
				stats.gapSamples = entry.Samples
			}
		}
	}
}

func (q *quotasEngine) StartCalibrator(ctx context.Context) {
	if q == nil {
		return
	}
	interval := time.Hour
	if v := strings.TrimSpace(os.Getenv("CCP_CAL_SAMPLE_MINUTES")); v != "" {
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			interval = time.Duration(n) * time.Minute
		}
	}
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()
		q.runCalibrationTick(time.Now())
		for {
			select {
			case <-ctx.Done():
				return
			case now := <-ticker.C:
				q.runCalibrationTick(now)
			}
		}
	}()
}

// HTTP: GET /v1/usage
func (q *quotasEngine) handleUsage(w http.ResponseWriter, r *http.Request) {
    q.mu.Lock()
    now := time.Now()
    q.pruneLocked(now)
	type modelView struct {
		Provider       string      `json:"provider,omitempty"`
		RollingIn      int64       `json:"rolling_in"`
		RollingOut     int64       `json:"rolling_out"`
		RollingPct     float64     `json:"rolling_pct"`
		WeeklyPct      float64     `json:"weekly_pct"`
		Reqs           int64       `json:"reqs"`
		ETARollingSec  int64       `json:"eta_rolling_sec"`
		Warn           bool        `json:"warn"`
		Block          bool        `json:"block"`
		WarnPctAuto    float64     `json:"warn_pct_auto,omitempty"`
		WarnConfidence float64     `json:"warn_pct_confidence,omitempty"`
		GapSecondsP50  float64     `json:"gap_seconds_p50,omitempty"`
		GapSecondsP95  float64     `json:"gap_seconds_p95,omitempty"`
		GapSamples     int         `json:"gap_samples,omitempty"`
		Speeds         modelSpeeds `json:"speeds"`
	}
    type lic struct {
        Ok       bool     `json:"ok"`
        Plan     string   `json:"plan,omitempty"`
        Features []string `json:"features,omitempty"`
    }
    out := struct {
        Models  map[string]modelView `json:"models"`
        Ts      float64              `json:"ts"`
        Path    string               `json:"path"`
        License *lic                 `json:"license,omitempty"`
    }{Models: map[string]modelView{}, Ts: float64(now.UnixNano()) / 1e9, Path: q.path}

	for model, mc := range q.models {
		cfg := q.cfg.Models[model]
		mv := modelView{Provider: cfg.Provider}
		stats := q.getCalibrationLocked(model)
		cutoffR := now.Add(-q.rollingWindow)
		cutoffW := now.Add(-q.weeklyWindow)

		var (
			inR, outR       int64
			dirtyR, streamR float64
			rollingCount    int
			weeklyTokens    int64
			weeklyDirty     float64
		)
		ttftVals := make([]int, 0, len(mc.samples))
		hourOut := make([]int64, 24)
		hourStream := make([]float64, 24)
		hourDirty := make([]float64, 24)
		hourSamples := make([]int, 24)
		var oldestRolling time.Time

		for _, s := range mc.samples {
			effStream := s.StreamSeconds
			if effStream <= 0 {
				effStream = s.DirtySeconds
			}
			if s.TS.After(cutoffR) {
				rollingCount++
				inR += s.InTokens
				outR += s.OutTokens
				dirtyR += s.DirtySeconds
				streamR += effStream
				ttftVals = append(ttftVals, s.TTFTMillis)
				if oldestRolling.IsZero() || s.TS.Before(oldestRolling) {
					oldestRolling = s.TS
				}
			}
			if s.TS.After(cutoffW) {
				weeklyTokens += s.InTokens + s.OutTokens
				weeklyDirty += s.DirtySeconds
			}
			hr := s.TS.Hour()
			hourSamples[hr]++
			hourOut[hr] += s.OutTokens
			hourStream[hr] += effStream
			hourDirty[hr] += s.DirtySeconds
		}

		mv.RollingIn = inR
		mv.RollingOut = outR
		if cfg.RollingTokens > 0 {
			mv.RollingPct = float64(inR+outR) / float64(cfg.RollingTokens)
		}
		if strings.EqualFold(cfg.WeeklyLimitType, "hours") && cfg.WeeklyLimitValue > 0 {
			mv.WeeklyPct = weeklyDirty / float64(cfg.WeeklyLimitValue*3600)
		} else if strings.EqualFold(cfg.WeeklyLimitType, "tokens") && cfg.WeeklyLimitValue > 0 {
			mv.WeeklyPct = float64(weeklyTokens) / float64(cfg.WeeklyLimitValue)
		}
		if !oldestRolling.IsZero() {
			eta := oldestRolling.Add(q.rollingWindow).Sub(now)
			if eta < 0 {
				eta = 0
			}
			mv.ETARollingSec = int64(eta / time.Second)
		}
		if cfg.WarnPct > 0 && mv.RollingPct >= cfg.WarnPct {
			mv.Warn = true
		}
		if cfg.RollingTokens > 0 && mv.RollingPct >= 1.0 {
			mv.Block = true
		}
		if strings.EqualFold(cfg.WeeklyLimitType, "tokens") && cfg.WeeklyLimitValue > 0 && mv.WeeklyPct >= 1.0 {
			mv.Block = true
		}
		mv.Reqs = int64(rollingCount)
		if stats != nil {
			mv.WarnPctAuto = stats.warnPctAuto
			mv.WarnConfidence = stats.warnConfidence
			mv.GapSecondsP50 = stats.gapSecondsP50
			mv.GapSecondsP95 = stats.gapSecondsP95
			mv.GapSamples = stats.gapSamples
		}

		speeds := modelSpeeds{}
		speeds.Rolling = speedSnapshot{
			OutELR:     calcTPS(outR, streamR),
			OutDirty:   calcTPS(outR, dirtyR),
			InELR:      calcTPS(inR, streamR),
			InDirty:    calcTPS(inR, dirtyR),
			TotalELR:   calcTPS(inR+outR, streamR),
			TotalDirty: calcTPS(inR+outR, dirtyR),
		}
		speeds.Session = speedSnapshot{
			OutELR:     calcTPS(mc.sessionOut, mc.sessionStream),
			OutDirty:   calcTPS(mc.sessionOut, mc.sessionDirty),
			InELR:      calcTPS(mc.sessionIn, mc.sessionStream),
			InDirty:    calcTPS(mc.sessionIn, mc.sessionDirty),
			TotalELR:   calcTPS(mc.sessionIn+mc.sessionOut, mc.sessionStream),
			TotalDirty: calcTPS(mc.sessionIn+mc.sessionOut, mc.sessionDirty),
		}
		speeds.TTFT = computeTTFTQuantiles(ttftVals)
		speeds.RollingSamples = rollingCount
		speeds.WeeklySamples = len(mc.samples)
		speeds.Hourly = make([]hourSpeed, 0, 24)
		for hr := 0; hr < 24; hr++ {
			hs := hourSpeed{Hour: hr, Samples: hourSamples[hr]}
			if hourSamples[hr] >= minHODSamples {
				if hourStream[hr] > 0 {
					val := calcTPS(hourOut[hr], hourStream[hr])
					hs.OutELR = &val
				}
				if hourDirty[hr] > 0 {
					val := calcTPS(hourOut[hr], hourDirty[hr])
					hs.OutDirty = &val
				}
			}
			speeds.Hourly = append(speeds.Hourly, hs)
		}
		mv.Speeds = speeds

		out.Models[model] = mv
	}
    q.mu.Unlock()

    // Additive license block for operator convenience
    if q.licenseOK {
        out.License = &lic{Ok: true, Plan: q.licensePlan, Features: append([]string(nil), q.licenseFeatures...)}
    }

    w.Header().Set("content-type", "application/json")
    _ = json.NewEncoder(w).Encode(out)
}

// HTTP: GET /v1/quotas
func (q *quotasEngine) handleQuotas(w http.ResponseWriter, r *http.Request) {
	q.mu.Lock()
	resp := struct {
		Config quotasFile `json:"config"`
		Path   string     `json:"path"`
		Loaded string     `json:"loaded"`
	}{Config: q.cfg, Path: q.path, Loaded: q.loaded.UTC().Format(time.RFC3339)}
	q.mu.Unlock()
	w.Header().Set("content-type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

// HTTP: POST /v1/quotas/reload[?file=/abs]
func (q *quotasEngine) handleReload(w http.ResponseWriter, r *http.Request) {
	target := strings.TrimSpace(r.URL.Query().Get("file"))
	paths := defaultQuotaPaths(".")
	if target != "" {
		paths = []string{target}
	}
	cfg, path, err := loadQuotas(paths)
	if err != nil {
		http.Error(w, "invalid quotas: "+err.Error(), http.StatusBadRequest)
		return
	}
	q.mu.Lock()
	q.cfg = cfg
	q.path = path
	q.loaded = time.Now()
	q.rollingWindow = time.Duration(cfg.Windows.RollingSeconds) * time.Second
	q.weeklyWindow = time.Duration(cfg.Windows.WeeklySeconds) * time.Second
	q.mu.Unlock()
	w.WriteHeader(http.StatusNoContent)
}

// HTTP: POST /v1/dev/sim-usage  (requires CCP_DEV_ENABLE=1)
func (q *quotasEngine) handleSimUsage(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Model      string `json:"model"`
		In         int    `json:"in"`
		Out        int    `json:"out"`
		Repeat     int    `json:"repeat"`
		Seconds    int    `json:"seconds"`
		IntervalMS int    `json:"interval_ms"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}
	if req.Model == "" {
		req.Model = "claude-haiku-4.5"
	}
	if req.Repeat <= 0 {
		req.Repeat = 1
	}
	for i := 0; i < req.Repeat; i++ {
		dur := time.Duration(req.Seconds) * time.Second
		if req.Seconds <= 0 {
			dur = time.Second
		}
		q.RecordUsage(req.Model, req.In, req.Out, dur, dur, 0)
		if req.IntervalMS > 0 {
			time.Sleep(time.Duration(req.IntervalMS) * time.Millisecond)
		}
	}
	w.Header().Set("content-type", "application/json")
	w.Write([]byte(`{"ok":true}`))
}

func (q *quotasEngine) WireQuotaHTTP(mux *http.ServeMux, devEnable bool) {
	mux.HandleFunc("/v1/usage", q.handleUsage)
	mux.HandleFunc("/v1/quotas", q.handleQuotas)
	mux.HandleFunc("/v1/quotas/reload", q.handleReload)
	if devEnable {
		mux.HandleFunc("/v1/dev/sim-usage", q.handleSimUsage)
	}
}
