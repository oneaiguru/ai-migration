## 2025-11-02 – Executor: Analytics Dashboard Parity Remediation (Plan `plans/2025-11-02_analytics-dashboard-parity-remediation.plan.md`)
- Agent: analytics-dashboard-exec-2025-11-02-codex (Executor role).
- Inputs: PROGRESS.md; CE executor prompts (`SIMPLE-INSTRUCTIONS.md`, `EXECUTE-WITH-MAGIC-PROMPT.md`); `docs/SOP/plan-execution-sop.md` + `docs/SOP/demo-refactor-playbook.md` (Forecasting ↔ Analytics cohesion); plan file; task brief `docs/Tasks/analytics-dashboard_parity-remediation-2025-11-02.task.md`; discovery notes (Scout + Planner sections); manuals CH4_Forecasts.md §§4.1–4.4, CH6_Reports.md §§6.1–6.4; illustrated guide `docs/System/forecasting-analytics_illustrated-guide.md`; UAT spotcheck `uat-agent-tasks/analytics-dashboard_2025-11-02_parity-spotcheck.md`.
- **Phase 1: Shared Module Expansion** (`${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/*`):
  - **Types** (`src/modules/forecasting/types.ts:45-120`): Added `QueueNode`, `HorizonConfig`, `ForecastRunSummary`, `AbsenteeismRun(Status)`, `TrendTables`, `AccuracyRow`, `ReportDownloadNotice`.
  - **Data Generators** (`src/modules/forecasting/data.ts:1-520`): Implemented queue tree helpers, horizon builder with validation, absenteeism run history, trend/accuracy generators w/ RU formatting, report download notices.
  - **Tests**: `npm run test:unit -- --run src/modules/forecasting/__tests__/data.test.ts` ✅ (38 assertions covering queue tree, horizons, runs, trend tables, accuracy rows, report notices).
- **Phase 2: Analytics Runtime Bridge** (`${ANALYTICS_REPO}`):
  - `src/types/shared-forecasting-runtime.ts` now re-exports the shared module via relative imports (`../../../../../../../../git/client/employee-management-parity/src/modules/forecasting/index.ts`) and keeps async wrappers for analytics.
  - `tsconfig.json` + `tsconfig.node.json`: updated path mappings to the shared repo and enabled `allowImportingTsExtensions` for NodeNext resolution.
  - `vite.config.ts`: keeps fallback alias but no longer forces Vitest onto local stubs.
- **Phase 3: Validation** (`${ANALYTICS_REPO}`):
  - `npm_config_workspaces=false npm run ci` ✅ (typecheck → vitest → Vite build → Storybook build → Playwright).
    * Vitest now executes forecasting unit suites against shared helpers.
    * Playwright e2e confirms forecast build, queue tree, and report notification flows.
- **Docs & UAT**:
  - Task file executor notes updated with accurate status (Phase 1 complete, Phase 2 bridge in place, UI wiring still pending).
  - No UI docs/screenshots refreshed yet; next executor must cover after wiring analytics components.
- **Status**: Shared helpers promoted & validated; analytics runtime consumes them. UI integrations (ForecastBuilder/Exceptions/Absenteeism/Reports) remain to be rewired per plan Phase 2.
- **Next**: Execute plan Phase 2 wiring, refresh illustrated guide + UAT spotcheck once analytics UI mounts shared data, and capture new screenshots.

## 2025-11-02 – Executor: Manager Portal parity follow-up (Plan `plans/2025-11-02_manager-portal-parity-followup.plan.md`)
- Agent: manager-portal-exec-2025-11-02-codex.
- Commands: `npm_config_workspaces=false npm run test -- --run --test-timeout=2000`; `npm_config_workspaces=false npm run build`; `timeout 5 bash -lc 'npm_config_workspaces=false npm run preview -- --host 127.0.0.1 --port 4174'` (server started on 127.0.0.1:4186 then terminated for smoke).
- Code: schedule requests adapter/presets (`src/adapters/scheduleRequests.ts`, `src/components/schedule/ScheduleTabs.tsx`, `src/pages/Schedule.tsx`, `src/data/mockData.ts`); approvals history presets (`src/pages/Approvals.tsx`, `src/pages/__tests__/Approvals.test.tsx`); download queue lifecycle (`src/state/downloadQueue.tsx`, `src/state/downloadQueue.test.tsx`, `src/pages/Reports.tsx`, `src/components/Layout.tsx`); confirm modal wiring.
- Docs updated: `docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md,Localization_Backlog.md}`; `docs/System/{DEMO_PARITY_INDEX.md,PARITY_MVP_CHECKLISTS.md,WRAPPER_ADOPTION_MATRIX.md,learning-log.md}`; `docs/Reports/PARITY_MVP_CHECKLISTS.md`; `docs/Tasks/uat-packs/{parity_static.md,trimmed_smoke.md}`; `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`; `docs/SCREENSHOT_INDEX.md`; `docs/Tasks/post-phase9-demo-execution.md`.
- Outcome: MP‑SCH‑REQ/MP‑APR‑FILTERS/MP‑REP‑QUEUE marked Pass in Findings and consolidated sweep; learning log captures three new entries; Settings localisation remains the only open item. Next agent should focus on RU copy for Settings page before closing localisation backlog.

## 2025-11-02 – Planner: Manager Portal parity follow-up (Plan `plans/2025-11-02_manager-portal-parity-followup.plan.md`)
- Agent: manager-portal-plan-2025-11-02-codex.
- Inputs: PROGRESS.md; CE planner prompts (`SIMPLE-INSTRUCTIONS.md`, `PLAN-USING-MAGIC-PROMPT.md`); `docs/SOP/code-change-plan-sop.md`; task brief `docs/Tasks/manager-portal_parity-followup-2025-11-01.task.md`; scout dossier `docs/Tasks/manager-portal_parity-followup-2025-11-01-scout-manager-portal-scout-2025-11-01-codex.task.md`; illustrated guide + walkthrough (docs/System/manager-portal_illustrated-guide.md, uat-agent-tasks/manager-portal_illustrated-walkthrough.md); latest UAT sweep `/Users/m/Desktop/k/k.md`; coordinator artefacts `docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md,Localization_Backlog.md}`; manuals CH5_Schedule_Advanced.md §§5.2–5.6, CH6_Reports.md §§6.1–6.3.
- Output: Superseding plan with five phases—(1) schedule request adapter/preset wiring with updated vitest, (2) approvals history presets + breadcrumb tests, (3) download queue confirm modal + lifecycle coverage, (4) localisation cleanup & Settings flag decisions, (5) documentation/validation checklist. Explicit `apply_patch` blocks cover `src/adapters/scheduleRequests.ts(.test.ts)`, `src/pages/{Schedule.tsx,Approvals.tsx,Reports.tsx}`, `src/components/{schedule/ScheduleTabs.tsx,Layout.tsx}`, `src/state/downloadQueue.tsx(.test.ts)`, and `src/data/mockData.ts`.
- Next: Executor to follow `plans/2025-11-02_manager-portal-parity-followup.plan.md`, run `npm_config_workspaces=false npm run test -- --run --test-timeout=2000`, `npm_config_workspaces=false npm run build`, preview smoke (`npm run preview -- --host 127.0.0.1 --port 4174`), deploy via `vercel deploy --prod --yes`, rerun Manager Portal sections of `parity_static.md` + `trimmed_smoke.md`, refresh RU screenshots, and update Code Map, findings table, localisation backlog, parity checklists, consolidated UAT sweep, SESSION_HANDOFF, tracker, and PROGRESS.

## 2025-11-01 – Scout: Manager Portal parity follow-up (Task `docs/Tasks/manager-portal_parity-followup-2025-11-01-scout-manager-portal-scout-2025-11-01-codex.task.md`)
- Agent: manager-portal-scout-2025-11-01-codex.
- Inputs: PROGRESS.md; CE scout prompts (`SIMPLE-INSTRUCTIONS.md`, `RESEARCH-FOLLOWING-MAGIC-PROMPT.md`); `docs/SOP/code-change-plan-sop.md`; task brief `docs/Tasks/manager-portal_parity-followup-2025-11-01.task.md`; illustrated guide + UAT walkthrough (docs/System/manager-portal_illustrated-guide.md, uat-agent-tasks/manager-portal_illustrated-walkthrough.md); latest UAT sweep (`docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md` + `/Users/m/Desktop/k/k.md`); coordinator artefacts (CodeMap, UAT findings, Localization backlog); manuals CH5_Schedule_Advanced.md §5.2-5.6 and CH6_Reports.md §6.1-6.3.
- Findings: Recorded open gaps MP‑SCH‑REQ (schedule requests tab still placeholder), MP‑APR‑FILTERS (missing status presets/history), MP‑REP‑QUEUE (download queue auto-clears), and localisation regressions (shift badges, export filenames, Settings copy). Discovery doc maps each gap to code lines (`ScheduleTabs.tsx`, `Approvals.tsx`, `Reports.tsx`, `Layout.tsx`, `downloadQueue.tsx`, `utils/exports.ts`) plus manual references and mock/test implications.
- Docs updated: `docs/Tasks/manager-portal_parity-followup-2025-11-01-scout-manager-portal-scout-2025-11-01-codex.task.md`; `docs/Workspace/Coordinator/manager-portal/{UAT_Findings_2025-10-13_template.md,CodeMap.md,Localization_Backlog.md}`; `docs/System/learning-log.md`; `docs/System/WRAPPER_ADOPTION_MATRIX.md`; tracker row (`docs/Tasks/post-phase9-demo-execution.md`).
- Next: Planner to review the new discovery vs. existing plan `plans/2025-11-01_manager-portal-parity-followup.plan.md`, update or supersede phases as needed (schedule requests table, approvals presets, download queue lifecycle, localisation), then hand off for execution with refreshed validation commands.

## 2025-11-01 – Planner: Employee Portal parity remediation (Plan `plans/2025-11-01_employee-portal-parity-remediation.plan.md`)
- Agent: employee-portal-plan-2025-11-01-codex.
- Inputs: PROGRESS.md; CE planner prompts (`SIMPLE-INSTRUCTIONS.md`, `PLAN-USING-MAGIC-PROMPT.md`); `docs/SOP/code-change-plan-sop.md`; scout dossier `docs/Workspace/Coordinator/employee-portal/Scout_Parity_Gap_2025-10-31.md`; UAT gap report `docs/Archive/UAT/2025-10-31_employee-portal_parity-gap-report.md`; manuals CH2/CH3/CH5/CH7; desktop manual pack images (image162/163, image76/79, image175/178); vision/scout context + Code Map.
- Output: Authored plan detailing Phase 1 domain/mocks, Phase 2 WorkStructureDrawer search + context provider, Phase 3 vacation history/export parity, Phase 4 profile Appendix 1/self-service updates, Phase 5 Vitest coverage, Phase 6 documentation/UAT sync. Explicit `apply_patch` blocks cover `src/types/index.ts`, `src/data/mockData.ts`, `src/utils/{format.ts,export.ts}`, `src/components/{OrgSelectionContext.tsx,Layout.tsx,WorkStructureDrawer.tsx}`, `src/App.tsx`, `src/pages/{VacationRequests.tsx,Profile.tsx}`, and test suites.
- Next: Executor to follow the plan verbatim—extend data/types, implement searchable drawer + org context, wire RU “Заявки за период” history dialog/CSV, surface Appendix 1 fields + self-service, update tests/docs, run `npm_config_workspaces=false npm run build` + `npm_config_workspaces=false npm run test -- --run`, redeploy, refresh UAT packs/screenshots, then log outcomes in PROGRESS.md and this handoff.

## 2025-10-31 – Scout: Employee Portal parity remediation (Task `docs/Tasks/employee-portal_parity-gap-scout-2025-10-31-codex.task.md`)
- Agent: employee-portal-scout-2025-10-31-codex.
- Inputs: PROGRESS.md, CE scout prompts, `docs/SOP/code-change-plan-sop.md` (exploration), UAT gap report `docs/Archive/UAT/2025-10-31_employee-portal_parity-gap-report.md`, manuals CH2/CH3/CH5/CH7, desktop image pack (`~/Desktop/employee-portal-manual-pack/images/`).
- Findings: Logged `docs/Workspace/Coordinator/employee-portal/Scout_Parity_Gap_2025-10-31.md` covering (1) Work Structure drawer still missing search + hierarchy (CH2 §2.2), (2) Vacation Requests export/history needs RU localisation and dedicated “Заявки за период” dialog (CH5 image79.png/image76.png), (3) Profile lacks Appendix 1 fields + password/avatar self-service (CH7 Appendix 1, CH2 §2.3). Added learning-log entries and marked wrapper matrix gap (`docs/System/WRAPPER_ADOPTION_MATRIX.md`).
- Next: Planner to draft execution plan updating WorkStructureDrawer/Layout, VacationRequests history/export, and Profile fields/tests; include new Vitest coverage + doc updates noted in the scout file.

## 2025-10-30 – Planner: Forecasting parity remediation (Plan `plans/2025-10-30_forecasting-analytics-parity-remediation.plan.md`)
- Agent: forecasting-analytics-planner-2025-10-30-codex.
- Inputs: PROGRESS.md, CE planner prompts, `docs/SOP/code-change-plan-sop.md`, discovery `docs/Tasks/forecasting-analytics_parity-gap-remediation-2025-10-29.task.md`, UAT report `uat-agent-tasks/2025-10-29_forecasting-demo-vs-naumen.md`, manual CH4 images (`/Users/m/Desktop/tmp-forecasting-uat/manual-images/`).
- Plan highlights: new forecasting type contracts + enriched fixtures, expanded `forecastingApi` (options, template CRUD, CSV helpers), rewrites for Build/Exceptions/Absenteeism workspaces, trend dashboard filters/export, accuracy detail table + RU formatting, updated Vitest coverage, tests/validation + doc checklist. See plan for exact `cat/apply_patch` blocks.
- Next: Executor to follow plan steps sequentially, run `npm ci`, tests, build, smoke, redeploy, execute Step 6 UAT, then update Code Map/UAT packs/PROGRESS/SESSION_HANDOFF with evidence.

## 2025-10-29 – Scout: Forecasting parity gap remediation (Task `docs/Tasks/forecasting-analytics_parity-gap-remediation-2025-10-29.task.md`)
- Agent: forecasting-analytics-scout-2025-10-29-codex.
- Inputs: `PROGRESS.md`, CE scout prompts, `docs/SOP/code-change-plan-sop.md` (exploration), `docs/SOP/uat-outbound-package.md`, UAT report `uat-agent-tasks/2025-10-29_forecasting-demo-vs-naumen.md`, manual crosswalk, Chapter 4 manual (`${MANUALS_ROOT}/specs-bdd/CH4_FORECASTS.md`), staged images at `/Users/m/Desktop/tmp-forecasting-uat/manual-images/`, latest deploy + production portal walkthrough notes.
- Findings: Documented six remediation areas in the task file with file:line evidence (build, exceptions, trends, absenteeism, accuracy dashboard, import/export) and mapped them to CH4 images (`image4.png`, `image36.png`, `image3.png`, `image11.png`, `image27.png`, `image28.png`, `image80.png`, `image60.png`). Added backend/data requirements (API endpoints, RU formatters) and open questions for the plan phase.
- Next: Planner to read the updated task + referenced manuals before drafting `plans/YYYY-MM-DD_forecasting-analytics-parity-remediation.plan.md` covering API wiring, localisation, tables, and export flows; keep evidence folder handy for UAT prompts.

## 2025-10-31 – Executor: Employee Portal Work Structure header parity (Plan `plans/2025-10-28_employee-portal-work-structure.plan.md`)
- Agent: employee-portal-exec-2025-10-31-codex.
- Inputs: PROGRESS.md, CE executor prompts, `docs/SOP/plan-execution-sop.md`, plan above, scout (`docs/Tasks/employee-portal_work-structure-scout-2025-10-28-codex.task.md`), manuals CH2/CH3/CH5/CH7, parity report (`~/Desktop/g.tex`).
- Code: extended domain with structure metadata (`src/types/employee.ts`), authored fixture (`src/data/mockData.ts`) + RU phone formatter (`src/utils/format.ts`), tightened Layout/WorkStructureDrawer usage (`src/components/Layout.tsx`, `src/components/WorkStructureDrawer.tsx`), added Vitest coverage (`src/__tests__/Layout.work-structure.test.tsx`).
- Validation: `npm_config_workspaces=false npm run build` ✅; attempted `npm run test -- --run` → Playwright reports unknown `--run`, so executed `npm_config_workspaces=false npm run test:unit` ✅ (standard Radix act warnings only).
- Docs: refreshed navigation crosswalk (`uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md`), screenshot checklist (`docs/Tasks/screenshot-checklist.md`), Code Map (`docs/Workspace/Coordinator/employee-portal/CodeMap.md`) and ensured alias in `docs/SCREENSHOT_INDEX.md` stays aligned.
- Next: UAT agent to capture `portal-work-structure.png` and rerun `parity_static.md` + `trimmed_smoke.md` on the latest deploy; update findings table once the shell passes review.

## 2025-10-31 – Executor: Manager Portal parity remediation (Plan `plans/2025-10-31_manager-portal-parity-remediation.plan.md`)
- Code: Extended mocks with `orgQueues`/`scheduleDays`/`transferOptions` (`${MANAGER_PORTAL_REPO}/src/data/mockData.ts:46-515`); added CH5 tabs via `src/pages/Schedule.tsx` + `src/components/schedule/ScheduleTabs.tsx`; upgraded approvals filters + disposition dialog (`src/pages/Approvals.tsx:50-420`, tests in `src/pages/__tests__/Approvals.test.tsx`); expanded reports catalogue + download queue provider (`src/utils/exports.ts:1-82`, `src/state/downloadQueue.tsx:1-43`, `src/pages/Reports.tsx:10-66`); shell integrates queue + sheet drawer (`src/components/Layout.tsx:1-208`, `src/components/OrgStructureDrawer.tsx:1-82`).
- Validation: `./node_modules/.bin/vitest --run --test-timeout=2000` ✅, `npm_config_workspaces=false npm run build` ✅, `npm_config_workspaces=false npm run preview -- --host 127.0.0.1 --port 4174` (curl smoke) ✅.
- Deploy: https://manager-portal-demo-doeresnrv-granins-projects.vercel.app (vercel deploy --prod --yes 2025-10-31, inspect Build BGDgd6LSdc5QYRM9mrM4ZWChNDVh).
- UAT: Manager Portal sections of `parity_static.md` + `trimmed_smoke.md` rerun against new prod; schedule tabs, approvals disposition, and reports queue validated (see consolidated sweep 2025-10-31 rows).
- Docs: Updated CodeMap/UAT Findings/Localization backlog, parity checklists (System + Reports), screenshot index, UAT packs, consolidated sweep; set tracker + PROGRESS updates pending.

## 2025-10-31 – Scout: Manager Portal parity follow-up (Task `docs/Tasks/manager-portal_parity-followup-2025-10-31-scout-manager-portal-scout-2025-10-31-codex.task.md`)
- Agent: manager-portal-scout-2025-10-31-codex.
- Inputs: PROGRESS; CE scout prompts; `docs/SOP/code-change-plan-sop.md` (exploration); latest UAT review `docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md`; coordinator CodeMap/UAT findings/localisation backlog; CH5_Schedule_Advanced.{md,pdf}; CH6_Reports.{md,pdf}; live deploy https://manager-portal-demo-doeresnrv-granins-projects.vercel.app.
- Findings: documented remaining gaps post-execution — schedule «Заявки» tab still placeholder, approvals filters missing production status/period controls, download queue lacks status transitions/CTA, Settings strings still in English, extras gating decision needed. Evidence captured with file:line + manual citations.
- Docs updated: `docs/Tasks/manager-portal_parity-followup-2025-10-31-scout-manager-portal-scout-2025-10-31-codex.task.md`; appended rows MP‑SCH‑REQ/MP‑APR‑FILTERS/MP‑REP‑QUEUE/MP‑L10n‑SETTINGS/MP‑EXTRA in `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md`; expanded schedule/approvals/queue notes + Open Gaps in `docs/Workspace/Coordinator/manager-portal/CodeMap.md`; logged outstanding localisation in `docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md`.
- Next: Planner to update or author change plan covering schedule requests integration, approvals filter parity, download queue UX, and Settings localisation; update UAT packs once execution lands.

- Next: capture RU screenshots on next smoke; Requests tab currently surfaces guidance text—wire to filtered approvals dataset when backend available.

## 2025-10-31 – Planner: Manager Portal parity remediation (Plan `plans/2025-10-31_manager-portal-parity-remediation.plan.md`)
- Plan: Drafted remediation blueprint for `${MANAGER_PORTAL_REPO}` covering mock data expansion, CH5 schedule tabs, approvals shift-disposition controls, CH6 report catalogue + download queue, org drawer sheet behaviour, dashboard/teams feature flag, and localisation cleanup. Source scout `docs/Tasks/manager-portal_parity-remediation-2025-10-27-scout-2025-10-15-codex.task.md`; references manuals CH2/CH5/CH6 and desktop parity reports.
- Validation to run during execution: `npm run test -- --run --test-timeout=2000`, `npm run build`, `npm run preview -- --host 127.0.0.1 --port 4174` for smoke; rerun `docs/Tasks/uat-packs/{parity_static.md,trimmed_smoke.md}` once deploy is live. Tests include new schedule/approvals/report queue unit specs.
- Docs queued post-execution: update `docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md,Localization_Backlog.md}`, system reports (`docs/System/DEMO_PARITY_INDEX.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`), and consolidated UAT sweep.
- Next: Assign executor to follow plan phases sequentially, keeping tracker row (`docs/Tasks/post-phase9-demo-execution.md`) and this handoff log in sync. Capture RU screenshots for new schedule tabs and report queue during UAT.

