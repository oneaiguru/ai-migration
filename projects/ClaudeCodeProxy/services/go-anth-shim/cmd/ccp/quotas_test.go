package main

import (
	"bytes"
	"encoding/json"
	"math"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// helper to start a shim server with mocked upstreams and current env
func startShimBasic(t *testing.T) *httptest.Server {
	t.Helper()
	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	t.Cleanup(shim.Close)
	return shim
}

func TestQuotas_LoaderPrecedence_UserWins(t *testing.T) {
	chdirTmp(t)
	// create project and user configs
	project := filepath.Join("configs")
	if err := os.MkdirAll(project, 0o755); err != nil {
		t.Fatal(err)
	}
	projFile := filepath.Join(project, "quotas.json")
	_ = os.WriteFile(projFile, []byte(`{"windows":{"rolling_seconds":3600,"weekly_seconds":604800},"models":{}}`), 0o644)

	home := t.TempDir()
	t.Setenv("HOME", home)
	userDir := filepath.Join(home, ".config", "ccp")
	if err := os.MkdirAll(userDir, 0o755); err != nil {
		t.Fatal(err)
	}
	userFile := filepath.Join(userDir, "quotas.json")
	_ = os.WriteFile(userFile, []byte(`{"windows":{"rolling_seconds":1234,"weekly_seconds":999},"models":{}}`), 0o644)

	// start shim; expect it to pick user file
	shim := startShimBasic(t)
	resp, err := http.Get(shim.URL + "/v1/quotas")
	if err != nil {
		t.Fatalf("/v1/quotas err: %v", err)
	}
	defer resp.Body.Close()
	var q struct {
		Path string `json:"path"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&q)
	if q.Path == "" || q.Path != userFile {
		t.Fatalf("expected user quotas path %q, got %q", userFile, q.Path)
	}
}

func TestQuotas_SimUsage_WarnAndBlock(t *testing.T) {
	chdirTmp(t)
	// quotas file with tiny rolling tokens to trigger flags quickly
	quotas := filepath.Join(t.TempDir(), "quotas.json")
	_ = os.WriteFile(quotas, []byte(`{
        "windows": {"rolling_seconds": 3600, "weekly_seconds": 604800},
        "models": {
            "claude-haiku-4.5": {"provider":"zai","rolling_tokens": 1000, "weekly_limit_type":"hours", "weekly_limit_value": 1, "warn_pct": 0.8}
        }
    }`), 0o644)
	t.Setenv("CCP_QUOTAS_FILE", quotas)
	t.Setenv("CCP_DEV_ENABLE", "1")

	shim := startShimBasic(t)

	// simulate usage at 50% first (no warn)
	body := []byte(`{"model":"claude-haiku-4.5","in":200,"out":300,"repeat":1,"seconds":60}`)
	req, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body))
	req.Header.Set("content-type", "application/json")
	if resp, err := http.DefaultClient.Do(req); err != nil || resp.StatusCode != 200 {
		t.Fatalf("sim-usage 1 failed: %v %d", err, resp.StatusCode)
	}

	// check usage: warn=false, block=false
	resp, _ := http.Get(shim.URL + "/v1/usage")
	var usage struct {
		Models map[string]struct {
			RollingPct float64 `json:"rolling_pct"`
			Warn       bool    `json:"warn"`
			Block      bool    `json:"block"`
		} `json:"models"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&usage)
	resp.Body.Close()
	m := usage.Models["claude-haiku-4.5"]
	if m.Warn || m.Block {
		t.Fatalf("unexpected flags at 50%%: warn=%v block=%v pct=%.2f", m.Warn, m.Block, m.RollingPct)
	}

	// add more to cross 80% but below 100%
	body2 := []byte(`{"model":"claude-haiku-4.5","in":200,"out":200,"repeat":1,"seconds":60}`)
	req2, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body2))
	req2.Header.Set("content-type", "application/json")
	if resp2, err := http.DefaultClient.Do(req2); err != nil || resp2.StatusCode != 200 {
		t.Fatalf("sim-usage 2 failed: %v %d", err, resp2.StatusCode)
	}

	resp3, _ := http.Get(shim.URL + "/v1/usage")
	_ = json.NewDecoder(resp3.Body).Decode(&usage)
	resp3.Body.Close()
	m = usage.Models["claude-haiku-4.5"]
	if !m.Warn || m.Block {
		t.Fatalf("expected warn=true block=false near 90%%, got warn=%v block=%v pct=%.2f", m.Warn, m.Block, m.RollingPct)
	}

	// add to exceed 100%
	body3 := []byte(`{"model":"claude-haiku-4.5","in":100,"out":100,"repeat":1,"seconds":60}`)
	req3, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body3))
	req3.Header.Set("content-type", "application/json")
	if resp4, err := http.DefaultClient.Do(req3); err != nil || resp4.StatusCode != 200 {
		t.Fatalf("sim-usage 3 failed: %v %d", err, resp4.StatusCode)
	}

	resp5, _ := http.Get(shim.URL + "/v1/usage")
	_ = json.NewDecoder(resp5.Body).Decode(&usage)
	resp5.Body.Close()
	m = usage.Models["claude-haiku-4.5"]
	if !m.Block {
		t.Fatalf("expected block=true at >=100%%, got pct=%.2f", m.RollingPct)
	}
}

