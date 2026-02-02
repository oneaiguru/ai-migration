# Phase 6 – Table Migration Discovery

## Objective
Inventory the gaps between the legacy employee list table and the TanStack-based `DataTable` wrapper so the Planner can author the Stage 3 migration plan. Capture AI-doc references, production code evidence, and missing assets before handing off.

## Required Reading Order
1. `PROGRESS.md` – confirm there is no active plan.
2. `docs/System/context-engineering.md` – role confirmation + prompt paths.
3. CE prompts for Scouts: `/Users/m/Documents/replica/orchestrator/argus/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`, `…/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`.
4. `docs/SOP/code-change-plan-sop.md` (Exploration section).
5. **AI workspace (read before touching production code):**
   - `ai-docs/README.md`
   - `ai-docs/MANIFEST.md`
   - `ai-docs/RESEARCH_BRIEF.md` (TanStack + virtualization notes)
   - `ai-docs/QUESTIONS.md`
   - `ai-docs/wrappers-draft/data/DataTable.tsx`
   - `ai-docs/wrappers-draft/ui/Dialog.tsx` (overlay/table integration touchpoints)
   - `ai-docs/playground/src/examples/table-demo/TableDemo.tsx`
   - Entire `ai-docs/reference/snippets/tanstack-table/` directory (open every file)
   - Key reference docs: `ai-docs/reference/docs/tanstack-table/react-table-guide.md`, `…/virtualization.md`, `…/row-selection.md`, `…/column-visibility.md`
   - Optional but encouraged: run `ai-docs/scripts/docs_search.mjs tanstack` to surface any additional guidance you may have missed

Record AI-doc citations (file:line) in your discovery notes; missing citations invalidate the handoff per SOP. Do not skim—open every listed AI-doc file and read it end-to-end before moving on.

After this discovery completes, two follow-on tasks are already queued:
- **Accessibility & evidence refresh prep** – capture the remaining overlay screenshots (selection banner, dismiss timeline, tag-limit alert), list any additional evidence docs that need updates, and outline the manual walkthrough steps reviewers must follow. Keep table-related deltas in mind so the future planner can script the refresh quickly. (No NVDA sweep here—that runs in a later phase owned by the human UAT team.)
- **Stage 6 AI UAT preparation** – compile the parity walkthrough links, checklist references, and documentation updates the AI UAT executor will need. This is a planning task only; actual UAT happens after Phase 6 execution.

> Note: Screen-reader sweeps (NVDA, VoiceOver re-run) are deferred to Phase 9 and handled by the human UAT track. Simply flag any table changes that might influence those later checks.

## Production Code & Test Targets
Review these files after completing the AI-doc readings:
- `src/components/EmployeeListContainer.tsx` – legacy table rendering, filters, selection handling.
- `src/wrappers/data/DataTable.tsx` – shipping TanStack wrapper capabilities (virtualization, keyboard nav, hooks exposed to consumers).
- `tests/employee-list.spec.ts` – Playwright coverage that must stay green post-migration.
- `src/components/common/Overlay.tsx` and toolbar overlays (bulk edit, tag manager, import/export) for row selection dependencies.
- `src/utils/exportHelpers.ts`, `src/utils/importValidators.ts` (if present) for CSV handling tied to table columns.

## Discovery Deliverables
Create/refresh `docs/Tasks/phase-6-table-migration-discovery.md` sections:
- **AI-Docs References** – cite every workspace artifact you used (file:line).
- **Legacy Implementation Overview** – describe current table logic with file:line evidence (sorting, filtering, selection, column visibility, CSV export/import, keyboard traps).
- **Wrapper Capabilities & Gaps** – document which features the shared `DataTable` already supports and where we need adapter code.
- **Test Implications** – note existing Playwright selectors that will break or need updates when moving to TanStack.
- **Missing Assets** – list any absent demos/docs in AI workspace that the Planner must request (e.g., no column pinning example).

## Boundaries
- Do **not** modify code or docs during discovery.
- Capture blockers in `docs/SESSION_HANDOFF.md` and stop if you cannot complete the exploration.
- Leave implementation ideas for the Planner; focus on facts and evidence.

## Handoff expectations
- Update `docs/SESSION_HANDOFF.md` with a new entry summarising discoveries, linking to this task file and the AI-doc citations.
- Include a short list of open questions for the Planner (e.g., performance measurements, required UX tweaks).

---

## 2025-10-11 – Scout Findings

### AI-Docs References
- `ai-docs/wrappers-draft/data/DataTable.tsx:1-101` – draft Radix/TanStack wrapper shows baseline virtualization with sticky headers, but no selection hooks or persisted filters.
- `ai-docs/playground/src/examples/table-demo/TableDemo.tsx:1-112` – parity-focused demo renders 5 000 mock employees with Russian copy, highlighting the expected virtual-scroll styling.
- `ai-docs/reference/snippets/tanstack-table/basic/src/main.tsx:1-153` – canonical non-virtual TanStack table; useful for mapping column helpers and header/footer rendering.
- `ai-docs/reference/snippets/tanstack-table/virtualized-rows/src/main.tsx:1-252` – dynamic-height virtualization example (CSS grid + `measureElement`) that we’ll need if rows keep expanding for bulk-edit badges.
- `ai-docs/reference/snippets/tanstack-virtual/table/src/main.tsx:1-192` – shows translate offset math required when pairing TanStack Table with TanStack Virtual.

