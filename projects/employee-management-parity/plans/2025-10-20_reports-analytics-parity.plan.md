# Plan: Phase 9 – Reports & Analytics Parity (Executor)

## Metadata
- Date: 2025-10-20
- Owner: Executor (frontend)
- Inputs: CH6_Reports.md; CH5_Schedule_Advanced.pdf; CH5_Schedule_Build.pdf; CH7_Appendices.md
- Internal Specs: docs/Tasks/phase-9-charts-*.md
- Wrappers: src/components/charts/*, src/utils/charts/*

## Objective
Refactor the Reports & Analytics demo to our chart wrappers and align visuals/labels with CH docs. Deliver stories/tests and update the doc mapping.

## Steps
1. Map reports → components
   - Work Time → LineChart + KpiCardGrid
   - Punctuality (daily/overall) → BarChart (toggle)
   - Coverage/Adherence → BarChart (toggle, stacked) + KpiCardGrid
   - Forecast Accuracy → LineChart (accuracy vs dashed target) + BarChart (MAPE)
   - Absenteeism → DoughnutChart + LineChart (if in scope)
   - T‑13/Payroll/Build Journal/Licenses → ReportTable
   - Record props (units, clamps, targets, toggles) in docs/Tasks/phase-9-charts-doc-mapping.md
2. Replace ad‑hoc charts with wrappers; use adapters/formatters
3. Add stories per report (baseline, targets/toggles, empty, error)
4. Add unit tests for any new adapter logic
5. Validate & handoff: build, storybook build, tests; update mapping doc and list unknowns for UAT

## Requirements
- RU labels/units; axis clamps (e.g., punctuality 80–100 %, coverage 70–100 %)
- Dashed target lines; view toggles (daily/overall; coverage/adherence)
- RU ticks/tooltips via shared registrar + formatters
- A11y: ariaTitle/ariaDesc, keyboardable toggles

## Acceptance
- Build/typecheck/tests green; stories render without console warnings
- Stories reflect CH screenshots/labels/clamps/targets/toggles
- Mapping doc updated; unknowns listed for UAT capture

## Out of Scope
- Forecasting algorithm back-end; data persistence for table reports