func TestDecisionInfoReflectsCalibration(t *testing.T) {
	chdirTmp(t)
	quotas := filepath.Join(t.TempDir(), "calibration.json")
	_ = os.WriteFile(quotas, []byte(`{"windows":{"rolling_seconds":3600,"weekly_seconds":604800},"models":{"claude-haiku-4.5":{"provider":"zai","rolling_tokens": 1000,"weekly_limit_type":"tokens","weekly_limit_value": 100000,"warn_pct":0.75}}}`), 0o644)
	t.Setenv("CCP_QUOTAS_FILE", quotas)
	eng := InitQuotas(".")

	info := eng.decisionInfo("claude-haiku-4.5")
	if math.Abs(info.WarnPctAuto-0.75) > 1e-9 {
		t.Fatalf("expected warn_pct_auto 0.75, got %.3f", info.WarnPctAuto)
	}
	if info.GapSamples != 0 {
		t.Fatalf("expected initial gap samples 0, got %d", info.GapSamples)
	}

	eng.mu.Lock()
	stats := eng.getCalibrationLocked("claude-haiku-4.5")
	stats.warnPctAuto = 0.62
	stats.warnConfidence = 0.4
	stats.gapSecondsP50 = 12
	stats.gapSecondsP95 = 30
	stats.gapSamples = 7
	eng.mu.Unlock()

	info = eng.decisionInfo("claude-haiku-4.5")
	if math.Abs(info.WarnPctAuto-0.62) > 1e-9 {
		t.Fatalf("expected warn_pct_auto 0.62, got %.3f", info.WarnPctAuto)
	}
	if math.Abs(info.WarnConfidence-0.4) > 1e-9 {
		t.Fatalf("expected warn confidence 0.4, got %.3f", info.WarnConfidence)
	}
	if info.GapSamples != 7 || info.GapSecondsP50 != 12 || info.GapSecondsP95 != 30 {
		t.Fatalf("unexpected gap stats %+v", info)
	}
}

