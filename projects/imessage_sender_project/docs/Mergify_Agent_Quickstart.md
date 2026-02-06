# Mergify + Codex Automation Quickstart

## Repo & Paths
- Monorepo: `/Users/m/aa`
- Config: `.mergify.yml` (on `main`)
- Scripts: `/Users/m/aa/scripts/dev/` (`push_with_codex.sh`, `request_codex_review.sh`)
- Branch state: `/Users/m/aa/branch_state_<repo>.json` (one per repo)
- Import briefs: `/Users/m/prepmonorepo/docs/import-briefs/`

## Mergify Rule (on main)
- Merges when all are true:
  - `base=main`
  - `label=codex-approved`
  - Optional: add `check-success=<CI_NAME>` lines for required checks (one per check)
- Action: squash merge with commit message `{{ title }} (#{{ number }}) — Codex-approved import`

## What To Do
1) Work in `/Users/m/aa` (use worktrees if `main` is dirty).
2) Confirm `gh` is authenticated as `oneaiguru` before hitting GitHub: `gh auth status -h github.com` should show that user; otherwise run `gh auth login --hostname github.com --web`.
3) Follow the brief for your repo in `/Users/m/prepmonorepo/docs/import-briefs/`.
4) Push via `scripts/dev/push_with_codex.sh` (or alias `git pushcodex`) to post a standalone `@codex review`.
5) Pull Codex inline comments after each review:
   ```bash
   gh api repos/oneaiguru/aa/pulls/<PR>/comments --paginate \
     --jq '.[] | select(.user.login==\"chatgpt-codex-connector\") | {path,line,body}'
   ```
6) Fix P0/CRITICAL in the PR. For import PRs, list P1/P2 under “Deferred issues” in the PR body; they do not block merge.
7) When Codex posts an approval phrase (“no issues found”, “didn’t find any major issues”, “all suggestions addressed”), the coordinator (cron) adds `codex-approved`. Mergify auto-merges once rule conditions are met.
8) Verify merge: `gh pr view <PR> --json state` should show `MERGED` before starting the next PR.

## Notes
- Ensure the Mergify app is enabled on this repo (Repo → Settings → Integrations → GitHub Apps should list Mergify). No app = no auto-merge.
- Size policy: 300–600 KB default; up to ~1 MB if pre-planned.
- One open PR at a time per repo; PR N+1 only after PR N is merged.
- Keep `branch_state_<repo>.json` updated with `pr_index/total_prs/branch/base_sha/state`.
