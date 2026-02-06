package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestMaybeRotateLog(t *testing.T) {
	dir := t.TempDir()
	logPath := filepath.Join(dir, "usage.jsonl")
	if err := os.WriteFile(logPath, bytesOfSize(1024), 0o644); err != nil {
		t.Fatalf("write log: %v", err)
	}
	if err := maybeRotateLog(logPath, 512, 3, time.Hour); err != nil {
		t.Fatalf("rotate log: %v", err)
	}
	if _, err := os.Stat(logPath); err != nil {
		t.Fatalf("expected new log file: %v", err)
	}
	if _, err := os.Stat(logPath + ".1"); err != nil {
		t.Fatalf("expected rotated file: %v", err)
	}
}

func bytesOfSize(n int) []byte {
	b := make([]byte, n)
	for i := range b {
		b[i] = 'x'
	}
	return b
}
