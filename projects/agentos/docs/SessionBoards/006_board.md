# Session Board — Brief #6

## UAT Opener
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-1`

## Must-Ship
1. **Percent formatting helper** — central `_format_percent` used in preview, decision-card echoes, and cost-compare output.
2. **Latency parsing refactor** — single-pass `_to_float` handling + tests.
3. **Proxy error whitelist** — tolerant status classification to prevent false positives.
4. **Pytest async scope config** — set `asyncio_default_fixture_loop_scope=function` to clear warnings.
5. **Churn CLI resilience** — graceful handling when commit range missing (warn + note, no crash).
6. **Window audit command** — `tracker window-audit --window <id>` to report duplicate finalize/snapshot entries.

## Ready Next
- Apply `_format_percent` across scripts to keep CSV/preview parity.
- Extend docs/Tasks/subagent_proxy_telemetry_ingest.md with observe-only guidance for additional agents.

## Stretch
- Prototype “decision=missing-commit-range” badge in Decision Card output.
- Draft follow-up plan for substitution trial criteria (after data thresholds are met).

## Validation Matrix
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`

## Links
- TLDR: `docs/CurrentPlan/006_PRO_TLDR.md`
- Brief: `docs/CurrentPlan/006_Agent_Brief.md`
- Tasks: `docs/Tasks/tracker_cli_todo.md`
- Handoff: `docs/SESSION_HANDOFF.md`
