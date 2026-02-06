## Metadata
- **Plan ID**: 2025-10-14_phase-7-final-review
- **Owner Role**: Planner → Executor
- **Status**: Ready for execution
- **Objective**: Perform the final migration review using the b1/b2 deliverables, confirm every Phase 7 acceptance criterion is satisfied (overlays, forms, tables, MiniSearch, import/export, docs/tests), and author the final sign-off notes.

## Required Reading
1. `PROGRESS.md`
2. `docs/SESSION_HANDOFF.md` (latest entries for MiniSearch + polish work)
3. `docs/Tasks/phase-7-component-library-discovery.md`
4. `docs/Tasks/phase-7-component-library-followups.md`
5. `docs/System/parity-roadmap.md`
6. `/Users/m/Desktop/a1.markdown`
7. `/Users/m/Desktop/a2.markdown`
8. `/Users/m/Desktop/b1.markdown`
9. `/Users/m/Desktop/b2.markdown`

## Phase 1 – Overlay/Form/Table Acceptance Check
1. Review the overlay polish checklist in `b1.markdown`:
   - Confirm `src/components/common/Overlay.tsx` includes the white background fix.
   - Spot-check overlay spacing/headers in `src/components/EmployeeList/*.tsx` (BulkEditDrawer, TagManagerOverlay, ColumnSettingsOverlay, ImportExportModals).
   - Validate Playwright guardrails still exist (`tests/employee-list.spec.ts`).
2. Verify form accessibility updates:
   - Inspect `src/components/QuickAddEmployee.tsx`, `src/components/EmployeeEditDrawer.tsx`, `src/components/common/RichTextEditor.tsx`, `src/wrappers/form/FormField.tsx` for aria labelling.
   - Check Vitest coverage (`src/wrappers/__tests__/FormField.test.tsx`, `src/utils/__tests__/search.test.ts`).
3. Confirm MiniSearch behaviour:
   - Review `src/utils/search.ts` and `src/components/EmployeeList/useEmployeeListState.tsx` for ranking + highlight logic.
   - Ensure Storybook story (`src/components/EmployeeList/EmployeeListContainer.stories.tsx`) explains the feature.

## Phase 2 – Component Library Polish Verification
1. Inspect import/export helper implementation and tests (`src/utils/importExport.ts`, `src/utils/__tests__/importExport.test.ts`).
2. Check dependency manifest and benchmark harness (`package.json`, `package-lock.json`, `scripts/benchmarks/datatable.ts`).
3. Validate documentation updates:
   - `docs/Tasks/phase-7-component-library-discovery.md`
   - `docs/Tasks/phase-7-component-library-followups.md`
   - `docs/System/parity-roadmap.md`
   - `ai-docs/llm-reference/AiDocsReference.md`
   - `ai-docs/reference/snippets/minisearch/basic-search.ts`
4. Confirm no outstanding TODOs remain in the follow-up checklist (charts deferred per roadmap).

## Phase 3 – Validation Review
1. Re-run smoke validations to confirm nothing regressed:
   ```bash
   npm run build
   npm run typecheck
   npm run test:unit
   npm run test -- --project=chromium --workers=1 --grep "Employee list"
   npm run storybook:build
   npx tsx scripts/benchmarks/datatable.ts
   ```
   > If any command was run earlier in this session, capture the existing output; rerun only if necessary to confirm.
2. Document the results (pass/fail timestamps) for the final report.

## Phase 4 – Final Report & Handoff
1. Create/refresh `docs/Tasks/phase-7-final-review.md` summarising:
   - Key evidence (file:line references) that overlays, forms, tables, MiniSearch, import/export, docs, and tests meet the acceptance bar.
   - Any residual risks (e.g., charts deferred to Phase 9, optional Storybook polish).
2. Update `docs/SESSION_HANDOFF.md` with a concise entry referencing the new final review doc and validation commands.
3. Update `PROGRESS.md`:
   - Mark this plan as _Completed_.
   - Note the next phase (e.g., planner to queue Phase 9 analytics or Phase 8 trimmed demo when scheduled).
4. Ensure the working tree is clean (`git status -sb`). Do not commit; leave the repository ready for merge.

## Rollback Strategy
- If discrepancies arise (e.g., missing documentation, failing validations), log them in `PROGRESS.md` + `docs/SESSION_HANDOFF.md` and halt execution.
- For dependency issues, reinstall from `package-lock.json` (`npm ci`).
- If Playwright failures occur, capture screenshots/logs under `test-results/` for follow-up.
