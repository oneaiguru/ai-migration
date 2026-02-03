# Task: Worktree Hygiene Rollout

## Goal
Enforce “one worktree per active PR” hygiene and prevent abandoned worktrees from piling up.

## Deliverables
- Stable helper: `scripts/dev/cleanup_worktrees.sh` executable in repo root.
- SOP coverage: README link + `docs/SOP/worktree_hygiene.md` (policy, daily checklist, back-burner options).
- Root `AGENTS.md` with concise rules/pointer.
- Verification: run the helper in listing mode; confirm no extra worktrees remain after cleanup.

## Steps
1) Tooling
   - Ensure `scripts/dev/cleanup_worktrees.sh` is executable and in `scripts/dev/`.
   - Run `bash scripts/dev/cleanup_worktrees.sh` (expect a clean listing with only the primary repo).
2) Docs
   - Keep README “Worktree hygiene” section current (names, script path, SOP link).
   - SOP lives at `docs/SOP/worktree_hygiene.md`; add any new learnings there.
   - Root `AGENTS.md` stays terse (rules + script pointer).
3) Workflow
   - For each PR opened: create a worktree named after the branch.
   - On PR merge/close: remove the worktree and delete the branch (if merged); rerun the helper to confirm.
4) Monitoring (optional/back-burner)
   - Weekly/CI run of `cleanup_worktrees.sh --prune` for merged+clean worktrees only.
   - Consider per-agent worktree quota (max 1–2) if clutter returns.

## Status
- Helper/script/docs added and tested (listing run).
- All extra worktrees removed; only primary repo remains.
- Import dashboards: everything imported; only `reference-mcp` stays pending.

## Acceptance criteria
- Script runs without errors; `cleanup_worktrees.sh --prune` would be a no-op on a clean repo.
- README/SOP/AGENTS all point to the same rules and script path.
- No stray worktrees present after PR merges; check with `git worktree list` and helper output.
