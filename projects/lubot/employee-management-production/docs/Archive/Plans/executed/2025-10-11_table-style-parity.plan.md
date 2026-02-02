## Metadata
# Phase 6 – Table Visual Parity Follow-up
#
# - **Task**: docs/Tasks/phase-6-table-migration-discovery.md#2025-10-11
# - **Related Docs**:
#   - docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md
#   - docs/Tasks/06_phase-6-migration-planning-prd.md
#   - docs/SESSION_HANDOFF.md#2025-10-11-–-executor-table-migration-plan
#
## Desired End State
- The virtualized employee table visually matches the pre-migration layout: rows have compact vertical rhythm, avatars align with text, and blue row separators mirror the legacy grid.
- Playwright selectors and virtualization remain stable; automated tests still pass.
- Discovery doc records the styling fix so future plans know the final target.

### Key Discoveries:
- `src/components/EmployeeListContainer.tsx:807-857` – row height fixed at 68px and per-column meta relies on flex styles, producing extra top/bottom padding versus the legacy table.
- `src/wrappers/data/DataTable.tsx:168-208` – wrapper enforces inline `display:flex` rows with neutral border colors, overriding the old Tailwind borders and padding.
- `tests/employee-list.spec.ts:3-120` – suites already use `data-testid` selectors; spacing changes will not impact query logic but must keep test ids intact.

## What We're NOT Doing
- No changes to sorting, selection logic, or column visibility behavior.
- No modifications to Playwright assertions beyond verifying visuals manually.
- No reintroduction of the legacy `<table>` markup or removal of virtualization.

## Implementation Approach
Re-tune the shared DataTable wrapper and the employee list column metadata to reapply the legacy paddings, row height, and separator styling. Keep virtualization happy by keeping a single `rowHeight` constant that matches the actual rendered height. Then document the change in the discovery log so future agents know the new canonical styling.

## Phase 1: Restore Legacy Row Rhythm

### Overview
Align DataTable row height, padding, and borders with the previous non-virtualized table.

### Changes Required:

