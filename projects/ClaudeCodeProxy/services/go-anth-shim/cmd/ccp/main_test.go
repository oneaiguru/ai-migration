package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/local/ccp-shim/license"
)

func chdirTmp(t *testing.T) string {
    t.Helper()
    tmp := t.TempDir()
    if err := os.Chdir(tmp); err != nil {
        t.Fatal(err)
    }
    // Ensure logs are written under this temp dir, not a global CCP_LOGS_DIR
    t.Setenv("CCP_LOGS_DIR", "")
    return tmp
}

func mockUpstreamJSON(t *testing.T) (*httptest.Server, *bytes.Buffer) {
	t.Helper()
	var seen bytes.Buffer
	s := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		io.Copy(&seen, r.Body)
		defer r.Body.Close()
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":5,"output_tokens":9},"content":[{"type":"text","text":"ok"}]}`)
	}))
	t.Cleanup(s.Close)
	return s, &seen
}

func mockUpstreamSSE(t *testing.T) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("content-type", "text/event-stream")
		fl, _ := w.(http.Flusher)
		for i := 0; i < 5; i++ {
			io.WriteString(w, "data: {\"delta\":\"w\"}\n\n")
			if fl != nil {
				fl.Flush()
			}
			time.Sleep(5 * time.Millisecond)
		}
	}))
}

func body(model string, stream bool) []byte {
	m := map[string]any{
		"model":      model,
		"max_tokens": 8,
		"messages":   []map[string]any{{"role": "user", "content": "ok"}},
	}
	if stream {
		m["stream"] = true
	}
	b, _ := json.Marshal(m)
	return b
}

func startShimAgainst(t *testing.T, anthURL, zaiURL string) *httptest.Server {
	t.Helper()
	pol, err := parsePolicy([]byte(defaultPolicyJSON))
	if err != nil {
		t.Fatalf("parse default policy: %v", err)
	}
	s := newServer(0, pol, &license.Claims{Features: []string{"zai_offload"}})
	au, _ := url.Parse(anthURL)
	zu, _ := url.Parse(zaiURL)
	s.anthropicBase = au
	s.zaiBase = zu
	return httptest.NewServer(s.routes())
}

func TestRoute_HaikuToZAI_SonnetToAnthropic(t *testing.T) {
	chdirTmp(t)
	t.Setenv("ZAI_API_KEY", "k")
	anth, anthSeen := mockUpstreamJSON(t)
	zai, zaiSeen := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("haiku->zai failed: %v %d", err, resp.StatusCode)
	}
	if zaiSeen.Len() == 0 {
		t.Fatal("expected ZAI upstream to receive body")
	}

	req2, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-sonnet-4.5", false)))
	req2.Header.Set("content-type", "application/json")
	resp2, err := http.DefaultClient.Do(req2)
	if err != nil || resp2.StatusCode != 200 {
		t.Fatalf("sonnet->anth failed: %v %d", err, resp2.StatusCode)
	}
	if anthSeen.Len() == 0 {
		t.Fatal("expected Anth upstream to receive body")
	}
}

func TestHeaderHygiene_NoZaiHeaderOnAnthropic(t *testing.T) {
	chdirTmp(t)
	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-sonnet-4.5", false)))
	req.Header.Set("content-type", "application/json")
	req.Header.Set("authorization", "Bearer client")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("anth request failed: %v %d", err, resp.StatusCode)
	}

	b, _ := os.ReadFile(filepath.Join("logs", "usage.jsonl"))
	if !bytes.Contains(b, []byte(`"lane":"anthropic"`)) {
		t.Fatal("no anthropic lane log")
	}
	if bytes.Contains(b, []byte(`"lane":"anthropic"`)) && bytes.Contains(b, []byte(`"header_mode":"x-api-key"`)) {
		t.Fatal("zai header_mode leaked on anthropic lane")
	}
}

func Test401Fallback_ZaiHeaderModeFlip(t *testing.T) {
	chdirTmp(t)
	// ZAI upstream: first 401 unless Authorization present; then 200
	var seen int
	zai := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		seen++
		if seen == 1 && r.Header.Get("Authorization") == "" {
			w.WriteHeader(401)
			return
		}
		w.Header().Set("content-type", "application/json")
		io.WriteString(w, `{"usage":{"input_tokens":1,"output_tokens":1}}`)
	}))
	defer zai.Close()
	anth, _ := mockUpstreamJSON(t)
	// Set initial header mode to x-api-key so first attempt 401s
	t.Setenv("ZAI_HEADER_MODE", "x-api-key")
	t.Setenv("ZAI_API_KEY", "k")
	shim := startShimAgainst(t, anth.URL, zai.URL)
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("zai 401 fallback failed: %v %d", err, resp.StatusCode)
	}
	if seen < 2 {
		t.Fatalf("expected retry, seen=%d", seen)
	}
}

func TestSSEPassthrough(t *testing.T) {
	chdirTmp(t)
	t.Setenv("ZAI_API_KEY", "k")
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
	var lines int
	sc := bufio.NewScanner(resp.Body)
	for sc.Scan() {
		if strings.HasPrefix(sc.Text(), "data:") {
			lines++
		}
	}
	if lines < 3 {
		t.Fatalf("expected multiple SSE data lines, got %d", lines)
	}
}

func TestPaused_FailsOverToAnthropic(t *testing.T) {
	chdirTmp(t)
	anth, _ := mockUpstreamJSON(t)
	zai, _ := mockUpstreamJSON(t)
	pol, err := parsePolicy([]byte(defaultPolicyJSON))
	if err != nil {
		t.Fatalf("parse default policy: %v", err)
	}
	s := newServer(0, pol, &license.Claims{Features: []string{"zai_offload"}})
	au, _ := url.Parse(anth.URL)
	zu, _ := url.Parse(zai.URL)
	s.anthropicBase = au
	s.zaiBase = zu
	s.paused = true
	shim := httptest.NewServer(s.routes())
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("paused failover failed: %v %d", err, resp.StatusCode)
	}
	b, _ := os.ReadFile(filepath.Join("logs", "usage.jsonl"))
	if !bytes.Contains(b, []byte(`"lane":"anthropic"`)) {
		t.Fatal("expected anthropic lane in paused mode")
	}
}

func TestLicenseBlocksZAI(t *testing.T) {
	chdirTmp(t)
	t.Setenv("ZAI_API_KEY", "k")
	anth, anthSeen := mockUpstreamJSON(t)
	zai, zaiSeen := mockUpstreamJSON(t)
	pol, err := parsePolicy([]byte(defaultPolicyJSON))
	if err != nil {
		t.Fatalf("parse default policy: %v", err)
	}
	s := newServer(0, pol, nil)
	au, _ := url.Parse(anth.URL)
	zu, _ := url.Parse(zai.URL)
	s.anthropicBase = au
	s.zaiBase = zu
	shim := httptest.NewServer(s.routes())
	defer shim.Close()

	req, _ := http.NewRequest("POST", shim.URL+"/v1/messages", bytes.NewReader(body("claude-haiku-4.5", false)))
	req.Header.Set("content-type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		t.Fatalf("request failed: %v %d", err, resp.StatusCode)
	}
	if anthSeen.Len() == 0 {
		t.Fatalf("expected anthropic upstream to receive body")
	}
	if zaiSeen.Len() != 0 {
		t.Fatalf("expected no ZAI calls when license missing")
	}
	logData, _ := os.ReadFile(filepath.Join("logs", "usage.jsonl"))
	if !bytes.Contains(logData, []byte(`"decision":"license_block"`)) {
		t.Fatalf("expected license_block decision in log")
	}
}
