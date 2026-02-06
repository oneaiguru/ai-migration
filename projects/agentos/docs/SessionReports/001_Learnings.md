
# 2025-10-19 — Learnings & Notes

## What we adjusted
- **Token ledger correction:** Append-only row documents the recalculated 164K tokens for the 2025-10-20 wrap session and explains the overcount.
- **Alias automation env knob:** Standardised on `TRACKER_ALIAS_STATE_DIR` so Behave, shell wrappers, and docs share the same override. No more `TRACKER_STATE_DIR` drift.
- **Tracker data-dir default:** CLI now defaults to `data/week0/live`, matching SOPs/recipes and reducing accidental writes to `data/week0/`.
- **Backlog mapping:** Added `Backlog/churn_instrumentation.md` and indexed it so the churn strategy ties to an execution task.
- **Token checkpoints:** Logged new backlog/TODO so plan vs mid vs final deltas stay visible.

## Things to watch
- Capture future Codex weekly usage with a real export when available; current weekly entry is tagged `backfill:weekly`.
- Git churn instrumentation is queued (see `docs/System/git_churn_strategy.md` + `docs/Tasks/git_churn_next_steps.md`)—needs implementation before we rely on churn metrics.

## Handoff tips for next agent
- Run the UAT opener (pytest, behave, preview) before touching Ready Next tasks (`docs/SessionBoards/2025-10-19_board.md`).
- Ready Next priorities: Stats/CI in preview → Outcome & quality capture → UPS v0.1 cross-links.
- Keep updating the TODO tracker (`docs/Tasks/tracker_cli_todo.md`) as you progress—new rows already list the above tasks.
