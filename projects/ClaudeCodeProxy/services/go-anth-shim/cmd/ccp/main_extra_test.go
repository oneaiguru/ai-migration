package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// readUsage reads JSONL entries from logs/usage.jsonl into a slice of maps.
func readUsage(t *testing.T) []map[string]any {
	t.Helper()
	b, err := os.ReadFile(filepath.Join("logs", "usage.jsonl"))
	if err != nil {
		return nil
	}
	var out []map[string]any
	for _, line := range bytes.Split(b, []byte("\n")) {
		if len(bytes.TrimSpace(line)) == 0 {
			continue
		}
		var m map[string]any
		if json.Unmarshal(line, &m) == nil {
			out = append(out, m)
		}
	}
	return out
}

func TestInvalidJSON_Returns400(t *testing.T) {
	chdirTmp(t)
	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", strings.NewReader("{not:json"))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("request failed: %v", err)
	}
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("want 400, got %d", resp.StatusCode)
	}
}

func TestLoadProviderCatalogPrecedence(t *testing.T) {
	chdirTmp(t)
	root := t.TempDir()
	projectDir := filepath.Join(root, "configs")
	if err := os.MkdirAll(projectDir, 0o755); err != nil {
		t.Fatalf("mkdir project: %v", err)
	}
	projectFile := filepath.Join(projectDir, "providers.yaml")
	mustWrite(t, projectFile, "providers:\n  anth:\n    key_env: PROJ_KEY\n    base_url: https://project.example.com\n")

	homeDir := filepath.Join(t.TempDir(), "home")
	t.Setenv("HOME", homeDir)
	userFile := filepath.Join(homeDir, ".config", "ccp", "providers.yaml")
	if err := os.MkdirAll(filepath.Dir(userFile), 0o755); err != nil {
		t.Fatalf("mkdir user: %v", err)
	}
	mustWrite(t, userFile, "providers:\n  anth:\n    key_env: USER_KEY\n    base_url: https://user.example.com\n")

	t.Setenv("CCP_PROVIDERS_FILE", "")
	cat, path, err := loadProviderCatalog(defaultProviderPaths(root))
	if err != nil {
		t.Fatalf("load user/project catalog failed: %v", err)
	}
	if path != userFile {
		t.Fatalf("expected user path %q, got %q", userFile, path)
	}
	if got := cat.Providers["anth"].BaseURL; got != "https://user.example.com" {
		t.Fatalf("expected user base_url, got %q", got)
	}

	envFile := filepath.Join(root, "env.yaml")
	mustWrite(t, envFile, "providers:\n  anth:\n    key_env: ENV_KEY\n    base_url: https://env.example.com\n")
	t.Setenv("CCP_PROVIDERS_FILE", envFile)
	cat, path, err = loadProviderCatalog(defaultProviderPaths(root))
	if err != nil {
		t.Fatalf("load env catalog failed: %v", err)
	}
	if path != envFile {
		t.Fatalf("expected env path %q, got %q", envFile, path)
	}
	if got := cat.Providers["anth"].BaseURL; got != "https://env.example.com" {
		t.Fatalf("expected env base_url, got %q", got)
	}
}

func TestLoadProviderCatalogInvalid(t *testing.T) {
	chdirTmp(t)
	root := t.TempDir()
	invalid := filepath.Join(root, "bad.yaml")
	mustWrite(t, invalid, "providers: []\n")
	t.Setenv("CCP_PROVIDERS_FILE", invalid)
	_, _, err := loadProviderCatalog(defaultProviderPaths(root))
	if err == nil {
		t.Fatalf("expected error for invalid catalog")
	}
}

func TestAnthropicVersion_FromEnvIsPropagated(t *testing.T) {
	chdirTmp(t)
	os.Setenv("ANTH_VERSION", "2023-06-01")
	t.Cleanup(func() { os.Unsetenv("ANTH_VERSION") })

	var got string
	anth := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got = r.Header.Get("anthropic-version")
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":1,"output_tokens":2}}`)
	}))
	defer anth.Close()

	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-sonnet-4.5", false)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("anthropic request failed: %v %d", err, resp.StatusCode)
	}
	if got != "2023-06-01" {
		t.Fatalf("anthropic-version not propagated, got %q", got)
	}
}

