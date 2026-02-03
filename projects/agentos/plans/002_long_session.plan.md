# Plan 002 — Long Session (Automation, Parallel Agents, Subagent Telemetry)

Objectives
- Ship automation for ledger checkpoint + anomalies visibility.
- Enable safe parallel operation via `AGENT_ID` state isolation (+ lock notes).
- Instrument subagent POC (proxy telemetry ingest + preview block).

Schedule
- Window 1 (now → reset): `W0-CHN` — finish clean AFTER.
- Window 2 (post‑reset): `W0-CHP` — new BEFORE ≥+5 min after 00:01.
- Window 3 (optional follow‑on): `W0-CHQ` if scope remains.

Token Budget
- Per window target: 200k (~70% of 272k). Log plan/mid/final in `docs/Ledgers/Token_Churn_Ledger.csv`.

Phase A — Automation Pack (target ~3–4h)
- Add `scripts/automation/ledger_checkpoint.sh` to append plan/mid/final tokens, run `tracker churn --window <latest>`, append `docs/Ledgers/Churn_Ledger.csv`, and update `docs/SESSION_HANDOFF.md` with artifact paths.
- Preview: print `Anomalies: N` when `anomalies.jsonl` has entries; ensure `JsonlStore.append_anomaly` writes are in place at finalize.
- Update `docs/System/scheduler/standing_jobs.md` with exact snippets.
- Acceptance: `PYTHONPATH=tracker/src pytest`, `behave features` green; preview shows `Anomalies` with a synthetic negative‑delta test.

Phase B — Parallel Agents (AGENT_ID + lock) (target ~3–4h)
- Stamp `AGENT_ID` into alias snapshots (keep state under `data/week0/live/state/<agent>`); propagate via alias notes or a field.
- Document simple `flock` lock in wrappers to avoid collisions.
- Docs: extend `docs/Tasks/tracker_cli_aliases.md` and wiki pointer for setup.
- Acceptance: Behave scenario—Agent A/B both record BEFORE in same minute → distinct state, correct preview.

Phase C — Subagent telemetry (ingest only) (target ~4–5h)
- Do NOT implement any proxy/gateway. Assume the MITM addon exists and emits telemetry.
- Source: `logs/usage.jsonl` (fields: `ts, rid, lane, model, status, input_tokens, output_tokens, reason, latency_ms`).
- Parser/ingest: add `tracker/src/tracker/sources/proxy_telemetry.py` and CLI path `tracker ingest proxy-telemetry --stdin` → `proxy_telemetry.jsonl`.
- Preview: new block `Subagent Proxy` with `% routed`, latency p50/p95, error rate.
- Script: `scripts/tools/proxy_cost_compare.py` to compute GLM vs baseline per feature.
- Docs: `docs/Tasks/subagent_proxy_telemetry_ingest.md` with scope, inputs, commands, and acceptance.
- Acceptance:
  - `tail -n +1 logs/usage.jsonl | PYTHONPATH=tracker/src python -m tracker.cli ingest proxy-telemetry --window W0-CHN --stdin` writes stamped rows.
  - `preview` prints “Subagent Proxy” with routed %, p50/p95 latency, and error rate.
  - Cost compare script prints GLM vs baseline deltas for ≥3 matched features.

Reset Handling (between windows)
- At 00:06 local:
  - AFTER `W0-CHN`:
    `codex /status | PYTHONPATH=tracker/src python -m tracker.cli alias end codex --stdin --window W0-CHN --data-dir data/week0/live --state-dir data/week0/live/state --notes auto-after`
  - BEFORE `W0-CHP`:
    `codex /status | PYTHONPATH=tracker/src python -m tracker.cli alias start codex --stdin --window W0-CHP --data-dir data/week0/live --state-dir data/week0/live/state --notes auto-start`

Validation Matrix
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-XX>`
- `PYTHONPATH=tracker/src python -m tracker.cli churn --window <W0-XX> --provider <provider>`

Handoff Deliverables
- Scripts: `scripts/automation/ledger_checkpoint.sh`, optional `scripts/automation/window_timer.sh`, `scripts/tools/proxy_cost_compare.py`.
- Docs: scheduler SOP updates, alias guide (AGENT_ID + lock), subagent POC tracking doc.
- Review bundle at `~/Downloads/agentos_tmp_review` at close.
