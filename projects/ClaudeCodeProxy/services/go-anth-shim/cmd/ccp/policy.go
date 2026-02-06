package main

import (
	"encoding/json"
	"errors"
	"path"
	"path/filepath"
	"strings"
	"time"
)

const defaultPolicyJSON = `{
  "version": "2025-10-21.1",
  "expiresAt": "2030-01-01T00:00:00Z",
  "routing": [
    {"pattern": "claude-haiku-4*", "lane": "zai"},
    {"pattern": "claude-haiku*", "lane": "zai"},
    {"pattern": "*", "lane": "anth"}
  ],
  "providers": {
    "zai": {
      "baseURL": "https://api.z.ai/api/anthropic",
      "headerMode": "x-api-key"
    },
    "anth": {
      "baseURL": "https://api.anthropic.com",
      "passthrough": true,
      "fallbackEnv": "ANTHROPIC_AUTH_TOKEN"
    }
  }
}`

var (
	errPolicyExpired      = errors.New("policy expired")
	errPolicyMissingField = errors.New("policy missing required field")
)

type policyRoute struct {
	Pattern string `json:"pattern"`
	Lane    string `json:"lane"`
}

type policyProvider struct {
	BaseURL     string `json:"baseURL"`
	HeaderMode  string `json:"headerMode,omitempty"`
	PassThrough bool   `json:"passthrough,omitempty"`
	FallbackEnv string `json:"fallbackEnv,omitempty"`
}

type policyDTO struct {
	Version   string                    `json:"version"`
	ExpiresAt string                    `json:"expiresAt"`
	Routing   []policyRoute             `json:"routing"`
	Providers map[string]policyProvider `json:"providers"`
}

type Policy struct {
	Version   string
	Expires   time.Time
	Routing   []policyRoute
	Providers map[string]policyProvider
}

func parsePolicy(data []byte) (*Policy, error) {
	var dto policyDTO
	if err := json.Unmarshal(data, &dto); err != nil {
		return nil, err
	}
	if dto.Version == "" {
		return nil, errPolicyMissingField
	}
	if dto.ExpiresAt == "" {
		return nil, errPolicyMissingField
	}
	expires, err := time.Parse(time.RFC3339, dto.ExpiresAt)
	if err != nil {
		return nil, err
	}
	if time.Now().After(expires) {
		return nil, errPolicyExpired
	}
	if len(dto.Routing) == 0 {
		return nil, errPolicyMissingField
	}
	return &Policy{
		Version:   dto.Version,
		Expires:   expires,
		Routing:   dto.Routing,
		Providers: dto.Providers,
	}, nil
}

func (p *Policy) LaneForModel(model string) (string, bool) {
	m := strings.TrimSpace(strings.ToLower(model))
	if m == "" {
		return "", false
	}
	for _, r := range p.Routing {
		if matchPattern(strings.ToLower(r.Pattern), m) {
			return r.Lane, true
		}
	}
	return "", false
}

func matchPattern(pattern, value string) bool {
	if pattern == "" {
		return false
	}
	// Allow simple glob matching using path.Match semantics. Ensure pattern does not include path separators.
	pattern = strings.ReplaceAll(pattern, string(filepath.Separator), "")
	ok, err := path.Match(pattern, value)
	if err == nil {
		return ok
	}
	// Fallback: treat '*' as prefix/suffix wildcard.
	if !strings.Contains(pattern, "*") {
		return strings.EqualFold(pattern, value)
	}
	parts := strings.Split(pattern, "*")
	if len(parts) == 2 {
		prefix := parts[0]
		suffix := parts[1]
		return strings.HasPrefix(value, prefix) && strings.HasSuffix(value, suffix)
	}
	return strings.HasPrefix(value, strings.TrimSuffix(pattern, "*"))
}

func providerFromPolicy(p *Policy, name string) (policyProvider, bool) {
	if p == nil {
		return policyProvider{}, false
	}
	prov, ok := p.Providers[name]
	return prov, ok
}
