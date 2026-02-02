# Phase 9 Task – Analytics Dashboard & Chart Integration (Tentative)

> **Status (2025-10-10):** Deferred. This task activates only after product selects the analytics-focused demo that will ship charting capabilities. Keep this document updated with research notes while the work remains parked.

## Background
- Placeholder UI lives at `src/components/PerformanceMetricsView.tsx:264-387`; it currently renders static metric cards and a dashed chart block promising future Chart.js integration.
- Discovery from 2025-10-10 (see `docs/Tasks/phase-7-charts-discovery.md:55-85`) inventoried Tremor, Recharts, and MiniSearch references alongside existing search/table behaviour.
- Component refactor (Plan 2025-10-12) reorganised employee list code under `src/components/EmployeeList/` with `useEmployeeListState.ts`; chart work should extend the new structure, not the deleted monolith.

## Scope (When Activated)
- Replace the placeholder card + chart section inside `PerformanceMetricsView` with a production-ready analytics dashboard.
- Decide between Tremor’s higher-level components and Recharts’ primitives (or combine them) based on the selected demo.
- Ensure data provenance: metrics must read from the agreed analytics data source (mock API, real backend, or state hook).
- Expand Storybook and documentation so charts, KPIs, and search interplay are fully demonstrated.
- Maintain Module parity expectations: Russian localisation, accessibility copy, keyboard nav, and testing parity with legacy references.

## Research Notes (from 2025-10-10 Discovery)
- **AI-Docs References**
  - `ai-docs/reference/snippets/tremor/performance-card.tsx:1-48` – KPI card with `ProgressBar` and embedded `AreaChart`.
  - `ai-docs/reference/snippets/recharts/basic-area-chart.tsx:1-44` – Gradient-filled area chart with responsive container and tooltips.
  - `ai-docs/reference/snippets/minisearch/basic-search.ts:1-29` – Fuzzy search with weighted fields, prefix matching, and Russian-language examples.
  - `ai-docs/llm-reference/AiDocsReference.md:1-52` – External review outlining chart/search expectations, Storybook updates, and testing requirements.
- **Current Implementation Notes**
  - Metric tiles already compute `performanceData` values (`PerformanceMetricsView.tsx:310-374`). Future charts should reuse this dataset to avoid divergence.
  - Search remains `includes`-based until MiniSearch integration lands; chart work must respect whatever indexing approach Phase 7 delivers.
- **Proposed Patterns**
  - Tremor provides consistent card layouts and built-in tooltips—good for KPI overview.
  - Recharts supports custom gradients/axes—useful if analytics demo needs bespoke styling or multi-series overlays.
  - MiniSearch integration may power dashboard-wide filtering (e.g., search-driven chart updates); design should consider shared state with the list view.
- **Testing Considerations**
  - Storybook stories for baseline and empty states with axe sweeps once charts mount without SSR issues.
  - Vitest utilities for data transformers (ensure dataset shape matches chart components) and MiniSearch adapters.
  - Playwright regression: verify search-driven filtering and tooltip accessibility; ensure virtualization still passes the “Employee list” suite.
- **Open Questions**
  - Data source: will analytics consume real backend data or remain mocked? Need to budget fetch/client transformations.
  - Accessibility: should we ship textual summaries of chart data for screen-reader parity?
  - Performance: do we benchmark 10k+ data points similar to virtualization tests, or cap at curated slices?

## Activation Checklist (To Be Completed Later)
- [ ] Product selects the chart-heavy demo (target Phase 9).
- [ ] Update PROGRESS.md and this document with activation date and chosen library stack.
- [ ] Planner authors `plans/YYYY-MM-DD_analytics-dashboard.plan.md` referencing this task and the 2025-10-10 discovery notes.
- [ ] Executor follows the plan, implements charts/search integration, updates Storybook/tests/docs, and logs results in `docs/SESSION_HANDOFF.md`.
- [ ] QA/UAT performs accessibility and performance validation (axe + benchmark scripts) before marking Phase 9 complete.

Keep adding research, links, or design decisions here so the Phase 9 planner inherits a single source of truth when the work resumes.
