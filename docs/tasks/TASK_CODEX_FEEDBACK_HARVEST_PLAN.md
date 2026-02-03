# Task: Codex Feedback Harvest Script & SOP Update

## Goal
Close the manual copy/paste gap by adding a helper that fetches Codex review comments for a PR into a local markdown file, and update SOP/AGENTS to require using it after `@codex review`.

## Planned changes (code + docs)
- **File**: `scripts/dev/fetch_codex_feedback.sh` (new)
  - Bash script to fetch review comments from `chatgpt-codex-connector` for a given PR and write `codex_feedback_<PR>.md` (paths/lines TBD). Use `gh api …/pulls/<PR>/comments --paginate` + `jq` filter. Handle no-comments case gracefully.
- **File**: `AGENTS.md` (root)
  - Add instruction: after `@codex review` runs, execute the fetch script for the PR and fix P0/P1 items from the generated file.
- **File**: `docs/SOP/worktree_hygiene.md`
  - Cross-link to the new fetch script usage, clarifying when to run it in the workflow.

## Tests / validation
- Run `bash scripts/dev/fetch_codex_feedback.sh <PR_WITH_CODEX_COMMENTS>` and confirm the file contains Codex comments (path/line/body) and prints “Saved to …”.
- Run on a PR without Codex comments; script should exit cleanly and not leave an empty file.
- Basic shellcheck/manual review for obvious errors.

## Out of scope
- No watcher/cron or post-push hook in this task (planned separately).
- No changes to push_with_codex.sh beyond docs.

## Handoff
- Update session handoff with commands run and location of any generated `codex_feedback_*.md` used in testing.
