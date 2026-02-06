package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/local/ccp-shim/license"
)

// helpers for loose JSON to typed values (CLI db import)
func asString(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return fmt.Sprintf("%v", v)
}
func asFloat(v any) float64 {
	switch t := v.(type) {
	case float64:
		return t
	case int:
		return float64(t)
	case int64:
		return float64(t)
	case json.Number:
		f, _ := t.Float64()
		return f
	case string:
		f, _ := strconv.ParseFloat(t, 64)
		return f
	default:
		return 0
	}
}
func asBool(v any) bool {
	if b, ok := v.(bool); ok {
		return b
	}
	if s, ok := v.(string); ok {
		return strings.EqualFold(strings.TrimSpace(s), "true")
	}
	return false
}

type usageEntry struct {
	Ts                    float64 `json:"ts"`
	Rid                   string  `json:"rid"`
	Lane                  string  `json:"lane"`
	Model                 string  `json:"model"`
	InputTokens           int     `json:"input_tokens"`
	OutputTokens          int     `json:"output_tokens"`
	Status                int     `json:"status"`
	Reason                string  `json:"reason"`
	Op                    string  `json:"op"`
	LatencyMs             int     `json:"latency_ms"`
	StreamMs              int     `json:"stream_ms,omitempty"`
	TTFTMs                int     `json:"ttft_ms,omitempty"`
	ErrType               string  `json:"err_type"`
	Upstream              string  `json:"upstream"`
	H2                    bool    `json:"h2"`
	HeaderMode            string  `json:"header_mode,omitempty"`
	Retry                 bool    `json:"retry,omitempty"`
	BackoffMs             int     `json:"backoff_ms,omitempty"`
	Event                 string  `json:"event,omitempty"`
	Decision              string  `json:"decision,omitempty"`
	DecisionReason        string  `json:"decision_reason,omitempty"`
	RollingUsedTokens     int64   `json:"rolling_used_tokens,omitempty"`
	RollingCapacityTokens int64   `json:"rolling_capacity_tokens,omitempty"`
	WeeklyUsedTokens      int64   `json:"weekly_used_tokens,omitempty"`
	WeeklyCapacityTokens  int64   `json:"weekly_capacity_tokens,omitempty"`
	HeadroomPctRolling    float64 `json:"headroom_pct_rolling,omitempty"`
	HeadroomPctWeekly     float64 `json:"headroom_pct_weekly,omitempty"`
	WarnPctConfigured     float64 `json:"warn_pct_cfg,omitempty"`
	WarnPctAuto           float64 `json:"warn_pct_auto,omitempty"`
	WarnPctConfidence     float64 `json:"warn_pct_confidence,omitempty"`
	GapSecondsP50         float64 `json:"gap_seconds_p50,omitempty"`
	GapSecondsP95         float64 `json:"gap_seconds_p95,omitempty"`
	GapSamples            int     `json:"gap_samples,omitempty"`
	RerouteMode           string  `json:"reroute_mode,omitempty"`
	RerouteDecision       string  `json:"reroute_decision,omitempty"`
	PreferredAttempt      bool    `json:"preferred_attempt,omitempty"`
	CooldownActive        bool    `json:"cooldown_active,omitempty"`
	CooldownNextTs        float64 `json:"cooldown_next_ts,omitempty"`
	WastedRetryMs         int     `json:"wasted_retry_ms,omitempty"`
}

type rerouteMode string

const (
	rerouteModeHybrid     rerouteMode = "hybrid"
	rerouteModePreemptive rerouteMode = "preemptive"
	rerouteModeRunToCap   rerouteMode = "run2cap"
)

type quotaDecisionInfo struct {
	RollingUsed     int64
	RollingCapacity int64
	RollingPct      float64
	WeeklyUsed      int64
	WeeklyCapacity  int64
	WeeklyPct       float64
	Warn            bool
	Block           bool
	WarnPctConfig   float64
	WarnPctAuto     float64
	WarnConfidence  float64
	GapSecondsP50   float64
	GapSecondsP95   float64
	GapSamples      int
}

type rerouteDecision struct {
	mode             rerouteMode
	preferredLane    string
	fallbackLane     string
	selectedLane     string
	decision         string
	preferredAttempt bool
	headroomRolling  float64
	headroomWeekly   float64
	rollingPct       float64
	weeklyPct        float64
	warnPctConfig    float64
	warnPctAuto      float64
	warnConfidence   float64
	gapSecondsP50    float64
	gapSecondsP95    float64
	gapSamples       int
	cooldownActive   bool
	cooldownUntil    time.Time
}

const licensePubKeyB64 = "N8hXyQ0B2dS6b0wfbjr5SyYwXf8T3I4QjTg1mGSe4P0="

// licensePubKeys holds trusted Ed25519 public keys (base64). We seed with the embedded key
// and allow additive keys via env `CCP_LICENSE_PUBKEY_B64` (comma-separated) for local/dev issuers.
var licensePubKeys = map[string]string{"default": licensePubKeyB64}

func appendUsage(e usageEntry) {
	rotateUsageLogIfNeeded()
	// Ensure directory for the computed log path exists
	{
		p := usageLogPath()
		_ = os.MkdirAll(filepath.Dir(p), 0o755)
	}
	f, err := os.OpenFile(usageLogPath(), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return
	}
	defer f.Close()
	if b, err := json.Marshal(e); err == nil {
		_, _ = f.Write(append(b, '\n'))
	}
}

