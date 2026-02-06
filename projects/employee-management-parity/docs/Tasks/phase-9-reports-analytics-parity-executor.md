# Phase 9 – Reports & Analytics Parity (Executor)

## Goal
Refactor the Reports & Analytics demo to use our chart wrappers and align visuals/labels with CH docs. Deliver stories/tests and update the doc mapping.

## Inputs
- CH6_Reports.md; CH5_Schedule_Advanced.pdf; CH5_Schedule_Build.pdf; CH7_Appendices.md
- Our wrappers: `src/components/charts/*`, utils: `src/utils/charts/*`
- Phase 9 specs: `docs/Tasks/phase-9-charts-*.md`
- Reference demo: `replica/wfm/demos/reports-analytics/`

## Mapping (Doc → Component)
- Work Time trend → `LineChart` + `KpiCardGrid`
- Punctuality (daily/overall) → `BarChart` (toggle)
- Coverage/Adherence → `BarChart` (toggle, stacked) + `KpiCardGrid`
- Forecast Accuracy → `LineChart` (accuracy vs dashed target) + `BarChart` (MAPE)
- Absenteeism → `DoughnutChart` + `LineChart` (if in scope)
- T‑13 / Payroll / Build Journal / Licenses → `ReportTable`

## Requirements
- Labels/units in Russian; axis clamps (e.g., punctuality 80–100 %, coverage 70–100 %)
- Dashed target lines; daily/overall & coverage/adherence toggles
- RU locale ticks/tooltips via shared registrar + formatters
- A11y: `ariaTitle`/`ariaDesc`, focusable toggles

## Steps
1. Audit & map each report screen to a wrapper and props; record in `docs/Tasks/phase-9-charts-doc-mapping.md`.
2. Replace ad‑hoc Chart.js usage with wrappers; use adapters for datasets.
3. Add Storybook stories (baseline, targets/toggles, empty, error) per report.
4. Add unit tests for any new adapter logic (reuse formatters tests).
5. Update `docs/Tasks/phase-9-charts-doc-mapping.md` with final props; flag unknowns for UAT.

## Acceptance
- `npm run build` green; stories render without console warnings
- Stories reflect CH screenshots for labels/clamps/targets/toggles
- Unit tests pass for formatters/adapters
- Mapping doc updated; unknowns listed

## Out of Scope
- Forecasting algorithm back-end; table‑only reports’ data persistence

