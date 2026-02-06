Title
Magic Prompt — Coding Agent (R4 Persistence & Rollups)

Context
- Branch: feature/r4-persistence (create).
- Goal: add durable SQLite store + rollups + read endpoints; keep existing JSON/prom surfaces additive.
- Read: docs/Tasks/R4_PERSISTENCE_AND_AGGREGATION.md for design/acceptance.

Tasks (file-scoped)

1) Storage interface
  - File: `services/go-anth-shim/cmd/ccp/store.go`
  - Define `Store` interface: `Open(path)`, `WriteSample(UsageSample)`, `ListSamples(since, model)`, `RollupHour(now)`, `RollupDay(now)`, `Close()`.
  - Define `UsageSample` struct mirroring fields we persist.

2) SQLite implementation
  - File: `services/go-anth-shim/cmd/ccp/store_sqlite.go`
  - Open DB with WAL/journal; `PRAGMA journal_mode=WAL;` create schema if missing; implement methods.
  - Add prepared statements; batch `WriteSample` per call.

3) Wire write path
  - File: `services/go-anth-shim/cmd/ccp/main.go`
  - Init store if `CCP_PERSIST=1`; on completion append, call `store.WriteSample` with captured fields.
  - Add background ticker (goroutine) to trigger `RollupHour` at `CCP_ROLLUP_INTERVAL`.

4) Read handlers (additive)
  - File: `services/go-anth-shim/cmd/ccp/quotas.go` (or new handlers file)
  - `GET /v1/usage/samples?since=&model=`; optional model filter.
  - `GET /v1/usage/rollups?granularity=hour|day&model=&since=`; compute derived TPS fields server-side for convenience.

5) Metrics
  - File: `services/go-anth-shim/cmd/ccp/metrics.go`
  - Add counters/gauges: `ccp_store_writes_total`, `ccp_store_write_errors_total`, `ccp_rollup_duration_seconds`, `ccp_store_size_bytes`.

6) Tests
  - New: `services/go-anth-shim/cmd/ccp/store_sqlite_test.go` — open/close, read/write, rollups.
  - New: `services/go-anth-shim/cmd/ccp/usage_persistence_test.go` — endpoint tests for samples/rollups.
  - Soak script: `scripts/perf/soak_persist.sh` — 10k writes and rollups; print p95 insert/rollup latency.

7) Docs
  - Update `docs/OPS-GUIDE.md` with persistence note and DB path.
  - Add `docs/System/STORE.md` describing schema, SLOs, retention.

Validation
```bash
cd services/go-anth-shim
GOPROXY=direct GOSUMDB=off go test ./...
CCP_PERSIST=1 CCP_DB_PATH=logs/ccp.sqlite3 ./bin/ccp serve --port 8082 &
curl -s :8082/v1/dev/sim-usage -H 'content-type: application/json' -d '{"model":"claude-haiku-4.5","in":100,"out":60,"repeat":4}'
curl -s :8082/v1/usage/samples?since=$(python - <<<'import time; print(time.time()-3600)') | jq .
curl -s :8082/v1/usage/rollups?granularity=hour | jq .
curl -s :8082/metrics | rg 'ccp_store|ccp_rollup'
```

Acceptance
- DB file created; samples written; endpoints return expected JSON.
- Tests and soak are green; metrics exposed; in‑memory `/v1/usage` unchanged.

Notes
- Keep changes additive; do not change existing field names.
- Feature flag allows backout (`CCP_PERSIST=0`).