func TestManualOverrideWins(t *testing.T) {
	chdirTmp(t)
	home := filepath.Join(t.TempDir(), "home")
	t.Setenv("HOME", home)
	if err := os.MkdirAll(filepath.Join(home, ".config", "ccp"), 0o755); err != nil {
		t.Fatalf("mk home: %v", err)
	}
	mustWrite(t, filepath.Join(home, ".config", "ccp", "model"), "claude-sonnet-4.5\n")

	var anthHits, zaiHits int
	anth := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		anthHits++
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":1,"output_tokens":1}}`)
	}))
	defer anth.Close()

	zai := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		zaiHits++
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":1,"output_tokens":1}}`)
	}))
	defer zai.Close()

	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("request failed: %v %d", err, resp.StatusCode)
	}
	if anthHits == 0 || zaiHits != 0 {
		t.Fatalf("manual override should hit anth only (anthHits=%d zaiHits=%d)", anthHits, zaiHits)
	}

	time.Sleep(20 * time.Millisecond)
	entries := readUsage(t)
	foundDecision := false
	for _, m := range entries {
		if ev, _ := m["event"].(string); ev == "decision" {
			if dec, _ := m["decision"].(string); dec == "manual_override" {
				foundDecision = true
			}
		}
	}
	if !foundDecision {
		t.Fatalf("expected manual_override decision entry, entries=%v", entries)
	}
}

func TestAnthropicAuth_PassthroughAndEnvFallback(t *testing.T) {
	chdirTmp(t)

	// Case A: client Authorization passed through
	var authA string
	anthA := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authA = r.Header.Get("Authorization")
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":1,"output_tokens":1}}`)
	}))
	defer anthA.Close()

	zai, _ := mockUpstreamJSON(t)
	shimA := startShimAgainst(t, anthA.URL, zai.URL)
	defer shimA.Close()

	reqA, _ := http.NewRequest("POST", shimA.URL+"/v1/messages", bytes.NewReader(body("claude-sonnet-4.5", false)))
	reqA.Header.Set("content-type", "application/json")
	reqA.Header.Set("authorization", "Bearer client-token")
	respA, err := http.DefaultClient.Do(reqA)
	if err != nil || respA.StatusCode != 200 {
		t.Fatalf("anthA failed: %v %d", err, respA.StatusCode)
	}
	if !strings.HasPrefix(authA, "Bearer client-token") {
		t.Fatalf("client Authorization not passed, got %q", authA)
	}

	// Case B: env fallback when client Authorization missing
	chdirTmp(t)
	os.Setenv("ANTHROPIC_AUTH_TOKEN", "server-token")
	t.Cleanup(func() { os.Unsetenv("ANTHROPIC_AUTH_TOKEN") })

	var authB string
	anthB := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authB = r.Header.Get("Authorization")
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":1,"output_tokens":1}}`)
	}))
	defer anthB.Close()

	shimB := startShimAgainst(t, anthB.URL, zai.URL)
	defer shimB.Close()

	reqB, _ := http.NewRequest("POST", shimB.URL+"/v1/messages", bytes.NewReader(body("claude-sonnet-4.5", false)))
	reqB.Header.Set("content-type", "application/json")
	respB, err := http.DefaultClient.Do(reqB)
	if err != nil || respB.StatusCode != 200 {
		t.Fatalf("anthB failed: %v %d", err, respB.StatusCode)
	}
	if !strings.HasPrefix(authB, "Bearer server-token") {
		t.Fatalf("env Authorization not set, got %q", authB)
	}
}

