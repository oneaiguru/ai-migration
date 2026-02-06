# Task: Post-Push Codex Fetch Hook

## Goal
Optionally trigger Codex feedback harvesting automatically shortly after a push/@codex review, so agents don’t forget to run the fetch script.

## Planned changes
- **File**: `scripts/dev/push_with_codex.sh`
  - After successful push and `@codex review` comment, optionally schedule a background fetch (sleep N seconds/minutes) that calls `scripts/dev/fetch_codex_feedback.sh <PR>`. Guard: only if PR exists; do not overwrite existing feedback file.
  - Add flag/ENV to disable (default off or off in this task; decide in implementation).
- **File**: `docs/SOP/worktree_hygiene.md` or new SOP note
  - Document the hook behaviour, opt-in flag, and how to disable.

## Tests
- Dry run with no PR found: script exits without errors.
- With PR and Codex comments: after delay, feedback file is created and contains comments.
- Ensure no duplicate fetch if file already exists.

## Out of scope
- No cron/watcher (separate task).
- No change to Codex/Mergify flow.

## Handoff
- Record test commands/results; note default delay/flags.
