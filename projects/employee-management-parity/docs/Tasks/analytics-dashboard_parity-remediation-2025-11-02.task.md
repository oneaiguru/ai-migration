# Task – Analytics Dashboard Parity Remediation (2025-11-02)

## Context
- Source evidence: `/Users/m/Desktop/q/q.markdown`, `/Users/m/Desktop/q/qtrace.markdown` (Step 6 UAT results, real-system comparison).
- Target demo: `${ANALYTICS_REPO}` – https://analytics-dashboard-demo-3lsuzfi0w-granins-projects.vercel.app
- Reference system: Naumen forecasting module (OIDC portal).
- Related guides: `docs/System/forecasting-analytics_illustrated-guide.md`, `uat-agent-tasks/forecasting-illustrated-quick-sheet.md`, `uat-agent-tasks/analytics-dashboard_2025-11-02_parity-spotcheck.md`.

## Outstanding Gaps (from latest UAT)
1. **Build Forecast workspace**
   - Missing hierarchical queue tree with favourites/search.
   - No Day/Interval toggle or independent historical/forecast date pickers.
   - Absenteeism selector lacks value input vs profile toggle.
   - Template import/export buttons absent; no confirmation toasts.
   - Accuracy table should expose SL/AHT and RU-formatted columns (currently partially implemented but locale incorrect).
2. **Exceptions wizard**
   - Needs Day/Interval mode selector and multi-interval date ranges.
   - Template import/export actions must mirror production (with applied-template CSV export).
3. **Trend analysis**
   - Requires queue selection gate, equal-period enforcement, and tactical/operational tables seeded from shared data.
4. **Absenteeism calculation**
   - Must support run history with status badges and downloadable results in addition to profile CRUD.
5. **Accuracy dashboard / KPI cards**
   - All numeric outputs must use Russian locale formatting (comma decimals, space before %).
6. **Reports & shell**
   - Ensure multi-format downloads reuse shared filename helpers and trigger header notification bell.

## Role Workflow

### Scout
- Re-read manuals CH4 §§4.1–4.4, CH6 §§6.1–6.4 and gather file:line evidence from `${FORECASTING_ANALYTICS_REPO}` for each missing workflow (queue tree, exception builder, absenteeism calculator, trend tables, RU format helpers).
- Update this task file under **Scout Notes** with:
  - Real-system screenshots (aliases in `docs/System/images/forecasting/`).
  - Current forecasting repo entry points to reuse (components, adapters, services, tests).
  - Any additional gaps spotted during research.

### Planner
- Draft implementation plan covering:
  1. Promotion of the identified forecasting components/services into `src/modules/forecasting/` (shared library).
  2. Analytics UI wiring steps per feature (Build, Exceptions, Trends, Absenteeism, Accuracy, Reports).
  3. RU localisation fixes (helpers in shared module + usage in analytics KPI cards/charts).
  4. Test matrix (Vitest, Playwright, Storybook) and required screenshots.
  5. Documentation touchpoints (illustrated guide, quick sheet, parity packs, UAT log, screenshot index).
- Record the plan in this file under **Planner Notes** and queue the executor handoff.

### Executor
- Follow the approved plan; for each feature:
  - Extract forecasting implementation into the shared module (types, data generators, services, adapters).
  - Consume shared APIs in `${ANALYTICS_REPO}` (no duplication).
  - Fix RU formatting across KPI/accuracy views.
  - Add/adjust tests and regenerate Storybook/Playwright artifacts.
  - Run `npm_config_workspaces=false npm run ci`.
  - Update documentation + UAT entries (`uat-agent-tasks/2025-10-26_forecasting-uat.md`, guides, parity checklists, SESSION_HANDOFF).
- Summarise work under **Executor Notes** with deploy URL and validation log.

## Notes
- UAT logging stays in `uat-agent-tasks/2025-10-26_forecasting-uat.md` (analytics section, AD- rows).
- Keep `docs/Tasks/analytics-forecasting-overlap-discovery.md` in sync when shared components move.
- Screenshot bundle lives at `/Users/m/Desktop/tmp-forecasting-uat/`; update aliases in `docs/SCREENSHOT_INDEX.md` after new captures.

