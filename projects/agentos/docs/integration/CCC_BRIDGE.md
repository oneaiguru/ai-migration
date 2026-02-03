# CCC Bridge Operator Guide

This guide turns the CCC adapter implementation (Epics A1–A6) into a repeatable operator workflow. Read it alongside the integration roadmap and proposal deck.

## 1. Install & Environment

```bash
uv venv .venv
. .venv/bin/activate
uv pip install -e .[dev,ccc]
# Optional: add `[dev]` extras to pick up pytest/behave if not needed for smoke.
```

> **Packaging note:** until the root packaging story lands, export `PYTHONPATH=.` (or run commands from repo root) so the `agentos` package is importable.

## 2. Quick Smoke (5 Steps)

```bash
# 1. run unit/integration guard
pytest tests/integration/test_ccc_adapter.py

# 2. Behave parity (mirrors pytest scenarios)
PYTHONPATH=tracker/src:. behave features/ccc_adapter.feature

# 3. ingest CCP history (preview output only)
python agentos/tools/backfill_ccp.py --ccp-root ../ClaudeCodeProxy --usage-json ../ClaudeCodeProxy/fixtures/usage/ccc_usage_r35_full.json --output data/integration/ccp_metrics_summary.json

# 4. inspect summary
yq '.' data/integration/ccp_metrics_summary.json

# 5. launch sample session (see script below)
PYTHONPATH=tracker/src:. python scripts/tools/ccc_sample_session.py --privacy minimized --license tests/fixtures/licenses/minimized_pack.json
```

A stitched log for these commands should be attached to `artifacts/test_runs/` when completing a window. Inspect `model_health` in the summary to confirm keys such as `warn_pct_auto`, `warn_pct_confidence`, `gap_seconds_p50`, `gap_seconds_p95`, and `gap_samples` are present for each model.

## 3. Licensing Strategies

| Option | When | Steps |
| --- | --- | --- |
| **cryptography** (recommended) | CI / production | Install `cryptography`; load the published bundle `ClaudeCodeProxy/docs/LEGAL/PUBKEYS.json` via `LicenseClient(pubkeys={"default": PUBKEY})`. |
| **Callback verifier** | Air-gapped dev | Provide `LicenseClient(..., verifier=my_verify_func)` that wraps a local keyring. Useful for custom HSM or when avoiding extra deps. |
| **Skip licensing** | Local-only tier | Omit the license client; CCC client will run without entitlement checks (telemetry uploads remain disabled). Document the trade-off in handoff notes.

## 4. Privacy Tier Matrix (Recap)

```
Local      -> logs + summaries kept local, no uploads.
Minimized  -> uploads `metrics_summary.json` (counts/ratios). Requires `telemetry_minimized`.
Full       -> uploads events + summary, value payload redacted to summary/links. Requires `telemetry_full`.
```

Switch tiers via CLI flag or config and confirm behaviour using the Behave scenarios (local=no calls, minimized=single `/v1/metrics`, full=events+metrics).

## 5. Usage Fixture & Sample Session

The authoritative `/v1/usage` snapshot for tests lives at `tests/fixtures/ccc/ccc_usage_r35_full.json` (mirrors `ClaudeCodeProxy/fixtures/usage/ccc_usage_r35_full.json`). Use it with `--usage-json` when running the backfill tool or integration tests to verify model-health fields.

`scripts/tools/ccc_sample_session.py` starts a session, logs one turn, and prints the summary. Use it to sanity check credentials before running a full window.

## 6. Handoff Checklist

1. Run pytest + Behave + backfill trend (commands above).
2. Append artifacts under `artifacts/test_runs/<window>/` and update `docs/SESSION_HANDOFF.md`.
3. If telemetry uploads are enabled, capture sanitized payloads (`logs/usage.jsonl`) and note license ids involved.
4. Link back to this doc in the plan/handoff entry.

## References
- `docs/integration/INTEGRATION-ROADMAP-and-EXECUTION.md`
- `docs/integration/CCC_ADAPTER_PROPOSALS.md`
- `ClaudeCodeProxy/docs/System/integration/agentos-ccc-decision-log.md`
- Usage fixture bundle: `ClaudeCodeProxy/artifacts/agentos_bridge/agentos_bridge_ci.tar.gz`
- Licensing ADRs: `ClaudeCodeProxy/docs/LICENSING/ADR/*.md`
