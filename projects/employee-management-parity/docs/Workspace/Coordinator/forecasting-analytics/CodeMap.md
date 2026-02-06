# Demo Code Map — Forecasting & Analytics

Meta
- Repo: ${FORECASTING_ANALYTICS_REPO}
- Deploy URL: https://forecasting-analytics-p6z0l224h-granins-projects.vercel.app
- Commit: `<local>` – React 18.3.1 lock + stray hook fix + smoke/UAT (2025-10-29)

Screens
- **Accuracy Dashboard** (`/accuracy`)
  - Tabs + layout shell in `${FORECASTING_ANALYTICS_REPO}/src/App.tsx:7-92` keep RU breadcrumbs and status chips.
  - KPI grid now renders through `KpiCardGrid` with adapter output (`accuracy/AccuracyMetrics.tsx:1-70`).
  - Historical chart uses shared `LineChart` + adapter wiring (`accuracy/PerformanceChart.tsx:3-116`) with RU tooltips/targets; wrapper now ready for secondary axis overlays.
  - Error distribution replaces bespoke Chart.js with `BarChart` view toggles (`accuracy/ErrorAnalysis.tsx:9-75`).
  - Comparison + validation tables leverage `ReportTable` wrappers (`accuracy/ModelComparison.tsx:6-137`, `accuracy/ModelValidation.tsx:7-181`).

- **Trend Analysis** (`/trends`)
  - Component rebuilt around shared wrappers (`trends/TrendAnalysisDashboard.tsx:1-222`) with strategic/tactical/operational tabs, queue selector, anomaly list.
  - Forecast vs fact chart now includes confidence band shading + dual-axis legend via adapters (`adapters/forecasting/trends.ts:9-104`).
  - Seasonality sidebar uses `BarChart` categories (`trends.ts:106-127`), operational window reuses `LineChart` (TrendAnalysisDashboard lines 105-163).

- **Build Forecast** (`/build`)
  - Workspace shell lives in `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/build/BuildForecastWorkspace.tsx:1-180` with queue tree, horizon cards, absenteeism profile chips, and action buttons mirroring CH4 §4.1.
  - Queue tree uses deterministic fixtures from `src/data/forecastingFixtures.ts:1-120`; last-run summary in `validationSummary` block shows mocked operator.

- **Set Exceptions** (`/exceptions`)
  - Drawer-style form at `components/forecasting/exceptions/ExceptionsWorkspace.tsx:1-200` covers day vs interval toggles, holiday presets, and import/export controls per CH4 §4.1.
  - Uses `ReportTable` to list configured exceptions (`exceptions/ExceptionTemplates.tsx`).

- **Absenteeism Calculation** (`/absenteeism`)
  - Template gallery + profile detail cards implemented in `components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:1-210`, referencing CH4 §4.3 figures (periodic vs single-day).
  - Shares fixtures (`absenteeismProfiles`) with Build workspace to keep coverage consistent.

- **Manual Adjustments** (`/adjustments`)
  - Interactive grid migrated to `ReportTable` + undo/redo panel (`ManualAdjustmentSystem.tsx:1-240`).
  - Selection toggles wrap table cells (`ManualAdjustmentSystem.tsx:183-210`); bulk actions + quick adjustments lines 213-240.

Data & Services
- Forecasting adapters centralised under `${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/`:
  - Accuracy KPI/trend/error builders (`accuracy.ts:18-199`).
  - Trend forecast/seasonality/anomaly helpers (`trends.ts:9-116`).
  - Adjustment table mapper (`adjustments.ts:5-43`).
- API bridge: `${FORECASTING_ANALYTICS_REPO}/src/services/forecastingApi.ts:1-118` handles validation/persist calls (fetches `VITE_FORECASTING_API_URL` when configured, otherwise simulates).
- Shared chart wrappers registered via `${FORECASTING_ANALYTICS_REPO}/src/components/charts/*.tsx` with RU formatting helpers in `src/utils/charts/{register,format}.ts`.
- Accuracy math/statistics remain in `${FORECASTING_ANALYTICS_REPO}/src/utils/accuracyCalculations.ts:1-210` and `statisticalTests.ts:1-132`.
- Deterministic fixtures feeding the new workspaces live in `src/data/forecastingFixtures.ts:1-160` (queue tree, absenteeism profiles, validation summary).
- Package metadata pins `react`/`react-dom` at 18.3.1 and enforces `"engines": { "node": ">=18.18.0" }` to keep Vercel installs deterministic (`package.json`).

Routes & Layout
- `App.tsx:7-196` replaces local tab state with `react-router-dom` routes for `/build`, `/exceptions`, `/trends`, `/absenteeism`, `/accuracy`, `/adjustments`; top nav uses `NavLink` with RU breadcrumbs.
- `src/main.tsx:1-12` wraps `App` in `BrowserRouter`; `vercel.json` rewrites `/(.*)` → `/index.html` and now enforces `npm ci`/`npm run build` during deploy.
- Route wrappers provide safe defaults (`queueIds`, `dateRange`, mock accuracy data) so deep links render without runtime errors.
- Tailwind theme unchanged (`src/index.css`), wrappers rely on existing utility tokens.

RU & A11y
- Chart aria strings supplied in wrappers usage (`PerformanceChart.tsx:74-93`, `TrendAnalysisDashboard.tsx:54-75` etc.).
- Manual adjustment selection buttons accessible via `ariaTitle/ariaDesc` on `ReportTable` (`ManualAdjustmentSystem.tsx:183-210`).
- Locale adapters for Chart.js remain in `src/utils/charts/register.ts:1-44`.

Tests & Stories
- Vitest adapter coverage lives in `tests/forecasting/accuracy.test.ts` (KPI + trend + error series) and `tests/forecasting/adjustments.test.ts`.
- Storybook-ready showcase captured in `src/stories/ForecastingWrappers.stories.tsx` (KPI grid, trend, adjustments, seasonality slices).
- Package scripts extended with `npm run test`/`test:run`; `vitest.config.ts` added for React/Vite setup.
- Smoke script `npm run smoke:routes` (Playwright) now covers `/build`, `/exceptions`, `/trends`, `/absenteeism`, `/adjustments`, `/accuracy`; screenshots stored under `test-results/`.

UAT Links
- Packs: `docs/Tasks/uat-packs/parity_static.md` & `docs/Tasks/uat-packs/chart_visual_spec.md` (forecasting slices updated for wrappers).
- Screenshot aliases: `playwright-forecasting-accuracy.png`, `playwright-forecasting-trend.png`, `playwright-forecasting-adjustments.png` (docs/SCREENSHOT_INDEX.md).
- Quick sheet: `uat-agent-tasks/forecasting-illustrated-quick-sheet.md` (step order + logging targets).

Open Gaps
- Manual adjustments call API wrapper—connect to live backend once available; continue tracking palette alignment for trend confidence bands.
- Add integration tests once real API arrives; maintain smoke script for pre-deploy checks.

References
- CH forecasting scope: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md` (accuracy KPIs, manual adjustments).
- System parity docs to sync: `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/CHART_COVERAGE_BY_DEMO.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`.
- Illustrated guide: `docs/System/forecasting-analytics_illustrated-guide.md`.
