# Wrapper Adoption Matrix — Forecasting & Analytics

| Area | Component | Wrapper | Status | Notes |
| --- | --- | --- | --- | --- |
| Trends | `TrendAnalysisDashboard.tsx` | `<LineChart />`, `<BarChart />` | ✅ | Confidence band + secondary axis legend wired through adapter `src/adapters/forecasting/trends.ts`. |
| Accuracy | `AccuracyDashboard.tsx` | `<KpiCardGrid />`, `<ReportTable />`, `<LineChart />` | ✅ | RU formatted KPIs, error analysis toggles, export actions. |
| Build | `BuildForecastWorkspace.tsx` | `<ReportTable />` | ✅ | Parity queue tree, dual history/forecast controls, CSV import/export backed by fixtures/service stubs. |
| Exceptions | `ExceptionsWorkspace.tsx` | `<ReportTable />` | ✅ | Mixed day/interval editor with smoothing sliders + CSV export replicates prod flow. |
| Absenteeism | `AbsenteeismWorkspace.tsx` | `<ReportTable />` | ✅ | Template list plus calculator workflow outputs scenario table; API wiring pending but wrapper parity met. |
| Adjustments | `ManualAdjustmentSystem.tsx` | `<ReportTable />` | ✅ | Undo/redo, validation statuses, API-ready payloads. |
