package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"
	"time"
)

type usageEntry struct {
	Ts           float64 `json:"ts"`
	Rid          string  `json:"rid"`
	Lane         string  `json:"lane"`
	Model        string  `json:"model"`
	InputTokens  int     `json:"input_tokens"`
	OutputTokens int     `json:"output_tokens"`
	Status       int     `json:"status"`
	Reason       string  `json:"reason"`
	Op           string  `json:"op"`
	LatencyMs    int     `json:"latency_ms"`
	ErrType      string  `json:"err_type"`
	Upstream     string  `json:"upstream"`
	H2           bool    `json:"h2"`
	HeaderMode   string  `json:"header_mode,omitempty"`
	Retry        bool    `json:"retry,omitempty"`
	BackoffMs    int     `json:"backoff_ms,omitempty"`
	Event        string  `json:"event,omitempty"`
	Decision     string  `json:"decision,omitempty"`
}

func appendUsage(e usageEntry) {
	os.MkdirAll("logs", 0755)
	f, err := os.OpenFile("logs/usage.jsonl", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return
	}
	defer f.Close()
	b, _ := json.Marshal(e)
	f.Write(b)
	f.Write([]byte("\n"))
}

func appendAnomaly(m map[string]any) {
	os.MkdirAll("logs", 0755)
	f, err := os.OpenFile("logs/anomalies.jsonl", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return
	}
	defer f.Close()
	b, _ := json.Marshal(m)
	f.Write(b)
	f.Write([]byte("\n"))
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

type server struct {
	port          int
	anthropicBase *url.URL
	zaiBase       *url.URL
	cliAnth       *http.Client
	cliZai        *http.Client
	cliAnthJSON   *http.Client
	cliZaiJSON    *http.Client
	zaiKey        string
	zaiHeaderMode string
	forceHaiku    bool
	paused        bool
	forceH1       bool
}

func newServer(port int) *server {
	anth, _ := url.Parse("https://api.anthropic.com")
	zai, _ := url.Parse("https://api.z.ai/api/anthropic")
	if v := os.Getenv("ANTHROPIC_BASE_URL"); v != "" {
		anth, _ = url.Parse(v)
	}
	if v := os.Getenv("ZAI_BASE_URL"); v != "" {
		zai, _ = url.Parse(v)
	}

	forceH1 := os.Getenv("MITM_FORCE_H1") == "1"
	tr := &http.Transport{MaxIdleConns: 200, MaxIdleConnsPerHost: 200, IdleConnTimeout: 90 * time.Second, ForceAttemptHTTP2: !forceH1, DisableCompression: true}
	cliStream := &http.Client{Transport: tr, Timeout: 0}
	cliJSON := &http.Client{Transport: tr, Timeout: 60 * time.Second}

	return &server{
		port:          port,
		anthropicBase: anth,
		zaiBase:       zai,
		cliAnth:       cliStream,
		cliZai:        cliStream,
		cliAnthJSON:   cliJSON,
		cliZaiJSON:    cliJSON,
		zaiKey:        os.Getenv("ZAI_API_KEY"),
		zaiHeaderMode: strings.ToLower(os.Getenv("ZAI_HEADER_MODE")),
		forceHaiku:    os.Getenv("FORCE_HAIKU_TO_ZAI") == "1",
		paused:        os.Getenv("OFFLOAD_PAUSED") == "1",
		forceH1:       forceH1,
	}
}

func (s *server) decideLane(model string) string {
	m := strings.ToLower(strings.TrimSpace(model))
	if s.paused {
		return "anthropic"
	}
	if strings.Contains(m, "sonnet") || strings.Contains(m, "opus") {
		return "anthropic"
	}
	if strings.Contains(m, "haiku") && (s.forceHaiku || true) { // model-based default
		if s.zaiKey != "" {
			return "zai"
		}
		return "anthropic"
	}
	return "anthropic"
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
	lane := s.decideLane(model)

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
	appendUsage(usageEntry{
		Ts:         float64(time.Now().UnixNano()) / 1e9,
		Rid:        rid,
		Lane:       lane,
		Model:      model,
		Status:     -1,
		Event:      "decision",
		Decision:   decision,
		Upstream:   upstream,
		H2:         os.Getenv("MITM_FORCE_H1") != "1",
		HeaderMode: decHeaderMode,
	})

	// Build upstream request
	req, err := http.NewRequest("POST", u.String(), bytes.NewReader(buf.Bytes()))
	if err != nil {
		http.Error(w, "upstream req failed", 500)
		return
	}
	// Headers: start fresh
	req.Header.Set("content-type", "application/json")
	req.Header.Set("anthropic-version", anthropicVersion(r.Header))
	// Auth header selection
	if lane == "zai" {
		if strings.ToLower(s.zaiHeaderMode) == "authorization" {
			req.Header.Set("authorization", "Bearer "+s.zaiKey)
		} else {
			req.Header.Set("x-api-key", s.zaiKey)
		}
	} else {
		// pass through Anthropic auth from client if present
		if v := r.Header.Get("authorization"); v != "" {
			req.Header.Set("authorization", v)
		} else if v := os.Getenv("ANTHROPIC_AUTH_TOKEN"); v != "" {
			req.Header.Set("authorization", "Bearer "+v)
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
		if lane == "zai" {
			return s.cliZaiJSON.Do(req)
		}
		return s.cliAnthJSON.Do(req)
	}()
	if err != nil {
		http.Error(w, "upstream error", 502)
		return
	}

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
		resp, err = s.cliZaiJSON.Do(req)
		if err != nil {
			http.Error(w, "upstream error", 502)
			return
		}
	}
	defer resp.Body.Close()

	// Copy headers that matter
	ct := resp.Header.Get("content-type")
	if ct != "" {
		w.Header().Set("content-type", ct)
	}
	w.WriteHeader(resp.StatusCode)

	inputTok, outputTok := 0, 0
	if strings.Contains(ct, "text/event-stream") || stream {
		// SSE passthrough with flush
		fl, _ := w.(http.Flusher)
		reader := bufio.NewReader(resp.Body)
		for {
			chunk, err := reader.ReadBytes('\n')
			if len(chunk) > 0 {
				w.Write(chunk)
				if fl != nil {
					fl.Flush()
				}
			}
			if err != nil {
				break
			}
		}
	} else {
		// JSON body; try to copy and parse usage
		var jbuf bytes.Buffer
		io.Copy(&jbuf, resp.Body)
		w.Write(jbuf.Bytes())
		var j map[string]any
		if json.Unmarshal(jbuf.Bytes(), &j) == nil {
			if u, ok := j["usage"].(map[string]any); ok {
				if v, ok := u["input_tokens"].(float64); ok {
					inputTok = int(v)
				}
				if v, ok := u["output_tokens"].(float64); ok {
					outputTok = int(v)
				}
			}
		}
	}

	// Usage log
	latency := int(time.Since(t0).Milliseconds())
	reason := "ok"
	op := "nonstream"
	if strings.Contains(ct, "text/event-stream") || stream {
		reason = "streaming"
		op = "stream"
	}
	// Optional backoff record simulation: if 429/503 and SHIM_ENABLE_BACKOFF=1
	backoffMs := 0
	if os.Getenv("SHIM_ENABLE_BACKOFF") == "1" && lane == "zai" && op == "nonstream" && (resp.StatusCode == 429 || resp.StatusCode == 503) {
		delay := time.Duration((200 + rand.Intn(400))) * time.Millisecond
		backoffMs = int(delay / time.Millisecond)
		appendAnomaly(map[string]any{"ts": float64(time.Now().UnixNano()) / 1e9, "rid": rid, "event": "backoff", "status": resp.StatusCode, "delay_s": float64(backoffMs) / 1000.0, "lane": lane, "model": model})
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
	appendUsage(usageEntry{
		Ts:           float64(time.Now().UnixNano()) / 1e9,
		Rid:          rid,
		Lane:         lane,
		Model:        model,
		InputTokens:  inputTok,
		OutputTokens: outputTok,
		Status:       resp.StatusCode,
		Reason:       reason,
		Op:           op,
		LatencyMs:    latency,
		ErrType: func() string {
			if resp.StatusCode >= 400 {
				if resp.StatusCode == 401 {
					return "401"
				} else if resp.StatusCode == 429 {
					return "429"
				} else if resp.StatusCode >= 500 {
					return "5xx"
				} else {
					return "4xx"
				}
			}
			return ""
		}(),
		Upstream:   upstream,
		H2:         os.Getenv("MITM_FORCE_H1") != "1",
		HeaderMode: headerMode,
		Retry:      retried,
		BackoffMs:  backoffMs,
	})
}

func (s *server) routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200); w.Write([]byte("ok")) })
	mux.HandleFunc("/v1/messages", s.handleMessages)
	return mux
}

func main() {
	// support optional subcommand 'serve'
	var port int
	if len(os.Args) > 1 && os.Args[1] == "serve" {
		fs := flag.NewFlagSet("serve", flag.ExitOnError)
		fs.IntVar(&port, "port", 8082, "listen port")
		fs.Parse(os.Args[2:])
	} else {
		flag.IntVar(&port, "port", 8082, "listen port")
		flag.Parse()
	}
	s := newServer(port)
	addr := fmt.Sprintf(":%d", s.port)
	log.Printf("ccp listening on %s (anth=%s zai=%s)", addr, s.anthropicBase, s.zaiBase)
	srv := &http.Server{Addr: addr, Handler: s.routes()}
	log.Fatal(srv.ListenAndServe())
}
