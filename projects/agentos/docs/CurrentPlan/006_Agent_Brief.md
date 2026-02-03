# Next Agent Brief — Polishing & Proxy Hardening (Brief #6)

## Start Here (read in order)
1. docs/CurrentPlan/006_PRO_TLDR.md — PRO review & ops guidance.
2. docs/Tasks/tracker_cli_todo.md — confirm Phase A/B/C are ✅ and see new polishing tasks.
3. plans/005_long_session.plan.md — reference for completed work; use as context only.
4. docs/System/scheduler/standing_jobs.md — updated ledger checkpoint & wiki pointers.
5. docs/SESSION_HANDOFF.md — sections “2025-10-20 W0-CHP-1 Execution” and “PRO Review — 006”.
6. progress.md — entry “2025-10-20 W0-CHP-1 Feature Window”.

### UAT Opener (must be green before edits)
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP-1`

## Ready-Next Must-Ship
Follow the TLDR’s “Immediate next actions”. Treat each as a discrete change set with tests.

1. **Percent Formatting Helper**
   - Add `_format_percent(value, digits=1)` (or similar) in CLI/utils.
   - Replace ad-hoc formatting in preview (routed/errors), decision-card echoes, and cost-compare output.
   - Update tests to expect consistent strings (`50%`, `12.5%`).

2. **Latency List Refactor**
   - Update `parse_proxy_telemetry_stream` to compute latency lists with a single `_to_float` pass.
   - Add pytest coverage verifying behaviour with mixed types/strings.

3. **Proxy Error Classification**
   - Introduce a whitelist/enum for “ok” statuses (e.g., `ok`, `success`, `200`, `routed`, `cached`).
   - Extend parser tests for both baseline and GLM events.

4. **Pytest Async Scope Warning**
   - Set `asyncio_default_fixture_loop_scope = function` in `pytest.ini` (or config).
   - Ensure CI/local pytest runs clean without warnings.

5. **Churn CLI Resilience**
   - If commit hashes missing, print a single-line warning, skip git diff, and append a ledger row with `decision=missing-commit-range` (no crash).
   - Add pytest case covering the warning path.

6. **Window Audit Helper (read-only)**
   - Add `tracker window-audit --window <id>` that summarizes snapshots/finalize rows and flags duplicates.
   - Document usage in `docs/System/scheduler/standing_jobs.md` or a new SOP snippet.

## Nice-to-Have (if time remains)
- Wire `_format_percent` into decision-card script for consistent CLI vs. scripts output.
- Capture churn-warning behaviour in docs/Tasks/subagent_proxy_telemetry_ingest.md “Notes” section.

## Validation Matrix
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window W0-CHN`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window W0-CHP`

## Guardrails
- Observe-only telemetry (no automated routing/substitutions).
- Maintain append-only ledgers/JSONL; never edit existing rows directly.
- Document any new CLI surface area in `docs/Tasks/tracker_cli_todo.md`, `docs/SESSION_HANDOFF.md`, and the wiki pointers.
- Keep percent/latency helpers provider-agnostic to avoid regressions elsewhere.

## Handoff
- After each task, update `docs/Tasks/tracker_cli_todo.md` with a one-line status.
- Append commands + artefacts to `docs/SESSION_HANDOFF.md` (under a new dated section) and keep `progress.md` succinct (only non-routine notes).
- Refresh the review bundle in `/Users/m/Downloads/agentos_review_20251020/` at session end.

