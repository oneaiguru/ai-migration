# AI Docs Reference – Component Library Stabilisation Review

## Source Summary
- Derived from external migration evaluation `1760097242546_10-07-1_Comprehensive_WFM_Demo_Stack_Evaluation.md` (lines 1-1239).
- Cross-checked with production wrappers and task briefs dated 2025-10-11.

## Key Findings
1. **Documentation gaps** – Missing READMEs for `src/wrappers/ui`, `src/wrappers/form`, `src/wrappers/data`; AI-doc drafts need parallel updates (e.g., create `ai-docs/wrappers-draft/form/README.md`).
2. **Testing requirements** – Introduce Storybook stories and Vitest smoke tests for Dialog, Button, FormField/EmployeeForm, and DataTable prior to reuse.
3. **Monolith refactor** – `src/components/EmployeeListContainer.tsx` (~3 169 lines) must be decomposed into toolbar/table/overlay modules plus hooks for sustainable reuse.
4. **Feature follow-ups** – Implement Tremor/Recharts charts (`PerformanceMetricsView.tsx`), MiniSearch-based fuzzy search, rich-text editor, and CSV/Excel helpers; document each in production and AI docs. (MiniSearch + TipTap + CSV helpers have shipped; charts remain deferred.)
5. **Accessibility & performance** – Plan axe-core sweeps on Storybook stories and benchmark TanStack virtualization with ≥10 k rows once stabilisation completes.

## Recommended Artifacts to Update
- `docs/Tasks/phase-6-cleanup-task.md` – track review-derived cleanup items.
- `docs/Tasks/phase-7-component-library-discovery.md` & `docs/Tasks/phase-7-component-library-followups.md` – record outstanding work.
- Plans: `plans/2025-10-12_employee-list-refactor.plan.md` (Planner next once stabilization context matures).
- Storybook coverage and Vitest smoke suites now exist in production; keep the mirrored drafts/stories/tests inside
  `ai-docs/wrappers-draft/` aligned with the living code.

## 2025-10-10 Update
- MiniSearch search integration landed in production (`src/utils/search.ts`, `src/components/EmployeeList/useEmployeeListState.tsx`).
  The reference snippet (`ai-docs/reference/snippets/minisearch/basic-search.ts`) now mirrors the helper API, so future
  planners should reuse it when wiring search for other modules.

## 2025-10-13 Update
- Rich-text editor accessibility regression resolved: `FormField` exposes label IDs, `RichTextEditor` accepts
  `aria-labelledby`, and the edit drawer forwards the IDs so screen readers announce "Новые задачи" correctly.
  Reference the production implementation when updating `ai-docs/wrappers-draft/form/`.
- Shared CSV/Excel helper module (`src/utils/importExport.ts`) now backs all employee list import/export flows; helper
  tests and Playwright coverage demonstrate header validation + empty file errors. Future planners can reuse these
  utilities for other modules rather than recreating parsing logic.
- Virtualization benchmark results refreshed after helper consolidation (10k → 95.21 ms, 30k → 133.03 ms, 50k → 318.67 ms); update comparison tables when evaluating performance regressions.
- Phase 7 audit snapshot (2025-10-15): AI-doc drafts now include the accessible `formFieldAriaProps` example and a CSV/Excel helper snippet (`ai-docs/reference/snippets/utils/import-export.ts`) so future plans can cite the living patterns.

Keep this reference aligned as AI-doc drafts are refreshed to match production code.
