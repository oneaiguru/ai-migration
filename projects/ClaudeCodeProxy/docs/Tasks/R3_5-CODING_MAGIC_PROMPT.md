Title
Magic Prompt — Coding Agent (R3.5 Quota Hardening)

Context
- Branch: feature/r3-hud-and-tokens (stay on this branch, no new branch needed).
- All prep docs live under docs/Tasks/, docs/Architecture/, docs/System/; review `docs/Tasks/R3_5-QUOTA-HARDENING.md` before editing.
- Keep tokens as the only enforcement unit; hours remain telemetry.
- Respect existing JSON/Prometheus schemas; only add fields.

Mission
Implement R3.5 features end-to-end:
1. Reroute policy modes (`preemptive|run2cap|hybrid`) with logging + cooldown.
2. Calibration sampler + gap metrics + auto warn pct.
3. Usage event schema updates, CLI output, docs.
4. Prometheus counters for reroute decisions.
5. GLM limit probe ingestion + fixtures.
6. Tests/docs refreshed per plan.

Implementation Checklist

A. server routing logic (`services/go-anth-shim/cmd/ccp/main.go`)
- Add helper to determine active reroute mode (`selectRerouteMode`). Default `hybrid`, support env `CCP_REROUTE_MODE`.
- Track quota headroom (rolling + weekly) with new helper (call into quotas engine snapshot) before first attempt.
- Implement behaviour modes:
  * preemptive: if `q.ShouldBlock(model)` → reroute immediately (emit `decision:"reroute_policy"`).
  * run2cap: always try preferred lane; reroute only after upstream limit (429) or explicit `markQuota429`.
  * hybrid: allow one overshoot attempt when headroom > predicted cost; after 429 trigger cooldown (`CCP_QUOTA_COOLDOWN_SEC`, default 300). Store cooldown expiry per model.
- Extend `usageEntry` with fields (`reroute_mode`, `quota_headroom_pct`, `warn_pct_auto`, `preferred_attempt`, `wasted_retry_ms`, `cooldown_active`, etc.). Ensure appendUsage writes them for both decision and final entries.
- Emit structured log for reroute decision events; follow `USAGE_EVENT_SCHEMA` updates.
- Update fallback path to increment new metrics counters and to respect cooldown timer (skip immediate retry if still cooling down).

B. Quotas engine (`services/go-anth-shim/cmd/ccp/quotas.go`)
- Extend `usageSample` + `modelCounters` to keep calibration stats (gap ring, confidence, cooldown map).
- Add sampler goroutine: start in `InitQuotas` (exposed method `StartCalibrator(ctx)` maybe invoked from main). Hourly (config env `CCP_CAL_SAMPLE_MINUTES`, default 60). Probes should update bias table without sending network calls (use existing sample data).
- Maintain and expose `gap_seconds_p50/p95`, `gap_samples`, `warn_pct_auto`, `warn_pct_confidence`. Compute warn pct using configured `WarnPct` plus bias adjustments; fallback to config when low confidence.
- Extend `/v1/usage` JSON to include new fields. Keep backwards compatibility (add new keys only).
- Provide helper to fetch headroom + warn pct for main.go (e.g., `q.headroom(model)` returning struct).

C. Metrics (`services/go-anth-shim/cmd/ccp/metrics.go`)
- Add counters: `ccp_preferred_attempt_total`, `ccp_rerouted_on_limit_total`, `ccp_wasted_retry_ms_total`.
- Wire increments from main.go at appropriate points (before attempt, after reroute, after wasted retry).

D. GLM probe ingestion
- Enhance `scripts/experiments/glm-limit-probe.sh` to log upstream status, hour-of-day, calculated headroom difference.
- Add Go helper in quotas engine to parse `results/GLM_LIMIT_PROBE.md` (if present) and seed bias table.
- Update `docs/Experiments/GLM_LIMIT_PROBE.md` with new table format + instructions to rerun once per release.

E. CLI & fixtures
- Update `bin/cc status` (and `--speeds`) to display `warn_pct_auto`, gap stats, current reroute mode, cooldown timers.
- Extend fixtures: `fixtures/usage/ccc_usage_with_speeds.json`, Prometheus snippet, new calibration doc `docs/tests/R3-CALIBRATION-SAMPLER.md`.
- Document new env vars and behaviour in `docs/QUOTAS.md`, `docs/OPS-GUIDE.md`, `docs/tests/R3-FALLBACK-429.md`, `docs/SESSION_HANDOFF.md`.

F. Tests
- Go unit tests covering reroute modes (`main_extra_test.go` add table-driven cases) verifying decision logs + cooldown.
- Tests for calibration sampler (simulate samples; assert warn_pct_auto, gap metrics) within quotas tests.
- Tests for GLM ingest (parsing results file) — add to quotas_test or new file.
- Update Prometheus scrape test to include new counters.
- Regenerate/extend docs fixtures as needed.

Validation Commands
```
cd services/go-anth-shim
GOPROXY=direct GOSUMDB=off go test ./...
make check-licenses
scripts/experiments/glm-limit-probe.sh --model glm-4-6 --repeat 20 --tokens 50 --sleep 1
cc status --speeds --debug-quota
```

Handoff Requirements
- Ensure `logs/usage.jsonl` entries show new fields for both decision + completion events.
- Update `docs/SESSION_HANDOFF.md` with summary + validation evidence (planner already adding high-level summary; coding agent adds results).
- Keep git status clean except for expected files; avoid committing binaries/large logs.

Notes
- Document any deviation or open question in SESSION_HANDOFF.
- If cooldown state stored in-memory only, note restart limitation in docs.
- Keep metrics additive; do not rename existing series.