## Scout Notes
### Build Forecast workspace
- **Manual**: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:11` (queue tree & upload controls) highlights the structure we must mirror.
- **Screenshots**: `real-naumen_build-forecast_header-queue-tree.png`, `real-naumen_build-forecast_date-range.png`, `real-naumen_build-forecast_absenteeism-options.png`, `real-naumen_build-forecast_import-buttons.png`, `real-naumen_build-forecast_summary-banner.png`, `real-naumen_build-forecast_confirmation.png` (see `docs/System/images/forecasting/`).
- **Forecasting implementation**:
  - `forecasting-analytics/src/components/forecasting/build/BuildForecastWorkspace.tsx:205` renders the hierarchical queue tree with active-state badges.
  - `forecasting-analytics/src/components/forecasting/build/BuildForecastWorkspace.tsx:311` wires the Day/Interval toggle and horizon presets.
  - `forecasting-analytics/src/components/forecasting/build/BuildForecastWorkspace.tsx:333` exposes editable historical/forecast date pickers.
  - `forecasting-analytics/src/components/forecasting/build/BuildForecastWorkspace.tsx:360` provides the absenteeism value vs profile selector.
  - `forecasting-analytics/src/components/forecasting/build/BuildForecastWorkspace.tsx:400` covers build trigger, template uploads, and CSV downloads with toasts.
  - `forecasting-analytics/src/components/forecasting/build/BuildForecastWorkspace.tsx:483` shows the summary banner mirroring the real-system confirmation strip.
- **Services & fixtures**:
  - `forecasting-analytics/src/services/forecastingApi.ts:69` loads queue tree, horizons, and defaults (includes CSV template helpers at `:185`).
  - `forecasting-analytics/src/services/forecastingApi.ts:94` simulates forecast builds with status messaging.
  - `forecasting-analytics/src/data/forecastingFixtures.ts:17` defines the nested queue tree and horizons (`:81`) plus absenteeism profiles (`:90`).
  - Shared library entry points already exported via `src/modules/forecasting/{data.ts:25,services.ts:10}` for deterministic datasets and API shims.
- **Tests**: `forecasting-analytics/tests/forecasting/accuracy.test.ts:20` and `src/modules/forecasting/__tests__/adjustments.test.ts:12` exercise the shared adapters used by the builder table; port these when wiring analytics to shared modules.
- **Notes**: Analytics currently bypasses queue validation; reuse `selectedQueues` enforcement from `BuildForecastWorkspace` to block builds without a queue selection as the real UI does.

### Exceptions wizard
- **Manual**: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:50` (holiday intervals) documents the Day/Interval switch and multi-interval editor.
- **Screenshots**: `real-naumen_exceptions_day-interval-toggle.png`, `real-naumen_exceptions_period-builder.png`, `real-naumen_exceptions_templates-grid.png`.
- **Forecasting implementation**:
  - `forecasting-analytics/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:243` toggles between разовый and повторяющийся режим.
  - `forecasting-analytics/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:275` builds the interval grid with day-of-week selectors, smoothing, and delete actions.
  - `forecasting-analytics/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:361` lists saved templates with edit/delete buttons.
- **Services/tests**:
  - `forecasting-analytics/src/services/forecastingApi.ts:391` loads/saves templates; deletions handled at `:406`.
  - Shared helpers live in `src/modules/forecasting/exceptions/index.ts:18` (template models) with coverage in `src/modules/forecasting/__tests__/exceptions.test.ts:6`.
- **Notes**: Analytics will need an applied-template CSV export. Forecasting’s API layer only exposes CSV via `createTemplateExport`; planners should extend the shared module for XLSX/PDF if parity requires it.

### Trend analysis
- **Manual**: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:153` (trend dashboards) notes queue gating and equal-period enforcement.
- **Screenshots**: `real-naumen_trends_strategic-charts.png`, `real-naumen_trends_tactical-table.png`, `real-naumen_trends_operational-grid.png`, `real-naumen_trends_sigma-overlay.png`.
- **Forecasting implementation**:
  - `forecasting-analytics/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:222` swaps between strategic/tactical/operational tabs.
  - `forecasting-analytics/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:244` provides the preset range buttons and custom date inputs (equal-period lock).
  - `forecasting-analytics/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:328` draws the dual-axis LineChart with confidence band/secondary axis metadata.
  - `forecasting-analytics/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:400` scopes data by selected queue before rendering tables/anomaly lists.
- **Adapters/data**:
  - `forecasting-analytics/src/adapters/forecasting/trends.ts:175` generates the time/day/magnitude datasets consumed by the tables.
  - Shared generator `src/modules/forecasting/trends/index.ts:64` produces deterministic series/confidence bands for reuse.
- **Tests**: `forecasting-analytics/tests/forecasting/trends.test.ts:16` asserts secondary-axis metadata and seasonality buckets.
- **Notes**: The production system holds charts blank until a queue is picked (per `q.markdown` capture); analytics must gate rendering using the queue select and default data path.

### Absenteeism calculation
- **Manual**: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:139` (run history) and §4.3 template rules describe status badges and CSV downloads.
- **Screenshots**: `real-naumen_absenteeism_interval-toggle.png`, `real-naumen_absenteeism_history-table.png`, `real-naumen_absenteeism_template-edit.png`.
- **Forecasting implementation**:
  - `forecasting-analytics/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:205` covers profile CRUD form fields.
  - `forecasting-analytics/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:329` handles per-date overrides.
  - `forecasting-analytics/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:400` renders the profile table with download/edit/delete actions (CSV export at line `:422`).
