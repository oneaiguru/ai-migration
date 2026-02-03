# Joint UAT — CCC ↔ AgentOS (10‑Minute Smoke)

Purpose: validate the bridge end‑to‑end with a local shim and the agreed schema.

## Preconditions
- CCC shim running on `:8082` with `configs/providers.r3.matrix.yaml` (429 variant optional).
- PUBKEY bundle available at `ClaudeCodeProxy/docs/LEGAL/PUBKEYS.json`.
- AgentOS installed via `uv pip install -e .[ccc]`.

## Steps
1. Fetch usage snapshot
   - `curl -s :8082/v1/usage > artifacts/test_runs/UAT/usage.json`
2. Fetch metrics snapshot
   - `curl -s :8082/metrics > artifacts/test_runs/UAT/metrics.prom`
3. Adapter ingest (no content upload)
   - `python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --output data/integration/uat_summary.json`
4. Verify summary contains model health keys
   - `warn_pct_auto`, `warn_pct_confidence`, `gap_seconds_p50`, `gap_seconds_p95`, `gap_samples`
5. Optional 429 path
   - Trigger one fallback and confirm `ccp_reroute_attempts_total` increments; note in UAT log.

## Evidence
- Store outputs under `artifacts/test_runs/UAT/` and attach summary path in `docs/SESSION_HANDOFF.md`.

— Keep this smoke short; deeper tests run in each repo separately. —
