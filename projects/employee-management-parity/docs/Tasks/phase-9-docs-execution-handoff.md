# Phase 9 – Execution Handoff (from Docs/Coordinator)

Purpose: Convert report evidence into implementation plans per demo. This task is for the next agent (Executor/Planner), not the Docs/Coordinator.

Inputs
- Reports: `docs/System/*.md` (DEMO_PARITY_INDEX, PARITY_MVP_CHECKLISTS, WRAPPER_ADOPTION_MATRIX, CHART_COVERAGE_BY_DEMO, APPENDIX1_SCOPE_CROSSWALK)
- UAT packs: `docs/Tasks/uat-packs/*`
- SOP: `docs/SOP/demo-refactor-playbook.md`

Decisions
- Pick parity‑first vs refactor‑first per demo based on reuse slots and engine risk.

Checklist per Demo
- Manager Portal (Recharts)
  - Approach: refactor‑first (map Recharts views to shared wrappers or keep Recharts and build adapters)
  - Produce plan file with slots → wrappers + props (from WRAPPER_ADOPTION_MATRIX)
  - Validate with stories/tests; capture unknowns (colors/legend/clamps)
- Analytics Dashboard (Chart.js CDN)
  - Approach: extraction plan (convert inline React/Chart.js → React components using wrappers)
  - Define registrar/formatters (RU) and map advanced visuals (gauge/heatmap/radar)
  - Validate with stories/tests; capture unknowns
- WFM Employee Portal (no charts)
  - Approach: parity‑first for forms/tables; gradually introduce Dialog/FormField/ReportTable wrappers
  - Define validation and RU formats; implement minimal schemas; add tests

Acceptance
- Per‑demo execution plan added under `plans/YYYY-MM-DD_<demo>-execution.plan.md`
- Risks/unknowns listed; validation commands specified
