package main

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "net/http/httptest"
    "os"
    "path/filepath"
    "sort"
    "testing"
    "time"
)

func TestStoreOpenWriteRead(t *testing.T) {
    dir := t.TempDir()
    db := filepath.Join(dir, "ccp.sqlite3")
    st, err := OpenStoreSQLite(db)
    if err != nil { t.Fatalf("open: %v", err) }
    defer st.Close()

    ts := float64(time.Now().Add(-5 * time.Second).Unix())
    s := UsageSample{Ts: ts, Rid: "r1", Model: "claude-haiku-4.5", Lane: "zai", Op: "nonstream", InputTokens: 10, OutputTokens: 20, DirtySeconds: 1.0, StreamSeconds: 1.0, TTFTMillis: 50, Status: 200, H2: true}
    if err := st.WriteSample(context.Background(), s); err != nil {
        t.Fatalf("write: %v", err)
    }
    rows, err := st.ListSamples(context.Background(), ts-10, "")
    if err != nil { t.Fatalf("list: %v", err) }
    if len(rows) != 1 { t.Fatalf("want 1 row, got %d", len(rows)) }
    if rows[0].Model != s.Model || rows[0].OutputTokens != s.OutputTokens {
        t.Fatalf("row mismatch: %+v", rows[0])
    }
}

func TestStoreRollups(t *testing.T) {
    dir := t.TempDir()
    db := filepath.Join(dir, "ccp.sqlite3")
    st, err := OpenStoreSQLite(db)
    if err != nil { t.Fatalf("open: %v", err) }
    defer st.Close()
    model := "claude-haiku-4.5"
    // Two samples within same hour window
    now := time.Now().UTC()
    hourStart := time.Unix(now.Unix()-now.Unix()%3600, 0)
    s1 := UsageSample{Ts: float64(hourStart.Add(5 * time.Minute).Unix()), Rid: "a", Model: model, Lane: "zai", Op: "nonstream", InputTokens: 10, OutputTokens: 20, DirtySeconds: 1.5, StreamSeconds: 1.5, Status: 200, TTFTMillis: 50}
    s2 := UsageSample{Ts: float64(hourStart.Add(10 * time.Minute).Unix()), Rid: "b", Model: model, Lane: "zai", Op: "nonstream", InputTokens: 5, OutputTokens: 10, DirtySeconds: 0.5, StreamSeconds: 0.5, Status: 200, TTFTMillis: 150}
    _ = st.WriteSample(context.Background(), s1)
    _ = st.WriteSample(context.Background(), s2)
    if _, err := st.RollupHour(context.Background(), time.Now()); err != nil {
        t.Fatalf("rollup hour: %v", err)
    }
    hours, err := st.ListRollupsHour(context.Background(), float64(hourStart.Unix()-60), model)
    if err != nil { t.Fatalf("list hour: %v", err) }
    if len(hours) == 0 { t.Fatalf("no hourly rollups") }
    found := false
    for _, h := range hours {
        if int64(h.WindowStart) == hourStart.Unix() {
            found = true
            if h.OutTokens != 30 || h.InTokens != 15 || h.Count != 2 {
                t.Fatalf("bad aggregates: %+v", h)
            }
            if h.P50TTFT <= 0 || h.P90TTFT <= 0 || h.P99TTFT <= 0 {
                t.Fatalf("ttft percentiles not computed: %+v", h)
            }
        }
    }
    if !found { t.Fatalf("expected window_start=%d not found", hourStart.Unix()) }

    if _, err := st.RollupDay(context.Background(), time.Now()); err != nil {
        t.Fatalf("rollup day: %v", err)
    }
    days, err := st.ListRollupsDay(context.Background(), float64(hourStart.Add(-24*time.Hour).Unix()), model)
    if err != nil { t.Fatalf("list day: %v", err) }
    if len(days) == 0 { t.Fatalf("no daily rollups") }
}

func TestUsageEndpointsIntegration(t *testing.T) {
    // Disable auto-open to control DB path
    _ = os.Setenv("CCP_PERSIST", "0")
    srv := newServer(0, nil, nil)
    dir := t.TempDir()
    st, err := OpenStoreSQLite(filepath.Join(dir, "ccp.sqlite3"))
    if err != nil { t.Fatalf("open: %v", err) }
    srv.store = st
    ts := float64(time.Now().Add(-2 * time.Minute).Unix())
    _ = st.WriteSample(context.Background(), UsageSample{Ts: ts, Rid: "x", Model: "claude-haiku-4.5", Lane: "zai", Op: "nonstream", InputTokens: 1, OutputTokens: 2, DirtySeconds: 0.1, StreamSeconds: 0.1, Status: 200})
    // Ensure hourly rollup exists
    _, _ = st.RollupHour(context.Background(), time.Now())
    s := httptest.NewServer(srv.routes())
    defer s.Close()

    // samples
    resp1 := httpGetJSON(t, s.URL+"/v1/usage/samples?since=0")
    if _, ok := resp1.(map[string]any)["models"]; !ok {
        t.Fatalf("samples: missing models field: %v", resp1)
    }
    // rollups
    resp2 := httpGetJSON(t, s.URL+"/v1/usage/rollups?granularity=hour&since=0")
    if _, ok := resp2.(map[string]any)["models"]; !ok {
        t.Fatalf("rollups: missing models field: %v", resp2)
    }
}

// small helper for tests
func httpGetJSON(t *testing.T, url string) any {
    t.Helper()
    res := struct{ any any }{}
    rr := httptest.NewRecorder()
    // Start a real request via net/http default client for simplicity
    // but here we use httptest only for parsing below.
    // We just read the body via http.Get.
    resp, err := http.Get(url)
    if err != nil { t.Fatalf("get %s: %v", url, err) }
    defer resp.Body.Close()
    if resp.StatusCode >= 400 { t.Fatalf("status %d", resp.StatusCode) }
    dec := json.NewDecoder(resp.Body)
    if err := dec.Decode(&res.any); err != nil { t.Fatalf("decode: %v", err) }
    _ = rr // quiet linter
    return res.any
}

func TestStoreSoak(t *testing.T) {
    if os.Getenv("SOAK") != "1" {
        t.Skip("set SOAK=1 to run soak")
    }
    dir := t.TempDir()
    st, err := OpenStoreSQLite(filepath.Join(dir, "ccp.sqlite3"))
    if err != nil { t.Fatalf("open: %v", err) }
    defer st.Close()
    N := 10000
    times := make([]time.Duration, 0, N)
    for i := 0; i < N; i++ {
        s := UsageSample{Ts: float64(time.Now().Unix()), Rid: fmt.Sprintf("r%06d", i), Model: "haiku", Lane: "zai", Op: "nonstream", InputTokens: 1, OutputTokens: 2, DirtySeconds: 0.05, StreamSeconds: 0.05, Status: 200}
        t0 := time.Now()
        if err := st.WriteSample(context.Background(), s); err != nil { t.Fatalf("write: %v", err) }
        times = append(times, time.Since(t0))
    }
    // p95 for inserts
    sort.Slice(times, func(i, j int) bool { return times[i] < times[j] })
    p95 := times[int(float64(len(times))*0.95)]
    t.Logf("insert_p95_ms=%.3f", float64(p95)/float64(time.Millisecond))

    // rollup duration timing
    t0 := time.Now()
    if _, err := st.RollupHour(context.Background(), time.Now()); err != nil { t.Fatalf("rollup: %v", err) }
    rdur := time.Since(t0)
    t.Logf("rollup_hour_ms=%.3f", float64(rdur)/float64(time.Millisecond))
}
