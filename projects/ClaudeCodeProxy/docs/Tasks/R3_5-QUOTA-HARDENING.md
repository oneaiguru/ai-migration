Title
R3.5 — Quota Hardening: Reroute Policy, Calibration, GLM Limit Clarity

Why
We shipped speeds + tokens-only quotas in R3. Next we need evidence-driven policies so agents finish work without surprise blocks, and our warnings line up with real provider caps.

Scope Guardrails
- Stay in-memory; no R4 persistence yet.
- Tokens drive enforcement; hours remain telemetry-only (still surfaced in usage JSON and docs).
- Preserve SSE/header invariants and existing logging schema keys; only add fields.
- Target files: services/go-anth-shim/cmd/ccp/{main.go,quotas.go,metrics.go,main_extra_test.go,usage_tokens.go}, docs/{QUOTAS.md,OPS-GUIDE.md,SESSION_HANDOFF.md,tests/R3-FALLBACK-429.md,tests/R3-SPEEDS-FIXTURES.md}, scripts/experiments/glm-limit-probe.sh, docs/Experiments/GLM_LIMIT_PROBE.md.

Deliverables (detailed checklist)

1. CCP reroute policy switch (CCP_REROUTE_MODE)
   - Implement modes `preemptive`, `run2cap`, `hybrid` (default `hybrid`).
   - Add helper `server.selectRerouteMode()` that reads env + optional CLI flag (future-proof) and exposes mode to decision log + metrics.
   - Behaviour per mode:
     * preemptive — current behaviour: if quotas `ShouldBlock` fires, immediately reroute to Anth (or configured secondary) without attempting preferred lane.
     * run2cap — always attempt preferred lane; reroute only after upstream returns vendor limit (429/LimitExceeded) or we log exhaust; no cooldown.
     * hybrid — attempt preferred lane until warn threshold headroom drops below predicted need; allow one overshoot attempt once per cooldown window; on 429 flip lanes and sleep for cooldown period. Cooldown default 5m (env `CCP_QUOTA_COOLDOWN_SEC`, override numeric seconds, 0 disables).
   - Record decisions: extend `usageEntry` with `reroute_mode`, `reroute_attempt`, `quota_headroom_pct`, `quota_warn_threshold`, `cooldown_active`.
   - Logging: write structured log line `decision:"reroute_policy"` with `mode`, `attempt`, `headroom_pct`, `cooldown_remaining_sec` to align with USAGE_EVENT_SCHEMA additions.

2. Quota calibration sampler & bias table
   - New sampler (goroutine) in quotas engine: hourly per model (configurable env `CCP_CAL_SAMPLE_MINUTES`, default 60) running lightweight probe via internal `RecordUsage(… probe=true)` hook. For now reuse shim demand by scheduling synthetic sample if we have traffic gap; do not send external network call.
   - Track gap metrics: for each model maintain ring buffers of `(calc_reset_eta_sec - observed_reset_eta_sec)` for rolling and weekly windows. Observed reset derived from vendor 429s + GLM experiment ingest.
   - Compute `gap_p50`, `gap_p95`, `gap_samples`, `warn_pct_auto`, `warn_pct_confidence` inside quotas snapshot.
   - Expose in `/v1/usage` under `modelView`: add `gap_seconds_p50`, `gap_seconds_p95`, `gap_samples`, `warn_pct_auto`, `warn_pct_confidence` (float 0–1). Keep additive vs current schema.
   - Provide helper `autoWarnPct(model string) float64` returning tuned warn threshold (fallback to config `WarnPct` if insufficient confidence). Hybrid policy consults this.

3. Usage event schema alignment
   - Update `usageEntry` struct + appendUsage() call sites with fields:
     * `headroom_pct_rolling`, `headroom_pct_weekly`
     * `reroute_mode`, `reroute_decision` ("preemptive|run2cap|hybrid"), `decision_reason`
     * `preferred_attempt` (bool), `wasted_retry_ms` (int), `cooldown_next_ts` (float seconds epoch)
   - Ensure JSON log writes obey `docs/System/contracts/USAGE_EVENT_SCHEMA.md`; add new fields there with short definitions + compatibility note.
   - Update CLI (`bin/cc status`, `cc status --speeds`) to display `warn_pct_auto` and gap metrics; add `--debug-quota` flag to dump current policy mode + cooldown timers.

4. Instrumentation & Prometheus
   - metrics.go: add counters/gauges
     * `ccp_preferred_attempt_total{model,lane}` — increments on attempts to preferred lane while in warn+ state.
     * `ccp_rerouted_on_limit_total{model,mode}` — increments on reroute triggered by quota/429.
     * `ccp_wasted_retry_ms_total{model}` — accumulate overshoot retry latency (hybrid only).
   - Ensure metrics handler includes HELP/TYPE lines and remains additive.
   - Update existing observe path to emit counters when reroute or cooldown triggers (tie into new metrics helper).

5. Calibration data surfaces & CLI
   - Extend `/v1/usage` JSON example fixture (`fixtures/usage/ccc_usage_with_speeds.json`) with new fields.
   - Update `docs/QUOTAS.md` and `docs/OPS-GUIDE.md` to describe modes, auto warn %, gap definitions, CLI output, cooldown env var. Include quick troubleshooting steps.
   - Update `docs/tests/R3-FALLBACK-429.md` to assert new logging fields + metrics counters.
   - Add new markdown `docs/tests/R3-CALIBRATION-SAMPLER.md` summarising expected sampler behaviour and validation command.

6. GLM limit probe integration
   - Finalise `scripts/experiments/glm-limit-probe.sh`: add columns for upstream status, gap vs calc, hour-of-day; support `--vendor glm` (future extension).
   - Append runbook results to `results/GLM_LIMIT_PROBE.md` with template table (timestamp, repeat, first_429_index, calc_headroom, inferred_multiplier).
   - Add ingestion hook in quotas calibration to read `results/GLM_LIMIT_PROBE.md` (when present) and seed bias table.
   - Tests: add unit parsing test for ingest (Go) and CLI doc example verifying the markdown is read.

Acceptance & Validation
- go test ./... (from services/go-anth-shim) — ensure new unit/integration tests for reroute modes, calibration sampler, GLM ingest pass.
- make check-licenses (unchanged but run to confirm).
- Manual smoke:
  1. Set `CCP_REROUTE_MODE=preemptive` | `run2cap` | `hybrid` and send mock traffic; inspect `logs/usage.jsonl` for decision fields.
  2. Force 429 using existing fallback fixture; verify `ccp_rerouted_on_limit_total` increments and `/v1/usage` surfaces warn_pct_auto & gap stats.
  3. Run `scripts/experiments/glm-limit-probe.sh --repeat 120 --tokens 50` and ensure results file updates + `/v1/usage` gap metrics adjust.
- Update docs/SESSION_HANDOFF.md with summary + commands to reproduce checks.

Open Questions to resolve during implementation
- Do we clamp auto warn pct when bias table has < min samples? (default: fallback to configured WarnPct; log confidence <0.5.)
- Confirm 429 detection across vendors: rely on HTTP status + vendor-specific error codes (Anth vs GLM). Document final approach.
- Ensure cooldown persists across process restart? (Out of scope for R3.5; document as limitation.)

Timeline Guidance
- Phase 1: Implement reroute modes + metrics + tests.
- Phase 2: Calibration sampler + /v1/usage schema & CLI updates.
- Phase 3: GLM probe ingestion + docs + fixtures.
- Phase 4: Validation + handoff notes.
