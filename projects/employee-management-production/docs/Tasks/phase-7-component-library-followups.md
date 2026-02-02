# Phase 7 Follow-Ups – Component Library Stabilisation

> **Status:** Active — track outstanding Phase 7 polish items here (last reviewed 2025-10-15)

Use this checklist after executing `plans/2025-10-10_component-library-stabilization.plan.md` to schedule the remaining tasks called out in the external migration review.

## Documentation & Testing (Blocker)
- Keep wrapper READMEs (`src/wrappers/ui|form|data/README.md`) and inline TSDoc in sync with future API tweaks; mirror
  updates in `ai-docs/wrappers-draft/` + `ai-docs/llm-reference/AiDocsReference.md`. ✅ 2025-10-15 audit snapshot recorded.
- Extend Storybook coverage beyond the baseline stories (`Dialog`, `Button`, `EmployeeForm`, `DataTable`) with
  error/edge cases (hidden headings, destructive overlays, selection states) and schedule axe-core sweeps.
- Expand Vitest smoke tests in `src/wrappers/__tests__/` to cover additional variants (sheet overlays, button
  icon-only focus, DataTable keyboard shortcuts) and keep coverage ≥80 %.
- After the EmployeeList refactor stabilises, capture a trimmed “frozen” wrapper demo set in `ai-docs/wrappers-draft/`
  and mark the frozen status in `docs/System/ai-docs-index.md` so future work knows the reference won’t update automatically. ✅ Phase 7 reference recorded 2025-10-15.

## Component Refactor
- ✅ Completed 2025-10-12 – employee list now lives under `src/components/EmployeeList/` with `useEmployeeListState.tsx`
  and sectional components (`Toolbar`, `Filters`, `Table`, `BulkEditDrawer`, `TagManagerOverlay`, `ColumnSettingsOverlay`,
  `ImportExportModals`). Future feature work should target these files rather than the removed monolith.

## Feature Gaps (Phase 7)
- ✅ Completed 2025-10-10 – Search now relies on MiniSearch helpers (`src/utils/search.ts`) wired through `useEmployeeListState.tsx` to return ranked results, highlight rows, and provide accessibility status text (`Filters.tsx`, `Table.tsx`). Storybook (`EmployeeListContainer.stories.tsx`), Vitest (`src/utils/__tests__/search.test.ts`), Playwright (`tests/employee-list.spec.ts`), and AI-doc snippets (`ai-docs/reference/snippets/minisearch/basic-search.ts`) mirror the production pattern.
- ✅ Completed 2025-10-13 – Edit drawer now renders the TipTap-backed `RichTextEditor` with accessible labelling and
  plain-text conversion helpers (`src/components/common/RichTextEditor.tsx`, `src/components/EmployeeEditDrawer.tsx`,
  `src/components/forms/employeeEditFormHelpers.ts`, `src/utils/importExport.ts`). Document formatting defaults remain
  in the helper README.
- ✅ Completed 2025-10-13 – Employee list import/export flows reuse the shared CSV utilities and header validation
  (`src/components/EmployeeList/useEmployeeListState.tsx`, `src/utils/importExport.ts`); Vitest and Playwright cover
  success + failure cases. Future polish: surface Excel header validation feedback in the UI when we introduce actual
  uploads.

## Deferred – Phase 9 Analytics Demo (Tentative)
- Charts: keep the placeholder in `src/components/PerformanceMetricsView.tsx:264-303` until an analytics-focused demo is selected. Track future work in `docs/Tasks/phase-9-analytics-demo-task.md`; re-evaluate Tremor/Recharts integration, Storybook coverage, and testing once that roadmap is locked.

## Accessibility & Performance Validation
- Schedule axe-core/Storybook sweeps for wrapper stories once the documentation/tests work lands.
- Benchmark TanStack virtualization in `src/wrappers/data/DataTable.tsx:1-320` with 10k–50k rows, noting overscan and Enter-key behaviour.
  ✅ 2025-10-13 update: `npx tsx scripts/benchmarks/datatable.ts` – 10k → 95.21 ms, 30k → 133.03 ms, 50k → 318.67 ms.
- Document benchmark results and accessibility findings in `docs/Tasks/phase-7-component-library-discovery.md` and the AI workspace.

Log progress and blockers in `docs/SESSION_HANDOFF.md`. Run `docs/Tasks/phase-7-charts-discovery.md` before drafting the charts/search plan, then open `plans/YYYY-MM-DD_<task>.plan.md` for each implementation slice.
