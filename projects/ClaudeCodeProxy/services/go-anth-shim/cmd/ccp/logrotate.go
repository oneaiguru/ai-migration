package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

// Serialize rotation operations to avoid concurrent rename chains under load.
var rotateMu = struct{ ch chan struct{} }{ch: make(chan struct{}, 1)}

func init() { rotateMu.ch <- struct{}{} }

func logRoot() string {
	if v := os.Getenv("CCP_LOGS_DIR"); v != "" {
		if err := os.MkdirAll(v, 0o755); err == nil {
			return v
		}
	}
	_ = os.MkdirAll("logs", 0o755)
	return "logs"
}

func usageLogPath() string     { return filepath.Join(logRoot(), "usage.jsonl") }
func anomaliesLogPath() string { return filepath.Join(logRoot(), "anomalies.jsonl") }

var (
	maxUsageLogSize  = parseInt64Env("CCP_LOG_MAX_BYTES", 5*1024*1024)
	maxUsageLogFiles = parseIntEnv("CCP_LOG_MAX_FILES", 5)
	maxUsageLogAge   = parseDurationEnv("CCP_LOG_MAX_AGE", 24*time.Hour)
)

func parseInt64Env(name string, def int64) int64 {
	if v := os.Getenv(name); v != "" {
		if parsed, err := strconv.ParseInt(v, 10, 64); err == nil && parsed > 0 {
			return parsed
		}
	}
	return def
}

func parseIntEnv(name string, def int) int {
	if v := os.Getenv(name); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 {
			return parsed
		}
	}
	return def
}

func rotateUsageLogIfNeeded() {
	// lightweight non-blocking lock
	<-rotateMu.ch
	defer func() { rotateMu.ch <- struct{}{} }()
	if err := maybeRotateLog(usageLogPath(), maxUsageLogSize, maxUsageLogFiles, maxUsageLogAge); err != nil {
		fmt.Fprintf(os.Stderr, "[logrotate] usage log rotation failed: %v\n", err)
	}
}

func rotateAnomalyLogIfNeeded() {
	<-rotateMu.ch
	defer func() { rotateMu.ch <- struct{}{} }()
	if err := maybeRotateLog(anomaliesLogPath(), maxUsageLogSize, maxUsageLogFiles, maxUsageLogAge); err != nil {
		fmt.Fprintf(os.Stderr, "[logrotate] anomaly log rotation failed: %v\n", err)
	}
}

func maybeRotateLog(path string, maxSize int64, maxFiles int, maxAge time.Duration) error {
	if maxFiles < 1 {
		maxFiles = 1
	}
	info, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	rotate := false
	if maxSize > 0 && info.Size() >= maxSize {
		rotate = true
	}
	if !rotate && maxAge > 0 {
		if time.Since(info.ModTime()) >= maxAge {
			rotate = true
		}
	}
	if !rotate {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	for i := maxFiles; i >= 1; i-- {
		src := fmt.Sprintf("%s.%d", path, i-1)
		if i == 1 {
			src = path
		}
		dst := fmt.Sprintf("%s.%d", path, i)
		if _, err := os.Stat(src); err == nil {
			if err := os.Rename(src, dst); err != nil {
				return err
			}
		}
	}
	f, err := os.OpenFile(path, os.O_CREATE|os.O_TRUNC|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	return f.Close()
}

func parseDurationEnv(name string, def time.Duration) time.Duration {
	if v := os.Getenv(name); v != "" {
		if d, err := time.ParseDuration(v); err == nil && d > 0 {
			return d
		}
		if n, err := strconv.Atoi(v); err == nil && n > 0 {
			return time.Duration(n) * time.Second
		}
	}
	return def
}