func TestCalibrationSamplerUpdatesConfidence(t *testing.T) {
	eng := &quotasEngine{
		cfg:         quotasFile{Models: map[string]quotaModelCfg{"claude-haiku-4.5": {Provider: "zai", RollingTokens: 1000, WarnPct: 0.8}}},
		models:      map[string]*modelCounters{},
		calibration: map[string]*calibrationStats{},
	}
	now := time.Now()
	eng.models["claude-haiku-4.5"] = &modelCounters{}
	for i := 0; i < 25; i++ {
		eng.models["claude-haiku-4.5"].samples = append(eng.models["claude-haiku-4.5"].samples, usageSample{TS: now})
	}
	eng.runCalibrationTick(now)
	eng.mu.Lock()
	stats := eng.getCalibrationLocked("claude-haiku-4.5")
	conf := stats.warnConfidence
	eng.mu.Unlock()
	if conf <= 0 {
		t.Fatalf("expected warn confidence > 0, got %.3f", conf)
	}
}

func TestQuotas_Reload_ValidationAndHotSwap(t *testing.T) {
	chdirTmp(t)
	t.Setenv("CCP_DEV_ENABLE", "1")
	// Start shim with default example (or empty defaults)
	shim := startShimBasic(t)

	// invalid JSON file → 400
	bad := filepath.Join(t.TempDir(), "bad.json")
	_ = os.WriteFile(bad, []byte("{"), 0o644)
	req, _ := http.NewRequest("POST", shim.URL+"/v1/quotas/reload?file="+urlQueryEscape(bad), nil)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("reload bad err: %v", err)
	}
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
	resp.Body.Close()

	// good file with tiny limit, then simulate usage to block, then reload larger limit and confirm unblocked
	good := filepath.Join(t.TempDir(), "good.json")
	_ = os.WriteFile(good, []byte(`{"windows":{"rolling_seconds":3600,"weekly_seconds":604800},"models":{"claude-haiku-4.5":{"provider":"zai","rolling_tokens": 500, "weekly_limit_type":"tokens","weekly_limit_value": 100000, "warn_pct": 0.8}}}`), 0o644)
	req2, _ := http.NewRequest("POST", shim.URL+"/v1/quotas/reload?file="+urlQueryEscape(good), nil)
	resp2, err := http.DefaultClient.Do(req2)
	if err != nil || resp2.StatusCode != http.StatusNoContent {
		t.Fatalf("reload good failed: %v %d", err, resp2.StatusCode)
	}
	resp2.Body.Close()

	// simulate usage to exceed 100% of 500
	body := []byte(`{"model":"claude-haiku-4.5","in":300,"out":250,"repeat":1}`)
	rq, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body))
	rq.Header.Set("content-type", "application/json")
	_, _ = http.DefaultClient.Do(rq)

	// confirm block=true
	var usage struct {
		Models map[string]struct {
			RollingPct float64 `json:"rolling_pct"`
			Block      bool    `json:"block"`
		} `json:"models"`
	}
	u1, _ := http.Get(shim.URL + "/v1/usage")
	_ = json.NewDecoder(u1.Body).Decode(&usage)
	u1.Body.Close()
	if !usage.Models["claude-haiku-4.5"].Block {
		t.Fatalf("expected block after exceeding small limit")
	}

	// reload larger limit
	larger := filepath.Join(t.TempDir(), "larger.json")
	_ = os.WriteFile(larger, []byte(`{"windows":{"rolling_seconds":3600,"weekly_seconds":604800},"models":{"claude-haiku-4.5":{"provider":"zai","rolling_tokens": 5000, "weekly_limit_type":"tokens","weekly_limit_value": 100000, "warn_pct": 0.8}}}`), 0o644)
	rq2, _ := http.NewRequest("POST", shim.URL+"/v1/quotas/reload?file="+urlQueryEscape(larger), nil)
	r2, _ := http.DefaultClient.Do(rq2)
	if r2.StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204 on reload, got %d", r2.StatusCode)
	}
	r2.Body.Close()

	u2, _ := http.Get(shim.URL + "/v1/usage")
	_ = json.NewDecoder(u2.Body).Decode(&usage)
	u2.Body.Close()
	if usage.Models["claude-haiku-4.5"].Block {
		t.Fatalf("expected block=false after raising limit")
	}
}

