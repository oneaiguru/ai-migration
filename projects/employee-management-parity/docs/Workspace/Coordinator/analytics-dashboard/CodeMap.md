# Demo Code Map — Analytics Dashboard

Meta
- Repo: ${ANALYTICS_REPO}
- Deploy URL: https://analytics-dashboard-demo-3lsuzfi0w-granins-projects.vercel.app
- Commit: b91773e1e968b1103a6e6608b5c156b6d17bbe0a · Date: 2025-10-27 (local workspace + redeploy)
- UAT: 2025-10-27 — Pass (`parity_static.md`, `chart_visual_spec.md`, new forecast/report steps ✅)

Screens
- Hero & Module Switcher (route `/`)
  - Layout shell + context: `${ANALYTICS_REPO}/src/App.tsx:22` (organisation selector, module pills).
  - Wrappers surfaced by module: analytics stack, forecast builder, reports panel toggled via `activeModule` state `${ANALYTICS_REPO}/src/App.tsx:65`.

- KPI Overview (analytics module)
  - Component: `${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:8` (cards, sparkline chart, service table).
  - Wrappers: `KpiCardGrid` + `LineChart` + `ReportTable` wired with RU copy `${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:15` / `:18` / `:26`.
  - Data seeds: KPI + hourly volume mocks `${ANALYTICS_REPO}/src/data/mock.ts:101` and `:69`.

- Live Status (analytics module)
  - Component: `${ANALYTICS_REPO}/src/features/analytics/LiveStatus.tsx:4` (per-second refresh, RU timestamps).
  - Formatters: `${ANALYTICS_REPO}/src/utils/charts/format.ts:76` (`formatDateTime`).

- Advanced Analytics (analytics module)
  - Component with adjustments reducer: `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:10`.
  - Wrappers: Gauges `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:27`, Heatmap `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:39`, Radar `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:44`, dual-axis `LineChart` + toolbar `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:47`.
  - Data + confidence band: `${ANALYTICS_REPO}/src/data/mock.ts:188` (trend series/targets/confidence).

- Absenteeism Analytics (analytics module)
  - Component: `${ANALYTICS_REPO}/src/features/analytics/AbsenteeismPanel.tsx:10` (async load, delta banner, line chart + table).
  - Service: `${ANALYTICS_REPO}/src/services/forecasting.ts:3` (`loadAbsenteeismSnapshot`).
  - Data seed: `${ANALYTICS_REPO}/src/data/mock.ts:353` (observed vs forecast + breakdown).

- Forecast Builder (forecasting module)
  - Component: `${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:38` (form reducer, confidence band chart, results table).
  - Service: `${ANALYTICS_REPO}/src/services/forecasting.ts:7` (`runForecastBuild`).
  - Deterministic generator: `${ANALYTICS_REPO}/src/data/mock.ts:270` (seeded forecast, confidence band, table rows).
  - Styles: form + buttons `${ANALYTICS_REPO}/src/styles/index.css:245` / `:278`.

- Reports Hub (reports module)
  - Component: `${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:18` (metadata cards + CSV button).
  - Utility: `${ANALYTICS_REPO}/src/utils/export.ts:1` (client-side CSV download stub).
  - Styles: card grid `${ANALYTICS_REPO}/src/styles/index.css:65` / `:332`.

Data & Services
- Dashboard seed + confidence band structures: `${ANALYTICS_REPO}/src/data/mock.ts:7`-`:${402}` (seededRandom helpers, trend smoothing data, forecast/absenteeism factories).
- Forecast/absenteeism services: `${ANALYTICS_REPO}/src/services/forecasting.ts:1`.
- Organisation context: `${ANALYTICS_REPO}/src/state/organization.ts:1` (provider + hook).

Routes & Layout
- Module switch + context provider: `${ANALYTICS_REPO}/src/App.tsx:22` (OrganisationContext, module nav, conditional renders).
- Layout styles + hero controls: `${ANALYTICS_REPO}/src/styles/index.css:26` / `:49` / `:103`.

RU & A11y
- Chart registrar + RU locale: `${ANALYTICS_REPO}/src/utils/charts/register.ts:22`.
- Formatter helpers: `${ANALYTICS_REPO}/src/utils/charts/format.ts:19`.
- Forecast/absenteeism `LineChart` aria strings: `${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:101` and `${ANALYTICS_REPO}/src/features/analytics/AbsenteeismPanel.tsx:48`.
- Toolbar buttons expose descriptive labels in RU `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:69`.

Tests & Stories
- Unit: forecast generators `${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.test.tsx:1`; adapters `${ANALYTICS_REPO}/src/utils/charts/adapters.test.ts:1`; formatters `${ANALYTICS_REPO}/src/utils/charts/format.test.ts:1`.
- Stories: `${ANALYTICS_REPO}/src/stories/AnalyticsDashboard.stories.tsx:1` (adds Forecast Builder + Absenteeism stories for static review).
- E2E: `${ANALYTICS_REPO}/e2e/analytics.spec.ts:18` (legend colors, heatmap a11y, forecast → reports download; generates artifacts in `e2e/artifacts/`).
- CI: `npm run ci` pipeline `${ANALYTICS_REPO}/package.json:9`; GitHub workflow `${ANALYTICS_REPO}/.github/workflows/ci.yml:1`.

UAT Links
- Packs: `docs/Tasks/uat-packs/parity_static.md` (Analytics → Forecast/Reports section), `docs/Tasks/uat-packs/chart_visual_spec.md` (trend confidence band, absenteeism), `docs/Tasks/uat-packs/chart_visual_spec.md` (dual-axis legend), `docs/Tasks/screenshot-checklist.md` (aliases `analytics-forecast-build.png`, `analytics-reports-card.png`, `analytics-trend-playwright.png`).
- Quick sheet: `uat-agent-tasks/forecasting-illustrated-quick-sheet.md`.
- Real-system mapping: `/Users/m/Desktop/e.tex` §Forecasting (flow expectations), CH6_Reports.md §6.2–6.4 for export parity.

Open Gaps
- `LineChart` confidence-band props lack README coverage. Proposal: extend charts README + add vitest snapshot for legend `data-hidden`; Owner: Charts WG.
- CSV stub currently downloads metadata only; hook into real dataset once backend stabilises. Owner: Analytics executor (future pass).
- Absenteeism panel missing Playwright artifact. Proposal: capture screenshot alias next UAT window. Owner: Analytics executor.

References
- CH docs: CH6_Reports.md §§6.2–6.4, CH5_Schedule_Advanced.md §5.4, CH6_Reports.md Appendix — trend and report expectations.
- System reports synced here: docs/System/DEMO_PARITY_INDEX.md, docs/System/PARITY_MVP_CHECKLISTS.md, docs/System/WRAPPER_ADOPTION_MATRIX.md, docs/System/CHART_COVERAGE_BY_DEMO.md, docs/System/APPENDIX1_SCOPE_CROSSWALK.md.
- Illustrated guide: `docs/System/forecasting-analytics_illustrated-guide.md`.
