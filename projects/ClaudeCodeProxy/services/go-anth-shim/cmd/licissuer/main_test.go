package main

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/local/ccp-shim/license"
)

func TestHandleIssueReturnsLicensePack(t *testing.T) {
	pub, priv, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}
	invites := map[string]*inviteState{
		"DEV-TRIAL-7D": {
			cfg: inviteConfig{
				Plan:           "trial",
				Features:       []string{"zai_offload"},
				TTLDays:        7,
				MaxRedemptions: 5,
			},
		},
	}
	tmp := t.TempDir()
	srv := &server{
		kid:              "test",
		pubB64:           base64.StdEncoding.EncodeToString(pub),
		priv:             priv,
		invites:          invites,
		invitesStatePath: filepath.Join(tmp, "invites_state.json"),
		rate:             map[string]*rateState{},
	}

	req := httptest.NewRequest("POST", "/v1/license/issue", strings.NewReader(`{"invite_code":"DEV-TRIAL-7D","email":"test@example.com"}`))
	req.Header.Set("content-type", "application/json")
	rr := httptest.NewRecorder()

	srv.handleIssue(rr, req)

	if rr.Code != 200 {
		t.Fatalf("unexpected status: %d body=%s", rr.Code, rr.Body.String())
	}
	var resp issueResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if resp.LicensePack == "" {
		t.Fatal("expected license_pack in response")
	}
	var pack struct {
		License   json.RawMessage `json:"license"`
		Signature string          `json:"signature"`
	}
	if err := json.Unmarshal([]byte(resp.LicensePack), &pack); err != nil {
		t.Fatalf("decode pack: %v", err)
	}
	claims, err := license.VerifyBytes(map[string]string{"test": srv.pubB64}, pack.License, pack.Signature, time.Now(), "")
	if err != nil {
		t.Fatalf("verify pack: %v", err)
	}
	if claims.Plan != "trial" || !license.HasFeature(claims, "zai_offload") {
		t.Fatalf("unexpected claims: %+v", claims)
	}
	data, err := os.ReadFile(srv.invitesStatePath)
	if err != nil {
		t.Fatalf("read invites state: %v", err)
	}
	var saved map[string]inviteConfig
	if err := json.Unmarshal(data, &saved); err != nil {
		t.Fatalf("decode saved invites: %v", err)
	}
	if saved["DEV-TRIAL-7D"].Redeemed != 1 {
		t.Fatalf("expected redeemed counter to persist, got %+v", saved["DEV-TRIAL-7D"])
	}
}