func appendAnomaly(m map[string]any) {
	rotateAnomalyLogIfNeeded()
	{
		p := anomaliesLogPath()
		_ = os.MkdirAll(filepath.Dir(p), 0o755)
	}
	f, err := os.OpenFile(anomaliesLogPath(), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err != nil {
		return
	}
	defer f.Close()
	if b, err := json.Marshal(m); err == nil {
		_, _ = f.Write(append(b, '\n'))
	}
}

func anthropicVersion(h http.Header) string {
	v := h.Get("anthropic-version")
	if v == "" {
		v = os.Getenv("ANTH_VERSION")
	}
	if v == "" {
		v = "2023-06-01"
	}
	return v
}

func selectRerouteMode() rerouteMode {
	switch strings.ToLower(strings.TrimSpace(os.Getenv("CCP_REROUTE_MODE"))) {
	case "preemptive":
		return rerouteModePreemptive
	case "run2cap", "run_to_cap", "run-to-cap", "runlimit", "run":
		return rerouteModeRunToCap
	case "hybrid", "":
		return rerouteModeHybrid
	default:
		return rerouteModeHybrid
	}
}

type server struct {
	port            int
	anthropicBase   *url.URL
	zaiBase         *url.URL
	cliAnth         *http.Client
	cliZai          *http.Client
	cliAnthJSON     *http.Client
	cliZaiJSON      *http.Client
	zaiKey          string
	zaiHeaderMode   string
	anthPassthrough bool
	anthFallbackEnv string
	rerouteMode     rerouteMode
	policy          *Policy
	policyVersion   string
	forceHaiku      bool
	paused          bool
	forceH1         bool
	licenseClaims   *license.Claims
	catalog         *ProviderCatalog
	catalogPath     string
	catalogErr      error
	q               *quotasEngine
	devEnable       bool
	metrics         *metrics
	tokenExtractors map[string]TokenExtractor
	quotaCooldown   time.Duration
	quotaMu         sync.Mutex
	lastQuota429    map[string]time.Time

	// R4 persistence
	store          Store
	storePath      string
	rollupInterval time.Duration
}

func repoRoot() string {
	if root := os.Getenv("CCC_REPO_ROOT"); root != "" {
		return root
	}
	wd, err := os.Getwd()
	if err != nil {
		return "."
	}
	return wd
}

func (s *server) extractTokens(lane string, headers http.Header, body []byte, in, out int) (int, int) {
	ext, ok := s.tokenExtractors[strings.ToLower(lane)]
	if !ok {
		return in, out
	}
	needIn := in <= 0
	needOut := out <= 0
	if len(body) > 0 && (needIn || needOut) {
		if ti, to, ok := ext.FromJSON(body); ok {
			if needIn && ti > 0 {
				in = ti
				needIn = false
			}
			if needOut && to > 0 {
				out = to
				needOut = false
			}
		}
	}
	if (needIn || needOut) && headers != nil {
		if ti, to, ok := ext.FromHeaders(headers); ok {
			if needIn && ti > 0 {
				in = ti
			}
			if needOut && to > 0 {
				out = to
			}
		}
	}
	return in, out
}

func (s *server) markQuota429(model string) {
	if s == nil {
		return
	}
	s.quotaMu.Lock()
	if s.lastQuota429 == nil {
		s.lastQuota429 = make(map[string]time.Time)
	}
	s.lastQuota429[model] = time.Now()
	s.quotaMu.Unlock()
	if s.q != nil {
		s.q.noteQuota429(model)
	}
}

func (s *server) quotaCooldownActive(model string) bool {
	active, _ := s.quotaCooldownInfo(model)
	return active
}

func (s *server) quotaCooldownInfo(model string) (bool, time.Time) {
	if s == nil || s.quotaCooldown <= 0 {
		return false, time.Time{}
	}
	s.quotaMu.Lock()
	ts, ok := s.lastQuota429[model]
	s.quotaMu.Unlock()
	if !ok {
		return false, time.Time{}
	}
	until := ts.Add(s.quotaCooldown)
	if time.Now().After(until) {
		return false, until
	}
	return true, until
}

func newServer(port int, pol *Policy, lic *license.Claims) *server {
	catalog, catalogPath, err := loadProviderCatalog(defaultProviderPaths(repoRoot()))
	if err != nil {
		log.Printf("[providers] warning: %v", err)
		catalog = &ProviderCatalog{Providers: map[string]ProviderEntry{}}
	} else if catalogPath != "" {
		log.Printf("[providers] loaded catalog %s (providers=%d routes=%d)", catalogPath, len(catalog.Providers), len(catalog.Routes))
	}
	anthBase := "https://api.anthropic.com"
	if prov, ok := providerFromPolicy(pol, "anth"); ok && prov.BaseURL != "" {
		anthBase = prov.BaseURL
	}
	zaiBase := "https://api.z.ai/api/anthropic"
	if prov, ok := providerFromPolicy(pol, "zai"); ok && prov.BaseURL != "" {
		zaiBase = prov.BaseURL
	}
	if v := os.Getenv("ANTHROPIC_BASE_URL"); v != "" {
		anthBase = v
	}
	if v := os.Getenv("ZAI_BASE_URL"); v != "" {
		zaiBase = v
	}
	anth, _ := url.Parse(anthBase)
	zai, _ := url.Parse(zaiBase)

	forceH1 := os.Getenv("MITM_FORCE_H1") == "1"
	dialTimeout := parseDurationEnv("CCP_DIAL_TIMEOUT", 5*time.Second)
	keepAlive := parseDurationEnv("CCP_DIAL_KEEPALIVE", 30*time.Second)
	dialer := &net.Dialer{Timeout: dialTimeout, KeepAlive: keepAlive}
	tr := &http.Transport{MaxIdleConns: 200, MaxIdleConnsPerHost: 200, IdleConnTimeout: 90 * time.Second, ForceAttemptHTTP2: !forceH1, DisableCompression: true}
	if dialTimeout > 0 {
		tr.DialContext = dialer.DialContext
	}
	tlsTimeout := parseDurationEnv("CCP_TLS_TIMEOUT", 5*time.Second)
	if tlsTimeout > 0 {
		tr.TLSHandshakeTimeout = tlsTimeout
	}
	headerTimeout := parseDurationEnv("CCP_HEADER_TIMEOUT", 15*time.Second)
	if headerTimeout > 0 {
		tr.ResponseHeaderTimeout = headerTimeout
	}
	cliStream := &http.Client{Transport: tr, Timeout: 0}
	cliJSON := &http.Client{Transport: tr, Timeout: 60 * time.Second}

	zaiHeaderMode := strings.ToLower(os.Getenv("ZAI_HEADER_MODE"))
	if zaiHeaderMode == "" {
		if prov, ok := providerFromPolicy(pol, "zai"); ok && prov.HeaderMode != "" {
			zaiHeaderMode = strings.ToLower(prov.HeaderMode)
		}
	}

	anthPassthrough := true
	anthFallbackEnv := "ANTHROPIC_AUTH_TOKEN"
	if prov, ok := providerFromPolicy(pol, "anth"); ok {
		if prov.FallbackEnv != "" {
			anthFallbackEnv = prov.FallbackEnv
		}
		if !prov.PassThrough {
			anthPassthrough = false
		}
	}

	srv := &server{
		port:            port,
		anthropicBase:   anth,
		zaiBase:         zai,
		cliAnth:         cliStream,
		cliZai:          cliStream,
		cliAnthJSON:     cliJSON,
		cliZaiJSON:      cliJSON,
		zaiKey:          os.Getenv("ZAI_API_KEY"),
		zaiHeaderMode:   zaiHeaderMode,
		anthPassthrough: anthPassthrough,
		anthFallbackEnv: anthFallbackEnv,
		rerouteMode:     selectRerouteMode(),
		policy:          pol,
		forceHaiku:      os.Getenv("FORCE_HAIKU_TO_ZAI") == "1",
		paused:          os.Getenv("OFFLOAD_PAUSED") == "1",
		forceH1:         forceH1,
		licenseClaims:   lic,
		catalog:         catalog,
	}
	srv.catalogPath = catalogPath
	srv.catalogErr = err
	if err == nil && srv.catalogPath == "" {
		srv.catalogPath = "<embedded>"
	}
	srv.tokenExtractors = map[string]TokenExtractor{
		"anth":      anthropicTokenExtractor{},
		"anthropic": anthropicTokenExtractor{},
		"zai":       zaiTokenExtractor{},
	}
	cooldown := parseDurationEnv("CCP_QUOTA_COOLDOWN", 5*time.Minute)
	if cooldown <= 0 {
		cooldown = 5 * time.Minute
	}
	srv.quotaCooldown = cooldown
	srv.lastQuota429 = make(map[string]time.Time)
	// quotas
	srv.q = InitQuotas(repoRoot())
	// pass license summary to quotas for inclusion in /v1/usage (additive)
	if lic != nil {
		feats := []string{}
		for _, f := range lic.Features {
			feats = append(feats, f)
		}
		srv.q.SetLicenseSummary(true, lic.Plan, feats)
	}
	srv.devEnable = os.Getenv("CCP_DEV_ENABLE") == "1"
	// light metrics
	srv.metrics = newMetrics()
	if pol != nil {
		srv.policyVersion = pol.Version
	}
	// Persistence (default on)
	persist := strings.TrimSpace(os.Getenv("CCP_PERSIST"))
	if persist == "" || persist == "1" || strings.EqualFold(persist, "true") || strings.EqualFold(persist, "on") {
		dbPath := os.Getenv("CCP_DB_PATH")
		if dbPath == "" {
			dbPath = filepath.Join("logs", "ccp.sqlite3")
		}
		if st, err := OpenStoreSQLite(dbPath); err != nil {
			log.Printf("[store] open failed: %v", err)
		} else {
			srv.store = st
			srv.storePath = dbPath
			srv.metrics.setStoreSize(st.SizeBytes())
			interval := parseDurationEnv("CCP_ROLLUP_INTERVAL", 5*time.Minute)
			if interval <= 0 {
				interval = 5 * time.Minute
			}
			srv.rollupInterval = interval
			go srv.rollupLoop()
		}
	}
	return srv
}

func (s *server) rollupLoop() {
	if s == nil || s.store == nil {
		return
	}
	ticker := time.NewTicker(s.rollupInterval)
	defer ticker.Stop()
	lastDay := time.Now().UTC().YearDay()
	ctx := context.Background()
	for range ticker.C {
		t0 := time.Now()
		if _, err := s.store.RollupHour(ctx, t0); err != nil {
			log.Printf("[rollup] hour error: %v", err)
		}
		if s.metrics != nil {
			s.metrics.observeRollup("hour", time.Since(t0))
		}
		now := time.Now().UTC()
		if now.YearDay() != lastDay {
			t1 := time.Now()
			if _, err := s.store.RollupDay(ctx, now); err != nil {
				log.Printf("[rollup] day error: %v", err)
			}
			if s.metrics != nil {
				s.metrics.observeRollup("day", time.Since(t1))
			}
			lastDay = now.YearDay()
		}
		// Optional sample TTL pruning (default 7d) to keep DB lean
		if ss, ok := s.store.(*sqliteStore); ok {
			days := 7
			if v := strings.TrimSpace(os.Getenv("CCP_SAMPLE_TTL_DAYS")); v != "" {
				if n, err := strconv.Atoi(v); err == nil && n > 0 {
					days = n
				}
			}
			cutoff := float64(time.Now().Add(-time.Duration(days) * 24 * time.Hour).Unix())
			if _, err := ss.pruneSamplesBefore(ctx, cutoff); err != nil {
				log.Printf("[store] sample prune failed: %v", err)
			}
		}
		if s.metrics != nil {
			s.metrics.setStoreSize(s.store.SizeBytes())
		}
	}
}

func readManualModel() string {
	if v := strings.TrimSpace(os.Getenv("CCP_MODEL")); v != "" {
		return v
	}
	home, _ := os.UserHomeDir()
	if home == "" {
		return ""
	}
	p := filepath.Join(home, ".config", "ccp", "model")
	b, err := os.ReadFile(p)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(b))
}

