# Forecasting Demo Walkthrough (2025-11-04)

Use this as the "demo side" companion when comparing to the real Naumen screenshots. Every item below is live on deploy https://forecasting-analytics-d985qxj4y-granins-projects.vercel.app (commit `4142922`).

## Shell
- **Timezone selector** – Header includes dropdown (Москва UTC+03 ↔ Челябинск UTC+05) backed by `src/components/forecasting/common/TimezoneContext.tsx` and rendered in `src/App.tsx`.
- **Modules present** – Build, Exceptions, Absenteeism, Trends, Accuracy, Adjustments, Reports all appear with notification bell + status indicator.

## Построить прогноз (`/build`)
- Hierarchical queue tree with search/favourites (`BuildForecastWorkspace.tsx:80-185`).
- Horizon and forecast windows (chips + custom ranges) with RU formatting (`BuildForecastWorkspace.tsx:430-520`).
- Absenteeism panel and templates (`BuildForecastWorkspace.tsx:540-660`).
- Run forecast button returns success toast + summary banner (`BuildForecastWorkspace.tsx:680-720`).
- CSV exports/imports wired through `createTemplateExport/exportForecastCsv` (`BuildForecastWorkspace.tsx:760-840`, `src/services/forecastingApi.ts:200-360`).

## Задать исключения (`/exceptions`)
- Saved templates list + queue selector (`ExceptionsWorkspace.tsx:300-380`).
- Day/Interval editor with smoothing slider (`ExceptionsWorkspace.tsx:700-780`).
- History presets/"Свой диапазон" and export/import buttons (`ExceptionsWorkspace.tsx:560-760`).
- CSV export includes timezone metadata (`exportExceptionsCsv` in `forecastingApi.ts:360-430`).

## Расчёт абсентеизма (`/absenteeism`)
- Summary banner showing horizon + timezone (`AbsenteeismWorkspace.tsx:120-200`).
- Template editor with periodic + single overrides (`AbsenteeismWorkspace.tsx:210-450`).
- Run history table + status badges (`AbsenteeismWorkspace.tsx:460-560`).
- Calculator panel + CSV export hooks (`AbsenteeismWorkspace.tsx:570-680`, `forecastingApi.ts:430-515`).

## Анализ трендов (`/trends`)
- Strategic/Tactical/Operational tabs with queue gating (empty state until queue/period chosen) (`TrendAnalysisDashboard.tsx:40-160`).
- Confidence band + dual-axis legend (`TrendAnalysisDashboard.tsx:170-260`).
- Seasonality & anomaly panels (`TrendAnalysisDashboard.tsx:260-360`).
- CSV export helpers (`createTrendExport` in `forecastingApi.ts:520-610`).

## Анализ точности (`/accuracy`)
- KPI deck + confidence widget with RU formatting (`AccuracyDashboard.tsx:150-260`).
- Detail table (forecast/fact/Δabs/Δ%/absenteeism/lost calls/AHT/SL) and CSV export (`AccuracyDashboard.tsx:260-340`, `createAccuracyExport` in `forecastingApi.ts:610-670`).

## Корректировки (`/adjustments`)
- Interval grid with inline badges/tooltips (`AdjustmentsPanel.tsx:40-200`).
- Undo/redo + Σ counters remain active (`AdjustmentsPanel.tsx:210-300`).
- Targeted Playwright coverage `e2e/analytics.spec.ts` for regression.

## Reports / Notification Bell
- Reports catalogue (T‑13, etc.) with CSV/XLSX/PDF toggles (`src/features/reports/ReportsPanel.tsx:20-100`).
- Bell dropdown shows queued downloads with RU timestamps (`src/App.tsx:60-110`, `createReportDownloadNotice` in `src/data/forecastingFixtures.ts:520-560`).

## Evidence bundle
- Stage 6 replay: `uat-agent-tasks/2025-11-04_forecasting_stage6_summary.md`
- UAT prompt for agents: `uat-agent-tasks/2025-11-04_forecasting_full-walkthrough.txt`
- Screenshot aliases: `docs/SCREENSHOT_INDEX.md` → `forecasting-timezone-selector.png`, `forecasting-accuracy-detail.png`, etc.

Give this list to the agent so they can tick off each feature while cross-checking against the real Naumen session captures.
