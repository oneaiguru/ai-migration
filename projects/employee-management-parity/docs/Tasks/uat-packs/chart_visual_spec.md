# UAT Pack – Chart Behavior Spec (Live)

## Manager Portal Demo – Charts to Measure

Use the active deploy for the relevant demo from `docs/Tasks/post-phase9-demo-execution.md` before running this pack.

- Dashboard → Team Coverage (Bar)
  - Evidence: src/pages/Dashboard.tsx:126
  - Capture (behavior only): axis label format (RU), tooltip content (RU values), y-axis clamp (percent range sensible per CH5), interaction responsiveness
  - Legend copy/placement: confirm present/absent

- Dashboard → Request Distribution (Pie)
  - Evidence: src/pages/Dashboard.tsx:143
  - Capture (behavior only): label formatter (percent rounding), tooltip content, legend presence/placement, interaction responsiveness

Record behavioral notes back into wrapper mapping (docs/System/WRAPPER_ADOPTION_MATRIX.md) and CH mapping (docs/Reference/CH5_Scheduling_UAT_Notes.md). Ignore color/dash/style.

- For Scheduling (Phase 9), visual parity (colors/dash/style) is out‑of‑scope. Validate behavior only.
- Capture 3–5 screenshots per screen (coverage/adherence/filters/empty/error) to evidence behavior.
- Paste notes into the mapping doc for the demo (e.g., CH5_chart_mapping.md) and update docs/Reference/CH5_Scheduling_UAT_Notes.md if needed.
## Analytics Dashboard Demo – Charts to Measure

- KPI Overview → Call Volume Trend (Line)
  - Evidence: `${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:18`
  - Result: ✅ Area fill + RU tooltips confirmed (`value → formatWithUnit`, `time → formatTime`); y-axis clamp currently auto, acceptable for MVP.

- KPI Overview → DepartmentPerformance (Table)
  - Evidence: `${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:26`
  - Result: ✅ RU numerics render via `formatNumber`; progress bars mirrors CH6 layout (visual parity frozen).

- Advanced → Gauges (Doughnut)
  - Evidence: `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:16`
  - Result: ✅ Semi-circle (circumference 180, rotation 270) confirmed; center label uses `formatPercent`.

- Advanced → Heatmap
  - Evidence: `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:29`
  - Result: ✅ Colour intensity scales 0–100%; tooltip string `Нагрузка: xx%` verified.

- Advanced → Radar
  - Evidence: `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:37`
  - Result: ✅ Legend bottom, dashed target series present.

- Advanced → Trend Analysis (Dual-axis Line)
  - Evidence: `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:51`
  - Result: ✅ Dual-axis (percent + CSAT) renders with dashed targets; right axis clamps 0–5, left axis 70–100; smoothing toggle verified (legend items for confidence band hidden).

- Advanced → Trend toolbar adjustments
  - Evidence: `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:69`
  - Result: ✅ Buttons adjust targets ±1% / ±0.1 and reset; smoothing averages neighbours per spec.

- Absenteeism → Observed vs Forecast (Line)
  - Evidence: `${ANALYTICS_REPO}/src/features/analytics/AbsenteeismPanel.tsx:48`
  - Result: ✅ Both series render with RU labels; clamp 0–25; delta banner matches seeded mocks.

- Forecast Builder → Result chart (Line + band)
  - Evidence: `${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:101`
  - Result: ✅ History + forecast + shaded confidence band; tooltip formatting RU count; screenshot `e2e/artifacts/forecast-build.png`.

- Forecast Builder → Result table (ReportTable)
  - Evidence: `${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:109`
  - Result: ✅ RU month labels (toLocaleDateString), Δ matches difference vs last actual.

- Reports panel → CSV cards
  - Evidence: `${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:67`
  - Result: ✅ Report metadata table renders; CSV button triggers blob download (Playwright asserts `.csv` filename and captures card screenshot `e2e/artifacts/reports-card.png`).
## WFM Employee Portal – Charts to Measure

 - No charts in this demo. Skip visual spec; focus on forms/tables/requests behavior in other UAT packs.

Unknowns for UAT (forms/tables)
- Field formats: confirm phone mask and date input constraints (Profile emergency contact phone; birthDate min/max) — src/pages/Profile.tsx:273, :215
- Validation: required fields and error messaging for New Request (type/start/end), and Profile edits — src/pages/VacationRequests.tsx:289, :309, :321; src/pages/Profile.tsx:183, :199, :215
- RU formatting consistency: dates across Dashboard/Requests/Profile (toLocaleDateString('ru-RU')) — src/pages/Dashboard.tsx:62; src/pages/VacationRequests.tsx:119, :124; src/pages/Profile.tsx:41
- Wording: verify copy in headers/buttons is final (e.g., “Новая заявка”, “Отмена”, “Подать заявку”, “Экстренная заявка”) — src/pages/VacationRequests.tsx:162, :376, :383, :366

## Forecasting & Analytics Demo – Charts to Measure

Reference: `docs/System/forecasting-analytics_illustrated-guide.md` (chart/ table captures) and `uat-agent-tasks/forecasting-illustrated-quick-sheet.md` (step-by-step log).

- Accuracy Dashboard → Forecast vs Fact (Line)
  - Evidence: ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/AccuracyDashboard.tsx:80
  - Capture: RU tooltip formatting; verify secondary-axis legend copy once KPI percent overlays added.

- Trend Dashboard → Dual-axis trend (Line)
  - Evidence: ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:33-160
  - Capture: primary vs secondary axis labels, anomaly markers, target lines, confidence band shading.

- Trend Dashboard → Seasonality Bars (Bar)
  - Evidence: ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:110
  - Capture: RU hour labels, tooltip percentages, clamp behaviour.

- Manual Adjustments → Adjustment accuracy chart (if present)
  - Evidence: ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ManualAdjustmentSystem.tsx:150
  - Capture: selection pill states + undo/redo feedback; confirm aria labels on `ReportTable` summary. Analytics variant lacks validation badges (`${ANALYTICS_REPO}/src/features/forecasting/AdjustmentsPanel.tsx:27-112`) — document gap if still missing.

- Reports → Download feedback (CSV/XLSX/PDF)
  - Evidence: ${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:15-86, `${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/reports/index.ts:1-110`
  - Capture: format dropdown selection + bell notification once hooked up; tie back to shell parity.

Record findings in wrapper matrix + Code Map; add screenshots `playwright-forecasting-accuracy.png`, `playwright-forecasting-trend.png`, `playwright-forecasting-adjustments.png`, plus context captures for `/build`, `/exceptions`, `/absenteeism` as needed.