func (s *server) decideLane(model string) string {
	if s.paused {
		return "anthropic"
	}
	if s.forceHaiku {
		if s.zaiKey != "" {
			return "zai"
		}
		return "anthropic"
	}
	if mm := readManualModel(); mm != "" {
		model = mm
	}
	normalized := strings.ToLower(strings.TrimSpace(model))
	if s.catalog != nil {
		for _, route := range s.catalog.Routes {
			if matchPattern(strings.ToLower(route.Pattern), normalized) {
				if _, ok := s.catalog.Providers[route.Provider]; ok {
					// Normalize anth provider id to anthropic lane label
					if route.Provider == "anth" || route.Provider == "anthropic" {
						return "anthropic"
					}
					return route.Provider
				}
			}
		}
	}
	if s.policy != nil {
		if lane, ok := s.policy.LaneForModel(model); ok {
			lane = strings.ToLower(strings.TrimSpace(lane))
			switch lane {
			case "zai":
				if s.zaiKey != "" {
					return "zai"
				}
			case "anth", "anthropic":
				return "anthropic"
			}
		}
	}
	if strings.Contains(normalized, "haiku") && s.zaiKey != "" {
		return "zai"
	}
	return "anthropic"
}

func (s *server) fallbackLane(preferred string) string {
	if s == nil {
		return preferred
	}
	switch strings.ToLower(strings.TrimSpace(preferred)) {
	case "zai":
		return "anthropic"
	case "anth", "anthropic":
		if s.zaiKey != "" {
			return "zai"
		}
		return "anthropic"
	default:
		// default to anthropic as safest fallback
		return "anthropic"
	}
}

func (s *server) buildRerouteDecision(model, preferred string, info quotaDecisionInfo) rerouteDecision {
	out := rerouteDecision{
		mode:             s.rerouteMode,
		preferredLane:    preferred,
		fallbackLane:     s.fallbackLane(preferred),
		selectedLane:     preferred,
		preferredAttempt: true,
		warnPctConfig:    info.WarnPctConfig,
		warnPctAuto:      info.WarnPctAuto,
		warnConfidence:   info.WarnConfidence,
		gapSecondsP50:    info.GapSecondsP50,
		gapSecondsP95:    info.GapSecondsP95,
		gapSamples:       info.GapSamples,
		rollingPct:       info.RollingPct,
		weeklyPct:        info.WeeklyPct,
	}
	if info.RollingCapacity > 0 {
		headroom := 1.0 - info.RollingPct
		if headroom < 0 {
			headroom = 0
		}
		out.headroomRolling = headroom
	} else {
		out.headroomRolling = 1
	}
	if info.WeeklyCapacity > 0 {
		headroom := 1.0 - info.WeeklyPct
		if headroom < 0 {
			headroom = 0
		}
		out.headroomWeekly = headroom
	} else {
		out.headroomWeekly = 1
	}

	fallbackSame := strings.EqualFold(out.fallbackLane, preferred)
	if s == nil {
		out.decision = "quota_pass"
		return out
	}

	var cooldownUntil time.Time
	cooldownActive := false
	if s.rerouteMode != rerouteModeRunToCap {
		if active, until := s.quotaCooldownInfo(model); active {
			cooldownActive = true
			cooldownUntil = until
		}
	}
	out.cooldownActive = cooldownActive
	out.cooldownUntil = cooldownUntil
	if cooldownActive && !fallbackSame {
		out.selectedLane = out.fallbackLane
		out.preferredAttempt = false
		out.decision = "quota_cooldown"
		return out
	}

	if info.Block && !fallbackSame {
		out.selectedLane = out.fallbackLane
		out.preferredAttempt = false
		out.decision = "quota_block"
		return out
	}

	warnThreshold := info.WarnPctAuto
	if warnThreshold <= 0 {
		warnThreshold = info.WarnPctConfig
	}
	warnActive := false
	if warnThreshold > 0 && info.RollingPct >= warnThreshold {
		warnActive = true
	}
	if info.Warn {
		warnActive = true
	}
	if info.WeeklyCapacity > 0 && warnThreshold > 0 && info.WeeklyPct >= warnThreshold {
		warnActive = true
	}

	switch s.rerouteMode {
	case rerouteModePreemptive:
		if warnActive && !fallbackSame {
			out.selectedLane = out.fallbackLane
			out.preferredAttempt = false
			out.decision = "quota_preemptive_warn"
			return out
		}
		if warnActive && fallbackSame {
			out.decision = "quota_warn_attempt"
			return out
		}
		out.decision = "quota_preemptive_pass"
		return out
	case rerouteModeRunToCap:
		out.decision = "quota_run_to_limit"
		return out
	case rerouteModeHybrid:
		if warnActive {
			out.decision = "quota_warn_attempt"
		} else {
			out.decision = "quota_pass"
		}
		return out
	default:
		out.decision = "quota_pass"
		return out
	}
}

func (s *server) enforceLicense(lane string) (string, string) {
	if strings.EqualFold(lane, "zai") {
		if s.licenseClaims == nil || !license.HasFeature(s.licenseClaims, "zai_offload") {
			return "anthropic", "license_block"
		}
	}
	return lane, ""
}

func hostHash() string {
	host, err := os.Hostname()
	if err != nil {
		return ""
	}
	sum := sha256.Sum256([]byte(host + "|" + runtime.GOOS + "|" + runtime.GOARCH))
	return base64.StdEncoding.EncodeToString(sum[:])
}

func wantsStream(body map[string]any) bool {
	if v, ok := body["stream"]; ok {
		if b, ok := v.(bool); ok {
			return b
		}
	}
	return false
}

func newRID() string {
	// short pseudo-random id (not crypto)
	const hex = "0123456789abcdef"
	b := make([]byte, 8)
	for i := range b {
		b[i] = hex[rand.Intn(len(hex))]
	}
	return string(b)
}

