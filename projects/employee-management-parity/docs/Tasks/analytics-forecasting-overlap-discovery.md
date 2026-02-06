# Analytics vs Forecasting — Overlap Discovery (Scout)

Role
- Scout (discovery only; no code changes)

Why
- We suspect the Analytics Dashboard and Forecasting & Analytics demos overlap in charts, adapters, and KPIs. The goal is to identify duplication now and propose an earlier trim plan so we don’t ship duplicate code across demos.

Where To Work
- Repos (read-only):
  - Analytics Dashboard: ${ANALYTICS_REPO}
  - Forecasting & Analytics: ${FORECASTING_ANALYTICS_REPO}
- Library reference (read-only): this repo (employee-management-parity)

Required Reading
- docs/System/WRAPPER_ADOPTION_MATRIX.md
- docs/System/PARITY_MVP_CHECKLISTS.md
- docs/System/CHART_COVERAGE_BY_DEMO.md
- docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md
- docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md
- docs/SOP/best-practices.md
- docs/SOP/orchestrator-swarm-autoreview.md

Scope Boundary
- Discovery only; do not modify code or configs.
- Prefer static inspection (grep/rg) over running apps. If you run builds locally, record exact commands and outputs into the deliverable.
- Visuals are frozen; focus on behaviour/components/adapters overlap.

What To Inspect (both repos)
- Wrappers usage: LineChart, BarChart, KpiCardGrid, ReportTable, Dialog
- Adapters: trends, accuracy, error analysis, KPI builders, adjustments
- Metadata: secondaryAxis, confidence band shading, units/labels, RU formatting
- State flows: undo/redo (adjustments), view toggles, route params (queueIds, dateRange)
- Router shape: real routes vs view toggles; deep-link handling
- Tests/stories: adapter specs, integration tests, Storybook stories

Quick Grep Map (run per repo root)
- `rg -n "LineChart|BarChart|KpiCardGrid|ReportTable|Dialog" src`
- `rg -n "adapter|adapters|trends|accuracy|error|kpi|secondaryAxis|confidence|undo|redo" src`
- `rg -n "setupRU|register|format|RU" src`
- `rg -n "Routes|BrowserRouter|HashRouter|vercel.json" .`

Deliverable (paste into this file below)
- Overlap Matrix table with at least these rows:
  - Trends line chart (dual-axis, confidence band)
  - Accuracy dashboard (KPI deck + error analysis bar)
  - Manual Adjustments (table + badges + undo/redo)
  - KPI tiles (KpiCardGrid)
  - ReportTable (sorting/filtering)
  - RU formatting (numbers/dates)
- For each row capture:
  - Analytics path:line
  - Forecasting path:line
  - Same wrapper? (Y/N)
  - Adapter shape diff (key fields)
  - Risks (API/UX differences)
  - Recommendation (Unify in library vs keep separate), with a 1–2 sentence rationale
- Extraction candidates list:
  - Component/adapter names to unify, proposed library destination paths, and any test coverage to port
- Routing notes (Forecasting): whether to use HashRouter or BrowserRouter+rewrites for deep links
- Optional: bundle-size hints if you built locally (which files duplicate across builds)

Acceptance Criteria
- Overlap Matrix completed with file:line evidence for all 6 rows above
- At least 5 concrete extraction candidates listed with proposed library destinations
- A clear recommendation per row: unify now vs defer
- Forecasting routing note recorded (HashRouter vs BrowserRouter+rewrites) with one-sentence tradeoff
- No code changes; conclusions and references live in this file

Output Format (fill below this line)

