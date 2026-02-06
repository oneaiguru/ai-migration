# Plan — Manager Portal Refactor (Wrappers)

## Goal
Replace Recharts usage with shared Chart.js wrappers while preserving current visuals/behavior (parity-first UAT), and add adapters/stories/tests.

## Inputs
- Decision: docs/System/DEMO_EXECUTION_DECISION.md
- Evidence: docs/System/DEMO_PARITY_INDEX.md, docs/System/PARITY_MVP_CHECKLISTS.md,
  docs/System/WRAPPER_ADOPTION_MATRIX.md, docs/System/CHART_COVERAGE_BY_DEMO.md

## Scope
- Dashboard
  - KpiCardGrid (KPI tiles)
  - BarChart (Team Coverage)
  - DoughnutChart (Request Distribution)
  - Recent Activity list (as ReportTable or keep simple list)
- Approvals
  - ReportTable (requests)
  - Dialog (approve/reject) with required-note toggle

## Tasks
1) Registrar + RU formatters (numbers/percent/date)
2) Adapters for each slot (dataKey, units, clamps, legend toggles, targets)
3) Swap Recharts to wrappers in Dashboard; keep layout and copy
4) Wire ReportTable + Dialog in Approvals
5) Storybook: baseline/toggles/targets/empty/error for KPI/Bar/Pie/Table/Dialog
6) Tests: adapters (keys/units/clamps), formatters, minimal rendering
7) UAT: run chart_visual_spec prompts; log unknowns (colors/dash/legend/clamps)

## Acceptance
- Stories build clean; tests pass; app build green
- Slots mapped with props in docs/System/WRAPPER_ADOPTION_MATRIX.md
- Behavioral parity captured in docs/Tasks/uat-packs/chart_visual_spec.md

## References
- Chart adapters: ${MANAGER_PORTAL_REPO}/src/adapters/dashboard.ts, ${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts
- Dashboard wrappers: ${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:38–81
- Approvals table/dialog: ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:88–205
