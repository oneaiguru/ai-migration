# Forecasting & Analytics — Illustrated Parity Guide

This guide connects the real Naumen **Прогнозы** module to the two demos we maintain:
- **Analytics Dashboard** (`${ANALYTICS_REPO}`) — refactor-first slice that currently surfaces forecasting features in a lightweight shell.
- **Forecasting & Analytics Demo** (`${FORECASTING_ANALYTICS_REPO}`) — richer workspace that already mirrors most production behaviours.

Each module section follows the same structure:
- **Manual reference** — where the production behaviour is defined.
- **Production capture** — screenshot(s) staged in `docs/System/images/forecasting/`.
- **Demo implementation** — file:line references for both demos.
- **Parity actions** — concrete follow-ups needed to match the production experience.

Use the UAT quick sheet (`uat-agent-tasks/forecasting-illustrated-quick-sheet.md`) for condensed walkthrough steps after reviewing the detailed context below.

---

## Shell / Navigation (CH2 §2.2)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md:20` — Start page shows module tabs, organisation selector, status indicator, and notifications bell for report downloads.

**Production capture**
![Shell header and status](images/forecasting/real-naumen_shell_header-status.png)

**Demo implementation**
- Analytics shell now mirrors the production header copy, online badge, and notifications bell with live counts (`${ANALYTICS_REPO}/src/App.tsx:18-112`).
- Forecasting demo renders the full tab router for `/build`, `/exceptions`, `/trends`, `/absenteeism`, `/accuracy`, `/adjustments` with breadcrumb banner and status copy (`${FORECASTING_ANALYTICS_REPO}/src/App.tsx:7-92`).

**Parity status**
- ✅ Refresh badge + report notifications implemented in analytics.
- ◻️ Breadcrumb banner still only lives in forecasting; porting to analytics remains optional polish.

---

## Build Forecast (CH4 §4.1)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:11` — Queue tree with favourites/search.
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:15` — Separate historical horizon vs build period controls with **Day/Interval** toggle.
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:17` — Upload buttons for forecast, actual, and absenteeism templates.
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:19` — Build banner summarising next actions.

**Production capture**
![Header and queue tree](images/forecasting/real-naumen_build-forecast_header-queue-tree.png)
![Queue selection](images/forecasting/real-naumen_build-forecast_queue-selection.png)
![History / period selectors](images/forecasting/real-naumen_build-forecast_date-range.png)
![Absenteeism options](images/forecasting/real-naumen_build-forecast_absenteeism-options.png)
![File import buttons](images/forecasting/real-naumen_build-forecast_import-buttons.png)
![Multi-horizon list](images/forecasting/real-naumen_build-forecast_multi-horizon.png)
![Selection summary](images/forecasting/real-naumen_build-forecast_selection-summary.png)
![Operations banner](images/forecasting/real-naumen_build-forecast_summary-banner.png)
![Confirmation toast](images/forecasting/real-naumen_build-forecast_confirmation.png)

**Demo implementation**
- Analytics builder now includes queue tree with favourites/search, multi-horizon cards, day/interval toggle, absenteeism value/profile selector, template import/export, summary banner, and confirmation toast (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:116-607`).
- Queue data now streams from the shared helper with loading/error states before selection is enabled (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:165-195`, `${ANALYTICS_REPO}/src/features/forecasting/ExceptionsWorkspace.tsx:75-99`).
- Shared services expose deterministic data factories, horizons, queue tree metadata, and summary builders (`${ANALYTICS_REPO}/src/types/shared-forecasting-runtime.ts:1-420`).
- Forecasting demo continues to host the richer workspace (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/build/BuildForecastWorkspace.tsx:40-200`, `:168-183`).

**Parity status**
- ✅ Queue selection, multi-horizon controls, absenteeism selector, template flows, and summary banner match production.
- ✅ Confidence table expanded with RU-formatted accuracy metrics.
- ◻️ Backend-backed uploads still stubbed pending API integration.

---