func TestZAI_HeaderMode_AuthorizationAndDefault(t *testing.T) {
	chdirTmp(t)
	os.Setenv("ZAI_API_KEY", "k")
	t.Cleanup(func() { os.Unsetenv("ZAI_API_KEY") })

	// Authorization mode
	os.Setenv("ZAI_HEADER_MODE", "authorization")
	var auth string
	zaiAuth := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth = r.Header.Get("Authorization")
		if r.Header.Get("x-api-key") != "" {
			t.Fatalf("x-api-key should not be set in authorization mode")
		}
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":1,"output_tokens":1}}`)
	}))
	defer zaiAuth.Close()
	anth, _ := mockUpstreamJSON(t)
	shimAuth := startShimAgainst(t, anth.URL, zaiAuth.URL)
	defer shimAuth.Close()

	reqA, _ := http.NewRequest("POST", shimAuth.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	reqA.Header.Set("content-type", "application/json")
	respA, err := http.DefaultClient.Do(reqA)
	if err != nil || respA.StatusCode != 200 {
		t.Fatalf("zai auth-mode failed: %v %d", err, respA.StatusCode)
	}
	if !strings.HasPrefix(auth, "Bearer k") {
		t.Fatalf("authorization header not set correctly: %q", auth)
	}

	// Default mode (x-api-key)
	chdirTmp(t)
	os.Unsetenv("ZAI_HEADER_MODE")
	var xk string
	zaiKey := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		xk = r.Header.Get("x-api-key")
		if r.Header.Get("Authorization") != "" {
			t.Fatalf("Authorization should not be set in x-api-key mode")
		}
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":1,"output_tokens":1}}`)
	}))
	defer zaiKey.Close()
	shimKey := startShimAgainst(t, anth.URL, zaiKey.URL)
	defer shimKey.Close()
	reqB, _ := http.NewRequest("POST", shimKey.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	reqB.Header.Set("content-type", "application/json")
	respB, err := http.DefaultClient.Do(reqB)
	if err != nil || respB.StatusCode != 200 {
		t.Fatalf("zai x-api-key failed: %v %d", err, respB.StatusCode)
	}
	if xk != "k" {
		t.Fatalf("x-api-key header not set correctly: %q", xk)
	}
}

func TestH1Toggle_SetsH2FalseInLogs(t *testing.T) {
	chdirTmp(t)
	os.Setenv("ZAI_API_KEY", "k")
	os.Setenv("MITM_FORCE_H1", "1")
	t.Cleanup(func() { os.Unsetenv("ZAI_API_KEY"); os.Unsetenv("MITM_FORCE_H1") })

	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("request failed: %v %d", err, resp.StatusCode)
	}
	entries := readUsage(t)
	if len(entries) == 0 {
		t.Fatal("no usage entries")
	}
	sawH2False := false
	for _, m := range entries {
		if v, ok := m["h2"].(bool); ok && v == false {
			sawH2False = true
		}
	}
	if !sawH2False {
		t.Fatalf("expected some entries with h2=false when MITM_FORCE_H1=1")
	}
}

func TestBackoff_On429LogsOvershootAndCooldown(t *testing.T) {
	chdirTmp(t)
	os.Setenv("ZAI_API_KEY", "k")
	os.Setenv("SHIM_ENABLE_BACKOFF", "1")
	t.Cleanup(func() { os.Unsetenv("ZAI_API_KEY"); os.Unsetenv("SHIM_ENABLE_BACKOFF") })

	anth, _ := mockUpstreamJSON(t)
	// ZAI upstream returns 429
	zai := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(429)
	}))
	defer zai.Close()

	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	_, _ = http.DefaultClient.Do(req)

	entries := readUsage(t)
	var sawOvershoot bool
	for _, m := range entries {
		if dr, _ := m["decision_reason"].(string); dr == "quota_overshoot" {
			sawOvershoot = true
			if lane, _ := m["lane"].(string); lane != "anthropic" && lane != "zai" {
				t.Fatalf("unexpected lane on overshoot entry: %v", lane)
			}
		}
	}
	if !sawOvershoot {
		t.Fatalf("expected quota_overshoot decision in usage log")
	}
}

func TestDecision_IncludesHeaderModeOnZai(t *testing.T) {
	chdirTmp(t)
	os.Setenv("ZAI_API_KEY", "k")
	os.Setenv("ZAI_HEADER_MODE", "authorization")
	t.Cleanup(func() { os.Unsetenv("ZAI_API_KEY"); os.Unsetenv("ZAI_HEADER_MODE") })

	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	_, _ = http.DefaultClient.Do(req)

	time.Sleep(10 * time.Millisecond)
	entries := readUsage(t)
	hasDecision := false
	for _, m := range entries {
		if ev, _ := m["event"].(string); ev == "decision" {
			hasDecision = true
			if hm, _ := m["header_mode"].(string); hm != "authorization" {
				t.Fatalf("decision.header_mode expected 'authorization', got %q", hm)
			}
		}
	}
	if !hasDecision {
		t.Fatalf("no decision event found")
	}
}