func (s *server) handleMessages(w http.ResponseWriter, r *http.Request) {
	t0 := time.Now()
	rid := newRID()
	wastedRetryMs := 0
	var body map[string]any
	var buf bytes.Buffer
	if r.Body != nil {
		io.Copy(&buf, r.Body)
		r.Body.Close()
	}
	if err := json.Unmarshal(buf.Bytes(), &body); err != nil {
		http.Error(w, "invalid json", 400)
		return
	}
	model, _ := body["model"].(string)
	manual := readManualModel()
	preferredLane := s.decideLane(model)
	decisionInfo := quotaDecisionInfo{}
	decisionMeta := rerouteDecision{
		mode:             s.rerouteMode,
		preferredLane:    preferredLane,
		fallbackLane:     s.fallbackLane(preferredLane),
		selectedLane:     preferredLane,
		preferredAttempt: true,
		headroomRolling:  1,
		headroomWeekly:   1,
		decision:         "quota_pass",
	}
	if s.q != nil {
		decisionInfo = s.q.decisionInfo(model)
		decisionMeta = s.buildRerouteDecision(model, preferredLane, decisionInfo)
	}
	lane := decisionMeta.selectedLane
	lane, licenseDecision := s.enforceLicense(lane)
	if lane != decisionMeta.selectedLane {
		decisionMeta.selectedLane = lane
		decisionMeta.preferredAttempt = strings.EqualFold(lane, preferredLane)
	}
	quotaDecision := decisionMeta.decision

	// Prepare upstream URL
	base := s.anthropicBase
	upstream := "anth"
	if lane == "zai" {
		base = s.zaiBase
		upstream = "zai"
	}
	u := *base
	u.Path = path.Join(u.Path, "/v1/messages")

	// Decision event log (before dialing)
	decision := "pass_through"
	if s.paused {
		decision = "failover_paused"
	} else if manual != "" {
		decision = "manual_override"
	} else if lane == "zai" {
		decision = "forced_model"
	}
	decHeaderMode := ""
	if lane == "zai" {
		if s.zaiHeaderMode == "" {
			decHeaderMode = "x-api-key"
		} else {
			decHeaderMode = s.zaiHeaderMode
		}
	}
	if licenseDecision != "" {
		decision = licenseDecision
		decHeaderMode = ""
		upstream = "anth"
	}
	if quotaDecision != "" && quotaDecision != "quota_pass" {
		decision = quotaDecision
	}
	quotaBefore := quotaSnapshot{}
	if s.q != nil {
		quotaBefore = s.q.snapshot(model)
	}
	if s.metrics != nil {
		if decisionMeta.preferredAttempt && (quotaDecision == "quota_run_to_limit" || quotaDecision == "quota_warn_attempt") {
			s.metrics.observePreferredAttempt(decisionMeta.selectedLane, model)
		}
		if !decisionMeta.preferredAttempt && quotaDecision != "" && quotaDecision != "quota_pass" {
			s.metrics.observeReroute(string(decisionMeta.mode), model)
		}
	}
	cooldownNext := 0.0
	if !decisionMeta.cooldownUntil.IsZero() {
		cooldownNext = float64(decisionMeta.cooldownUntil.UnixNano()) / 1e9
	}
	appendUsage(usageEntry{
		Ts:                    float64(time.Now().UnixNano()) / 1e9,
		Rid:                   rid,
		Lane:                  lane,
		Model:                 model,
		Status:                -1,
		Event:                 "decision",
		Decision:              decision,
		DecisionReason:        decision,
		Upstream:              upstream,
		H2:                    !s.forceH1,
		HeaderMode:            decHeaderMode,
		RollingUsedTokens:     quotaBefore.RollingUsed,
		RollingCapacityTokens: quotaBefore.RollingCapacity,
		WeeklyUsedTokens:      quotaBefore.WeeklyUsed,
		WeeklyCapacityTokens:  quotaBefore.WeeklyCapacity,
		HeadroomPctRolling:    decisionMeta.headroomRolling,
		HeadroomPctWeekly:     decisionMeta.headroomWeekly,
		WarnPctConfigured:     decisionInfo.WarnPctConfig,
		WarnPctAuto:           decisionInfo.WarnPctAuto,
		WarnPctConfidence:     decisionInfo.WarnConfidence,
		GapSecondsP50:         decisionInfo.GapSecondsP50,
		GapSecondsP95:         decisionInfo.GapSecondsP95,
		GapSamples:            decisionInfo.GapSamples,
		RerouteMode:           string(decisionMeta.mode),
		RerouteDecision:       quotaDecision,
		PreferredAttempt:      decisionMeta.preferredAttempt,
		CooldownActive:        decisionMeta.cooldownActive,
		CooldownNextTs:        cooldownNext,
	})

	// Build upstream request
	if os.Getenv("SHIM_DEBUG_HEADERS") == "1" {
		log.Printf("rid=%s lane=%s incoming headers=%v", rid, lane, r.Header)
	}
	req, err := http.NewRequest("POST", u.String(), bytes.NewReader(buf.Bytes()))
	if err != nil {
		http.Error(w, "upstream req failed", 500)
		return
	}
	// Copy incoming headers (preserve CLI metadata)
	req.Header = make(http.Header)
	for k, vs := range r.Header {
		// Skip hop-by-hop headers; Go will manage connection
		if strings.EqualFold(k, "content-length") || strings.EqualFold(k, "connection") {
			continue
		}
		for _, v := range vs {
			req.Header.Add(k, v)
		}
	}
	// Ensure required headers are set/normalized
	req.Header.Set("content-type", "application/json")
	req.Header.Set("anthropic-version", anthropicVersion(r.Header))

	if lane == "zai" {
		// Remove Anthropic auth and set Z.AI credential
		req.Header.Del("authorization")
		req.Header.Del("x-api-key")
		req.Header.Del("Accept-Encoding")
		req.Header.Set("Accept-Encoding", "identity")
		if strings.ToLower(s.zaiHeaderMode) == "authorization" {
			req.Header.Set("authorization", "Bearer "+s.zaiKey)
		} else {
			req.Header.Set("x-api-key", s.zaiKey)
		}
	} else {
		// Remove any lingering Z.AI headers and ensure Anthropic auth present
		req.Header.Del("x-api-key")
		// Normalize encoding for Anth lane as well so the CLI always receives identity JSON/SSE
		req.Header.Del("Accept-Encoding")
		req.Header.Set("Accept-Encoding", "identity")
		if !s.anthPassthrough {
			req.Header.Del("authorization")
		}
		if req.Header.Get("authorization") == "" && s.anthFallbackEnv != "" {
			if tok := strings.TrimSpace(os.Getenv(s.anthFallbackEnv)); tok != "" {
				req.Header.Set("authorization", "Bearer "+tok)
			}
		}
	}

	// Proxy JSON or SSE by checking expected response
	stream := wantsStream(body)
	// First attempt (choose client by lane and stream mode)
	if s.forceH1 {
		req.Close = true
	}
	resp, err := func() (*http.Response, error) {
		if stream {
			if lane == "zai" {
				return s.cliZai.Do(req)
			}
			return s.cliAnth.Do(req)
		}
		// Per-request timeout for JSON calls
		jsonTimeout := parseDurationEnv("CCP_JSON_TIMEOUT", 30*time.Second)
		ctx, cancel := context.WithTimeout(r.Context(), jsonTimeout)
		defer cancel()
		if lane == "zai" {
			return s.cliZaiJSON.Do(req.WithContext(ctx))
		}
		return s.cliAnthJSON.Do(req.WithContext(ctx))
	}()
    if err != nil {
        log.Printf("rid=%s lane=%s upstream error: %v", rid, lane, err)
        // Optional network fallback: enable only when CCP_NET_FALLBACK=1
        if lane == "zai" && os.Getenv("CCP_NET_FALLBACK") == "1" {
			fallbackReason := "net_fallback"
			alt := "anthropic"
			// Decision event for fallback
			appendUsage(usageEntry{
				Ts:                    float64(time.Now().UnixNano()) / 1e9,
				Rid:                   rid,
				Lane:                  alt,
				Model:                 model,
				Status:                -1,
				Event:                 "decision",
				Decision:              fallbackReason,
				DecisionReason:        fallbackReason,
				Upstream:              "anth",
				H2:                    !s.forceH1,
				RollingUsedTokens:     quotaBefore.RollingUsed,
				RollingCapacityTokens: quotaBefore.RollingCapacity,
				WeeklyUsedTokens:      quotaBefore.WeeklyUsed,
				WeeklyCapacityTokens:  quotaBefore.WeeklyCapacity,
				HeadroomPctRolling:    decisionMeta.headroomRolling,
				HeadroomPctWeekly:     decisionMeta.headroomWeekly,
				WarnPctConfigured:     decisionInfo.WarnPctConfig,
				WarnPctAuto:           decisionInfo.WarnPctAuto,
				WarnPctConfidence:     decisionInfo.WarnConfidence,
				GapSecondsP50:         decisionInfo.GapSecondsP50,
				GapSecondsP95:         decisionInfo.GapSecondsP95,
				GapSamples:            decisionInfo.GapSamples,
				RerouteMode:           string(decisionMeta.mode),
				RerouteDecision:       fallbackReason,
				PreferredAttempt:      false,
			})
			// Build alt request to Anthropic
			u2 := *s.anthropicBase
			u2.Path = path.Join(u2.Path, "/v1/messages")
			req2, _ := http.NewRequest("POST", u2.String(), bytes.NewReader(buf.Bytes()))
			req2.Header = make(http.Header)
			for k, vs := range r.Header {
				if strings.EqualFold(k, "content-length") || strings.EqualFold(k, "connection") {
					continue
				}
				for _, v := range vs { req2.Header.Add(k, v) }
			}
			req2.Header.Set("content-type", "application/json")
			req2.Header.Set("anthropic-version", anthropicVersion(r.Header))
			// Normalize for Anth lane
			req2.Header.Del("x-api-key")
			req2.Header.Del("Accept-Encoding")
			req2.Header.Set("Accept-Encoding", "identity")
			if !s.anthPassthrough { req2.Header.Del("authorization") }
			if req2.Header.Get("authorization") == "" && s.anthFallbackEnv != "" {
				if tok := strings.TrimSpace(os.Getenv(s.anthFallbackEnv)); tok != "" {
					req2.Header.Set("authorization", "Bearer "+tok)
				}
			}
			if s.forceH1 { req2.Close = true }
			var resp2 *http.Response
			var err2 error
			if stream {
				resp2, err2 = s.cliAnth.Do(req2)
			} else {
				jsonTimeout := parseDurationEnv("CCP_JSON_TIMEOUT", 30*time.Second)
				ctx2, cancel2 := context.WithTimeout(r.Context(), jsonTimeout)
				defer cancel2()
				resp2, err2 = s.cliAnthJSON.Do(req2.WithContext(ctx2))
			}
			if err2 != nil {
				http.Error(w, "upstream error", 502)
				return
			}
			resp = resp2
			responseHeaders := resp.Header // shadowed below; keep scope aligned with original
			_ = responseHeaders
			// Switch local lane/upstream for the rest of handler
			lane = alt
			upstream = "anth"
			// Continue to normal response processing below
		} else {
			http.Error(w, "upstream error", 502)
			return
		}
	}
	responseHeaders := resp.Header

	// 401 fallback for Z.AI: flip header mode and retry once for non-stream JSON
	retried := false
	if lane == "zai" && resp.StatusCode == 401 && !stream {
		retried = true
		resp.Body.Close()
		if strings.ToLower(s.zaiHeaderMode) == "authorization" {
			req.Header.Del("authorization")
			req.Header.Set("x-api-key", s.zaiKey)
		} else {
			req.Header.Del("x-api-key")
			req.Header.Set("authorization", "Bearer "+s.zaiKey)
		}
		if s.forceH1 {
			req.Close = true
		}
		jsonTimeout := parseDurationEnv("CCP_JSON_TIMEOUT", 30*time.Second)
		ctx, cancel := context.WithTimeout(r.Context(), jsonTimeout)
		defer cancel()
		resp, err = s.cliZaiJSON.Do(req.WithContext(ctx))
		if err != nil {
			log.Printf("rid=%s lane=%s retry upstream error: %v", rid, lane, err)
			http.Error(w, "upstream error", 502)
			return
		}
		responseHeaders = resp.Header
	}
	defer resp.Body.Close()

	// Copy headers that matter
	ct := resp.Header.Get("content-type")
	if ct != "" {
		w.Header().Set("content-type", ct)
	}
	// Normalize a status code variable visible after both branches
	statusCode := resp.StatusCode
	// Defer writing status for JSON path to allow fallback; write immediately for streaming
	if strings.Contains(ct, "text/event-stream") || stream {
		w.WriteHeader(resp.StatusCode)
	}

	errTypeOverride := ""
	reason := "ok"
	op := "nonstream"
	inputTok, outputTok := 0, 0
	streamDuration := time.Duration(0)
	ttftDuration := time.Duration(0)
	var bodyBytes []byte
	if strings.Contains(ct, "text/event-stream") || stream {
		// SSE passthrough with idle timeout
		fl, _ := w.(http.Flusher)
		reader := bufio.NewReader(resp.Body)
		// Partial recorder for abnormal endings
		precord := newPartialRecorder(rid)
		idle := parseDurationEnv("CCP_SSE_IDLE_TIMEOUT", 120*time.Second)
		type streamChunk struct {
			data []byte
			err  error
		}
		// Early visibility: log a streaming entry promptly so observers/tests can see it
		{
			headerMode := ""
			if lane == "zai" {
				if s.zaiHeaderMode == "" {
					headerMode = "x-api-key"
				} else {
					headerMode = s.zaiHeaderMode
				}
			}
			appendUsage(usageEntry{Ts: float64(time.Now().UnixNano()) / 1e9, Rid: rid, Lane: lane, Model: model, InputTokens: 0, OutputTokens: 0, Status: statusCode, Reason: "streaming", Op: "stream", LatencyMs: int(time.Since(t0).Milliseconds()), Upstream: upstream, H2: !s.forceH1, HeaderMode: headerMode})
		}
		chunks := make(chan streamChunk)
		go func() {
			defer close(chunks)
			for {
				data, err := reader.ReadBytes('\n')
				if len(data) > 0 {
					cp := append([]byte(nil), data...)
					chunks <- streamChunk{data: cp}
				}
				if err != nil {
					chunks <- streamChunk{err: err}
					return
				}
			}
		}()
		var timer *time.Timer
		if idle > 0 {
			timer = time.NewTimer(idle)
			defer timer.Stop()
		}
		streamErr := ""
		streamDone := false
		var firstChunk time.Time
		var lastChunk time.Time
		for !streamDone {
			var idleCh <-chan time.Time
			if timer != nil {
				idleCh = timer.C
			}
			select {
			case chunk, ok := <-chunks:
				if !ok {
					streamDone = true
					continue
				}
				if len(chunk.data) > 0 {
					now := time.Now()
					if firstChunk.IsZero() {
						firstChunk = now
					}
					lastChunk = now
					if precord != nil {
						precord.Write(chunk.data)
					}
					w.Write(chunk.data)
					if fl != nil {
						fl.Flush()
					}
				}
				if timer != nil {
					if !timer.Stop() {
						select {
						case <-idleCh:
						default:
						}
					}
					timer.Reset(idle)
				}
				if chunk.err != nil {
					if chunk.err != io.EOF {
						streamErr = "stream_error"
					}
					streamDone = true
				}
			case <-idleCh:
				streamErr = "idle_timeout"
				resp.Body.Close()
				streamDone = true
			}
		}
		if streamErr != "" {
			errTypeOverride = streamErr
			if streamErr == "idle_timeout" {
				reason = "stream_timeout"
			}
			if s.metrics != nil {
				s.metrics.bumpPartial()
			}
			if precord != nil {
				precord.Close(false)
			}
		}
		if streamErr == "" {
			reason = "streaming"
			if precord != nil {
				precord.Close(true)
			}
		}
		if !firstChunk.IsZero() && !lastChunk.IsZero() {
			streamDuration = lastChunk.Sub(firstChunk)
		}
		if !firstChunk.IsZero() {
			ttftDuration = firstChunk.Sub(t0)
			if ttftDuration < 0 {
				ttftDuration = 0
			}
		}
		op = "stream"
	} else {
		// JSON body; buffer the response so we can optionally retry before writing
		var jbuf bytes.Buffer
		io.Copy(&jbuf, resp.Body)
		resp.Body.Close()
		bodyBytes = append(bodyBytes[:0], jbuf.Bytes()...)
		statusCode := resp.StatusCode
		finalCT := ct
		var j map[string]any
		if json.Unmarshal(bodyBytes, &j) == nil {
			if u, ok := j["usage"].(map[string]any); ok {
				if v, ok := u["input_tokens"].(float64); ok {
					inputTok = int(v)
				}
				if v, ok := u["output_tokens"].(float64); ok {
					outputTok = int(v)
				}
			}
		}
		triggerFallback := resp.StatusCode >= 500 || (resp.StatusCode == 429 && lane == "zai")
		if triggerFallback {
			fallbackReason := "fallback"
			if resp.StatusCode == 429 && lane == "zai" {
				fallbackReason = "quota_overshoot"
				s.markQuota429(model)
			}
			alt := "anthropic"
			if lane == "anthropic" && s.zaiKey != "" {
				alt = "zai"
			}
			if alt != lane {
				wastedRetryMs = int(time.Since(t0).Milliseconds())
				decisionMeta.selectedLane = alt
				decisionMeta.preferredAttempt = false
				decisionMeta.decision = fallbackReason
				if fallbackReason == "quota_overshoot" && s.rerouteMode != rerouteModeRunToCap {
					if active, until := s.quotaCooldownInfo(model); active {
						decisionMeta.cooldownActive = true
						decisionMeta.cooldownUntil = until
					} else {
						decisionMeta.cooldownActive = true
						decisionMeta.cooldownUntil = time.Now().Add(s.quotaCooldown)
					}
				}
				cooldownNextFallback := 0.0
				if !decisionMeta.cooldownUntil.IsZero() {
					cooldownNextFallback = float64(decisionMeta.cooldownUntil.UnixNano()) / 1e9
				}
				if s.metrics != nil {
					s.metrics.observeReroute(string(decisionMeta.mode), model)
				}
				appendUsage(usageEntry{
					Ts:                    float64(time.Now().UnixNano()) / 1e9,
					Rid:                   rid,
					Lane:                  alt,
					Model:                 model,
					Status:                -1,
					Event:                 "decision",
					Decision:              fallbackReason,
					DecisionReason:        fallbackReason,
					Upstream:              map[string]string{"zai": "zai", "anthropic": "anth"}[alt],
					H2:                    !s.forceH1,
					RollingUsedTokens:     quotaBefore.RollingUsed,
					RollingCapacityTokens: quotaBefore.RollingCapacity,
					WeeklyUsedTokens:      quotaBefore.WeeklyUsed,
					WeeklyCapacityTokens:  quotaBefore.WeeklyCapacity,
					HeadroomPctRolling:    decisionMeta.headroomRolling,
					HeadroomPctWeekly:     decisionMeta.headroomWeekly,
					WarnPctConfigured:     decisionInfo.WarnPctConfig,
					WarnPctAuto:           decisionInfo.WarnPctAuto,
					WarnPctConfidence:     decisionInfo.WarnConfidence,
					GapSecondsP50:         decisionInfo.GapSecondsP50,
					GapSecondsP95:         decisionInfo.GapSecondsP95,
					GapSamples:            decisionInfo.GapSamples,
					RerouteMode:           string(decisionMeta.mode),
					RerouteDecision:       fallbackReason,
					PreferredAttempt:      decisionMeta.preferredAttempt,
					CooldownActive:        decisionMeta.cooldownActive,
					CooldownNextTs:        cooldownNextFallback,
				})
				base2 := s.anthropicBase
				if alt == "zai" {
					base2 = s.zaiBase
				}
				u2 := *base2
				u2.Path = path.Join(u2.Path, "/v1/messages")
				req2, _ := http.NewRequest("POST", u2.String(), bytes.NewReader(bodyBytes))
				req2.Header = make(http.Header)
				for k, vs := range r.Header {
					if strings.EqualFold(k, "content-length") || strings.EqualFold(k, "connection") {
						continue
					}
					for _, v := range vs {
						req2.Header.Add(k, v)
					}
				}
				req2.Header.Set("content-type", "application/json")
				req2.Header.Set("anthropic-version", anthropicVersion(r.Header))
				if alt == "zai" {
					req2.Header.Del("authorization")
					req2.Header.Del("x-api-key")
					if strings.ToLower(s.zaiHeaderMode) == "authorization" {
						req2.Header.Set("authorization", "Bearer "+s.zaiKey)
					} else {
						req2.Header.Set("x-api-key", s.zaiKey)
					}
				} else {
					req2.Header.Del("x-api-key")
					if !s.anthPassthrough {
						req2.Header.Del("authorization")
					}
					if req2.Header.Get("authorization") == "" && s.anthFallbackEnv != "" {
						if tok := strings.TrimSpace(os.Getenv(s.anthFallbackEnv)); tok != "" {
							req2.Header.Set("authorization", "Bearer "+tok)
						}
					}
				}
				if s.forceH1 {
					req2.Close = true
				}
				jsonTimeout := parseDurationEnv("CCP_JSON_TIMEOUT", 30*time.Second)
				ctx2, cancel2 := context.WithTimeout(r.Context(), jsonTimeout)
				defer cancel2()
				var err2 error
				var resp2 *http.Response
				if alt == "zai" {
					resp2, err2 = s.cliZaiJSON.Do(req2.WithContext(ctx2))
				} else {
					resp2, err2 = s.cliAnthJSON.Do(req2.WithContext(ctx2))
				}
				if err2 != nil {
					http.Error(w, "upstream error", 502)
					return
				}
				defer resp2.Body.Close()
				finalCT = resp2.Header.Get("content-type")
				jbuf.Reset()
				io.Copy(&jbuf, resp2.Body)
				bodyBytes = append(bodyBytes[:0], jbuf.Bytes()...)
				_ = json.Unmarshal(bodyBytes, &j)
				if u, ok := j["usage"].(map[string]any); ok {
					if v, ok := u["input_tokens"].(float64); ok {
						inputTok = int(v)
					}
					if v, ok := u["output_tokens"].(float64); ok {
						outputTok = int(v)
					}
				}
				statusCode = resp2.StatusCode
				lane = alt
				upstream = map[string]string{"zai": "zai", "anthropic": "anth"}[lane]
				responseHeaders = resp2.Header
				decision = fallbackReason
			}
		}
		if finalCT != "" {
			w.Header().Set("content-type", finalCT)
		}
		w.WriteHeader(statusCode)
		if len(bodyBytes) > 0 {
			w.Write(bodyBytes)
		}
		ct = finalCT
		streamDuration = time.Since(t0)
	}

	// Usage log
	latencyDur := time.Since(t0)
	latency := int(latencyDur.Milliseconds())
	if streamDuration <= 0 {
		streamDuration = latencyDur
	}
	streamMs := int(streamDuration.Milliseconds())
	inputTok, outputTok = s.extractTokens(lane, responseHeaders, bodyBytes, inputTok, outputTok)
	// Optional backoff record simulation: if 429/503 and SHIM_ENABLE_BACKOFF=1
	backoffMs := 0
	if os.Getenv("SHIM_ENABLE_BACKOFF") == "1" && lane == "zai" && op == "nonstream" && (statusCode == 429 || statusCode == 503) {
		delay := time.Duration((200 + rand.Intn(400))) * time.Millisecond
		backoffMs = int(delay / time.Millisecond)
		appendAnomaly(map[string]any{"ts": float64(time.Now().UnixNano()) / 1e9, "rid": rid, "event": "backoff", "status": statusCode, "delay_s": float64(backoffMs) / 1000.0, "lane": lane, "model": model})
		time.Sleep(delay)
	}
	headerMode := ""
	if lane == "zai" {
		if s.zaiHeaderMode == "" {
			headerMode = "x-api-key"
		} else {
			headerMode = s.zaiHeaderMode
		}
	}
	if s.rerouteMode != rerouteModeRunToCap {
		if active, until := s.quotaCooldownInfo(model); active {
			decisionMeta.cooldownActive = true
			decisionMeta.cooldownUntil = until
		}
	}
	cooldownNextFinal := 0.0
	if !decisionMeta.cooldownUntil.IsZero() {
		cooldownNextFinal = float64(decisionMeta.cooldownUntil.UnixNano()) / 1e9
	}
	if s.metrics != nil && decisionMeta.decision == "quota_overshoot" && wastedRetryMs > 0 {
		s.metrics.addWastedRetry(model, wastedRetryMs)
	}
	appendUsage(usageEntry{
		Ts:           float64(time.Now().UnixNano()) / 1e9,
		Rid:          rid,
		Lane:         lane,
		Model:        model,
		InputTokens:  inputTok,
		OutputTokens: outputTok,
		Status:       statusCode,
		Reason:       reason,
		Op:           op,
		LatencyMs:    latency,
		StreamMs:     streamMs,
		TTFTMs:       int(ttftDuration / time.Millisecond),
		ErrType: func() string {
			if errTypeOverride != "" {
				return errTypeOverride
			}
			if statusCode >= 400 {
				if statusCode == 401 {
					return "401"
				} else if statusCode == 429 {
					return "429"
				} else if statusCode >= 500 {
					return "5xx"
				} else {
					return "4xx"
				}
			}
			return ""
		}(),
		Upstream:              upstream,
		H2:                    !s.forceH1,
		HeaderMode:            headerMode,
		Retry:                 retried,
		BackoffMs:             backoffMs,
		DecisionReason:        decision,
		RollingUsedTokens:     quotaBefore.RollingUsed,
		RollingCapacityTokens: quotaBefore.RollingCapacity,
		WeeklyUsedTokens:      quotaBefore.WeeklyUsed,
		WeeklyCapacityTokens:  quotaBefore.WeeklyCapacity,
		HeadroomPctRolling:    decisionMeta.headroomRolling,
		HeadroomPctWeekly:     decisionMeta.headroomWeekly,
		WarnPctConfigured:     decisionInfo.WarnPctConfig,
		WarnPctAuto:           decisionInfo.WarnPctAuto,
		WarnPctConfidence:     decisionInfo.WarnConfidence,
		GapSecondsP50:         decisionInfo.GapSecondsP50,
		GapSecondsP95:         decisionInfo.GapSecondsP95,
		GapSamples:            decisionInfo.GapSamples,
		RerouteMode:           string(decisionMeta.mode),
		RerouteDecision:       decisionMeta.decision,
		PreferredAttempt:      decisionMeta.preferredAttempt,
		CooldownActive:        decisionMeta.cooldownActive,
		CooldownNextTs:        cooldownNextFinal,
		WastedRetryMs:         wastedRetryMs,
	})

	// Quotas accounting
	if s.q != nil {
		s.q.RecordUsage(model, inputTok, outputTok, latencyDur, streamDuration, ttftDuration)
	}
	// Metrics observations
	if s.metrics != nil {
		s.metrics.observeRequest(lane, op, statusCode, latencyDur, model, inputTok, outputTok, latencyDur, streamDuration)
	}
	// Persistence write (additive; best-effort)
	if s.store != nil {
		effStream := streamDuration
		if effStream <= 0 {
			effStream = latencyDur
		}
		errType := ""
		if errTypeOverride != "" {
			errType = errTypeOverride
		}
		sample := UsageSample{
			Ts:            float64(time.Now().UnixNano()) / 1e9,
			Rid:           rid,
			Model:         model,
			Lane:          lane,
			Op:            op,
			InputTokens:   inputTok,
			OutputTokens:  outputTok,
			DirtySeconds:  latencyDur.Seconds(),
			StreamSeconds: effStream.Seconds(),
			TTFTMillis:    int(ttftDuration / time.Millisecond),
			Status:        statusCode,
			ErrType:       errType,
			Decision:      decision,
			RerouteMode:   string(decisionMeta.mode),
			WarnPctAuto:   decisionInfo.WarnPctAuto,
			GapSecondsP50: decisionInfo.GapSecondsP50,
			GapSecondsP95: decisionInfo.GapSecondsP95,
			GapSamples:    decisionInfo.GapSamples,
			Upstream:      upstream,
			H2:            !s.forceH1,
			HeaderMode:    headerMode,
		}
		if err := s.store.WriteSample(context.Background(), sample); err != nil {
			if s.metrics != nil {
				s.metrics.incStoreWrite(false)
			}
		} else {
			if s.metrics != nil {
				s.metrics.incStoreWrite(true)
			}
		}
	}
}

