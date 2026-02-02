## Metadata
# Phase 6 – Stage 3 Table Migration
#
# - **Task**: docs/Tasks/phase-6-table-migration-discovery.md#2025-10-11
# - **Related Docs**:
#   - docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md
#   - docs/Tasks/06_phase-6-migration-planning-prd.md
#   - docs/Tasks/phase-6-table-migration-discovery.md
#   - migration-prep/README.md, migration-prep/MANIFEST.md, migration-prep/RESEARCH_BRIEF.md
#   - ai-docs/wrappers-draft/data/DataTable.tsx
#   - ai-docs/playground/src/examples/table-demo/TableDemo.tsx
#
## Desired End State
- Employee list renders through the shared `DataTable` wrapper with TanStack virtualization, keeping header styling, row highlighting, and keyboard shortcuts identical to the legacy table.
- Selection mode (bulk edit, tag manager, import/export flows) continues to work with checkbox toggles, modifier clicks, and focus restoration for drawer triggers.
- Column visibility settings persist and drive the same overlay while the wrapper receives only the visible column definitions.
- Playwright coverage uses stable `data-testid` hooks provided by the wrapper rows and selection controls; console warnings remain gated by the existing guard.

### Key Discoveries:
- docs/Tasks/phase-6-table-migration-discovery.md:60-87 – wrapper capabilities vs. current table behaviour, selector risks, and missing selection hooks.
- src/components/EmployeeListContainer.tsx:2238-2425 – bespoke table markup powering selection, column toggles, and row keyboard shortcuts that must be preserved.
- src/wrappers/data/DataTable.tsx:112-445 – current Radix/TanStack virtualized wrapper structure to extend rather than rewrite.
- tests/employee-list.spec.ts:3-374 – Playwright selectors tied to `<tbody><tr>` semantics that must move to `data-testid`-based queries.

## What We're NOT Doing
- No column pinning, persisted column widths, or drag-and-drop reordering (deferred to the component-library hardening task).
- No server-driven filtering/sorting refactor; the existing memoised client-side transforms stay in place.
- No redesign of bulk-edit, tag manager, import/export overlays beyond ensuring focus contracts still hold.

## Implementation Approach
Replace the legacy table markup in `EmployeeListContainer` with the shared `DataTable`, supplying column definitions and row props that mirror the current UI (selection checkboxes, row buttons, status badges). Extend the component with `useMemo`/`useCallback` helpers so virtualization keeps focus and selection logic stable. Update Playwright selectors to rely on the new `data-testid` hooks. Leave documentation updates for the executor’s handoff (discovery results + session log).

## Phase 1: DataTable Integration

### Overview
Swap the bespoke `<table>` markup for the Radix/TanStack wrapper, introducing reusable column definitions, shared drawer opener logic, and stable row props for focus/selection.

### Changes Required:

