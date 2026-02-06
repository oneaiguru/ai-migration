# Analytics Dashboard — Manual Navigation Crosswalk

Use this script when validating the analytics dashboard demo independently of the forecasting app. It walks through every surface that changed in the shared forecasting extraction (Phase 2), maps each step to the Naumen manuals, and points to code/Playwright evidence so UAT can log findings quickly.

## Quick Facts
- **Deploy:** https://analytics-dashboard-demo-pfnjtriy6-granins-projects.vercel.app
- **Repo alias:** `${ANALYTICS_REPO}` (analytics dashboard refactor-first demo)
- **Shared module:** `${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/*`
- **UAT packs:** `docs/Tasks/uat-packs/parity_static.md`, `docs/Tasks/uat-packs/chart_visual_spec.md`
- **Screenshot aliases:** see `docs/Tasks/screenshot-checklist.md` (new Playwright captures at `${ANALYTICS_REPO}/e2e/artifacts/`)

## Step-by-Step Walkthrough

### 1. Launch & Header (Manual: CH2_Login_System.md §2.2)
1. Open the deploy URL; confirm the purple header (`WFM — прогнозы и аналитика`) and organisation selector render without errors.<br>Evidence: `src/App.tsx:8`.
2. Switch the organisation selector to another option and back (no state errors expected). Log any mismatch in `AD-1` inside `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`.

### 2. Analytics Tab (Manual: CH4_Forecasts.md §§4.2–4.4; CH6_Reports.md §6.1)
1. **KPI Grid:** Verify six KPI cards show value/target/trend badges. Hover or tab through to ensure focus styles appear (a11y). Code: `src/features/analytics/KpiOverview.tsx`.<br>Screenshot alias: `analytics_kpi_grid`.
2. **Live Status:** Check the live status panel updates timestamp. Evidence: `src/features/analytics/LiveStatus.tsx`.
3. **Advanced Analytics trend:**
   - Use toolbar buttons (smoothing toggle, SL ±1 %, CSAT ±0.1) and confirm legend updates. Dataset comes from shared `generateTrendDataset()`.
   - Manual tie-in: CH4 §4.2 (trend inspection). Code: `src/features/analytics/AdvancedAnalytics.tsx:44`, shared generator `src/modules/forecasting/trends/index.ts`.
   - Playwright snapshot: `e2e/artifacts/trend-analysis.png` (alias `analytics_trend_dual_axis`). Ensure legend swatches match the expected colours below.

   | Legend Label | Expected Colour | Axis | 
   | --- | --- | --- |
   | Прогноз | #2563EB (primary) |
   | Факт | #22C55E (primary) |
   | CSAT | #F97316 (secondary) |
   | Цель SL | #EF4444 (primary dashed) |
   | Цель CSAT | #10B981 (secondary dashed) |

4. **Seasonality & anomalies:** Scroll down to the new seasonality table and anomalies list. Confirm seven weekdays populate, and at least three anomaly rows appear (Manual CH4 §4.3). Evidence: `src/features/analytics/AdvancedAnalytics.tsx:112`.
5. **Absenteeism panel:** Confirm line chart + reason table load after a short spinner. Shared API: `runAbsenteeismSnapshot()` from `src/services/forecasting.ts`.

### 3. Forecasting Workspace (Manual: CH4_Forecasts.md §§4.1, 4.3; Appendix 1)
Switch to the “Прогнозы” module—the workspace uses shared helpers for every sub-tab.

#### 3.1 Builder (`Построение прогноза` tab)
- Press “Построить прогноз”; confirm chart and table appear with confidence band. Chart data rely on `runForecastBuild()` (shared service). Code: `src/features/forecasting/ForecastBuilder.tsx`.
- Verify Playwright artifact `forecast-build.png` (alias `analytics_forecast_builder`).

#### 3.2 Exceptions (`Исключения` tab)
- Toggle at least two templates and ensure the “Прогноз с исключениями” chart updates. Summary table should list applied template count and deltas.<br>Shared logic: `applyExceptionTemplates()` and `summariseExceptionImpact()` in `${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/exceptions/index.ts`.
- Playwright artifact: `forecast-exceptions.png` (alias `analytics_forecast_exceptions`).

#### 3.3 Absenteeism Profiles (`Профили абсентеизма` tab)
- Click “Дублировать” for the first profile; a `(копия)` suffix should appear. No persistence beyond session is expected (stub data).
- Optional: open “Новый профиль”, adjust fields, and cancel to confirm form closes cleanly.
- Shared logic: `loadAbsenteeismProfiles()` / `duplicateAbsenteeismProfile()` (`src/modules/forecasting/absenteeism/index.ts`).

#### 3.4 Manual Adjustments (`Ручные корректировки` tab)
- Use `+10%` bulk button, then `+5%`/`-5%` row adjustments, and check summary counters (Σ positive/negative, warnings, errors) update. Undo/redo buttons should revert changes.
- Playwright artifact: `forecast-adjustments.png` (alias `analytics_manual_adjustments`).
- Shared logic: `createAdjustmentSession()`, `applyAdjustment()`, `summariseAdjustments()` (`src/modules/forecasting/adjustments/index.ts`).

### 4. Reports Tab (Manual: CH6_Reports.md §§6.1–6.4)
1. Confirm every report card (Forecast Summary, Exceptions, Work Schedule, T‑13, etc.) lists parameters drawn from `listReportDefinitions()` (`src/modules/forecasting/reports/index.ts`).
2. Use the format dropdown (CSV/XLSX/PDF where available) and click “Скачать”. Filenames follow `buildReportFilename()`; downloads are mocked locally but should produce the requested extension. Playwright asserts this with the regex update.
3. Capture screenshot alias `analytics_reports_card` (artifact `reports-card.png`).

## Evidence & Logging Checklist
| UAT Item | Where to log | Evidence | Notes |
| --- | --- | --- | --- |
| Dual-axis trend colours & legend | `AD-2` (chart_visual_spec.md) | `trend-analysis.png`, legend table above | Ensure primary/secondary axes labels show `data-axis` attributes. |
| Forecast builder confidence band | `AD-1` (parity_static.md) | `forecast-build.png` | Compare table columns to CH4 §4.1. |
| Exceptions summary & applied count | `AD-3` | `forecast-exceptions.png` | Record delta percentages; note templates toggled. |
| Manual adjustments undo/redo | `AD-4` | `forecast-adjustments.png` | Mention warning/error badge counts after bulk apply. |
| Reports format options | `AD-4` | `reports-card.png` | Capture selected format vs. download extension. |

## Reminders for the UAT Agent
- Use the shared prompt file `uat-agent-tasks/analytics-dashboard_s01_m01_20251029-1840.md` if you need a fresh ChatGPT agent run; update `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` with findings (no new IDs).
- Keep screenshot aliases aligned with `docs/Tasks/screenshot-checklist.md` so Playwright artifacts remain authoritative.
- If any behaviour diverges from CH4/CH6 manuals, flag severity in the UAT log and cross-link to the shared module file/line noted above for developers.
