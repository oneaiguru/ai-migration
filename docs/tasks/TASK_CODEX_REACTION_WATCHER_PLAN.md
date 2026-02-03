# Task: Codex Reaction Watcher (Emoji-only approvals)

## Goal
Handle the case where Codex leaves no comment and only reacts with 👍 (or similar) to signal “no issues found.” Add a small helper/watcher that treats Codex reactions as approval so import PRs can progress without manual copy/paste.

## Planned changes
- **File**: `scripts/dev/watch_codex_feedback.sh` (or extend planned watcher)
  - In addition to review comments, poll PR reactions from `chatgpt-codex-connector`.
  - API: GitHub Reactions (issues) endpoint via `gh api repos/<owner>/<repo>/issues/<PR>/reactions --paginate --header "Accept: application/vnd.github+json"` (docs: https://docs.github.com/en/rest/reactions/reactions?apiVersion=2022-11-28). Filter for `+1`/`heart` by Codex user.
  - If Codex reaction exists and no P0/P1 comments are present, mark PR as approved (e.g., write `codex_feedback_<PR>.md` noting “no issues; emoji-only approval” and optionally add `codex-approved` label).
  - Guardrails: do not approve if any Codex comment contains P0/P1; keep state files to avoid duplicate actions.
- **Docs**: `docs/SOP/worktree_hygiene.md` (or new SOP note) briefly describe the emoji-only pathway and how the watcher handles it.

## Tests
- PR with Codex 👍 reaction and no comments: watcher writes feedback file and (optionally) adds `codex-approved` label.
- PR with Codex comments (including P0/P1): reaction is ignored; P0/P1 path remains.
- Idempotence: rerun does not duplicate files/labels.

## Out of scope
- Changing Mergify rules (covered elsewhere).
- Fully enabling cron by default; remains opt-in/manual.
