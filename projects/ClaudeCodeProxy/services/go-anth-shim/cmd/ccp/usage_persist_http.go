package main

import (
    "encoding/json"
    "net/http"
    "strconv"
    "time"
    "os"
    "strings"
)

// unitPricesForModel returns (inPriceUSDPerM, outPriceUSDPerM) based on model family.
// Prices are tunable via env:
//   ZAI_PRICE_IN_PER_M, ZAI_PRICE_OUT_PER_M
//   ANTH_PRICE_IN_PER_M, ANTH_PRICE_OUT_PER_M
// Defaults: Z.AI 0.6/2.2, Anthropic 3.0/15.0 (update as needed).
func unitPricesForModel(model string) (float64, float64) {
    lower := strings.ToLower(model)
    if strings.Contains(lower, "haiku") {
        return mustFloat(os.Getenv("ZAI_PRICE_IN_PER_M"), 0.6), mustFloat(os.Getenv("ZAI_PRICE_OUT_PER_M"), 2.2)
    }
    // Default to Anthropic pricing for other Claude models
    return mustFloat(os.Getenv("ANTH_PRICE_IN_PER_M"), 3.0), mustFloat(os.Getenv("ANTH_PRICE_OUT_PER_M"), 15.0)
}

func mustFloat(s string, def float64) float64 {
    if s == "" { return def }
    if f, err := strconv.ParseFloat(s, 64); err == nil {
        return f
    }
    return def
}

// HTTP: GET /v1/usage/samples?since=<epoch>&model=<opt>
func (s *server) handleUsageSamples(w http.ResponseWriter, r *http.Request) {
    if s == nil || s.store == nil {
        http.Error(w, "persistence disabled", http.StatusServiceUnavailable)
        return
    }
    q := r.URL.Query()
    sinceStr := q.Get("since")
    model := q.Get("model")
    since := float64(time.Now().Add(-1 * time.Hour).Unix())
    if sinceStr != "" {
        if v, err := strconv.ParseFloat(sinceStr, 64); err == nil {
            since = v
        }
    }
    rows, err := s.store.ListSamples(r.Context(), since, model)
    if err != nil {
        http.Error(w, "store error: "+err.Error(), http.StatusInternalServerError)
        return
    }
    out := struct {
        Models map[string][]UsageSample `json:"models"`
        Ts     float64                 `json:"ts"`
    }{Models: map[string][]UsageSample{}, Ts: float64(time.Now().UnixNano()) / 1e9}
    for _, row := range rows {
        out.Models[row.Model] = append(out.Models[row.Model], row)
    }
    w.Header().Set("content-type", "application/json")
    _ = json.NewEncoder(w).Encode(out)
}

// HTTP: GET /v1/usage/rollups?granularity=hour|day&model=<opt>&since=<opt>
func (s *server) handleUsageRollups(w http.ResponseWriter, r *http.Request) {
    if s == nil || s.store == nil {
        http.Error(w, "persistence disabled", http.StatusServiceUnavailable)
        return
    }
    q := r.URL.Query()
    gran := q.Get("granularity")
    if gran == "" { gran = "hour" }
    model := q.Get("model")
    since := float64(time.Now().Add(-24 * time.Hour).Unix())
    if v := q.Get("since"); v != "" {
        if f, err := strconv.ParseFloat(v, 64); err == nil {
            since = f
        }
    }
type rowOut struct {
    WindowStart float64 `json:"window_start"`
    InTokens    int64   `json:"in_tokens"`
    OutTokens   int64   `json:"out_tokens"`
    OutELRTPS   float64 `json:"out_elr_tps"`
    OutDirtyTPS float64 `json:"out_dirty_tps"`
    Count       int64   `json:"count"`
    CostUSD     float64 `json:"cost_usd"`
}

    out := struct {
        Granularity string                 `json:"granularity"`
        Models      map[string][]rowOut    `json:"models"`
        Ts          float64                `json:"ts"`
    }{Granularity: gran, Models: map[string][]rowOut{}, Ts: float64(time.Now().UnixNano()) / 1e9}

    if gran == "hour" {
        rows, err := s.store.ListRollupsHour(r.Context(), since, model)
        if err != nil {
            http.Error(w, "store error: "+err.Error(), http.StatusInternalServerError)
            return
        }
        for _, r := range rows {
            elr := 0.0
            if r.StreamS > 0 { elr = float64(r.OutTokens) / r.StreamS }
            dirty := 0.0
            if r.DirtyS > 0 { dirty = float64(r.OutTokens) / r.DirtyS }
            // Estimate cost on the fly based on model family (env-tunable)
            inPrice, outPrice := unitPricesForModel(r.Model)
            cost := float64(r.InTokens)/1e6*inPrice + float64(r.OutTokens)/1e6*outPrice
            out.Models[r.Model] = append(out.Models[r.Model], rowOut{
                WindowStart: r.WindowStart,
                InTokens:    r.InTokens,
                OutTokens:   r.OutTokens,
                OutELRTPS:   elr,
                OutDirtyTPS: dirty,
                Count:       r.Count,
                CostUSD:     cost,
            })
        }
    } else {
        rows, err := s.store.ListRollupsDay(r.Context(), since, model)
        if err != nil {
            http.Error(w, "store error: "+err.Error(), http.StatusInternalServerError)
            return
        }
        for _, r := range rows {
            elr := 0.0
            if r.StreamS > 0 { elr = float64(r.OutTokens) / r.StreamS }
            dirty := 0.0
            if r.DirtyS > 0 { dirty = float64(r.OutTokens) / r.DirtyS }
            inPrice, outPrice := unitPricesForModel(r.Model)
            cost := float64(r.InTokens)/1e6*inPrice + float64(r.OutTokens)/1e6*outPrice
            out.Models[r.Model] = append(out.Models[r.Model], rowOut{
                WindowStart: r.WindowStart,
                InTokens:    r.InTokens,
                OutTokens:   r.OutTokens,
                OutELRTPS:   elr,
                OutDirtyTPS: dirty,
                Count:       r.Count,
                CostUSD:     cost,
            })
        }
    }
    w.Header().Set("content-type", "application/json")
    _ = json.NewEncoder(w).Encode(out)
}
