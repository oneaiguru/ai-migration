# Plan — Analytics Dashboard Extraction (to Wrappers)

## Goal
Extract static HTML + inline React/Chart.js into React components using shared wrappers; implement/patch MVP visuals; add RU locales; defer non‑MVP with notes.

## Inputs
- Decision: docs/System/DEMO_EXECUTION_DECISION.md
- Evidence: docs/System/DEMO_PARITY_INDEX.md, docs/System/PARITY_MVP_CHECKLISTS.md,
  docs/System/WRAPPER_ADOPTION_MATRIX.md, docs/System/CHART_COVERAGE_BY_DEMO.md

## Scope (MVP)
- KPI Overview: KPI deck, Line trend, DepartmentPerformance table, Live Status
- Advanced: Gauges (doughnut), Heatmap, Radar, Trend Analysis

## Tasks
1) Componentize index.html and advanced-charts.html into React views
2) Add Chart.js registrar and RU formatters (date/number)
3) Map slots → wrappers; define adapters and props (units/clamps/toggles/targets)
4) Implement MVP visuals (Line, DoughnutGauge, Table); patch Heatmap/Radar if wrappers exist or mark deferred with rationale
5) Stories: Line/Gauge/Heatmap/Radar/Table (+ KPI grid)
6) Tests: adapters + formatters
7) UAT: run chart_visual_spec; log unknowns; update wrapper matrix

## Acceptance
- Views render with wrappers; stories/tests/build green
- docs/System/WRAPPER_ADOPTION_MATRIX.md updated with props + CH refs
- Unknowns and any deferrals recorded with evidence and rationale

## References
- Engine CDN: index.html:10; advanced-charts.html:10
- Trend line: index.html:427; Department table: :275
- Gauges: advanced-charts.html:313; Heatmap: :54; Radar: :171; Trend: :240
