## Metadata
- Task: R2 — Quotas, Budget Guards, Light Metrics
- Role: Executor (follow exactly; no scope creep into R3)

## Read Order (open these at the lines below)
- docs/OPS-GUIDE.md:84 — cc model/providers; toggles and probes
- docs/PROD-TESTS.md:18 — readiness gates and proofs
- docs/ROUTING-POLICY.md:1 — precedence + invariants
- docs/QUOTAS.md:1 — quotas semantics + acceptance
- services/go-anth-shim/cmd/ccp/main.go:100 — server struct (add quotas fields)
- services/go-anth-shim/cmd/ccp/main.go:736 — routes() (wire R2 endpoints)
- services/go-anth-shim/cmd/ccp/main.go:315 — handleMessages (call RecordUsage)
- services/go-anth-shim/cmd/ccp/metrics.go:1 — metrics handler (extend if needed)

## Deliverables (thin slice)
1) quotas.go — engine + endpoints
   - Types: quotasFile (windows, models), counters (rolling ring, weekly agg)
   - Loader precedence: `CCP_QUOTAS_FILE` → `~/.config/ccp/quotas.json` → `configs/quotas.json` → example
   - API:
     - `GET /v1/usage` — summary by model (rolling/weekly %, tokens, reqs)
     - `GET /v1/quotas` — active config + timestamps
     - `POST /v1/quotas/reload[?file=/abs/path.json]`
     - Optional: `POST /v1/dev/sim-usage` (behind `CCP_DEV_ENABLE=1`)
   - Hooks: `RecordUsage(model, in, out, dirtyDur, streamDur, ttftDur)` from main.go after completion (streamDur defaults to dirtyDur when streaming data unavailable)

2) CLI: `cc status`
   - Print table: model, provider, rolling %, weekly %, ETA to rolling reset
   - Read from `GET /v1/usage`

3) Tests
   - Loader precedence; corrupt file → error; hot reload swaps limits
   - Rolling prune integrity; weekly hours/tokens accounting
   - Simulate usage and confirm 80% warn, 100% block flags in `GET /v1/usage`

4) Docs
   - QUOTAS.md already added; update acceptance commands
   - Add brief to OPS-GUIDE (where to check status)

## Exact Edits (apply in order)
1) Add file: services/go-anth-shim/cmd/ccp/quotas.go
   - Expose: `InitQuotas(root string)`, `WireQuotaHTTP(mux *http.ServeMux)`, `RecordUsage(model string, in, out int, dirty, stream, ttft time.Duration)`
   - Add loader: `loadQuotas(paths []string) (*quotasFile, string, error)` with precedence

2) main.go (server struct + routes)
   - Add fields: `q *quotasEngine`, `devEnable bool`
   - In `newServer()`: `srv.q = InitQuotas(repoRoot())`, `srv.devEnable = os.Getenv("CCP_DEV_ENABLE")=="1"`
   - In `routes()`: `WireQuotaHTTP(mux)`
   - In `handleMessages()` completion path: call `RecordUsage(model, inputTok, outputTok, dirtyDur, streamDur, ttftDur)` immediately after logging the completion (streamDur defaults to dirtyDur for non-stream responses)

3) bin/cc
   - Add `cc status` subcommand calling `GET /v1/usage` and pretty‑printing (table + `--json`)

## Validation (run in this order)
```bash
cd services/go-anth-shim && GOPROXY=direct GOSUMDB=off go test ./...

# Start shim on :8082 (or switch to a free port)
./services/go-anth-shim/bin/ccp serve --port 8082 &

# Load example quotas and simulate usage (dev only)
export CCP_DEV_ENABLE=1
node scripts/dev/simulate-usage.js --model claude-haiku-4.5 --in 1000 --out 1500 --repeat 20 --interval 20

# Inspect
curl -s http://127.0.0.1:8082/v1/usage | jq
./bin/cc status

# Proofs
make summarize && make verify-routing
```

## Acceptance
- `cc status` shows models with rolling/weekly % and ETA; warn at ≥80 %; 100 % block flag present.
- `/v1/usage` counters increment with simulated load; hot reload changes caps.
- Decision logs remain body‑free; header isolation preserved.

## Rollback
- Remove `quotas.go`, revert changes in `main.go` and `bin/cc`.
- Delete `configs/quotas.json` if created for local tests.
