Title
CCC Store — SQLite Persistence & Rollups (R4)

Overview
- Embedded SQLite with WAL enabled backs persisted usage samples and rollups.
- Default on via CCP_PERSIST=1. DB path defaults to logs/ccp.sqlite3 (override CCP_DB_PATH).
- Background ticker (CCP_ROLLUP_INTERVAL, default 5m) computes hourly rollups; daily rollups at UTC day change.

Schema
- usage_sample(ts REAL, rid TEXT, model TEXT, lane TEXT, op TEXT,
  input_tokens INT, output_tokens INT, dirty_s REAL, stream_s REAL, ttft_ms INT,
  status INT, err_type TEXT, decision TEXT, reroute_mode TEXT,
  warn_pct_auto REAL, gap_seconds_p50 REAL, gap_seconds_p95 REAL, gap_samples INT,
  upstream TEXT, h2 INT, header_mode TEXT, PRIMARY KEY(ts, rid))
- usage_rollup_hour(window_start REAL, model TEXT, in_tokens INT, out_tokens INT,
  dirty_s REAL, stream_s REAL, count INT, p50_ttft REAL, p90_ttft REAL, p99_ttft REAL,
  UNIQUE(window_start, model))
- usage_rollup_day(date TEXT, model TEXT, in_tokens INT, out_tokens INT,
  dirty_s REAL, stream_s REAL, count INT, UNIQUE(date, model))

Read Endpoints
- GET /v1/usage/samples?since=<epoch>&model=<opt>
- GET /v1/usage/rollups?granularity=hour|day&model=<opt>&since=<opt>
  Returns derived TPS per row: out_elr_tps (out/stream_s), out_dirty_tps (out/dirty_s).

Metrics
- ccp_store_writes_total, ccp_store_write_errors_total
- ccp_rollup_duration_seconds (histogram; granularity label)
- ccp_store_size_bytes (gauge)

SLOs
- Insert p95 < 2ms for 10k writes (on typical laptop; WAL on)
- Rollup hour p95 < 100ms for fresh windows

Retention
- Samples TTL: `CCP_SAMPLE_TTL_DAYS` (default `7`) — samples older than this are pruned by the background job.
- Rollups recomputed idempotently for recent windows (48h for hour, 31d for day). `CCP_ROLLUP_RETENTION_DAYS` controls rollup retention (default `30`).