// urlQueryEscape minimal helper without importing net/url in test header
func urlQueryEscape(s string) string {
	// Simple escape for path with spaces; sufficient for temp paths in tests
	b := make([]byte, 0, len(s)*3)
	for i := 0; i < len(s); i++ {
		c := s[i]
		if (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '-' || c == '_' || c == '.' || c == '/' || c == ':' {
			b = append(b, c)
		} else {
			b = append(b, '%', "0123456789ABCDEF"[c>>4], "0123456789ABCDEF"[c&15])
		}
	}
	return string(b)
}

func TestQuotas_WeeklyTokens_WindowCountsOnly(t *testing.T) {
	chdirTmp(t)
	// weekly window very small so first sample ages out
	quotas := filepath.Join(t.TempDir(), "q_week_tokens.json")
	_ = os.WriteFile(quotas, []byte(`{
        "windows": {"rolling_seconds": 10, "weekly_seconds": 1},
        "models": {
            "claude-haiku-4.5": {"provider":"zai","rolling_tokens": 100000, "weekly_limit_type":"tokens", "weekly_limit_value": 1000, "warn_pct": 0.8}
        }
    }`), 0o644)
	t.Setenv("CCP_QUOTAS_FILE", quotas)
	t.Setenv("CCP_DEV_ENABLE", "1")

	shim := startShimBasic(t)

	// First usage: 300 tokens total
	body1 := []byte(`{"model":"claude-haiku-4.5","in":100,"out":200,"repeat":1}`)
	r1, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body1))
	r1.Header.Set("content-type", "application/json")
	if resp, err := http.DefaultClient.Do(r1); err != nil || resp.StatusCode != 200 {
		t.Fatalf("sim-usage 1 failed: %v %d", err, resp.StatusCode)
	}

	// Immediately: weekly pct should be 0.3
	var usage struct {
		Models map[string]struct {
			WeeklyPct float64 `json:"weekly_pct"`
		} `json:"models"`
	}
	u, _ := http.Get(shim.URL + "/v1/usage")
	_ = json.NewDecoder(u.Body).Decode(&usage)
	u.Body.Close()
	if got := usage.Models["claude-haiku-4.5"].WeeklyPct; got < 0.29 || got > 0.31 {
		t.Fatalf("weekly tokens pct want ~0.30, got %.3f", got)
	}

	// Wait for weekly window to pass
	time.Sleep(1200 * time.Millisecond)

	// Second usage: 100 tokens total
	body2 := []byte(`{"model":"claude-haiku-4.5","in":50,"out":50,"repeat":1}`)
	r2, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body2))
	r2.Header.Set("content-type", "application/json")
	if resp, err := http.DefaultClient.Do(r2); err != nil || resp.StatusCode != 200 {
		t.Fatalf("sim-usage 2 failed: %v %d", err, resp.StatusCode)
	}

	// Now weekly pct should reflect only second event: 100/1000 = 0.1
	u2, _ := http.Get(shim.URL + "/v1/usage")
	_ = json.NewDecoder(u2.Body).Decode(&usage)
	u2.Body.Close()
	if got := usage.Models["claude-haiku-4.5"].WeeklyPct; got < 0.09 || got > 0.11 {
		t.Fatalf("weekly tokens pct want ~0.10 after window, got %.3f", got)
	}
}

