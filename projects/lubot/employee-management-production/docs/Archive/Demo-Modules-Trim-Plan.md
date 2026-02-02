# Demo Modules – Trimmed Build Playbook

## Purpose
Stage 6 validation signed off the employee-management refactor with the demo tabs (`Фото галерея`, `Показатели`, `Статусы`, `Сертификации`, `Навыки`) still present as placeholders. Appendix 1 of the contract does not require those modules, but Golden Journeys reference only the Employees stack. This playbook records how to maintain a "trimmed" build (no demo tabs) for future parity spot-checks or customer-ready handoffs, while keeping the current full build intact.

## References
- Stage 6 final UAT comparison (`docs/Archive/stage-6-ai-uat/Stage-6-UAT-Report-nsp559gx9-vs-7b28yt9nh.md:80-118`) — demo modules flagged as deferred.
- Contract scope (`/Users/m/Downloads/WFM_contract_docs_2025-10-08/final_delivery/wfm_appendix_1.md:1-180`) — no obligations beyond the Employees module and KPI fields embedded in employee data.
- Golden Journey GJ-01 (`/Users/m/Downloads/WFM_contract_docs_2025-10-08/final_delivery/wfm_appendix_3.md:80-185`) — acceptance steps cover only the employee list, quick add, edit drawer, bulk edit, import/export.

## Trimmed Build Checklist
1. **Branch or repo**: Create a dedicated branch (e.g. `trimmed-demo-tabs`) or a sibling repo that tracks `main` but removes demo modules.
2. **Navigation update** (`src/App.tsx:1-220`):
   - Remove tab registrations for `Фото галерея`, `Показатели`, `Статусы`, `Сертификации`, `Навыки`.
   - Delete the related `component` imports.
3. **Route cleanup**:
   - Delete unused component files if you want a lean bundle (`src/components/EmployeePhotoGallery.tsx`, `PerformanceMetricsView.tsx`, `EmployeeStatusManager.tsx`, `CertificationTracker.tsx`, `EmployeeComparisonTool.tsx`, `EmployeeNotesSection.tsx`, `EmployeeAuditLog.tsx`, etc.).
   - Update any barrel exports under `src/components/index.ts` (if used) and remove associated tests.
4. **Schema & seed data** (`src/App.tsx:220-1470`, `src/types/employee.ts:1-320`):
   - Retain KPI fields inside `employee.performance` — Golden Journeys expect them in the edit drawer, even if the dashboard tab is absent.
   - Keep task timeline structures; they are part of GJ-01.
5. **Playwright adjustments** (`tests/employee-list.spec.ts`):
   - No changes required; current suite only targets the Employees tab. If you remove component imports, ensure `npm run test` still passes.
6. **Documentation touchpoints**:
   - Update screenshots/handbook references only if the trimmed build becomes the default; otherwise reference this playbook from handoff docs (see below).
7. **Deployment**:
   - Publish trimmed builds to a distinct Vercel ID, e.g. `https://employee-management-parity-trimmed-<id>.vercel.app`.
   - Record the URL in the Stage 6 handoff log when used for UAT.

## Restoring Demo Tabs
Should the client request the original experience, reapply the latest `main` branch or revert the specific commits that removed the tabs. Keep this playbook alongside the new branch so the delta remains traceable.

