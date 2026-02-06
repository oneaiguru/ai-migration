## Metadata
- **Plan ID**: 2025-10-12_employee-list-refactor
- **Status**: Ready for execution
- **Owner Role**: Executor
- **Related Docs**: `docs/Tasks/phase-7-component-library-discovery.md`, `docs/Tasks/phase-7-component-library-followups.md`, `docs/Tasks/phase-7-component-library-task.md`, `docs/ADR/0002-wrapper-layer-ownership.md`, `ai-docs/llm-reference/AiDocsReference.md`

## Desired End State
- `src/components/EmployeeList/` hosts the employee list feature: a reusable state hook (`useEmployeeListState.ts`) plus focused presentational modules (`EmployeeListContainer.tsx`, `Toolbar.tsx`, `Filters.tsx`, `Table.tsx`, `BulkEditDrawer.tsx`, `TagManagerOverlay.tsx`, `ColumnSettingsOverlay.tsx`, `ImportExportModals.tsx`).
- The hook exposes all state/effect logic previously embedded in `EmployeeListContainer.tsx`; presentational components consume the hook output and keep the existing markup/test ids.
- `App.tsx` and Playwright tests compile against the new module without behavioural changes.
- Discovery/follow-up docs mark the container split complete and note remaining feature work (charts/search/rich-text/perf).
- Build/typecheck/unit + targeted Playwright slice all pass.

### Key Discoveries
- `docs/Tasks/phase-7-component-library-discovery.md:9-32` – identifies `EmployeeListContainer.tsx:1-3305` as the modularisation blocker.
- `docs/Tasks/phase-7-component-library-followups.md:13-25` – specifies the required breakdown (toolbar/table/overlays/hooks) before reusing wrappers.
- `ai-docs/llm-reference/AiDocsReference.md:7-12` – external review highlighting the monolith split and follow-up features/tests.

## What We're NOT Doing
- Implementing charts/MiniSearch/rich-text/CSV helpers (captured as separate follow-ups).
- Editing Quick Add / Edit Drawer logic except for import path adjustments.
- Changing Playwright assertions or ids (stability requirement).
- Publishing the wrapper layer outside this repo.

## Implementation Approach
1. Duplicate the current container into a workspace folder, then migrate logic into a hook and move JSX into focused components. Use exact copies of existing markup to avoid regressions.
2. Wire a thin container component that composes the hook + sections, update imports/exports, and keep scripts/tests untouched.
3. Refresh documentation to explain the new module layout and mark the follow-up checklist item complete.

## Phase 1 – Module scaffold & hook extraction

### Overview
Create `src/components/EmployeeList/`, move the legacy container inside, and derive a reusable hook exposing all state/handlers. The hook should be a straight copy of the pre-refactor logic (everything prior to the old `return (...)`).

### Steps
1. **Move legacy file**
   ```bash
   set -euo pipefail
   mkdir -p src/components/EmployeeList
   mv src/components/EmployeeListContainer.tsx src/components/EmployeeList/EmployeeListContainer.legacy.tsx
   ```

2. **Create `useEmployeeListState.ts`**
   - Copy the entire body of `EmployeeListContainer.legacy.tsx` up to (but excluding) the `return (` call into a new hook file.
   - Wrap it in `export const useEmployeeListState = ({ employees, onEmployeesChange, onOpenQuickAdd, focusEmployeeId }: EmployeeListContainerProps) => { ... }` and add `return { … }` enumerating every value/function consumed by the JSX (reuse variable names; include helper renderers like `renderActionButtons`, `renderTagCatalogList`, `bulkEditButtonTitle`).
   - Export supporting types/constants (`EmployeeListContainerProps`, `EmployeeListState`, `STATUS_LABELS`, `STATUS_BADGE_CLASSES`, `IMPORT_OPTIONS`, `EXPORT_OPTIONS`, `MAX_TAGS_PER_EMPLOYEE`).
   - Keep imports identical to the legacy file (adjust relative paths one level up).

