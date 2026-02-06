# AGENTS

Last updated: 2026-01-22

Update this file before first run. This is repo-specific guidance for the loop.

Run/test commands
- install: N/A (no package manager yet)
- lint: N/A
- typecheck: N/A
- test: N/A
- other: `./loop.sh` (Ralph loop runner)

Tooling
- node: 23.11.0
- pnpm: 9.10.0
- python: 3.9.1 (if needed)
- docker: 23.0.5 (if needed)

Workflow
- Use the Ralph loop (PROMPT_build.md).
- One role per loop; stop after each role.
- Do not edit specs unless explicitly asked.
- Delegate tasks to subagents; review outputs before edits.
- Log all work in progress.md and docs/SESSION_HANDOFF.md.

Git/push
- Before `gh` or pushes, confirm the active account is `oneaiguru`: `gh auth status -h github.com` (switch with `gh auth switch -u oneaiguru`).
- New PRs: may push via `gh` (no wrapper).
- Existing PRs: use `scripts/dev/push_with_codex.sh` (or `git pushcodex`) so @codex review comment is posted.
- Direct-to-main only when explicitly instructed.
- Worktree hygiene: one worktree per PR/branch; remove when merged (use `scripts/dev/cleanup_worktrees.sh`, add `--prune` to remove merged & clean).
- After Codex review, run `scripts/dev/fetch_codex_feedback.sh PR_NUMBER` and fix all P0/P1 before starting another PR (if user says "fb", run it immediately).
