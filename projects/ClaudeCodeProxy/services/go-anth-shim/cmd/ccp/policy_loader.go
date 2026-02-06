package main

import (
	"context"
	"crypto/ed25519"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type policyLoader struct {
	url       string
	pubKey    ed25519.PublicKey
	cachePath string
	client    *http.Client
}

func newPolicyLoader(url string, pubKey ed25519.PublicKey, cachePath string) *policyLoader {
	return &policyLoader{
		url:       url,
		pubKey:    pubKey,
		cachePath: cachePath,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (l *policyLoader) Load(ctx context.Context) (*Policy, error) {
	if l == nil {
		return nil, errors.New("policy loader not initialised")
	}
	if policy, err := l.loadRemote(ctx); err == nil {
		return policy, nil
	} else {
		fallback, cacheErr := l.loadFromCache()
		if cacheErr != nil {
			return nil, fmt.Errorf("policy load failed: remote error %v, cache error %v", err, cacheErr)
		}
		fmt.Fprintf(os.Stderr, "[policy] remote load failed: %v — using cached policy\n", err)
		return fallback, nil
	}
}

func (l *policyLoader) loadRemote(ctx context.Context) (*Policy, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, l.url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := l.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("policy fetch failed: status %d", resp.StatusCode)
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	sigURL := l.url + ".sig"
	sigReq, err := http.NewRequestWithContext(ctx, http.MethodGet, sigURL, nil)
	if err != nil {
		return nil, err
	}
	sigResp, err := l.client.Do(sigReq)
	if err != nil {
		return nil, err
	}
	defer sigResp.Body.Close()
	if sigResp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("policy signature fetch failed: status %d", sigResp.StatusCode)
	}
	sigBody, err := io.ReadAll(sigResp.Body)
	if err != nil {
		return nil, err
	}
	sig, err := decodeSignature(sigBody)
	if err != nil {
		return nil, err
	}
	if !ed25519.Verify(l.pubKey, body, sig) {
		return nil, errors.New("policy signature verification failed")
	}
	pol, err := parsePolicy(body)
	if err != nil {
		return nil, err
	}
	if err := l.saveCache(body); err != nil {
		// warn but do not fail entire load
		fmt.Fprintf(os.Stderr, "[policy] warning: failed to cache policy: %v\n", err)
	}
	return pol, nil
}

func (l *policyLoader) loadFromCache() (*Policy, error) {
	data, err := os.ReadFile(l.cachePath)
	if err != nil {
		return nil, err
	}
	return parsePolicy(data)
}

func (l *policyLoader) saveCache(data []byte) error {
	if err := os.MkdirAll(filepath.Dir(l.cachePath), 0o755); err != nil {
		return err
	}
	tmp := l.cachePath + ".tmp"
	if err := os.WriteFile(tmp, data, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, l.cachePath)
}

func decodeSignature(data []byte) ([]byte, error) {
	raw := strings.TrimSpace(string(data))
	sig, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return nil, err
	}
	if len(sig) != ed25519.SignatureSize {
		return nil, fmt.Errorf("unexpected signature size: %d", len(sig))
	}
	return sig, nil
}

func loadPublicKey(path string) (ed25519.PublicKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	raw := strings.TrimSpace(string(data))
	keyBytes, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return nil, err
	}
	if len(keyBytes) != ed25519.PublicKeySize {
		return nil, fmt.Errorf("unexpected public key size: %d", len(keyBytes))
	}
	return ed25519.PublicKey(keyBytes), nil
}