func (s *server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200); w.Write([]byte("ok")) })
	mux.HandleFunc("/readyz", s.handleReady)
	mux.HandleFunc("/v1/messages", s.handleMessages)
	if s.q != nil {
		s.q.WireQuotaHTTP(mux, s.devEnable)
	}
	if s.store != nil {
		mux.HandleFunc("/v1/usage/samples", s.handleUsageSamples)
		mux.HandleFunc("/v1/usage/rollups", s.handleUsageRollups)
	}
	if s.metrics != nil {
		mux.Handle("/metrics", s.metrics.handler())
	}
	return mux
}

func (s *server) handleReady(w http.ResponseWriter, r *http.Request) {
	type stat struct {
		Ok     bool   `json:"ok"`
		Status int    `json:"status"`
		Error  string `json:"error,omitempty"`
		URL    string `json:"url"`
	}
	out := struct {
		Providers map[string]stat `json:"providers"`
		Ts        float64         `json:"ts"`
		Source    string          `json:"source,omitempty"`
		Error     string          `json:"error,omitempty"`
		License   *struct {
			Ok       bool     `json:"ok"`
			Plan     string   `json:"plan,omitempty"`
			Features []string `json:"features,omitempty"`
		} `json:"license,omitempty"`
	}{Providers: map[string]stat{}, Ts: float64(time.Now().UnixNano()) / 1e9, Source: s.catalogPath}

	w.Header().Set("content-type", "application/json")
	if s.catalogErr != nil {
		out.Error = s.catalogErr.Error()
		w.WriteHeader(http.StatusServiceUnavailable)
		_ = json.NewEncoder(w).Encode(out)
		return
	}
	provs := map[string]string{}
	if s.catalog != nil && len(s.catalog.Providers) > 0 {
		for name, p := range s.catalog.Providers {
			provs[name] = p.BaseURL
		}
	} else {
		provs["anth"] = s.anthropicBase.String()
		provs["zai"] = s.zaiBase.String()
	}

	// license info (additive; optional)
	if s.licenseClaims != nil {
		features := []string{}
		for _, f := range s.licenseClaims.Features {
			features = append(features, f)
		}
		out.License = &struct {
			Ok       bool     `json:"ok"`
			Plan     string   `json:"plan,omitempty"`
			Features []string `json:"features,omitempty"`
		}{Ok: true, Plan: s.licenseClaims.Plan, Features: features}
	}
	client := &http.Client{Timeout: 2 * time.Second}
	for name, base := range provs {
		if base == "" {
			out.Providers[name] = stat{Ok: false, Status: 0, Error: "no_base_url", URL: base}
			continue
		}
		u, _ := url.Parse(base)
		u.Path = path.Join(u.Path, "/v1/messages")
		req, _ := http.NewRequest("OPTIONS", u.String(), nil)
		req.Header.Set("anthropic-version", anthropicVersion(r.Header))
		resp, err := client.Do(req)
		if err != nil {
			out.Providers[name] = stat{Ok: false, Status: 0, Error: err.Error(), URL: u.String()}
			continue
		}
		status := resp.StatusCode
		_ = resp.Body.Close()
		ok := status >= 200 && status <= 405
		out.Providers[name] = stat{Ok: ok, Status: status, URL: u.String()}
		if s.metrics != nil {
			// normalize provider name to lane-like labels
			lane := name
			if lane == "anth" || lane == "anthropic" {
				lane = "anthropic"
			}
			s.metrics.setUpstream(lane, ok)
		}
	}
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(out)
}

