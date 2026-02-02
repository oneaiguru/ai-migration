## Metadata
- **Task Title:** Align overlay layering with design tokens and standardise sheet borders
- **Related Task Doc:** `docs/Tasks/z-index-and-drawer-border-followup.md`
- **Source Discovery:** `docs/Tasks/z-index-and-drawer-border-followup.md:30-38`, `docs/SESSION_HANDOFF.md:312-319`
- **Impacted Areas:** `src/wrappers/ui/Dialog.tsx`, `src/components/common/Overlay.tsx`, `src/components/EmployeeEditDrawer.tsx`, `src/components/EmployeeList/BulkEditDrawer.tsx`, `src/components/EmployeeList/ColumnSettingsOverlay.tsx`, documentation updates

## Desired End State
Overlays (Quick Add modal, Edit and Bulk Edit drawers, Column Settings sheet) render above the employee table header while preserving Radix focus traps, and every sheet-style drawer shows the consistent 1 px separator defined by the design tokens. Manual preview confirms no sticky header overlap and borders match the reference screenshot. Automated builds/tests continue to pass.

### Key Discoveries
- `src/wrappers/ui/Dialog.tsx:71-101` hard-codes `zIndex` values (9/10), causing sheets and modals to fall beneath sticky headers that rely on tokenised layers.
- `src/styles/tokens.css:65-70` defines semantic z-index tokens (e.g. `--em-zIndex-modal: 30`) and `src/wrappers/shared/tokens.ts:3-11` exposes `zIndexVar`, already used by `Popover` (`src/wrappers/ui/Popover.tsx:34`).
- Edit and bulk-edit drawers already add `border-l border-gray-200` (e.g. `src/components/EmployeeEditDrawer.tsx:401`), but Column Settings omits it (`src/components/EmployeeList/ColumnSettingsOverlay.tsx:25`); applying the separator in the shared sheet style keeps overlays consistent.

## What We're NOT Doing
- No changes to chart placeholders or analytics roadmap items (Phase 9 remains deferred).
- No redesign of overlay content layout or Radix lifecycles beyond z-index/border adjustments.
- No Storybook or AI-doc updates unless execution reveals discrepancies (document-only tweak if needed later).

## Implementation Approach
Use the design-token helpers to set modal/sheet layering via `zIndexVar("modal")`, ensuring overlays outrank table headers without arbitrary numbers. Promote the sheet border into `Dialog`’s sheet base style so all sheet variants inherit the separator, then remove redundant Tailwind borders from specific drawers. Confirm Column Settings inherits the border automatically. Update the task doc with the new plan context so stakeholders can track execution requirements.

## Phase 1: Tokenise Dialog Layering

### Overview
Replace hard-coded overlay/content z-index values with the semantic token helper and ensure sheet content accounts for the border without shrinking.

### Changes Required:

#### 1. Dialog overlay and content tokens
**File**: `src/wrappers/ui/Dialog.tsx`
**Changes**: Import `zIndexVar`, use it for modal and sheet z-indexes, and add a sheet border with box sizing so widths stay stable.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/wrappers/ui/Dialog.tsx
@@
-  colorVar,
+  colorVar,
   focusRing,
   fontSizeVar,
   fontVar,
   fontWeightVar,
   lineHeightVar,
   durationVar,
   radiusVar,
   shadowVar,
   spacingVar,
+  zIndexVar,
 } from "../shared/tokens";
@@
-  boxShadow: shadowVar("lg"),
-  zIndex: 10,
+  boxShadow: shadowVar("lg"),
+  zIndex: zIndexVar("modal"),
 };
@@
   overflowY: "auto",
-  boxShadow: shadowVar("lg"),
-  zIndex: 10,
+  boxShadow: shadowVar("lg"),
+  borderLeft: `1px solid ${colorVar("borderMuted")}`,
+  boxSizing: "border-box",
+  zIndex: zIndexVar("modal"),
 };
@@
-    backgroundColor: colorVar("backdrop"),
-    zIndex: 9,
+    backgroundColor: colorVar("backdrop"),
+    zIndex: zIndexVar("modal"),
   },
   sheet: {
     position: "fixed",
     inset: 0,
-    backgroundColor: colorVar("backdrop"),
-    zIndex: 9,
+    backgroundColor: colorVar("backdrop"),
+    zIndex: zIndexVar("modal"),
   },
 };
*** End Patch
PATCH
```

## Phase 2: Standardise Sheet Separators

### Overview
Ensure every sheet overlay inherits the new border via shared styles and remove redundant Tailwind borders from individual drawers.

### Changes Required:

#### 1. Employee edit drawer cleanup
**File**: `src/components/EmployeeEditDrawer.tsx`
**Changes**: Drop the manual Tailwind border classes so the shared sheet style provides the separator.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeEditDrawer.tsx
@@
-      contentClassName="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-xl border-l border-gray-200"
+      contentClassName="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-xl"
*** End Patch
PATCH
```

#### 2. Bulk edit drawer cleanup
**File**: `src/components/EmployeeList/BulkEditDrawer.tsx`
**Changes**: Remove the redundant border classes matching the edit drawer change.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeList/BulkEditDrawer.tsx
@@
-    contentClassName="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-xl border-l border-gray-200"
+    contentClassName="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-xl"
*** End Patch
PATCH
```

#### 3. Column settings overlay verification
**File**: `src/components/EmployeeList/ColumnSettingsOverlay.tsx`
**Changes**: No structural change needed; verify the sheet inherits the border and update if additional utility classes are required during execution. (Executor should keep existing layout classes.)

## Phase 3: Documentation Touchpoint

### Overview
Confirm the follow-up task already references this plan and captures manual QA expectations for future cycles.

### Changes Required:

#### 1. Confirm task doc entry
**File**: `docs/Tasks/z-index-and-drawer-border-followup.md`
**Changes**: Ensure the “Plan – 2025-10-15 (Planner)” section references this plan, the screenshot path, and preview validation notes. Update wording if execution reveals new requirements.

## Tests & Validation
- `npm run build`
- `npm run test:unit`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Manual check: `npm run preview -- --host 127.0.0.1 --port 4174` → open Quick Add, Edit Drawer, Bulk Edit, and Column Settings to confirm overlays sit above the sticky header and sheet borders match the reference (stop the preview after verification).

## Rollback
- Restore files: `git checkout -- src/wrappers/ui/Dialog.tsx src/components/EmployeeEditDrawer.tsx src/components/EmployeeList/BulkEditDrawer.tsx docs/Tasks/z-index-and-drawer-border-followup.md`
- Remove the plan file if necessary: `rm plans/2025-10-15_overlay-layering-and-sheet-border.plan.md`

## Handoff
- Update `PROGRESS.md` “Active Plan” to reference `plans/2025-10-15_overlay-layering-and-sheet-border.plan.md` with status `_Unstarted_`.
- Append an entry to `docs/SESSION_HANDOFF.md` noting the plan, required validations, and manual preview expectations.
- Leave the worktree clean so the executor can follow the plan without merge conflicts.
