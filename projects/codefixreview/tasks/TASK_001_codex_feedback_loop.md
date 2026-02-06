# Task 001: Close the Codex Feedback Loop (Harvest & SOP)

## Goal
Eliminate manual copy/paste of Codex review comments by adding a fetch helper and SOP guidance so agents always fix P0/P1 from an auto-generated feedback file before moving on.

## Scope (planning only)
- Add helper script: `scripts/dev/fetch_codex_feedback.sh` to pull inline review comments for a PR from `chatgpt-codex-connector` via `gh api repos/<owner>/<repo>/pulls/<PR>/comments --paginate` and emit `codex_feedback_<PR>.md` (path/line/body). Handle no-comment case cleanly.
- Update root `AGENTS.md`: after `@codex review`, run the fetch script and fix P0/P1 from the generated file. Keep push_with_codex.sh requirement.
- Update SOP: cross-link in `docs/SOP/worktree_hygiene.md` (or a new SOP note) to show when to run the fetch and how to handle P1/P2 on pure imports (document defer policy).

## Out of scope
- Post-push hook/watcher automation (tracked separately).
- Mergify rule changes.

## Validation plan
- Run the script on a PR with Codex comments; file contains expected entries and prints “Saved to …”.
- Run on a PR without Codex comments; exits without leaving an empty file.
- Shellcheck/manual review for obvious errors.