func TestDecisionEvent_PrecedesCompletion_WithSameRID(t *testing.T) {
	chdirTmp(t)
	os.Setenv("ZAI_API_KEY", "k")
	t.Cleanup(func() { os.Unsetenv("ZAI_API_KEY") })

	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("request failed: %v %d", err, resp.StatusCode)
	}

	entries := readUsage(t)
	var rid string
	var sawDecision, sawCompletion bool
	for _, m := range entries {
		if ev, _ := m["event"].(string); ev == "decision" {
			if s, ok := m["rid"].(string); ok {
				rid = s
			}
			sawDecision = true
			if int(m["status"].(float64)) != -1 {
				t.Fatalf("decision status must be -1: %+v", m)
			}
		}
		if m["status"] == float64(200) && m["lane"] == "zai" {
			sawCompletion = true
			if rid != "" && m["rid"] != rid {
				t.Fatalf("rid mismatch decision=%s completion=%v", rid, m["rid"])
			}
		}
	}
	if !sawDecision || !sawCompletion {
		t.Fatalf("missing decision or completion: decision=%v completion=%v", sawDecision, sawCompletion)
	}
}

func TestSSE_ReasonAndOpInUsageLog(t *testing.T) {
	chdirTmp(t)
	os.Setenv("ZAI_API_KEY", "k")
	t.Cleanup(func() { os.Unsetenv("ZAI_API_KEY") })

	// SSE on Z.AI lane
	sse := mockUpstreamSSE(t)
	anth, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, sse.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", true)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("sse req err: %v", err)
	}
	if ct := resp.Header.Get("content-type"); !strings.Contains(ct, "text/event-stream") {
		t.Fatalf("expected SSE content-type, got %q", ct)
	}
	// Wait briefly for logging
	time.Sleep(30 * time.Millisecond)

	entries := readUsage(t)
	var completion map[string]any
	for _, m := range entries {
		if m["lane"] == "zai" && m["status"] == float64(200) {
			completion = m
			break
		}
	}
	if completion == nil {
		t.Fatal("no SSE completion entry logged")
	}
	if completion["reason"] != "streaming" || completion["op"] != "stream" {
		t.Fatalf("stream reason/op not set: %+v", completion)
	}
}

func TestQuotaBlock_EnforcesRerouteToAnthropic(t *testing.T) {
	chdirTmp(t)
	// Tiny rolling limit so we can exceed 100%
	quotas := filepath.Join(t.TempDir(), "quotas.json")
	mustWrite(t, quotas, `{"windows":{"rolling_seconds":3600,"weekly_seconds":604800},"models":{"claude-haiku-4.5":{"provider":"zai","rolling_tokens": 100, "weekly_limit_type":"tokens","weekly_limit_value": 100000, "warn_pct": 0.8}}}`)
	t.Setenv("CCP_QUOTAS_FILE", quotas)
	t.Setenv("CCP_DEV_ENABLE", "1")
	t.Setenv("ZAI_API_KEY", "k")
	defer os.Unsetenv("ZAI_API_KEY")

	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	// Preload usage to exceed 100%: 120 tokens
	body := []byte(`{"model":"claude-haiku-4.5","in":60,"out":60,"repeat":1}`)
	req, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body))
	req.Header.Set("content-type", "application/json")
	if resp, err := http.DefaultClient.Do(req); err != nil || resp.StatusCode != 200 {
		t.Fatalf("sim-usage failed: %v %d", err, resp.StatusCode)
	}

	// Now send a request that would normally go to Z.AI; expect run-to-limit decision
	r2, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(bodyJSON()))
	r2.Header.Set("content-type", "application/json")
	resp2, err := http.DefaultClient.Do(r2)
	if err != nil || resp2.StatusCode != 200 {
		t.Fatalf("request failed: %v %d", err, resp2.StatusCode)
	}

	// Verify decision log shows quota_block with reroute to Anthropic lane
	time.Sleep(20 * time.Millisecond)
	entries := readUsage(t)
	sawBlock := false
	sawAnthCompletion := false
	for _, m := range entries {
		if ev, _ := m["event"].(string); ev == "decision" {
			lane, _ := m["lane"].(string)
			dec, _ := m["decision"].(string)
			if dec == "quota_block" && lane == "anthropic" {
				sawBlock = true
			}
		}
		if lane, _ := m["lane"].(string); lane == "anthropic" {
			if status, ok := m["status"].(float64); ok && int(status) == 200 {
				sawAnthCompletion = true
			}
		}
	}
	if !sawBlock || !sawAnthCompletion {
		t.Fatalf("expected quota_block decision and anthropic completion; decision=%v completion=%v", sawBlock, sawAnthCompletion)
	}
}