- **Shared library**:
  - `src/modules/forecasting/absenteeism/index.ts:30` seeds the deterministic profile list; mutations exposed via `:109` (upsert) and `:158` (delete).
  - `src/modules/forecasting/services.ts:24` streams the aggregate absenteeism snapshot used for history charts.
- **Gap**: Forecasting demo does not yet expose the run-history/status badges the real system shows; execution plan should extend the shared module to generate history entries before analytics adds the table.

### Accuracy dashboard & KPI cards
- **Manual**: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:151` documents RU-formatted KPIs and deviation tables.
- **Screenshots**: `real-naumen_accuracy_kpis.png`, `real-naumen_accuracy_detailed-table.png`, `real-naumen_accuracy_results-table.png`, `real-naumen_accuracy_error-chart.png`.
- **Forecasting implementation**:
  - `forecasting-analytics/src/components/forecasting/accuracy/AccuracyMetrics.tsx:41` renders KPIs via `KpiCardGrid` using RU copy.
  - `forecasting-analytics/src/adapters/forecasting/accuracy.ts:70` builds KPI items with trend metadata and RU formatting.
  - `forecasting-analytics/src/adapters/forecasting/accuracy.ts:175` produces the error-analysis view toggles (time/day/magnitude).
- **Formatting helpers**:
  - `forecasting-analytics/src/utils/accuracyCalculations.ts:123` & `:128` define `Intl.NumberFormat('ru-RU')` helpers for percent/number values.
  - Shared wrapper formatters live at `src/modules/forecasting/data.ts:68` (RU table rows) and `src/modules/forecasting/trends/index.ts:85` (secondary-series units).
- **Tests**: `forecasting-analytics/tests/forecasting/accuracy.test.ts:20` guards KPI formatting; keep this in CI when analytics swaps to shared adapters.
- **Notes**: Latest manual UAT (`/Users/m/Desktop/q/q.markdown`) flagged English decimal separators in analytics despite the shared helpers; executor must replace local string formatting with `formatMetricValue`/`formatNumber` before re-running `npm run ci`.

### Reports & shell notifications
- **Manual**: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH6_Reports.md:5` (catalogue) and `:15` (notification bell) describe RU filenames and bell queue flow.
- **Screenshots**: `real-naumen_reports_catalogue.png`, `real-naumen_reports_export-dialog.png`, `real-naumen_shell_header-status.png`.
- **Shared resources**:
  - `src/modules/forecasting/reports/index.ts:23` enumerates the multi-format catalogue; `:178` exposes `buildReportFilename` with RU date suffixes.
  - `src/modules/forecasting/services.ts:10` already exports `runForecastBuild` so analytics can trigger notifications consistently.
- **Forecasting demo references**: `forecasting-analytics/src/components/forecasting/ForecastingLayout.tsx:49` configures shell tabs; planner can lift bell/notification copy from there while wiring analytics.
- **Notes**: Analytics currently downloads CSV only (`forecasting-analytics/src/services/forecastingApi.ts:446`). Plan needs a shared downloader that supports XLSX/PDF and pushes a notification entry for the header bell.

### Evidence & quick-sheet alignment
- UAT focus areas for this pass are already logged in `uat-agent-tasks/analytics-dashboard_2025-11-02_parity-spotcheck.md:8`; reuse those IDs when capturing new screenshots (`playwright-forecasting-build.png`, `playwright-forecasting-trend.png`, etc.).
- Reference captures live under `docs/System/images/forecasting/` (aliases listed in `docs/SCREENSHOT_INDEX.md:63`).

