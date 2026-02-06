# Dual Repository Strategy – Phase 8

## Overview
Phase 8 introduces a trimmed production build that removes demo-only tabs. Maintain two repos:

1. **Parity Demo Repo** (`employee-management-parity`, current project)
   - Purpose: exploratory work, demo modules, future phases (analytics, gallery).
   - Deployment: existing Vercel project (`employee-management-parity-*.vercel.app`).
   - Branching: continue using `main` with feature branches as needed.

2. **Production Trimmed Repo** (`employee-management-production`, GitHub `granin/employee-management-production`)
   - Purpose: customer-facing build with only contractual scope (Employees module).
   - Deployment: new Vercel project (e.g., `employee-management-production-*.vercel.app`).
   - Branching: protect `main`; cherry-pick or merge selective fixes from the demo repo.

## GitHub Account Guidance
- Create the trimmed repo under the new GitHub account for clean ownership. Keep the legacy demo repo under the current account for historical reference.
- Configure repository secrets (Vercel tokens, CI credentials) separately. Do not reuse tokens across accounts.
- Use Git remotes to sync fixes:
  ```bash
  # inside demo repo clone
  git remote add production git@github.com:<new-account>/employee-management-production.git
  git fetch production
  # cherry-pick fix from demo main into production main
  git checkout production/main
  git cherry-pick <commit>
  ```

## Vercel Deployment Notes
- Each repo gets its own Vercel project to keep environments isolated.
- Configure environment variables independently; avoid referencing demo-only modules in the trimmed build.
- Record production URL in both repos’ handoff files so QA knows which build is which.

## Sync Checklist
- [x] Document any shared assets (schemas, datasets) that must be copied when syncing repos (см. инвентаризацию влияния при триме в `docs/Tasks/phase-8-trimmed-demo-discovery.md`).
- [x] Maintain a CHANGELOG or merge log in the trimmed repo noting commits pulled from the demo repo (фиксирован в планах Phase 8; создаём `CHANGELOG.md` при первом синке).
- [x] Re-run validation (build + Playwright) after every sync to catch placeholder dependencies early (прописано как обязательный шаг в Phase 8 планах и handoff-логах).