#### 1. Row height + selection column spacing
**File**: `src/components/EmployeeListContainer.tsx`
**Changes**: Reduce `rowHeight`, expose header padding, and ensure select-all column respects the tighter layout.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-  const rowHeight = 68;
+  const rowHeight = 60;
@@
-  const tableHeight = useMemo(() => {
-    const boundedRowCount = Math.min(Math.max(visibleCount, 8), 16);
-    return boundedRowCount * rowHeight + rowHeight;
-  }, [visibleCount]);
+  const tableHeight = useMemo(() => {
+    const boundedRowCount = Math.min(Math.max(visibleCount, 8), 16);
+    return (boundedRowCount + 1) * rowHeight;
+  }, [rowHeight, visibleCount]);
@@
-        meta: {
-          headerClassName: 'px-4 py-3 flex items-center justify-center',
-          cellClassName: 'px-4 py-3 flex items-center justify-center',
-          headerStyle: { flex: '0 0 56px', minWidth: 56 },
-          cellStyle: { flex: '0 0 56px', minWidth: 56 },
-        },
+        meta: {
+          headerClassName: 'px-4 py-2.5 flex items-center justify-center',
+          cellClassName: 'px-4 py-2.5 flex items-center justify-center',
+          headerStyle: { flex: '0 0 56px', minWidth: 56 },
+          cellStyle: { flex: '0 0 56px', minWidth: 56 },
+        },
*** End Patch
PATCH
```

#### 2. Column padding and alignment
**File**: `src/components/EmployeeListContainer.tsx`
**Changes**: Add consistent meta padding so each column aligns with the former Tailwind `py-3 px-6` spacing.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-            meta: {
-              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
-              cellClassName: 'px-6 py-3 whitespace-nowrap',
-              headerStyle: { flex: '1 1 280px', minWidth: 240 },
-              cellStyle: { flex: '1 1 280px', minWidth: 240 },
-            },
+            meta: {
+              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-2.5 whitespace-nowrap',
+              headerStyle: { flex: '1 1 280px', minWidth: 240 },
+              cellStyle: { flex: '1 1 280px', minWidth: 240, alignItems: 'center' },
+            },
@@
-            meta: {
-              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
-              cellClassName: 'px-6 py-3 whitespace-nowrap text-gray-700',
-              headerStyle: { flex: '0 0 200px', minWidth: 180 },
-              cellStyle: { flex: '0 0 200px', minWidth: 180 },
-            },
+            meta: {
+              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-2.5 whitespace-nowrap text-gray-700',
+              headerStyle: { flex: '0 0 200px', minWidth: 180 },
+              cellStyle: { flex: '0 0 200px', minWidth: 180, alignItems: 'center' },
+            },
@@
-            meta: {
-              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
-              cellClassName: 'px-6 py-3 whitespace-nowrap text-gray-700',
-              headerStyle: { flex: '0 0 240px', minWidth: 200 },
-              cellStyle: { flex: '0 0 240px', minWidth: 200 },
-            },
+            meta: {
+              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-2.5 whitespace-nowrap text-gray-700',
+              headerStyle: { flex: '0 0 240px', minWidth: 200 },
+              cellStyle: { flex: '0 0 240px', minWidth: 200, alignItems: 'center' },
+            },
@@
-            meta: {
-              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
-              cellClassName: 'px-6 py-3 whitespace-nowrap',
-              headerStyle: { flex: '0 0 220px', minWidth: 200 },
-              cellStyle: { flex: '0 0 220px', minWidth: 200 },
-            },
+            meta: {
+              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-2.5 whitespace-nowrap',
+              headerStyle: { flex: '0 0 220px', minWidth: 200 },
+              cellStyle: { flex: '0 0 220px', minWidth: 200, alignItems: 'center' },
+            },
@@
-            meta: {
-              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
-              cellClassName: 'px-6 py-3 whitespace-nowrap text-gray-700',
-              headerStyle: { flex: '0 0 220px', minWidth: 200 },
-              cellStyle: { flex: '0 0 220px', minWidth: 200 },
-            },
+            meta: {
+              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-2.5 whitespace-nowrap text-gray-700',
+              headerStyle: { flex: '0 0 220px', minWidth: 200 },
+              cellStyle: { flex: '0 0 220px', minWidth: 200, alignItems: 'center' },
+            },
@@
-            meta: {
-              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
-              cellClassName: 'px-6 py-3 whitespace-nowrap text-center text-gray-700',
-              headerStyle: { flex: '0 0 140px', minWidth: 120, textAlign: 'center' },
-              cellStyle: { flex: '0 0 140px', minWidth: 120, justifyContent: 'center' },
-            },
+            meta: {
+              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
+              cellClassName: 'px-6 py-2.5 whitespace-nowrap text-center text-gray-700',
+              headerStyle: { flex: '0 0 140px', minWidth: 120, textAlign: 'center' },
+              cellStyle: { flex: '0 0 140px', minWidth: 120, justifyContent: 'center', alignItems: 'center' },
+            },
@@
-            meta: {
-              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
-              cellClassName: 'px-6 py-3 whitespace-nowrap text-center',
-              headerStyle: { flex: '0 0 160px', minWidth: 140, textAlign: 'center' },
-              cellStyle: { flex: '0 0 160px', minWidth: 140, justifyContent: 'center' },
-            },
+            meta: {
+              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
+              cellClassName: 'px-6 py-2.5 whitespace-nowrap text-center',
+              headerStyle: { flex: '0 0 160px', minWidth: 140, textAlign: 'center' },
+              cellStyle: { flex: '0 0 160px', minWidth: 140, justifyContent: 'center', alignItems: 'center' },
+            },
@@
-            meta: {
-              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
-              cellClassName: 'px-6 py-3 whitespace-nowrap text-center text-gray-700',
-              headerStyle: { flex: '0 0 160px', minWidth: 140, textAlign: 'center' },
-              cellStyle: { flex: '0 0 160px', minWidth: 140, justifyContent: 'center' },
-            },
+            meta: {
+              headerClassName: 'px-6 py-2.5 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
+              cellClassName: 'px-6 py-2.5 whitespace-nowrap text-center text-gray-700',
+              headerStyle: { flex: '0 0 160px', minWidth: 140, textAlign: 'center' },
+              cellStyle: { flex: '0 0 160px', minWidth: 140, justifyContent: 'center', alignItems: 'center' },
+            },
*** End Patch
PATCH
```