## Set Exceptions (CH4 §4.2)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:50` — Day/Interval toggle controlling historical horizon and build period.
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:54` — Adding multiple intervals for holiday scenarios.

**Production capture**
![Day vs interval](images/forecasting/real-naumen_exceptions_day-interval-toggle.png)
![Period builder](images/forecasting/real-naumen_exceptions_period-builder.png)
![Templates grid](images/forecasting/real-naumen_exceptions_templates-grid.png)

**Demo implementation**
- Analytics exceptions workspace now includes queue tree picker, period builder, import/export buttons, and applied-template summary with CSV export (`${ANALYTICS_REPO}/src/features/forecasting/ExceptionsWorkspace.tsx:38-286`).
- Forecasting demo continues to provide API-backed persistence (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:1-200`).
- Shared helpers supply deterministic templates and impact summaries (`${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/exceptions/index.ts:1-140`).

**Parity status**
- ✅ Queue selection, period builder, and template import/export flows land in analytics.
- ◻️ Persisting custom templates beyond session still depends on future API wiring.

---

## Trend Analysis (CH4 §4.2)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:52` — Strategic/Tactical/Operational tabs, equal-period selector, Σ overlays.

**Production capture**
![Strategic charts](images/forecasting/real-naumen_trends_strategic-charts.png)
![Tactical table](images/forecasting/real-naumen_trends_tactical-table.png)
![Operational grid](images/forecasting/real-naumen_trends_operational-grid.png)
![Σ overlay + SL target](images/forecasting/real-naumen_trends_sigma-overlay.png)