func TestRerouteModePreemptiveWarn(t *testing.T) {
	chdirTmp(t)
	quotas := filepath.Join(t.TempDir(), "quotas.json")
	mustWrite(t, quotas, `{"windows":{"rolling_seconds":3600,"weekly_seconds":604800},"models":{"claude-haiku-4.5":{"provider":"zai","rolling_tokens": 200, "weekly_limit_type":"tokens","weekly_limit_value": 100000, "warn_pct": 0.6}}}`)
	t.Setenv("CCP_QUOTAS_FILE", quotas)
	t.Setenv("CCP_DEV_ENABLE", "1")
	t.Setenv("ZAI_API_KEY", "k")
	t.Setenv("CCP_REROUTE_MODE", "preemptive")
	defer os.Unsetenv("ZAI_API_KEY")

	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	// prefill usage to exceed warn_pct but below block
	body := []byte(`{"model":"claude-haiku-4.5","in":100,"out":20,"repeat":1}`)
	req, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body))
	req.Header.Set("content-type", "application/json")
	if resp, err := http.DefaultClient.Do(req); err != nil || resp.StatusCode != 200 {
		t.Fatalf("sim usage failed: %v %d", err, resp.StatusCode)
	}

	r, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(bodyJSON()))
	r.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(r)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("request failed: %v %d", err, resp.StatusCode)
	}

	time.Sleep(20 * time.Millisecond)
	entries := readUsage(t)
	found := false
	for _, m := range entries {
		if ev, _ := m["event"].(string); ev == "decision" {
			lane, _ := m["lane"].(string)
			dec, _ := m["decision"].(string)
			if dec == "quota_preemptive_warn" && lane == "anthropic" {
				found = true
			}
		}
	}
	if !found {
		t.Fatalf("expected quota_preemptive_warn decision to anthropic lane")
	}
}

func TestRerouteModeRunToCapKeepsPreferred(t *testing.T) {
	chdirTmp(t)
	quotas := filepath.Join(t.TempDir(), "quotas.json")
	mustWrite(t, quotas, `{"windows":{"rolling_seconds":3600,"weekly_seconds":604800},"models":{"claude-haiku-4.5":{"provider":"zai","rolling_tokens": 200, "weekly_limit_type":"tokens","weekly_limit_value": 100000, "warn_pct": 0.6}}}`)
	t.Setenv("CCP_QUOTAS_FILE", quotas)
	t.Setenv("CCP_DEV_ENABLE", "1")
	t.Setenv("ZAI_API_KEY", "k")
	t.Setenv("CCP_REROUTE_MODE", "run2cap")
	defer os.Unsetenv("ZAI_API_KEY")

	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	body := []byte(`{"model":"claude-haiku-4.5","in":100,"out":20,"repeat":1}`)
	req, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body))
	req.Header.Set("content-type", "application/json")
	_, _ = http.DefaultClient.Do(req)

	r, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(bodyJSON()))
	r.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(r)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("request failed: %v %d", err, resp.StatusCode)
	}

	time.Sleep(20 * time.Millisecond)
	entries := readUsage(t)
	found := false
	for _, m := range entries {
		if ev, _ := m["event"].(string); ev == "decision" {
			lane, _ := m["lane"].(string)
			dec, _ := m["decision"].(string)
			if dec == "quota_run_to_limit" && lane == "zai" {
				found = true
			}
		}
	}
	if !found {
		t.Fatalf("expected quota_run_to_limit decision on zai lane")
	}
}

func TestRerouteModeHybridWarnAttempt(t *testing.T) {
	chdirTmp(t)
	quotas := filepath.Join(t.TempDir(), "quotas.json")
	mustWrite(t, quotas, `{"windows":{"rolling_seconds":3600,"weekly_seconds":604800},"models":{"claude-haiku-4.5":{"provider":"zai","rolling_tokens": 200, "weekly_limit_type":"tokens","weekly_limit_value": 100000, "warn_pct": 0.6}}}`)
	t.Setenv("CCP_QUOTAS_FILE", quotas)
	t.Setenv("CCP_DEV_ENABLE", "1")
	t.Setenv("ZAI_API_KEY", "k")
	t.Setenv("CCP_REROUTE_MODE", "hybrid")
	defer os.Unsetenv("ZAI_API_KEY")

	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	body := []byte(`{"model":"claude-haiku-4.5","in":100,"out":20,"repeat":1}`)
	req, _ := http.NewRequest("POST", shim.URL+"/v1/dev/sim-usage", bytes.NewReader(body))
	req.Header.Set("content-type", "application/json")
	_, _ = http.DefaultClient.Do(req)

	r, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(bodyJSON()))
	r.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(r)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("request failed: %v %d", err, resp.StatusCode)
	}

	time.Sleep(20 * time.Millisecond)
	entries := readUsage(t)
	found := false
	for _, m := range entries {
		if ev, _ := m["event"].(string); ev == "decision" {
			lane, _ := m["lane"].(string)
			dec, _ := m["decision"].(string)
			if dec == "quota_warn_attempt" && lane == "zai" {
				found = true
			}
		}
	}
	if !found {
		t.Fatalf("expected quota_warn_attempt decision on zai lane")
	}
}