## Overlap Matrix
| Capability | Analytics (path:line) | Forecasting (path:line) | Same wrapper? | Adapter shape diff | Risks | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| Trends line chart | analytics-dashboard-demo/src/features/analytics/AdvancedAnalytics.tsx:117 | forecasting-analytics/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:120 | N – separate wrappers | Analytics LineChart expects confidenceBand object and optional toolbar; forecasting adapters emit bands[], secondaryAxis, anomaly metadata via buildForecastVsFactSeries | Legend/axis handling and confidence shading will diverge; analytics loses anomaly metadata, forecasting loses toolbar controls | Unify now – promote forecasting wrapper into shared library, add optional toolbar slot, and normalize adapter shape so both demos share one implementation. |
| Accuracy (KPI + error) | analytics-dashboard-demo/src/features/analytics/KpiOverview.tsx:15 (KPI deck only) | forecasting-analytics/src/components/forecasting/accuracy/AccuracyMetrics.tsx:41; forecasting-analytics/src/components/forecasting/accuracy/ErrorAnalysis.tsx:60 | N – analytics lacks accuracy adapters | Analytics cards read data.kpi {value,target,unit}; no error bar adapter; forecasting builds items via buildAccuracyKpiItems and error bars via buildErrorAnalysisSeries with viewToggle metadata | Analytics cannot add accuracy breakdown without duplicating forecasting logic; KPI styling already diverges (no variants/trend icons) | Unify now – extract forecasting accuracy adapters + BarChart toggle API into shared lib and refit analytics to consume them before new metrics land. |
| Manual Adjustments | analytics-dashboard-demo/src/App.tsx:65 (no adjustments module) | forecasting-analytics/src/components/forecasting/ManualAdjustmentSystem.tsx:341 | N – feature only in forecasting | Analytics stops at ForecastBuilder; forecasting wires buildAdjustmentTable with undo/redo stacks, validation badges, and API bridge | If analytics adds adjustments later it will reinvent table actions and validation flows, creating a third variant | Unify now – lift ManualAdjustmentSystem plus buildAdjustmentTable into shared module so other demos can mount identical workflow. |
| KPI tiles | analytics-dashboard-demo/src/components/charts/KpiCardGrid.tsx:41 | forecasting-analytics/src/components/charts/KpiCardGrid.tsx:24 | N – props differ | Analytics grid formats numbers internally from {value, unit, target}; forecasting expects preformatted strings with variant and trend glyphs | Styling, localisation, and trend semantics already drift; adapters become repo-specific | Unify now – create a shared KpiCardGrid that accepts numeric inputs plus optional variant/trend flags and push formatting into adapters. |
| ReportTable | analytics-dashboard-demo/src/components/charts/ReportTable.tsx:18 | forecasting-analytics/src/components/charts/ReportTable.tsx:4 | N – analytics minimal, forecasting adds exports/sticky header | Analytics table enforces plain strings and basic scroll; forecasting table supports ReactNode cells, export badges, sticky header | Divergent accessibility patterns and duplicate column definitions will expand maintenance overhead | Unify now – adopt forecasting table as base with feature flags and update analytics adapters to the richer API. |
| RU formatting | analytics-dashboard-demo/src/utils/charts/format.ts:1 | forecasting-analytics/src/utils/charts/format.ts:3 | N – parallel helpers | Analytics formatter covers currency, hours, percent; forecasting formatter restricts Unit to hours/percent/people and returns fallback dash | Mixed formatters cause inconsistent numerals (currency vs fallback) and duplicate vitest coverage | Unify now – merge into shared ruFormat helper with superset API and reuse analytics format tests alongside forecasting scenarios. |

## Extraction Candidates
- 1) LineChart wrapper + trend adapters → src/lib/charts/LineChart.tsx → reuse analytics-dashboard-demo/src/utils/charts/adapters.test.ts and forecasting-analytics/tests/forecasting/accuracy.test.ts
- 2) BarChart + buildErrorAnalysisSeries (view toggles) → src/lib/charts/BarChart.tsx → port forecasting-analytics/tests/forecasting/accuracy.test.ts coverage for toggles/metadata
- 3) KpiCardGrid + buildAccuracyKpiItems/data.kpi mapper → src/lib/charts/KpiCardGrid.tsx → add shared adapter spec exercising analytics data seeds + forecasting variant/trend cases
- 4) ReportTable + buildAdjustmentTable → src/lib/charts/ReportTable.tsx → carry forecasting-analytics/tests/forecasting/adjustments.test.ts and add analytics table snapshot for empty states
- 5) RU chart formatting helpers → src/lib/utils/formatRu.ts → merge analytics-dashboard-demo/src/utils/charts/format.test.ts with new cases for forecasting Unit fallbacks
- 6) ManualAdjustmentSystem (component + undo/redo services) → src/modules/forecasting/ManualAdjustments/index.tsx → create component harness test around forecasting-analytics/src/components/forecasting/ManualAdjustmentSystem.tsx interactions

## Routing Notes (Forecasting)
- Choice and tradeoff: BrowserRouter (src/main.tsx:3) + vercel.json rewrites keeps shareable deep links but requires host rewrite config; HashRouter would remove rewrite dependency yet breaks clean URLs and analytics tracking.

## Notes
- Commands run (if any) and outputs:
  - rg -n "LineChart|BarChart|KpiCardGrid|ReportTable|Dialog" src (both repos; analytics required --no-ignore because dist directory shadowed matches)
  - rg -n "adapter|adapters|trends|accuracy|error|kpi|secondaryAxis|confidence|undo|redo" src (both repos)
  - rg -n "setupRU|register|format|RU" src (both repos)
  - rg -n "Routes|BrowserRouter|HashRouter|vercel.json" . (both repos)

## Phase 2 Scout Findings — Shared Extraction (2025-10-30)

