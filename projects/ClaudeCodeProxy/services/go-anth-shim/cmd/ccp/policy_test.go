package main

import (
	"testing"
	"time"
)

func TestParsePolicyDefault(t *testing.T) {
	pol, err := parsePolicy([]byte(defaultPolicyJSON))
	if err != nil {
		t.Fatalf("parse default policy: %v", err)
	}
	if pol.Version == "" {
		t.Fatalf("expected version in policy")
	}
	if pol.Expires.Before(time.Now()) {
		t.Fatalf("expected default policy expiry in future")
	}
	lane, ok := pol.LaneForModel("claude-haiku-4.5")
	if !ok || lane != "zai" {
		t.Fatalf("expected haiku -> zai, got %s", lane)
	}
	lane, ok = pol.LaneForModel("claude-sonnet-4.5")
	if !ok || (lane != "anth" && lane != "anthropic") {
		t.Fatalf("expected sonnet -> anth lane, got %s", lane)
	}
}

func TestParsePolicyExpired(t *testing.T) {
	expired := `{"version":"1","expiresAt":"2000-01-01T00:00:00Z","routing":[{"pattern":"*","lane":"anth"}],"providers":{}}`
	if _, err := parsePolicy([]byte(expired)); err == nil {
		t.Fatalf("expected expired policy error")
	}
}

func TestMatchPattern(t *testing.T) {
	cases := []struct {
		pattern string
		model   string
		want    bool
	}{
		{"claude-haiku-*", "claude-haiku-4.5", true},
		{"claude-haiku-4*", "claude-haiku-4.5", true},
		{"claude-haiku-4*", "claude-haiku-3.5", false},
		{"*", "claude-sonnet-4.5", true},
	}
	for _, tc := range cases {
		if got := matchPattern(tc.pattern, tc.model); got != tc.want {
			t.Fatalf("matchPattern(%q,%q)=%v want %v", tc.pattern, tc.model, got, tc.want)
		}
	}
}
