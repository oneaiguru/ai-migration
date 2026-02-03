# Task: Ingest Proxy Telemetry (No Proxy Work)

Scope
- Do not build a proxy/gateway. Assume the MITM addon runs elsewhere.
- Your work is limited to ingestion, preview, and a simple cost comparison script.

What to do
- Source of truth: consume newline JSON from `logs/usage.jsonl`. Fields:
  - `ts, rid, lane, model, status, input_tokens, output_tokens, reason, latency_ms`.
- Parser/ingest:
  - Add `tracker/src/tracker/sources/proxy_telemetry.py`.
  - Wire CLI: `PYTHONPATH=tracker/src python -m tracker.cli ingest proxy-telemetry --window <W0-XX> --stdin`.
  - Persist to `data/week0/live/proxy_telemetry.jsonl` (append‑only, stamped with schema/tool versions).
- Preview block:
  - Add a “Subagent Proxy” section showing routed_to_glm %, latency p50/p95, error rate.
- Cost compare:
  - `scripts/tools/proxy_cost_compare.py` computes GLM vs baseline token totals for matched features and prints deltas.

What NOT to do
- Don’t implement or modify a proxy, gateway, or routing logic.
- Don’t touch HTTPS proxy/CA settings or API key handling.

Inputs and paths
- Telemetry: `logs/usage.jsonl` (stdin to the ingest command).
- Handoff/runbook (external): `docs/HANDOFF-T1-T3.md`
- PRD/scope (external): `docs/mitm-subagent-offload/02-PRD-SUBAGENT-OFFLOAD.md`
- Addon spec (external): `docs/mitm-subagent-offload/05-MITM-ADDON-SPEC.md`

CLI examples
- Ingest: `tail -n +1 logs/usage.jsonl | PYTHONPATH=tracker/src python -m tracker.cli ingest proxy-telemetry --window W0-CHN --stdin`
- Preview: `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`

Acceptance
- Ingest creates `data/week0/live/proxy_telemetry.jsonl` with stamped rows. ✅ (see latest W0-CHN entry)
- Preview shows “Subagent Proxy” with routed %, latency p50/p95, error rate. ✅ (`tracker/tests/test_cli_flow.py::test_preview_includes_subagent_proxy_block`)
- Cost compare script outputs GLM vs baseline deltas for at least 3 matched features. ✅ (`tracker/tests/test_proxy_cost_compare_script.py`)

Notes
- Follow ADR‑004 lag buffer on window boundaries; record anomalies if telemetry time ranges conflict with window timing.
- Maintain absolute paths in docs; avoid env var path indirection per ADR‑007.
- Parser now treats `ok`, `success`, `200`, `routed`, and `cached` statuses (or reasons) as healthy; everything else is counted toward error rate.
- Latency values are normalized via a single `_to_float` pass; malformed entries surface as `latency:invalid` in the parsed errors list (telemetry row is still kept).