func TestDeviceBeginAndPoll(t *testing.T) {
	pub, priv, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}
	invites := map[string]*inviteState{
		"DEV-TRIAL-7D": {
			cfg: inviteConfig{
				Plan:           "trial",
				Features:       []string{"zai_offload"},
				TTLDays:        7,
				MaxRedemptions: 5,
			},
		},
	}
	tmp := t.TempDir()
	statePath := filepath.Join(tmp, "device_state.json")
	srv := &server{
		kid:              "test",
		pubB64:           base64.StdEncoding.EncodeToString(pub),
		priv:             priv,
		invites:          invites,
		invitesStatePath: filepath.Join(tmp, "invites_state.json"),
		deviceStates:     map[string]*deviceState{},
		deviceStatePath:  statePath,
		authorizeBase:    "https://example.com/activate",
		rate:             map[string]*rateState{},
	}

	redirectURL := "http://127.0.0.1:5555/callback?code=%s"
	beginReq := httptest.NewRequest("POST", "/v1/device/begin", strings.NewReader(`{"invite_code":"DEV-TRIAL-7D","email":"test@example.com","redirect_url":"`+redirectURL+`"}`))
	beginReq.Header.Set("content-type", "application/json")
	beginRec := httptest.NewRecorder()

	srv.handleDeviceBegin(beginRec, beginReq)

	if beginRec.Code != 200 {
		t.Fatalf("device begin status=%d body=%s", beginRec.Code, beginRec.Body.String())
	}
	var beginResp struct {
		UserCode     string `json:"user_code"`
		PollToken    string `json:"poll_token"`
		Plan         string `json:"plan"`
		AuthorizeURL string `json:"authorize_url"`
	}
	if err := json.Unmarshal(beginRec.Body.Bytes(), &beginResp); err != nil {
		t.Fatalf("decode begin: %v", err)
	}
	if beginResp.UserCode == "" || beginResp.PollToken == "" {
		t.Fatalf("missing begin fields: %+v", beginResp)
	}
	if beginResp.Plan != "trial" {
		t.Fatalf("unexpected plan: %+v", beginResp)
	}
	expectedURL := formatAuthorizeURL(redirectURL, beginResp.UserCode)
	if beginResp.AuthorizeURL != expectedURL {
		t.Fatalf("authorize url mismatch: got %s want %s", beginResp.AuthorizeURL, expectedURL)
	}
	if _, err := os.Stat(statePath); err != nil {
		t.Fatalf("device state file missing: %v", err)
	}

	pollReq := httptest.NewRequest("POST", "/v1/device/poll", strings.NewReader(`{"poll_token":"`+beginResp.PollToken+`"}`))
	pollReq.Header.Set("content-type", "application/json")
	pollRec := httptest.NewRecorder()

	srv.handleDevicePoll(pollRec, pollReq)

	if pollRec.Code != 200 {
		t.Fatalf("device poll status=%d body=%s", pollRec.Code, pollRec.Body.String())
	}
	var pollResp struct {
		Status      string `json:"status"`
		LicensePack string `json:"license_pack"`
	}
	if err := json.Unmarshal(pollRec.Body.Bytes(), &pollResp); err != nil {
		t.Fatalf("decode poll: %v", err)
	}
	if pollResp.Status != "ok" || pollResp.LicensePack == "" {
		t.Fatalf("unexpected poll response: %+v", pollResp)
	}
	var pack struct {
		License   json.RawMessage `json:"license"`
		Signature string          `json:"signature"`
	}
	if err := json.Unmarshal([]byte(pollResp.LicensePack), &pack); err != nil {
		t.Fatalf("decode pack: %v", err)
	}
	claims, err := license.VerifyBytes(map[string]string{"test": srv.pubB64}, pack.License, pack.Signature, time.Now(), "")
	if err != nil {
		t.Fatalf("verify license pack: %v", err)
	}
	if !license.HasFeature(claims, "zai_offload") {
		t.Fatalf("license pack missing feature: %+v", claims)
	}
	data, err := os.ReadFile(statePath)
	if err != nil {
		t.Fatalf("read device state: %v", err)
	}
	var remaining map[string]deviceStateDisk
	if err := json.Unmarshal(data, &remaining); err != nil {
		t.Fatalf("decode device state: %v", err)
	}
	if len(remaining) != 0 {
		t.Fatalf("expected device state to clear, got %v", remaining)
	}
}

func TestRateLimitExceeded(t *testing.T) {
	pub, priv, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}
	invites := map[string]*inviteState{
		"DEV-TRIAL": {
			cfg: inviteConfig{
				Plan:     "trial",
				Features: []string{"zai_offload"},
			},
		},
	}
	tmp := t.TempDir()
	srv := &server{
		kid:              "test",
		pubB64:           base64.StdEncoding.EncodeToString(pub),
		priv:             priv,
		invites:          invites,
		invitesStatePath: filepath.Join(tmp, "invites_state.json"),
		rate:             map[string]*rateState{},
	}

	makeReq := func() *httptest.ResponseRecorder {
		req := httptest.NewRequest("POST", "/v1/license/issue", strings.NewReader(`{"invite_code":"DEV-TRIAL"}`))
		req.Header.Set("content-type", "application/json")
		rec := httptest.NewRecorder()
		srv.handleIssue(rec, req)
		return rec
	}

	for i := 0; i < rateMaxPerWindow; i++ {
		rec := makeReq()
		if rec.Code != http.StatusOK {
			t.Fatalf("unexpected status during warmup: %d body=%s", rec.Code, rec.Body.String())
		}
	}
	// Next request should be rate limited
	rec := makeReq()
	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 after exceeding window, got %d", rec.Code)
	}
}
