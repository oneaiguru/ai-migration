# PROGRESS (start here)


## Current State
- Phase 7 final review complete. Overlay, form, MiniSearch, and import/export polish verified against reviewer briefs; evidence lives in `docs/Tasks/phase-7-final-review.md`.
- Shared wrappers, Storybook demos, and Vitest smoke tests remain in sync with production (`docs/Tasks/phase-7-component-library-discovery.md`). CSV helpers and TipTap accessibility fixes are live in `src/utils/importExport.ts` and `src/components/common/RichTextEditor.tsx`.
- AI-docs workspace now reflects the Phase 7 frozen snapshot (accessible form helpers + CSV snippet). References updated in `ai-docs/wrappers-draft/form/`, `ai-docs/reference/snippets/utils/import-export.ts`, and `docs/System/ai-docs-index.md`.
- Charts and Storybook axe sweeps stay deferred per `docs/Tasks/phase-7-component-library-followups.md` (Phase 9 analytics window).
- Phase 9 chart wrappers (Line/Bar/Doughnut/KPI/Table) now ship with Chart.js wiring, RU formatters, stories, and adapter tests (`docs/Tasks/phase-9-charts-wiring-executor.md`).
- Analytics dashboard now includes forecast builder, absenteeism analytics, reports hub, and confidence-band toolbars (see `${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx`, `/src/features/analytics/AbsenteeismPanel.tsx`, `/src/features/reports/ReportsPanel.tsx`). New production deploy: https://analytics-dashboard-demo-3lsuzfi0w-granins-projects.vercel.app.
- 2025-10-27: Analytics UAT (`parity_static`, `chart_visual_spec`) re-run Pass covering AD-1/AD-2/AD-3/AD-4; consolidated in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` (2025-10-27 section) and Findings updated.
- 2025-10-26: Manager Portal UAT (`parity_static`, `chart_visual_spec`) recorded as Pass (MP-1 coverage/adherence toggle); see `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md:5`.
- 2025-10-26 – WFM Employee Portal UAT re-run Pass: submit dedupe fix deployed to https://wfm-employee-portal-abgsfygld-granins-projects.vercel.app (`test-results/portal-uat-results-2025-10-26.json`, `portal-requests-after-fix.png`).
- 2025-10-26: Manager Portal локализация — все пользовательские строки переведены на русский; `npm run build` ✅ для проверки (see `docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md`).
- 2025-10-27: Forecasting & Analytics routing fix + safe defaults shipped; Step 6 UAT Pass (parity_static + chart_visual_spec) on https://forecasting-analytics-4pfj6jygr-granins-projects.vercel.app.
- 2025-10-28: WFM Employee Portal shell/navigation + vacation/profile parity shipped; build/test rerun ✅, deploy https://wfm-employee-portal-jf96k5u9o-granins-projects.vercel.app (alias https://wfm-employee-portal.vercel.app). parity_static + trimmed_smoke to rerun on new build; docs/crosswalk/checklists updated.
- 2025-10-31: Manager Portal schedule/approvals/reports parity shipped per plan `plans/2025-10-31_manager-portal-parity-remediation.plan.md`; vitest/build ✅, deploy https://manager-portal-demo-doeresnrv-granins-projects.vercel.app, consolidated UAT Pass (schedule tabs, approvals disposition, report queue) recorded.
- 2025-10-31: Work Structure header parity executed per `plans/2025-10-28_employee-portal-work-structure.plan.md` — domain + mock data extended with hierarchy, new layout drawer test added; `npm_config_workspaces=false npm run build` + `npm_config_workspaces=false npm run test:unit` ✅ (Playwright `--run` flag rejected). Crosswalk/screenshot checklist/Code Map refreshed; request UAT to capture `portal-work-structure.png` and rerun parity_static + trimmed_smoke.
- 2025-11-02: Executor shipped Employee Portal period-history remediation — aggregated “Заявки за период” filters + RU placeholders (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:65-165,674-804,926-1163`), tests updated (`src/__tests__/VacationRequests.test.tsx:1-320`), docs/reports synced; deployed to https://wfm-employee-portal-l28i6hyl1-granins-projects.vercel.app pending UAT rerun.
- 2025-11-03: Executor delivered Employee Portal localisation polish — `DateField` wrapper + RU copy catalog wired in (`${EMPLOYEE_PORTAL_REPO}/src/components/inputs/DateField.tsx`, `${EMPLOYEE_PORTAL_REPO}/src/locale/ru.ts`), tests updated, docs/checklists refreshed; deploy https://wfm-employee-portal-8h7oh0j1z-granins-projects.vercel.app awaiting parity_static/trimmed_smoke confirmation.
- 2025-11-04: AI UAT re-ran Stage 6 on forecasting demo `https://forecasting-analytics-d985qxj4y-granins-projects.vercel.app`; findings captured in `uat-agent-tasks/2025-11-04_forecasting_stage6_summary.md`. Demo matches the illustrated kit (timezone selector, build/exceptions/absenteeism/trend/accuracy/adjustments/report flows). Some areas in the production portal were inaccessible with current credentials, so additional comparisons will require broader access, but no demo changes are pending.

