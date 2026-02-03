# START — Next Agent (Brief #6)

Follow this checklist before writing code.

## Read First
1. `docs/CurrentPlan/006_Agent_Brief.md`
2. `docs/CurrentPlan/006_PRO_TLDR.md`
3. `docs/Tasks/tracker_cli_todo.md` (Brief #6 section)
4. `docs/SESSION_HANDOFF.md` — “PRO Review — Brief #6”
5. `plans/005_long_session.plan.md` (reference only; already delivered)

## UAT Opener
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-1`

## Execute — Must-Ship Tasks
Work through the Brief #6 list in order:
1. Implement `_format_percent` helper and reuse across preview/decision-card/cost-compare (update tests).
2. Refactor proxy latency parsing to a single `_to_float` pass.
3. Introduce proxy status whitelist (avoid false-positive errors).
4. Add `asyncio_default_fixture_loop_scope = function` to pytest config.
5. Harden `tracker churn` when commit hashes missing (warn + skip diff, mark in ledgers).
6. Implement `tracker window-audit --window <id>` (read-only duplicate report) and document usage.

## Validation Matrix
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-1`

## Logging & Handoff
- Update `docs/Tasks/tracker_cli_todo.md` as tasks complete.
- Record commands + artefacts in `docs/SESSION_HANDOFF.md` (new dated section) and keep `progress.md` succinct.
- Refresh `/Users/m/Downloads/agentos_review_20251020/` with touched files + tests at session end.

## Guardrails
- Telemetry remains observe-only; no automated routing/substitutions.
- Append-only discipline for ledgers/JSONL; use CLI helpers for corrections.
- Keep wiki pointers (`~/wiki/dotfiles/AliasSystem.md`, `~/wiki/replica/work/KnownQuirks.md`) in sync when documenting new helpers.
