# Small Tools Import Wave (Mergify + Codex)

Work in `/Users/m/ai` using the Mergify/Codex flow (see `docs/Mergify_Agent_Quickstart.md`).

## Common Rules
- Size: 300–600 KB; up to ~1 MB if needed (otherwise split into 02/03).
- One PR per repo at a time; PR N+1 only after PR N is merged.
- Copy tracked files only (respect `.gitignore`); exclude venv/.git/caches/logs/large binaries.
- Add/refresh `AGENTS.md` (summary, install/run, tests or “none”, deps).
- Update `branch_state_<repo>.json` with `pr_index/total_prs/branch/base_sha/state=open`.
- Use `scripts/dev/push_with_codex.sh` (or `request_codex_review.sh`) to push and post a standalone `@codex review`.
- Fetch Codex inline comments:
  ```bash
  gh api repos/oneaiguru/ai/pulls/<PR>/comments --paginate \
    --jq '.[] | select(.user.login=="chatgpt-codex-connector") | {path,line,body}'
  ```
- Fix P0/CRITICAL in the PR. P1/P2 on imports → list under “Deferred issues” in the PR body; do not block merge.
- PR title: `import:<slug>:01-all`; body: scope, size band, validations, deferrals; comment `@codex review`.
- Coordinator labels on approval; Mergify merges labeled PRs when app is active. Verify `MERGED` before next repo.

## Repos (1 PR each unless split needed)
- CodeInterpreterZip2LocalFolder
- GenAICodeUpdater
- MyCodeTree2LLM
- MyCodeTree2LLM 2
- genai-coder
- autotester
- groq_whisperer
- reference-mcp
- scheduler
- panewiki
- taskflow
- (fastwhisper already handled; skip)

## Briefs
- Check `/Users/m/prepmonorepo/docs/import-briefs/` for an existing brief (scheduler, taskflow, etc.).
- If none, use `/Users/m/prepmonorepo/docs/import-briefs/IMPORT_AGENT_BRIEF_TEMPLATE.md`.

## Mergify Reminder
- Ensure the Mergify GitHub App is enabled on `oneaiguru/ai`; otherwise, merge codex-approved PRs manually until active.
- `.mergify.yml` merges when `base=main` and `label=codex-approved` (add `check-success=<CI_NAME>` lines when CI checks are defined).
