package main

import (
	"encoding/json"
	"net/http"
	"strings"
)

type TokenExtractor interface {
	FromJSON([]byte) (in, out int, ok bool)
	FromHeaders(http.Header) (in, out int, ok bool)
}

type anthropicTokenExtractor struct{}

type anthropicResponse struct {
	Usage struct {
		InputTokens  *int `json:"input_tokens"`
		OutputTokens *int `json:"output_tokens"`
	} `json:"usage"`
}

func (anthropicTokenExtractor) FromJSON(b []byte) (int, int, bool) {
	var resp anthropicResponse
	if err := json.Unmarshal(b, &resp); err != nil {
		return 0, 0, false
	}
	inPtr := resp.Usage.InputTokens
	outPtr := resp.Usage.OutputTokens
	if inPtr == nil && outPtr == nil {
		return 0, 0, false
	}
	in := 0
	out := 0
	if inPtr != nil {
		in = *inPtr
	}
	if outPtr != nil {
		out = *outPtr
	}
	return in, out, true
}

func (anthropicTokenExtractor) FromHeaders(h http.Header) (int, int, bool) {
	// Anthropic does not currently report usage in headers.
	return 0, 0, false
}

type zaiTokenExtractor struct{}

func (zaiTokenExtractor) FromJSON(b []byte) (int, int, bool) {
	// Z.AI mirrors Anthropic usage payloads when present.
	return anthropicTokenExtractor{}.FromJSON(b)
}

func (zaiTokenExtractor) FromHeaders(h http.Header) (int, int, bool) {
	// Some Z.AI deployments return usage headers in the form "x-usage: in,out" or similar.
	raw := h.Get("x-usage-tokens")
	if raw == "" {
		raw = h.Get("x-usage")
	}
	if raw == "" {
		return 0, 0, false
	}
	parts := strings.Split(raw, ",")
	if len(parts) != 2 {
		return 0, 0, false
	}
	in := parseInt(parts[0])
	out := parseInt(parts[1])
	if in < 0 && out < 0 {
		return 0, 0, false
	}
	if in < 0 {
		in = 0
	}
	if out < 0 {
		out = 0
	}
	return in, out, true
}

func parseInt(s string) int {
	s = strings.TrimSpace(s)
	if s == "" {
		return 0
	}
	var sign = 1
	if strings.HasPrefix(s, "-") {
		sign = -1
		s = strings.TrimPrefix(s, "-")
	}
	var n int
	for _, r := range s {
		if r < '0' || r > '9' {
			return -1
		}
		n = n*10 + int(r-'0')
	}
	return sign * n
}