func main() {
	var (
		port             int
		policyURL        string
		policyPubKeyPath string
		policyCachePath  string
		licenseJSONFlag  string
		licenseSigFlag   string
	)
	defaultCache := filepath.Join("logs", "policy-cache.json")

	// Utility: print loaded providers catalog and exit
	if len(os.Args) > 1 && os.Args[1] == "--print-providers" {
		catalog, path, err := loadProviderCatalog(defaultProviderPaths(repoRoot()))
		if err != nil {
			fmt.Printf("{\"error\":%q}\n", err.Error())
			os.Exit(1)
		}
		type outT struct {
			Path      string                   `json:"path"`
			Providers map[string]ProviderEntry `json:"providers"`
			Routes    []ProviderRoute          `json:"routes"`
		}
		source := path
		if source == "" {
			source = "<embedded>"
		}
		b, _ := json.MarshalIndent(outT{Path: source, Providers: catalog.Providers, Routes: catalog.Routes}, "", "  ")
		fmt.Println(string(b))
		return
	}

	// Utility: DB helpers (optional R4 polish)
	if len(os.Args) > 1 && os.Args[1] == "db" {
		if len(os.Args) < 3 {
			fmt.Println("usage: ccp db <status|export|import> [args]")
			return
		}
		dbPath := os.Getenv("CCP_DB_PATH")
		if dbPath == "" {
			dbPath = filepath.Join("logs", "ccp.sqlite3")
		}
		cmd := os.Args[2]
		switch cmd {
		case "status":
			st, err := OpenStoreSQLite(dbPath)
			if err != nil {
				fmt.Printf("{\"error\":%q}\n", err.Error())
				return
			}
			defer st.Close()
			type out struct {
				Path     string  `json:"path"`
				Size     int64   `json:"size_bytes"`
				Samples  int64   `json:"samples"`
				TsMin    float64 `json:"ts_min"`
				TsMax    float64 `json:"ts_max"`
				HourRows int64   `json:"hour_rows"`
				DayRows  int64   `json:"day_rows"`
			}
			o := out{Path: dbPath, Size: st.SizeBytes()}
			if ss, ok := st.(*sqliteStore); ok {
				row := ss.db.QueryRow(`SELECT COUNT(*), COALESCE(MIN(ts),0), COALESCE(MAX(ts),0) FROM usage_sample`)
				_ = row.Scan(&o.Samples, &o.TsMin, &o.TsMax)
				row = ss.db.QueryRow(`SELECT COUNT(*) FROM usage_rollup_hour`)
				_ = row.Scan(&o.HourRows)
				row = ss.db.QueryRow(`SELECT COUNT(*) FROM usage_rollup_day`)
				_ = row.Scan(&o.DayRows)
			}
			b, _ := json.MarshalIndent(o, "", "  ")
			fmt.Println(string(b))
			return
		case "export":
			if len(os.Args) < 5 || os.Args[3] != "--csv" {
				fmt.Println("usage: ccp db export --csv <path>")
				return
			}
			outPath := os.Args[4]
			st, err := OpenStoreSQLite(dbPath)
			if err != nil {
				fmt.Printf("{\"error\":%q}\n", err.Error())
				return
			}
			defer st.Close()
			f, err := os.Create(outPath)
			if err != nil {
				fmt.Printf("{\"error\":%q}\n", err.Error())
				return
			}
			defer f.Close()
			// header
			fmt.Fprintln(f, "ts,rid,model,lane,op,input_tokens,output_tokens,dirty_s,stream_s,ttft_ms,status,err_type,decision,reroute_mode,upstream,h2,header_mode")
			rows, err := st.ListSamples(context.Background(), 0, "")
			if err != nil {
				fmt.Printf("{\"error\":%q}\n", err.Error())
				return
			}
			for _, v := range rows {
				h2 := 0
				if v.H2 {
					h2 = 1
				}
				fmt.Fprintf(f, "%f,%s,%s,%s,%s,%d,%d,%f,%f,%d,%d,%s,%s,%s,%s,%d,%s\n",
					v.Ts, v.Rid, v.Model, v.Lane, v.Op, v.InputTokens, v.OutputTokens, v.DirtySeconds, v.StreamSeconds, v.TTFTMillis, v.Status, v.ErrType, v.Decision, v.RerouteMode, v.Upstream, h2, v.HeaderMode)
			}
			fmt.Println("{\"ok\":true}")
			return
		case "import":
			if len(os.Args) < 5 || os.Args[3] != "--jsonl" {
				fmt.Println("usage: ccp db import --jsonl <path>")
				return
			}
			inPath := os.Args[4]
			b, err := os.ReadFile(inPath)
			if err != nil {
				fmt.Printf("{\"error\":%q}\n", err.Error())
				return
			}
			st, err := OpenStoreSQLite(dbPath)
			if err != nil {
				fmt.Printf("{\"error\":%q}\n", err.Error())
				return
			}
			defer st.Close()
			// parse line by line
			lines := bytes.Split(b, []byte{'\n'})
			inserted := 0
			for _, line := range lines {
				if len(bytes.TrimSpace(line)) == 0 {
					continue
				}
				var e map[string]any
				if json.Unmarshal(line, &e) != nil {
					continue
				}
				// minimal mapping from usageEntry JSONL
				us := UsageSample{
					Ts:            asFloat(e["ts"]),
					Rid:           asString(e["rid"]),
					Model:         asString(e["model"]),
					Lane:          asString(e["lane"]),
					Op:            asString(e["op"]),
					InputTokens:   int(asFloat(e["input_tokens"])),
					OutputTokens:  int(asFloat(e["output_tokens"])),
					DirtySeconds:  asFloat(e["latency_ms"]) / 1000.0,
					StreamSeconds: asFloat(e["stream_ms"]) / 1000.0,
					TTFTMillis:    int(asFloat(e["ttft_ms"])),
					Status:        int(asFloat(e["status"])),
					ErrType:       asString(e["err_type"]),
					Decision: func() string {
						if v := asString(e["decision_reason"]); v != "" {
							return v
						}
						return asString(e["decision"])
					}(),
					RerouteMode: asString(e["reroute_mode"]),
					Upstream:    asString(e["upstream"]),
					H2:          asBool(e["h2"]),
					HeaderMode:  asString(e["header_mode"]),
				}
				if err := st.WriteSample(context.Background(), us); err == nil {
					inserted++
				}
			}
			fmt.Printf("{\"ok\":true,\"inserted\":%d}\n", inserted)
			return
		default:
			fmt.Println("usage: ccp db <status|export|import> [args]")
			return
		}
	}

	if len(os.Args) > 1 && os.Args[1] == "serve" {
		fs := flag.NewFlagSet("serve", flag.ExitOnError)
		fs.IntVar(&port, "port", 8082, "listen port")
		fs.StringVar(&policyURL, "policy-url", "", "URL to remote policy pack (optional)")
		fs.StringVar(&policyPubKeyPath, "policy-pubkey", "", "Path to base64 Ed25519 public key for policy verification")
		fs.StringVar(&policyCachePath, "policy-cache", defaultCache, "Path to cache last-known-good policy")
		fs.StringVar(&licenseJSONFlag, "license-json", "", "Path to signed license JSON (optional)")
		fs.StringVar(&licenseSigFlag, "license-sig", "", "Path to license signature (base64)")
		fs.Parse(os.Args[2:])
	} else {
		flag.IntVar(&port, "port", 8082, "listen port")
		flag.StringVar(&policyURL, "policy-url", "", "URL to remote policy pack (optional)")
		flag.StringVar(&policyPubKeyPath, "policy-pubkey", "", "Path to base64 Ed25519 public key for policy verification")
		flag.StringVar(&policyCachePath, "policy-cache", defaultCache, "Path to cache last-known-good policy")
		flag.StringVar(&licenseJSONFlag, "license-json", "", "Path to signed license JSON (optional)")
		flag.StringVar(&licenseSigFlag, "license-sig", "", "Path to license signature (base64)")
		flag.Parse()
	}
	if policyCachePath == "" {
		policyCachePath = defaultCache
	}

	policy, err := parsePolicy([]byte(defaultPolicyJSON))
	if err != nil {
		log.Fatalf("failed to parse embedded policy: %v", err)
	}

	if policyURL != "" {
		if policyPubKeyPath == "" {
			log.Fatalf("--policy-pubkey must be provided when --policy-url is set")
		}
		pubKey, err := loadPublicKey(policyPubKeyPath)
		if err != nil {
			log.Fatalf("failed to load policy public key: %v", err)
		}
		loader := newPolicyLoader(policyURL, pubKey, policyCachePath)
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		if remote, err := loader.Load(ctx); err != nil {
			log.Printf("[policy] warning: %v; using embedded policy", err)
		} else {
			policy = remote
			log.Printf("[policy] loaded version %s (expires %s)", policy.Version, policy.Expires.UTC().Format(time.RFC3339))
		}
	}

	// Allow additive public keys via env for dev issuers (comma-separated).
	// Supports both raw base64 and kid=base64 entries so we can match
	// the issuer's kid without editing the embedded list.
	if extra := strings.TrimSpace(os.Getenv("CCP_LICENSE_PUBKEY_B64")); extra != "" {
		for _, part := range strings.Split(extra, ",") {
			part = strings.TrimSpace(part)
			if part == "" {
				continue
			}
			key := fmt.Sprintf("env_%d", len(licensePubKeys))
			val := part
			if idx := strings.Index(part, "="); idx > 0 && strings.IndexAny(part[:idx], "+/=") == -1 {
				candidate := strings.TrimSpace(part[:idx])
				if candidate != "" {
					key = candidate
				}
				val = strings.TrimSpace(part[idx+1:])
			}
			if val == "" {
				continue
			}
			licensePubKeys[key] = val
		}
	}

	licenseJSON := licenseJSONFlag
	licenseSig := licenseSigFlag
	if licenseJSON == "" {
		licenseJSON = os.Getenv("CC_LICENSE_JSON")
	}
	if licenseSig == "" {
		licenseSig = os.Getenv("CC_LICENSE_SIG")
	}

	var claims *license.Claims
	if licenseJSON != "" && licenseSig != "" {
		lic, err := license.LoadAndVerify(licensePubKeys, licenseJSON, licenseSig, time.Now(), hostHash())
		if err != nil {
			log.Printf("[license] invalid or expired (%v); community mode", err)
		} else {
			claims = lic
			log.Printf("[license] plan=%s features=%v exp=%d", lic.Plan, lic.Features, lic.Exp)
		}
	} else if licenseJSON != "" || licenseSig != "" {
		log.Printf("[license] incomplete configuration (json=%q sig=%q); community mode", licenseJSON, licenseSig)
	} else {
		log.Printf("[license] none provided (community mode)")
	}

	srv := newServer(port, policy, claims)
	if srv.policyVersion != "" && policy != nil {
		log.Printf("[policy] active version %s (expires %s)", srv.policyVersion, policy.Expires.UTC().Format(time.RFC3339))
	}
	if srv.q != nil {
		srv.q.StartCalibrator(context.Background())
	}
	addr := fmt.Sprintf(":%d", srv.port)
	log.Printf("ccp listening on %s (anth=%s zai=%s)", addr, srv.anthropicBase, srv.zaiBase)
	server := &http.Server{Addr: addr, Handler: srv.routes()}
	log.Fatal(server.ListenAndServe())
}
