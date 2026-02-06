# Overlay Padding Regression
> **Status:** ✅ Completed (2025-10-11) – executed via `docs/Archive/Plans/executed/2025-10-11_overlay-padding-regression.plan.md`

## Summary
- **Issue:** Modal and drawer overlays render without the expected interior spacing and appear visually cramped compared to the legacy build.
- **First noticed:** 2025-10-11 via screenshots (`/Users/m/Desktop/Screenshot 2025-10-11 at 13.47.03.png`, `/Users/m/Desktop/Screenshot 2025-10-11 at 14.32.50.png`).
- **Scope:** All overlays that rely on `src/components/common/Overlay.tsx` (Quick Add, Tag Manager, Edit Employee, Column Settings, etc.).

## Reproduction
1. Run `npm run preview -- --host 127.0.0.1 --port 4174` in `~/git/client/employee-management-parity`.
2. Open the Quick Add employee flow or any modal (e.g., Tag Manager, Bulk Import).
3. Observe that the content touches the modal edges with no white space.

### Expected
- Dialog content respects the token padding defined in `src/wrappers/ui/Dialog.tsx:69` (`padding: var(--em-spacing-xl) var(--em-spacing-2xl)`), matching the legacy parity screenshots.

### Actual
- `padding` is forced to `0` on the dialog container, so inner elements crowd the borders and rounded corners show a halo.

## Root Cause Analysis
- `src/components/common/Overlay.tsx:48` overrides `Dialog` `contentStyles` with `{ padding: 0, backgroundColor: '#ffffff' }`, canceling the modal default spacing.
- `Dialog` already applies the correct background (`colorVar("surface")`) and padding via token values. The override wins due to merge order.
- Downstream overlays try to recover spacing via `contentClassName` wrappers (example: `src/components/QuickAddEmployee.tsx:198`), but those divs sit inside the padding-less dialog so the visual gap never returns.

## Impact
- All modal overlays display cramped layouts and clipped rounded corners (see screenshot timestamps 13:39 vs 14:32 for before/after).
- Regression affects primary CRUD workflows and creates a perceived quality drop.

## Proposed Fix Directions
1. Remove the `padding: 0` override (preferred) so dialog token spacing applies globally.
2. Audit overlay consumers for redundant `bg-white`/`shadow` classes after the override is removed to avoid double-stacking styles.
3. Validate spacing across modal and sheet variants against parity screenshots.

## Resolution (2025-10-11)
- Dropped the zero-padding override so `Dialog` token spacing (`--em-spacing-xl`, `--em-spacing-2xl`) applies again (`src/components/common/Overlay.tsx:66`).
- Trimmed modal/drawer wrappers to rely on shared styling: updated Quick Add (`src/components/QuickAddEmployee.tsx:198-235`), Tag Manager (`src/components/EmployeeList/TagManagerOverlay.tsx:26-50`), Import/Export (`src/components/EmployeeList/ImportExportModals.tsx:26-118`), column settings sheet (`src/components/EmployeeList/ColumnSettingsOverlay.tsx:25-89`), bulk edit drawer (`src/components/EmployeeList/BulkEditDrawer.tsx:26-55,54-55`), and the employee edit drawer (`src/components/EmployeeEditDrawer.tsx:401-493`) to remove redundant `bg-white`/`shadow` classes and compensating `px-*` padding. Added `mx-auto` to modal wrappers so their constrained widths stay centered within the dialog content area.
- Manually inspected the preview build on port 4175 to confirm modals and drawers now render the expected halo-free spacing.
- Validation suite: `npm run build`, `npm run test:unit`, `npm run preview -- --host 127.0.0.1 --port 4174` (auto-bumped to 4175).

## Next Steps
- None – regression resolved. Reopen if future overlay changes reintroduce spacing overrides.
