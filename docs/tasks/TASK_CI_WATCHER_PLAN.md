# Task: Codex Comment Watcher (Optional)

## Goal
Plan a lightweight watcher/cron that detects new Codex review comments on open PRs and drops/updates `codex_feedback_<PR>.md` files to trigger fix loops.

## Planned changes
- **File**: `scripts/dev/watch_codex_feedback.sh` (new)
  - Poll open PRs (`gh pr list --state open`) and fetch Codex comments; write/update feedback files only when new comments appear. Track state (e.g., `.codex_seen_<PR>`) to avoid duplicates.
- **File**: `docs/SOP/worktree_hygiene.md` (or new SOP entry)
  - Document how to run the watcher manually or via cron, and how to clean up state files.

## Tests
- Simulate PR with Codex comments: watcher creates/updates feedback file once; rerun is idempotent.
- PR with no comments: no files created; exit cleanly.
- State file prevents duplicate triggers.

## Out of scope
- Enabling cron by default; this is opt-in/manual.
- Hooking into push/pipeline (covered by other tasks).

## Handoff
- Document test commands and where state files are written; ensure cleanup instructions are clear.
