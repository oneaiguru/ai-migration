# Demo Refactor Playbook (Wrappers + RU Registrar)

## Scope
Refactor a demo to shared chart wrappers without changing visuals until UAT.

## Steps
1) Add Chart.js registrar with date-fns RU locale
2) Add RU formatters (numbers/percent/date)
3) Define slots per screen (parity MVP) → map to wrappers (Line/Bar/Doughnut/KPI/Table)
4) Replace direct chart usage with wrappers; keep layout; add adapters
5) Add Storybook stories: baseline, toggles, targets, empty/error
6) Add unit tests for adapters/formatters
7) Validate: build/storybook/tests; record Unknowns (colors/dash/legend/clamps)

### Forecasting ↔ Analytics Cohesion
- Check `docs/Tasks/analytics-forecasting-overlap-discovery.md` for flows that should use shared forecasting modules.
- Prefer importing forecasting helpers/components from `@wfm/shared/forecasting` to keep demos in sync.
- Update reuse progress in the overlap discovery doc and existing UAT table rows (AD-1/2/3/4).

## Acceptance
- Stories render without console warnings
- Tests pass; build green
- Mapping doc updated with slots + props (see docs/System/WRAPPER_ADOPTION_MATRIX.md)

---
## Manager Portal Demo – Refactor Notes

- Engine: Recharts (src/pages/Dashboard.tsx:2)
- Screens/slots (parity MVP):
  - Dashboard: KPI tiles (src/pages/Dashboard.tsx:90), Team Coverage bar (src/pages/Dashboard.tsx:126), Request Distribution pie (src/pages/Dashboard.tsx:143), Recent Activity list (src/pages/Dashboard.tsx:167)
  - Approvals: Request list (src/pages/Approvals.tsx:260), Review dialog (src/pages/Approvals.tsx:31), Priority filters (src/pages/Approvals.tsx:228)
  - Teams: Sort + Team Detail modal (src/pages/Teams.tsx:155, src/pages/Teams.tsx:236)

- Proposed wrappers mapping:
  - Bar → BarChart (unit=percent; clamp=70–100; dataKey=coverage) [CH5 §5.2]
  - Pie → DoughnutChart (unit=percent; labels=percent; legend=true) [CH5 §5.4]
  - KPI → KpiCardGrid (items=4; trend arrows) [CH5 §5.3]
  - List/Table → ReportTable (Approvals) [CH6 §6.7]
  - Dialog → Dialog (approve/reject; requireNoteOnReject=true) [CH6 §6.7]

- Refactor plan:
  1) Define slots + props in docs/System/WRAPPER_ADOPTION_MATRIX.md
  2) Add registrar/formatters (RU numbers/percent/date) to align with CH5
  3) Create lightweight adapters for Recharts → wrappers while preserving current layout
  4) Add stories: KPI, Bar, Pie, Approvals list/dialog (baseline/toggles/empty/error)
  5) Unit tests for adapters (dataKey=coverage, percent labels)
  6) Validate and capture unknowns (colors/legend/clamps) via chart_visual_spec UAT
---
## Analytics Dashboard Demo – Refactor Notes

- Engine: Chart.js via CDN in static HTML (index.html:10; advanced-charts.html:10)
- Screens/slots (parity MVP):
  - KPI Overview: KPI deck (index.html:418), Line trend (index.html:427), DepartmentPerformance table (index.html:275), Live status (index.html:432)
  - Advanced Charts: Gauges (advanced-charts.html:313), Heatmap (advanced-charts.html:54), Radar (advanced-charts.html:171), Trend Analysis (advanced-charts.html:240)

- Proposed wrappers mapping:
  - Line → LineChart (units=calls/percent; area; legend toggles) [CH6 §6.4]
  - Doughnut (gauge) → DoughnutGauge (circumference=180; rotation=270; center labels) [CH6 §6.3]
  - Heatmap → HeatmapChart (x=hour; y=weekday; unit=percent) [CH6 §6.4]
  - Radar → RadarChart (legend=bottom; dashed target) [CH6 §6.4]
  - Table → ReportTable (dept matrix) [CH6 §6.2]
  - KPI → KpiCardGrid [CH6 §6.3]

- Refactor plan:
  1) Extract inline React/Chart.js into React components using shared wrappers
  2) Add registrar/formatters (RU date/number) and replace hardcoded EN formats
  3) Map each slot in WRAPPER_ADOPTION_MATRIX with props (units/clamps/targets)
  4) Add stories for Line/Gauge/Heatmap/Radar/Table and KPI deck
  5) Add unit tests for adapters and number/date formatters
  6) Validate and capture unknowns via chart_visual_spec UAT
---
## WFM Employee Portal – Refactor Notes

- Engine: React + Vite; no chart engine.
- Screens/slots (parity MVP):
  - Dashboard: stat cards (totals/pending/approved/upcoming) (src/pages/Dashboard.tsx:105, :115, :125, :135); vacation balance widget (src/pages/Dashboard.tsx:150); recent requests list (src/pages/Dashboard.tsx:216)
  - Vacation Requests: Filter tabs (src/pages/VacationRequests.tsx:169–172); requests list (src/pages/VacationRequests.tsx:201); New Request modal (src/pages/VacationRequests.tsx:276–383)
  - Profile: tabs + editable fields + emergency contact (src/pages/Profile.tsx:156–158, :183, :199, :215, :247–294)

- Proposed wrappers mapping:
  - ReportTable (requests list) [CH6 §6.2]
  - Dialog + FormField (new request modal) [CH6 §6.7]
  - FilterGroup (status tabs) [CH6 §6.1]
  - FormField (profile fields) [Appendix 1 #3/#4]

- Refactor plan:
  1) Define table columns and field schemas; wire RU locale formatters for dates/numbers
  2) Replace bespoke lists with ReportTable; modals with Dialog + FormField
  3) Keep layout; focus on behavior parity (filters, submit, RU formats)
  4) Add stories for forms/table/dialog; tests for validation and RU formats
  5) Validate and capture unknowns (copy/validation/masks)