### Legacy Implementation Overview
- Manual column visibility + persistence lives in component state (`src/components/EmployeeListContainer.tsx:390-417`) and guards rendering via `COLUMN_ORDER` (`src/components/EmployeeListContainer.tsx:2238-2426`).
- Sorting/filtering is executed outside the table through controlled selects (`src/components/EmployeeListContainer.tsx:2200-2222`) and memoised array transforms (`src/components/EmployeeListContainer.tsx:667-749`).
- Selection mode, keyboard shortcuts, and focus return hinge on DOM tables and `rowRefs` (`src/components/EmployeeListContainer.tsx:292-345`, `src/components/EmployeeListContainer.tsx:2282-2333`, `src/components/EmployeeListContainer.tsx:518-583`).
- CSV export logic depends on the current column order and filter set (`src/components/EmployeeListContainer.tsx:1660-1763`), while import/export/tag overlays rely on the existing row DOM to keep focus (`src/components/EmployeeListContainer.tsx:1503-1624`, `src/components/common/Overlay.tsx:1-76`).
- Playwright selectors target semantic table nodes (`tests/employee-list.spec.ts:1-200`) and expect real `<tbody><tr>` rows for checkbox/keyboard flows.

### Wrapper Capabilities & Gaps
- Current wrapper virtualizes rows and exposes keyboard navigation hooks (`src/wrappers/data/DataTable.tsx:1-449`), but it assumes uniform `rowHeight`, lacks checkbox/selection wiring, and expects consumers to provide `onRowClick`/`getRowProps` for focus state.
- No support yet for column visibility toggles, persisted filters, or summary rows—features the legacy view drives in-component.
- Wrapper styles use `display: block` for headers/body, so existing CSS that assumes table-layout may need updates.
- AI draft omits pinned columns, inline editing, and bulk-selection affordances noted in the PRD; planner must scope these before execution.

### Test Implications
- All critical tests query `tbody tr`, header checkboxes, and row classes (`tests/employee-list.spec.ts:88-190`); switching to virtualized divs will break these selectors unless we ship stable `data-testid` attributes in the new table wrapper.
- Console guard fails builds when Radix warns; table migration must keep overlays error-free while rows mount/unmount (warning trap configured in `tests/employee-list.spec.ts:41-50`).
- File import/export tests rely on current menu structure and success toasts (`tests/employee-list.spec.ts:205-288`); ensure virtualization doesn’t delay toast rendering or detach modals.

### Missing Assets / Follow-Ups
- No AI-doc snippet covers TanStack Table row selection with checkboxes; request an example for multi-select + shift/Meta toggles.
- Column pinning/persistence guidance is absent from `ai-docs/`; planner should flag whether we need extra references or defer to Stage 7 component-library hardening.
- `src/utils/exportHelpers.ts` / `src/utils/importValidators.ts` mentioned in the brief do not exist—legacy CSV logic is embedded directly in `EmployeeListContainer.tsx`.

### Execution Results – 2025-10-10
- Virtualized table now ships through the shared wrapper with stable row props and checkbox wiring (`src/components/EmployeeListContainer.tsx:807`, `src/components/EmployeeListContainer.tsx:889`, `src/components/EmployeeListContainer.tsx:1083`). Focus restoration uses `getRowProps` to keep drawer return logic intact.
- Header/select-all behaviour moved to shared callbacks so selection parity matches legacy mode (`src/components/EmployeeListContainer.tsx:850`).
- Wrapper exposes recursive focus scheduling via `useCallback` to avoid temporal dead zone errors (`src/wrappers/data/DataTable.tsx:175`, `src/wrappers/data/DataTable.tsx:188`).
- Playwright suite switched to `data-testid` locators for rows and checkboxes (`tests/employee-list.spec.ts:3`, `tests/employee-list.spec.ts:105`). Build + targeted slice both pass post-migration (`npm run build`, `npm run test -- --project=chromium --workers=1 --grep "Employee list"`).
- Added TanStack dependencies required by the wrapper (`package.json:17`). Manual overlay sweep via preview is still pending a GUI run; request next QA cycle to rerun the toolbar walk.
- Styling parity restored for the virtualized rows (`src/components/EmployeeListContainer.tsx:829-1083`, `src/wrappers/data/DataTable.tsx:168-259`): row height reduced to 60px, padding realigned to the legacy `py-3 px-6`, and blue separators (`rgba(59,130,246,0.25)`) return the classic grid.
- Header styling now mirrors the legacy grid with uppercase bold labels, blue bottom border, and consistent left padding (`src/wrappers/data/DataTable.tsx:70-110`).