### Docs/Coordinator – Multi‑Demo
- Docs-only pass complete for Manager Portal, Analytics Dashboard, and WFM Employee Portal; 2025‑10‑21 orchestrator merge refreshed the Portal canonical docs.
- 2025‑10‑26 consolidated UAT sweep + Employee Portal findings/CodeMap synced to Pass (EP‑1 dedupe evidence lines updated; parity_static + trimmed_smoke logged).
- Canonical reports/UAT/SOP updated: `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`, `docs/System/APPENDIX1_SCOPE_CROSSWALK.md`, `docs/Tasks/uat-packs/parity_static.md`, `docs/Tasks/uat-packs/chart_visual_spec.md`, `docs/Tasks/uat-packs/trimmed_smoke.md`, `docs/SOP/demo-refactor-playbook.md`, `docs/Tasks/screenshot-checklist.md`.
- 2025-10-26 scout pass captured manager-portal parity gaps (`docs/Tasks/manager-portal_parity-scout-2025-10-26-codex.task.md`) for planner handoff.
- Execution planning queued via `docs/System/DEMO_EXECUTION_DECISION.md` → `plans/2025-10-12_manager-portal-refactor.plan.md`, `plans/2025-10-12_analytics-extraction.plan.md`, `plans/2025-10-12_employee-portal-parity.plan.md`.
- 2025-10-30: Planner drafted `plans/2025-10-30_analytics-forecasting_shared-extraction.plan.md` covering shared forecasting exceptions/absenteeism/reports/adjustments extraction.
- Code Maps trimmed and cross-linked with manual/UAT assets: `docs/Workspace/Coordinator/manager-portal/CodeMap.md`, `docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md`, `docs/Workspace/Coordinator/employee-portal/CodeMap.md` (deploy URLs, file:line evidence, screenshot aliases).
- Post-Phase 9 roadmap captured in `docs/Tasks/post-phase9-demo-execution.md` (Phases A–C tracker).
- 2025-10-30 unified shell top-nav parity shipped — top header/secondary tabs/stubs documented in `docs/Workspace/Coordinator/unified-demo/{CodeMap.md,Subtask_Integrator_Agent_TBD_2025-10-13.md}`, UAT table updated, new prod deploy https://wfm-unified-demo-rd4u3hbbl-granins-projects.vercel.app.
- Legacy `docs/Reports/*` references retargeted to `docs/System/*` (checklist stays at `docs/Reports/PARITY_MVP_CHECKLISTS.md`).

## How to Work
1. Read this file fully.
2. Identify the expected role (Scout, Planner, or Executor). If unclear, stop and clarify before continuing. Use `docs/System/context-engineering.md` for the role mapping and required prompts.
3. Read the CE_MAGIC prompt(s) and SOP that match your role, then complete the Required Reading list from the active plan (if any).
4. Open the plan listed under “Active Plan” and follow only the steps assigned to your role.
5. When finished, update the “Active Plan” section with status/next plan and log outcomes in `docs/SESSION_HANDOFF.md`.

