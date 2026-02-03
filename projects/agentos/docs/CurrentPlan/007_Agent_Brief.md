# Next Agent Brief — Optimizer Hardening Follow-up (Brief #7)

## Start Here (read in order)
1. docs/CurrentPlan/007_PRO_TLDR.md — latest PRO guidance (Show & Ask, roadmap, risks).
2. docs/SessionBoards/007_board.md — current must-ship checklist.
3. docs/Tasks/tracker_cli_todo.md — Brief #7 block (new tasks + decision asks).
4. docs/SESSION_HANDOFF.md — section “PRO Review — 007”.
5. progress.md — entry “2025-10-20 PRO TLDR Brief 007 Intake”.
6. docs/System/scheduler/standing_jobs.md — ledger + window-audit jobs (JSON follow-up).

## UAT Opener (must be green before edits)
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live preview --window <W0-ID>`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-ID>`

## Ready-Next Must-Ship
Follow the TLDR protocol; treat each item as a discrete change/test bundle.

1. **Show & Ask evidence pack**
   - Run the validation commands above plus:
     - `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live window-audit --window <W0-ID>`
     - `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
   - Paste trimmed outputs (preview, decision card, window-audit, cost compare) into `docs/SessionBoards/007_board.md`, `docs/SESSION_HANDOFF.md`, and the outgoing PRD note draft.
2. **Document gating decisions**
   - Summarise in `docs/SESSION_HANDOFF.md` the two asks for PRD approval: (a) decision-card GO criteria, (b) proxy error whitelist vs 2xx rule.
   - Create TODO placeholders in `docs/Tasks/tracker_cli_todo.md` for follow-up once PRD responds.
3. **Window audit JSON mode**
   - Extend `tracker window-audit` with a `--format json` (or `--json`) switch that emits the same counts in machine-readable form.
   - Add pytest coverage and update docs (`docs/System/scheduler/standing_jobs.md`, `docs/Tasks/tracker_cli_todo.md`).

## Ready Next (after PRD confirms)
- Generalise proxy “healthy” status detection to 2xx responses; adjust parser/tests and docs.
- Draft a read-only duplicate-prune helper (mark canonical finalize row, no deletion) for follow-up window hygiene.

## Validation Matrix
- `PYTHONPATH=tracker/src pytest`
- `PYTHONPATH=tracker/src behave features`
- `python scripts/tools/proxy_cost_compare.py --data-dir data/week0/live --min 3`
- `PYTHONPATH=tracker/src python -m tracker.cli --data-dir data/week0/live window-audit --window <W0-ID> --json`
- `python scripts/tools/decision_card.py --data-dir data/week0/live --window <W0-ID>`

## Guardrails
- Stay observe-only; no proxy/routing changes until PRD approves substitutions.
- Keep ledgers/JSONL append-only; use CLI helpers for corrections.
- Record every PRD-facing artifact path in both `progress.md` and `docs/SESSION_HANDOFF.md`.
- For new CLI flags, update docs (`README`, scheduler jobs, SOPs) and add tests before closing the task.

## Handoff Requirements
- Leave the Show & Ask outputs and PRD note links in `docs/SessionBoards/007_board.md`.
- Update `progress.md` with the commands executed and pending approvals.
- Refresh the review bundle under `/Users/m/Downloads/agentos_review_20251020/`.
- Note outstanding PRD decisions and implementation follow-ups in `docs/SESSION_HANDOFF.md`.
