# Migration Cleanup & Deployment – Phase 6 Task 4

## Metadata
## Required Reading (read in full)
- PROGRESS.md
- docs/SOP/plan-execution-sop.md
- docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md

- **Objective**: remove remaining feature flags/scripts/docs tied to fallback paths, refresh documentation, and prepare deployment instructions for the canonical build.
- **Scope**: scripts (`package.json`), environment typings, documentation references, Stage 6 checklists, and Vercel deployment notes.

## Pre-checks
```bash
set -euo pipefail
npm install
git status -sb
```

## Change Steps

### 1. Remove obsolete npm scripts
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: package.json
@@
-    "build": "vite build",
-    "build:tanstack": "cross-env VITE_USE_TANSTACK_TABLE=true vite build",
+    "build": "vite build",
@@
-    "test": "playwright test",
-    "test:tanstack": "cross-env VITE_USE_TANSTACK_TABLE=true playwright test"
+    "test": "playwright test"
*** End Patch
PATCH
```

### 2. Clean documentation references
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/README.md
@@
-  - `src/wrappers/` – Radix overlays, RHF form helpers, and TanStack table shell (Stage 0 hardened; overlays live behind Stage 1 env flag, forms live via Stage 2, table wrapper gated by `VITE_USE_TANSTACK_TABLE` while Stage 3 validation продолжается).
+  - `src/wrappers/` – Radix overlays, RHF form helpers, and TanStack table shell used across the canonical build.
@@
-- `npm run build` / `npm run build:tanstack` – generate production bundles for the legacy table path and the TanStack flag path (Stage 3 budget tracking).
-- `npm run test -- --project=chromium --workers=1` / `npm run test:tanstack -- --project=chromium --workers=1 --grep "Employee list"` – smoke parity suites for the default and flag-enabled builds prior to Stage 5 rollout.
+- `npm run build` – production bundle.
+- `npm run test -- --project=chromium --workers=1` – Playwright regression suite.
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/System/documentation-index.md
@@
-| Feature flags | `src/utils/featureFlags.ts` (`VITE_USE_RADIX_OVERLAYS`, `VITE_USE_TANSTACK_TABLE`), `.env.example` когда появится |
+| Feature flags | Removed — canonical build no longer relies on env toggles |
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md
@@
- Stage 0 is complete (tokens + wrapper smoke tests); Stage 1 overlay adoption now covers Quick Add, EmployeeEditDrawer, bulk edit, tag manager, import/export, and column settings behind `VITE_USE_RADIX_OVERLAYS`, and the import/export toolbar menus run through the shared Radix поповер. Stage 2 now has both Quick Add and the Employee edit drawer on RHF + Zod (`src/schemas/quickAddSchema.ts`, `src/schemas/employeeEditSchema.ts`, `src/components/QuickAddEmployee.tsx`, `src/components/EmployeeEditDrawer.tsx`). Stage 3 complete — the TanStack table is now the default path (`src/utils/featureFlags.ts` defaults to `true`), the 12 k row baseline is logged (dist `index-*.js` ≈ 550.6 KB / 152.1 KB gzip), и обе Playwright suites (`npm run test`, `npm run test:tanstack -- --project=chromium --workers=1 --grep "Employee list"`) are green.
+ Stage 0 is complete (tokens + wrapper smoke tests). Stage 1/2 migrated overlays and forms to shared wrappers; Stage 3 promotes the TanStack table as the sole path with the 12 k row baseline recorded (dist `index-*.js` ≈ 550.6 KB / 152.1 KB gzip). Use `npm run test` for the regression suite.
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/SESSION_SUMMARY.md
@@
-- Stage 3 TanStack table complete: wrapper + flag path are live, the playground demo runs with 12 k virtualised rows (bundle baseline 1.51 MB / 432 KB gzip), both legacy and flag Playwright suites are green (`npm run test`, `npm run test:tanstack -- --grep "Employee list"`), and the table now defaults to the TanStack implementation (disable via `VITE_USE_TANSTACK_TABLE=false` if needed).
+- Stage 3 TanStack table complete: wrapper + virtualization are live, the playground demo runs with 12 k virtualised rows (bundle baseline 1.51 MB / 432 KB gzip), and the canonical build ships without fallback flags.
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/parity-backlog-and-plan.md
@@
-   - Status: Stage 0 complete (tokens + wrapper smoke tests). Stage 1 overlays now run through the shared `Overlay` helper behind `VITE_USE_RADIX_OVERLAYS` для Quick Add, EmployeeEditDrawer, bulk edit, tag manager, import/export, and column settings; toolbar import/export menus are backed by the Radix popover. Stage 2 forms are in place for both Quick Add and the Employee edit drawer (RHF + Zod); NVDA remains deferred until hardware is available. Stage 3 complete — TanStack table is now enabled by default (`src/utils/featureFlags.ts` defaults to `true`), the 12 k row baseline is logged, и обе Playwright suites (`npm run test`, `npm run test:tanstack`) pass.
+   - Status: Stage 0 wrappers hardened. Stage 1 overlays and Stage 2 forms use Radix + RHF in production; Stage 3 promotes the TanStack table with the 12 k row baseline logged. Remaining work: NVDA sweep + screenshot refresh.
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/SESSION_HANDOFF.md
@@
-- `EmployeeListContainer.tsx`: … overlay surfaces (bulk edit, column settings, tag manager, import/export) wired through the shared `Overlay` helper gated by `VITE_USE_RADIX_OVERLAYS`, … when `VITE_USE_TANSTACK_TABLE=true` …
+- `EmployeeListContainer.tsx`: … overlay surfaces (bulk edit, column settings, tag manager, import/export) run through the shared `Overlay` helper; employee list uses the TanStack `DataTable` wrapper by default (12 k row baseline logged).
*** End Patch
PATCH
```

