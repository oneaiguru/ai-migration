# ClaudeCodeProxy Agent SOP

- Source: `/Users/m/git/tools/ClaudeCodeProxy` → Target: `projects/ClaudeCodeProxy` (7 planned slices ≤1 MB).
- Branch state file: `branch_state_tools_claudecodeproxy.json` (update `pr_index/total_prs/branch/base_sha/state` each PR).
- Codex/Mergify flow: push, then request Codex review with `gh pr comment <pr#> --body '@codex review'`; fix P0s, list P1/P2 under “Deferred issues,” wait for Codex approval → `codex-approved` label → verify merge before next slice.
- Detailed project run commands + env live in `projects/ClaudeCodeProxy/AGENTS.md` (mirrors source doc map); keep new docs under the same folders (System, SOP, Tasks, SESSION_HANDOFF, etc.) once imported.

## Slice plan (one open PR at a time)
01 scaffold/config seeds/AGENTS (open: PR #31)  
02 node server + admin/bin scripts  
03 scripts/tooling (bash/js helpers)  
04 Go shim sources (no binaries/logs)  
05 artifacts/archive/fixtures/results (small seeds only; skip generated logs/bin/tars)  
06 main docs (System/SOP/Tasks/SESSION_HANDOFF/OPS-GUIDE/etc.)  
07 cc/docs and remaining notes

## Per-PR checklist
1) Confirm previous slice merged: `gh pr view <n-1> --json state -q .state` should be `MERGED`.  
2) Branch: `git checkout -b import-claudecodeproxy-0N-<scope>` (base = `origin/main`); docs-only helper PRs use `docs:claudecodeproxy:<scope>` titles.  
3) Scope+size: stage only the planned slice; `git diff --cached --stat` stays ≤1 MB.  
4) Syntax sanity: run lightweight checks on staged files (e.g., `python -m json.tool <config>`, `node -c` for JS if applicable).  
5) Update `branch_state_tools_claudecodeproxy.json` with new `pr_index`/branch/base SHA.  
6) Push, trigger Codex: `git push ...` then `gh pr comment <pr#> --body '@codex review'`.  
7) Fix P0s; keep P1/P2 in PR body under “Deferred issues.” Post a short status comment after fixes (e.g., “Fixed Codex P1s: <files>; re-requested @codex review.”).  
8) Verify merge before starting next slice: `gh pr view <n> --json state -q .state`.

## Doc pointers (when docs are imported)
- Entry points: `projects/ClaudeCodeProxy/docs/README.md` and `docs/SESSION_HANDOFF.md`.
- SOPs/playbooks: `projects/ClaudeCodeProxy/docs/SOP/README.md`.
- System refs/backlog: `projects/ClaudeCodeProxy/docs/System/README.md` and `docs/System/TODO.md`.
- Tasks/backlog: `projects/ClaudeCodeProxy/docs/Tasks/`.
- Ops/troubleshooting: `projects/ClaudeCodeProxy/docs/OPS-GUIDE.md`, `docs/TROUBLESHOOTING.md`, `docs/PROD-TESTS.md`.
- Keep any new docs within these folders; avoid ad-hoc directories.