3. **Trim the legacy file to pure JSX**
   - Replace the legacy component definition with `export const LegacyEmployeeListView = (state: EmployeeListState) => ( … )`, preserving the full `return` block.
   - Remove hook-specific imports now handled by `useEmployeeListState.ts`.
   - Ensure every identifier is accessed via the `state` parameter, e.g. replace `filters` with `state.filters`, `renderActionButtons` with `state.renderActionButtons`, etc.
   - Leave all markup/test ids untouched.

## Phase 2 – Presentational split & container wrapper

### Overview
Break the legacy JSX into focused components and introduce the new top-level container.

### Steps
1. **Create section components**
   For each component below, copy the corresponding JSX from `LegacyEmployeeListView` without alteration, replacing bare identifiers with props pulled from `EmployeeListState`:
   - `Toolbar.tsx` – header/toolbar/filters chip region (lines ~200-640 in the legacy file).
   - `Filters.tsx` – filter panel grid (within the toolbar section).
   - `Table.tsx` – table/empty-state/loading overlay block.
   - `BulkEditDrawer.tsx` – overlay form block.
   - `TagManagerOverlay.tsx` – tag overlay block.
   - `ColumnSettingsOverlay.tsx` – column settings overlay block.
   - `ImportExportModals.tsx` – import + export modal blocks.
   Each file should export a React component receiving `{ state: EmployeeListState }` and reuse the JSX verbatim (only prefix values with `state.`).

2. **Author `EmployeeListContainer.tsx`**
   - Import `useEmployeeListState` and all section components.
   - Compose them as:
     ```tsx
     const EmployeeListContainer: React.FC<EmployeeListContainerProps> = (props) => {
       const state = useEmployeeListState(props);
       return (
         <>
           <input … ref={state.importInputRef} … />
           <div className="relative …">
             <LiveRegion liveMessage={state.liveMessage} />
             <Toolbar state={state} />
             <Table state={state} />
           </div>
           <BulkEditDrawer state={state} />
           <TagManagerOverlay state={state} />
           <ColumnSettingsOverlay state={state} />
           <ImportExportModals state={state} />
           <EmployeeEditDrawer … />
         </>
       );
     };
     ```
   - Export default `EmployeeListContainer` plus named exports for section components if useful.

3. **Add barrel export**
   - Create `src/components/EmployeeList/index.ts` exporting the container (and optionally sections/types) so upstream code can import from `@/components/EmployeeList`.

4. **Update imports**
   - Change `src/App.tsx` to `import EmployeeListContainer from './components/EmployeeList';` (pointing at the new barrel).
   - Adjust any other references (e.g., Storybook stories or docs) to the new path.

## Phase 3 – Documentation & follow-up files

1. **Update docs**
   - `docs/System/project-structure.md`: replace the single `EmployeeListContainer.tsx` entry with the new folder layout (list hook + section files).
   - `docs/System/parity-roadmap.md`: mention that the container has been decomposed and wrappers are now reusable.
   - `docs/Tasks/phase-7-component-library-discovery.md`: append a note under the execution section confirming the container split and referencing the new files.
   - `docs/Tasks/phase-7-component-library-followups.md`: mark the “Component Refactor” checklist as completed (replace bullets with a short note pointing to the new module) while leaving feature/perf items open.
   - `docs/SESSION_HANDOFF.md`: add execution entry summarising the refactor, tests, and remaining risks.

2. **Clean up legacy helper**
   - Delete `src/components/EmployeeList/EmployeeListContainer.legacy.tsx` once all sections compile.

## Phase 4 – Validation

Run the full validation suite after TypeScript lints cleanly:
```bash
npm run build
npm run typecheck
npm run test:unit
npm run test -- --project=chromium --workers=1 --grep "Employee list"
```
Perform a quick manual smoke via `npm run preview` if possible (toolbar buttons, filters, overlays).

## Rollback
- Restore `src/components/EmployeeListContainer.tsx` from `EmployeeListContainer.legacy.tsx` (kept until end of execution) and delete the new module directory if any regression appears.
- Revert doc updates and import changes.

## Handoff
- Leave `PROGRESS.md` with “Active Plan: _Completed_” pointing to this file and describe outcomes/next steps in `docs/SESSION_HANDOFF.md`.
- Flag remaining follow-ups (charts/search/rich text/perf benchmarks) for the next planner.
