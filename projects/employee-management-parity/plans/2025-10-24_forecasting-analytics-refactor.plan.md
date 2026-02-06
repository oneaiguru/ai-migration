# Plan — Forecasting Analytics Refactor (Wrappers + Docs)

## Goal
Bring the standalone Forecasting & Analytics demo (`https://wfm-forecasting-analytics.vercel.app`) into the parity pipeline: migrate Chart.js/Recharts usages to shared wrappers, wire RU locale helpers, add adapter tests/stories, and fold the demo into coordinator docs (Code Map, UAT packs, screenshot index).

## Inputs
- `docs/System/DEMO_EXECUTION_DECISION.md`
- `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`
- `~/wiki/replica/work/Testing_Implementation_Handoff.md:38-120` (forecast API coverage)
- `~/wiki/replica/work/MappingStrategy.md:239-260` (forecasting slots)
- Repo: `${FORECASTING_ANALYTICS_REPO}` (App shell `src/App.tsx:9-110`, accuracy view `src/components/forecasting/AccuracyDashboard.tsx:1-200`, trends dashboard `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:4-210`, manual adjustments `src/components/forecasting/ManualAdjustmentSystem.tsx:1-220`, metrics utils `src/utils/accuracyCalculations.ts:1-132`)

## Scope (MVP)
- **Accuracy analytics view**: KPI tiles + metrics cards, model comparison, export, validation controls.
- **Trend dashboards**: 3-chart layout (forecast vs fact, seasonality bars, trend micro-chart) with anomaly alerts.
- **Forecast builder & adjustments**: Manual adjustment grid, bulk tools, undo/redo, forecasting controls.
- **Docs/Parity**: Code Map entry, UAT pack slices, screenshot aliases, wrapper matrix rows, learning log updates.

## Tasks
1. **Baseline Audit**
   - Inventory current Chart.js + Recharts usage (`AccuracyDashboard`, `TrendAnalysisDashboard`, `TimeSeriesChart`, `ForecastingInterface`).
   - Document data shapes from `types/{accuracy,trends}.ts` and wiki API notes; map to shared wrapper props (LineChart, BarChart, DoughnutGauge, ReportTable, KpiCardGrid).
2. **Wrapper Migration**
   - Add shared Chart.js registrar + RU formatters (reuse `${MANAGER_PORTAL_REPO}/src/utils/charts/register.ts` pattern).
   - Build adapters in `src/adapters/forecasting/*` (new) that transform API payloads into wrapper series (multi-axis trend, confidence bands, seasonal variance, adjustment grid → ReportTable rows).
   - Replace direct `react-chartjs-2` renders with wrappers, keeping layout/styling intact.
3. **Manual Adjustments**
   - Convert `EnhancedAdjustmentGrid` to use shared `ReportTable` or virtualization helper; surface selection/bulk operations via wrapper hooks.
   - Implement undo/redo + validation feedback using shared state utilities (add tests for operations).
4. **Stories & Tests**
   - Storybook slices for accuracy dashboard cards, trend charts, adjustment grid states (baseline, high error, weekend).
   - Vitest coverage for adapter math (MAPE/MAE, seasonal clustering, bulk adjustment operators) leveraging `src/utils/accuracyCalculations.ts` + `statisticalTests.ts`.
5. **Docs & Parity Assets**
   - Draft Code Map (`docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md`) with file:line evidence + deploy URL.
   - Extend wrapper matrix, chart coverage, parity checklist with forecasting slots (MAPE dashboard, trend trio, manual adjustments).
   - Add UAT pack slices (parity_static, chart_visual_spec) covering accuracy KPIs, dual-axis trends, adjustment scenarios; register screenshot aliases in `docs/SCREENSHOT_INDEX.md`.
   - Log learnings + session handoff after execution.
6. **Validation/UAT**
   - `npm install && npm run build` in forecasting repo; run unit tests + Storybook build once added.
   - Execute new UAT prompts against https://wfm-forecasting-analytics.vercel.app (accuracy, trends, adjustments) and capture evidence.

## Acceptance
- Forecasting demo uses shared wrappers with RU locale helpers; build/storybook/tests green.
- Adapter tests cover accuracy calculations, seasonal charts, adjustment operations.
- Coordinator docs updated (Code Map, wrapper matrix, chart coverage, parity checklist, screenshot index, UAT packs, learning log).
- Session handoff logs deploy URL + UAT results; PROGRESS updated with execution status.

## References
- Vercel prod: `https://wfm-forecasting-analytics.vercel.app` (ID `wfm-forecasting-analytics-3m2zei6km`)
- GitHub source: `https://github.com/granin/naumen/tree/master/forecasting-analytics`
- Shared accuracy utils: `src/utils/accuracyCalculations.ts:1-132`, `src/utils/statisticalTests.ts:1-200`