**Demo implementation**
- Analytics dashboard now renders strategic/tactical/operational tables with equal-period selector in addition to charts and toolbar (`${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:1-176`).
- Forecasting demo remains the reference for manual edit flows (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:1-222`).

**Parity status**
- ✅ Equal-period control and tactical/operational tables available in analytics.
- ◻️ Σ overlay and strategic narrative still differ slightly (secondary axis kept for CSAT); document during final polish if required.

---

## Absenteeism Calculation (CH4 §4.3)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:131` — Interval toggle, rule templates, history table, apply/download/edit actions.

**Production capture**
![Interval toggle and banner](images/forecasting/real-naumen_absenteeism_interval-toggle.png)
![History table](images/forecasting/real-naumen_absenteeism_history-table.png)
![Template edit dialog](images/forecasting/real-naumen_absenteeism_template-edit.png)

**Demo implementation**
- Analytics absenteeism workspace now shows run history with status badges plus editor dialog parity (`${ANALYTICS_REPO}/src/features/forecasting/AbsenteeismWorkspace.tsx:24-240`).
- Forecasting demo continues to host API-backed persistence (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:1-210`).

**Parity status**
- ✅ Run history table and status badge mapping delivered in analytics.
- ◻️ API persistence remains a future integration task.

---

## Manual Adjustments (CH4 Appendix)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:143` — Summary banner showing warnings/errors after adjustments.

**Production capture**
![Adjustment grid](images/forecasting/real-naumen_adjustments_grid.png)
![Summary banner](images/forecasting/real-naumen_adjustments_summary.png)

**Demo implementation**
- Analytics adjustments panel now surfaces validation badges/tooltips and row highlighting alongside existing undo/redo + Σ counters (`${ANALYTICS_REPO}/src/features/forecasting/AdjustmentsPanel.tsx:12-126`).
- Forecasting demo continues to handle persistence via services (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ManualAdjustmentSystem.tsx:27-210`).

**Parity status**
- ✅ Validation badges and tone-aware tooltips match production behaviour.
- ◻️ Persistence beyond session remains follow-up work with shared services.

---

## Accuracy & Forecast Viewing (CH4 §4.4)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md:151` — Forecast vs fact charts, tables with absolute/relative deviations, absenteeism impact, export buttons.

**Production capture**
![Detailed table](images/forecasting/real-naumen_accuracy_detailed-table.png)
![KPI deck](images/forecasting/real-naumen_accuracy_kpis.png)
![Error chart](images/forecasting/real-naumen_accuracy_error-chart.png)
![Results table](images/forecasting/real-naumen_accuracy_results-table.png)

**Demo implementation**
- Analytics forecast builder now displays the full accuracy table (absolute/relative deltas, absenteeism %, lost calls %, SL, AHT) with RU formatting (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:575-605`, `${ANALYTICS_REPO}/src/types/shared-forecasting-runtime.ts:1100-1185`).
- Accuracy dashboard fetches shared detail rows and renders the `ReportTable` view with RU deltas plus CSV export via shared helpers (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/AccuracyDashboard.tsx:150-320`, `${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/accuracy.ts:1-220`).
- Export notifications bubble through the header bell via the new report download queue (`${ANALYTICS_REPO}/src/services/forecasting.ts:1-40`, `${ANALYTICS_REPO}/src/App.tsx:18-112`).

**Parity status**
- ✅ Expanded accuracy table now mirrors production columns (forecast/fact/Δ/absenteeism/lost calls/SL/AHT) and the accuracy dashboard exposes the same detail grid with RU formatting.
- ✅ KPI cards and error analysis now render with Russian locale decimals (comma separators) via shared helpers.
- ✅ Report downloads raise notifications in analytics shell.

---

## Reports (CH6 §§6.1–6.4)

**Manual reference**
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH6_Reports.md:5` — Default catalogue of reports (T-13, Work Schedule, Payroll, etc.).
- `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH6_Reports.md:15` — Notification bell workflow for completed downloads.

**Production capture**
![Reports catalogue](images/forecasting/real-naumen_reports_catalogue.png)
![Export dialog](images/forecasting/real-naumen_reports_export-dialog.png)

**Demo implementation**
- Analytics reports hub lists the full shared catalogue with per-report format selectors and CSV export stub (`${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:15-86`, `${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/reports/index.ts:1-110`).
- Forecasting demo references the same report definitions when linking out of the workspace (`${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ForecastingLayout.tsx:60-118`).

**Parity actions**
- Replace the CSV-only downloader with multi-format (CSV/XLSX/PDF) handling that echoes `buildReportFilename` outputs and triggers shell notifications.
- Document RU filename patterns (`forecast-summary_YYYY-MM-DD.xlsx`) and ensure both demos honour them.
- Add UAT evidence linking the downloads queue to the header bell parity action noted earlier.

---

## Quick Reference for UAT Agents

Use this list *after* reading the detailed sections above. For each step, compare the demo with the production capture and log results in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` (AD or FA rows as appropriate). The slimmed checklist lives at `uat-agent-tasks/forecasting-illustrated-quick-sheet.md`.

1. **Shell** — Confirm header copy, status indicator, and downloads bell (Screenshot: Shell header and status). Log in AD-Overview.
2. **Build Forecast** — Queue tree, Day/Interval toggle, absenteeism options, uploads, selection summary, banner, and confirmation toast (Screenshots listed above). Record in AD-1/FA-Build.
3. **Set Exceptions** — Toggle + period builder + template grid; confirm applied-count summary (Exceptions screenshots). Record in AD-2/FA-Exceptions.
4. **Trend Analysis** — Strategic/Tactical/Operational views, Σ overlay, period tables (Trend screenshots). Record in AD-3/FA-Trends.
5. **Absenteeism** — Interval toggle, run history, template editor (Absenteeism screenshots). Record in FA-Absenteeism row.
6. **Manual Adjustments** — Grid controls, undo/redo, warning/error badges (Adjustments screenshots). Record in FA-Adjustments row.
7. **Accuracy & Forecast Viewing** — KPI deck, full deviation table, exports (Accuracy screenshots). Record in AD-4/FA-Accuracy.
8. **Reports** — Full catalogue, format dropdown, RU filename + notification (Reports screenshots). Record in AD-Reports.

Refer back to the quick sheet for navigation order, expected console output, and screenshot aliases.

---

_Last updated: 2025-10-31_
