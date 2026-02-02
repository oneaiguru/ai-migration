# Overlay Z-Index & Drawer Border Follow-Up

> **Status:** ✅ Completed – overlays use design-token layering and drawers now inherit the shared 1 px separator from `Dialog`

## Context
- Reporter screenshots: `/Users/m/Desktop/Screenshot 2025-10-11 at 10.47.55.png`, `/Users/m/Desktop/Screenshot 2025-10-11 at 10.46.37.png`, `/Users/m/Desktop/Screenshot 2025-10-11 at 10.47.55.png` (quick add overlap), `/Users/m/Desktop/Screenshot 2025-10-11 at 10.46.37.png` (performance cards).
- Legacy layering allowed the sticky table header to sit above Radix overlays; dialog content also duplicated border styles per drawer.
- Drawer separators now come from the shared sheet base style, so Quick Add, Edit, Bulk Edit, and Column Settings all show the same 1 px divider.

## Tasks
1. **Overlay stacking fix**
   - Investigate `src/wrappers/data/DataTable.tsx` header styles and the modal wrapper in `src/wrappers/ui/Dialog.tsx`.
   - Ensure Radix overlays render above the employee list headers without bumping z-indices arbitrarily high. Target consistent layering across Quick Add, Edit Drawer, and Bulk Edit.
   - Validate in the browser that sticky headers no longer overlap modals.

2. **Drawer border alignment**
   - Ensure the subtle separator (1 px border) is provided by the shared sheet styling so every overlay inherits the same treatment.
   - Reference screenshot `/Users/m/Desktop/Screenshot 2025-10-11 at 10.47.55.png` for expected appearance.

## Expected Deliverables
- Code changes to `src/wrappers/ui/Dialog.tsx`, `src/wrappers/data/DataTable.tsx`, and the drawer components restoring proper stacking and borders.
- Visual confirmation (screenshots or QA notes) showing modals above headers and consistent drawer borders.
- Updated tests/notes if any layering changes affect Playwright selectors.

## Suggested Workflow
1. Reproduce locally using `npm run preview` and trigger Quick Add, Edit Drawer, and Bulk Edit.
2. Adjust stacking within the shared wrappers so all overlays win over table headers.
3. Add/verify the 1px separator for bulk edit & edit drawers.
4. Run `npm run build`, `npm run test:unit`, `npm run test -- --project=chromium --workers=1 --grep "Employee list"`.
5. Document findings in `docs/SESSION_HANDOFF.md` and update task status upon completion.

## Discovery – 2025-10-15 (Scout)
- **Overlay stacking**
  - Radix content/overlay layers are hard-coded to `zIndex: 10` and `zIndex: 9` in `src/wrappers/ui/Dialog.tsx:71` and `src/wrappers/ui/Dialog.tsx:94`, so sheets/modals lose against any component that leans on the design tokens (e.g., table loaders at `z-20`).
  - The design system already exposes semantic layers (`--em-zIndex-modal`, `--em-zIndex-popover`, etc.) in `src/styles/tokens.css:65`, and other wrappers consume them via `zIndexVar` (`src/wrappers/ui/Popover.tsx:34`). Aligning `Dialog` with these tokens should let overlays clear the sticky header without inflating ad-hoc numbers.
  - Employee table headers rely on `position: "sticky"` without an explicit z-index in `src/wrappers/data/DataTable.tsx:92`, so once `Dialog` stops pinning itself to `9/10` it can outrank the header naturally.
- **Drawer border consistency**
  - Employee edit and bulk-edit drawers already pass `border-l border-gray-200` through `contentClassName` (`src/components/EmployeeEditDrawer.tsx:401`, `src/components/EmployeeList/BulkEditDrawer.tsx:26`), which matches the requested 1 px separator.
  - The column settings sheet omits that class (`src/components/EmployeeList/ColumnSettingsOverlay.tsx:25`), so it still renders edge-to-edge. Moving the separator into the shared sheet styles (or at least standardising the class) would keep every Radix sheet consistent without duplicating Tailwind tweaks per overlay.
- `Overlay` currently forces `padding: 0` on the sheet container (`src/components/common/Overlay.tsx:66`), so the separator likely belongs either in `sheetContentBase` or as an additive wrapper class; capture the outcome in the follow-up plan so future overlays stay aligned.

## Plan – 2025-10-15 (Planner)
- Plan file: `docs/Archive/Plans/executed/2025-10-15_overlay-layering-and-sheet-border.plan.md`
- Summary: Replace hard-coded overlay z-indices in `Dialog` with `zIndexVar("modal")`, extend the sheet base style with the 1 px border, and remove redundant Tailwind borders from the edit/bulk drawers so all Radix sheets stay consistent.
- Manual QA: follow the plan’s preview step (`npm run preview -- --host 127.0.0.1 --port 4174`) and compare against `/Users/m/Desktop/Screenshot 2025-10-11 at 10.47.55.png` to ensure overlays sit above the sticky header and the separator matches the reference.

## Execution – 2025-10-15 (Executor)
- Updated `src/wrappers/ui/Dialog.tsx:20-108` to consume `zIndexVar("modal")` and apply `borderLeft: 1px solid ${colorVar("borderMuted")}` so all sheet variants share the separator.
- Removed redundant Tailwind borders from `src/components/EmployeeEditDrawer.tsx:401`, `src/components/EmployeeList/BulkEditDrawer.tsx:24`, and `src/components/EmployeeList/ColumnSettingsOverlay.tsx:23`, relying solely on the shared style.
- Automated validations (latest run): `npm run build`, `npm run test:unit` (Radix hidden-title + RHF act warnings remain expected).
- Manual QA: repo owner verified Quick Add, Edit, Bulk Edit, and Column Settings drawers now display the consistent 1 px divider with no artifacts.

## Someday / Maybe
- Design tokens currently lack a dedicated "sheet separator" shadow. When design revisits overlay depth, consider introducing a shared token (e.g. `--em-shadows-sheetDivider`) so future tweaks remain theme-driven instead of hard-coded per component.
