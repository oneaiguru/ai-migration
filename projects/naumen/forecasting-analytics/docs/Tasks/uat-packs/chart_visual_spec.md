# UAT Pack — Chart Visual Spec (Forecasting)

## Focus
- TrendAnalysisDashboard confidence band + dual-axis legend (CH4 §4.2 figures 27, 28).
- Accuracy metrics RU formatting and error analysis toggles (CH4 §4.4 figures 60, 80).

## Steps
1. `/trends`: cycle Strategic/Tactical/Operational; confirm shaded confidence band, legend labels for secondary axis (`Отклонение, %`).
2. Mark anomaly via flag icon; verify entry appears in anomaly list with timestamp.
3. Export CSV; ensure download triggers (mock) and console clean.
4. `/accuracy`: verify KPI cards show RU formatting (comma separators, `%` spacing), toggles (По времени/По дням недели/По величине) switch bar charts.
5. Trigger validation run (mock) to observe status toast.

## 2025-10-31 Run Notes
- Strategic/Tactical/Operational tabs render seeded data immediately; confidence band + dual-axis legend visible on load. Anomaly flag adds entry to list (`TrendAnalysisDashboard.tsx:33-205`).
- Accuracy KPI deck uses RU commas/spacing; toggles rotate charts; validation toast appears (mock). Exports remain simulated per TODO in `forecastingApi.ts`.
- Evidence: `playwright-forecasting-trends-20251031.png`, `playwright-forecasting-accuracy-20251031.png` (Desktop tmp folder).
