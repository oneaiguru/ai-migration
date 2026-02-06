package main

import (
	"context"
	"crypto/ed25519"
	"encoding/base64"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestPolicyLoaderRemote(t *testing.T) {
	chdirTmp(t)
	pub, priv, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}

	policyJSON := []byte(`{"version":"test","expiresAt":"2030-01-01T00:00:00Z","routing":[{"pattern":"*","lane":"anth"}],"providers":{}}`)
	sig := ed25519.Sign(priv, policyJSON)
	encodedSig := base64.StdEncoding.EncodeToString(sig)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/policy.json":
			w.Write(policyJSON)
		case "/policy.json.sig":
			w.Write([]byte(encodedSig))
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	cachePath := filepath.Join("logs", "policy-cache.json")
	loader := newPolicyLoader(server.URL+"/policy.json", pub, cachePath)
	pol, err := loader.Load(context.Background())
	if err != nil {
		t.Fatalf("load remote policy: %v", err)
	}
	if pol.Version != "test" {
		t.Fatalf("unexpected version: %s", pol.Version)
	}
	if _, err := os.Stat(cachePath); err != nil {
		t.Fatalf("expected cache file: %v", err)
	}
}

func TestPolicyLoaderFallsBackToCache(t *testing.T) {
	chdirTmp(t)
	pub, _, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}

	cachePath := filepath.Join("logs", "policy-cache.json")
	if err := os.MkdirAll(filepath.Dir(cachePath), 0o755); err != nil {
		t.Fatalf("mkdir: %v", err)
	}
	policyJSON := []byte(`{"version":"cached","expiresAt":"2030-01-01T00:00:00Z","routing":[{"pattern":"*","lane":"anth"}],"providers":{}}`)
	if err := os.WriteFile(cachePath, policyJSON, 0o600); err != nil {
		t.Fatalf("write cache: %v", err)
	}

	loader := newPolicyLoader("http://127.invalid/policy.json", pub, cachePath)
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()
	pol, err := loader.Load(ctx)
	if err != nil {
		t.Fatalf("expected cache fallback, got error: %v", err)
	}
	if pol.Version != "cached" {
		t.Fatalf("unexpected version: %s", pol.Version)
	}
}