func TestQuotas_RollingPrune_Integrity(t *testing.T) {
	chdirTmp(t)
	quotas := filepath.Join(t.TempDir(), "q_rolling.json")
	_ = os.WriteFile(quotas, []byte(`{
        "windows": {"rolling_seconds": 1, "weekly_seconds": 10},
        "models": {
            "claude-haiku-4.5": {"provider":"zai","rolling_tokens": 100000, "weekly_limit_type":"tokens", "weekly_limit_value": 100000}
        }
    }`), 0o644)
	t.Setenv("CCP_QUOTAS_FILE", quotas)
	t.Setenv("CCP_DEV_ENABLE", "1")

	shim := startShimBasic(t)

	// First usage: 300 tokens
	b1 := []byte(`{"model":"claude-haiku-4.5","in":100,"out":200,"repeat":1}`)
	rq1, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(b1))
	rq1.Header.Set("content-type", "application/json")
	_, _ = http.DefaultClient.Do(rq1)

	// Wait so it falls out of the 1s rolling window
	time.Sleep(1200 * time.Millisecond)

	// Second usage: 40 tokens
	b2 := []byte(`{"model":"claude-haiku-4.5","in":20,"out":20,"repeat":1}`)
	rq2, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(b2))
	rq2.Header.Set("content-type", "application/json")
	_, _ = http.DefaultClient.Do(rq2)

	// Rolling should count only second event now
	var usage struct {
		Models map[string]struct {
			RollingIn  int64 `json:"rolling_in"`
			RollingOut int64 `json:"rolling_out"`
		} `json:"models"`
	}
	u, _ := http.Get(shim.URL + "/v1/usage")
	_ = json.NewDecoder(u.Body).Decode(&usage)
	u.Body.Close()
	m := usage.Models["claude-haiku-4.5"]
	if m.RollingIn != 20 || m.RollingOut != 20 {
		t.Fatalf("rolling counters wrong; want in=20 out=20, got in=%d out=%d", m.RollingIn, m.RollingOut)
	}
}

func TestQuotas_WeeklyHours_WindowCountsOnly(t *testing.T) {
	chdirTmp(t)
	quotas := filepath.Join(t.TempDir(), "q_week_hours.json")
	_ = os.WriteFile(quotas, []byte(`{
        "windows": {"rolling_seconds": 10, "weekly_seconds": 1},
        "models": {
            "claude-haiku-4.5": {"provider":"zai","rolling_tokens": 100000, "weekly_limit_type":"hours", "weekly_limit_value": 1, "warn_pct": 0.8}
        }
    }`), 0o644)
	t.Setenv("CCP_QUOTAS_FILE", quotas)
	t.Setenv("CCP_DEV_ENABLE", "1")

	shim := startShimBasic(t)

	// First usage: 600 seconds (10 minutes)
	b1 := []byte(`{"model":"claude-haiku-4.5","in":10,"out":10,"seconds":600,"repeat":1}`)
	r1, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(b1))
	r1.Header.Set("content-type", "application/json")
	_, _ = http.DefaultClient.Do(r1)

	// Expect ~600/3600 = 0.1667
	var usage struct {
		Models map[string]struct {
			WeeklyPct float64 `json:"weekly_pct"`
		} `json:"models"`
	}
	u1, _ := http.Get(shim.URL + "/v1/usage")
	_ = json.NewDecoder(u1.Body).Decode(&usage)
	u1.Body.Close()
	if got := usage.Models["claude-haiku-4.5"].WeeklyPct; got < 0.15 || got > 0.19 {
		t.Fatalf("weekly hours pct want ~0.167, got %.3f", got)
	}

	// Wait so the first sample expires from weekly window
	time.Sleep(1200 * time.Millisecond)

	// Second usage: 60 seconds
	b2 := []byte(`{"model":"claude-haiku-4.5","in":10,"out":10,"seconds":60,"repeat":1}`)
	r2, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(b2))
	r2.Header.Set("content-type", "application/json")
	_, _ = http.DefaultClient.Do(r2)

	// Expect ~60/3600 = 0.0167
	u2, _ := http.Get(shim.URL + "/v1/usage")
	_ = json.NewDecoder(u2.Body).Decode(&usage)
	u2.Body.Close()
	if got := usage.Models["claude-haiku-4.5"].WeeklyPct; got < 0.015 || got > 0.02 {
		t.Fatalf("weekly hours pct want ~0.0167, got %.3f", got)
	}
}
