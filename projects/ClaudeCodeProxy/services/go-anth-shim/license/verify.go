package license

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"
)

var ErrInvalid = errors.New("license invalid")

type Claims struct {
	Schema   string   `json:"schema"`
	Sub      string   `json:"sub"`
	Plan     string   `json:"plan"`
	Features []string `json:"features"`
	Exp      int64    `json:"exp"`
	Device   string   `json:"device,omitempty"`
	Kid      string   `json:"kid,omitempty"`
}

func LoadAndVerify(pubKeys map[string]string, licPath, sigPath string, now time.Time, device string) (*Claims, error) {
	licBytes, err := os.ReadFile(licPath)
	if err != nil {
		return nil, err
	}
	sigB64, err := os.ReadFile(sigPath)
	if err != nil {
		return nil, err
	}
	return VerifyBytes(pubKeys, licBytes, strings.TrimSpace(string(sigB64)), now, device)
}

func VerifyBytes(pubKeys map[string]string, licBytes []byte, sigB64 string, now time.Time, device string) (*Claims, error) {
	if len(pubKeys) == 0 {
		return nil, fmt.Errorf("no public keys provided")
	}
	sigRaw, err := base64.StdEncoding.DecodeString(strings.TrimSpace(sigB64))
	if err != nil {
		return nil, err
	}
	for kid, keyB64 := range pubKeys {
		keyB64 = strings.TrimSpace(keyB64)
		if keyB64 == "" {
			continue
		}
		pubRaw, err := base64.StdEncoding.DecodeString(keyB64)
		if err != nil {
			return nil, err
		}
		if len(pubRaw) != ed25519.PublicKeySize {
			return nil, fmt.Errorf("unexpected public key size: %d", len(pubRaw))
		}
		if !ed25519.Verify(ed25519.PublicKey(pubRaw), licBytes, sigRaw) {
			continue
		}
		var c Claims
		if err := json.Unmarshal(licBytes, &c); err != nil {
			return nil, err
		}
		if c.Kid != "" && kid != "" && c.Kid != kid {
			continue
		}
		if c.Kid == "" {
			c.Kid = kid
		}
		if err := validateClaims(&c, now, device); err != nil {
			return nil, err
		}
		return &c, nil
	}
	return nil, ErrInvalid
}

func validateClaims(c *Claims, now time.Time, device string) error {
	if c.Schema != "ccp.license.v1" {
		return fmt.Errorf("schema mismatch")
	}
	if now.Unix() > c.Exp {
		return fmt.Errorf("expired")
	}
	if c.Device != "" && device != "" && c.Device != device {
		return fmt.Errorf("device mismatch")
	}
	return nil
}

func HasFeature(c *Claims, feat string) bool {
	if c == nil {
		return false
	}
	for _, f := range c.Features {
		if f == feat {
			return true
		}
	}
	return false
}
