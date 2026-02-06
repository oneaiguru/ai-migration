# Analytics Dashboard — Parity Spot Check (2025-11-02)

Use this checklist to verify the new parity work landed in the analytics demo after the shared-forecasting extraction. It supplements the full walkthrough in `forecasting-illustrated-quick-sheet.md`—only the deltas below need attention for this pass.

## Target Build
- Forecasting & Analytics: https://forecasting-analytics-d985qxj4y-granins-projects.vercel.app

## Focus Areas
1. **Build Forecast workspace**
   - Queue tree with favourites/search (shows shared-helper loading state before interaction), multi-horizon cards, absenteeism value/profile selector, template import/export, RU accuracy table (comma decimals), summary banner, and confirmation toast.
   - Evidence: `src/features/forecasting/ForecastBuilder.tsx` (builder UI & accuracy table), `src/features/forecasting/components/QueueTree.tsx` (tree control).
2. **Exceptions wizard**
   - Queue picker, day/interval period builder, template import/export buttons, applied-template CSV export.
   - Evidence: `src/features/forecasting/ExceptionsWorkspace.tsx`.
3. **Trend analysis tables**
   - Strategic, tactical, and operational tables with equal-period selector beneath the charts.
   - Evidence: `src/features/analytics/AdvancedAnalytics.tsx` (trend tables).
4. **Absenteeism**
   - Run history table with status badges plus existing profile edit/duplicate flows.
   - Evidence: `src/features/forecasting/AbsenteeismWorkspace.tsx`.
5. **Manual adjustments**
   - Validation badges/tooltips and row highlights while undo/redo/Σ counters continue to work.
   - Evidence: `src/features/forecasting/AdjustmentsPanel.tsx`.
6. **Shell & Reports**
   - Report download formats (CSV/XLSX/PDF) produce RU filenames and trigger the header bell notification list.
   - Evidence: `src/App.tsx`, `src/features/reports/ReportsPanel.tsx`.
7. **Accuracy detail table**
   - Detail grid under accuracy overview shows forecast/fact, абсолютные/относительные отклонения, absenteeism %, lost calls %, AHT, SL with RU formatting; export button triggers `accuracy_YYYY-MM-DD.csv` download.
   - Evidence: `${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/AccuracyDashboard.tsx`, `${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/accuracy.ts`.

## Logging
- Record results in `2025-10-26_forecasting-uat.md` (analytics section) with screenshot aliases from `docs/SCREENSHOT_INDEX.md`.
- Flag disparities against the production captures in `docs/System/images/forecasting/` and cite file:line when referring to code.
