package main

import (
	"net/http"
	"testing"
)

const anthropicJSON = `{
  "id": "msg_1",
  "type": "message",
  "usage": {
    "input_tokens": 123,
    "output_tokens": 456
  }
}`

func TestAnthropicExtractorJSON(t *testing.T) {
	ext := anthropicTokenExtractor{}
	in, out, ok := ext.FromJSON([]byte(anthropicJSON))
	if !ok {
		t.Fatalf("expected ok")
	}
	if in != 123 || out != 456 {
		t.Fatalf("unexpected tokens in=%d out=%d", in, out)
	}
}

func TestAnthropicExtractorJSONMissing(t *testing.T) {
	ext := anthropicTokenExtractor{}
	if _, _, ok := ext.FromJSON([]byte(`{"foo":1}`)); ok {
		t.Fatalf("expected miss")
	}
}

func TestZAIExtractorHeaders(t *testing.T) {
	ext := zaiTokenExtractor{}
	h := http.Header{}
	h.Set("x-usage-tokens", " 200 , 300 ")
	in, out, ok := ext.FromHeaders(h)
	if !ok {
		t.Fatalf("expected ok")
	}
	if in != 200 || out != 300 {
		t.Fatalf("unexpected tokens in=%d out=%d", in, out)
	}
}

func TestZAIExtractorHeadersInvalid(t *testing.T) {
	ext := zaiTokenExtractor{}
	h := http.Header{}
	h.Set("x-usage", "oops")
	if _, _, ok := ext.FromHeaders(h); ok {
		t.Fatalf("expected failure")
	}
}

func TestParseInt(t *testing.T) {
	cases := map[string]int{
		"":    0,
		"15":  15,
		"001": 1,
		"-42": -42,
		" 10": 10,
		"abc": -1,
	}
	for input, expect := range cases {
		got := parseInt(input)
		if got != expect {
			t.Fatalf("parseInt(%q)=%d want %d", input, got, expect)
		}
	}
}
