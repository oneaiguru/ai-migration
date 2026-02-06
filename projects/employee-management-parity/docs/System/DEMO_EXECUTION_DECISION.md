# Demo Execution Decision – Parity vs Refactor

> Date: 2025-10-20
>
> Purpose: Pick execution lane per demo based on current facts (engine, reuse slots, risks). Use this to queue plans and staff work in parallel.

| Demo | Engine | Est. Reuse % | Key Risks | Recommendation | Rationale | Next Plan |
| --- | --- | --- | --- | --- | --- | --- |
| Manager Portal | Recharts (src/pages/Dashboard.tsx:2) | ~60% | Engine mismatch (Recharts vs Chart.js wrappers), colours/legend/clamps TBD | Refactor‑first | Wrappers cover KPI/Bar/Pie + Approvals table/dialog; replacing Recharts/adapters now reduces future rework | Plan: manager-portal-refactor → swap to Chart.js wrappers, add adapters/stories/tests |
| Analytics Dashboard | Chart.js CDN + inline React/Babel (index.html:10) | ~50% | Extraction complexity; Heatmap/Radar wrapper gaps; RU locales missing | Refactor‑first | Extract to React components using wrappers; implement/patch non‑MVP visuals or defer | Plan: analytics-extraction → componentize views, wire wrappers/locales, define deferrals |
| WFM Employee Portal | React + Vite | ~85% | Validation rules/masks unknown; error copy; cards→table normalization | Parity‑first | High reuse of ReportTable/Dialog/FormField/FilterGroup; wire behaviours/validations with minimal churn | Plan: portal-parity → behaviours/validation wiring, UAT forms flow |

> Notes: “Reuse %” derived from slot coverage in `docs/System/PARITY_MVP_CHECKLISTS.md`. Defer non‑MVP visuals to Phase 9 follow‑ups where needed.

