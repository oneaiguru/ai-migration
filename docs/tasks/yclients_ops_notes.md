# YClients ops notes (worktrees & branch hygiene)

- Work in the main repo (`~/ai`) only; do not create worktrees for this task. Earlier worktrees were pruned; verify with `git worktree list` (should show only `~/ai`).
- Before starting any new branch/PR, confirm the previous PR is merged. PR 107 is merged; PR 108/109 are open; do not duplicate.
- Follow SOPs: keep one branch per PR; prune worktrees after merge; push via `scripts/dev/push_with_codex.sh`; no direct pushes to `main`.
- Check PR state before new work; if Codex flags merged/closed PRs, branch again off `main`.
