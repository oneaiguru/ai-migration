# Session Board — Brief #7

## UAT Opener
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-ID>`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-ID>`

## Must-Ship
1. **Show & Ask evidence pack** — capture preview, decision card, window-audit, and cost-compare outputs for PRD briefing.
2. **Document gating decisions** — log PRD questions (GO criteria, proxy error whitelist) in handoff + TODOs.
3. ✅ **Window audit JSON format** — `tracker window-audit` now accepts `--format json` / `--json`; pytest coverage and scheduler docs updated.

## Ready Next
- Expand proxy “healthy” statuses to the 2xx range once PRD approves.
- Draft read-only duplicate-prune helper plan (mark canonical finalize rows).

## Stretch
- Prototype optional `decision=missing-commit-range` badge in decision-card output (once gating confirmed).
- Capture telemetry health counters (latency parse failures, error-rate anomalies) for future optimizer dashboards.

## Validation Matrix
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live window-audit --window <W0-ID> --json`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-ID>`

## Links
- TLDR: `docs/CurrentPlan/007_PRO_TLDR.md`
- Brief: `docs/CurrentPlan/007_Agent_Brief.md`
- Tasks: `docs/Tasks/tracker_cli_todo.md`
- Handoff: `docs/SESSION_HANDOFF.md`

## Progress Notes
- 2025-10-20: Captured Codex window `W0-CHP-2`; preview/decision card/window-audit/cost-compare outputs recorded in `docs/SESSION_HANDOFF.md` and artifacts under `artifacts/test_runs/W0-CHP-2/`.
- 2025-10-20: Added JSON output support for `tracker window-audit` with CLI flags, tests (`test_window_audit_json_format`), and scheduler doc updates.
- 2025-10-20: Ingested proxy telemetry as `W0-MITM-1` (measurement-only) from ClaudeCodeProxy/logs; prepared closing commands for `W0-CHP-3` (see handoff).
