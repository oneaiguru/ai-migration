package main

import (
	"os"
	"path/filepath"
)

type partialRecorder struct {
	path string
	file *os.File
}

func newPartialRecorder(rid string) *partialRecorder {
	if rid == "" {
		return nil
	}
	root := filepath.Join(logRoot(), "partials")
	if err := os.MkdirAll(root, 0o755); err != nil {
		return nil
	}
	path := filepath.Join(root, rid+".partial")
	f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o600)
	if err != nil {
		return nil
	}
	return &partialRecorder{path: path, file: f}
}

func (p *partialRecorder) Write(b []byte) {
	if p == nil || p.file == nil || len(b) == 0 {
		return
	}
	_, _ = p.file.Write(b)
}

func (p *partialRecorder) Close(success bool) {
	if p == nil || p.file == nil {
		return
	}
	_ = p.file.Close()
	if success {
		_ = os.Remove(p.path)
	}
}

func (p *partialRecorder) Path() string {
	if p == nil {
		return ""
	}
	return p.path
}
