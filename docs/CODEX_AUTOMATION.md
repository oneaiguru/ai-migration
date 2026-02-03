# Codex → Coordinator → Mergify Loop (Canonical SOP)

## Overview
1) Agent opens/imports PR (≤300–600 KB; up to ~1 MB if planned). PR title: `import:<repo>:NN-scope`.
2) Push via `scripts/dev/push_with_codex.sh` (or alias `git pushcodex`) to auto-post `@codex review`.
3) Codex reviews. Inline comments + replies are fetched via `gh api repos/<owner>/<repo>/pulls/<PR>/comments --paginate` (review comments endpoint).
4) Agent fixes P0/CRITICAL; defers P1/P2 on imports in the PR body (“Deferred issues”). Push again via `push_with_codex.sh`.
5) Coordinator (cron) runs every 5 min, adds `codex-approved` when:
   - Codex approval phrase seen (“no issues found”, “didn’t find any major issues”, “all suggestions addressed”, “ready to merge”, “looks good to merge”).
   - No later blocking review/comments (including replies) from humans.
   - Required checks green if `REQUIRED_CHECKS` is set.
   - Optional: branch_state gating (pr_index sequence, requires_rebase=false).
6) Mergify merges when `base=main` and `label=codex-approved` (and `check-success=<CI>` if configured).
7) Verify merge: `gh pr view <PR> --json state` == `MERGED` before starting next PR.

## Files & Paths
- Config: `.mergify.yml` (main)
- Coordinator: `/Users/m/prepmonorepo/coordinator.py`
- Cron wrapper: `/Users/m/ai/scripts/dev/run_coordinator.sh` (PATH + GH_TOKEN sourcing)
- Codex triggers: `/Users/m/ai/scripts/dev/push_with_codex.sh`, `/Users/m/ai/scripts/dev/request_codex_review.sh`
- Branch state (optional gating): `/Users/m/ai/branch_state_<repo>.json`

## Required Env
- Set `GH_TOKEN` (or `GITHUB_TOKEN`) in an untracked file (`~/.ai-coordinator-env` or `/Users/m/ai/.env`).
- Cron entry (example): `*/5 * * * * cd /Users/m/ai && ALLOWED_REPOS=oneaiguru/ai REQUIRED_CHECKS= COORDINATOR_APPROVE=false ./scripts/dev/run_coordinator.sh >> /Users/m/ai/coordinator.log 2>&1`
- Coordinator env knobs: `ALLOWED_REPOS`, `REQUIRED_CHECKS` (empty if no CI), `COORDINATOR_APPROVE` (false by default), `BRANCH_STATE_DIR` (optional).

## Mergify Rule (on main)
```yaml
pull_request_rules:
  - name: auto-merge codex-approved imports
    conditions:
      - base=main
      - label=codex-approved
      # add check-success=<CI_NAME> when CI is enforced
    actions:
      merge:
        method: squash
```

## Agent Shortcuts
- Always push with `git pushcodex` (alias for `scripts/dev/push_with_codex.sh`).
- To read Codex inline comments (and replies):
  ```bash
  gh api repos/oneaiguru/ai/pulls/<PR>/comments --paginate \
    --jq '.[] | {id, in_reply_to_id, author:.user.login, path, line, body}'
  ```
- Keep size policy (300–600 KB; ≤1 MB if planned) and one-open-PR-per-repo sequencing.
- Before pushing a PR branch, rebase onto `origin/main` to avoid stale SHAs that block Mergify; after rebase, push (wrapper) and let Codex/coordinator/Mergify run.