```bash
sed -i '' '/Introduce a build-time feature flag (e.g., `VITE_USE_RADIX_OVERLAYS`)/d' docs/Tasks/06_phase-6-migration-planning-prd.md
sed -i '' '/Progress: `EmployeeListContainer` builds TanStack column definitions behind `VITE_USE_TANSTACK_TABLE`/d' docs/Tasks/06_phase-6-migration-planning-prd.md
printf '\n- (Completed) Overlays and table now run without fallback flags; rollback handled via git deployment.\n' >> docs/Tasks/06_phase-6-migration-planning-prd.md
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/SESSION_READLIST.md
@@
-19. [x] Stage 3 reference: wrappers + demos for the TanStack table path (now gated by `VITE_USE_TANSTACK_TABLE`):
+19. [x] Stage 3 reference: wrappers + demos for the TanStack table path (canonical build).
*** End Patch
PATCH
```

### 3. Update Stage 6 AI-UAT checklist
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/stage-6-ai-uat-checklist.md
@@
- For refactor checks that require TanStack Table, set `localStorage.setItem('VITE_USE_TANSTACK_TABLE', 'true')` in DevTools, reload, and confirm the new table renders. Repeat key table checks with the default path to ensure graceful fallback.
+- Табличные проверки выполняются на канонической сборке; никаких флагов включать не нужно.
*** End Patch
PATCH
```

### 4. Remove references to obsolete env variables in docs
Search `VITE_USE_RADIX_OVERLAYS` and `VITE_USE_TANSTACK_TABLE` to confirm no occurrences remain.
```bash
rg "VITE_USE_RADIX_OVERLAYS" docs
rg "VITE_USE_TANSTACK_TABLE" docs
```

### 5. Clean workspace artefacts
```bash
rm -rf test-results
```

## Tests & Verification
```bash
set -euo pipefail
npm run build
npm run test -- --project=chromium --workers=1
```

## Acceptance Checklist
- [ ] `package.json` exposes only canonical scripts (`build`, `test`).
- [ ] Documentation references no longer mention feature flags or dual-build commands.
- [ ] Stage 6 checklist uses canonical instructions.

## Rollback
```bash
set -euo pipefail
git reset --hard HEAD
git clean -fd docs package.json
```

---

**Next Plan:** `plans/05_stage6-uat-report.plan.md`
