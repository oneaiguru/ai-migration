package main

import (
	"bytes"
	"encoding/json"
	"math"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

// helper to (re)start shim with quotas at path
func startShimWithQuotas(t *testing.T, quotasPath string) *httptest.Server {
	t.Helper()
	t.Setenv("CCP_QUOTAS_FILE", quotasPath)
	t.Setenv("CCP_DEV_ENABLE", "1")
	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	t.Cleanup(shim.Close)
	return shim
}

// loadExpected extracts the expected warn/block/rolling_pct from an expected usage fixture.
func loadExpected(t *testing.T, name string) (warn, block bool, rollingPct float64) {
	t.Helper()
	_, thisFile, _, _ := runtime.Caller(0)
	base := filepath.Dir(thisFile)
	p := filepath.Join(base, "testdata", "usage", name)
	b, err := os.ReadFile(p)
	if err != nil {
		t.Fatalf("read fixture %s: %v", name, err)
	}
	// Trim any trailing commentary after the first top-level JSON object
	b = firstJSONObject(b)
	var j struct {
		Models map[string]struct {
			Warn       bool    `json:"warn"`
			Block      bool    `json:"block"`
			RollingPct float64 `json:"rolling_pct"`
		} `json:"models"`
	}
	if err := json.Unmarshal(b, &j); err != nil {
		t.Fatalf("unmarshal %s: %v", name, err)
	}
	m := j.Models["claude-haiku-4.5"]
	return m.Warn, m.Block, m.RollingPct
}

// firstJSONObject returns the substring covering the first complete top-level JSON object.
func firstJSONObject(b []byte) []byte {
	// Find start '{'
	i := bytes.IndexByte(b, '{')
	if i < 0 {
		return b
	}
	depth := 0
	for j := i; j < len(b); j++ {
		switch b[j] {
		case '{':
			depth++
		case '}':
			depth--
			if depth == 0 {
				return b[i : j+1]
			}
		}
	}
	return b
}

type usageResponse struct {
	Models map[string]struct {
		RollingPct float64 `json:"rolling_pct"`
		Warn       bool    `json:"warn"`
		Block      bool    `json:"block"`
		Speeds     struct {
			Rolling struct {
				OutELR     float64 `json:"out_elr_tps"`
				OutDirty   float64 `json:"out_dirty_tps"`
				TotalDirty float64 `json:"total_dirty_tps"`
			} `json:"rolling"`
			Session struct {
				OutELR     float64 `json:"out_elr_tps"`
				OutDirty   float64 `json:"out_dirty_tps"`
				TotalDirty float64 `json:"total_dirty_tps"`
			} `json:"session"`
			TTFT struct {
				P50 float64 `json:"p50"`
				P90 float64 `json:"p90"`
				P99 float64 `json:"p99"`
			} `json:"ttft_ms"`
			Hourly []struct {
				Hour     int      `json:"hour"`
				Samples  int      `json:"samples"`
				OutELR   *float64 `json:"out_elr_tps"`
				OutDirty *float64 `json:"out_dirty_tps"`
			} `json:"hourly"`
		} `json:"speeds"`
	} `json:"models"`
}

func TestUsage_FromFixtures_50_Warn_Block(t *testing.T) {
	chdirTmp(t)
	// common quotas template
	quotasDir := t.TempDir()
	// Case 1: 50%
	q50 := filepath.Join(quotasDir, "q50.json")
	_ = os.WriteFile(q50, []byte(`{
        "windows": {"rolling_seconds": 3600, "weekly_seconds": 604800},
        "models": {"claude-haiku-4.5": {"provider":"zai","rolling_tokens": 1000, "weekly_limit_type":"tokens", "weekly_limit_value": 10000, "warn_pct": 0.8}}
    }`), 0o644)
	shim := startShimWithQuotas(t, q50)
	// 200+300 = 500 tokens → 50%
	body := []byte(`{"model":"claude-haiku-4.5","in":200,"out":300,"seconds":60}`)
	req, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body))
	req.Header.Set("content-type", "application/json")
	if resp, err := http.DefaultClient.Do(req); err != nil || resp.StatusCode != 200 {
		t.Fatalf("sim-usage 50%% failed: %v %d", err, resp.StatusCode)
	}
	// assert
	wantWarn, wantBlock, wantPct := loadExpected(t, "expected_usage_50.json")
	respU, _ := http.Get(shim.URL + "/v1/usage")
	var u usageResponse
	_ = json.NewDecoder(respU.Body).Decode(&u)
	respU.Body.Close()
	got := u.Models["claude-haiku-4.5"]
	if got.Warn != wantWarn || got.Block != wantBlock {
		t.Fatalf("50%% flags mismatch: want warn=%v block=%v got warn=%v block=%v", wantWarn, wantBlock, got.Warn, got.Block)
	}
	if got.RollingPct < (wantPct/100.0)-0.01 || got.RollingPct > (wantPct/100.0)+0.01 {
		t.Fatalf("50%% rolling_pct ~= %.2f, got %.3f", wantPct/100.0, got.RollingPct)
	}
	if math.Abs(got.Speeds.Rolling.OutDirty-5.0) > 0.05 {
		t.Fatalf("expected rolling out_dirty_tps ≈5.0, got %.2f", got.Speeds.Rolling.OutDirty)
	}
	if math.Abs(got.Speeds.Session.OutDirty-5.0) > 0.05 {
		t.Fatalf("expected session out_dirty_tps ≈5.0, got %.2f", got.Speeds.Session.OutDirty)
	}
	if math.Abs(got.Speeds.Rolling.TotalDirty-8.33) > 0.1 {
		t.Fatalf("expected rolling total_dirty_tps ≈8.33, got %.2f", got.Speeds.Rolling.TotalDirty)
	}
	if math.Abs(got.Speeds.TTFT.P50) > 0.1 {
		t.Fatalf("expected ttft p50 ≈0 for non-stream, got %.2f", got.Speeds.TTFT.P50)
	}

	// Case 2: warn (~85%) — fresh server to avoid prior samples
	qWarn := filepath.Join(quotasDir, "qwarn.json")
	_ = os.WriteFile(qWarn, []byte(`{
        "windows": {"rolling_seconds": 3600, "weekly_seconds": 604800},
        "models": {"claude-haiku-4.5": {"provider":"zai","rolling_tokens": 1000, "weekly_limit_type":"tokens", "weekly_limit_value": 100000, "warn_pct": 0.8}}
    }`), 0o644)
	shim2 := startShimWithQuotas(t, qWarn)
	b2 := []byte(`{"model":"claude-haiku-4.5","in":425,"out":425,"seconds":90}`) // 850 tokens total → 0.85
	rq2, _ := http.NewRequest("POST", shim2.URL+"/v1/dev/sim-usage", bytes.NewReader(b2))
	rq2.Header.Set("content-type", "application/json")
	if r, err := http.DefaultClient.Do(rq2); err != nil || r.StatusCode != 200 {
		t.Fatalf("sim-usage warn failed: %v %d", err, r.StatusCode)
	}
	wantWarn, wantBlock, wantPct = loadExpected(t, "expected_usage_warn.json")
	u = usageResponse{}
	u2, _ := http.Get(shim2.URL + "/v1/usage")
	_ = json.NewDecoder(u2.Body).Decode(&u)
	u2.Body.Close()
	got = u.Models["claude-haiku-4.5"]
	if got.Warn != wantWarn || got.Block != wantBlock {
		t.Fatalf("warn flags mismatch: want warn=%v block=%v got warn=%v block=%v", wantWarn, wantBlock, got.Warn, got.Block)
	}
	if got.RollingPct < (wantPct/100.0)-0.02 || got.RollingPct > (wantPct/100.0)+0.02 {
		t.Fatalf("warn rolling_pct ~= %.2f, got %.3f", wantPct/100.0, got.RollingPct)
	}
	if math.Abs(got.Speeds.Rolling.OutDirty-(425.0/90.0)) > 0.05 {
		t.Fatalf("expected warn rolling out_dirty_tps ≈%.2f, got %.2f", 425.0/90.0, got.Speeds.Rolling.OutDirty)
	}

	// Case 3: block (>=100%) — fresh server
	qBlock := filepath.Join(quotasDir, "qblock.json")
	_ = os.WriteFile(qBlock, []byte(`{
        "windows": {"rolling_seconds": 3600, "weekly_seconds": 604800},
        "models": {"claude-haiku-4.5": {"provider":"zai","rolling_tokens": 1000, "weekly_limit_type":"tokens", "weekly_limit_value": 100000, "warn_pct": 0.8}}
    }`), 0o644)
	shim3 := startShimWithQuotas(t, qBlock)
	b3 := []byte(`{"model":"claude-haiku-4.5","in":500,"out":500,"seconds":120}`) // 1000 tokens total → 1.0
	rq3, _ := http.NewRequest("POST", shim3.URL+"/v1/dev/sim-usage", bytes.NewReader(b3))
	rq3.Header.Set("content-type", "application/json")
	if r, err := http.DefaultClient.Do(rq3); err != nil || r.StatusCode != 200 {
		t.Fatalf("sim-usage block failed: %v %d", err, r.StatusCode)
	}
	wantWarn, wantBlock, wantPct = loadExpected(t, "expected_usage_block.json")
	u = usageResponse{}
	u3, _ := http.Get(shim3.URL + "/v1/usage")
	_ = json.NewDecoder(u3.Body).Decode(&u)
	u3.Body.Close()
	got = u.Models["claude-haiku-4.5"]
	if got.Warn != wantWarn || got.Block != wantBlock {
		t.Fatalf("block flags mismatch: want warn=%v block=%v got warn=%v block=%v", wantWarn, wantBlock, got.Warn, got.Block)
	}
	if got.RollingPct < (wantPct/100.0)-0.02 || got.RollingPct > (wantPct/100.0)+0.02 {
		t.Fatalf("block rolling_pct ~= %.2f, got %.3f", wantPct/100.0, got.RollingPct)
	}
	if math.Abs(got.Speeds.Rolling.OutDirty-(500.0/120.0)) > 0.05 {
		t.Fatalf("expected block rolling out_dirty_tps ≈%.2f, got %.2f", 500.0/120.0, got.Speeds.Rolling.OutDirty)
	}
}
