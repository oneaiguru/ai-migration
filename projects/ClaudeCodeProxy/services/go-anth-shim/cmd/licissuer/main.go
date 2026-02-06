package main

import (
	"crypto/ed25519"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"math"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
)

type inviteConfig struct {
	Plan           string   `json:"plan"`
	Features       []string `json:"features"`
	TTLDays        int      `json:"ttl_days"`
	MaxRedemptions int      `json:"max_redemptions"`
	Redeemed       int      `json:"redeemed"`
	ExpiresAt      string   `json:"expires_at"`
}

type inviteState struct {
	cfg       inviteConfig
	expiresAt time.Time
}

type issueRequest struct {
	InviteCode string `json:"invite_code"`
	Email      string `json:"email"`
	Device     string `json:"device"`
}

type issueResponse struct {
	License     json.RawMessage `json:"license"`
	SigB64      string          `json:"sigB64"`
	LicensePack string          `json:"license_pack"`
	PubKeyB64   string          `json:"pubKeyB64"`
	Plan        string          `json:"plan"`
	Features    []string        `json:"features"`
	Exp         int64           `json:"exp"`
}

type deviceState struct {
	Code        string    `json:"code"`
	PollToken   string    `json:"poll_token"`
	LicensePack string    `json:"license_pack"`
	ExpiresAt   time.Time `json:"expires_at"`
	Ready       bool      `json:"ready"`
}

type server struct {
	addr   string
	kid    string
	pubB64 string
	priv   ed25519.PrivateKey

	mu               sync.Mutex
	invites          map[string]*inviteState
	invitesStatePath string
	deviceStates     map[string]*deviceState
	deviceStatePath  string
	authorizeBase    string

	rateMu sync.Mutex
	rate   map[string]*rateState
}

type rateState struct {
	count int
	reset time.Time
}

const (
	rateWindow       = time.Minute
	rateMaxPerWindow = 30
)

func clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func (s *server) allowRequest(ip string) bool {
	if ip == "" {
		ip = "unknown"
	}
	now := time.Now()
	s.rateMu.Lock()
	defer s.rateMu.Unlock()
	state, ok := s.rate[ip]
	if !ok || now.After(state.reset) {
		s.rate[ip] = &rateState{count: 1, reset: now.Add(rateWindow)}
		return true
	}
	if state.count >= rateMaxPerWindow {
		return false
	}
	state.count++
	return true
}

func (s *server) rateGuard(w http.ResponseWriter, r *http.Request) bool {
	if s.allowRequest(clientIP(r)) {
		return true
	}
	w.Header().Set("retry-after", fmt.Sprintf("%.0f", rateWindow.Seconds()))
	http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
	return false
}

func main() {
	addr := flag.String("addr", ":8787", "listen address")
	kid := flag.String("kid", envOr("LICISSUER_KID", "2025-10-22-a"), "license key id")
	seed := flag.String("seed", os.Getenv("PRIVATE_SEED_B64"), "base64 ed25519 seed (32 bytes)")
	invitesPath := flag.String("invites", os.Getenv("LICISSUER_INVITES"), "path to invite config JSON")
	flag.Parse()

	if *seed == "" {
		log.Fatal("PRIVATE_SEED_B64 or --seed must be provided")
	}
	priv, pubB64, err := deriveKey(*seed)
	if err != nil {
		log.Fatalf("derive key: %v", err)
	}

	invites, err := loadInvites(*invitesPath)
	if err != nil {
		log.Fatalf("load invites: %v", err)
	}
	statePath := envOr("LICISSUER_INVITES_STATE", "invites_state.json")
	deviceStatePath := envOr("LICISSUER_DEVICE_STATE", "device_state.json")
	deviceStates, err := loadDeviceStates(deviceStatePath)
	if err != nil {
		log.Printf("load device state: %v", err)
		deviceStates = map[string]*deviceState{}
	}
	authorizeBase := envOr("LICISSUER_AUTHORIZE_BASE", "https://example.com/activate")

	srv := &server{
		addr:             *addr,
		kid:              *kid,
		pubB64:           pubB64,
		priv:             priv,
		invites:          invites,
		invitesStatePath: statePath,
		deviceStates:     deviceStates,
		deviceStatePath:  deviceStatePath,
		authorizeBase:    authorizeBase,
		rate:             map[string]*rateState{},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})
	mux.HandleFunc("/v1/license/issue", srv.handleIssue)
	mux.HandleFunc("/v1/device/begin", srv.handleDeviceBegin)
	mux.HandleFunc("/v1/device/poll", srv.handleDevicePoll)

	log.Printf("licissuer listening on %s (kid=%s invites=%d)", srv.addr, srv.kid, len(srv.invites))
	if err := http.ListenAndServe(srv.addr, logRequest(mux)); err != nil {
		log.Fatalf("serve: %v", err)
	}
}