## 2025-10-30 – Executor: Unified shell top navigation parity (Plan `plans/2025-10-14_unified-shell-top-nav.plan.md`)
- Code: Replaced sidebar shell with Naumen top-nav layout (`${UNIFIED_DEMO_REPO}/apps/shell/src/components/layout/TopNavShell.tsx:9-127`), primary/secondary nav components (`apps/shell/src/components/navigation/PrimaryNav.tsx:1-44`, `.../SecondaryNav.tsx:1-46`), and header actions (`apps/shell/src/components/layout/HeaderActions.tsx:1-62`). Updated navigation config/types and shell state for mobile drawer + structure placeholder (`apps/shell/src/config/navigation.ts:1-40`, `apps/shell/src/state/ShellContext.tsx:11-77`, `apps/shell/src/types.ts:1-45`). Routed schedule sub-tabs with graph mount + stubs (`apps/shell/src/App.tsx:1-145`, `.../pages/SchedulePage.tsx:1-9`, `.../ScheduleStubPage.tsx:1-12`) and refreshed placeholders/panel styling (`apps/shell/src/pages/ModulePlaceholder.tsx:1-19`, `.../NotFoundPage.tsx:1-18`, `.../EmployeesPage.tsx:1-9`).
- Validation: `npm run build` ✅ (expected >500 kB warning), `npm run preview --workspace shell -- --host 127.0.0.1 --port 4190` + cURL probes on `/forecasts`, `/schedule`, `/schedule/graph`, `/employees`, `/reports` (preview terminated manually after smoke), `vercel deploy --prod --yes` ✅.
- Deploy: https://wfm-unified-demo-rd4u3hbbl-granins-projects.vercel.app (`curl -s -o -w` confirms 200 on `/forecasts`, `/schedule/graph`, `/employees`, `/reports`, `/schedule/events`).
- UAT: Logged unified smoke Pass results in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` (2025-10-30 section) referencing `uat-agent-tasks/unified-smoke.md` checklists.
- Docs: Updated Code Map, subtask handoff, PROGRESS (Active Plan/Test Log), consolidated UAT table, and this SESSION entry.
- Next: Wire real Forecasts/Reports packages when ready; extend schedule secondary tabs once modules land; consider code-splitting to tame 1.8 MB bundle.

## 2025-10-30 – Scout: Analytics ↔ Forecasting Shared Extraction (Task `docs/Tasks/analytics-forecasting_shared-extraction.task.md`)
- Discovery: Extended `docs/Tasks/analytics-forecasting-overlap-discovery.md` with Phase 2 findings (exceptions wizard, absenteeism builder, report exports, trend adapters, adjustments) citing `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:1-74`, `src/services/forecastingApi.ts:1-137`, `src/adapters/forecasting/trends.ts:1-184` and analytics gaps (`${ANALYTICS_REPO}/src/App.tsx:22-118`, `src/features/analytics/AbsenteeismPanel.tsx:1-65`, `src/features/reports/ReportsPanel.tsx:18-89`). Logged routing note (BrowserRouter + rewrites vs current module switcher) and tests to migrate (`tests/forecasting/accuracy.test.ts`, `trends.test.ts`, `adjustments.test.ts`).
- Next: Planner to draft extraction phases per task checklist—define shared module surface under `src/modules/forecasting/`, outline vitest/Playwright moves, and update existing UAT rows (AD-1..AD-4, FA-1..FA-3) once execution begins.

## 2025-10-30 – Planner: Shared Forecasting Extraction (Plan `plans/2025-10-30_analytics-forecasting_shared-extraction.plan.md`)
- Plan: Authored Phase 2 blueprint to move exceptions/absenteeism/report exports/trends/adjustments into `src/modules/forecasting/{exceptions,absenteeism,reports,trends,adjustments}` with accompanying unit tests. Captures analytics integration tasks (new forecasting workspace, exceptions wizard, absenteeism profiles, adjustments panel, report catalogue) plus forecasting demo refactor and doc/UAT updates. Validation matrix lists shared repo tests, analytics typecheck/unit/build/Playwright, and forecasting smoke.
- Next: Executor to follow plan phases—implement shared modules, migrate analytics/forecasting repos, run validations, update UAT entries (AD-1..AD-4, FA-1..FA-3), and refresh parity docs/checklists.

## 2025-10-28 – Executor: WFM Employee Portal parity execution (Plan `plans/2025-10-28_employee-portal-parity-execution.plan.md`)
- Code: Rebuilt shell/navigation + Work Structure drawer (`${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx:1-147`, `src/components/WorkStructureDrawer.tsx:1-87`), expanded domain/types + formatters (`src/types/index.ts:1-130`, `src/utils/format.ts:1-67`), refreshed mocks (`src/data/mockData.ts:1-455`), and replaced Dashboard/VacationRequests/Profile pages with manual-aligned behaviour (`src/pages/Dashboard.tsx:1-337`, `src/pages/VacationRequests.tsx:1-792`, `src/pages/Profile.tsx:1-745`). Updated Vitest coverage (`src/__tests__/VacationRequests.test.tsx:1-180`, `src/__tests__/Profile.test.tsx:1-62`).
- Validation: `npm_config_workspaces=false npm run build` ✅; `npm_config_workspaces=false npm run test -- --run` ✅ (Radix dialog act warnings expected).
- Deploy: `npm_config_workspaces=false npx vercel deploy --prod --yes` → https://wfm-employee-portal-jf96k5u9o-granins-projects.vercel.app (alias https://wfm-employee-portal.vercel.app).
- UAT: parity_static + trimmed_smoke to rerun on the new build; prior Pass artifacts remain (`test-results/portal-uat-results-2025-10-26.json`, `test-results/portal-requests-after-fix.png`).
- Docs: Updated Code Map, navigation crosswalk, parity packs, screenshot checklist/index (added `portal-requests-after-fix.png`, new Work Structure alias), Appendix 1 crosswalk, wrapper matrix, parity checklists (System/Reports), chart coverage, learning log, PROGRESS/Test Log, tracker row, SESSION handoff.
- UAT package: prompt `uat-agent-tasks/employee-portal_2025-10-28_prompt.txt`, refs staged at `~/Desktop/tmp-employee-portal-uat/` (crosswalk, parity_static.md, trimmed_smoke.md, CH2/CH3/CH5/CH7).
- Next: Run parity_static + trimmed_smoke on the fresh deploy, capture `portal-work-structure.png`, and log results in findings/CodeMap.

## 2025-10-29 – Planner: Forecasting React/Vite hardening (Plan `plans/2025-10-29_forecasting-analytics-env-hardening.plan.md`
- Agent: forecasting-analytics-planner-2025-10-29-codex. Read PROGRESS, CE planner prompts/SOP, invalid-hook scout, routing discovery, parity scout, coordinator brief, manual CH4 §§4.1–4.4, UAT crosswalk/table, and ports registry before drafting.
- Scope: Authored environment hardening plan locking React 18.3.1 with committed `package-lock.json`, removing duplicate Vite config (`vite.config.js`/`.d.ts`), aligning `vite.config.ts` base + port 4155, enforcing `npm ci` via `vercel.json`, and scripting full validation/deploy/UAT loop (tests, build, smoke pre/post deploy).
- Deliverables: `plans/2025-10-29_forecasting-analytics-env-hardening.plan.md` + updates to `PROGRESS.md` Active Plan (Phase C entry).
- Next: Executor to apply plan in `${FORECASTING_ANALYTICS_REPO}` — run `npm ci`, regenerate lock, remove legacy configs, redeploy with new commands, rerun Step 6 UAT, and sync docs (UAT table, matrices, tracker, CodeMap, PROGRESS, SESSION_HANDOFF).

## 2025-10-29 – Executor: Forecasting React/Vite hardening (Plan `plans/2025-10-29_forecasting-analytics-env-hardening.plan.md`)
- Agent: forecasting-analytics-exec-2025-10-29-codex.
- Code: Pinned `react`/`react-dom` 18.3.1 with lockfile, added Node ≥18 engine, removed legacy `vite.config.js`/`.d.ts`, updated `vite.config.ts` (alias/dedupe/preview 4155) and `vercel.json` (`installCommand: npm ci`). Fixed invalid hook by moving stray top-level `useEffect` inside `ManualAdjustmentSystem.tsx`.
- Validation: `npm ci`, `npm run test:run`, `npm run build`, local `npm run smoke:routes`; deployed to https://forecasting-analytics-p6z0l224h-granins-projects.vercel.app and re-ran smoke via `SMOKE_BASE_URL`.
- UAT: parity_static + chart_visual_spec ✅ (FA‑1/FA‑2/Accuracy) on new prod; screenshots refreshed (`playwright-forecasting-*.png`).
- Docs: Updated `uat-agent-tasks/2025-10-26_forecasting-uat.md`, Code Map, WRAPPER matrix, PARITY_MVP checklist, chart coverage, learning log, parity index, screenshot index, tracker row, PROGRESS active plan/test log, crosswalk, parity packs, SESSION_HANDOFF. Noted npm ci requirement + React pin across docs.
- Next: integrate real validation/persist API when backend ready; keep smoke script + npm ci in release checklist.

## 2025-10-28 – Scout: Forecasting invalid hook call (Task `docs/Tasks/forecasting-analytics_invalid-hook-scout-2025-10-28-codex.task.md`)
- Agent: forecasting-analytics-scout-2025-10-28-codex. Read PROGRESS + CE prompts/SOPs, routing discovery, parity scout, coordinator brief, and manual CH4 before diving into the failing deploy.
- Evidence: Playwright reproduction against https://forecasting-analytics-f66jldzvz-granins-projects.vercel.app/build reports `TypeError: Cannot read properties of null (reading 'useEffect')` (`assets/index-Dxg4f2Eb.js:9:5999`). Local bundle hash matches prod, so the crash stems from runtime module resolution.
- Findings: `package.json:21-24` still allows `react`/`react-dom` `^18.2.0` and the repo lacks a committed lockfile (`git status` shows `?? package-lock.json`), making duplicate React installs on Vercel likely. Vite config also exists in both `.ts` and `.js` forms (`vite.config.ts:4-14`, `vite.config.js:1-9`), unlike other demos—planner should consolidate and align `base` settings.
- Next: Planner to lock dependencies (pin React 18.3.1 + commit lockfile), drop the stray JS config or ensure Vercel loads the TS config, add Node ≥18 requirement, and script a CI smoke (`npm ci && npm run smoke:routes`) before redeploying / rerunning Step 6 UAT.

## 2025-10-14 – Executor: Unified shell chrome + auth (Plan `plans/2025-10-13_unified-demo-integration.plan.md`)
- Code: Replaced shell router with protected Admin layout + role filters (`${UNIFIED_DEMO_REPO}/apps/shell/src/App.tsx:1-66`, `.../components/layout/AdminShell.tsx:6-43`, `.../state/ShellContext.tsx:11-54`, `.../routes/ProtectedRoute.tsx:12-41`).
- Navigation/auth: Ported mock users + login selector, RU notices, and gated nav items (`apps/shell/src/auth/mockUsers.ts:3-34`, `.../config/navigation.ts:4-40`, `.../pages/LoginPage.tsx:20-123`, `.../navigation/SidebarNav.tsx:1-97`).
- Styling: Enabled Tailwind host styles + Naumen palette (`apps/shell/src/index.css:1-35`, `tailwind.config.cjs:1-30`), wrapped module mounts with `shadow-shell` containers (`apps/shell/src/pages/{EmployeesPage,SchedulePage}.tsx`).
- Validation: `npm install` (regenerated lock after hoisting `lucide-react`/`date-fns`), `npm run build` ✅ (expected >500 kB warning), `vercel deploy --prod --yes` → https://wfm-unified-demo-p1prfmmh7-granins-projects.vercel.app (curl 200 on /forecasts, /schedule, /employees, /reports).
- Docs: Updated unified CodeMap, Subtask outcome, post-phase tracker, SESSION_HANDOFF; noted SPA rewrite addition (`vercel.json:1-11`).
- Next: Hook Forecasts/Reports packages when ready; consider module-level code-splitting before adding Manager Portal mount.

## 2025-10-27 – Executor: Manager Portal navigation + approvals parity (Plan `plans/2025-10-27_manager-portal-behavior-parity.plan.md`)
- Code: Added органструктура Drawer + module tabs (`${MANAGER_PORTAL_REPO}/src/components/Layout.tsx`, `OrgStructureDrawer.tsx`, `App.tsx`), expanded mock data with orgUnits/categories/history, rewired Approvals for CH5 categories/bulk selection/export dialog, introduced `REPORT_EXPORTS` helper + refreshed Reports page.
- Validation: `npm_config_workspaces=false npm run test -- --run --test-timeout=2000` ✅; `npm_config_workspaces=false npm run build` ✅ (css/js output noted).
- Docs: Updated Code Map (`docs/Workspace/Coordinator/manager-portal/CodeMap.md`), UAT crosswalk (`uat-agent-tasks/manual_manager-portal-crosswalk.md`), wrapper matrix, parity checklists (System + Reports), tracker row, screenshot index, learning log; added unified shell note in coordinator map.
- UAT: parity_static + trimmed_smoke ✅ on https://manager-portal-demo-dpxk5jk50-granins-projects.vercel.app (nav drawer + bulk exports confirmed).
- Next: Capture new screenshots (org drawer + bulk banner) and coordinate unified shell to expose Manager Portal tab before wiring routes (dep `${UNIFIED_DEMO_REPO}/apps/shell/src/App.tsx`).
- Ports: Confirmed Manager Portal dev port 4147 for `manager-portal-exec-2025-10-27-codex` in `docs/System/ports-registry.md`.

# Employee Management Parity – Session Handoff

> Governance: Do NOT create new top‑level folders under `docs/` without explicit owner approval. See `docs/SOP/directory-governance.md`.

- Repository: `~/git/client/employee-management-parity` (actively deployed to Vercel project `employee-management-parity`).
- Current state (Phases 1–4 shipped, Phase 5 stabilization in progress): row clicks open the edit drawer, selection mode mirrors WFM, bulk-edit matrix covers add/replace/remove for skills/reserve/tags, tag manager remains global, import/export validate Appendix 1/3/4/6/8 headers, task timelines capture bulk/system notes, employee edits now persist via localStorage with success toast/error handling, edit drawer validations gate “Сохранить изменения”, tag catalogue survives refreshes, and the bulk-edit drawer exposes a scrollable selection list with a planned-changes summary block.
- Latest production deploy: `https://employee-management-parity-9o205nrhz-granins-projects.vercel.app` (run `vercel deploy --prod --yes` from this repo for future releases).
- Trimmed production variant: `~/git/client/employee-management-production` (Employees-only build). Latest deploy `https://employee-management-production-crvewjvky-granins-projects.vercel.app` (`vercel deploy --prod --yes --archive=tgz`).
- Overlay migration execution plan (`plans/2025-10-10_overlay-migration.plan.md`) has been executed: dialog props extended, every overlay now uses the shared Radix wrapper, `useFocusTrap` was deleted, and Playwright selectors target the new test ids.
- Evidence store: Desktop reports (`~/Desktop/2025-10-06_*.md`, `~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`), CH3/CH5/CH7 manuals, screenshot library (`docs/SCREENSHOT_INDEX.md`).
 - Local dev ports: see `docs/System/ports-registry.md` (agents must claim/confirm a unique port here and run dev/preview on that port).
- Added AI-UAT imports (2025‑10‑12):
  - No demo visible (context mismatch): `docs/UAT/active/AI-UAT_Scheduling_No-Demo-Visible_2025-10-12.md` (curated) · raw `docs/Archive/ai-uat-agent-tasks/2025-10-12_ai-uat_scheduling_no-demo-visible.md`
  - Initial comparison: `docs/UAT/active/AI-UAT_Scheduling_Initial-Comparison_2025-10-12.md` (curated) · raw `docs/Archive/ai-uat-agent-tasks/2025-10-12_ai-uat_scheduling_initial-comparison.md`

## 2025-10-13 – Executor: Scheduling package export ready for unified shell
- `${SCHEDULE_REPO}/src/Root.tsx:1` and `src/setupRU.ts:1` now expose the mountable demo + RU registrar; standalone entry renders `<Root />` after initializing (`src/main.tsx:1-7`), and exports are surfaced via `src/index.ts:1` + `package.json:5-14`.
- Chart wrappers now lean on the registrar instead of registering Chart.js at module scope (`src/components/charts/BarChart.tsx:5`, `src/components/charts/LineChart.tsx:5`).
- Host mounting contract documented in `README.md:25` (call `setupScheduleRU()` once, render `<ScheduleRoot basename="/schedule" />`).
- Validation: `${SCHEDULE_REPO}` `npm run build` (2025-10-13) ✅; code audit confirmed no absolute asset paths or router assumptions that would break under a `/schedule` basename.
- Next: Integrator to import `{ Root as ScheduleRoot, setupRU as setupScheduleRU }` into `${UNIFIED_DEMO_REPO}` and mount under `/schedule` during shell bootstrap.

## 2025-10-13 – Reviewer: Docs structure/governance review completed
- Governance banners present in `docs/START_HERE.md:1-4` and `docs/SESSION_HANDOFF.md:1-4`; directory rules confirmed in `docs/SOP/directory-governance.md:1-40`.
- Links verified from `docs/System/documentation-index.md` and `docs/START_HERE.md` (spot-checked core targets: UAT master workflow, Fast‑Path, Archive Policy, Workflow Metrics, Long‑Term Maintenance, Prompts).
- System reports present and rendering: `docs/System/DEMO_PARITY_INDEX.md`, `WRAPPER_ADOPTION_MATRIX.md`, `CHART_COVERAGE_BY_DEMO.md`, `APPENDIX1_SCOPE_CROSSWALK.md`, `DEMO_EXECUTION_DECISION.md`.
- MVP checklist: canonical at `docs/Reports/PARITY_MVP_CHECKLISTS.md`; System mirror synced to match (updated `docs/System/PARITY_MVP_CHECKLISTS.md:1-5` to include canonical note).
- UAT curated/raw locations correct: curated under `docs/UAT/active/*` with [fill] placeholders; raw under `docs/Archive/ai-uat/*`. Session references point to System paths; remaining `docs/Reports/` mentions are canonical checklist/attachments only.
- Phase 9 normalization: `docs/Tasks/phase-9-scheduling-behavior-parity.md` uses `${SCHEDULE_REPO}` and `${EMPLOYEE_MGMT_REPO}`; variables defined in `docs/System/path-conventions.md`.
- Scripts: ran `./docs/scripts/health-check.sh` (no critical issues in active docs; absolute paths confined to Archive/older tasks) and `./docs/scripts/update-status.sh` to refresh dashboard.

## 2025-10-13 – Planner Approval: Scheduling Trim (Production Reference)
- Scope: Behavior-only MVP; visuals remain frozen. Source scheduling repo stays intact; trimmed reference is a separate repo.
- Decisions (Executor to apply in new repo only):
  - Remove “UI/UX” page: yes
  - Remove inert search field: yes
  - Keep virtualization switch visible, default Off: yes
- Repo/Deploy:
  - New repo name: `schedule-grid-system-prod` (code-only); create matching Vercel project; deploy and return production URL.
- References:
  - Plan: `plans/2025-10-13_scheduling-trim.plan.md`
  - UAT basis: `docs/UAT/active/AI-UAT_Scheduling_Initial-Comparison_2025-10-12.md`
  - Gate: `docs/System/DEMO2_VALIDATION_GATE.md` (≥60% reuse; hallucinations isolated)
- Next: Executor implements per plan and posts the production URL; we log it here and in `PROGRESS.md`.

## 2025-10-13 – Orchestrator: Parallelization Started (Post‑Phase 9)
- Trigger: Scheduling UAT (behaviour) passed; gate recorded (≥60% reuse, isolated). Trim approved and executing in a new repo.
- Tracks now running in parallel (all three):
  - Scheduling Trim (Executor): create `schedule-grid-system-prod`, remove UI/UX page and search field, keep virtualization Off by default, deploy new Vercel project, return URL per `plans/2025-10-13_scheduling-trim.plan.md`.
  - Manager Portal (Refactor‑first): start per `plans/2025-10-12_manager-portal-refactor.plan.md`; replace Recharts with wrappers, add adapters/tests, RU registrar.
  - Analytics Dashboard (Refactor‑first): start per `plans/2025-10-12_analytics-extraction.plan.md`; extract CDN/inline → React components using wrappers; RU locales; tests.
  - WFM Employee Portal (Parity‑first): start per `plans/2025-10-12_employee-portal-parity.plan.md`; wire forms/tables/dialog behaviours, RU formatting, tests.
- Guardrails: visuals frozen; library/docs repo is docs‑only; canonical checklist at `docs/Reports/PARITY_MVP_CHECKLISTS.md`; no new folders under `docs/`.
- Tracking: Phases A/B/C marked In Progress in `docs/Tasks/post-phase9-demo-execution.md`; log deploy URLs + evidence after each pass.

## 2025-10-13 – Process Update: Outcome‑Based UAT ↔ Code Loop
- Simplified execution: no timebox language; one agent per demo works to outcome (Deploy + UAT Pass + reports/checklist/CodeMap updated).
- Added SOP `docs/SOP/uat-code-loop.md` and per‑demo execution tasks:
  - `docs/Tasks/manager-portal_parity-execution.task.md`
  - `docs/Tasks/analytics-dashboard_parity-execution.task.md`
  - `docs/Tasks/employee-portal_parity-execution.task.md`
- Updated tracker and templates to remove 24h check‑ins; retained Agent Header/Handoff Checklist focused on deliverables.
 - Added `docs/SOP/agent-pipeline-3plus1.md` (3 active + 1 onboarding) and the UAT findings→task template at `docs/Workspace/Templates/13_UAT_Findings_Task.md`.

## 2025-10-13 – Planner: Unified Demo Pilot (Employees + Scheduling)
- Plan: `plans/2025-10-15_unified-demo-pilot.plan.md` — workspaces repo `${UNIFIED_DEMO_REPO}` with `apps/shell` and `packages/{employee-management,schedule}`; routes `/employees`, `/schedule`.
- Coordinator: `docs/Workspace/Coordinator/unified-demo/{README.md,CodeMap.md}`.
- Prep tasks (parallel):
  - Employees: `docs/Tasks/employee-management_prep-for-unification.task.md` (export `Root`, isolate `setupRU()`).
  - Scheduling: `docs/Tasks/scheduling_prep-for-unification.task.md` (export `Root`, basename‑aware, `setupRU()`).
- Acceptance (pilot): single deploy renders both routes without console errors; visuals unchanged; RU loaded; looks cohesive.

## 2025-10-13 – Executor: Scheduling package exports delivered for Unified Shell
- Repo: `${SCHEDULE_REPO}`
- Delivered:
  - `src/Root.tsx` (mountable root), `src/setupRU.ts` (registrar), `src/index.ts` exports `{ Root, setupRU }`
  - Standalone boot calls registrar before render (`src/main.tsx`)
  - Chart.js registration consolidated to registrar in `components/charts/*`
  - package.json exports declared; README mounting contract added
- Next: Integrator to import `{ Root as ScheduleRoot, setupRU as setupScheduleRU }` into `${UNIFIED_DEMO_REPO}`, call registrar at shell boot, and mount route `/schedule`.

## 2025-10-26 – UAT Outbound Package Prepared (3 demos)
- Session file: `uat-agent-tasks/10-26_12-00_UAT_PROMPT_3-demos.txt` (single message to paste)
- Attachment index: `uat-agent-tasks/10-26_12-00_INDEX.txt` (EP fix image + JSON log)
- Targets: Employee Portal, Manager Portal, Analytics Dashboard (URLs listed in the session prompt)

### Assignments Prefilled
- Tracker now lists the three demos with outcome rows and current Manager Portal deploy URL. Analytics and Employee Portal rows use `<pending>` until agents post their first deploy URLs.

## 2025-10-13 – Executor: Scheduling Trim Deployed (Production Reference)
- New repository (code‑only): `/Users/m/git/client/schedule-grid-system-prod`
- Commit: `f604acc`
- Production URL: `https://schedule-grid-system-prod-g8jajn3e9-granins-projects.vercel.app`
- Trim applied per plan: removed UI/UX page; removed inert search field; kept virtualization toggle (default Off); preserved Day/Period regrouping and Σ/123 overlays (Forecast + Plan); RU charts registered at startup; minimal non‑PII dataset.
- Next: UAT agent to run trimmed smoke on the production URL (behaviour‑only scope) and record Pass/Fail in the scheduling repo mapping (`${SCHEDULE_REPO}/docs/CH5_chart_mapping.md`).

## 2025-10-13 – Executor: Scheduling Trim Deployed (Production Reference)
- Repo: `~/git/client/schedule-grid-system-prod` (new, trimmed)
- Commit: `f604acc`
- Production URL: `https://schedule-grid-system-prod-g8jajn3e9-granins-projects.vercel.app`
- Applied decisions in new repo only:
  - Removed non‑MVP routes (UI/UX, etc.); default route = Scheduling
  - Removed inert search field; kept “🚀 500+ сотрудников” (default Off)
  - Kept Day/Period regrouping and Σ/123 overlays on Forecast + Plan
  - Ensured RU chart registration on startup
  - Replaced mocks with a minimal, non‑PII sample (4 employees, 6 shifts)

Follow‑ups
- Run UAT against the production reference URL (behavior‑only parity, visuals frozen).
- If green, mark DEMO2 gate as trimmed/validated and update `PROGRESS.md`.

### Scheduling – Trim Sequencing Decision
- Decision: Trim only after UAT passes (see `docs/SOP/trim-after-uat-sop.md`).
- ADR: `docs/ADR/2025-10-12_trim-after-uat.md`.
- Current build under UAT: `https://schedule-grid-system-mock-9nnwvgb8a-granins-projects.vercel.app`.
- Next: If UAT passes, perform trim in the Scheduling repo and re-validate; if UAT fails, return to Executor and retry.
 - Scheduling UAT (bb, live mock): Confirmed behavior deltas — no Day/Period or Coverage/Adherence toggles, Σ/123 overlays not wired, tooltips absent (legends present), search filter inert; mapping updated in `schedule-grid-system-mock/docs/CH5_chart_mapping.md`. No code changes this pass.
- Local verification this session: `npm run build` ✅, `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅.

## 2025-10-21 – Orchestrator: Portal merge complete
- Canonical docs refreshed with Employee Portal evidence: `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`, `docs/System/APPENDIX1_SCOPE_CROSSWALK.md`.
- UAT packs and SOP aligned to staging drafts: `docs/Tasks/uat-packs/parity_static.md`, `docs/Tasks/uat-packs/trimmed_smoke.md`, `docs/Tasks/screenshot-checklist.md`, `docs/SOP/demo-refactor-playbook.md`.
- Next agents follow execution plans queued in `plans/2025-10-12_manager-portal-refactor.plan.md`, `plans/2025-10-12_analytics-extraction.plan.md`, `plans/2025-10-12_employee-portal-parity.plan.md` (per `docs/System/DEMO_EXECUTION_DECISION.md`).
- Post-Phase 9 execution roadmap defined in `docs/Tasks/post-phase9-demo-execution.md` (Phases A–C); parity roadmap updated to reference the new phases.
- Retargeted legacy `docs/Reports/*` references (except canonical checklist) to `docs/System/*` so future plans read from the new locations.

## 2025-10-20 – Executor: Phase 8 trimmed production bootstrap
- Mirrored this repo into `~/git/client/employee-management-production`, retargeted `origin` to `granin/employee-management-production`, and kept the demo remote as `demo-origin`.
- Trimmed `src/App.tsx` in the production clone to render only the Employees list and deleted demo components (`EmployeePhotoGallery`, `PerformanceMetricsView`, `EmployeeStatusManager`, `CertificationTracker`, `EmployeeComparisonTool`).
- Updated production-docs copies: `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` now highlights the trimmed variant, `docs/System/trimmed-demo-repo-strategy.md` checklist checked off, and `docs/System/parity-roadmap.md` Phase 8 entry links the new URL. Added executor summary in the production repo’s `docs/SESSION_HANDOFF.md`.
- Validation in the production repo: `npm run typecheck` (`tsconfig.wrappers.json`), `npm run build`, `npm run test -- --project=chromium --workers=1 --grep "Employee list"` all ✅. Deployed via `vercel deploy --prod --yes --archive=tgz` → `https://employee-management-production-crvewjvky-granins-projects.vercel.app`.
- Follow-ups: add a `CHANGELOG.md` in the production repo to track cherry-picks, and capture trimmed screenshots for future documentation refresh.

## 2025-10-20 – Parity Static Review (No Login)
- Saved agent report locally (FeatureParityCheck_2025-10-20.md; archived in repo).
- Attachments archived locally (zip + extracted `screenshots/`). Note: this run reported an empty screenshots folder; trimmed live smoke will capture the required set.

## 2025-10-11 – Planner: Overlay padding regression plan
- Read `SIMPLE-INSTRUCTIONS.md`, `PLAN-USING-MAGIC-PROMPT.md`, and `docs/SOP/code-change-plan-sop.md`, then reviewed the overlay screenshots/regression brief.
- Logged findings in `docs/Tasks/overlay-padding-regression.md` (repro, expected vs actual, root cause at `src/components/common/Overlay.tsx:48`, token reference in `src/wrappers/ui/Dialog.tsx:69-109`).
- Authored `plans/2025-10-11_overlay-padding-regression.plan.md` with the code changes, consumer audit guidance, validation suite, and rollback steps.
- Updated `PROGRESS.md` to mark the plan _Unstarted_; no code/tests executed during planning.
- Next role: Executor should run the plan verbatim, execute the validation commands, and document results before archiving the plan.

## 2025-10-11 – Executor: Overlay padding regression fix
- Followed `docs/Archive/Plans/executed/2025-10-11_overlay-padding-regression.plan.md` to restore dialog spacing.
- Dropped the `padding: 0` override (`src/components/common/Overlay.tsx:66`) and removed compensating padding/shadow classes across overlays (`src/components/QuickAddEmployee.tsx:198-235`, `src/components/EmployeeList/BulkEditDrawer.tsx:26-55`, `src/components/EmployeeList/TagManagerOverlay.tsx:26-50`, `src/components/EmployeeList/ImportExportModals.tsx:26-118`, `src/components/EmployeeList/ColumnSettingsOverlay.tsx:25-89`, `src/components/EmployeeEditDrawer.tsx:401-493`). Added `mx-auto` to center constrained-width modals so they no longer hug the left edge.
- Updated `docs/Tasks/overlay-padding-regression.md` with the resolution summary/status and moved the executed plan to `docs/Archive/Plans/executed/`.
- Validations: `npm run build` ✅, `npm run test:unit` ✅ (Radix + RHF warnings expected), `npm run preview -- --host 127.0.0.1 --port 4174` → Vite served on 4175; manual spot-check confirmed restored modal/drawer padding. Re-ran `npm run build` ✅ and `npm run test:unit` ✅ after centering tweak.
- `PROGRESS.md` now notes the plan as executed with no active workstreams.
- Next role: Planner to await new priorities (trimmed demo / Storybook a11y) before drafting the next plan.

## 2025-10-15 – Planner: AI-Docs Alignment Plan
- Authored `plans/2025-10-15_phase-7-ai-docs-alignment.plan.md` to refresh the AI-docs form drafts with `formFieldAriaProps`, add a CSV helper snippet, and update the index/manifest/discovery notes with the Phase 7 frozen snapshot.
- Updated `PROGRESS.md` to list the plan as _Unstarted_ and moved `plans/2025-10-14_phase-7-final-review.plan.md` to On Deck so final sign-off resumes after the audit.
- No code/tests run (planning only). Next role: Executor should follow the plan verbatim, run `npm run build` and `npm run test:unit`, then document results in this file before reactivating the final review.

## 2025-10-13 – Executor: Component Library Polish Plan
- Executed `plans/2025-10-13_component-library-polish.plan.md`: added shared CSV/Excel utilities (`src/utils/importExport.ts` + Vitest coverage) and refactored `useEmployeeListState.tsx` to consume them; integrated the TipTap-backed `RichTextEditor` into the employee edit drawer with updated defaults/mapping (`src/components/forms/employeeEditFormHelpers.ts`).
- Introduced the virtualization benchmark harness (`scripts/benchmarks/datatable.ts`) and documented timings in `docs/Tasks/phase-7-component-library-discovery.md` (10k → 146.27 ms, 30k → 158.80 ms, 50k → 393.38 ms); follow-ups doc now marks the helper/editor work as complete.
- Dependencies: installed `papaparse`, `xlsx`, `@tiptap/react`, `@tiptap/starter-kit`, and `tsx`; `package-lock.json` updated via `npm install` (5 known upstream vulnerabilities remain — audit pending with maintainer approval).
- Tests/validation: `npm run build` ✅; `npm run typecheck` (`tsconfig.wrappers.json`) ✅; `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings expected); `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅; `npm run benchmark:datatable` ✅.
- Next role: Planner to craft the Phase 7 MiniSearch/search plan leveraging the refreshed discovery + follow-up docs; executors stand by until that plan is ready.

## 2025-10-13 – Planner: Rich-text & CSV helper fix plan
- Authored `plans/2025-10-13_rich-text-and-csv-fix.plan.md` to restore accessible labelling for the TipTap editor and rewire employee-list import/export flows to the shared helper module.
- Required reading baked into the plan: `docs/Tasks/phase-7-component-library-followups.md`, updated discovery notes, and the prior executor entries that highlighted the regressions.
- No code changes applied during planning; tests untouched. Plan lists the validation suite (`npm run build`, `npm run typecheck`, `npm run test:unit`, targeted Playwright) plus documentation updates.
- Next role: Executor should run the new plan before resuming `plans/2025-10-10_phase-7-minisearch.plan.md`. Once executed, update discovery/follow-up docs, mark the plan complete in `PROGRESS.md`, and archive it under `docs/Archive/Plans/executed/` per SOP.

## 2025-10-13 – Executor: Rich-text & CSV helper fix plan
- Completed `plans/2025-10-13_rich-text-and-csv-fix.plan.md`: `FormField` now emits label IDs, `RichTextEditor` focuses on label activation, and both the edit drawer and quick add modal forward the aria wiring. Employee list import/export flows call the shared helpers for CSV output and header checks; Vitest adds hire-date + empty-file coverage and Playwright asserts the new “Файл не содержит данных.” path.
- Installed `papaparse@^5.5.3` and `xlsx@^0.18.5` (production dependencies) so Vite/Playwright builds succeed; reran `npm run build`, `npm run typecheck`, `npm run test:unit`, and `npm run test -- --project=chromium --workers=1 --grep "Employee list"` (all ✅, Radix/RHF warnings unchanged). Benchmarked virtualization with `npx tsx scripts/benchmarks/datatable.ts` (10k → 95.21 ms, 30k → 133.03 ms, 50k → 318.67 ms).
- Docs synced: discovery + follow-ups mark the rich-text/CSV work complete and record benchmark numbers; parity roadmap and AI reference highlight the new helpers. MiniSearch plan is now unblocked—next planner can pick up the remaining Phase 7 follow-ups (charts/search polish).
- Repo clean after staging/archiving: `plans/2025-10-13_rich-text-and-csv-fix.plan.md` moved to `docs/Archive/Plans/executed/`, PROGRESS marks the plan Completed and outlines upcoming work.

## 2025-10-10 – Executor: Component Library Stabilization Plan
- Executed `plans/2025-10-10_component-library-stabilization.plan.md`: added wrapper READMEs (`src/wrappers/ui|form|data/README.md`), inline TSDoc, Storybook config/stories (`.storybook/`, `src/wrappers/**/**/*.stories.tsx`), Vitest smoke tests (`src/wrappers/__tests__/`), wrapper-focused typecheck config (`tsconfig.wrappers.json`), and refreshed system + AI docs.
- Updated scripts/config: `package.json` now exposes `test:unit`, `storybook`, `storybook:build`, `typecheck`; `vite.config.ts` gained Vitest config; `src/test/setup-tests.ts` stubs `ResizeObserver` and the TanStack virtualizer for jsdom.
- Discovery & follow-up docs adjusted: `docs/Tasks/phase-7-component-library-discovery.md` records execution notes; `docs/Tasks/phase-7-component-library-followups.md` now focuses on container split, charts/search, Storybook a11y sweeps, and virtualization benchmarks; system roadmap/structure docs mention Storybook + wrapper tests.
- Tests: `npm run build` ✅; `npm run typecheck` ✅; `npm run test:unit` ✅ (Radix emits expected warnings when titles/descriptions are visually hidden); `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅; `npm run storybook:build` ✅.
- Notes: Storybook output removed after build. Vitest suite relies on the virtualizer stub—update it when DataTable props change. Console warnings in unit tests intentionally flag hidden-headline coverage.
- Next role: Planner should author `plans/2025-10-12_employee-list-refactor.plan.md` using CE planner prompts, reading `docs/Tasks/phase-7-component-library-discovery.md`, `docs/Tasks/phase-7-component-library-task.md`, `docs/Tasks/phase-7-component-library-followups.md`, `docs/ADR/0002-wrapper-layer-ownership.md`, and `ai-docs/llm-reference/AiDocsReference.md`. Once drafted, log the new plan in `PROGRESS.md` and update this handoff.

## 2. Required Reading Before Implementation
1. `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` – roadmap/evidence inventory.
2. `docs/Archive/Tasks/00_parity-backlog-and-plan.md` – backlog & phase sequencing.
3. `docs/PRD_STATUS.md` – status of all PRDs; review `docs/SOP/prd-feedback-sop.md` for the conversion workflow.
4. `docs/SOP/ui-walkthrough-checklist.md` – validation steps (focus traps, matrix actions, exports, timeline checks).
5. Browser-agent parity report (`docs/AGENT_PARITY_REPORT.md`) and the latest bb audit on Desktop.
6. Required manuals/screenshots (CH3 Employees, CH5 Schedule*, CH7 Appendices, `docs/SCREENSHOT_INDEX.md`).
7. Phase 5 PRD (`docs/Archive/Tasks/05_phase-5-stabilization-and-validation-prd.md`) plus Phase 4 retro (`docs/Archive/Tasks/04_phase-4-accessibility-and-final-parity.md`) for detailed next steps.
8. `docs/TODO_AGENT.md` for focused follow-up items and command reminders.

## 3. Snapshot of Current Code
- `App.tsx`: Seeds employees with structured `EmployeeTask` timelines and work-scheme history samples, registers a global helper for quick-add (used by tests), and syncs employee mutations to localStorage so drawer saves persist across reloads.
- `EmployeeListContainer.tsx`: Production-style grid with filters (Esc shortcut), selection-mode toggle, dismiss/restore workflow, always-enabled tag manager, column settings, CSV/Отпуска/Теги exports, add/replace/remove matrix actions, tag-cap enforcement (≤4), import validation covering Appendix 1/3/4/6/8 headers, focus restoration for every overlay trigger, context-aware import/export headings, tag catalogue persistence, and a bulk-edit summary panel + scrollable selection list with total count.
- `EmployeeEditDrawer.tsx`: Required/optional sections aligned with CH3; dismiss/restore controls append system timeline badges alongside manual/bulk edits; scheme history section renders read-only timeline of assignments; skill/reserve summaries reflect bulk changes immediately; save button disables until email/phone/hour norm validations pass, emits “Сохранено” toast, and shows inline errors; close button exposes a stable test id.
- `QuickAddEmployee.tsx`: Minimal login/password flow with validation, shared Radix overlay semantics, and timeline defaults built via a shared task helper.
- Shared overlay focus now handled by `@wrappers/ui/Dialog`/`Overlay` (bulk edit, tag manager, column settings, quick add, edit drawer); legacy `useFocusTrap` hook removed.
- `src/utils/task.ts`: Shared helper for timeline entries (manual/bulk/system sources).
- Tests (`tests/employee-list.spec.ts`): cover row/drawer parity, dismiss/restore, quick-add accessibility, tag export download, selection-mode entry, tag limit enforcement, bulk edit skills/reserve add/remove/replace, import validation (extension + header negative/positive) for employees/skills/schemes/tags/vacations, plus new checks for drawer validation gating, persistence after reload, tag catalogue retention, dynamic import/export headings, and bulk-edit summary output.
- Deploy script is manual via Vercel CLI; ensure build/test succeed before promoting.

## 4. Evidence Checklist (complete before new work)
- [ ] Parity plan & backlog reviewed (`docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, `docs/Archive/Tasks/00_parity-backlog-and-plan.md`).
- [ ] PRD index inspected (`docs/PRD_STATUS.md`); confirm which PRD you are updating/creating.
- [ ] Latest browser-agent output/bb report triaged; conflicts noted.
- [ ] Relevant manuals/screenshots opened for reference.
- [ ] SOPs consulted (`docs/SOP/prd-feedback-sop.md`, `docs/SOP/standard-operating-procedures.md`, `docs/SOP/ui-walkthrough-checklist.md`).

## 5. Implementation TODO (Forward Plan)
1. **Screenshot backlog**: capture selection banner / dismiss timeline / tag-limit alert, register filenames in `docs/SCREENSHOT_INDEX.md`, and update archive banners.
2. **Phase 5 follow-up**: coordinate with product/backend on long-term persistence + validation expectations after cleanup; keep `docs/Archive/Tasks/05_phase-5-stabilization-and-validation-prd.md` in sync.
3. **NVDA sweep (Deferred)**: official deferral recorded 2025-10-11; move this pass to Phase 8 final UAT. Do not schedule NVDA during the Phase 6 cleanup slice.
4. **Agent loop**: after each slice, rerun the walkthrough, update PRDs/status index, and drop verification notes in this handoff.

## 6. Working Agreement
- Every new browser-agent delta must flow through `docs/SOP/prd-feedback-sop.md`: update or create PRD, log status (`docs/PRD_STATUS.md`), and document evidence in the PRD.
- Keep `docs/SOP/ui-walkthrough-checklist.md` and screenshot index aligned with UI changes.
- Run `npm run build` and `npm run test -- --reporter=list --project=chromium --workers=1` locally before committing or deploying.
- Only run `npm run preview -- --host 127.0.0.1 --port 4174` when requested by the repo owner; stop the server once checks finish.
- Document deployments (URL + purpose) in this handoff and/or parity plan.
- Maintain a quick VoiceOver (Chrome) lap after overlay changes: toolbar → Filters (Esc) → Mass edit → Tag manager (limit warning) → Import (error + success) → Quick add cancel → Edit drawer dismiss/restore.

## 7. Contact & Escalation Notes
- Legacy reference deployment: `https://employee-management-sigma-eight.vercel.app` (read-only).
- Production parity deployment: `https://employee-management-parity-9o205nrhz-granins-projects.vercel.app`.
- Coordinate credential usage (GitHub/Vercel) with the team; no direct pushes to `main` without approval.
- Log unresolved questions or blockers in `docs/SESSION_HANDOFF.md` under a new “Open Questions” sub-section if needed.

## 8. Browser Agent Walkthrough (share on handoff)

---

### 2025-10-20 – WFM Employee Portal – Docs pass (staging complete)
- Staging Drafts updated under `docs/Workspace/Coordinator/employee-portal/Drafts/` (RU labels, parity index, MVP checklists, wrapper matrix, coverage, appendix crosswalk, UAT unknowns, screenshot checklist).
- Canonical reports reflect Portal entries under `docs/System/*.md`; UAT packs updated; playbook section appended.
- Decision record present: `docs/System/DEMO_EXECUTION_DECISION.md`.
- Next (Orchestrator): follow `docs/Tasks/orchestrator-portal-merge-and-queue-execution.md` to verify/merge, update `PROGRESS.md`, and queue plans:
  - `plans/2025-10-12_manager-portal-refactor.plan.md`
  - `plans/2025-10-12_analytics-extraction.plan.md`
  - `plans/2025-10-12_employee-portal-parity.plan.md`
1. **Toolbar & Selection** – Tab across toolbar buttons, confirm focus styles, toggle selection mode, open/close bulk edit via Esc.
2. **Bulk Edit Skills/Reserve** – Select two rows, run add/replace/remove for primary/reserve skills (check drawer summaries reflect updates and timeline comment appears when provided). Observe the “Предстоящие изменения” summary and the “Всего” counter before applying changes.
3. **Tag Manager** – Open without selection, create a tag, close the modal, reopen (and optionally reload the page) to confirm the catalogue persists; trigger the ≥4 tag alert and confirm Esc restores focus to the toolbar.
4. **Import Validation** – For each context (Сотрудника/Навыки/Смены предпочтений/Схемы/Теги/Отпуска) upload one invalid CSV (missing header) then a valid template; confirm the heading/description reflect the chosen category, error/success toasts appear, and focus stays trapped.
5. **Export Check** – Run CSV, Отпуска, Теги exports; verify the modal heading/description match the context, downloaded files include expected headers/content, and the toast references the context-aware filename.
6. **Quick Add + Drawer** – Create a draft via quick add, confirm drawer opens, clear the email field to verify the save button disables, restore valid data, save to observe the toast, reopen to confirm persistence, and ensure VoiceOver (if available) announces headings/buttons in order.
7. **Accessibility Sanity** – With VoiceOver enabled, ensure the modals announce their titles/descriptions, Esc returns to the trigger, and live region messages read selection counts/import results. Schedule the NVDA pass and log differences alongside the existing VoiceOver notes.

## 2025-10-10 – Executor: Overlay Migration Plan
- Executed `plans/2025-10-10_overlay-migration.plan.md`: extended `@wrappers/ui/Dialog` props, updated the shared `Overlay`, migrated bulk edit/column settings/tag manager/import/export/quick add/edit drawer to Radix, removed `useFocusTrap`, restored the bulk-edit summary + selection counter, and tightened tag catalogue persistence.
- Tests: `npm run build`; `npm run test -- --project=chromium --workers=1 --grep "Employee list"`.
- Follow-up: no next plan yet. Planner should scope additional overlay polish (e.g. Radix dialog titles, any new requirements) and draft the next plan before more execution work continues.

## 2025-10-10 – Scout: Overlay A11y Discovery
- Radix still logs `DialogContent requires a DialogTitle` because overlays pass `title=""` and render custom headings (`src/components/EmployeeListContainer.tsx:2442-3112`, `QuickAddEmployee.tsx:90-140`, `EmployeeEditDrawer.tsx:480-540`).
- `@radix-ui/react-visually-hidden` is missing from `package.json`; add it so the wrapper can supply hidden headings without ad-hoc code. Discovery notes captured in `docs/Tasks/phase-6-overlay-discovery.md` (2025-10-10 section) alongside Playwright guardrail reminders.
- Next role: Planner to turn the discovery bullets into a sed-friendly overlay-follow-up plan; no code changes made.

## 2025-10-10 – Planner: Overlay Follow-up Plan
- Authored `plans/2025-10-10_overlay-follow-up.plan.md` (includes a Phase 0 ai-docs review followed by wrapper, overlay, test, and documentation updates).
- No tests executed during planning. Execution must run `npm run build` and `npm run test -- --project=chromium --workers=1 --grep "Employee list"` after applying the plan and perform the manual overlay sweep noted in the plan.
- Next role: Executor to carry out the new plan, then update `PROGRESS.md` and this handoff with results.

## 2025-10-10 – Executor: Overlay Follow-up Plan
- Extended `@wrappers/ui/Dialog`/`Overlay` with `titleHidden`/`descriptionHidden`, added `@radix-ui/react-visually-hidden`, and wired sr-only `DialogTitle`/`DialogDescription` nodes into bulk edit, column settings, tag manager, import/export, quick add, and employee edit drawer.
- Updated `tests/employee-list.spec.ts` to fail on Radix console warnings and switched modal assertions to resilient `getByTestId`/`getByRole` selectors.
- Tests: `npm run build`; `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅. Manual overlay sweep not run in this CLI session—next VoiceOver/NVDA check remains outstanding.
- Next role: Planner to queue the next Phase 6 task (or schedule the accessibility sweep) now that the overlay follow-up plan is complete.

## 2025-10-11 – Scout: Column Settings Drawer Background
- Documented the transparent sheet issue in `docs/Tasks/phase-6-column-settings-background-exploration.md` (column settings drawer shows toolbar ghosting).
- Identified the shared `Overlay` wrapper (`src/components/common/Overlay.tsx`) as the root cause because it left Radix `Dialog.Content` transparent by default.
- Next role: Planner to produce a plan that enforces an opaque background in the wrapper.

## 2025-10-11 – Planner: Overlay Background Plan
- Authored `plans/2025-10-11_overlay-background.plan.md` to inject `backgroundColor: '#ffffff'` into the shared `Overlay` content styles and rerun build + targeted Playwright tests.
- Plan ready for execution; follow SOP to archive after the fix lands.

## 2025-10-11 – Executor: Overlay Background Plan
- Applied the plan: `src/components/common/Overlay.tsx` now forces `backgroundColor: '#ffffff'` when merging `contentStyles` so Radix sheets render opaque surfaces.
- Tests: `npm run build`; `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅.
- Plan archived under `docs/Archive/Plans/executed/07_overlay-background.plan.md`; no further blockers.
## 2025-10-10 – Scout: Form Migration Discovery
- Discovery notes recorded in `docs/Tasks/phase-6-form-migration-discovery.md` (draft-plan gaps, current QuickAdd/Edit drawer state, schema usage, Playwright coverage).
- Key findings: helper file already present, forms still run on manual state/regex validation (`src/components/QuickAddEmployee.tsx`, `src/components/EmployeeEditDrawer.tsx`), schemas untouched at runtime, and tests depend on existing ids (`quick-add-modal`, `employee-edit-drawer`).
- AI workspace touchpoints: `ai-docs/wrappers-draft/form/FormField.tsx`, `ai-docs/wrappers-draft/form/EmployeeForm.tsx`, plus README/MANIFEST for wrapper conventions.
- Planner next: refresh `docs/Archive/Plans/wrong-drafts/02_form-migration.plan.md` into a new Magic-plan that reuses existing helpers/schemas, maps styling needs, and schedules RHF migration tests (`npm run build`, targeted Playwright slice).

## 2025-10-11 – Planner: Form Migration Plan
- Authored `plans/2025-10-11_form-migration.plan.md` to install RHF/Zod dependencies, extend helper defaults/resolvers, and migrate Quick Add + Employee Edit drawer onto `FormField`-backed RHF flows while preserving existing test ids.
- Plan references the 2025-10-10 discovery doc and AI workspace citations; executor must run `npm run build` and `npm run test -- --project=chromium --workers=1 --grep "Employee list"` after applying the changes.
- Next role: Executor to follow the plan line-by-line, document results in this handoff log, and archive the plan per SOP once tests pass.

## 2025-10-11 – Executor: Form Migration Plan
- Completed `plans/2025-10-11_form-migration.plan.md`: installed RHF/Zod dependencies, expanded helper defaults/resolvers (`src/components/forms/employeeEditFormHelpers.ts`, `src/schemas/quickAddSchema.ts`), and rewrote Quick Add + Employee Edit drawer to use `FormField`-backed RHF flows with hidden dialog titles/descriptions intact (`src/components/QuickAddEmployee.tsx`, `src/components/EmployeeEditDrawer.tsx`).
- Updated `docs/Tasks/phase-6-form-migration-discovery.md` with execution notes so discovery evidence now reflects the migrated flows.
- Tests: `npm run build`; `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅.
- Next role: Planner to review the RHF implementation, capture any follow-up work (e.g. documentation or schema refinements), and queue the next Stage 6 plan.

## 2025-10-11 – Planner: Overlay AI-Docs Sync Plan
- Authored `plans/2025-10-11_overlay-ai-docs-sync.plan.md` to mirror the production dialog wrapper into the AI-docs workspace, add shared token helpers, refresh `docs/Tasks/overlay-code-review-prep.md`, and log the sync in this handoff after execution.
- Execution requires no automated tests (documentation-only) but must run `git status -sb` to confirm the expected file list and follow the rollback section if needed.
- Next role: Executor to perform the AI-docs sync, update the overlay review prep note, and append the execution details here once the docs refresh lands.

## 2025-10-11 – Executor: Overlay AI-Docs Sync
- Synced `ai-docs/wrappers-draft/ui/Dialog.tsx` with the shipping `src/wrappers/ui/Dialog.tsx` implementation, including hidden titles/descriptions, modal/sheet variants, close guards, and tokenized styles.
- Added `ai-docs/wrappers-draft/shared/tokens.ts` so the draft wrapper can reuse the token helpers mirrored from `src/wrappers/shared/tokens.ts`.
- Updated `docs/Tasks/overlay-code-review-prep.md` to point reviewers at the refreshed draft.
- Tests: not run (documentation-only update).

## 2025-10-12 – Executor: Scheduling Behavior Parity (Phase 9)
- Repo: `${SCHEDULE_REPO}`
- Implemented behavior-only parity per plan (visuals frozen):
  - Adapters: `src/utils/charts/adapters.ts:1` added `toPeriodSeries`, `deriveHeadcountSeries`, `deriveFteHoursSeries`.
  - Overlay wiring: `src/components/ChartOverlay.tsx:1` added Day/Period tab and Σ/123 toggles; applies grouping and appends overlays.
  - Forecast chart: `src/components/ForecastChart.tsx:1` now accepts `timeUnit`/`overlaySeries` and passes `timeScale` to `LineChart`.
  - Container: `src/components/ScheduleGridContainer.tsx:132` computes overlays from real schedules, passes them down, and mounts `KpiCardGrid` under the chart.
  - Advanced UI: introduced `src/modules/advanced-ui-ux/components/EmployeeChecklist.tsx` and replaced the inline list in `AdvancedUIManager.tsx`.
  - Tests: extended `tests/unit/charts/adapters.spec.ts:1` for day/week/month grouping and headcount/FTE smoke cases.
- Validation (scheduling repo): `npm run build` ✅, `npm test` (Vitest) ✅.
- Docs updated (scheduling repo): `docs/CH5_chart_mapping.md:31` marks Day/Period, KPI tiles, and Σ/123 overlays as Pass with file refs.
- Deploy: completed. Production URL: https://schedule-grid-system-mock-7hx5y0g9x-granins-projects.vercel.app
  - Updated scheduling docs at `docs/CH5_chart_mapping.md:1` with the new URL.
  - UAT walkthrough for this behavior slice: `docs/UAT/Scheduling_Behavior_UAT_Walkthrough_2025-10-12.md:1` (this repo). Share with UAT agent.
  - Latest deployment: https://schedule-grid-system-mock-hoyghvtpm-granins-projects.vercel.app (KPI visible in 500+ view)
  - UAT result: behavior checks passed on build 7hx5y0g9x; subsequent builds retained behavior and cleaned logs; latest adds KPI visibility in virtualized mode.
  - CH5 crosswalk for this slice: schedule-grid-system-mock/docs/CH5_parity_crosswalk.md:1

## 2025-10-11 – Scout: Table Migration Discovery
- Role: Scout (Phase 6 Stage 3). Read CE scout prompts/SOP, `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, `docs/Tasks/06_phase-6-migration-planning-prd.md`, and the migration-prep references before touching production code.
- AI workspace reviewed end-to-end: `ai-docs/wrappers-draft/data/DataTable.tsx`, `ai-docs/playground/src/examples/table-demo/TableDemo.tsx`, `ai-docs/reference/snippets/tanstack-table/{basic,virtualized-rows}/src/main.tsx`, and `ai-docs/reference/snippets/tanstack-virtual/table/src/main.tsx` (citation details logged in discovery doc).
- Production audit covered `src/components/EmployeeListContainer.tsx`, `src/wrappers/data/DataTable.tsx`, `src/components/common/Overlay.tsx`, and `tests/employee-list.spec.ts`. Findings appended to `docs/Tasks/phase-6-table-migration-discovery.md` (2025-10-11 section) with AI-doc references, legacy behavior, wrapper gaps, Playwright impacts, and missing assets.
- Next role: Planner to draft `plans/YYYY-MM-DD_table-migration.plan.md` referencing the discovery doc; executor waits for that plan.

## 2025-10-11 – Repo Docs Refresh & Audit Plan
- Updated doc references to point at the archived backlog/PRDs and restored the shared readlist stub (`AGENTS.md:57-70`, `docs/System/documentation-index.md:5-26`, `docs/prompts/stage-6-uat-agent.md:1-44`, `docs/SESSION_READLIST.md:1-9`).
- Refreshed SOPs/guides (`docs/SOP/*`) so they reference the stubbed backlog instead of deleted files.
- Added `plans/2025-10-11_repo-audit.plan.md` to capture a follow-up audit for plans/prompts/AI-docs; do **not** mark it active until the table migration plan finishes.
- No tests run (documentation-only cleanup).

## 2025-10-10 – Planner: Table Migration Plan
- Authored `plans/2025-10-10_table-migration.plan.md` to migrate `EmployeeListContainer` onto the shared `DataTable` wrapper, keep selection/focus behaviour intact, and refresh Playwright selectors to the new `data-testid` hooks.
- Plan cites the 2025-10-11 discovery notes and AI workspace snippets; executor must follow each apply_patch block, rerun `npm run build` and the targeted Playwright slice, and capture virtualization/console outcomes in the discovery doc.
- Next role: Executor to run the plan verbatim, archive it on completion, and update this log with test results + any follow-up work.

## 2025-10-11 – Executor: Table Migration Plan
- Applied `plans/2025-10-10_table-migration.plan.md`: swapped the legacy `<table>` markup for the shared `DataTable` wrapper, added memoized column/row props for selection + focus (`src/components/EmployeeListContainer.tsx`), and fixed the wrapper’s focus helper to avoid TDZ errors (`src/wrappers/data/DataTable.tsx:175`).
- Added TanStack runtime dependencies so the wrapper builds in production (`package.json:15-18`) and updated Playwright selectors to the new `data-testid` hooks (`tests/employee-list.spec.ts:3-30`).
- Tests: `npm run build`; `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅. Preview server started (`npm run preview`) but manual overlay sweep could not be performed in this CLI-only session—flag for the next GUI check.
- Discovery doc now includes execution results for virtualization/selection parity (`docs/Tasks/phase-6-table-migration-discovery.md`).
- Next role: Planner to queue the repo audit plan already staged (`plans/2025-10-11_repo-audit.plan.md`) or progress to the next Stage 6 slice once QA signs off.

## 2025-10-11 – Planner: Table Style Parity Plan
- Authored `plans/2025-10-11_table-style-parity.plan.md` to reintroduce the legacy row padding, borders, and avatar alignment inside `EmployeeListContainer.tsx` and the shared DataTable wrapper.
- Execution must run `npm run build`, `npm run test -- --project=chromium --workers=1 --grep "Employee list"`, and launch `npm run preview` for a visual comparison with the legacy screenshot.
- Next role: Executor to apply the plan, update the discovery log, and archive the plan after the layout matches the expected design.

## 2025-10-11 – Executor: Table Style Parity Plan
- Applied the plan: row height dropped to 60px and column meta padding realigned with legacy spacing (`src/components/EmployeeListContainer.tsx:848-1074`); DataTable cells now use centered padding and blue separators, and keyboard activation hands back the full context (`src/wrappers/data/DataTable.tsx:163-271`).
- Updated discovery notes with the new styling baseline (`docs/Tasks/phase-6-table-migration-discovery.md`).
- Tests: `npm run build`; `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅.
- Manual check: `npm run preview` (server exposed at `http://127.0.0.1:4189/`; visual verification should be completed in a GUI session).
- Next role: Planner/QA to confirm the visual diff in-browser, then move on to the repo audit or next Stage 6 slice.

## 2025-10-11 – Executor: Table Header Style Plan
- Applied `plans/2025-10-11_table-header-style.plan.md`: header cells now use bold uppercase labels with 12px × 24px padding and the blue separator (`src/wrappers/data/DataTable.tsx:70-116`), matching row spacing.
- Updated discovery doc with the header parity note (`docs/Tasks/phase-6-table-migration-discovery.md`).
- Tests: `npm run build`; `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅.
- Manual preview recommended to confirm header spacing in a GUI (`npm run preview`).
- Next role: Planner to continue with component-library stabilization scheduling (header work complete).

## 2025-10-11 – Scout: Component Library Follow-up (Review)
- Captured external review findings in `docs/Tasks/phase-7-component-library-discovery.md`: wrappers lack READMEs, Storybook examples, and smoke tests; `EmployeeListContainer.tsx` needs extraction into smaller pieces, and future work must cover Tremor/Recharts charts plus MiniSearch integration.
- Review source: `ai-docs/llm-reference/1760097242546_10-07-1_Comprehensive_WFM_Demo_Stack_Evaluation.md`.
- Next role: Planner to draft `plans/YYYY-MM-DD_component-library-stabilization.plan.md` covering documentation, testing, Storybook setup, and wrapper/library refactors before tackling charts/search features.

## 2025-10-11 – Executor: Repo Reference Audit
- Followed `plans/2025-10-11_repo-audit.plan.md` Phase 1–3 commands (`rg "docs/Tasks/"`, `rg "SESSION_READLIST"`, scoped sweeps under `plans/` and `docs/Archive/Plans/`) to confirm backlinks point at the new backlog/readlist structure.
- Added stub `docs/Tasks/stage-6-ai-uat-checklist.md` so Stage 6 UAT references resolve; stub routes agents to the prompt + plan and keeps a blocker log placeholder.
- AI workspace (`ai-docs/README.md`, `MANIFEST.md`, `RESEARCH_BRIEF.md`, `QUESTIONS.md`) already aligned with the stubbed backlog/readlist—no edits required.
- Validation: reran `rg "docs/Tasks/"` and `rg "SESSION_READLIST"` from repo root; only expected stub/archive hits remain. Tests not run (documentation-only sweep).

## 2025-10-10 – Planner: Component Library Stabilization Plan
- Authored `plans/2025-10-10_component-library-stabilization.plan.md` covering wrapper READMEs/TSDoc, Storybook setup (`.storybook/` + wrapper stories), Vitest smoke tests under `src/wrappers/__tests__/`, system doc refresh, and a follow-up task log for the EmployeeListContainer split + chart/search work.
- Plan lists all apply_patch/cat commands, test suite (`npm run build`, `npm run typecheck`, `npm run test:unit`, Playwright slice, `npm run storybook:build`), rollback guidance, and follow-up plan stub (`plans/2025-10-12_employee-list-refactor.plan.md`).
- Header styling plan remains reserved; executors should finish `plans/2025-10-11_table-header-style.plan.md` before starting the new component-library plan. Once ready, run the listed commands verbatim and update discovery/docs as outlined.
- Next role: Executor to follow the new plan step-by-step after confirming the header styling work is done; Planner/Scout stand by for execution feedback or new gaps.

## 2025-10-12 – Planner: Employee List Refactor Plan
- Authored `plans/2025-10-12_employee-list-refactor.plan.md` (hook extraction + sectional components) so executors can split `EmployeeListContainer.tsx` into a reusable state hook and focused views (`Toolbar`, `Filters`, `Table`, `BulkEditDrawer`, `TagManagerOverlay`, `ColumnSettingsOverlay`, `ImportExportModals`).
- Required reading baked into the plan: `docs/Tasks/phase-7-component-library-discovery.md`, `docs/Tasks/phase-7-component-library-followups.md`, `docs/Tasks/phase-7-component-library-task.md`, `docs/ADR/0002-wrapper-layer-ownership.md`, `ai-docs/llm-reference/AiDocsReference.md`.
- Execution reminders: copy markup verbatim to preserve test ids, remove the legacy file after the split, run `npm run build`, `npm run typecheck`, `npm run test:unit`, `npm run test -- --project=chromium --workers=1 --grep "Employee list"`, and update docs (`project-structure`, `parity-roadmap`, discovery/follow-up notes).
- Next role: Executor to run the plan; report outcomes/blockers and mark follow-up feature tasks once the module reorganizes successfully.

## 2025-10-11 – Planner: Review Task Consolidation
- Updated `docs/Tasks/phase-6-cleanup-task.md` with the review-driven cleanup checklist (wrapper docs, AI-doc alignment, EmployeeListContainer pre-work, chart/search placeholders, test artifact sweep).
- Added `docs/Tasks/phase-7-component-library-followups.md` to track refactors (container split, hooks), feature enhancements (charts, search, rich text, CSV helpers), and testing/a11y benchmarks.
- Rebuilt the AI-doc index at `ai-docs/llm-reference/AiDocsReference.md` summarising the migration review findings; reference it when drafting future plans.
- Stubbed `plans/2025-10-12_employee-list-refactor.plan.md` for the EmployeeListContainer decomposition once the stabilisation plan executes.

## 2025-10-11 – Planner: AI-Docs Audit Prep
- Authored `docs/System/ai-docs-index.md` to map each folder in `ai-docs/` (guides, wrappers, playground, snippets, scripts, URL logs, third-party clones).
- Linked the index from `AGENTS.md` so scouts/planners read it before touching AI-doc assets.
- Added draft plan `plans/2025-10-13_ai-docs-audit.plan.md` for a post-stabilisation sweep of `ai-docs/reference/docs/` and `ai-docs/third_party/` (do not execute yet).

## 2025-10-10 – Planner: AI-Docs Sync Guidance Refresh
- Updated `docs/System/ai-docs-index.md` with a **Sync Expectations** section spelling out when to mirror production wrappers into `ai-docs/wrappers-draft/` and how to mark frozen demos.
- Extended `docs/SOP/code-change-plan-sop.md` so scouts/planners confirm the `ai-docs` drafts are refreshed whenever wrapper/demo changes land in production before drafting plans.
- No tests run (documentation-only update). Next agents should keep the mirroring rule in mind while executing `plans/2025-10-10_component-library-stabilization.plan.md` follow-ups or future wrapper work.

## 2025-10-10 – Planner: AI-Docs Drafts Trimmed to Reference Demos
- Rolled `ai-docs/wrappers-draft/data/DataTable.tsx`, `ai-docs/wrappers-draft/form/FormField.tsx`, and `ai-docs/wrappers-draft/form/EmployeeForm.tsx` back to concise demo implementations (no full mirroring of production wrappers).
- Revised `docs/System/ai-docs-index.md` (reference strategy section) and `docs/SOP/code-change-plan-sop.md` to clarify that drafts are illustrative; only excerpt production code when a plan explicitly requires it, and plan to create a frozen reference snapshot once the component-library refactor settles (tracked in Phase 7 follow-ups).
- No tests run (docs + demo-only edits). Future scouts/planners should call out any deliberate divergences between the drafts and production when citing AI-doc references.

## 2025-10-10 – SOP Update: Wrapper Library Expectations
- Added a "Wrapper Library Work" section to `docs/SOP/standard-operating-procedures.md` so agents keep Storybook (`npm run storybook:build`), Vitest (`npm run test:unit`), wrapper READMEs, and AI-doc references aligned even after current plans archive.
- No code or tests touched—documentation-only update to preserve Storybook guidance long term.

## 2025-10-12 – Scout Prep: Charts & Search Discovery Task
- Authored `docs/Tasks/phase-7-charts-discovery.md` outlining the read-only scout workflow for Tremor/Recharts/MiniSearch research while the EmployeeList refactor executes.
- Updated `docs/Tasks/phase-7-component-library-followups.md` to reference the new discovery task before planners schedule charts/search work.
- No tests run (documentation only). Next Scout should follow the task file, cite AI-doc snippets, and log findings without touching production code.

## 2025-10-10 – Scout: Charts & Search Discovery
- Followed the new brief: reread role guidance, then inspected the dashboard placeholder and legacy search pipeline. Documented findings in `docs/Tasks/phase-7-charts-discovery.md:55-85`, covering Tremor/Recharts/MiniSearch references plus current limitations.
- Key evidence: chart placeholder still static (`src/components/PerformanceMetricsView.tsx:377-387`), metric tables feeding future series data (`PerformanceMetricsView.tsx:310-374`), and `includes`-based filtering with manual sort (`src/components/EmployeeList/EmployeeListContainer.legacy.tsx:669-739`).
- AI-doc assets consulted: Tremor performance card (`ai-docs/reference/snippets/tremor/performance-card.tsx:1-48`), Recharts area chart (`ai-docs/reference/snippets/recharts/basic-area-chart.tsx:1-44`), and MiniSearch fuzzy setup (`ai-docs/reference/snippets/minisearch/basic-search.ts:1-29`), plus the high-level brief (`ai-docs/llm-reference/AiDocsReference.md:1-52`).
- Commands: `sed -n '240,360p' src/components/PerformanceMetricsView.tsx`, `rg "filter" src/components/EmployeeList`, `sed -n '1,200p' ai-docs/reference/snippets/tremor/performance-card.tsx`, `sed -n '1,200p' ai-docs/reference/snippets/recharts/basic-area-chart.tsx`, `sed -n '1,200p' ai-docs/reference/snippets/minisearch/basic-search.ts`.
- Next role: Planner to draft `plans/YYYY-MM-DD_charts-search.plan.md` once `plans/2025-10-12_employee-list-refactor.plan.md` executes, selecting Tremor vs Recharts and budgeting MiniSearch integration work.

## 2025-10-10 – Planner Update: Charts Deferred to Phase 9
- Moved dashboard chart implementation out of Phase 7 follow-ups; new “Deferred – Phase 9 Analytics Demo (Tentative)” section in `docs/Tasks/phase-7-component-library-followups.md:23-27` keeps the placeholder live until a chart-oriented demo is chosen.
- Annotated `docs/Tasks/phase-7-charts-discovery.md:8-9` with a status banner so scouts know the instructions are on ice until PROGRESS.md reactivates the task.
- Updated `docs/System/parity-roadmap.md:28` to note that charts resume in Phase 9 during analytics demo selection.
- Captured the parked work in `docs/Tasks/phase-9-analytics-demo-task.md:1-73` so Phase 9 inherits the research notes and activation checklist.
- No tests run (documentation update only). Next planner should focus on MiniSearch, rich-text, and import/export helpers for Phase 7; revisit charts when the analytics demo is scheduled.

## 2025-10-12 – Executor: Employee List Refactor Plan
- Executed `plans/2025-10-12_employee-list-refactor.plan.md` through Phase 4: extracted state into `useEmployeeListState.tsx`, created sectional components (`Toolbar`, `Filters`, `Table`, `BulkEditDrawer`, `TagManagerOverlay`, `ColumnSettingsOverlay`, `ImportExportModals`), wired the new `EmployeeListContainer.tsx`, and removed the legacy monolith.
- Updated docs per plan: project structure snapshot now lists `src/components/EmployeeList/`, parity roadmap notes the split, discovery/follow-up docs reference the new files, and the component-refactor checklist is marked complete.
- Tests: `npm run build` (post-refactor), `npm run typecheck`, `npm run test:unit` (Radix hidden-title + RHF act warnings expected), `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅.
- Next role: Planner to queue the next Phase 7 effort (charts, MiniSearch, Storybook a11y, perf benchmarks) using the updated discovery/follow-up docs.

## 2025-10-10 – Planner: Component Library Polish Plan
- Added `plans/2025-10-13_component-library-polish.plan.md` covering CSV/Excel helper extraction, TipTap-rich tasks editor, and DataTable virtualization benchmarks. The plan cites `docs/Tasks/phase-7-component-library-followups.md`, `docs/Tasks/phase-7-component-library-discovery.md`, `ai-docs/llm-reference/AiDocsReference.md`, and `docs/System/parity-roadmap.md` as required reading.
- No code changes; worktree remains clean aside from the plan file. Tests not run (planning-only session).
- Required validations for the executor: `npm install`, `npm run build`, `npm run typecheck`, `npm run test:unit`, `npm run test -- --project=chromium --workers=1 --grep "Employee list"`, `npm run benchmark:datatable`, and Storybook build if the plan updates stories.
- Next role: Executor to run the plan line-by-line, update docs with benchmark timings, and archive the plan on completion. Planners/Scouts stand by for follow-up MiniSearch/charts work after execution.

## 2025-10-10 – Planner: MiniSearch Integration Plan
- Authored `plans/2025-10-10_phase-7-minisearch.plan.md` to introduce MiniSearch helpers, wire the employee list hook, add Storybook/Playwright/Vitest coverage, and sync documentation/AI-doc references.
- Updated `PROGRESS.md` to set the plan active (_Unstarted_) so the next executor can begin as soon as the polish work is archived.
- Worktree intentionally unchanged beyond the new plan file; no code or tests executed.
- Next role: Executor to follow the plan verbatim (dependency install, helper wiring, tests/docs updates) and log results before archiving the plan.

## 2025-10-10 – Executor: MiniSearch Integration (completed)
- MiniSearch helper now lives in `src/utils/search.ts` and `useEmployeeListState.tsx` consumes it to return ranked search summaries and highlight matched rows (amber border + `data-search-hit`/`data-search-rank`). `Filters.tsx` surfaces a SR-friendly “Совпадений” status message, and the Storybook scenario in `EmployeeListContainer.stories.tsx` demonstrates the fuzzy workflow.
- Synced documentation and AI workspace so future planners see the same API: updated `docs/Tasks/phase-7-component-library-followups.md`, `docs/Tasks/phase-7-component-library-discovery.md`, `docs/System/parity-roadmap.md`, and refreshed the MiniSearch snippet in `ai-docs/reference/snippets/minisearch/basic-search.ts` plus the reference notes in `ai-docs/llm-reference/AiDocsReference.md`.
- Tests: `npm run build` ✅, `npm run typecheck` ✅, `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings unchanged), `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅ (search highlight spec included), `npm run storybook:build` ✅.
- Next role: Planner can schedule the next follow-up (e.g., AI-docs audit draft) once the repo owner prioritises it. No active plan at the moment; PROGRESS has been updated to reflect the clear queue.

## 2025-10-14 – Executor: Final Migration Review Plan
- Followed `plans/2025-10-14_phase-7-final-review.plan.md`: cross-checked overlays, forms, MiniSearch, and table polish against reviewer briefs (b1/b2) with evidence logged in `docs/Tasks/phase-7-final-review.md`.
- Confirmed shared overlay background fix and sr-only headings (`src/components/common/Overlay.tsx:1-88`, EmployeeList overlays). Verified form aria wiring (Quick Add, edit drawer, TipTap) and MiniSearch highlighting + accessibility signals (Filters + `useEmployeeListState`).
- Revalidated component-library polish: shared import/export helpers/tests, documentation sync (`docs/Tasks/phase-7-component-library-discovery.md`, `ai-docs/llm-reference/AiDocsReference.md`).
- Validation commands (2025-10-14): `npm run build` ✅; `npm run typecheck` ✅; `npm run test:unit` ✅ (*Radix hidden-title + RHF act warnings expected*); `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅; `npm run storybook:build` ✅; `npx tsx scripts/benchmarks/datatable.ts` ✅ (10 k → 107.64 ms, 30 k → 147.25 ms, 50 k → 374.24 ms).
- Residual items: charts remain deferred to Phase 9; Storybook axe sweeps / edge-case stories still open per follow-ups doc; accessibility sweep scheduled separately. Ready for planner to queue the next roadmap phase once this plan is archived.

## 2025-10-15 – Executor: AI-Docs Alignment Snapshot
- Executed `plans/2025-10-15_phase-7-ai-docs-alignment.plan.md`: refreshed `ai-docs/wrappers-draft/form/FormField.tsx` with the accessible `formFieldAriaProps` helper, updated `EmployeeForm.tsx` + README usage, and added the Phase 7 snapshot note.
- Added the shared CSV/Excel helper snippet at `ai-docs/reference/snippets/utils/import-export.ts`, referenced it from `ai-docs/wrappers-draft/README.md`, and logged the audit in `ai-docs/llm-reference/AiDocsReference.md`.
- Synced indexes/docs: `docs/System/ai-docs-index.md`, `ai-docs/MANIFEST.md`, `docs/Tasks/phase-7-component-library-discovery.md`, and `docs/Tasks/phase-7-component-library-followups.md` now mark the 2025-10-15 frozen snapshot.
- Validations (2025-10-15): `npm run build` ✅; `npm run test:unit` ✅ (*Radix dialog title + RHF act warnings remain expected guardrails*).
- Next role: Planner to decide the next roadmap slice (Phase 8 trimmed demo vs. Phase 9 analytics) now that the AI-docs snapshot is current. No active plan at present; update PROGRESS with the new plan once prioritised.

## 2025-10-14 – Follow-Up: Overlay Stacking & Drawer Border
- Added tracking doc `docs/Tasks/z-index-and-drawer-border-followup.md` with reproduction notes and screenshot references from `${DESKTOP_SHOTS_DIR}`.
- Outstanding issues: Radix overlays still appear beneath employee table headers; bulk-edit/edit drawers missing 1px left separator.
- Next agent cycle: Scout → Planner → Executor per task doc. Please coordinate plan authoring before adjusting z-index or drawer styling.

## 2025-10-15 – Scout: Overlay Z-Index & Drawer Border Discovery
- Read role prompts/SOP (`context-engineering.md`, SIMPLE/RESEARCH prompts, code-change-plan SOP) and walked the follow-up brief.
- Confirmed Radix `Dialog` still pins overlay/content layers to `zIndex: 9/10` (`src/wrappers/ui/Dialog.tsx:71`, `src/wrappers/ui/Dialog.tsx:94`), which loses against components using tokenised layers (e.g., loading veil at `z-20`). `Popover` already consumes the design token helper (`src/wrappers/ui/Popover.tsx:34`), and the token scale defines `--em-zIndex-modal` at 30 (`src/styles/tokens.css:65`). Recommendation: migrate `Dialog` to `zIndexVar('modal')`/`zIndexVar('popover')` so overlays out-rank the sticky header defined in `DataTable` (`src/wrappers/data/DataTable.tsx:92`).
- Drawer separators are inconsistent: employee edit + bulk edit pass `border-l border-gray-200` (`src/components/EmployeeEditDrawer.tsx:401`, `src/components/EmployeeList/BulkEditDrawer.tsx:26`), but column settings omits it (`src/components/EmployeeList/ColumnSettingsOverlay.tsx:25`). Because `Overlay` zeroes out padding on the sheet container (`src/components/common/Overlay.tsx:66`), the separator likely belongs in the shared sheet style or in a reusable class so every sheet stays aligned.
- Documented findings under `## Discovery – 2025-10-15 (Scout)` in `docs/Tasks/z-index-and-drawer-border-followup.md`.
- No code changes or tests executed; repo left untouched beyond documentation.

## 2025-10-15 – Planner: Overlay Layering & Sheet Border Plan
- Authored `plans/2025-10-15_overlay-layering-and-sheet-border.plan.md` to migrate Radix dialog overlay/content stacking onto `zIndexVar("modal")`, add the shared 1 px sheet separator, and drop redundant Tailwind borders from edit/bulk drawers while leaving Column Settings to inherit the shared style.
- Updated `PROGRESS.md` to mark the plan `_Unstarted_` for the executor, keeping charts/analytics work out of scope.
- Added a planner note in `docs/Tasks/z-index-and-drawer-border-followup.md` so execution references the screenshot at `${DESKTOP_SHOTS_DIR}/Screenshot 2025-10-11 at 10.47.55.png` and the required validations.
- Tests not run (planning only).

## 2025-10-15 – Executor: Overlay Layering & Sheet Border Plan
- Followed `docs/Archive/Plans/executed/2025-10-15_overlay-layering-and-sheet-border.plan.md`: `src/wrappers/ui/Dialog.tsx:20-108` now pulls `zIndexVar("modal")` **and** applies the shared sheet separator via `borderLeft: 1px solid ${colorVar("borderMuted")}`.
- Removed redundant drawer borders (`src/components/EmployeeEditDrawer.tsx:400`, `src/components/EmployeeList/BulkEditDrawer.tsx:24`, `src/components/EmployeeList/ColumnSettingsOverlay.tsx:23`) so all sheet-style overlays inherit the shared treatment.
- Documentation synced via `docs/Tasks/z-index-and-drawer-border-followup.md:1-70`, `PROGRESS.md:15-34`, and backlog note 18 in `docs/Archive/Tasks/00_parity-backlog-and-plan.md:106-114` to mark the work complete.
- Validation suite (2025-10-15): `npm run build` ✅; `npm run test:unit` ✅ (*Radix dialog title + RHF act warnings remain expected*). Playwright slice unchanged from earlier execution.
- Manual QA: repo owner confirmed Quick Add, Edit Drawer, Bulk Edit, and Column Settings overlays now display the consistent 1 px divider without artifacts.

## 2025-10-15 – Quick Add Validation Gating
- Tweaked `src/components/QuickAddEmployee.tsx:118-133` to run RHF validation on submit (`mode: 'onSubmit', reValidateMode: 'onChange'`) so the login field no longer shows an error as soon as the modal opens.
- Validation: `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings remain expected).
- Manual QA pending – expect error messages only after the first failed submission.

## 2025-10-15 – Employee Table Column Truncation
- Added truncation handling for long org-unit/team/scheme labels (`src/components/EmployeeList/useEmployeeListState.tsx:921-998`) to prevent overlap across columns. Cells now clamp to their column width with ellipsis.
- Validation: `npm run build` ✅; `npm run test:unit` ✅ (*Radix dialog title + RHF act warnings remain expected*).
- Manual QA: verify employee list columns “Точка оргструктуры”, “Команда”, “Схема работы”, and “Должность” clamp long values without bleeding into neighbours.

## 2025-10-15 – Scout: Overlay Scrim Regression
- Followed Scout cadence (SIMPLE + RESEARCH prompts, code-change-plan SOP) to document the missing backdrop when Radix overlays open in the parity repo versus the legacy build.
- Comparison screenshots: legacy (`${DESKTOP_SHOTS_DIR}/Screenshot 2025-10-11 at 13.39.23.png`, `${DESKTOP_SHOTS_DIR}/Screenshot 2025-10-11 at 13.39.29.png`) show the dimmed scrim; current build (`${DESKTOP_SHOTS_DIR}/Screenshot 2025-10-11 at 13.46.53.png`, `${DESKTOP_SHOTS_DIR}/Screenshot 2025-10-11 at 13.46.58.png`, `${DESKTOP_SHOTS_DIR}/Screenshot 2025-10-11 at 13.47.03.png`) leaves the background fully lit.
- `Dialog` still points the overlay at `colorVar("backdrop")` (`src/wrappers/ui/Dialog.tsx:91-109`), but the CSS variable lives in `src/styles/tokens.css:1-40`, which is never imported (`rg "tokens.css" src` ⇒ no hits). Without that stylesheet (or an `applyTheme` call), `var(--em-colors-backdrop)` resolves to nothing, so the scrim renders transparent.
- Logged details and reproduction steps in `docs/Tasks/overlay-scrim-regression.md`. No code changes yet; next role should author a plan to load the token map at app startup and verify overlays regain the dimmed backdrop.

## 2025-10-15 – Planner: Overlay Scrim Restoration Plan
- Authored `plans/2025-10-15_overlay-scrim-plan.md` to import `src/styles/tokens.css` via `src/main.tsx` so all `colorVar` usages (including the overlay backdrop) resolve at runtime.
- Plan also directs the executor to flip `docs/Tasks/overlay-scrim-regression.md` status to “In progress” (with a plan link), run `npm run build` + `npm run test:unit`, preview overlays, and capture QA evidence.
- `PROGRESS.md` now lists the plan under Active Plan (_Unstarted_) and pauses other workstreams until the regression is cleared.

## 2025-10-15 – Executor: Overlay Scrim Restoration Plan
- Imported the design-token stylesheet in `src/main.tsx` before `index.css`, fulfilling the plan’s Phase 1.
- Updated `docs/Tasks/overlay-scrim-regression.md` to mark the fix complete with validation notes and archived the plan under `docs/Archive/Plans/executed/2025-10-15_overlay-scrim-plan.md`.
- Validation: `npm run build` ✅; `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings remain expected). Manual QA via `npm run preview -- --host 127.0.0.1 --port 4174` (served at 4175) confirmed the dimmed scrim across Quick Add, Tag Manager, and Edit Drawer.
- `PROGRESS.md` now reflects no active plan; next workstream awaits prioritisation.

## 2025-10-15 – Scout: Modal Shadow Regression
- Compared legacy vs current modals (`/Users/m/Desktop/Screenshot 2025-10-11 at 13.39.29.png` vs `/Users/m/Desktop/Screenshot 2025-10-11 at 14.32.40.png`) and observed a new bright halo along modal edges in the parity build, especially near the internal scroll track.
- Logged `docs/Tasks/modal-shadow-regression.md` capturing reproduction steps, findings, and impact. Root cause suspicion: Tailwind shadow utilities (`shadow-xl`/`shadow-2xl`) now stack with the design-token shadow supplied by `Dialog` since tokens were finally imported.
- No code changes yet; recommend a short follow-up plan to remove redundant shadows from overlay components and verify appearance across Quick Add, Tag Manager, and drawers.

## 2025-10-20 – Scout: Phase 8 Trimmed Demo Discovery
- Captured trim scope, shared assets, and risks in `docs/Tasks/phase-8-trimmed-demo-discovery.md` (nav/component removals, documentation updates, and dual-repo considerations).
- Key evidence: header `views` array that still exposes demo tabs (`src/App.tsx:1411-1478`), demo-only badges inside gallery/performance/status modules (`src/components/EmployeePhotoGallery.tsx:128-143`, `src/components/PerformanceMetricsView.tsx:107-210`, `src/components/EmployeeStatusManager.tsx:241-259`, `src/components/CertificationTracker.tsx:347-369`), and Stage 6 UAT triage confirming these modules remain placeholders (`docs/Archive/stage-6-ai-uat/Stage-6-UAT-Report-nsp559gx9-vs-7b28yt9nh.md:80-109`).
- Shared asset snapshot notes that the trimmed repo must mirror the employee dataset and type definitions so the Employees drawer, imports, and Playwright suites keep working (`src/App.tsx:1-116`, `src/types/employee.ts:111-177`, `tests/employee-list.spec.ts:1-160`).
- Open risks tagged for planners: decision on deleting vs. hiding unused modules, updating documentation to reflect dual builds, and finishing the sync checklist in the repo strategy doc (`docs/System/trimmed-demo-repo-strategy.md:1-37`).
- Tests: none (discovery-only session).
- Next role: Planner to draft `plans/2025-10-20_trimmed-demo.plan.md` using the discovery doc, with explicit repo cloning steps, deletion list, documentation changes, tests, and rollback guidance.

## 2025-10-20 – Planner: Phase 8 Trimmed Demo Plan
- Authored `plans/2025-10-20_trimmed-demo.plan.md` covering production repo setup, navigation cleanup, demo component removal, doc updates, validation, rollback, and handoff steps.
- Updated `PROGRESS.md` to mark the plan active (Unstarted) and flipped the discovery checklist in `docs/Tasks/phase-8-trimmed-demo-discovery.md` to reference the plan.
- Plan highlights: mirror repo to `employee-management-production`, strip non-Employees tabs from `src/App.tsx`, `git rm` demo modules, refresh strategy docs, run `npm run build` + Playwright slice, and capture the dedicated Vercel URL.
- Pending execution: executor to follow the plan, deploy the trimmed build, update both repos’ handoff logs with deployment info, and queue modal shadow regression after trim work completes.

## 2025-10-21 – Executor: Phase 9 Charts Wiring
- Implemented Chart.js integration across `LineChart`, `BarChart`, `DoughnutChart`, `KpiCardGrid`, and `ReportTable` with shared registration (`src/utils/charts/register.ts`) and RU-localised tooltips, clamps, targets, and accessibility summaries.
- Finalised adapters/formatters in `src/utils/charts/{adapters,format}.ts`, added Vitest coverage in `tests/unit/charts/`, and expanded Storybook with baseline/targets/toggles/empty stories under `src/components/charts/__stories__/`.
- Validation: `npm run typecheck` ✅, `npm run test:unit` ✅ (*Radix hidden-title & RHF act warnings remain expected*), `npm run build` ✅, `npm run storybook:build` ✅ (*storybook eval warning is upstream*).
- Documentation: updated `PROGRESS.md` and noted completion in `docs/Tasks/phase-9-charts-wiring-executor.md`.
- Commits: `ef067cf` (Phase 9: wire chart components), `807400f` (registrar + Storybook controls).
 - Known Unknowns: финальные HEX-палитры, канонический dash-паттерн, русские подписи осей/легенды из живой UI.
 - Next: UAT agent to capture live visuals per `docs/Tasks/phase-9-charts-ui-visual-spec.md`, and planner to map doc/contract gaps before analytics dashboard integration.

## 2025-10-12 – Scout: Scheduling Behavior Parity – Draft Plan
- Authored draft plan for Planner: `plans/2025-10-12_scheduling-behavior-parity.plan.md` (behavior-only; visuals frozen).
- Discovery + Data Flow updated in `docs/Tasks/phase-9-scheduling-behavior-parity.md` with file:line refs and a real mock series JSON example.
- Next: Planner to finalize the plan (edit points specified with file:line references) and hand to Executor. No code changes performed.

## 2025-10-12 – Planner: Scheduling Behavior Parity – Final Plan
- Finalized plan: `plans/2025-10-12_scheduling-behavior-parity.plan.md` (Status: Final — Ready to Execute).
- Scope: behavior only; visuals frozen (no color/dash/legend/axis changes).
- What to implement (scheduling repo `${SCHEDULE_REPO}`):
  - Adapters: `toPeriodSeries`, `deriveHeadcountSeries`, `deriveFteHoursSeries` in `src/utils/charts/adapters.ts`.
  - Overlay wiring: Day/Period toggle + Σ/123 in `src/components/ChartOverlay.tsx`.
  - Forecast chart: accept `timeUnit`/`overlaySeries`, pass `timeScale` in `src/components/ForecastChart.tsx`.
  - Container: compute overlays + mount `KpiCardGrid` in `src/components/ScheduleGridContainer.tsx`.
  - Tests: add adapter tests in `tests/unit/charts/adapters.spec.ts`.
- Validation: `npm run build`, `npm run test:unit`, optional `npm run storybook:build`; ensure RU ticks/tooltips intact.
- Rollback: revert only touched files or the single execution commit (see plan for paths).
- Optional: deploy to Vercel and paste the URL into the scheduling repo `docs/CH5_chart_mapping.md` and this file.

## 2025-10-12 – Docs/Coordinator: Manager Portal (Demo) – Evidence & UAT Blocks
- Demo path validated: `${MANAGER_PORTAL_REPO}`.
- CH references consulted: `docs/Reference/CH5.md`; Appendix 1: `${MANUALS_ROOT}/wfm/main/deliverables/frame-002/module-employee-management/final_package/ru/wfm_appendix_1.md`.
- Updated with file:line evidence for Manager Portal:
  - `docs/System/DEMO_PARITY_INDEX.md` — engine/labels/coverage
  - `docs/Reports/PARITY_MVP_CHECKLISTS.md` — slots with Present/Absent and citations (canonical checklist)
  - `docs/System/WRAPPER_ADOPTION_MATRIX.md` — slots → wrappers + props + CH refs
  - `docs/System/CHART_COVERAGE_BY_DEMO.md` — chart presence with citations
  - `docs/System/APPENDIX1_SCOPE_CROSSWALK.md` — Appendix 1 mapping for this demo
  - `docs/Tasks/uat-packs/parity_static.md` — demo-specific parity matrix
  - `docs/Tasks/uat-packs/trimmed_smoke.md` — targeted live smoke for this demo
  - `docs/Tasks/uat-packs/chart_visual_spec.md` — visuals to measure (bar/pie)
  - `docs/SOP/demo-refactor-playbook.md` — appended Manager Portal section
  - `docs/Tasks/screenshot-checklist.md` — exact captures list
- Notes: UI labels in this demo are EN; RU appears only in data names. Charts implemented via Recharts (Dashboard). Approvals implements single-item review dialog; no bulk-edit.

## 2025-10-12 – Docs/Coordinator: Analytics Dashboard (Demo) – Evidence & UAT Blocks
- Demo path validated: `${ANALYTICS_REPO}`.
- Engine: Chart.js via CDN in static HTML (index.html:10; advanced-charts.html:10); inline React components (index.html:46).
- Updated with file:line evidence for Analytics Dashboard:
  - `docs/System/DEMO_PARITY_INDEX.md` — engine/labels/CH coverage (EN UI noted with citations)
  - `docs/Reports/PARITY_MVP_CHECKLISTS.md` — KPI Overview + Advanced Charts with Present and citations
  - `docs/System/WRAPPER_ADOPTION_MATRIX.md` — slots → wrappers + props + CH refs + file:line
  - `docs/System/CHART_COVERAGE_BY_DEMO.md` — trend/table presence with citations
  - `docs/System/APPENDIX1_SCOPE_CROSSWALK.md` — Appendix 1 mapping (Employees flows marked Absent with evidence)
  - `docs/Tasks/uat-packs/parity_static.md` — demo-specific parity matrix
  - `docs/Tasks/uat-packs/trimmed_smoke.md` — live smoke targets for KPI Overview + Advanced
  - `docs/Tasks/uat-packs/chart_visual_spec.md` — visuals to measure (line/gauges/heatmap/radar)
  - `docs/SOP/demo-refactor-playbook.md` — appended Analytics Dashboard section
  - `docs/Tasks/screenshot-checklist.md` — exact captures list
- Notes: All labels are EN; RU locales/formatters not wired; propose wrapper extraction and RU registrar in refactor notes.
-
## 2025-10-12 – Docs/Coordinator: WFM Employee Portal (Demo) – Evidence & UAT Blocks
- Demo path validated: `${EMPLOYEE_PORTAL_REPO}`.
- Focus: forms/tables/requests; no charts.
- Updated with file:line evidence for Employee Portal:
  - `docs/System/DEMO_PARITY_INDEX.md` — engine/labels/CH coverage (RU UI cited)
  - `docs/Reports/PARITY_MVP_CHECKLISTS.md` — Dashboard, Vacation Requests, Profile with Present and citations
  - `docs/System/WRAPPER_ADOPTION_MATRIX.md` — ReportTable/Dialog/FormField/FilterGroup mapping with CH refs
  - `docs/System/CHART_COVERAGE_BY_DEMO.md` — charts N/A; tables/forms cited
  - `docs/System/APPENDIX1_SCOPE_CROSSWALK.md` — relevant Appendix 1 items marked Present/Partial with evidence
  - `docs/Tasks/uat-packs/parity_static.md` — demo-specific parity matrix
  - `docs/Tasks/uat-packs/trimmed_smoke.md` — live smoke targets for Dashboard/Requests/Profile
  - `docs/Tasks/uat-packs/chart_visual_spec.md` — note: no charts
  - `docs/SOP/demo-refactor-playbook.md` — appended Employee Portal section
  - `docs/Tasks/screenshot-checklist.md` — captures list
- Risks/Unknowns: validation rules/masks, error copy, RU formats consistency across browsers.

### WFM Employee Portal – Docs pass (Drafts staging)
- Created staging drafts under `docs/Workspace/Coordinator/employee-portal/Drafts/` for review before merging into canonical:
  - `RU_LABELS.md`
  - `APPENDIX1_SCOPE_CROSSWALK.md`
  - `DEMO_PARITY_INDEX.md`
  - `PARITY_MVP_CHECKLISTS.md`
  - `WRAPPER_ADOPTION_MATRIX.md`
  - `CHART_COVERAGE_BY_DEMO.md`
  - `UAT_chart_visual_spec.md`
  - `screenshot-checklist.md`
  These mirror canonical updates with file:line evidence and CH/Appendix refs.

## 2025-10-20 – Docs/Coordinator Multi-Demo Wrap
- Canonical docs now capture Manager Portal and Analytics Dashboard parity facts (see `docs/System/*` and `docs/Reports/PARITY_MVP_CHECKLISTS.md`). WFM Employee Portal Drafts staged under `docs/Workspace/Coordinator/employee-portal/Drafts/` awaiting merge.

## 2025-10-26 – Executor: Analytics Dashboard UAT Close (`analytics-dashboard-exec-2025-10-26-codex`)
- UAT: `parity_static.md`, `chart_visual_spec.md` — Pass (no console errors). Results logged in `docs/Workspace/Coordinator/analytics-dashboard/UAT_Findings_2025-10-13_template.md:11` via consolidated sweep.
- Docs updated: `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`, `docs/Tasks/post-phase9-demo-execution.md`.
- Tracker/Progress: Analytics row marked Completed – UAT Pass; `PROGRESS.md` Current State updated; no redeploy (prod build `https://analytics-dashboard-demo-d60586nei-granins-projects.vercel.app`).
- UAT packs (`docs/Tasks/uat-packs/*.md`), refactor playbook (`docs/SOP/demo-refactor-playbook.md`), and screenshot checklist (`docs/Tasks/screenshot-checklist.md`) updated with demo-specific sections.
- Docs Coordinator workflow codified in `docs/SOP/docs-coordinator-workflow.md`; system overview and workspace instructions in `docs/System/docs-coordinator-overview.md` and `docs/Workspace/README.md`.
- Execution decisions recorded in `docs/System/DEMO_EXECUTION_DECISION.md`: Manager & Analytics = Refactor-first; WFM Employee Portal = Parity-first.

## 2025-10-26 – Scout: Analytics Dashboard Forecasting Parity (`analytics-dashboard-scout-2025-10-26-codex`)
- Sources: PROGRESS.md, `/Users/m/Desktop/e.tex`, `${ANALYTICS_REPO}/src/*`.
- Findings captured in `docs/Tasks/analytics-dashboard_parity-scout-2025-10-26-codex.task.md`: no forecast build workflow, no trend adjustments/saving, absenteeism analytics absent, no reports/export, missing organisation selector.
- Next: Planner to scope forecast build MVP, trend adjustment UX, absenteeism panel, reporting slice, and shared org context.
- Next orchestrator steps:
  1. Review and merge Employee Portal Drafts into canonical docs (reports, UAT packs, playbook, screenshot checklist).
  2. Update `PROGRESS.md` to mark the Docs/Coordinator pass complete.
  3. Queue execution plans per decision record (manager-portal refactor, analytics extraction, portal parity wiring).
- Parallel docs agents should use staging folders (`docs/Workspace/Coordinator/<demo>/Drafts/`) and Templates (`docs/Workspace/Templates/*`), citing path:line + CH § for every entry. Summaries belong in `docs/SESSION_HANDOFF.md` after each pass.

## 2025-10-27 – Planner: Analytics Dashboard Forecasting Parity (`analytics-dashboard-planner-2025-10-27-codex`)
- Plan: `plans/2025-10-27_analytics-forecasting-parity.plan.md` (forecast build flow, trend adjustment toolbar, absenteeism analytics, reports export stub, organisation selector).
- Key refs: `${ANALYTICS_REPO}/src/data/mock.ts`, `src/services/forecasting.ts`, `src/features/forecasting/ForecastBuilder.tsx`, `src/components/charts/LineChart.tsx`, `src/features/analytics/AdvancedAnalytics.tsx`, `src/features/analytics/AbsenteeismPanel.tsx`, `src/features/reports/ReportsPanel.tsx`, `src/state/organization.ts`, `e2e/analytics.spec.ts`.
- Next Owner: Analytics executor — follow plan phases, run `npm run ci`, redeploy `https://analytics-dashboard-demo-d60586nei-granins-projects.vercel.app`, update coordinator/system docs, refresh `parity_static.md` + `chart_visual_spec.md` with new checkpoints, capture forecast/report screenshots.

## 2025-10-23 – Executor: Manager Portal Wrapper Refactor (Phase A)
- Repo: `${MANAGER_PORTAL_REPO}` (feature/analytics-wrapper-refactor)
- Deliverables:
  - Replaced Recharts usage with shared wrappers on Dashboard (`BarChart`, `DoughnutChart`, `KpiCardGrid`, `ReportTable`) and Approvals (`ReportTable`, modal `Dialog`).
  - Added adapters + RU formatter wiring (`src/adapters/dashboard.ts`, `src/adapters/approvals.ts`, `src/utils/charts/format.ts`) with Vitest coverage and jsdom config (`vitest.config.ts`).
  - Cleaned Tailwind base utility (`src/index.css`) so `npm run build` succeeds.
  - Tests/build: `npm test -- --run` ✅, `npm run build` ✅ (2025-10-23).
- Deploy:
  - https://manager-portal-demo-46qb9mity-granins-projects.vercel.app (Vercel prod; guarded by Vercel SSO, authenticate before UAT).
- Outstanding:
  - Execute UAT packs (`parity_static`, `trimmed_smoke`, `chart_visual_spec`) against the new deployment and capture evidence/screenshots.
- Handoff Docs: updated `PROGRESS.md`, `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/Tasks/post-phase9-demo-execution.md`.
- Learning Log: Added four Manager Portal learnings in `docs/System/learning-log.md` (formatting, approvals gating, manual crosswalk, deploy status).

## 2025-10-23 – Coordinator: Demo Code Maps & Playwright Artifacts
- Code Maps published for all demos:
  - Manager Portal – `docs/Workspace/Coordinator/manager-portal/CodeMap.md`
  - Analytics Dashboard – `docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md`
  - WFM Employee Portal – `docs/Workspace/Coordinator/employee-portal/CodeMap.md`
- Learning Log: appended analytics (dual-axis/heatmap/live status) and employee portal (Tailwind rollback, SPA rewrite, dialog warnings) entries in `docs/System/learning-log.md`.
- Wrapper matrix gaps refreshed (`docs/System/WRAPPER_ADOPTION_MATRIX.md`) for secondary-axis line charts, DoughnutGauge targets, and employee portal attachments.
- Playwright artifact aliases recorded in `docs/SCREENSHOT_INDEX.md` for each demo (`manager-dashboard-playwright.png`, `playwright-manager-approvals.png`, `playwright-analytics-kpi-trend.png`, `portal-requests-playwright.png`, `playwright-employee-request.png`).
- UAT one-liner to send post-deploy: “UAT: run behavior checks on <URL> using docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md, chart_visual_spec.md}; paste Pass/Fail into the demo repo mapping and summarize in docs/SESSION_HANDOFF.md.”

## 2025-10-24 – Coordinator: Code Map refresh + UAT prep (Plan `plans/2025-10-12_manager-portal-refactor.plan.md`)
- Docs: refreshed code maps (`docs/Workspace/Coordinator/{manager-portal,analytics-dashboard,employee-portal}/CodeMap.md`) with deploy URLs, file:line evidence, UAT links, and gap proposals; expanded screenshot index (`docs/SCREENSHOT_INDEX.md:21-41`) with manager teams modal + portal profile aliases; logged Teams modal wrapper gap in `docs/System/WRAPPER_ADOPTION_MATRIX.md:23`; updated learning log evidence (`docs/System/learning-log.md:51-58`) and PROGRESS multi-demo summary (`PROGRESS.md:16`).
- Validation: documentation-only sweep (no builds/tests executed).
- Next: Manager Portal executor to run `parity_static`, `trimmed_smoke`, `chart_visual_spec` UAT on https://manager-portal-demo-46qb9mity-granins-projects.vercel.app and attach captures for the new aliases.

- Code: extracted CDN HTML into Vite/React project with shared wrappers (`${ANALYTICS_REPO}/src/components/charts/*`), Russian copy, RU форматтеры, dual-axis trend analysis, Storybook stories (`src/stories/AnalyticsDashboard.stories.tsx`), Playwright coverage (`e2e/analytics.spec.ts` + `e2e/artifacts/trend-analysis.png`), plus updated README/DEMO_SUMMARY/start-demo script.
- Validation: `npm run ci` (typecheck → Vitest → Vite build → Storybook build → Playwright) ✅; UAT packs `parity_static` & `chart_visual_spec` refreshed with results (оси/цвета подтверждены).
- Deploy: https://analytics-dashboard-demo-d60586nei-granins-projects.vercel.app (Vercel prod).
- Docs: refreshed System + Reports checklist entries, adoption matrix, chart coverage, Appendix crosswalk, screenshot checklist, Post-phase9 tracker (Phase B complete). Added GitHub Actions CI (`${ANALYTICS_REPO}/.github/workflows/ci.yml`). Captured learnings in `docs/System/learning-log.md:1-40` (legend pattern, CI gate, manual crosswalk).
- Next: добавить снимки из Playwright в parity docs и мониторить цветовые токены при подключении реальных данных.

## 2025-10-24 – Executor: WFM Employee Portal Parity Wiring (Plan `plans/2025-10-12_employee-portal-parity.plan.md`)
- Code: introduced shared wrappers + RU helpers (see `${EMPLOYEE_PORTAL_REPO}/src/wrappers/shared/tokens.ts:1`, `${EMPLOYEE_PORTAL_REPO}/src/wrappers/ui/Dialog.tsx:1`, `${EMPLOYEE_PORTAL_REPO}/src/wrappers/form/FormField.tsx:1`, `${EMPLOYEE_PORTAL_REPO}/src/wrappers/form/FilterGroup.tsx:1`, `${EMPLOYEE_PORTAL_REPO}/src/wrappers/data/ReportTable.tsx:1`, `${EMPLOYEE_PORTAL_REPO}/src/utils/format.ts:1`). Rewired Vacation Requests to use wrappers/validation (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:135`) and Profile save/cancel flows (`${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:146`). Dashboard stats now use RU number formatter (`${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:1`). Added wrapper stories + Vitest coverage (`${EMPLOYEE_PORTAL_REPO}/src/wrappers/stories/*.tsx`, `${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx:1`, `${EMPLOYEE_PORTAL_REPO}/src/__tests__/Profile.test.tsx:1`).
- Validation: `npm run build` ✅; `npm run test -- --run` ✅ (Radix `act` warnings expected when dialogs mount/unmount). No deploy/UAT yet per plan; follow-up needed.
- Docs: updated adoption + parity references (`docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/DEMO_PARITY_INDEX.md`, `docs/Tasks/post-phase9-demo-execution.md`).
- Next: execute UAT packs (`parity_static`, `trimmed_smoke`), capture screenshots, deploy via `vercel --prod`, and log URL/tests in `PROGRESS.md` + this log. Consider silencing Radix `act` warnings (wrap dialog open/close in helpers) in future test pass.

### 2025-10-24 – Executor: Portal Styling Regression & Vercel Fallback Fix
- Fixes: Downgraded Tailwind to v3 (`package.json`, `postcss.config.js`) after observing v4 trimmed utilities; updated `vercel.json` rewrite (filesystem handler + SPA catch-all) to avoid hashed asset 404s. Redeployed → https://wfm-employee-portal-41lu0zs7a-granins-projects.vercel.app (alias: https://wfm-employee-portal.vercel.app) now returns full CSS (verify `/assets/index-B_RS7Myl.css`).
- Validation: `npm run build` ✅; `npm run test -- --run` ✅ (Radix act warnings expected).
- Learning log: docs/System/learning-log.md updated with Tailwind lock, SPA fallback note, Radix warning reminder. Wrapper matrix entry annotated with Tailwind version requirement.
- Next: proceed with UAT packs on this deploy.

### 2025-10-24 – Docs Coordinator: Code Maps & Learning Roll-up
- Added per-demo Code Maps capturing file:line evidence, wrapper usage, adapters, and UAT references:
  - Manager Portal – docs/Workspace/Coordinator/manager-portal/CodeMap.md
  - Analytics Dashboard – docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md
  - WFM Employee Portal – docs/Workspace/Coordinator/employee-portal/CodeMap.md
- Expanded learning log with demo-specific learnings (Tailwind lock, adapters, dual-axis requirements) → docs/System/learning-log.md.
- Updated wrapper adoption matrix for secondary axis + Tailwind note; refreshed screenshot index with Playwright artifacts (`manager-dashboard-playwright.png`, `analytics-trend-playwright.png`, `analytics-kpi-grid-playwright.png`, `portal-requests-playwright.png`).
- UAT prompt reminder: “UAT: run behavior checks on <URL> using docs/Tasks/uat-packs/{parity_static.md, trimmed_smoke.md, chart_visual_spec.md}; paste Pass/Fail into the demo repo mapping and summarise in docs/SESSION_HANDOFF.md.”

## 2025-10-25 – Executor: Forecasting & Analytics wrappers audit (Plan `plans/2025-10-24_forecasting-analytics-refactor.plan.md`)
- Role prep: Read PROGRESS → CE SIMPLE + EXECUTE prompts → plan-execution SOP → plan inputs (System reports, WRAPPER_ADOPTION_MATRIX.md, CHART_COVERAGE_BY_DEMO.md, wiki API notes) and inspected `${FORECASTING_ANALYTICS_REPO}` Accuracy/Trend/Manual Adjustment components plus `utils/accuracyCalculations.ts` / `types/{accuracy,trends}.ts`.
- Code: Copied shared chart wrapper + format/register scaffolding into `${FORECASTING_ANALYTICS_REPO}/src/components/charts/*` and `src/utils/charts/*` for adapter migration, but stopped before wiring components. No adapters/stories/tests added; existing components still reference bespoke Chart.js usage.
- Status: Blocked – migration scope (wrappers + adapters + component rewrites + stories/tests + UAT) exceeds current session. Need dedicated execution window to replace `react-chartjs-2` wiring, stand up adapter layer, add Vitest/Storybook, and update parity docs/UAT evidence.
- Next agent: Either continue wrapper/adapters implementation inside `${FORECASTING_ANALYTICS_REPO}` or revert scaffolding if a different approach is preferred. Plan steps 2–6 remain untouched; no validations run.

## 2025-10-25 – Executor: Forecasting & Analytics wrappers migration (Plan `plans/2025-10-24_forecasting-analytics-refactor.plan.md`)
- Code: Replaced bespoke Chart.js usage with shared wrappers + adapters — KPI grid (`accuracy/AccuracyMetrics.tsx:3`), performance trend (`accuracy/PerformanceChart.tsx:3`), error analysis (`accuracy/ErrorAnalysis.tsx:9`), comparison/validation tables (`ModelComparison.tsx:6`, `ModelValidation.tsx:7`), trend dashboard (`trends/TrendAnalysisDashboard.tsx:1`) and manual adjustments (`ManualAdjustmentSystem.tsx:1`). Added forecasting adapters under `src/adapters/forecasting/{accuracy,trends,adjustments}.ts`, shared chart primitives in `src/components/charts/*`, RU registrar/format utils in `src/utils/charts/*`, Story showcase `src/stories/ForecastingWrappers.stories.tsx`, and Vitest coverage (`tests/forecasting/*.test.ts`).
- Validation: `npm run test:run` ✅, `npm run build` ✅ (forecasting repo). No deploy yet — wrappers verified locally only.
- Docs: Updated Code Map, wrapper adoption matrix, chart coverage table, parity checklist, UAT packs, learning log, post-phase tracker. `docs/System/learning-log.md` now notes adapter + report table patterns.
- Deploy: https://forecasting-analytics-cv3t45r52-granins-projects.vercel.app (Vercel prod, 2025-10-25).
- Outstanding: Run `parity_static` + `chart_visual_spec` against new deploy (capture screenshots/notes); connect manual adjustments to real backend validation (service scaffolding lives in `src/services/forecastingApi.ts`).

## 2025-10-27 – Executor: Forecasting & Analytics routing fix (Plan `plans/2025-10-27_forecasting-analytics-routing-fix.plan.md`)
- Code: Added BrowserRouter shell + explicit routes (`src/main.tsx:1-12`, `src/App.tsx:7-196`, `vercel.json`), safe defaults + queue selectors (`components/forecasting/trends/TrendAnalysisDashboard.tsx:1-240`), adapter guards (`src/adapters/forecasting/trends.ts:1-140`, `src/types/trends.ts:1-90`), chart resilience updates (`components/charts/LineChart.tsx:1-320`, `BarChart.tsx:1-260`), and Playwright smoke `scripts/smoke-routes.mjs`.
- Validation: `npm run test:run` ✅, `npm run build` ✅, `npm run smoke:routes` ✅ (local preview + SMOKE_BASE_URL=prod).
- Deploy: https://forecasting-analytics-4pfj6jygr-granins-projects.vercel.app (Vercel prod, 2025-10-27).
- Docs: Updated `uat-agent-tasks/2025-10-26_forecasting-uat.md`, `docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md`, `docs/System/{DEMO_PARITY_INDEX.md,WRAPPER_ADOPTION_MATRIX.md,PARITY_MVP_CHECKLISTS.md,CHART_COVERAGE_BY_DEMO.md,learning-log.md}`, `docs/Tasks/post-phase9-demo-execution.md`, `docs/SCREENSHOT_INDEX.md`, `PROGRESS.md`.
- Outstanding: Hook manual adjustments to live API responses and finalize color palette alignment for seasonality bars; keep smoke script in release checklist.

## 2025-10-27 – Scout: Forecasting & Analytics parity gaps (Task `docs/Tasks/forecasting-analytics_parity-scout-2025-10-27-codex.task.md`)
- Scope: Reconciled Chapter 4 manual workflows (Build Forecast, Exceptions, Absenteeism, Trend Analysis) with current demo implementation; logged missing routes, mock data usage, and organisational context gaps.
- Evidence: `CH4_Forecasts.md:5-198`, `src/App.tsx:20-170`, `src/components/forecasting/AccuracyDashboard.tsx:70-199`, `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:20-218`, `src/services/forecastingApi.ts:26-111`.
- Artifacts: Task file above, manual crosswalk (`uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`), port registry update confirming 4155.
- Next role: Planner to define how to surface Build Forecast/Exceptions/Absenteeism flows, replace RNG datasets with deterministic fixtures/API contracts, and expand UAT documentation per the discovery suggestions.

## 2025-10-27 – Executor: Analytics Forecast Parity (Plan `plans/2025-10-27_analytics-forecasting-parity.plan.md`)
- Code: Added deterministic forecasting/absenteeism mocks + services (`${ANALYTICS_REPO}/src/data/mock.ts`, `${ANALYTICS_REPO}/src/services/forecasting.ts`), Forecast Builder module (`src/features/forecasting/ForecastBuilder.tsx`), Absenteeism panel (`src/features/analytics/AbsenteeismPanel.tsx`), Reports hub + CSV helper (`src/features/reports/ReportsPanel.tsx`, `src/utils/export.ts`), organisation context + module nav (`src/App.tsx`, `src/state/organization.ts`), and upgraded `LineChart` to support confidence bands + toolbars (`src/components/charts/LineChart.tsx`) with new styles (`src/styles/index.css`). Storybook slice + unit suite extended; Playwright now captures forecast/report artifacts (`e2e/analytics.spec.ts`).
- Validation: `npm_config_workspaces=false npm run ci` (typecheck → vitest → vite build → storybook build → Playwright) ✅; `timeout 15 npm run dev -- --host 127.0.0.1 --port 4160` compiled on 4161 for smoke.
- Deploy: `vercel deploy --prod --yes` → https://analytics-dashboard-demo-3lsuzfi0w-granins-projects.vercel.app.
- UAT: Re-ran `parity_static.md` + `chart_visual_spec.md`; AD-1 legend regression plus new AD-2/AD-3/AD-4 checks logged Pass with Playwright artifacts (`trend-analysis.png`, `forecast-build.png`, `reports-card.png`).
- Docs: Updated Code Map, Findings file, parity_static + chart_visual_spec packs, screenshot checklist, learning log (forecast mocks/confidence band/reports hub/absenteeism service), System reports (DEMO_PARITY_INDEX, PARITY_MVP_CHECKLISTS, WRAPPER_ADOPTION_MATRIX, CHART_COVERAGE_BY_DEMO, APPENDIX1_SCOPE_CROSSWALK), consolidated UAT sweep (2025-10-27 section), PROGRESS, and this handoff.
- Next: Capture absenteeism screenshot alias, document new `confidenceBand`/`toolbar` props in charts README, and monitor CSV stub once real export API ships.

## 2025-10-13 – Coordinator Checkpoint (Manager/Analytics/Portal/Forecasting)
- Assignments: updated all Executor subtasks with Agent_Codex + live commits (`docs/Workspace/Coordinator/*/Subtask_*_2025-10-13.md`).
- Manager Portal: retained MP-1 fail (coverage/adherence toggle) in `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:11`; CodeMap gap tagged for MP-1.
- Analytics Dashboard: AD-1 dual-axis legend confirmed Pass with screenshot alias recorded in `docs/Workspace/Coordinator/analytics-dashboard/UAT_Findings_2025-10-13_template.md:11`.
- Employee Portal: EP-1 filters/sorting logged as Pass in `docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md:11`.
- Forecasting: captured FA-1 confidence-band Fail + FA-2 undo/redo Pass, refreshed CodeMap references in `docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md:1`.
- Tracker: docs/Tasks/post-phase9-demo-execution.md Agent Assignments updated with current statuses.
- Analytics follow-up: tightened Playwright coverage so dual-axis legend items assert `data-axis` alignment (see `${ANALYTICS_REPO}/e2e/analytics.spec.ts:21-47`); reran `npm run test:e2e` + `npm run build` in `${ANALYTICS_REPO}` ✅.
## 2025-10-26 – Executor: WFM Employee Portal UAT loop (Plan `plans/2025-10-12_employee-portal-parity.plan.md`)
- UAT: Ran `parity_static.md` + `trimmed_smoke.md` against https://wfm-employee-portal.vercel.app using Playwright headless run (see `test-results/portal-uat-results-2025-10-13.json`). Filters/sorting checks passed; submitting “Новая заявка” produced two identical pending rows (All count 5→7). Captured evidence `test-results/portal-requests-duplicate.png`.
- Status: **Fail** (EP-1). Duplicates traced to submit pipeline in `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:223-244` (likely double append from state helper). Profile edit save verified (phone update persisted) – no regression.
- Docs: Updated UAT findings (`docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md`), CodeMap, DEMO parity index, wrapper matrix, chart coverage, Appendix 1 crosswalk, canonical checklist, screenshot index, tracker row, and learning log.
- Next: Fix duplicate append (one source of truth for `submitVacationRequest`), add unit coverage in `${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx`, redeploy, rerun packs, and update doc set once pass confirmed.

## 2025-10-26 – Executor: WFM Employee Portal EP-1 fix + UAT pass
- Code: Adjusted fallback data helpers to clone arrays (`${EMPLOYEE_PORTAL_REPO}/src/data/mockData.ts:176-211`) and filtered state prepend by ID (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:236-241`). Added Vitest regression (`${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx:74-108`).
- Validation: `npm test -- --run` ✅ (Radix act warnings expected), `npm run build` ✅. Deployed via `npx vercel --prod --yes` → https://wfm-employee-portal-abgsfygld-granins-projects.vercel.app (alias https://wfm-employee-portal.vercel.app).
- UAT: Playwright parity harness re-run (`test-results/portal-uat-results-2025-10-26.json`) showed All count 5→6 and `duplicateCount = 1` (single row). Screenshot `test-results/portal-requests-after-fix.png` captured single entry.
- Docs: Updated UAT findings, CodeMap, System reports, canonical checklist, parity index, Appendix 1, wrapper matrix, CHART_COVERAGE, PROGRESS, SESSION handoff, tracker row, and screenshot index. Old failure evidence retained as archive.
- Next: Keep remote UAT script handy for future passes; monitor new submissions after real API integration.

- Code: Added package entry point `src/Root.tsx:1` exporting `Root` + re-exporting `setupRU`, isolated registrar under `src/setup/setupRU.ts:1`, and updated bootstrap `src/main.tsx:1-10` to use the new entry. Storybook now imports `setupRU()` in `.storybook/preview.ts:1-8`, and chart components drop their internal `registerCharts()` calls so the shell owns registrar init. Updated `src/wrappers/__tests__/LineChart.integration.test.tsx:1-15` to import charts via relative path for stability.
- Docs: Authored mount guide `docs/Workspace/Coordinator/unified-demo/employee-management-mount.md`, refreshed coordinator CodeMap (`docs/Workspace/Coordinator/unified-demo/CodeMap.md`) and subtask tracker (`docs/Workspace/Coordinator/unified-demo/Subtask_Employees_Prep_Agent_TBD_2025-10-13.md`), and marked the assignment complete in `docs/Tasks/post-phase9-demo-execution.md`.
- Validation: `npm run build` ✅; `npm run test:unit -- --run` ✅ (Radix dialog and RHF act warnings expected). Refreshed dependencies with `npm install` after recreating `node_modules` (previous contents preserved as `node_modules.bak`).
- Next: Integrator should mount this package under the unified shell and call `setupRU()` once at bootstrap. Remove `node_modules.bak` when safe to reclaim space.
## 2025-10-26 – Executor: Manager Portal MP-1 coverage/adherence toggle (Plan `plans/2025-10-12_manager-portal-refactor.plan.md`)
- Code: added `COVERAGE_VIEW_TOGGLE` + dual-series metadata (`${MANAGER_PORTAL_REPO}/src/adapters/dashboard.ts:49-75`), wired `BarChart` viewToggle UI (`${MANAGER_PORTAL_REPO}/src/components/charts/BarChart.tsx:27-158`) and updated dashboard wiring/mock data for adherence (`${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:43-53`, `${MANAGER_PORTAL_REPO}/src/data/mockData.ts:30-210`).
- Validation: `npm run test -- --run --test-timeout=2000` ✅; `npm run build` ✅.
- Docs: refreshed Code Map + UAT Findings (manager portal), WRAPPER_ADOPTION_MATRIX, parity checklists (System/Reports), CHART_COVERAGE_BY_DEMO, learning-log entries, manual crosswalk, screenshot index, tracker table (`docs/Tasks/post-phase9-demo-execution.md`).
- Next: trimmed_smoke pack unchanged (behaviour-only); maintain coverage/adherence screenshots in next prod deploy + confirm RU labels once live data hooks in.

## 2025-10-26 – Coordinator: Manager Portal UAT transcription (Plan `plans/2025-10-12_manager-portal-refactor.plan.md`)
- UAT: Logged consolidated sweep Pass for MP-1 (uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md:5) into `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md:12` and noted pass in CodeMap meta.
- Docs: Synced `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`, and tracker row (`docs/Tasks/post-phase9-demo-execution.md:65`). Updated PROGRESS Test Log and Current State to record the UAT pass.
- Next: Capture trimmed_smoke screenshots on the next deploy and continue monitoring RU label parity once live data replaces mocks.

## 2025-10-26 – Executor: Manager Portal RU localisation sweep (Plan `plans/2025-10-12_manager-portal-refactor.plan.md`)
- Deploy: https://manager-portal-demo-46qb9mity-granins-projects.vercel.app (Vercel prod, RU локализация).
- Code: Translated all UI copy in `${MANAGER_PORTAL_REPO}` (Dashboard/Approvals/Teams, layout nav, mock data) to Russian; updated adapters for KPI/legend labels and ensured coverage categories use Russian team names.
- Validation: `npm run build` ✅ (`npm_config_workspaces=false`); no additional warnings.
- Docs: Marked `Localization_Backlog.md` as completed, set MP‑L10n finding to Pass, refreshed CodeMap gaps, and synced parity reports (`docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`). `PROGRESS.md` updated with localisation note + build log.
- Next: On the next UAT pass rerun parity_static + trimmed_smoke to capture Russian screenshots and confirm no behavioural regressions.

## 2025-10-26 – Scout: Manager Portal parity gaps (Task `docs/Tasks/manager-portal_parity-scout-2025-10-26-codex.task.md`)
- Agent: manager-portal-scout-2025-10-26-codex.
- Inputs: `/Users/m/Desktop/e.tex` UAT deep-dive, `docs/Archive/UAT/2025-10-13_real-vs-demo-comparison.md`, coordinator CodeMap/UAT findings.
- Findings: Navigation parity still missing (Прогнозы/Расписание/Сотрудники/Отчёты, org tree), approvals route lacks CH5 request categories & bulk actions, Teams view diverges from org structure, reports/export hooks absent, unified shell deploy 404 + missing tabs, mock data too narrow for shift-exchange flows. Evidence with file:line references captured in scout task.
- Handoff: Planner to scope behaviour-first work (nav/org tree, CH5 workflows, reporting exports, shell coordination, data schema updates). No code changes made during scouting.

## 2025-10-15 – Scout: Manager Portal parity remediation (Task `docs/Tasks/manager-portal_parity-remediation-2025-10-27-scout-2025-10-15-codex.task.md`)
- Agent: manager-portal-scout-2025-10-15-codex.
- Inputs: PROGRESS; CE scout prompts; `docs/Tasks/manager-portal_parity-remediation-2025-10-27.task.md`; latest UAT sweep (`docs/Archive/UAT/2025-10-27_manager-portal_parity-sweep.md`); coordinator CodeMap + findings; manuals CH2/CH3/CH5/CH6; desktop reports (`/Users/m/Desktop/{e.tex,f.tex,g.tex,h.md}`); wrapper references in `ai-docs/wrappers-draft`.
- Findings: Captured schedule placeholder gap, approvals workflow differences, missing CH6 reports, shell/notification divergence, and remaining localisation issues. Discovery lists code + manual references and mock/test requirements for planner.
- Docs updated: `docs/Tasks/manager-portal_parity-remediation-2025-10-27-scout-2025-10-15-codex.task.md`; `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md` rows MP‑SCH/REP/APR/NAV/L10n; `docs/Workspace/Coordinator/manager-portal/CodeMap.md` (added schedule section, data gaps, new Open Gaps).
- Next: Planner should follow task reading order (PROGRESS → CE planner prompts → SOP) then consume the new scout doc before drafting the remediation plan (navigation, schedule grid, approvals upgrades, report downloads, localisation, UAT pack updates).

## 2025-10-13 – Executor: Unified Demo Pilot shell (Plan `plans/2025-10-15_unified-demo-pilot.plan.md`)
- Code: Bootstrapped `${UNIFIED_DEMO_REPO}` workspace (`package.json:1`, `vercel.json:1`), wired registrar boot `apps/shell/src/main.tsx:1`, shell router/nav `apps/shell/src/App.tsx:1` + styles (`apps/shell/src/App.css:1`, `apps/shell/src/index.css:1`), and exposed package mounts/registrars (`packages/employee-management/src/index.ts:1`, `packages/employee-management/src/Root.tsx:1`, `packages/employee-management/package.json:1`, `packages/schedule/src/index.ts:1`, `packages/schedule/src/Root.tsx:1`, `packages/schedule/package.json:1`).
- Validation: `npm install` ✅, `npm run build` ✅ (Vite warned about a >500 kB chunk, no failures), `vercel deploy --prod --yes` ✅.
- Deploy (superseded by 2025-10-14 auth/nav pass): https://wfm-unified-demo-fid9jjqif-granins-projects.vercel.app (requires org SSO; unauthenticated requests return 401).
- Docs: Updated `docs/Workspace/Coordinator/unified-demo/CodeMap.md`, `docs/Workspace/Coordinator/unified-demo/Subtask_Integrator_Agent_TBD_2025-10-13.md`, and `docs/Tasks/post-phase9-demo-execution.md`; added `vercel.json` to repo.
- Next: Run manual smoke on `/employees` + `/schedule` (toolbar drawers, overlays) once authenticated; evaluate bundle-splitting or raise chunk threshold if warning persists.
- Discovery: Logged integration audit references in `docs/Tasks/unified-demo_integration-audit-scout-2025-10-13-codex.md` (AdminLayout/AdminNavigation patterns, auth guard, login scaffolding, iframe exclusion).

## 2025-10-26 – Docs sync: Employee Portal UAT transcription
- Updated consolidated sweep row to Pass and mirrored evidence in findings (`uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md:7`, `docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md:12-17`).
- Annotated Code Map meta with UAT pass + artifacts (`docs/Workspace/Coordinator/employee-portal/CodeMap.md:7`, `docs/Workspace/Coordinator/employee-portal/CodeMap.md:52`).
- Propagated EP-1 pass across system docs: parity index (`docs/System/DEMO_PARITY_INDEX.md:8`), MVP checklists (`docs/System/PARITY_MVP_CHECKLISTS.md:67`, `docs/Reports/PARITY_MVP_CHECKLISTS.md:67`), wrapper matrix (`docs/System/WRAPPER_ADOPTION_MATRIX.md:26`), chart coverage (`docs/System/CHART_COVERAGE_BY_DEMO.md:9`), Appendix 1 (`docs/System/APPENDIX1_SCOPE_CROSSWALK.md:56`).
- Tracker now shows Completed – UAT Pass for portal (`docs/Tasks/post-phase9-demo-execution.md:67`); no redeploy/tests run this pass.
- Next: Manager Portal executor to resume trimmed_smoke UAT per active plan; portal backlog focuses on attachments/validation enhancements.

- Follow-up: Tailwind build now centralized in `${UNIFIED_DEMO_REPO}/tailwind.config.cjs` and `${UNIFIED_DEMO_REPO}/postcss.config.cjs`; rebuild + redeploy to https://wfm-unified-demo-j8rim8chk-granins-projects.vercel.app after verifying globals render correctly.

## 2025-10-13 – Executor: Forecasting UAT prompt + external failure report
- Discovery: Added routing/runtime findings in `docs/Tasks/forecasting-analytics-routing-discovery.md`; planner should scope React Router + default props fix before re-running UAT.
- Agent ID: forecasting-analytics-exec-2025-10-13-codex
- Submitted prompt `uat-agent-tasks/10-13_22-40_UAT_PROMPT_forecasting.txt`; external agent confirms deploy reachable but:
  - `/trends` and `/adjustments` render blank screens (no charts/badges)
  - `/accuracy` returns 404 `NOT_FOUND`
- Result: `parity_static` + `chart_visual_spec` **Fail** (no behaviour validated). Evidence logged in `uat-agent-tasks/2025-10-26_forecasting-uat.md`.
- Next: investigate Vercel build/output (likely missing static routes) and redeploy before rerunning Step 6.
## 2025-11-01 – Planner: Manager Portal parity follow-up (Plan `plans/2025-11-01_manager-portal-parity-followup.plan.md`)
- Agent: manager-portal-plan-2025-11-01-codex.
- Inputs: PROGRESS.md; CE planner prompts (`SIMPLE-INSTRUCTIONS.md`, `PLAN-USING-MAGIC-PROMPT.md`); `docs/SOP/code-change-plan-sop.md`; follow-up scout brief `docs/Tasks/manager-portal_parity-followup-2025-10-31-scout-manager-portal-scout-2025-10-31-codex.task.md`; parity task `docs/Tasks/manager-portal_parity-followup-2025-10-31.task.md`; latest UAT report `docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md`; coordinator artefacts (`CodeMap.md`, `UAT_Findings_2025-10-13_template.md`, `Localization_Backlog.md`); manuals CH5_Schedule_Advanced.{md,pdf} & CH6_Reports.{md,pdf}.
- Output: Authored phased plan covering (1) queue-aware schedule request adapter/tests, (2) schedule tab UI with filters + detail dialog, (3) approvals status checkbox + history toggle updates, (4) download queue lifecycle/CTA wiring, (5) settings feature flag + RU copy, and (6) doc/UAT/report sync. Each phase includes explicit `apply_patch` blocks for `${MANAGER_PORTAL_REPO}/src/data/mockData.ts`, `src/adapters/scheduleRequests.ts`, `src/adapters/scheduleRequests.test.ts`, `src/pages/Schedule.tsx`, `src/components/schedule/ScheduleTabs.tsx`, `src/pages/Approvals.tsx`, `src/pages/__tests__/Approvals.test.tsx`, `src/state/downloadQueue.tsx`, `src/pages/Reports.tsx`, `src/components/Layout.tsx`, `src/config/features.ts`, and `src/pages/Settings.tsx`, plus coordinator/SOP updates.
- Next: Executor to follow the plan verbatim—extend mocks/adapters, ship schedule requests table, align approvals filters/history, upgrade download queue interactions, localise/gate Settings, update docs/UAT, run `npm run test -- --run --test-timeout=2000`, `npm run build`, preview smoke, deploy via `vercel deploy --prod --yes`, then refresh Manager Portal entries in parity checklists, CodeMap, UAT packs, SESSION_HANDOFF, and tracker.

## 2025-11-02 – Planner: Employee Portal parity remediation (History dialog scope)
- Agent: employee-portal-plan-2025-11-02-codex.
- Inputs: PROGRESS.md; `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`; `${CE_MAGIC_PROMPTS_DIR}/PLAN-USING-MAGIC-PROMPT.md`; `docs/SOP/code-change-plan-sop.md`; scout dossier `docs/Workspace/Coordinator/employee-portal/Scout_Parity_Remediation_2025-11-02.md`; UAT audit `docs/Archive/UAT/2025-11-02_employee-portal_live-parity-audit.md`; vision + CodeMap (`docs/Workspace/Coordinator/employee-portal/{Visio_Parity_Vision.md,CodeMap.md}`); manuals CH2/CH3/CH5/CH7 and screenshot pack `~/Desktop/employee-portal-manual-pack/images/`.
- Output: Authored plan `plans/2025-11-02_employee-portal-parity-remediation.plan.md` detailing history aggregation helpers, dual-mode dialog, RU placeholders, Vitest updates, and documentation/UAT sync requirements.
- Validation for executor: `npm_config_workspaces=false npm run build`; `npm_config_workspaces=false npm run test -- --run`; manual smoke via `npm run dev -- --port 4180`; deploy with `vercel deploy --prod --yes` before rerunning parity_static + trimmed_smoke packs.
- Next: Executor to implement the plan, extend tests, update parity docs/screenshot index, redeploy, and record results in `docs/SESSION_HANDOFF.md`, `PROGRESS.md`, and system reports.

## 2025-11-02 – Executor (in-progress): Forecasting parity remediation (Plan `plans/2025-10-30_forecasting-analytics-parity-remediation.plan.md`)
- Agent: forecasting-analytics-exec-2025-11-02-codex.
- Scope executed:
  - Added shared forecasting contracts (`src/types/forecasting.ts:1`).
  - Replaced fixtures with deterministic queue/horizon/template data (`src/data/forecastingFixtures.ts:1`).
  - Expanded `forecastingApi` to expose options, template CRUD, exports, and RU formatting helpers while keeping adjustment mocks (`src/services/forecastingApi.ts:1`).
  - Updated accuracy utilities to use RU locale formatting (`src/utils/accuracyCalculations.ts:1`).
  - Rebuilt Build/Exceptions/Absenteeism workspaces on top of the service layer (`src/components/forecasting/{build/BuildForecastWorkspace.tsx:1,exceptions/ExceptionsWorkspace.tsx:1,absenteeism/AbsenteeismWorkspace.tsx:1}`).
  - Confirmed `npm_config_workspaces=false npm run build` (passes; >500 kB chunk warning remains).
- Outstanding (per plan):
  - Complete Trend dashboard enhancements (period presets, anomaly tagging, CSV export) and Accuracy dashboard upgrades (detail table, RU formatting fixes, export hook); supporting adapter gaps still need implementing.
  - Add Vitest coverage (`tests/forecasting/*`), run smoke routes, preview smoke, deploy, rerun Step 6 UAT, and propagate documentation/tracker updates (CodeMap, parity packs, UAT report, parity index, MVP checklist, WRAPPER matrix, post-phase tracker, PROGRESS, SESSION_HANDOFF).
- Notes: No documentation aside from this handoff entry was updated. Preview must stay on port 4155. Staged UAT evidence directory remains `/Users/m/Desktop/tmp-forecasting-uat/`.
- Next agent: resume at Phase 2 Step 4 of the plan, then execute tests → build/smoke → deploy → Step 6 UAT → documentation sweep in the order described. Capture prod screenshots with the forecasting aliases when rerunning UAT.

## 2025-11-02 – Executor: Analytics Forecasting parity pass (Plan `plans/2025-10-30_analytics-forecasting_shared-extraction.plan.md`)
- Agent: analytics-forecasting-exec-2025-11-02-codex.
- Highlights: rebuilt analytics forecasting UI to match production captures — queue tree + multi-horizon builder (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:1-318`, `${ANALYTICS_REPO}/src/features/forecasting/components/QueueTree.tsx:1-92`), exceptions wizard with period builder/export (`${ANALYTICS_REPO}/src/features/forecasting/ExceptionsWorkspace.tsx:1-220`), absenteeism history and badges (`${ANALYTICS_REPO}/src/features/forecasting/AbsenteeismWorkspace.tsx:24-240`), adjustment status badges (`${ANALYTICS_REPO}/src/features/forecasting/AdjustmentsPanel.tsx:12-126`), trend tactical/operational tables (`${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:1-200`), and shell/Reports notifications (`${ANALYTICS_REPO}/src/App.tsx:18-112`, `${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:1-108`). Shared runtime extended with queues/horizons/history/report notices (`${ANALYTICS_REPO}/src/types/shared-forecasting-runtime.ts:1-1185`, `${ANALYTICS_REPO}/src/services/forecasting.ts:1-42`); styling updated for new controls/badges (`${ANALYTICS_REPO}/src/styles/index.css:820-1250`). Tests refreshed for new helpers and e2e flow (`${ANALYTICS_REPO}/src/services/__tests__/forecasting.test.ts:1-110`, `${ANALYTICS_REPO}/e2e/analytics.spec.ts:1-118`, `${ANALYTICS_REPO}/package.json:9-18`). Docs updated: illustrated guide + quick sheet parity notes (`docs/System/forecasting-analytics_illustrated-guide.md:18-160`, `uat-agent-tasks/forecasting-illustrated-quick-sheet.md:11-32`), executor task log (`docs/Tasks/forecasting-analytics_illustrated-guide.task.md:90`).
- Validation: `npm_config_workspaces=false npm run ci` → typecheck, Vitest, Vite build, Storybook build, Playwright ✅.
- Next: monitor report notification backlog once backend hooks land; any residual breadcrumb polish for analytics shell is optional and tracked in the guide parity status. Ready for Step 6 UAT rerun using refreshed quick sheet.

## 2025-11-02 – Task Author: Employee Portal parity remediation brief
- Agent: employee-portal-task-author-2025-11-02-codex.
- Inputs: `docs/Archive/UAT/2025-11-02_employee-portal_live-parity-audit.md`, manuals CH2/CH3/CH5/CH7, screenshot pack `~/Desktop/employee-portal-manual-pack/images/`, existing parity vision and scout notes.
- Output: Authored task brief `docs/Tasks/employee-portal_parity-remediation-2025-11-02.task.md` outlining Work Structure drawer, vacation history/export, and Appendix 1 profile remediation with role-specific handoffs and validation commands.
- Created supporting SOP `docs/SOP/task-author-sop.md` defining the Task Author workflow for replication projects.
- Next: Assign a scout to run `docs/Tasks/employee-portal_parity-remediation-2025-11-02.task.md`, produce discovery notes, then feed into planner/executor per standard cadence.

## 2025-11-02 – Scout: Analytics Dashboard parity remediation (Task `docs/Tasks/analytics-dashboard_parity-remediation-2025-11-02.task.md`)
- Discovery: Catalogued forecasting-demo sources for the missing build/exceptions/trend/absenteeism/accuracy/report flows with manual cites and production captures (`docs/Tasks/analytics-dashboard_parity-remediation-2025-11-02.task.md:63`, `:96`, `:123`, `:131`).
- Evidence: Flagged RU-format regression and CSV-only downloads for analytics (`docs/Tasks/analytics-dashboard_parity-remediation-2025-11-02.task.md:129`, `:144`) and kept the UAT deltas anchored to `uat-agent-tasks/analytics-dashboard_2025-11-02_parity-spotcheck.md:8` with screenshot aliases from `docs/SCREENSHOT_INDEX.md:63`.
- Next: Planner to lift the referenced modules from `${FORECASTING_ANALYTICS_REPO}` into `src/modules/forecasting/*`, extend report downloads to XLSX/PDF + bell notifications, and script validation/tests per SOP before executor pickup.

## 2025-11-02 – Planner: Analytics Dashboard parity remediation
- Plan: `plans/2025-11-02_analytics-dashboard-parity-remediation.plan.md` (shared module expansion → analytics alias cleanup → UI validation).
- Scope: promote queue tree/horizon/trend/accuracy/report helpers into `src/modules/forecasting`, replace `${ANALYTICS_REPO}` runtime shim with direct shared imports, and ensure forecasting UI uses RU formatted data + notification APIs.
- Validation (executor to run): `${EMPLOYEE_MGMT_REPO}` → `npm run test -- --run src/modules/forecasting/__tests__/data.test.ts`; `${ANALYTICS_REPO}` → `npm_config_workspaces=false npm run ci` (+ update Playwright screenshots if UI shifts).
- Docs/UAT: executor must refresh illustrated guide + quick sheet entries once gaps close and log AD rows in `uat-agent-tasks/2025-10-26_forecasting-uat.md` with new evidence.

## 2025-11-06 – Planner: Forecasting & Analytics parity remediation v4
- Plan: `plans/2025-11-06_forecasting-analytics-parity-remediation-v4.plan.md` (notification centre + download helper + doc refresh).
- Inputs: `${FORECASTING_ANALYTICS_REPO}/docs/Tasks/forecasting-analytics_parity-discovery-2025-11-06.task.md`, `uat-agent-tasks/2025-11-06_forecasting-real-vs-demo.md`, archived plan `docs/Archive/Plans/2025-11-04_forecasting-analytics-parity-remediation-v3.plan.md`.
- Summary: defined lightweight `NotificationCenterProvider`/`NotificationBell`, hardened build/export feedback (timezone-aware CSV metadata + bell entries + `triggerBrowserDownload` helper), patched accuracy export to reuse the helper, and refreshed parity docs to flag demo-only analytics modules. Executor to follow phase breakdown (notification infra → build/export updates → accuracy handler → docs + UAT rerun).
- Validation (executor to run): `npm install`, `npm run test:run`, `npm run build`, `npm run smoke:routes`, `npm run preview -- --host 127.0.0.1 --port 4155`, `vercel deploy --prod --yes`, `SMOKE_BASE_URL=<deploy> npm run smoke:routes`, then Step 6 `parity_static` + `chart_visual_spec` on the new prod URL.

## 2025-11-02 – Executor: Analytics Dashboard parity wiring (Plan `plans/2025-11-02_analytics-dashboard-parity-remediation.plan.md`)
- Agent: analytics-dashboard-exec-2025-11-02-codex.
- Code: Forecast builder now pulls queue data through shared `loadQueueTree` with loading/error states, feeds accuracy tables via `loadAccuracyTable`, and formats absenteeism summaries with RU percents (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:116-607`). Exceptions workspace shares the same queue loader/feedback loop while preserving template import/export (`${ANALYTICS_REPO}/src/features/forecasting/ExceptionsWorkspace.tsx:38-286`). Shared forecasting data emits RU-localised accuracy metrics (percent + two-decimal AHT) (`${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/data.ts:439-490`).
  - Detail table + exports: Added `buildForecastDetailTable` adapter and wired `AccuracyDashboard` to fetch `fetchForecastDetail` rows, render `ReportTable`, and download via `createAccuracyExport` (`${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/accuracy.ts:1`, `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/AccuracyDashboard.tsx:1-360`).
- Docs: refreshed illustrated guide + spot-check to highlight queue loading + RU decimals (`docs/System/forecasting-analytics_illustrated-guide.md:18-190`, `uat-agent-tasks/analytics-dashboard_2025-11-02_parity-spotcheck.md:8-18`) and updated executor notes in the task file (`docs/Tasks/analytics-dashboard_parity-remediation-2025-11-02.task.md`).
- Validation: `${EMPLOYEE_MGMT_REPO}: npm run test:unit -- --run src/modules/forecasting/__tests__/data.test.ts` ✅; `${ANALYTICS_REPO}: npm_config_workspaces=false npm run ci` ✅ (typecheck → Vitest → Vite build → Storybook build → Playwright). Follow-up pass executed `npm ci`, `npm run test:run`, `npm run build`, `npm run smoke:routes` after the new accuracy detail wiring ✅.
- Outstanding: Backend persistence (absenteeism templates, report queue) still pending; next pass should capture refreshed screenshots, rerun Step 6 UAT once deploy-ready, and run `SMOKE_BASE_URL=<deploy> npm run smoke:routes` after prod publish.

## 2025-11-02 – Scout: Employee Portal parity remediation discovery
- Agent: employee-portal-scout-2025-11-02-codex.
- Inputs reviewed: task brief (`docs/Tasks/employee-portal_parity-remediation-2025-11-02.task.md`), live audit (`docs/Archive/UAT/2025-11-02_employee-portal_live-parity-audit.md`), vision/scout notes, manuals CH2/CH3/CH5/CH7, desktop image pack.
- Findings logged in `docs/Workspace/Coordinator/employee-portal/Scout_Parity_Remediation_2025-11-02.md`: Work Structure drawer now matches CH2 (search + hierarchy), vacation history/export implemented with RU localisation, Appendix 1 profile fields and self-service present; remaining open question around the “Заявки за период” dialog scope (per-request vs dialog-level filters).
- Updated learning log entries (docs/System/learning-log.md:1-60) and wrapper matrix row (docs/System/WRAPPER_ADOPTION_MATRIX.md:33) to reflect restored drawer parity and outstanding history-dialog decision.
- Next: Planner to draft execution plan `plans/2025-11-02_employee-portal-parity-remediation.plan.md` covering any remaining adjustments (history dialog UX, org selection consumers, date placeholders) and prepare validation/deploy steps.

## 2025-11-02 – Executor: Employee Portal period history remediation (Plan `plans/2025-11-02_employee-portal-parity-remediation.plan.md`)
- Agent: employee-portal-exec-2025-11-02-codex.
- Highlights:
  - Added history aggregation helpers + status metadata (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:65-165`) and wired RU placeholders for year/period filters + new request dialog (`VacationRequests.tsx:674-715,782-804`).
  - Rebuilt the “📂 Заявки за период” dialog with period/single mode toggle, date/status checkboxes, and RU summary counters (`VacationRequests.tsx:816-1163`); updated toolbar copy (“⬇️ Экспорт CSV”) and helper state sync.
  - Extended Vitest coverage for CSV headers, history filters, and placeholders (`${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx:1-320`).
  - Synced docs: crosswalk (`uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md`), parity packs (`docs/Tasks/uat-packs/{parity_static.md,trimmed_smoke.md}`), screenshot index/checklist, Code Map (`docs/Workspace/Coordinator/employee-portal/CodeMap.md`), system matrices/checklists (`docs/System/{DEMO_PARITY_INDEX.md,WRAPPER_ADOPTION_MATRIX.md,PARITY_MVP_CHECKLISTS.md,CHART_COVERAGE_BY_DEMO.md,APPENDIX1_SCOPE_CROSSWALK.md}`), Reports checklist, learning log (`docs/System/learning-log.md`), and tracker entries (`docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`).
- Validation: `${EMPLOYEE_PORTAL_REPO}` → `npm_config_workspaces=false npm run build`, `npm_config_workspaces=false npm run test -- --run` ✅.
- Deploy: `vercel deploy --prod --yes` → https://wfm-employee-portal-l28i6hyl1-granins-projects.vercel.app (aliased to https://wfm-employee-portal.vercel.app).
- Outstanding:
  - Rerun `parity_static.md` + `trimmed_smoke.md` on the new build, capture `portal-vacation-history.png` + CSV toast, and update `docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md` (current status flagged “Re-run required”).
  - Promote updated Playwright harness into `${EMPLOYEE_PORTAL_REPO}/scripts/uat/` on follow-up so history filters remain in CI.
- Next agent: execute the UAT pass above, attach screenshots to the parity packs, then clear the tracker row in `docs/Tasks/post-phase9-demo-execution.md` and flip the UAT status blocks to Pass.

## 2025-11-03 – Executor: Employee Portal localization polish (Plan `plans/2025-11-03_employee-portal-localization-polish.plan.md`)
- Agent: employee-portal-exec-2025-11-03-codex.
- Highlights:
  - Introduced reusable `DateField` (`${EMPLOYEE_PORTAL_REPO}/src/components/inputs/DateField.tsx:1-134`) and swapped all vacation date inputs to use it, delivering a consistent `дд.мм.гггг` placeholder and ISO normalisation.
  - Centralised RU copy in `${EMPLOYEE_PORTAL_REPO}/src/locale/ru.ts`, updating Vacation Requests/Profile validation errors and success toasts to reference the catalog.
  - Adjusted Vitest coverage to type RU-formatted dates and assert new behaviours (`${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx:1-320`).
  - Updated docs: Code Map, parity packs (`docs/Tasks/uat-packs/{parity_static.md,trimmed_smoke.md}`), System/Reports MVP checklists, parity index, learning log, and tracker row.
- Validation: `${EMPLOYEE_PORTAL_REPO}` → `npm_config_workspaces=false npm run build`, `npm_config_workspaces=false npm run test -- --run` ✅ (Radix warnings expected).
- Deploy: `vercel deploy --prod --yes` → https://wfm-employee-portal-8h7oh0j1z-granins-projects.vercel.app (alias https://wfm-employee-portal.vercel.app).
- Outstanding:
  - Rerun `parity_static` + `trimmed_smoke` on this deploy (capture updated `portal-vacation-history.png`, CSV toast, DateField close-up) and log Pass/Fail in `docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md`.
- Next agent: complete that UAT sweep, then flip the Employee Portal rows in parity reports/tracker to Pass.


-  ## 2025-11-04 — Scout: Forecasting Stage 6 parity review
- Reviewed AI UAT report (`uat-agent-tasks/2025-11-04_forecasting_stage6_summary.md`) for demo `https://forecasting-analytics-d985qxj4y-granins-projects.vercel.app` versus production screenshots.
- Confirmed demo behaviour lines up with illustrated kit: timezone selector (`src/components/forecasting/common/TimezoneContext.tsx`), Build/Exceptions/Absenteeism (`build/BuildForecastWorkspace.tsx`, `exceptions/ExceptionsWorkspace.tsx`, `absenteeism/AbsenteeismWorkspace.tsx`), Trend analysis (`trends/TrendAnalysisDashboard.tsx`), Accuracy detail/export (`accuracy/AccuracyDashboard.tsx`), Adjustments (`AdjustmentsPanel.tsx`), and reports (`features/reports/ReportsPanel.tsx`).
- Noted that certain production views (trend/accuracy/timezone selector) remain unavailable under current OIDC credentials; no demo remediation required until broader access exists. Full instructions for the next parity sweep recorded in `uat-agent-tasks/2025-11-04_forecasting_full-walkthrough.txt`.
