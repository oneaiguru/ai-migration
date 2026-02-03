# Documentation TODO (2025-10-20 Session Wrap)

## Vision & Framing
- [x] `docs/System/vision_snap.md` — single paragraph restating the core question + links to DoD and Contracts.

## SOPs
- [x] `docs/SOP/uat_opener.md` — command-only checklist (pytest, behave, preview smoke, contracts spot-check, ledgers tick).
- [x] `docs/SOP/deliverables_bundle_checklist.md` — artefact list, redaction note, handoff path line.
- [x] `docs/SOP/scheduling_and_alerts.md` *(stub acceptable)* — job timing, alarms, lockfile/missed-run policy for future automation.

## System Foundations
- [x] `docs/System/schemas/universal_provider_schema.md` — UPS v0.1 field list.
- [x] `docs/System/stats/ci_acceptance.md` — preview CI/n/power requirements (hide CI when n < 3).
- [x] `docs/System/quality_rubric.md` — 1/3/5 quality definitions and examples.
- [x] `docs/System/quality/outcome_lab_taskset.md` — seed golden taskset + adjudication notes.
- [x] `docs/System/experiments/templates.md` — cross-over, time-stratified, difficulty-matched templates.
- [x] `docs/System/scheduler/overview.md` *(optional stub)* — high-level automation/alarms architecture.

## Session Boards & Planning
- [x] `docs/SessionBoards/<YYYY-MM-DD>_board.md` — create at next session start (UAT opener, Must-Ship, Ready Next, Stretch, validation matrix).

## Backlog Hygiene
- [x] Update `docs/Backlog/index.md` with Tags, Status, Impact, Effort columns (set values for newly added cards).
- [x] For each new backlog card, add “Preview should show …” (if applicable) and “Operator Quick Cue” block.
- [x] Optional specs: `docs/System/operations/status_board_design.md`, `docs/System/operations/alias_dry_run_spec.md`, `docs/System/reporting/token_budget_scorecard_spec.md`, `docs/System/handoff/bundle_diff_spec.md`.

## Recipes & Integration
- [x] `docs/Recipes/session_hooks.md` — start_window / close_window usage notes (if wrappers land).
- [x] `docs/Recipes/uat_bot_runner.md` — fixture vs live UAT instructions.
- [x] Cross-link `docs/Recipes/codex_status_capture.md` and `docs/Recipes/ccusage_ingest.md` to UPS + CI acceptance + experiment templates.

## Handoff / Progress Glue
- [x] Append “Bundle & Board” placeholders in `docs/SESSION_HANDOFF.md` (bundle path, board path).
- [x] Add a note in `progress.md` template referencing the Session Board link at close.

## Automation Foundations (if proceeding)
- [x] Draft backlog cards for Session Scheduler & Alarms, Calendar Adapter, UAT Bot, Collision/Lock Manager (if not already added).
- [x] `docs/System/scheduler/standing_jobs.md` — list of planned cron/launchd jobs.

