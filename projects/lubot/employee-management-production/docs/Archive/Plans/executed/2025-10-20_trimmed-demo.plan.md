# Plan: Phase 8 Trimmed Demo – Production Repo

## Preconditions
- Discovery doc `docs/Tasks/phase-8-trimmed-demo-discovery.md` is complete and linked in `docs/SESSION_HANDOFF.md`.
- Phase 7 polish (overlay borders/tests/docs) is signed off in `PROGRESS.md`.
- New GitHub organisation/account is available (or confirm continued use of the current one) with access tokens ready for cloning/pushing.

## Required Reading
1. `docs/Tasks/phase-8-trimmed-demo-task.md`
2. `docs/Archive/Demo-Modules-Trim-Plan.md`
3. `docs/System/parity-roadmap.md`
4. Discovery doc cited above
5. `docs/SESSION_HANDOFF.md` (latest entry)

## Steps
1. **Clone & Initialise Production Repo**
   - Create `employee-management-production` repository under the chosen GitHub account.
   - Mirror current `main` into the new repo (`git clone --mirror` or manual copy) and push an initial commit.
   - Configure CI and Vercel project (new production URL) but do not deploy yet.

2. **Navigation Cleanup**
   - Remove demo-only tabs from `src/App.tsx`.
   - Delete or stub imports for photo gallery, performance, status, certifications, skills modules.
   - Ensure routing falls back to the Employees tab.

3. **Component Pruning**
   - If keeping the build lean, delete unused components and adjust exports/tests accordingly.
   - Update Storybook config to exclude removed stories (or add trimmed variants if required).

4. **Docs & Evidence**
   - Update repository README, `docs/System/project-structure.md`, parity roadmap, and screenshot references to explain the dual-repo approach.
   - Capture new screenshots if navigation changes.

5. **Validation**
   - Run `npm run build`.
   - Execute Playwright Employees slice: `npm run test -- --project=chromium --workers=1 --grep "Employee list"`.
   - Optional: run Storybook build to ensure trimmed stories still compile.

6. **Deploy & Record**
   - Deploy trimmed build via Vercel (`vercel deploy --prod --yes`).
   - Record URLs in the production repo handoff file and cross-link from the demo repo.

7. **Handoff**
   - Update production repo `PROGRESS.md` / `docs/SESSION_HANDOFF.md` with outcomes, commands run, and next steps.
   - Back in the demo repo, add a note referencing the trimmed repo and deployment.

## Rollback Strategy
- Keep the trimmed repo branch separate; if issues arise, revert to the initial mirror commit and reapply changes step by step.
- Demo repo remains untouched; no rollback required there.

## Acceptance Criteria
- Demo-only tabs removed in production repo navigation.
- Employees flows, import/export, bulk edit all pass automated checks.
- Documentation clearly distinguishes demo vs production repos.
- Vercel production deployment URL exists and is captured in handoff docs.
