Title
R4 — Durable Persistence, Rollups, and Cross‑Process Aggregation

Why
R3/R3.5 delivered in‑memory usage, speeds, and calibration with clean JSON/Prometheus
surfaces. R4 adds durable storage and rollups so we can:
- survive restarts with zero data loss;
- aggregate across long horizons (hour/day/week) and multiple shim processes;
- expose stable queries for AgentOS ingestion and operators.

Non‑Goals (R4)
- No server‑side charts/GUI.
- No breaking schema changes; additive keys/endpoints only.
- No external DB dependency (embedded only). A separate “aggregator” binary is acceptable.

Design Overview
- Storage: embedded SQLite (default) behind a `Store` interface. Optional JSONL WAL fallback for
  ultra‑light environments (kept for testing only).
- Ingestion: every completion event persists a `usage_sample` row; periodic rollups summarize
  into `usage_rollup_hour` (per model) and `usage_rollup_day`.
- Query: new read‑only endpoints `/v1/usage/samples?since=` and `/v1/usage/rollups` return JSON
  snapshots for AgentOS/ops. Existing `/v1/usage` remains the in‑memory live view.
- Cross‑process aggregation: optional standalone `ccp-agg` job reads multiple DB files (or a dir),
  merges rollups, and emits a consolidated rollup JSON file for dashboards.

Store Schema (SQLite)
- Tables
  - `usage_sample(ts REAL, rid TEXT, model TEXT, lane TEXT, op TEXT,
     input_tokens INT, output_tokens INT, dirty_s REAL, stream_s REAL, ttft_ms INT,
     status INT, err_type TEXT, decision TEXT, reroute_mode TEXT,
     warn_pct_auto REAL, gap_seconds_p50 REAL, gap_seconds_p95 REAL, gap_samples INT,
     upstream TEXT, h2 INT, header_mode TEXT, PRIMARY KEY (ts, rid))`
  - `usage_rollup_hour(window_start REAL, model TEXT,
     in_tokens INT, out_tokens INT, dirty_s REAL, stream_s REAL, count INT,
     p50_ttft REAL, p90_ttft REAL, p99_ttft REAL,
     UNIQUE(window_start, model))`
  - `usage_rollup_day(date TEXT, model TEXT, in_tokens INT, out_tokens INT,
     dirty_s REAL, stream_s REAL, count INT, UNIQUE(date, model))`
- Indices: `CREATE INDEX IF NOT EXISTS sample_model_ts ON usage_sample(model, ts)`

Files & Touch Points (CCC)
- New: `services/go-anth-shim/cmd/ccp/store.go` (interface + helpers)
- New: `services/go-anth-shim/cmd/ccp/store_sqlite.go` (SQLite impl)
- Update: `services/go-anth-shim/cmd/ccp/main.go` (init store, write on completion)
- Update: `services/go-anth-shim/cmd/ccp/quotas.go` (optionally source samples from store for
  long‑horizon rollups; live window still uses in‑memory samples)
- New endpoints: wire under `WireQuotaHTTP` or a new mux group (read‑only):
  - `GET /v1/usage/samples?since=<epoch>`
  - `GET /v1/usage/rollups?granularity=hour|day&model=<opt>&since=<opt>`
- Metrics: `ccp_store_writes_total`, `ccp_store_write_errors_total`, `ccp_rollup_duration_seconds`,
  `ccp_store_size_bytes` (gauge).
- CLI: (optional) `cc db status`, `cc db export --csv` for operator convenience.

Config & Flags
- `CCP_PERSIST=1` (default on): enable SQLite persistence.
- `CCP_DB_PATH` (default `logs/ccp.sqlite3`): DB file location.
- `CCP_ROLLUP_INTERVAL` (default `5m`): background rollup cadence.
- `CCP_ROLLUP_RETENTION_DAYS` (default `30`): keep rollups; samples trimmed via weekly TTL.

Background Jobs
- Writer: called inline from completion path (single tx per sample; WAL mode enabled).
- Roller: background goroutine ticks every `CCP_ROLLUP_INTERVAL`, compacts last N minutes into
  `usage_rollup_hour`; at midnight, consolidate to `usage_rollup_day`.

Cross‑Process Aggregator (optional R4 deliverable)
- New tiny cmd `services/go-anth-shim/cmd/ccp-agg`:
  - Inputs: directory of `*.sqlite3` (one per shim) or JSONL exported via `cc db export`.
  - Output: `results/rollups/rollup_hour.json`, `rollup_day.json` (merged by model).
  - Acceptance: deterministic merge; idempotent reruns.

API Contracts (additive)
- `/v1/usage` (unchanged existing live view)
- `/v1/usage/samples` → `{ models: { <model>: [{ts, lane, op, input_tokens, output_tokens, status, decision, ...}] }, ts }`
- `/v1/usage/rollups` → `{ granularity: "hour|day", models: { <model>: [{window_start, in_tokens, out_tokens, out_elr_tps, out_dirty_tps, count}] }, ts }`

AgentOS Contract Impact
- Optional: AgentOS may read `/v1/usage/samples` for near‑real‑time views.
- No breaking changes; flat model‑health fields remain in `/v1/usage` and can also be computed from rollups.

Testing Plan
1) Unit
   - store_sqlite: open/close, create schema, write/read sample, WAL on, indices present.
   - rollup: compute hour/day from controlled samples; verify TPS math, count, and windows.
2) Integration
   - Start shim with `CCP_PERSIST=1`; send N samples; assert DB file created; `/v1/usage/samples?since` returns rows.
   - Rollup tick: force via env; assert `/v1/usage/rollups?granularity=hour` returns expected aggregates.
3) Migration/Backfill
   - Tool `cc db import --jsonl logs/usage.jsonl`; verify row counts.
4) Performance
   - Soak: 10k insertions; p95 insert latency < 2ms; rollup tick p95 < 100ms; DB size reasonable (~few MB).
5) Metrics
   - Expose counters/gauges; verify scrape; error counter increments on forced failures.

Acceptance
- All unit/integration tests green; performance and error counters within budget.
- `/v1/usage/samples` and `/v1/usage/rollups` documented and returning correct shapes.
- /v1/usage remains stable (additive only); AgentOS ingest unaffected.

Deliverables
- Code: `store.go`, `store_sqlite.go`, handler wiring, metrics.
- CLI (optional): `cc db *` helpers.
- Docs: QUOTAS/OPS‑GUIDE updates (persistence notes), new `docs/System/STORE.md` (schema + SLOs).
- Tests: store/rollup unit tests; integration tests for endpoints; soak script under `scripts/perf/`.

Rollout & Backout
- Rollout: default `CCP_PERSIST=1` with write‑behind; if problems, set `CCP_PERSIST=0` to revert to in‑memory only (no endpoint changes).
- Backout: DB file can be left in place; future rebuilds can import JSONL.

Open Questions
- Do we want a `min_samples_reached` field surfaced in `/v1/usage` (R4) for calibration transparency? (Default: yes.)
- Should rollups include percentiles precomputed (TTFT p50/p90/p99) or expose raw histograms? (Default: include TTFT p50/p90/p99.)

Timeline (2–3 days)
Day 1: storage interface + SQLite impl; write path; unit tests; basic metrics.
Day 2: rollups + endpoints + integration tests; docs; soak perf.
Day 3 (buffer): cross‑process aggregator (optional), polish, and JOINT UAT addendum.