#### 1. Import DataTable + TanStack helpers
**File**: `src/components/EmployeeListContainer.tsx`
**Changes**: Pull in `ColumnDef`/`Row` types and the shared DataTable wrapper so we can generate TanStack column definitions.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
+import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
+import type { ColumnDef, Row } from '@tanstack/react-table';
@@
-import { Overlay } from './common/Overlay';
+import { DataTable } from '../wrappers/data/DataTable';
+import { Overlay } from './common/Overlay';
*** End Patch
PATCH
```

#### 2. Share drawer opener + memoised table config
**File**: `src/components/EmployeeListContainer.tsx`
**Changes**: Convert `toggleEmployeeSelection` to `useCallback`, add a reusable drawer opener, and compute `rowHeight`, `tableHeight`, column definitions, and virtualized row props via `useMemo`/`useCallback`.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-  const toggleEmployeeSelection = (id: string) => {
-    setSelectedEmployees((prev) => {
-      const next = new Set(prev);
-      if (next.has(id)) {
-        next.delete(id);
-      } else {
-        next.add(id);
-      }
-      return next;
-    });
-  };
+  const handleOpenEmployeeDrawer = useCallback(
+    (employeeId: string, rowElement?: HTMLTableRowElement | null) => {
+      drawerReturnFocusRef.current = rowElement ?? rowRefs.current[employeeId] ?? null;
+      drawerReturnFocusIdRef.current = employeeId;
+      setIsDrawerLoading(true);
+      setActiveEmployeeId(employeeId);
+    },
+    [setActiveEmployeeId, setIsDrawerLoading]
+  );
+
+  const toggleEmployeeSelection = useCallback((id: string) => {
+    setSelectedEmployees((prev) => {
+      const next = new Set(prev);
+      if (next.has(id)) {
+        next.delete(id);
+      } else {
+        next.add(id);
+      }
+      return next;
+    });
+  }, []);
@@
-  const visibleCount = sortedEmployees.length;
+  const visibleCount = sortedEmployees.length;
+  const rowHeight = 68;
+  const tableHeight = useMemo(() => {
+    const boundedRowCount = Math.min(Math.max(visibleCount, 8), 16);
+    return boundedRowCount * rowHeight + rowHeight;
+  }, [visibleCount]);
+  const tableColumns = useMemo<ColumnDef<Employee>[]>(() => {
+    const columns: ColumnDef<Employee>[] = [];
+
+    if (isSelectionMode) {
+      columns.push({
+        id: 'selection',
+        enableSorting: false,
+        enableHiding: false,
+        header: () => (
+          <div className="flex items-center justify-center">
+            <input
+              type="checkbox"
+              data-testid="employee-table-select-all"
+              className="rounded text-blue-600 focus:ring-blue-500"
+              checked={visibleCount > 0 && selectedEmployees.size === visibleCount}
+              onChange={handleSelectAll}
+              aria-label="Выбрать всех сотрудников"
+            />
+          </div>
+        ),
+        cell: ({ row }) => {
+          const employee = row.original;
+          const isSelected = selectedEmployees.has(employee.id);
+          return (
+            <div className="flex items-center justify-center">
+              <input
+                type="checkbox"
+                data-testid="employee-row-checkbox"
+                className="rounded text-blue-600 focus:ring-blue-500"
+                checked={isSelected}
+                onChange={(event) => {
+                  event.stopPropagation();
+                  toggleEmployeeSelection(employee.id);
+                }}
+                aria-label={`Выбрать ${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
+              />
+            </div>
+          );
+        },
+        meta: {
+          headerClassName: 'px-4 py-3 flex items-center justify-center',
+          cellClassName: 'px-4 py-3 flex items-center justify-center',
+          headerStyle: { flex: '0 0 56px', minWidth: 56 },
+          cellStyle: { flex: '0 0 56px', minWidth: 56 },
+        },
+      });
+    }
+
+    COLUMN_ORDER.forEach((column) => {
+      if (!columnVisibility[column.key]) {
+        return;
+      }
+
+      switch (column.key) {
+        case 'fio':
+          columns.push({
+            id: 'fio',
+            header: column.label,
+            cell: ({ row }) => {
+              const employee = row.original;
+              return (
+                <div className="flex items-center">
+                  <img
+                    src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
+                    alt={`${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
+                    className="w-10 h-10 rounded-full object-cover"
+                  />
+                  <div className="ml-3 space-y-1">
+                    <button
+                      type="button"
+                      onClick={(event) => {
+                        event.stopPropagation();
+                        const rowElement = event.currentTarget.closest('[data-row-id]') as HTMLTableRowElement | null;
+                        handleOpenEmployeeDrawer(employee.id, rowElement);
+                      }}
+                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
+                    >
+                      {employee.personalInfo.lastName} {employee.personalInfo.firstName}
+                    </button>
+                    <div className="text-xs text-gray-500">{employee.credentials.wfmLogin}</div>
+                  </div>
+                </div>
+              );
+            },
+            meta: {
+              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-3 whitespace-nowrap',
+              headerStyle: { flex: '1 1 280px', minWidth: 240 },
+              cellStyle: { flex: '1 1 280px', minWidth: 240 },
+            },
+          });
+          break;
+        case 'position':
+          columns.push({
+            id: 'position',
+            header: column.label,
+            cell: ({ row }) => (
+              <span className="text-gray-700 whitespace-nowrap">{row.original.workInfo.position}</span>
+            ),
+            meta: {
+              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-3 whitespace-nowrap text-gray-700',
+              headerStyle: { flex: '0 0 200px', minWidth: 180 },
+              cellStyle: { flex: '0 0 200px', minWidth: 180 },
+            },
+          });
+          break;
+        case 'orgUnit':
+          columns.push({
+            id: 'orgUnit',
+            header: column.label,
+            cell: ({ row }) => (
+              <span className="text-gray-700 whitespace-nowrap">{row.original.orgPlacement.orgUnit}</span>
+            ),
+            meta: {
+              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-3 whitespace-nowrap text-gray-700',
+              headerStyle: { flex: '0 0 240px', minWidth: 200 },
+              cellStyle: { flex: '0 0 240px', minWidth: 200 },
+            },
+          });
+          break;
+        case 'team':
+          columns.push({
+            id: 'team',
+            header: column.label,
+            cell: ({ row }) => {
+              const employee = row.original;
+              return (
+                <div className="flex items-center gap-2">
+                  <span
+                    className="w-2.5 h-2.5 rounded-full"
+                    style={{ backgroundColor: employee.workInfo.team.color }}
+                  />
+                  <span className="text-gray-700">{employee.workInfo.team.name}</span>
+                </div>
+              );
+            },
+            meta: {
+              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-3 whitespace-nowrap',
+              headerStyle: { flex: '0 0 220px', minWidth: 200 },
+              cellStyle: { flex: '0 0 220px', minWidth: 200 },
+            },
+          });
+          break;
+        case 'scheme':
+          columns.push({
+            id: 'scheme',
+            header: column.label,
+            cell: ({ row }) => (
+              <span className="text-gray-700 whitespace-nowrap">{row.original.orgPlacement.workScheme?.name ?? '—'}</span>
+            ),
+            meta: {
+              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider',
+              cellClassName: 'px-6 py-3 whitespace-nowrap text-gray-700',
+              headerStyle: { flex: '0 0 220px', minWidth: 200 },
+              cellStyle: { flex: '0 0 220px', minWidth: 200 },
+            },
+          });
+          break;
+        case 'hourNorm':
+          columns.push({
+            id: 'hourNorm',
+            header: column.label,
+            cell: ({ row }) => (
+              <span className="text-gray-700 text-center w-full">{row.original.orgPlacement.hourNorm}</span>
+            ),
+            meta: {
+              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
+              cellClassName: 'px-6 py-3 whitespace-nowrap text-center text-gray-700',
+              headerStyle: { flex: '0 0 140px', minWidth: 120, textAlign: 'center' },
+              cellStyle: { flex: '0 0 140px', minWidth: 120, justifyContent: 'center' },
+            },
+          });
+          break;
+        case 'status':
+          columns.push({
+            id: 'status',
+            header: column.label,
+            cell: ({ row }) => {
+              const employee = row.original;
+              return (
+                <span
+                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[employee.status]}`}
+                >
+                  {STATUS_LABELS[employee.status]}
+                </span>
+              );
+            },
+            meta: {
+              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
+              cellClassName: 'px-6 py-3 whitespace-nowrap text-center',
+              headerStyle: { flex: '0 0 160px', minWidth: 140, textAlign: 'center' },
+              cellStyle: { flex: '0 0 160px', minWidth: 140, justifyContent: 'center' },
+            },
+          });
+          break;
+        case 'hireDate':
+          columns.push({
+            id: 'hireDate',
+            header: column.label,
+            cell: ({ row }) => (
+              <span className="text-gray-700 whitespace-nowrap">{row.original.workInfo.hireDate.toLocaleDateString('ru-RU')}</span>
+            ),
+            meta: {
+              headerClassName: 'px-6 py-3 text-xs font-semibold uppercase text-gray-600 tracking-wider text-center',
+              cellClassName: 'px-6 py-3 whitespace-nowrap text-center text-gray-700',
+              headerStyle: { flex: '0 0 160px', minWidth: 140, textAlign: 'center' },
+              cellStyle: { flex: '0 0 160px', minWidth: 140, justifyContent: 'center' },
+            },
+          });
+          break;
+        default:
+          break;
+      }
+    });
+
+    return columns;
+  }, [columnVisibility, handleOpenEmployeeDrawer, handleSelectAll, isSelectionMode, selectedEmployees, toggleEmployeeSelection, visibleCount]);
+  const getTableRowProps = useCallback(
+    ({ row }: { row: Row<Employee>; index: number }) => {
+      const employee = row.original;
+      const isSelected = selectedEmployees.has(employee.id);
+
+      return {
+        ref: (element: HTMLTableRowElement | null) => {
+          if (element) {
+            rowRefs.current[employee.id] = element;
+          } else {
+            delete rowRefs.current[employee.id];
+          }
+        },
+        tabIndex: 0,
+        'data-testid': 'employee-table-row',
+        'data-row-id': employee.id,
+        className: `transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
+          isSelected ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'
+        }`,
+        'aria-selected': isSelectionMode ? isSelected : undefined,
+        onFocus: () => {
+          drawerReturnFocusIdRef.current = employee.id;
+        },
+        onClick: (event) => {
+          const target = event.target as HTMLElement;
+          if (target.closest('input[type="checkbox"]') || target.closest('button')) {
+            return;
+          }
+          if (event.metaKey || event.ctrlKey) {
+            enableSelectionMode();
+            toggleEmployeeSelection(employee.id);
+            return;
+          }
+          if (isSelectionMode) {
+            toggleEmployeeSelection(employee.id);
+            return;
+          }
+          handleOpenEmployeeDrawer(employee.id, event.currentTarget as HTMLTableRowElement);
+        },
+        onKeyDown: (event) => {
+          if (event.key === 'Escape' && isSelectionMode) {
+            event.preventDefault();
+            clearSelection();
+            return;
+          }
+          if (event.key === 'Enter') {
+            event.preventDefault();
+            if (isSelectionMode) {
+              toggleEmployeeSelection(employee.id);
+            } else {
+              handleOpenEmployeeDrawer(employee.id, event.currentTarget as HTMLTableRowElement);
+            }
+            return;
+          }
+          if (event.key === ' ') {
+            event.preventDefault();
+            enableSelectionMode();
+            toggleEmployeeSelection(employee.id);
+          }
+        },
+      };
+    },
+    [clearSelection, enableSelectionMode, handleOpenEmployeeDrawer, isSelectionMode, selectedEmployees, toggleEmployeeSelection]
+  );
*** End Patch
PATCH
```

#### 3. Swap the legacy `<table>` for `<DataTable>`
**File**: `src/components/EmployeeListContainer.tsx`
**Changes**: Remove the bespoke table markup and render the shared wrapper with the computed columns/row props.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-        {visibleCount === 0 ? (
-          <div className="p-12 text-center text-gray-500">
-            <div className="text-5xl mb-3">🔍</div>
-            <h3 className="text-lg font-semibold text-gray-900 mb-1">Сотрудники не найдены</h3>
-            <p className="text-sm">Измените фильтры или снимите ограничения, чтобы увидеть сотрудников</p>
-          </div>
-        ) : (
-          <div className="overflow-x-auto">
-            <table className="min-w-full divide-y divide-gray-200 text-sm">
-              <thead className="bg-gray-50">
-                <tr>
-                  {isSelectionMode && (
-                    <th className="w-12 px-4 py-3">
-                      <input
-                        type="checkbox"
-                        className="rounded text-blue-600 focus:ring-blue-500"
-                        checked={visibleCount > 0 && selectedEmployees.size === visibleCount}
-                        onChange={handleSelectAll}
-                        aria-label="Выбрать всех сотрудников"
-                      />
-                    </th>
-                  )}
-                  {COLUMN_ORDER.filter((column) => columnVisibility[column.key]).map((column) => (
-                    <th
-                      key={column.key}
-                      className={`px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
-                        column.key === 'hourNorm' || column.key === 'status' || column.key === 'hireDate'
-                          ? 'text-center'
-                          : 'text-left'
-                      }`}
-                    >
-                      {column.label}
-                    </th>
-                  ))}
-                </tr>
-              </thead>
-              <tbody className="bg-white divide-y divide-gray-100">
-                {sortedEmployees.map((employee) => {
-                  const isSelected = selectedEmployees.has(employee.id);
-
-                  const openEmployeeDrawer = (rowElement?: HTMLTableRowElement | null) => {
-                    drawerReturnFocusRef.current = rowElement ?? rowRefs.current[employee.id] ?? null;
-                    drawerReturnFocusIdRef.current = employee.id;
-                    setIsDrawerLoading(true);
-                    setActiveEmployeeId(employee.id);
-                  };
-
-                  const handleRowSelectionToggle = () => {
-                    toggleEmployeeSelection(employee.id);
-                  };
-
-                  return (
-                    <tr
-                      key={employee.id}
-                      ref={(element) => {
-                        rowRefs.current[employee.id] = element;
-                      }}
-                      tabIndex={0}
-                      onClick={(event) => {
-                        const target = event.target as HTMLElement;
-                        if (target.closest('input[type="checkbox"]') || target.closest('button')) {
-                          return;
-                        }
-
-                        if (event.metaKey || event.ctrlKey) {
-                          enableSelectionMode();
-                          handleRowSelectionToggle();
-                          return;
-                        }
-
-                        if (isSelectionMode) {
-                          handleRowSelectionToggle();
-                          return;
-                        }
-
-                        openEmployeeDrawer(event.currentTarget as HTMLTableRowElement);
-                      }}
-                      onKeyDown={(event) => {
-                        if (event.key === 'Escape' && isSelectionMode) {
-                          event.preventDefault();
-                          clearSelection();
-                          return;
-                        }
-
-                        if (event.key === 'Enter') {
-                          event.preventDefault();
-                          if (isSelectionMode) {
-                            handleRowSelectionToggle();
-                          } else {
-                            openEmployeeDrawer(event.currentTarget as HTMLTableRowElement);
-                          }
-                          return;
-                        }
-
-                        if (event.key === ' ') {
-                          event.preventDefault();
-                          enableSelectionMode();
-                          handleRowSelectionToggle();
-                        }
-                      }}
-                      className={`transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
-                        isSelected ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'
-                      }`}
-                    >
-                      {isSelectionMode && (
-                        <td className="px-4 py-3">
-                          <input
-                            type="checkbox"
-                            className="rounded text-blue-600 focus:ring-blue-500"
-                            checked={isSelected}
-                            onChange={(event) => {
-                              event.stopPropagation();
-                              toggleEmployeeSelection(employee.id);
-                            }}
-                            aria-label={`Выбрать ${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
-                          />
-                        </td>
-                      )}
-
-                      {columnVisibility.fio && (
-                        <td className="px-6 py-3 whitespace-nowrap">
-                          <div className="flex items-center">
-                            <img
-                              src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
-                              alt={`${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
-                              className="w-10 h-10 rounded-full object-cover"
-                            />
-                            <div className="ml-3 space-y-1">
-                              <button
-                                type="button"
-                                onClick={(event) => {
-                                  event.stopPropagation();
-                                  const rowElement = (event.currentTarget.closest('tr') as HTMLTableRowElement) ??
-                                    null;
-                                  openEmployeeDrawer(rowElement);
-                                }}
-                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
-                              >
-                                {employee.personalInfo.lastName} {employee.personalInfo.firstName}
-                              </button>
-                              <div className="text-xs text-gray-500">{employee.credentials.wfmLogin}</div>
-                            </div>
-                          </div>
-                        </td>
-                      )}
-
-                      {columnVisibility.position && (
-                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">{employee.workInfo.position}</td>
-                      )}
-
-                      {columnVisibility.orgUnit && (
-                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">{employee.orgPlacement.orgUnit}</td>
-                      )}
-
-                      {columnVisibility.team && (
-                        <td className="px-6 py-3 whitespace-nowrap">
-                          <div className="flex items-center gap-2">
-                            <span
-                              className="w-2.5 h-2.5 rounded-full"
-                              style={{ backgroundColor: employee.workInfo.team.color }}
-                            />
-                            <span className="text-gray-700">{employee.workInfo.team.name}</span>
-                          </div>
-                        </td>
-                      )}
-
-                      {columnVisibility.scheme && (
-                        <td className="px-6 py-3 whitespace-nowrap text-gray-700">
-                          {employee.orgPlacement.workScheme?.name ?? '—'}
-                        </td>
-                      )}
-
-                      {columnVisibility.hourNorm && (
-                        <td className="px-6 py-3 whitespace-nowrap text-center text-gray-700">
-                          {employee.orgPlacement.hourNorm}
-                        </td>
-                      )}
-
-                      {columnVisibility.status && (
-                        <td className="px-6 py-3 whitespace-nowrap text-center">
-                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[employee.status]}`}>
-                            {STATUS_LABELS[employee.status]}
-                          </span>
-                        </td>
-                      )}
-
-                      {columnVisibility.hireDate && (
-                        <td className="px-6 py-3 whitespace-nowrap text-center text-gray-700">
-                          {employee.workInfo.hireDate.toLocaleDateString('ru-RU')}
-                        </td>
-                      )}
-                    </tr>
-                  );
-                })}
-              </tbody>
-            </table>
-          </div>
-        )}
+        {visibleCount === 0 ? (
+          <div className="p-12 text-center text-gray-500">
+            <div className="text-5xl mb-3">🔍</div>
+            <h3 className="text-lg font-semibold text-gray-900 mb-1">Сотрудники не найдены</h3>
+            <p className="text-sm">Измените фильтры или снимите ограничения, чтобы увидеть сотрудников</p>
+          </div>
+        ) : (
+          <DataTable<Employee>
+            data={sortedEmployees}
+            columns={tableColumns}
+            rowHeight={rowHeight}
+            height={tableHeight}
+            testId="employee-table"
+            ariaLabel="Список сотрудников"
+            getRowId={(row) => row.id}
+            getRowProps={getTableRowProps}
+          />
+        )}
*** End Patch
PATCH
```

## Phase 2: Playwright Selector Updates

### Overview
Align automated tests with the new `data-testid` hooks exposed by the virtualized table.

### Changes Required:

#### 1. Update selectors to `data-testid`
**File**: `tests/employee-list.spec.ts`
**Changes**: Point row/checkbox lookups at the new test ids.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/employee-list.spec.ts
@@
-const ROW_SELECTOR = 'tbody tr';
-const getFirstRowCheckbox = (page: Page) => page.locator('tbody tr input[type="checkbox"]').first();
+const ROW_SELECTOR = '[data-testid="employee-table-row"]';
+const getFirstRowCheckbox = (page: Page) => page.getByTestId('employee-row-checkbox').first();
*** End Patch
PATCH
```

