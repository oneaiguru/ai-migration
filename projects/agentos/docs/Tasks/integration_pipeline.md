# Integration Pipeline (CCC ↔ AgentOS)

This file tracks the standing backlog for cross-repo integration work. Each slice should be scoped to D+1/D+2 and alternate between repos.

## Standing Backlog (ordered)
- R4 shared event contract (schema mirror + adapter changes) — AgentOS D+1
- Licensing bundle consumption (Ed25519 verify default) — AgentOS D+1/D+2
- Usage fixture ingest test + metrics health fields — AgentOS D+1
- Packaging switch to pyproject + extras — AgentOS D+2
- E2E smoke script + doc wiring — AgentOS D+2
- CCC follow-on: persistence/aggregation (per CCC roadmap) — CCC next slice
- AgentOS: churn instrumentation & subagent telemetry polish — follow

## Validation Commands
- `pytest tests/integration/test_ccc_adapter.py`
- `PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature`
- `python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --output data/integration/ccp_metrics_summary.json`
- When online: `scripts/tools/ccc_e2e_smoke.sh`

## Evidence
- Attach run outputs under `artifacts/test_runs/<slice>/`.

— Keep this backlog flat; update links when plans/docs move. —
