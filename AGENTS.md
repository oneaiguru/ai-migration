# AGENTS

**Push workflow**
- When creating a brand-new PR, you may push via `gh` (no wrapper) to open it.
- Once a PR exists, use `scripts/dev/push_with_codex.sh` (or `git pushcodex`) for all subsequent pushes so the @codex review comment is posted.
- Before pushing or using `gh`, ensure the active account is `oneaiguru`: `gh auth status -h github.com` (switch with `gh auth switch -u oneaiguru` if needed).
- Exception: when explicitly instructed to merge Codex feedback tooling directly to `main` (no PR), commit on `main` and push as directed.

Worktree hygiene
- One worktree per active PR/branch; remove it as soon as the PR merges/closes. Name worktrees after the branch (e.g., `git worktree add -b import-foo ../ai-foo origin/main`).
- Do not park unpushed changes in worktrees; commit/stash in the main repo instead.
- Use `scripts/dev/cleanup_worktrees.sh` to list status; add `--prune` to remove merged & clean worktrees (skips dirty/unmerged and the primary repo). See `docs/SOP/worktree_hygiene.md` for details.

Codex feedback follow-up
- After Codex reviews/reacts, run `scripts/dev/fetch_codex_feedback.sh <PR_NUMBER>` (set `REPO=<owner/repo>` if not default) and fix all P0/P1 from the generated `codex_feedback_<PR>.md` before starting another PR. For pure imports, P1/P2 may be deferred but must be noted in the PR body.
- If the user says "fb", run `scripts/dev/fetch_codex_feedback.sh <PR_NUMBER>`, read `codex_feedback_<PR>.md`, apply feedback, and make a new commit (push with the wrapper unless the direct-to-main exception applies).

PR sizing
- Keep PRs small (prefer 300–600 KB, <=1 MB) and skip vendored/build artifacts.