#### 3. DataTable base styles
**File**: `src/wrappers/data/DataTable.tsx`
**Changes**: Update default cell padding, add legacy blue dividers, and center content.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/wrappers/data/DataTable.tsx
@@
-const dataCellStyle = {
-  padding: `${spacingVar("sm")} ${spacingVar("md")}`,
-  borderBottom: `1px solid ${colorVar("surfaceMuted")}`,
-  fontFamily: fontVar("fontFamily"),
-  fontSize: fontSizeVar("sizeSm"),
-  color: colorVar("emphasisForeground"),
-  flex: "0 0 auto",
-  whiteSpace: "nowrap" as const,
-};
+const dataCellStyle = {
+  padding: "12px 24px",
+  borderBottom: "1px solid rgba(59, 130, 246, 0.25)",
+  fontFamily: fontVar("fontFamily"),
+  fontSize: fontSizeVar("sizeSm"),
+  color: colorVar("emphasisForeground"),
+  flex: "0 0 auto",
+  whiteSpace: "nowrap" as const,
+  alignItems: "center",
+};
@@
-                const baseRowStyle: CSSProperties = {
-                  position: "absolute",
-                  top,
-                  left: 0,
-                  right: 0,
-                  height: rowHeight,
-                  display: "flex",
-                  transition: "background-color 120ms ease",
-                  ...(externalStyle ?? {}),
-                };
+                const baseRowStyle: CSSProperties = {
+                  position: "absolute",
+                  top,
+                  left: 0,
+                  right: 0,
+                  height: rowHeight,
+                  display: "flex",
+                  transition: "background-color 120ms ease",
+                  borderBottom: "1px solid rgba(59, 130, 246, 0.25)",
+                  ...(externalStyle ?? {}),
+                };
*** End Patch
PATCH
```

## Phase 2: Document the Styling Update

### Overview
Record the new styling baseline so future planners/executors know the expected look.

### Changes Required:

#### 1. Discovery log
**File**: `docs/Tasks/phase-6-table-migration-discovery.md`
**Changes**: Append a note that styling parity is restored and reference the key files.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/phase-6-table-migration-discovery.md
@@
 - Added TanStack dependencies required by the wrapper (`package.json:17`). Manual overlay sweep via preview is still pending a GUI run; request next QA cycle to rerun the toolbar walk.
+- Styling parity restored for the virtualized rows (`src/components/EmployeeListContainer.tsx:829-1083`, `src/wrappers/data/DataTable.tsx:168-208`); avatars, padding, and blue dividers now match the legacy screenshot.
*** End Patch
PATCH
```

## Tests & Validation
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Manual: `npm run preview` → visit the employee list and compare row spacing/borders with the legacy screenshot (focus on avatar alignment and blue separators).

## Rollback
- `git checkout -- src/components/EmployeeListContainer.tsx src/wrappers/data/DataTable.tsx docs/Tasks/phase-6-table-migration-discovery.md`
- `npm run build`

## Handoff
- Mark this plan `_Unstarted_` in `PROGRESS.md` once drafted; executor will update status after completion.
- Log the plan in `docs/SESSION_HANDOFF.md` with validation commands and the reminder about the manual preview check.
- After execution, archive this plan under `docs/Archive/Plans/executed/` and update the discovery note if additional tweaks are required.