// bodyJSON returns a minimal Anthropic-style JSON body for haiku
func bodyJSON() []byte {
	m := map[string]any{"model": "claude-haiku-4.5", "max_tokens": 8, "messages": []map[string]any{{"role": "user", "content": "ok"}}}
	b, _ := json.Marshal(m)
	return b
}

func TestReadyzCatalogError(t *testing.T) {
	chdirTmp(t)
	bad := filepath.Join(t.TempDir(), "bad.yaml")
	mustWrite(t, bad, "providers: []\n")
	t.Setenv("CCP_PROVIDERS_FILE", bad)

	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	resp, err := http.Get(shim.URL + "/readyz")
	if err != nil {
		t.Fatalf("readyz request failed: %v", err)
	}
	if resp.StatusCode != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", resp.StatusCode)
	}
	var body map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("decode readyz: %v", err)
	}
	if _, ok := body["error"].(string); !ok {
		t.Fatalf("expected error field in readyz payload: %+v", body)
	}
}

func TestFallbackRetryDoesNotLeakZaiHeaders(t *testing.T) {
	chdirTmp(t)
	t.Setenv("ZAI_API_KEY", "secret")
	defer os.Unsetenv("ZAI_API_KEY")

	var anthAuth, anthAPI string
	anthHits := 0
	anth := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		anthAuth = r.Header.Get("Authorization")
		anthAPI = r.Header.Get("x-api-key")
		anthHits++
		w.WriteHeader(200)
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":1,"output_tokens":1}}`)
	}))
	defer anth.Close()

	zai := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(503)
	}))
	defer zai.Close()

	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("fallback req failed: %v %d", err, resp.StatusCode)
	}

	if anthHits != 1 {
		t.Fatalf("expected anth fallback call once, hits=%d", anthHits)
	}

	if anthAPI != "" {
		t.Fatalf("x-api-key leaked to anth lane: %q", anthAPI)
	}
	if strings.Contains(strings.ToLower(anthAuth), "x-api-key") {
		t.Fatalf("authorization leak on anth lane: %q", anthAuth)
	}

	time.Sleep(50 * time.Millisecond)
	entries := readUsage(t)
	sawFallback := false
	for _, m := range entries {
		if ev, _ := m["event"].(string); ev == "decision" {
			if dec, _ := m["decision"].(string); dec == "fallback" {
				sawFallback = true
			}
		}
	}
	if !sawFallback {
		t.Fatalf("expected fallback decision, entries=%v", entries)
	}
}

func TestSSEIdleTimeoutLogsTimeout(t *testing.T) {
	chdirTmp(t)
	t.Setenv("ZAI_API_KEY", "k")
	t.Setenv("CCP_SSE_IDLE_TIMEOUT", "50ms")

	stalled := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "text/event-stream")
		if fl, ok := w.(http.Flusher); ok {
			fl.Flush()
		}
		time.Sleep(200 * time.Millisecond)
	}))
	defer stalled.Close()

	anth, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, stalled.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", true)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("sse idle req err: %v", err)
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()

	time.Sleep(100 * time.Millisecond)
	entries := readUsage(t)
	var found bool
	for _, m := range entries {
		if lane, _ := m["lane"].(string); lane == "zai" {
			if reason, _ := m["reason"].(string); reason == "stream_timeout" {
				if errType, _ := m["err_type"].(string); errType == "idle_timeout" {
					found = true
				}
			}
		}
	}
	if !found {
		t.Fatalf("expected stream_timeout entry, entries=%v", entries)
	}
}

func mustWrite(t *testing.T, path, contents string) {
	t.Helper()
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("mkdir %s: %v", filepath.Dir(path), err)
	}
	if err := os.WriteFile(path, []byte(contents), 0o644); err != nil {
		t.Fatalf("write %s: %v", path, err)
	}
}