## Active Plan
- Phase A — Manager Portal Parity (Executor)
  - Plan: plans/2025-10-27_manager-portal-behavior-parity.plan.md (Completed 2025-10-27)
  - Code lives in: ${MANAGER_PORTAL_REPO}
  - Status: Org drawer + module nav live; approvals categories/bulk/export merged; `npm run test -- --run --test-timeout=2000` & `npm run build` ✅. Docs, crosswalks, learning log synced.

- Phase B — Analytics Forecast Parity (Executor)
  - Plan: plans/2025-10-27_analytics-forecasting-parity.plan.md (Completed 2025-10-27)
  - Code lives in: ${ANALYTICS_REPO}
  - Status: Forecast builder/absenteeism/reports + confidence-band toolbar shipped; `npm run ci` ✅, `vercel deploy --prod --yes` → analytics-dashboard-demo-3lsuzfi0w; UAT packs re-run Pass (AD-1…AD-4). Docs/Code Map updated.

- Phase C — Forecasting & Analytics Environment Hardening (Executor)
  - Plan: plans/2025-10-29_forecasting-analytics-env-hardening.plan.md (Completed 2025-10-29)
  - Code lives in: ${FORECASTING_ANALYTICS_REPO}
  - Status: React 18.3.1/Node ≥18 pinned; stray hook removed; `npm ci` + tests/build/smoke ✅; prod redeployed to forecasting-analytics-p6z0l224h… with parity_static + chart_visual_spec Pass.

- Phase D — Forecasting & Analytics Parity Remediation (Executor)
  - Plan: plans/2025-11-06_forecasting-analytics-parity-remediation-v4.plan.md (Ready for execution 2025-11-06)
  - Code lives in: ${FORECASTING_ANALYTICS_REPO}
  - Status: Notification bell + download helper + build/accuracy feedback queued. Follow v4 plan for implementation (notification centre, timezone-aware exports, doc updates) and rerun Step 6 UAT after deploy. References: `${FORECASTING_ANALYTICS_REPO}/docs/Tasks/forecasting-analytics_parity-discovery-2025-11-06.task.md`, `uat-agent-tasks/2025-11-06_forecasting-real-vs-demo.md`.

- **Next steps:**
  - Run trimmed_smoke + parity_static with new bulk actions/exports once deploy goes out.
  - Unified shell to expose Manager Portal tab before wiring routes (see docs/Workspace/Coordinator/unified-demo/CodeMap.md).
  - Capture org drawer + bulk-selection screenshots for documentation; monitor RU label parity once live data replaces mocks.

## On Deck
- Phase 9 – Charts Component API Spec: `docs/Tasks/phase-9-charts-component-spec.md`
- Phase 9 – Charts Data Contracts & Adapters: `docs/Tasks/phase-9-charts-data-contracts.md`
- Phase 9 – Real UI Visual Spec Capture: `docs/Tasks/phase-9-charts-ui-visual-spec.md`
- Phase 9 – Doc Mapping (Planner): `docs/Tasks/phase-9-charts-doc-mapping.md`
- Forecasting API integration follow-up (post-env hardening)
  - Scope: connect manual adjustments to live API validation (`src/services/forecastingApi.ts`) and document contract per `docs/System/PARITY_MVP_CHECKLISTS.md`.
- Analytics Dashboard Forecasting Parity (Executor pending): `plans/2025-10-27_analytics-forecasting-parity.plan.md`
  - Scope: add forecast build flow, trend adjustments, absenteeism analytics, reports download, organisation selector.
  - Required reading: docs/Tasks/analytics-dashboard_parity-scout-2025-10-26-codex.task.md, docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md, docs/Workspace/Coordinator/analytics-dashboard/Subtask_Analytics_Agent_TBD_2025-10-13.md, `/Users/m/Desktop/e.tex`.
- Unified Demo Pilot (Employees + Scheduling): `plans/2025-10-15_unified-demo-pilot.plan.md`
  - Prep tasks: `docs/Tasks/employee-management_prep-for-unification.task.md`, `docs/Tasks/scheduling_prep-for-unification.task.md`
  - Coordinator: `docs/Workspace/Coordinator/unified-demo/{README.md,CodeMap.md}`
  - Status: Employees prep ✅ (`src/Root.tsx`, `setupRU()`); scheduling prep queued.
