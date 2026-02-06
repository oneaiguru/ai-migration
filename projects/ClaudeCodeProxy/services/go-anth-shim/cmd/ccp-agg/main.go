package main

import (
    "database/sql"
    "encoding/json"
    "flag"
    "fmt"
    "os"
    "path/filepath"
    "sort"
    "time"

    _ "modernc.org/sqlite"
)

type aggKey struct {
    win  int64
    model string
}

type aggRow struct {
    inTok  int64
    outTok int64
    dirtyS float64
    streamS float64
    count  int64
    ttfts  []int
}

func main() {
    dir := flag.String("dir", "logs", "directory containing *.sqlite3 files to merge")
    outDir := flag.String("out", "results/rollups", "output directory for merged JSON")
    since := flag.Int64("since", time.Now().Add(-24*time.Hour).Unix(), "epoch cutoff for hourly rollups")
    flag.Parse()

    if err := os.MkdirAll(*outDir, 0o755); err != nil { fatal(err) }
    files, _ := filepath.Glob(filepath.Join(*dir, "*.sqlite3"))
    if len(files) == 0 { fmt.Println("no db files; nothing to do"); return }

    // Merge hourly
    hours := map[aggKey]*aggRow{}
    days := map[aggKey]*aggRow{}

    for _, f := range files {
        db, err := sql.Open("sqlite", fmt.Sprintf("file:%s?_pragma=busy_timeout(5000)", filepath.ToSlash(f)))
        if err != nil { fatal(err) }
        // samples for accurate TTFT hourly percentiles
        rows, err := db.Query(`SELECT CAST(FLOOR(ts/3600.0)*3600 AS INTEGER) AS win, model, input_tokens, output_tokens, dirty_s, CASE WHEN stream_s>0 THEN stream_s ELSE dirty_s END, ttft_ms FROM usage_sample WHERE ts >= ?`, float64(*since))
        if err == nil {
            for rows.Next() {
                var win int64; var model string; var inTok, outTok int64; var dirtyS, streamS float64; var ttft int
                if err := rows.Scan(&win, &model, &inTok, &outTok, &dirtyS, &streamS, &ttft); err == nil {
                    k := aggKey{win: win, model: model}
                    a := hours[k]
                    if a == nil { a = &aggRow{}; hours[k] = a }
                    a.inTok += inTok; a.outTok += outTok; a.dirtyS += dirtyS; a.streamS += streamS; a.count++
                    if ttft > 0 { a.ttfts = append(a.ttfts, ttft) }
                }
            }
            rows.Close()
        }
        // daily rollups from table (sums sufficient)
        drows, err := db.Query(`SELECT date, model, in_tokens, out_tokens, dirty_s, stream_s, count FROM usage_rollup_day`)
        if err == nil {
            for drows.Next() {
                var dateStr, model string; var inTok, outTok int64; var dirtyS, streamS float64; var cnt int64
                if err := drows.Scan(&dateStr, &model, &inTok, &outTok, &dirtyS, &streamS, &cnt); err == nil {
                    if t, err := time.ParseInLocation("2006-01-02", dateStr, time.UTC); err == nil {
                        k := aggKey{win: t.Unix(), model: model}
                        a := days[k]
                        if a == nil { a = &aggRow{}; days[k] = a }
                        a.inTok += inTok; a.outTok += outTok; a.dirtyS += dirtyS; a.streamS += streamS; a.count += cnt
                    }
                }
            }
            drows.Close()
        }
        db.Close()
    }

    // Produce JSON files
    type rowOut struct {
        WindowStart float64 `json:"window_start"`
        InTokens    int64   `json:"in_tokens"`
        OutTokens   int64   `json:"out_tokens"`
        OutELRTPS   float64 `json:"out_elr_tps"`
        OutDirtyTPS float64 `json:"out_dirty_tps"`
        Count       int64   `json:"count"`
    }
    hourOut := struct{
        Granularity string               `json:"granularity"`
        Models map[string][]rowOut       `json:"models"`
        Ts float64                       `json:"ts"`
    }{Granularity: "hour", Models: map[string][]rowOut{}, Ts: float64(time.Now().UnixNano())/1e9}

    // group keys by model and sort by win
    byModel := map[string][]aggKey{}
    for k := range hours { byModel[k.model] = append(byModel[k.model], k) }
    for model, ks := range byModel {
        sort.Slice(ks, func(i,j int) bool { return ks[i].win < ks[j].win })
        for _, k := range ks {
            a := hours[k]
            elr := 0.0; if a.streamS > 0 { elr = float64(a.outTok)/a.streamS }
            dirty := 0.0; if a.dirtyS > 0 { dirty = float64(a.outTok)/a.dirtyS }
            hourOut.Models[model] = append(hourOut.Models[model], rowOut{WindowStart: float64(k.win), InTokens: a.inTok, OutTokens: a.outTok, OutELRTPS: elr, OutDirtyTPS: dirty, Count: a.count})
        }
    }
    writeJSON(filepath.Join(*outDir, "rollup_hour.json"), hourOut)

    dayOut := struct{
        Granularity string               `json:"granularity"`
        Models map[string][]rowOut       `json:"models"`
        Ts float64                       `json:"ts"`
    }{Granularity: "day", Models: map[string][]rowOut{}, Ts: float64(time.Now().UnixNano())/1e9}
    byModel = map[string][]aggKey{}
    for k := range days { byModel[k.model] = append(byModel[k.model], k) }
    for model, ks := range byModel {
        sort.Slice(ks, func(i,j int) bool { return ks[i].win < ks[j].win })
        for _, k := range ks {
            a := days[k]
            elr := 0.0; if a.streamS > 0 { elr = float64(a.outTok)/a.streamS }
            dirty := 0.0; if a.dirtyS > 0 { dirty = float64(a.outTok)/a.dirtyS }
            dayOut.Models[model] = append(dayOut.Models[model], rowOut{WindowStart: float64(k.win), InTokens: a.inTok, OutTokens: a.outTok, OutELRTPS: elr, OutDirtyTPS: dirty, Count: a.count})
        }
    }
    writeJSON(filepath.Join(*outDir, "rollup_day.json"), dayOut)
}

func writeJSON(path string, v any) {
    b, _ := json.MarshalIndent(v, "", "  ")
    _ = os.MkdirAll(filepath.Dir(path), 0o755)
    _ = os.WriteFile(path, b, 0o644)
    fmt.Println("wrote", path)
}

func fatal(err error) { fmt.Fprintln(os.Stderr, err.Error()); os.Exit(1) }
