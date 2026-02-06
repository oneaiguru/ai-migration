package main

import (
    "context"
    "time"
)

// UsageSample captures a single completion sample for persistence.
// Fields mirror a subset of usageEntry plus timing/token details for rollups.
type UsageSample struct {
    Ts            float64 `json:"ts"`
    Rid           string  `json:"rid"`
    Model         string  `json:"model"`
    Lane          string  `json:"lane"`
    Op            string  `json:"op"`
    InputTokens   int     `json:"input_tokens"`
    OutputTokens  int     `json:"output_tokens"`
    DirtySeconds  float64 `json:"dirty_s"`
    StreamSeconds float64 `json:"stream_s"`
    TTFTMillis    int     `json:"ttft_ms"`
    Status        int     `json:"status"`
    ErrType       string  `json:"err_type,omitempty"`
    Decision      string  `json:"decision,omitempty"`
    RerouteMode   string  `json:"reroute_mode,omitempty"`
    WarnPctAuto   float64 `json:"warn_pct_auto,omitempty"`
    GapSecondsP50 float64 `json:"gap_seconds_p50,omitempty"`
    GapSecondsP95 float64 `json:"gap_seconds_p95,omitempty"`
    GapSamples    int     `json:"gap_samples,omitempty"`
    Upstream      string  `json:"upstream,omitempty"`
    H2            bool    `json:"h2"`
    HeaderMode    string  `json:"header_mode,omitempty"`
}

// RollupHour represents an hourly aggregate row.
type RollupHour struct {
    WindowStart float64
    Model       string
    InTokens    int64
    OutTokens   int64
    DirtyS      float64
    StreamS     float64
    Count       int64
    P50TTFT     float64
    P90TTFT     float64
    P99TTFT     float64
}

// RollupDay represents a daily aggregate row.
type RollupDay struct {
    // WindowStart is the day start in seconds since epoch (UTC midnight)
    WindowStart float64
    Model       string
    InTokens    int64
    OutTokens   int64
    DirtyS      float64
    StreamS     float64
    Count       int64
}

// Store abstracts persistence for samples and rollups.
type Store interface {
    WriteSample(ctx context.Context, s UsageSample) error
    ListSamples(ctx context.Context, since float64, model string) ([]UsageSample, error)

    RollupHour(ctx context.Context, now time.Time) (int, error)
    RollupDay(ctx context.Context, now time.Time) (int, error)

    ListRollupsHour(ctx context.Context, since float64, model string) ([]RollupHour, error)
    ListRollupsDay(ctx context.Context, since float64, model string) ([]RollupDay, error)

    SizeBytes() int64
    Close() error
}