- Unified shell integration pass: `plans/2025-10-13_unified-demo-integration.plan.md` (Completed 2025-10-14 – nav/auth chrome live)

## Test Log
- 2025-11-03 – `${EMPLOYEE_PORTAL_REPO}` – `npm_config_workspaces=false npm run build` ✅ (DateField/localisation polish)
- 2025-11-03 – `${EMPLOYEE_PORTAL_REPO}` – `npm_config_workspaces=false npm run test -- --run` ✅ (DateField warnings expected)
- 2025-11-02 – `${EMPLOYEE_PORTAL_REPO}` – `npm_config_workspaces=false npm run build` ✅ (period-history remediation)
- 2025-11-02 – `${EMPLOYEE_PORTAL_REPO}` – `npm_config_workspaces=false npm run test -- --run` ✅ (Radix dialog warnings expected)
- 2025-10-29 – `${FORECASTING_ANALYTICS_REPO}` – `npm ci && npm run test:run` ✅ (React 18.3.1 lock, Vitest adapters green).
- 2025-10-29 – `${FORECASTING_ANALYTICS_REPO}` – `npm run build` ✅ (vite 6; chunk warning logged at 538 kB).
- 2025-10-29 – `${FORECASTING_ANALYTICS_REPO}` – `npm run smoke:routes` ✅ (local preview on 127.0.0.1:4176 covering /build,/exceptions,/trends,/absenteeism,/adjustments,/accuracy).
- 2025-10-29 – `${FORECASTING_ANALYTICS_REPO}` – `SMOKE_BASE_URL=https://forecasting-analytics-p6z0l224h-granins-projects.vercel.app npm run smoke:routes` ✅ (prod smoke clean).
- 2025-10-30 – `${UNIFIED_DEMO_REPO}` – `npm run build` ✅ (top-nav shell refresh; Vite warns about >500 kB chunk).
- 2025-10-30 – `${UNIFIED_DEMO_REPO}` – `npm run preview --workspace shell -- --host 127.0.0.1 --port 4190` ✅ (cURL smoke on /forecasts, /schedule/graph, /employees, /reports; preview shut down after probes).
- 2025-10-30 – `${UNIFIED_DEMO_REPO}` – `vercel deploy --prod --yes` ✅ (https://wfm-unified-demo-rd4u3hbbl-granins-projects.vercel.app).
- 2025-10-14 – `${UNIFIED_DEMO_REPO}` – `npm run build` ✅ (shell nav/auth integration; Vite warns about >500 kB chunk).
- 2025-10-14 – `${UNIFIED_DEMO_REPO}` – `vercel deploy --prod --yes` ✅ (https://wfm-unified-demo-p1prfmmh7-granins-projects.vercel.app).
- 2025-10-27 – Manager Portal demo (`${MANAGER_PORTAL_REPO}`) – `npm_config_workspaces=false npm run test -- --run --test-timeout=2000` ✅
- 2025-10-27 – Manager Portal demo (`${MANAGER_PORTAL_REPO}`) – `npm_config_workspaces=false npm run build` ✅
- 2025-10-27 – `${FORECASTING_ANALYTICS_REPO}` – `npm run test:run` ✅ (routing + adapter regression)
- 2025-10-27 – `${FORECASTING_ANALYTICS_REPO}` – `npm run build` ✅ (BrowserRouter + safe defaults)
- 2025-10-27 – `${FORECASTING_ANALYTICS_REPO}` – `npm run smoke:routes` ✅ (local preview + SMOKE_BASE_URL prod check)
- 2025-10-26 – Manager Portal demo (`${MANAGER_PORTAL_REPO}`) – `npm run build` ✅ (РУ локализация проверена)
- 2025-10-28 – `${EMPLOYEE_PORTAL_REPO}` – `npm_config_workspaces=false npm run build` ✅ (Vite build, Tailwind ok)
- 2025-10-28 – `${EMPLOYEE_PORTAL_REPO}` – `npm_config_workspaces=false npm run test -- --run` ✅ (Radix dialog act warnings expected)
- 2025-10-26 – Manager Portal demo (`${MANAGER_PORTAL_REPO}`) – `parity_static` + `chart_visual_spec` UAT ✅ (MP-1 coverage/adherence toggle)
- 2025-10-13 – `npm run build` ✅; `npm run test:unit -- --run` ✅ (setupRU export, Radix/RHF warnings expected)
- 2025-10-25 – `${FORECASTING_ANALYTICS_REPO}` – `npm run test:run` ✅ (adapter coverage for accuracy/error/adjustments)
- 2025-10-25 – `${FORECASTING_ANALYTICS_REPO}` – `npm run build` ✅ (wrappers migration)
- 2025-10-23 – Manager Portal demo (`${MANAGER_PORTAL_REPO}`) – `npm run build` ✅ (Chart.js wrappers + Tailwind base tweaks)
- 2025-10-23 – Manager Portal demo (`${MANAGER_PORTAL_REPO}`) – `npm test -- --run` ✅ (added `jsdom` dev dependency so Vitest closes cleanly)
- 2025-10-20 – `npm run typecheck` ✅ (production repo clone, `tsconfig.wrappers.json`)
- 2025-10-20 – `npm run build` ✅ (production repo clone)
- 2025-10-20 – `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅ (production repo clone)
- 2025-10-10 – `npm run build` ✅
- 2025-10-10 – `npm run typecheck` (`tsconfig.wrappers.json`) ✅
- 2025-10-10 – `npm run test:unit` ✅
- 2025-10-10 – `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅
- 2025-10-10 – `npm run storybook:build` ✅
- 2025-10-11 – `npm run build` ✅ (overlay padding fix)
- 2025-10-11 – `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings expected)
- 2025-10-11 – `npm run preview -- --host 127.0.0.1 --port 4174` → started on 4175 ✅
- 2025-10-11 – `npm run build` ✅ (overlay width centering)
- 2025-10-11 – `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings expected)
- 2025-10-13 – `npm run build` ✅
- 2025-10-13 – `npm run typecheck` (`tsconfig.wrappers.json`) ✅
- 2025-10-13 – `npm run test:unit` ✅ (Radix/Tiptap warnings expected during jsdom runs)
- 2025-10-13 – `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅
- 2025-10-13 – `npx tsx scripts/benchmarks/datatable.ts` ✅ (10k → 95.21 ms, 30k → 133.03 ms, 50k → 318.67 ms)
- 2025-10-14 – `npm run build` ✅
- 2025-10-14 – `npm run typecheck` (`tsconfig.wrappers.json`) ✅
- 2025-10-14 – `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings expected)
- 2025-10-14 – `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅
- 2025-10-14 – `npm run storybook:build` ✅
- 2025-10-14 – `npx tsx scripts/benchmarks/datatable.ts` ✅ (10k → 107.64 ms, 30k → 147.25 ms, 50k → 374.24 ms)
- 2025-10-15 – `npm run build` ✅
- 2025-10-15 – `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings expected)
- 2025-10-15 – `npm run test -- --project=chromium --workers=1 --grep "Employee list"` ✅
- 2025-10-12 – `${ANALYTICS_REPO}: npm run build` ✅ (wrappers refactor)
- 2025-10-12 – `${ANALYTICS_REPO}: npm run test` ✅ (Vitest adapters/formatters)
- 2025-10-12 – `${ANALYTICS_REPO}: npm run typecheck` ✅
- 2025-10-12 – `${ANALYTICS_REPO}: parity_static` UAT ✅ (docs/Tasks/uat-packs/parity_static.md; dual-axis trend verified)
- 2025-10-12 – `${ANALYTICS_REPO}: chart_visual_spec` UAT ✅ (docs/Tasks/uat-packs/chart_visual_spec.md; dual-axis trend verified)
- 2025-10-12 – `${ANALYTICS_REPO}: npm run storybook:build` ✅
- 2025-10-12 – `${ANALYTICS_REPO}: npm run test:e2e` ✅ (Playwright dashboard legend/aria checks)
- 2025-10-15 – `npm run build` ✅ (overlay scrim fix)
- 2025-10-15 – `npm run test:unit` ✅ (Radix hidden-title + RHF act warnings expected)

_Only update this file when handing off after completing a plan or when blocked._