### Exceptions wizard (CH4 §4.1)
- **Forecasting implementation**: `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:1-74` renders the day/interval toggle, template cards, and “Построить c исключениями” CTA backed by deterministic templates in `${FORECASTING_ANALYTICS_REPO}/src/data/forecastingFixtures.ts:66-83`.
- **Analytics gap**: The analytics demo has no exceptions surface; module switching in `${ANALYTICS_REPO}/src/App.tsx:22-118` only mounts analytics/forecast/reports panels, and `rg "Исключ" src` returns no matches. Forecast builders (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:38-156`) accept only numeric horizons.
- **Shared API need**: Extract `exceptionTemplates` + toggle state into `src/modules/forecasting/exceptions/{types.ts,services.ts}` so both demos can reference a single data model (mode, frequency, period, horizon) and hook confirm/build actions.
- **Tests to port/author**: No vitest coverage exists today; add a lightweight reducer/formatter test alongside the new shared module. Update UAT row AD-2 once analytics mounts the shared wizard.

### Absenteeism calculation (CH4 §4.3)
- **Forecasting implementation**: `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:1-63` exposes template tables with Apply/Download/Edit/Delete actions backed by `${FORECASTING_ANALYTICS_REPO}/src/data/forecastingFixtures.ts:24-63`.
- **Analytics gap**: `${ANALYTICS_REPO}/src/features/analytics/AbsenteeismPanel.tsx:1-65` only reads a snapshot from `@wfm/shared/forecasting` and renders a chart/table—no template management or actions.
- **Shared API need**: Extend `@wfm/shared/forecasting` to surface profile metadata (id/mode/rules) and action stubs so analytics can reuse the same list + action handlers.
- **Tests to port/author**: Bring fixture/unit coverage from forecasting once authored; add Playwright step to exercise Apply/Download buttons when analytics mounts the workspace.

### Reports export slots (CH6 §§6.1–6.3)
- **Forecasting implementation**: Trend exports ship with rich format toggles in `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/trends/TrendExport.tsx:1-312`, and accuracy reports expose multi-format download controls in `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/accuracy/AccuracyExport.tsx:1-210`.
- **Analytics gap**: `${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:18-89` lists three CSV-only cards (T‑13, Пунктуальность, Отклонения) with a simple `downloadCsv` helper; missing Work Schedule, Daily schedule, Deviations export formats, and no Excel/PDF selectors.
- **Shared API need**: Promote export option definitions (formats, presets, handlers) into `src/modules/forecasting/reports/` so analytics can load the same metadata array and extend to the full CH6 catalogue.
- **Tests to port/author**: forecasting repo currently lacks unit tests for export builders—add utility tests when moving logic; ensure Playwright covers Excel/PDF toggles once wired.

### Trend adapters & anomaly metadata (CH4 §4.2)
- **Forecasting implementation**: `${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/trends.ts:1-184` builds forecast/fact/secondary axis series plus anomaly overlays; `tests/forecasting/trends.test.ts:1-32` asserts confidence band + metadata.
- **Analytics usage**: `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:47-126` reads a simplified trend payload (`generateDashboardData().trend`) without anomaly metadata or optional toolbar hooks.
- **Shared API need**: Expose `buildForecastVsFactSeries`, `buildSeasonalitySeries`, and anomaly helpers from the shared module so analytics can ingest identical outputs (confidence band arrays, `secondaryAxis`, `metadata.viewId`).
- **Tests to port/author**: Copy `tests/forecasting/trends.test.ts` into the shared package test suite and re-point analytics vitest config to run it via `npm run ci`.

### Adjustments services (CH4 §4.4)
- **Forecasting implementation**: `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ManualAdjustmentSystem.tsx:1-240` wires undo/redo, bulk adjustments, and validation badges using `${FORECASTING_ANALYTICS_REPO}/src/services/forecastingApi.ts:1-137` and adapter `buildAdjustmentTable` (`${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/adjustments.ts:1-83`). Coverage lives in `tests/forecasting/adjustments.test.ts:1-23`.
- **Analytics gap**: No adjustments UI (`rg "Коррект" src` returns zero). Forecast page stops at deterministic chart/table output.
- **Shared API need**: Migrate `buildAdjustmentTable`, `validateAdjustments`, `saveAdjustments`, and undo/redo helpers into `src/modules/forecasting/adjustments/` so analytics can optionally mount the same workflow.
- **Tests to port/author**: Move `tests/forecasting/adjustments.test.ts` alongside the shared module; add Playwright scenario once analytics exposes the adjustment table (log under AD-4).

### Routing considerations
- Forecasting uses `BrowserRouter` with SPA rewrites (`${FORECASTING_ANALYTICS_REPO}/src/main.tsx:1-12`, `vercel.json:1-6`) to preserve deep links to `/accuracy`, `/trends`, `/adjustments`. Analytics still renders a single-page switcher without routing (`${ANALYTICS_REPO}/src/App.tsx:22-118`). When lifting shared modules, either introduce the same router (with rewrites) or provide composition helpers that do not assume `react-router` context.

### Test & UAT mapping
- Vitest suites to migrate into the shared workspace: `tests/forecasting/accuracy.test.ts`, `tests/forecasting/trends.test.ts`, `tests/forecasting/adjustments.test.ts`.
- Playwright smoke (`${FORECASTING_ANALYTICS_REPO}/tests/smoke/forecasting.spec.ts` if extended) should backfill AD-2/AD-4 once analytics mounts shared flows; continue logging against existing IDs in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`.
- Capture new screenshots for exceptions/absenteeism/report exports per `docs/Tasks/screenshot-checklist.md` after analytics adopts the shared module.
