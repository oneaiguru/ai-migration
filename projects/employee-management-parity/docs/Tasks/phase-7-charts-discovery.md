# Phase 7 – Charts & Search Discovery (Scout Instructions)

> Run this task while `plans/2025-10-12_employee-list-refactor.plan.md` executes. Stay read-only—do not touch `src/components/EmployeeList/` or any files the executor may edit.

## Goal
Collect evidence and requirements for the dashboard enhancements called out in the Phase 7 follow-ups so planners can author the Tremor/Recharts/MiniSearch plans once the refactor lands.

> **Status (2025-10-10 update):** Chart implementation is deferred to **Phase 9** and will resume only after we select the analytics-focused demo. Keep this discovery on file; do not re-run the commands until PROGRESS.md reactivates the task.

## Required Reading (before inspecting code)
1. `PROGRESS.md` – confirm the active plan and current role expectations.
2. `docs/System/context-engineering.md` + Scout prompts (`SIMPLE-INSTRUCTIONS.md`, `RESEARCH-FOLLOWING-MAGIC-PROMPT.md`).
3. `docs/Tasks/phase-7-component-library-followups.md` – focus on the **Feature Gaps** section.
4. `ai-docs/llm-reference/AiDocsReference.md` – chart/search notes from the external review.
5. AI workspace index `docs/System/ai-docs-index.md` – locate relevant Tremor/Recharts/MiniSearch assets.

## Scope
- Dashboards: `src/components/PerformanceMetricsView.tsx` placeholder section (lines ~264-303) plus any supporting styles/helpers.
- Search: current filter implementation inside `EmployeeListContainer` (read-only; note function names for later refactor).
- AI-doc assets: `ai-docs/reference/snippets/tremor/`, `ai-docs/reference/snippets/recharts/`, `ai-docs/reference/snippets/minisearch/`, and related playground demos.
- Documentation gaps: note where we’ll need Storybook stories, README updates, or ADR addenda for chart/search integrations.

## Deliverables
1. `docs/Tasks/phase-7-charts-discovery.md` – append your findings under the headings below (leave this scaffold in place for future scouts).
2. Log the discovery in `docs/SESSION_HANDOFF.md` with file:line citations and recommended next steps.
3. Do **not** modify production source files; capture diffs and TODOs in prose only.

## Discovery Template (fill these sections)
- **AI-Docs References** – list every snippet/demo consulted with file:line citations.
- **Current Implementation Notes** – summarize how `PerformanceMetricsView` and search currently behave (file:line references, known limitations).
- **Proposed Libraries & Patterns** – highlight reusable snippets, required props, data-shaping considerations, and internationalization/a11y notes.
- **Test & Storybook Impact** – outline new stories/tests we’ll need (unit, Playwright).
- **Open Questions** – anything the planner/executor should clarify before implementation.

## Suggested Command Workflow
```bash
# 1. Map out relevant AI-doc assets
rg "tremor" ai-docs/reference/snippets
rg "MiniSearch" ai-docs -g"*.md"

# 2. Inspect current dashboard/search code (read-only)
sed -n '240,360p' src/components/PerformanceMetricsView.tsx
rg "filter" src/components/EmployeeListContainer.tsx

# 3. Capture notes in this file (use an editor, no apply_patch required unless scoped to docs)
```

## Completion Checklist
- [x] Findings appended to this file using the template.
- [x] `docs/SESSION_HANDOFF.md` updated with discovery summary and command log.
- [x] No source files modified; working tree remains clean.

Record blockers (if any) in the handoff; planners will convert this discovery into `plans/YYYY-MM-DD_charts-search.plan.md` after the refactor completes.

---

## 2025-10-10 – Scout Findings

### AI-Docs References
- `ai-docs/reference/snippets/tremor/performance-card.tsx:1-48` – Tremor card example showing KPI header, progress bar, and `AreaChart` configuration for weekly SLA trends.
- `ai-docs/reference/snippets/recharts/basic-area-chart.tsx:1-44` – Responsive Recharts area chart with gradient fill, tooltip formatter, and axis theming.
- `ai-docs/reference/snippets/minisearch/basic-search.ts:1-29` – MiniSearch setup with fuzzy matching, prefix search, and weighted fields for documentation queries.
- `ai-docs/llm-reference/AiDocsReference.md:1-52` – External review notes calling out Tremor/Recharts/MiniSearch adoption requirements and documentation expectations.
- `docs/System/ai-docs-index.md:1-120` – Folder map confirming where to pull chart/search demos and third-party references during implementation.

### Current Implementation Notes
- `src/components/PerformanceMetricsView.tsx:377-387` renders a dashed placeholder that promises future Chart.js integration; no live dataset wiring or responsive container exists.
- The surrounding table (`PerformanceMetricsView.tsx:310-374`) already surfaces metric values and trends per employee, so the eventual chart must derive series data from the same `performanceData` structure.
- Legacy search still uses plain `includes` matching across concatenated strings (`src/components/EmployeeList/EmployeeListContainer.legacy.tsx:669-709`), which fails on transliteration, typos, or tag/skill metadata and returns unsorted results.
- Sorting remains a secondary step (`EmployeeListContainer.legacy.tsx:711-739`), so replacing search must keep compatibility with the existing sort/pagination pipeline while the refactor runs.

### Proposed Libraries & Patterns
- Tremor demo pairs headline metrics with an embedded `AreaChart`; we can reuse the Card/Metric pattern for KPI tiles while sourcing line/area series from our historical dataset (likely `performanceData.trend` entries) and leverage Tremor’s built-in tooltips for Russian copy.
- Recharts sample supplies lower-level primitives (custom gradients, axes, tooltips) useful if we need bespoke styling beyond Tremor’s presets; planners should decide whether to standardise on Tremor (higher-level) or compose Recharts charts manually.
- MiniSearch snippet demonstrates indexing multiple fields with weighted boosts and fuzzy/prefix search—ideal for blending names, positions, tags, and login fields into a single query endpoint. Implementation will need to hydrate from the refactored hook and maintain debounced updates so virtualization stays performant.
- Both chart libraries expect date indices formatted as ISO strings; ensure our backend data (currently `Date` objects) is serialised consistently before passing into Tremor/Recharts.

### Test & Storybook Impact
- Add Storybook stories covering the performance dashboard (baseline data + empty state) and embed axe testing once chart components mount without SSR issues.
- Extend Vitest coverage to include MiniSearch helper tests (index initialisation, fuzzy results, Russian locale matching) and chart data transformers (ensuring KPI/series alignment).
- Playwright suite will need an additional scenario that verifies search suggestions/filtering once MiniSearch is wired, plus a dashboard smoke test that confirms chart tooltips render and ARIA labels remain intact after virtualization updates.

### Open Questions
- Do we standardise on Tremor or Recharts for production dashboards, or support both (card + detailed chart) in tandem?
- Where will historical performance data originate (mocked client-side vs API fetch), and should planners budget a data-access layer before chart integration?
- What is the expected behaviour for search ranking and highlighting—should MiniSearch surface preview snippets or just reposition the table to the top-ranked employees?
- Are there accessibility requirements (e.g., textual summaries) that must accompany the charts for screen-reader parity alongside chart tooltips?
