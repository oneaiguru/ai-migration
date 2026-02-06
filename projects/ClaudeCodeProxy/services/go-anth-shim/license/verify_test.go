package license

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func writeTempLicense(t *testing.T, dir string, claims Claims, priv ed25519.PrivateKey) (string, string) {
	t.Helper()
	licPath := filepath.Join(dir, "license.json")
	sigPath := filepath.Join(dir, "license.sig")
	data, err := json.Marshal(claims)
	if err != nil {
		t.Fatalf("marshal claims: %v", err)
	}
	if err := os.WriteFile(licPath, data, 0o600); err != nil {
		t.Fatalf("write license: %v", err)
	}
	sig := ed25519.Sign(priv, data)
	if err := os.WriteFile(sigPath, []byte(base64.StdEncoding.EncodeToString(sig)), 0o600); err != nil {
		t.Fatalf("write signature: %v", err)
	}
	return licPath, sigPath
}

func TestLoadAndVerify(t *testing.T) {
	dir := t.TempDir()
	pub, priv, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}
	claims := Claims{
		Schema:   "ccp.license.v1",
		Sub:      "acct_123",
		Plan:     "pro",
		Features: []string{"zai_offload"},
		Exp:      time.Now().Add(24 * time.Hour).Unix(),
		Device:   "device123",
		Kid:      "test-key",
	}
	licPath, sigPath := writeTempLicense(t, dir, claims, priv)
	got, err := LoadAndVerify(map[string]string{"test-key": base64.StdEncoding.EncodeToString(pub)}, licPath, sigPath, time.Now(), "device123")
	if err != nil {
		t.Fatalf("LoadAndVerify error: %v", err)
	}
	if got.Plan != "pro" || !HasFeature(got, "zai_offload") {
		t.Fatalf("unexpected claims: %+v", got)
	}
}

func TestLoadAndVerifyExpired(t *testing.T) {
	dir := t.TempDir()
	pub, priv, err := ed25519.GenerateKey(nil)
	if err != nil {
		t.Fatalf("generate key: %v", err)
	}
	claims := Claims{
		Schema: "ccp.license.v1",
		Exp:    time.Now().Add(-time.Hour).Unix(),
	}
	licPath, sigPath := writeTempLicense(t, dir, claims, priv)
	if _, err := LoadAndVerify(map[string]string{"default": base64.StdEncoding.EncodeToString(pub)}, licPath, sigPath, time.Now(), ""); err == nil {
		t.Fatalf("expected expired error")
	}
}

func TestHasFeature(t *testing.T) {
	c := &Claims{Features: []string{"a", "b"}}
	if !HasFeature(c, "a") || HasFeature(c, "z") {
		t.Fatalf("HasFeature failed")
	}
	if HasFeature(nil, "a") {
		t.Fatalf("nil claims should not have feature")
	}
}

func TestVerifyBytes_MultipleKeys(t *testing.T) {
	dir := t.TempDir()
	pub1, priv1, _ := ed25519.GenerateKey(nil)
	pub2, priv2, _ := ed25519.GenerateKey(nil)
	licDir1 := filepath.Join(dir, "one")
	licDir2 := filepath.Join(dir, "two")
	if err := os.MkdirAll(licDir1, 0o755); err != nil {
		t.Fatalf("mkdir one: %v", err)
	}
	if err := os.MkdirAll(licDir2, 0o755); err != nil {
		t.Fatalf("mkdir two: %v", err)
	}

	claims1 := Claims{
		Schema:   "ccp.license.v1",
		Plan:     "pro",
		Features: []string{"zai_offload"},
		Exp:      time.Now().Add(24 * time.Hour).Unix(),
		Kid:      "key-1",
	}
	lic1, sig1 := writeTempLicense(t, licDir1, claims1, priv1)

	claims2 := Claims{
		Schema:   "ccp.license.v1",
		Plan:     "trial",
		Features: []string{"zai_offload"},
		Exp:      time.Now().Add(24 * time.Hour).Unix(),
		Kid:      "key-2",
	}
	lic2, sig2 := writeTempLicense(t, licDir2, claims2, priv2)

	keys := map[string]string{
		"key-1": base64.StdEncoding.EncodeToString(pub1),
		"key-2": base64.StdEncoding.EncodeToString(pub2),
	}

	b1, _ := os.ReadFile(lic1)
	s1, _ := os.ReadFile(sig1)
	got1, err := VerifyBytes(keys, b1, string(s1), time.Now(), "")
	if err != nil {
		t.Fatalf("verify bytes key1: %v", err)
	}
	if got1.Plan != "pro" || got1.Kid != "key-1" {
		t.Fatalf("unexpected plan/kid: %+v", got1)
	}

	b2, _ := os.ReadFile(lic2)
	s2, _ := os.ReadFile(sig2)
	got2, err := VerifyBytes(keys, b2, string(s2), time.Now(), "")
	if err != nil {
		t.Fatalf("verify bytes key2: %v", err)
	}
	if got2.Plan != "trial" || got2.Kid != "key-2" {
		t.Fatalf("unexpected plan/kid: %+v", got2)
	}
}
