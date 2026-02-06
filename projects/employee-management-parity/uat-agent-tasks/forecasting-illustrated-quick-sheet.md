# UAT Quick Sheet — Forecasting Illustrated Guide

Use this handout when validating parity between the real Naumen portal and the forecasting demos. It condenses the detailed context from `docs/System/forecasting-analytics_illustrated-guide.md` into a single walkthrough.

## Pre-Flight Checklist
- Deploys under test: real portal (OIDC macro) + https://forecasting-analytics-p6z0l224h-granins-projects.vercel.app + https://analytics-dashboard-demo-3lsuzfi0w-granins-projects.vercel.app.
- Read `docs/System/forecasting-analytics_illustrated-guide.md` for full screenshots and gap notes.
- Keep manuals open for citation: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md`, `CH4_Forecasts.md`, `CH6_Reports.md`.
- Screenshot aliases live in `docs/SCREENSHOT_INDEX.md`; production captures are under `docs/System/images/forecasting/`.
- Log findings in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` (AD- / FA- rows) and attach evidence per alias.

## Walkthrough Table

| Step | Navigation | Expectation (compare to production capture) | Screenshot alias | Log row |
| --- | --- | --- | --- | --- |
| 1 | Launch portal → verify header status | Header shows module tabs, organisation selector, status ticker, downloads bell (`real-naumen_shell_header-status.png`). | `playwright-forecasting-build.png` (shell frame) | AD-Overview
| 2 | `/build` → expand queue tree | Hierarchical queue tree, favourites, search, selection summary banner (`real-naumen_build-forecast_*`). | `playwright-forecasting-build.png` + `real-naumen_build-forecast_selection-summary.png` | AD-1 / FA-Build
| 3 | `/build` → set Day/Interval, absenteeism value/profile, upload buttons | Separate historical vs build periods with toggle; absenteeism numeric vs profile; upload/download toasts (`real-naumen_build-forecast_date-range.png`, `_absenteeism-options.png`, `_import-buttons.png`, `_confirmation.png`). | Same as above | AD-1 / FA-Build
| 4 | `/build` → review accuracy table | RU-formatted table with абсолютная/относительная Δ, абсентеизм %, потеря вызовов %, SL, AHT (matches `real-naumen_accuracy_results-table.png`). | `playwright-forecasting-build.png` | AD-1 / FA-Build
| 5 | `/exceptions` | Day/Interval toggle, queue picker, template grid with import/export controls; applied templates exportable (`real-naumen_exceptions_*`). | `playwright-forecasting-exceptions.png` | AD-2 / FA-Exceptions
| 6 | `/trends` (Strategic/Tactical/Operational) | Charts + weekly table + 15-min grid; equal-period selector present (`real-naumen_trends_*`). | `playwright-forecasting-trend.png` | AD-3 / FA-Trends
| 7 | `/absenteeism` | Interval toggle, history table with status badges, template edit dialog (`real-naumen_absenteeism_*`). | `playwright-forecasting-absenteeism.png` | FA-Absenteeism
| 8 | `/adjustments` | Undo/redo stack, bulk +/-10%, validation badges/tooltips with Σ counters (`real-naumen_adjustments_*`). | `playwright-forecasting-adjustments.png` | FA-Adjustments
| 9 | `/accuracy` | KPI deck + detailed table verifying metrics after build; numbers must follow RU locale (comma decimals, space before %) and export notification hits header bell (`real-naumen_accuracy_*`). | `playwright-forecasting-accuracy.png` | AD-4 / FA-Accuracy
| 10 | `/reports` | Full catalogue, format dropdown (CSV/XLSX/PDF), RU filename, notification bell in shell (`real-naumen_reports_*`). | `analytics-reports-card.png` | AD-Reports

## Logging & Evidence
- Record Pass/Fail plus notes in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`; cite manual section (`CH4 §4.1`, etc.) and file:line when referencing demo code.
- Store screenshots in the outbound bundle (`/Users/m/Desktop/tmp-forecasting-uat/`) using the alias names above. If you capture new angles, update `docs/SCREENSHOT_INDEX.md`.
- Add mismatches to the gap list inside the illustrated guide so planners/executors can act.

## References
- `docs/System/forecasting-analytics_illustrated-guide.md`
- `docs/System/images/forecasting/`
- `uat-agent-tasks/10-29_18-40_INDEX_employee-portal.txt`
- `docs/SOP/illustrated-guide-workflow.md`
