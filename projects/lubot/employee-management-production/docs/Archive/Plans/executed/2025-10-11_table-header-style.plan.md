## Metadata
# Phase 6 – Table Header Visual Parity
#
# - **Task**: docs/Tasks/phase-6-table-migration-discovery.md#2025-10-11
# - **Related Docs**:
#   - docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md
#   - docs/Tasks/06_phase-6-migration-planning-prd.md
#   - docs/Tasks/phase-6-table-migration-discovery.md
#   - docs/SESSION_HANDOFF.md#2025-10-11-–-executor-table-style-parity-plan
#
## Desired End State
- Employee list header replicates the legacy design: bold uppercase labels, compact vertical padding, and a distinct blue bottom border while virtualization remains intact.
- Column sizing and alignment stay in sync with the row cells.

### Key Discoveries:
- `src/components/EmployeeListContainer.tsx:900-1080` – column metadata currently uses light grey header styles, lacking the legacy blue border and tight padding.
- `src/wrappers/data/DataTable.tsx:200-240` – header cells inherit default styles from the wrapper; adjustments here control the sticky header background and separator line.
- Legacy screenshot (`docs/Tasks/phase-6-table-migration-discovery.md:74`) shows darker blue separator and heavier font weight to differentiate the header from body rows.

## What We're NOT Doing
- No changes to column visibility logic or virtualization dimensions beyond header cosmetics.
- No test selector updates; existing `data-testid` hooks must remain unchanged.
- No rework of row padding (already handled in prior plan).

## Implementation Approach
Update the shared DataTable header styles to apply the blue separator and font weight, then align per-column metadata padding with the tightened row baseline. Confirm the sticky header keeps the background solid and re-run the targeted tests plus a quick preview check.

## Phase 1: Header Styling Adjustments

### Overview
Introduce the legacy header padding, typography, and separator color.

### Changes Required:

#### 1. Shared header style tuning
**File**: `src/wrappers/data/DataTable.tsx`
**Changes**: Add heavier font weight, uppercase color, and blue bottom border for header cells.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/wrappers/data/DataTable.tsx
@@
 const headerCellStyle = {
   padding: `${spacingVar("sm")} ${spacingVar("md")}`,
   fontFamily: fontVar("fontFamily"),
   fontSize: fontSizeVar("sizeXs"),
-  fontWeight: fontWeightVar("fontWeightSemibold"),
+  fontWeight: fontWeightVar("fontWeightBold"),
   textAlign: "left" as const,
   color: colorVar("mutedForeground"),
-  borderBottom: `1px solid ${colorVar("borderMuted")}`,
+  borderBottom: "1px solid rgba(59, 130, 246, 0.35)",
   backgroundColor: colorVar("surfaceMuted"),
   position: "sticky" as const,
*** End Patch
PATCH
```

#### 2. Column metadata padding
**File**: `src/components/EmployeeListContainer.tsx`
**Changes**: Ensure header classes use `py-2.5` consistently and enforce uppercase/spacing for team/status columns.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-            meta: {
-              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+            meta: {
+              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
               cellClassName: 'px-6 py-2.5 whitespace-nowrap',
               headerStyle: { flex: '1 1 280px', minWidth: 240 },
               cellStyle: { flex: '1 1 280px', minWidth: 240, alignItems: 'center' },
             },
*** End Patch
PATCH
```

> Note: The header classes already use uppercase/spacing for all columns after the row plan; no additional edits required beyond confirming uniform padding.

## Tests & Validation
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Manual: `npm run preview` → confirm header font weight and blue separator align with the legacy screenshot.

## Rollback
- `git checkout -- src/wrappers/data/DataTable.tsx src/components/EmployeeListContainer.tsx`
- `npm run build`

## Handoff
- After execution, archive this plan to `docs/Archive/Plans/executed/`.
- Update `docs/SESSION_HANDOFF.md` with the styling changes and test results.
- Leave `PROGRESS.md` reflecting no active plan once complete.