### Additional findings
- Absenteeism run history is absent in the forecasting demo, so analytics must implement a shared history generator before parity validation (document gap in planner section).
- Multi-format report downloads remain CSV-only across both demos; planner should extend the shared reports module to emit XLSX/PDF and enqueue notifications.
- Ensure queue selection gating for trends/build flows matches production: analytics currently autoloads data, conflicting with the behaviour captured in `q.markdown`.

## Planner Notes
- Plan recorded at `plans/2025-11-02_analytics-dashboard-parity-remediation.plan.md`.
- Phase 1 promotes queue tree/horizon helpers, absenteeism runs, trend/accuracy generators, exception CSV exporters, and report notifications into `src/modules/forecasting` with Vitest coverage.
- Phase 2 re-points `${ANALYTICS_REPO}` TypeScript/Vite aliases to the shared module and replaces the local runtime shim with passthrough exports.
- Phase 3 confirms forecasting UI consumers (builder, absenteeism history, reports panel) import the shared helpers and rely on RU formatted data.
- Validation: `${ANALYTICS_REPO}` → `npm_config_workspaces=false npm run ci`; shared module → `npm run test -- --run src/modules/forecasting/__tests__/data.test.ts`.

## Executor Notes

### Implementation Summary
**Date**: 2025-11-02
**Executor**: ChatGPT (Codex)
**Status**: ✅ Phase 2 wiring delivered

- ForecastBuilder now sources queue data via shared `loadQueueTree`, provides loading/error states before selection, drives accuracy tables through `loadAccuracyTable`, and formats absenteeism summaries with RU percents (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:116-607`).
- ExceptionsWorkspace consumes the shared queue helper with matching loading feedback while retaining template import/export flows (`${ANALYTICS_REPO}/src/features/forecasting/ExceptionsWorkspace.tsx:38-286`).
- Shared forecasting module emits RU-localised accuracy metrics (comma percentages, two-decimal AHT) for UAT parity (`${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/data.ts:439-490`).

### Validation
- `${EMPLOYEE_MGMT_REPO}: npm run test:unit -- --run src/modules/forecasting/__tests__/data.test.ts` ✅
- `${ANALYTICS_REPO}: npm_config_workspaces=false npm run ci` ✅ (typecheck → vitest → Vite build → Storybook build → Playwright)

### Documentation / UAT Updates (detail table pass)
- Refreshed `docs/System/forecasting-analytics_illustrated-guide.md` and `uat-agent-tasks/analytics-dashboard_2025-11-02_parity-spotcheck.md` to highlight the shared queue loader and RU decimal checks.

### Outstanding Work (handoff to next executor)
- API persistence (absenteeism templates, report downloads) remains out of scope for this pass.
- Capture fresh screenshots and rerun UAT after the next deploy once backend wiring is ready.

### Implementation Summary
**Date**: 2025-11-02 (detail table & export wiring)
**Executor**: ChatGPT (Codex)
**Status**: ✅ Accuracy dashboard detail view ready for UAT

- Added `buildForecastDetailTable` adapter with RU formatting for forecast vs fact deltas and wired `AccuracyDashboard` to fetch `fetchForecastDetail` rows, render the shared `ReportTable`, and trigger `createAccuracyExport` downloads (`${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/accuracy.ts:1`, `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/AccuracyDashboard.tsx:72-214,266-305`).
- Extended Vitest suites for forecast detail/export helpers (`tests/forecasting/accuracy.test.ts:1-86`, `tests/forecasting/trends.test.ts:1-86`).
- Validation run post-update: `npm ci` → `npm run test:run` → `npm run build` → `npm run smoke:routes` ✅.

### Documentation / UAT Updates
- `docs/System/forecasting-analytics_illustrated-guide.md:150-190` now references the accuracy detail table view and export behaviour.
- `docs/System/WRAPPER_ADOPTION_MATRIX.md:40-45` lists the new `ReportTable` usage; executor notes updated here and in `docs/SESSION_HANDOFF.md`/`PROGRESS.md` for follow-up.

### Outstanding Work
- Deploy refreshed build, run `SMOKE_BASE_URL=<deploy> npm run smoke:routes`, and execute Step 6 UAT packs (`docs/Tasks/uat-packs/parity_static.md`, `chart_visual_spec.md`) with updated screenshot aliases. Log results in `uat-agent-tasks/2025-10-26_forecasting-uat.md`.
