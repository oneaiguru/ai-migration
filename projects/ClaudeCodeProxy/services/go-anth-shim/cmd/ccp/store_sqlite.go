package main

import (
    "context"
    "database/sql"
    "errors"
    "fmt"
    "os"
    "path/filepath"
    "time"

    _ "modernc.org/sqlite"
)

type sqliteStore struct {
    db      *sql.DB
    dbPath  string
    insert  *sql.Stmt
}

// OpenStoreSQLite opens/creates a SQLite database with WAL and schema ensured.
func OpenStoreSQLite(path string) (Store, error) {
    if path == "" {
        return nil, errors.New("empty db path")
    }
    if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
        return nil, err
    }
    dsn := fmt.Sprintf("file:%s?_pragma=busy_timeout(5000)", filepath.ToSlash(path))
    db, err := sql.Open("sqlite", dsn)
    if err != nil {
        return nil, err
    }
    if _, err := db.Exec("PRAGMA journal_mode=WAL;"); err != nil {
        _ = db.Close()
        return nil, err
    }
    if _, err := db.Exec("PRAGMA synchronous=NORMAL;"); err != nil {
        _ = db.Close()
        return nil, err
    }
    s := &sqliteStore{db: db, dbPath: path}
    if err := s.ensureSchema(); err != nil {
        _ = db.Close()
        return nil, err
    }
    ins, err := db.Prepare(`
        INSERT OR REPLACE INTO usage_sample (
            ts, rid, model, lane, op, input_tokens, output_tokens, dirty_s, stream_s,
            ttft_ms, status, err_type, decision, reroute_mode, warn_pct_auto,
            gap_seconds_p50, gap_seconds_p95, gap_samples, upstream, h2, header_mode
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    if err != nil {
        _ = db.Close()
        return nil, err
    }
    s.insert = ins
    return s, nil
}

func (s *sqliteStore) ensureSchema() error {
    stmts := []string{
        `CREATE TABLE IF NOT EXISTS usage_sample (
            ts REAL NOT NULL,
            rid TEXT NOT NULL,
            model TEXT,
            lane TEXT,
            op TEXT,
            input_tokens INTEGER,
            output_tokens INTEGER,
            dirty_s REAL,
            stream_s REAL,
            ttft_ms INTEGER,
            status INTEGER,
            err_type TEXT,
            decision TEXT,
            reroute_mode TEXT,
            warn_pct_auto REAL,
            gap_seconds_p50 REAL,
            gap_seconds_p95 REAL,
            gap_samples INTEGER,
            upstream TEXT,
            h2 INTEGER,
            header_mode TEXT,
            PRIMARY KEY (ts, rid)
        );`,
        `CREATE INDEX IF NOT EXISTS sample_model_ts ON usage_sample(model, ts);`,
        `CREATE TABLE IF NOT EXISTS usage_rollup_hour (
            window_start REAL NOT NULL,
            model TEXT,
            in_tokens INTEGER,
            out_tokens INTEGER,
            dirty_s REAL,
            stream_s REAL,
            count INTEGER,
            p50_ttft REAL,
            p90_ttft REAL,
            p99_ttft REAL,
            UNIQUE(window_start, model)
        );`,
        `CREATE TABLE IF NOT EXISTS usage_rollup_day (
            date TEXT NOT NULL,
            model TEXT,
            in_tokens INTEGER,
            out_tokens INTEGER,
            dirty_s REAL,
            stream_s REAL,
            count INTEGER,
            UNIQUE(date, model)
        );`,
    }
    for _, q := range stmts {
        if _, err := s.db.Exec(q); err != nil {
            return err
        }
    }
    return nil
}

func (s *sqliteStore) WriteSample(ctx context.Context, v UsageSample) error {
    if s == nil || s.db == nil {
        return errors.New("store not initialized")
    }
    if v.Ts == 0 {
        v.Ts = float64(time.Now().UnixNano()) / 1e9
    }
    h2 := 0
    if v.H2 {
        h2 = 1
    }
    _, err := s.insert.ExecContext(ctx,
        v.Ts, v.Rid, v.Model, v.Lane, v.Op, v.InputTokens, v.OutputTokens, v.DirtySeconds, v.StreamSeconds,
        v.TTFTMillis, v.Status, v.ErrType, v.Decision, v.RerouteMode, v.WarnPctAuto,
        v.GapSecondsP50, v.GapSecondsP95, v.GapSamples, v.Upstream, h2, v.HeaderMode,
    )
    return err
}

func (s *sqliteStore) ListSamples(ctx context.Context, since float64, model string) ([]UsageSample, error) {
    if s == nil || s.db == nil {
        return nil, errors.New("store not initialized")
    }
    q := `SELECT ts, rid, model, lane, op, input_tokens, output_tokens, dirty_s, stream_s, ttft_ms, status, err_type,
                 decision, reroute_mode, warn_pct_auto, gap_seconds_p50, gap_seconds_p95, gap_samples, upstream, h2, header_mode
          FROM usage_sample WHERE ts >= ?`
    args := []any{since}
    if model != "" {
        q += " AND model = ?"
        args = append(args, model)
    }
    q += " ORDER BY ts ASC"
    rows, err := s.db.QueryContext(ctx, q, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    out := []UsageSample{}
    for rows.Next() {
        var v UsageSample
        var h2int int
        if err := rows.Scan(&v.Ts, &v.Rid, &v.Model, &v.Lane, &v.Op, &v.InputTokens, &v.OutputTokens, &v.DirtySeconds, &v.StreamSeconds, &v.TTFTMillis, &v.Status, &v.ErrType, &v.Decision, &v.RerouteMode, &v.WarnPctAuto, &v.GapSecondsP50, &v.GapSecondsP95, &v.GapSamples, &v.Upstream, &h2int, &v.HeaderMode); err != nil {
            return nil, err
        }
        v.H2 = h2int != 0
        out = append(out, v)
    }
    return out, rows.Err()
}

// RollupHour compacts recent samples into hourly rollups using INSERT OR REPLACE.
// It recomputes the last 48 hours to stay idempotent and tolerate late arrivals.
func (s *sqliteStore) RollupHour(ctx context.Context, now time.Time) (int, error) {
    if s == nil || s.db == nil {
        return 0, errors.New("store not initialized")
    }
    since := now.Add(-48 * time.Hour).Unix()
    // Compute window_start as floor(ts/3600)*3600
    q := `INSERT OR REPLACE INTO usage_rollup_hour(
            window_start, model, in_tokens, out_tokens, dirty_s, stream_s, count, p50_ttft, p90_ttft, p99_ttft)
          SELECT win, model,
                 SUM(input_tokens), SUM(output_tokens), SUM(dirty_s),
                 SUM(CASE WHEN stream_s>0 THEN stream_s ELSE dirty_s END),
                 COUNT(*),
                 0.0, 0.0, 0.0
          FROM (
            SELECT CAST(FLOOR(ts/3600.0)*3600 AS INTEGER) AS win, *
            FROM usage_sample WHERE ts >= ?
          )
          GROUP BY win, model;`
    res, err := s.db.ExecContext(ctx, q, since)
    if err != nil {
        return 0, err
    }
    n, _ := res.RowsAffected()
    // Compute TTFT percentiles per window/model
    type key struct{ win int64; model string }
    buckets := map[key][]int{}
    rows, err := s.db.QueryContext(ctx, `SELECT CAST(FLOOR(ts/3600.0)*3600 AS INTEGER) AS win, model, ttft_ms
        FROM usage_sample WHERE ts >= ? ORDER BY win ASC, model ASC, ttft_ms ASC`, since)
    if err == nil {
        defer rows.Close()
        for rows.Next() {
            var win int64
            var model string
            var ttft int
            if err := rows.Scan(&win, &model, &ttft); err != nil { return int(n), err }
            k := key{win: win, model: model}
            buckets[k] = append(buckets[k], ttft)
        }
        for k, vals := range buckets {
            if len(vals) == 0 { continue }
            p50 := percentileInt(vals, 0.50)
            p90 := percentileInt(vals, 0.90)
            p99 := percentileInt(vals, 0.99)
            _, _ = s.db.ExecContext(ctx, `UPDATE usage_rollup_hour SET p50_ttft=?, p90_ttft=?, p99_ttft=?
                WHERE window_start=? AND model=?`, p50, p90, p99, float64(k.win), k.model)
        }
    }
    // retention: drop hourly windows older than CCP_ROLLUP_RETENTION_DAYS (default 30)
    days := retentionDays()
    if days > 0 {
        cutoff := now.Add(-time.Duration(days) * 24 * time.Hour).Unix()
        _, _ = s.db.ExecContext(ctx, `DELETE FROM usage_rollup_hour WHERE window_start < ?`, float64(cutoff))
    }
    return int(n), nil
}

// RollupDay compacts recent hourly windows into daily totals. Recomputes last 30 days.
func (s *sqliteStore) RollupDay(ctx context.Context, now time.Time) (int, error) {
    if s == nil || s.db == nil {
        return 0, errors.New("store not initialized")
    }
    since := now.Add(-31 * 24 * time.Hour)
    // Build from samples directly to avoid dependency on hourly completeness.
    q := `INSERT OR REPLACE INTO usage_rollup_day(date, model, in_tokens, out_tokens, dirty_s, stream_s, count)
          SELECT day, model,
                 SUM(input_tokens), SUM(output_tokens), SUM(dirty_s),
                 SUM(CASE WHEN stream_s>0 THEN stream_s ELSE dirty_s END),
                 COUNT(*)
          FROM (
            SELECT strftime('%Y-%m-%d', datetime(ts, 'unixepoch')) AS day, *
            FROM usage_sample WHERE ts >= ?
          )
          GROUP BY day, model;`
    res, err := s.db.ExecContext(ctx, q, float64(since.Unix()))
    if err != nil {
        return 0, err
    }
    n, _ := res.RowsAffected()
    // retention: drop daily windows older than CCP_ROLLUP_RETENTION_DAYS
    days := retentionDays()
    if days > 0 {
        cutoff := now.Add(-time.Duration(days) * 24 * time.Hour).UTC().Format("2006-01-02")
        _, _ = s.db.ExecContext(ctx, `DELETE FROM usage_rollup_day WHERE date < ?`, cutoff)
    }
    return int(n), nil
}

func retentionDays() int {
    v := os.Getenv("CCP_ROLLUP_RETENTION_DAYS")
    if v == "" { return 30 }
    var n int
    if _, err := fmt.Sscanf(v, "%d", &n); err == nil && n > 0 { return n }
    return 30
}

func (s *sqliteStore) ListRollupsHour(ctx context.Context, since float64, model string) ([]RollupHour, error) {
    q := `SELECT window_start, model, in_tokens, out_tokens, dirty_s, stream_s, count, p50_ttft, p90_ttft, p99_ttft
          FROM usage_rollup_hour WHERE window_start >= ?`
    args := []any{since}
    if model != "" {
        q += " AND model = ?"
        args = append(args, model)
    }
    q += " ORDER BY window_start ASC"
    rows, err := s.db.QueryContext(ctx, q, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    out := []RollupHour{}
    for rows.Next() {
        var r RollupHour
        if err := rows.Scan(&r.WindowStart, &r.Model, &r.InTokens, &r.OutTokens, &r.DirtyS, &r.StreamS, &r.Count, &r.P50TTFT, &r.P90TTFT, &r.P99TTFT); err != nil {
            return nil, err
        }
        out = append(out, r)
    }
    return out, rows.Err()
}

func (s *sqliteStore) ListRollupsDay(ctx context.Context, since float64, model string) ([]RollupDay, error) {
    // since is epoch seconds; convert to date string cutoff
    cutoff := time.Unix(int64(since), 0).UTC()
    cutoffDay := cutoff.Format("2006-01-02")
    q := `SELECT date, model, in_tokens, out_tokens, dirty_s, stream_s, count
          FROM usage_rollup_day WHERE date >= ?`
    args := []any{cutoffDay}
    if model != "" {
        q += " AND model = ?"
        args = append(args, model)
    }
    q += " ORDER BY date ASC"
    rows, err := s.db.QueryContext(ctx, q, args...)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    out := []RollupDay{}
    for rows.Next() {
        var r RollupDay
        var dateStr string
        if err := rows.Scan(&dateStr, &r.Model, &r.InTokens, &r.OutTokens, &r.DirtyS, &r.StreamS, &r.Count); err != nil {
            return nil, err
        }
        // Convert date to window_start epoch (UTC midnight)
        if t, err := time.ParseInLocation("2006-01-02", dateStr, time.UTC); err == nil {
            r.WindowStart = float64(t.Unix())
        }
        out = append(out, r)
    }
    return out, rows.Err()
}

func (s *sqliteStore) SizeBytes() int64 {
    fi, err := os.Stat(s.dbPath)
    if err != nil {
        return 0
    }
    return fi.Size()
}

// pruneSamplesBefore deletes samples older than the provided epoch seconds.
func (s *sqliteStore) pruneSamplesBefore(ctx context.Context, cutoff float64) (int64, error) {
    if s == nil || s.db == nil {
        return 0, errors.New("store not initialized")
    }
    res, err := s.db.ExecContext(ctx, `DELETE FROM usage_sample WHERE ts < ?`, cutoff)
    if err != nil {
        return 0, err
    }
    n, _ := res.RowsAffected()
    return n, nil
}

func (s *sqliteStore) Close() error {
    if s.insert != nil {
        _ = s.insert.Close()
    }
    if s.db != nil {
        return s.db.Close()
    }
    return nil
}