func encodeLicensePack(lic json.RawMessage, sig []byte) (string, string, error) {
	sigB64 := base64.StdEncoding.EncodeToString(sig)
	packBytes, err := json.Marshal(struct {
		License   json.RawMessage `json:"license"`
		Signature string          `json:"signature"`
	}{License: lic, Signature: sigB64})
	if err != nil {
		return "", "", err
	}
	return sigB64, string(packBytes), nil
}

func (s *server) handleIssue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if !s.rateGuard(w, r) {
		return
	}
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req issueRequest
	if err := json.Unmarshal(body, &req); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if req.InviteCode == "" {
		http.Error(w, "invite_code required", http.StatusBadRequest)
		return
	}

	licData, sig, plan, feats, exp, err := s.issue(req)
	if err != nil {
		var status int
		switch {
		case errors.Is(err, errInviteNotFound):
			status = http.StatusNotFound
		case errors.Is(err, errInviteExpired):
			status = http.StatusGone
		case errors.Is(err, errInviteExhausted):
			status = http.StatusConflict
		default:
			status = http.StatusInternalServerError
		}
		http.Error(w, err.Error(), status)
		return
	}

	sigB64, pack, err := encodeLicensePack(licData, sig)
	if err != nil {
		http.Error(w, "failed to encode license pack", http.StatusInternalServerError)
		return
	}
	resp := issueResponse{
		License:     licData,
		SigB64:      sigB64,
		LicensePack: pack,
		PubKeyB64:   s.pubB64,
		Plan:        plan,
		Features:    feats,
		Exp:         exp,
	}

	w.Header().Set("content-type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

type deviceBeginRequest struct {
	InviteCode  string `json:"invite_code"`
	Email       string `json:"email"`
	Device      string `json:"device"`
	RedirectURL string `json:"redirect_url"`
}

type devicePollRequest struct {
	PollToken string `json:"poll_token"`
}

func (s *server) handleDeviceBegin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if !s.rateGuard(w, r) {
		return
	}
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req deviceBeginRequest
	if len(body) > 0 {
		if err := json.Unmarshal(body, &req); err != nil {
			http.Error(w, "invalid json", http.StatusBadRequest)
			return
		}
	}
	if strings.TrimSpace(req.InviteCode) == "" {
		req.InviteCode = "DEV-TRIAL-7D"
	}

	licData, sig, plan, feats, exp, err := s.issue(issueRequest{InviteCode: req.InviteCode, Email: req.Email, Device: req.Device})
	if err != nil {
		var status int
		switch {
		case errors.Is(err, errInviteNotFound):
			status = http.StatusNotFound
		case errors.Is(err, errInviteExpired):
			status = http.StatusGone
		case errors.Is(err, errInviteExhausted):
			status = http.StatusConflict
		default:
			status = http.StatusInternalServerError
		}
		http.Error(w, err.Error(), status)
		return
	}

	_, pack, err := encodeLicensePack(licData, sig)
	if err != nil {
		http.Error(w, "failed to encode license pack", http.StatusInternalServerError)
		return
	}

	code := generateUserCode()
	pollToken := randomNonce()
	expires := time.Now().Add(10 * time.Minute)
	state := &deviceState{
		Code:        code,
		PollToken:   pollToken,
		LicensePack: pack,
		ExpiresAt:   expires,
		Ready:       true,
	}

	s.mu.Lock()
	s.deviceStates[pollToken] = state
	if err := saveDeviceStates(s.deviceStatePath, s.deviceStates); err != nil {
		log.Printf("save device state: %v", err)
	}
	s.mu.Unlock()

	authURL := s.authorizeURLFor(code, req.RedirectURL)
	resp := map[string]any{
		"user_code":     code,
		"poll_token":    pollToken,
		"authorize_url": authURL,
		"interval":      2,
		"expires_in":    int(time.Until(expires).Seconds()),
		"plan":          plan,
		"features":      feats,
		"exp":           exp,
	}
	w.Header().Set("content-type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (s *server) handleDevicePoll(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if !s.rateGuard(w, r) {
		return
	}
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var req devicePollRequest
	if err := json.Unmarshal(body, &req); err != nil {
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"error": "invalid json"})
		return
	}
	if strings.TrimSpace(req.PollToken) == "" {
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"error": "poll_token required"})
		return
	}

	s.mu.Lock()
	state, ok := s.deviceStates[req.PollToken]
	if !ok {
		s.mu.Unlock()
		w.Header().Set("content-type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]any{"status": "not_found"})
		return
	}
	now := time.Now()
	if now.After(state.ExpiresAt) {
		delete(s.deviceStates, req.PollToken)
		if err := saveDeviceStates(s.deviceStatePath, s.deviceStates); err != nil {
			log.Printf("save device state: %v", err)
		}
		s.mu.Unlock()
		w.Header().Set("content-type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"status": "expired"})
		return
	}
	if !state.Ready {
		s.mu.Unlock()
		w.Header().Set("content-type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"status": "pending"})
		return
	}
	pack := state.LicensePack
	delete(s.deviceStates, req.PollToken)
	if err := saveDeviceStates(s.deviceStatePath, s.deviceStates); err != nil {
		log.Printf("save device state: %v", err)
	}
	s.mu.Unlock()

	w.Header().Set("content-type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"status": "ok", "license_pack": pack})
}

var (
	errInviteNotFound  = errors.New("invalid invite")
	errInviteExpired   = errors.New("invite expired")
	errInviteExhausted = errors.New("invite exhausted")
)

func (s *server) issue(req issueRequest) (json.RawMessage, []byte, string, []string, int64, error) {
	now := time.Now()

	s.mu.Lock()
	defer s.mu.Unlock()

	inv, ok := s.invites[req.InviteCode]
	if !ok {
		return nil, nil, "", nil, 0, errInviteNotFound
	}
	if !inv.expiresAt.IsZero() && now.After(inv.expiresAt) {
		return nil, nil, "", nil, 0, errInviteExpired
	}
	if inv.cfg.MaxRedemptions > 0 && inv.cfg.Redeemed >= inv.cfg.MaxRedemptions {
		return nil, nil, "", nil, 0, errInviteExhausted
	}

	ttl := inv.cfg.TTLDays
	if ttl <= 0 {
		ttl = 7
	}
	exp := now.Add(time.Duration(ttl) * 24 * time.Hour)
	if !inv.expiresAt.IsZero() {
		if exp.After(inv.expiresAt) {
			exp = inv.expiresAt
		}
	}

	lic := map[string]any{
		"schema":   "ccp.license.v1",
		"sub":      chooseSub(req.Email),
		"plan":     inv.cfg.Plan,
		"features": inv.cfg.Features,
		"exp":      exp.Unix(),
		"device":   nonEmpty(req.Device),
		"iat":      now.Unix(),
		"kid":      s.kid,
		"nonce":    randomNonce(),
	}

	data, err := json.Marshal(lic)
	if err != nil {
		return nil, nil, "", nil, 0, fmt.Errorf("marshal license: %w", err)
	}
	sig := ed25519.Sign(s.priv, data)

	inv.cfg.Redeemed++
	s.invites[req.InviteCode] = inv
	if err := saveInvites(s.invitesStatePath, s.invites); err != nil {
		log.Printf("save invites: %v", err)
	}
	log.Printf("issued license invite=%s plan=%s exp=%s", req.InviteCode, inv.cfg.Plan, exp.UTC().Format(time.RFC3339))

	return json.RawMessage(data), sig, inv.cfg.Plan, inv.cfg.Features, exp.Unix(), nil
}

func deriveKey(seedB64 string) (ed25519.PrivateKey, string, error) {
	seed, err := base64.StdEncoding.DecodeString(seedB64)
	if err != nil {
		return nil, "", fmt.Errorf("decode seed: %w", err)
	}
	if len(seed) != ed25519.SeedSize {
		return nil, "", fmt.Errorf("seed must be %d bytes", ed25519.SeedSize)
	}
	priv := ed25519.NewKeyFromSeed(seed)
	pub := priv.Public().(ed25519.PublicKey)
	return priv, base64.StdEncoding.EncodeToString(pub), nil
}

func loadInvites(path string) (map[string]*inviteState, error) {
	invites := map[string]*inviteState{}
	if path == "" {
		invites["DEV-TRIAL-7D"] = &inviteState{cfg: inviteConfig{
			Plan: "trial", Features: []string{"zai_offload"}, TTLDays: 7, MaxRedemptions: math.MaxInt,
		}}
		return invites, nil
	}
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var parsed map[string]inviteConfig
	if err := json.Unmarshal(data, &parsed); err != nil {
		return nil, err
	}
	for code, cfg := range parsed {
		st := &inviteState{cfg: cfg}
		if cfg.ExpiresAt != "" {
			if ts, err := time.Parse(time.RFC3339, cfg.ExpiresAt); err == nil {
				st.expiresAt = ts
			} else {
				return nil, fmt.Errorf("invite %s: invalid expires_at: %w", code, err)
			}
		}
		if len(cfg.Features) == 0 {
			st.cfg.Features = []string{"zai_offload"}
		}
		if st.cfg.Plan == "" {
			st.cfg.Plan = "trial"
		}
		invites[code] = st
	}
	return invites, nil
}

func saveInvites(path string, invites map[string]*inviteState) error {
	if path == "" {
		return nil
	}
	snapshot := make(map[string]inviteConfig, len(invites))
	for code, st := range invites {
		snapshot[code] = st.cfg
	}
	data, err := json.MarshalIndent(snapshot, "", "  ")
	if err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

type deviceStateDisk struct {
	Code        string `json:"code"`
	LicensePack string `json:"license_pack"`
	ExpiresAt   string `json:"expires_at"`
	Ready       bool   `json:"ready"`
}

func loadDeviceStates(path string) (map[string]*deviceState, error) {
	states := map[string]*deviceState{}
	if path == "" {
		return states, nil
	}
	data, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return states, nil
		}
		return nil, err
	}
	var parsed map[string]deviceStateDisk
	if err := json.Unmarshal(data, &parsed); err != nil {
		return nil, err
	}
	for token, d := range parsed {
		exp, err := time.Parse(time.RFC3339, d.ExpiresAt)
		if err != nil {
			continue
		}
		states[token] = &deviceState{
			Code:        d.Code,
			PollToken:   token,
			LicensePack: d.LicensePack,
			ExpiresAt:   exp,
			Ready:       d.Ready,
		}
	}
	return states, nil
}

func saveDeviceStates(path string, states map[string]*deviceState) error {
	if path == "" {
		return nil
	}
	disk := make(map[string]deviceStateDisk, len(states))
	for token, st := range states {
		disk[token] = deviceStateDisk{
			Code:        st.Code,
			LicensePack: st.LicensePack,
			ExpiresAt:   st.ExpiresAt.UTC().Format(time.RFC3339),
			Ready:       st.Ready,
		}
	}
	data, err := json.MarshalIndent(disk, "", "  ")
	if err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func chooseSub(email string) string {
	if email != "" {
		return email
	}
	return "anon:" + randomNonce()
}

func nonEmpty(v string) any {
	if v == "" {
		return nil
	}
	return v
}

func randomNonce() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return base64.RawURLEncoding.EncodeToString(b)
}

func generateUserCode() string {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	buf := make([]byte, 8)
	if _, err := rand.Read(buf); err != nil {
		panic(err)
	}
	for i := range buf {
		buf[i] = alphabet[int(buf[i])%len(alphabet)]
	}
	return fmt.Sprintf("%s-%s-%s-%s", buf[0:2], buf[2:4], buf[4:6], buf[6:8])
}

func (s *server) authorizeURL(code string) string {
	return formatAuthorizeURL(s.authorizeBase, code)
}

func (s *server) authorizeURLFor(code, override string) string {
	override = strings.TrimSpace(override)
	if override != "" {
		return formatAuthorizeURL(override, code)
	}
	return s.authorizeURL(code)
}

func formatAuthorizeURL(template, code string) string {
	template = strings.TrimSpace(template)
	if template == "" {
		return ""
	}
	escaped := url.QueryEscape(code)
	if strings.Contains(template, "%s") {
		return fmt.Sprintf(template, escaped)
	}
	if strings.Contains(template, "{code}") {
		return strings.ReplaceAll(template, "{code}", escaped)
	}
	u, err := url.Parse(template)
	if err != nil {
		return template
	}
	q := u.Query()
	q.Set("code", code)
	u.RawQuery = q.Encode()
	return u.String()
}

func logRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		lrw := &loggingResponseWriter{ResponseWriter: w, status: 200}
		next.ServeHTTP(lrw, r)
		log.Printf("%s %s status=%d dur=%s", r.Method, r.URL.Path, lrw.status, time.Since(start))
	})
}

type loggingResponseWriter struct {
	http.ResponseWriter
	status int
}

func (l *loggingResponseWriter) WriteHeader(statusCode int) {
	l.status = statusCode
	l.ResponseWriter.WriteHeader(statusCode)
}
