# Task — Analytics Dashboard Forecasting Parity (Scout)

## Meta
- Agent: analytics-dashboard-scout-2025-10-26-codex
- Date: 2025-10-26
- Repo: ${ANALYTICS_REPO}
- Sources reviewed: PROGRESS.md, docs/System/DEMO_PARITY_INDEX.md, docs/Workspace/Coordinator/analytics-dashboard/CodeMap.md, `/Users/m/Desktop/e.tex` (real-vs-demo report), analytics demo source under `src/`

## Summary
The analytics demo remains a static KPI showcase. Real Naumen’s Forecasts module allows building forecasts, adjusting trends, analysing absenteeism, and exporting reports. None of those behaviours exist in `${ANALYTICS_REPO}` today: data is randomly generated in `src/data/mock.ts:18-194`, there are no routes or services for forecast creation, and the charts do not expose adjustments or exports. We need a follow-up plan to scope the parity work.

## Findings
1. **No forecast build flow**
   - Evidence (demo): `src/App.tsx:7-33` renders KPI/Advanced panels only; `src/data/mock.ts:18-194` seeds random data on each render. There is no form to select organisational point, horizon, or run a build.
   - Reference (real system): `/Users/m/Desktop/e.tex` (“Forecasting & analytics” table) documents the Production `Прогнозы → Построить` flow with org selection, historical window, and forecast generation.
   - Gap: Users cannot create or regenerate forecasts; demo only visualises mock numbers.

2. **Trend analysis lacks adjustments / saving**
   - Evidence: `src/features/analytics/AdvancedAnalytics.tsx:40-71` renders the 6‑month dual-axis LineChart with static series; wrapper `src/components/charts/LineChart.tsx:33-169` exposes no controls to modify targets or smooth data.
   - Real expectation: `/Users/m/Desktop/e.tex` notes Naumen’s “Strategic forecast” view with smoothing tools and manual adjustments.
   - Gap: No UI or adapters for edits, no persistence hook, no acknowledgement of confidence bands beyond static props.

3. **Absenteeism analytics missing**
   - Evidence: data mocks and Advanced analytics components include KPI gauges, heatmap, radar, but no absenteeism-specific view. `src/features/analytics/AdvancedAnalytics.tsx` only shows service-level metrics.
   - Real expectation: `/Users/m/Desktop/e.tex` highlights absenteeism forecast import/analysis in Forecasts tab.
   - Gap: Demo cannot surface absenteeism KPIs or charts at all.

4. **Reports / exports absent**
   - Evidence: repo has no routes or components for report selection/export; search for `export` only hits build scripts. Analytics demo UI ends at KPI panels.
   - Real expectation: `/Users/m/Desktop/e.tex` “Reports” table lists multiple downloadable reports (T‑13, punctuality, etc.).
   - Gap: No parity coverage for reporting.

5. **Org tree / context selection absent** (secondary)
   - Evidence: `src/App.tsx` renders a single layout without an organisation selector.
   - Real expectation: `/Users/m/Desktop/e.tex` top-level nav includes “Рабочая структура” for filtering by department.
   - Gap: Demo locked to a single pseudo-org; may block accurate forecast builds later.

## Risks & Questions
- Forecasting workflows likely require new backend mocks or adapters; need scope alignment with Forecasting demo to avoid duplication.
- Introducing uploads/exports affects hosting (Vercel) limits; confirm acceptable to rely on in-memory mocks.
- Org tree implementation may depend on shared components from Manager/Employee demos; confirm reuse strategy.

## Suggested Next Steps (for Planner)
1. Plan forecast build MVP: form + service layer + updated charts (primary deliverable).
2. Design trend adjustment UX: smoothing toggle, editable targets, save/reset actions.
3. Define absenteeism analytics panel (chart type, data schema, adapters).
4. Outline reporting slice (report picker + CSV/Excel export stub).
5. Evaluate shared organisation context/store to keep demos aligned.

## References
- App shell: `${ANALYTICS_REPO}/src/App.tsx:7-33`
- Data mocks: `${ANALYTICS_REPO}/src/data/mock.ts:18-194`
- Advanced analytics screen: `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:10-71`
- LineChart wrapper: `${ANALYTICS_REPO}/src/components/charts/LineChart.tsx:33-169`
- Real-system comparison: `/Users/m/Desktop/e.tex`