#### 2. Replace legacy table queries
**File**: `tests/employee-list.spec.ts`
**Changes**: Swap every `tbody`-based locator for the new test ids (rows, row checkboxes, header checkbox).
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/employee-list.spec.ts
@@
-    const row = page.locator(ROW_SELECTOR).first();
+    const row = page.locator(ROW_SELECTOR).first();
@@
-    const headerCheckbox = page.locator('thead input[type="checkbox"]');
+    const headerCheckbox = page.getByTestId('employee-table-select-all');
@@
-    const headerCheckbox = page.locator('thead input[type="checkbox"]');
+    const headerCheckbox = page.getByTestId('employee-table-select-all');
@@
-    const headerCheckbox = page.locator('thead input[type="checkbox"]');
+    const headerCheckbox = page.getByTestId('employee-table-select-all');
@@
-    const checkboxes = page.locator('tbody tr input[type="checkbox"]');
+    const checkboxes = page.getByTestId('employee-row-checkbox');
@@
-    await expect(page.locator('tbody tr').first().getByText('В отпуске')).toBeVisible();
+    await expect(page.getByTestId('employee-table-row').first().getByText('В отпуске')).toBeVisible();
@@
-    await expect(page.locator('tbody tr').nth(1).getByText('В отпуске')).toBeVisible();
+    await expect(page.getByTestId('employee-table-row').nth(1).getByText('В отпуске')).toBeVisible();
@@
-    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
+    const firstRowCheckbox = page.getByTestId('employee-row-checkbox').first();
@@
-    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
+    const firstRowCheckbox = page.getByTestId('employee-row-checkbox').first();
@@
-    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
+    const firstRowCheckbox = page.getByTestId('employee-row-checkbox').first();
@@
-    const firstRowCheckbox = page.locator('tbody tr input[type="checkbox"]').first();
+    const firstRowCheckbox = page.getByTestId('employee-row-checkbox').first();
@@
-    await page.locator('tbody tr input[type="checkbox"]').nth(0).click();
+    await page.getByTestId('employee-row-checkbox').nth(0).click();
@@
-    await page.locator('tbody tr input[type="checkbox"]').nth(1).click();
+    await page.getByTestId('employee-row-checkbox').nth(1).click();
*** End Patch
PATCH
```

## Tests & Validation
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Manual verification on `npm run preview` (bulk edit → tag manager → column settings → import/export) watching for Radix warnings and confirming row focus after drawer close.

## Rollback
- `git checkout -- src/components/EmployeeListContainer.tsx tests/employee-list.spec.ts`
- Re-run `npm run build` to verify baseline restores without virtualization.

## Handoff
- Mark the plan `_Completed_` in `PROGRESS.md` and archive it to `docs/Archive/Plans/2025-10-10_table-migration.plan.md` once code + tests succeed.
- Append execution results (selection focus + virtualization notes) to `docs/Tasks/phase-6-table-migration-discovery.md` under a new **Execution Results – 2025-10-10** bullet list.
- Log the outcome, tests, and any console warnings in `docs/SESSION_HANDOFF.md`, keeping the next role as Executor until QA signs off.
