package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

func TestReadyz_OK_and_AuthFail(t *testing.T) {
	chdirTmp(t)
	// Anth returns 200 to OPTIONS; ZAI returns 401 to OPTIONS
	anth := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(200) }))
	defer anth.Close()
	zai := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { w.WriteHeader(401) }))
	defer zai.Close()

	pol, err := parsePolicy([]byte(defaultPolicyJSON))
	if err != nil {
		t.Fatalf("parse policy: %v", err)
	}
	s := newServer(0, pol, nil)
	au, _ := url.Parse(anth.URL)
	zu, _ := url.Parse(zai.URL)
	s.anthropicBase = au
	s.zaiBase = zu
	shim := httptest.NewServer(s.routes())
	defer shim.Close()

	resp, err := http.Get(shim.URL + "/readyz")
	if err != nil {
		t.Fatalf("/readyz err: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		t.Fatalf("/readyz status=%d", resp.StatusCode)
	}
	var out struct {
		Providers map[string]struct {
			Ok     bool `json:"ok"`
			Status int  `json:"status"`
		} `json:"providers"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		t.Fatalf("decode readyz: %v", err)
	}
	if p := out.Providers["anth"]; !p.Ok || p.Status != 200 {
		t.Fatalf("anth not ready: %+v", p)
	}
	// current semantics: 200–405 considered OK; 401 yields Ok=true, Status=401
	if p := out.Providers["zai"]; !p.Ok || p.Status != 401 {
		t.Fatalf("zai expected authfail reachable: %+v", p)
	}

	// Keep fixtures around for human diff/reference
	// Keep fixtures present for reference (path anchored to this file)
	_, thisFile, _, _ := runtime.Caller(0)
	base := filepath.Dir(thisFile)
	_, _ = os.ReadFile(filepath.Join(base, "testdata", "readyz", "expected_readyz_ok.json"))
	_, _ = os.ReadFile(filepath.Join(base, "testdata", "readyz", "expected_readyz_authfail.json"))
}
