# Worktree Hygiene

Recommended policy
- One worktree per active PR/branch. Remove it as soon as the PR merges or is abandoned.
- Name worktrees after the branch, e.g. `git worktree add -b import-foo ../aa-foo origin/main`.
- Do not park local-only changes in worktrees. Commit or stash in the main repo instead.

Daily checklist
- After a PR merges/closes: `git fetch`, `git worktree list`, then `git worktree remove <path>` (use `--force` only if you accept losing local changes). Delete the branch if merged.
- If you need another PR for the same area, create a fresh branch + worktree; do not reuse the old one.

Helper script
- `scripts/dev/cleanup_worktrees.sh` lists all worktrees and marks which branches are merged into `origin/main` and whether they are dirty.
- `scripts/dev/cleanup_worktrees.sh --prune` removes merged & clean worktrees (skips the primary repo and any dirty/unmerged worktrees).

Codex review follow-up
- After pushing via `scripts/dev/push_with_codex.sh` and requesting `@codex review`, fetch Codex feedback before starting another PR:
  - `PR=<number> scripts/dev/fetch_codex_feedback.sh $PR` (use `REPO=<owner/repo>` if needed).
  - Fix all P0/P1 items from `codex_feedback_<PR>.md` on the same branch. For pure imports, P1/P2 can be deferred but must be documented in the PR body.
- Optional automation: set `CODEX_FETCH_AFTER_PUSH=1` (with `CODEX_FETCH_DELAY` seconds, default 600) when running `scripts/dev/push_with_codex.sh` to schedule the fetch helper in the background. Skips if no open PR for the branch or if `codex_feedback_<PR>.md` already exists.

Back-burner ideas (optional, not enabled)
- CI cleanup job to auto-remove merged + clean worktrees nightly (risk: might delete unpushed local changes).
- Per-agent worktree quota (e.g., max 1–2) to prevent clutter; adds friction.
- No-worktree rule: force single checkout; simplifies cleanup but increases branch swapping risk.
