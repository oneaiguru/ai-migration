# Table Migration – Phase 6 Task 3

## Metadata
## Required Reading (read in full)
- PROGRESS.md
- docs/SOP/plan-execution-sop.md
- docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md

- **Objective**: replace legacy `<table>` implementation with the shared `DataTable` wrapper (TanStack) while preserving selection mode, exports, and keyboard behaviour.
- **Scope**: `src/components/EmployeeListContainer.tsx`, new helper component `src/components/EmployeeListTable.tsx`, table wrapper tweaks if required, Playwright selectors.
- **References**: `src/wrappers/data/DataTable.tsx`, `ai-docs/playground/src/examples/table-demo/TableDemo.tsx`.

## Pre-checks
```bash
set -euo pipefail
npm install
git status -sb
```

## Change Steps

### 1. Add reusable EmployeeListTable component
```bash
cat <<'EOF_TABLE' > src/components/EmployeeListTable.tsx
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@wrappers/data/DataTable';
import { Employee, EmployeeStatus } from '../types/employee';

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Активен',
  vacation: 'В отпуске',
  probation: 'Испытательный',
  inactive: 'Неактивен',
  terminated: 'Уволен',
};

export interface EmployeeListTableProps {
  employees: Employee[];
  columnVisibility: Record<string, boolean>;
  selectedIds: Set<string>;
  focusedId: string | null;
  onRowOpen: (employee: Employee) => void;
  onSelectionToggle: (employee: Employee) => void;
}

export function EmployeeListTable({
  employees,
  columnVisibility,
  selectedIds,
  focusedId,
  onRowOpen,
  onSelectionToggle,
}: EmployeeListTableProps) {
  const columns = useMemo<ColumnDef<Employee>[]>(() => {
    const base: ColumnDef<Employee>[] = [
      {
        id: 'fio',
        header: 'Ф.И.О.',
        meta: { cellClassName: 'w-[260px]' },
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
                alt={`${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="space-y-1">
                <button
                  type="button"
                  data-command="openDrawer"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  {employee.personalInfo.lastName} {employee.personalInfo.firstName}
                </button>
                <div className="text-xs text-gray-500">{employee.credentials.wfmLogin}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'position',
        header: 'Должность',
        cell: ({ row }) => row.original.workInfo.position,
        meta: { cellClassName: 'whitespace-nowrap text-gray-700' },
      },
      {
        id: 'orgUnit',
        header: 'Точка оргструктуры',
        cell: ({ row }) => row.original.orgPlacement.orgUnit,
      },
      {
        id: 'team',
        header: 'Команда',
        cell: ({ row }) => {
          const team = row.original.workInfo.team;
          return (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: team.color }} />
              <span>{team.name}</span>
            </div>
          );
        },
      },
      {
        id: 'scheme',
        header: 'Схема работы',
        cell: ({ row }) => row.original.orgPlacement.workScheme?.name ?? '—',
      },
      {
        id: 'hourNorm',
        header: 'Норма часов',
        cell: ({ row }) => row.original.orgPlacement.hourNorm,
        meta: { cellClassName: 'text-center' },
      },
      {
        id: 'status',
        header: 'Статус',
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              employee.status === 'active'
                ? 'bg-green-100 text-green-800'
                : employee.status === 'vacation'
                ? 'bg-yellow-100 text-yellow-800'
                : employee.status === 'probation'
                ? 'bg-blue-100 text-blue-800'
                : employee.status === 'inactive'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {STATUS_LABELS[employee.status]}
            </span>
          );
        },
        meta: { cellClassName: 'text-center' },
      },
      {
        id: 'hireDate',
        header: 'Дата найма',
        cell: ({ row }) => row.original.workInfo.hireDate.toLocaleDateString('ru-RU'),
        meta: { cellClassName: 'text-center' },
      },
    ];

    return base.filter((column) => columnVisibility[column.id ?? ''] !== false);
  }, [columnVisibility]);

  return (
    <DataTable
      data={employees}
      columns={columns}
      testId="employee-data-table"
      ariaLabel="Список сотрудников"
      enableKeyboardNavigation
      getRowProps={({ row }) => {
        const employee = row.original;
        const isSelected = selectedIds.has(employee.id);
        return {
          className: `flex items-center border-b border-gray-200 px-6 py-3 text-sm ${
            isSelected ? 'bg-blue-50' : 'bg-white'
          }`,
          'data-employee-row': employee.id,
          onClick: (event) => {
            const target = event.target as HTMLElement;
            if (target.closest('[data-command="toggleSelection"]')) {
              onSelectionToggle(employee);
              return;
            }
            onRowOpen(employee);
          },
          onKeyDown: (event) => {
            if (event.key === ' ') {
              event.preventDefault();
              onSelectionToggle(employee);
              return true;
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              onRowOpen(employee);
              return true;
            }
            return false;
          },
          onFocus: () => {},
          style: { cursor: 'pointer' },
          tabIndex: focusedId === employee.id ? 0 : -1,
        };
      }}
    />
  );
}
EOF_TABLE
```

### 2. Integrate DataTable in EmployeeListContainer
- Replace legacy `<table>` markup with `<EmployeeListTable />`.
- Remove manual selection handlers tied to DOM events and wire into `onSelectionToggle`/`onRowOpen` props.
- Feed `columnVisibility` to new component and keep column settings UI as source of truth.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-import React, { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';
-import EmployeeEditDrawer from './EmployeeEditDrawer';
-import { Overlay } from './common/Overlay';
+import React, { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';
+import EmployeeEditDrawer from './EmployeeEditDrawer';
+import { Overlay } from './common/Overlay';
+import { EmployeeListTable } from './EmployeeListTable';
@@
-      <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
-        <div className="sr-only" aria-live="polite">{liveMessage}</div>
-        <div className="border-b border-gray-200 p-6 space-y-4">
+      <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
+        <div className="sr-only" aria-live="polite">{liveMessage}</div>
+        <div className="border-b border-gray-200 p-6 space-y-4">
@@
-        {showTable && (
-          <div className="relative overflow-x-auto">
-            <table className="min-w-full divide-y divide-gray-200 text-sm">
-              <thead className="bg-gray-50">
-                <tr>
-                  <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">Ф.И.О.</th>
-                  {columnVisibility.position && (
-                    <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">Должность</th>
-                  )}
-                  {columnVisibility.orgUnit && (
-                    <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">Точка оргструктуры</th>
-                  )}
-                  {columnVisibility.team && (
-                    <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">Команда</th>
-                  )}
-                  {columnVisibility.scheme && (
-                    <th scope="col" className="px-6 py-3 text-left font-semibold text-gray-600">Схема работы</th>
-                  )}
-                  {columnVisibility.hourNorm && (
-                    <th scope="col" className="px-6 py-3 text-center font-semibold text-gray-600">Норма часов</th>
-                  )}
-                  {columnVisibility.status && (
-                    <th scope="col" className="px-6 py-3 text-center font-semibold text-gray-600">Статус</th>
-                  )}
-                  {columnVisibility.hireDate && (
-                    <th scope="col" className="px-6 py-3 text-center font-semibold text-gray-600">Дата найма</th>
-                  )}
-                </tr>
-              </thead>
-              <tbody className="divide-y divide-gray-200 bg-white">
-                {sortedEmployees.map((employee) => {
-                  const isSelected = selectedEmployees.has(employee.id);
-                  const isActiveFocus = focusEmployeeId === employee.id;
-                  return (
-                    <tr
-                      key={employee.id}
-                      ref={(row) => {
-                        rowRefs.current[employee.id] = row;
-                      }}
-                      className={`hover:bg-blue-50 ${
-                        isSelected ? 'bg-blue-50' : ''
-                      }`}
-                      tabIndex={isActiveFocus ? 0 : -1}
-                      onFocus={() => {
-                        if (!selectedEmployees.has(employee.id)) {
-                          setActiveEmployeeId(employee.id);
-                        }
-                      }}
-                    >
-                      <td className="px-6 py-3 whitespace-nowrap">
-                        <div className="flex items-center">
-                          <img
-                            src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
-                            alt={`${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
-                            className="w-10 h-10 rounded-full object-cover"
-                          />
-                          <div className="ml-3 space-y-1">
-                            <button
-                              type="button"
-                              onClick={(event) => {
-                                event.stopPropagation();
-                                const rowElement = (event.currentTarget.closest('tr') as HTMLTableRowElement) ??
-                                  null;
-                                openEmployeeDrawer(rowElement);
-                              }}
-                              className="text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
-                            >
-                              {employee.personalInfo.lastName} {employee.personalInfo.firstName}
-                            </button>
-                            <div className="text-xs text-gray-500">{employee.credentials.wfmLogin}</div>
-                          </div>
-                        </div>
-                      </td>
-                      {/* …other column cells… */}
-                    </tr>
-                  );
-                })}
-              </tbody>
-            </table>
-          </div>
-        )}
+        {showTable && (
+          <EmployeeListTable
+            employees={sortedEmployees}
+            columnVisibility={columnVisibility}
+            selectedIds={selectedEmployees}
+            focusedId={focusEmployeeId}
+            onRowOpen={(employee) => setActiveEmployeeId(employee.id)}
+            onSelectionToggle={(employee) => toggleEmployeeSelection(employee.id)}
+          />
+        )}
*** End Patch
PATCH
```

### 3. Remove legacy row refs
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
-  const drawerReturnFocusRef = useRef<HTMLTableRowElement | null>(null);
+  const rowRefs = useRef<Record<string, HTMLElement | null>>({});
+  const drawerReturnFocusRef = useRef<HTMLElement | null>(null);
*** End Patch
PATCH
```
(Update any usages accordingly; the executor should adjust focus restoration to reference `document.querySelector` for new table rows.)

### 4. Update focus restoration helper
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-    let element = drawerReturnFocusRef.current;
-    if ((!element || !element.isConnected) && focusId) {
-      element = rowRefs.current[focusId] ?? null;
-    }
+    let element = drawerReturnFocusRef.current;
+    if ((!element || !element.isConnected) && focusId) {
+      element = rowRefs.current[focusId] ?? document.querySelector<HTMLElement>(`[data-employee-row="${focusId}"]`);
+    }
*** End Patch
PATCH
```

(Ensure `EmployeeListTable` sets `data-employee-row` on each row when wiring `getRowProps`.)

### 5. Tag selection toggles inside DataTable
Add checkbox column for bulk selection.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListTable.tsx
@@
   const columns = useMemo<ColumnDef<Employee>[]>(() => {
     const base: ColumnDef<Employee>[] = [
+      {
+        id: 'select',
+        header: '',
+        meta: { cellClassName: 'w-12' },
+        cell: ({ row }) => {
+          const employee = row.original;
+          const checked = selectedIds.has(employee.id);
+          return (
+            <input
+              type="checkbox"
+              data-command="toggleSelection"
+              checked={checked}
+              onChange={() => onSelectionToggle(employee)}
+              className="rounded text-blue-600 focus:ring-blue-500"
+            />
+          );
+        },
+      },
*** End Patch
PATCH
```

Ensure `selectedIds` available inside `columns` closure by including in dependency array.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListTable.tsx
@@
-  }, [columnVisibility]);
+  }, [columnVisibility, onRowOpen, onSelectionToggle, selectedIds]);
*** End Patch
PATCH
```

### 6. Tests
- Update selectors to reflect new table structure and `data-employee-row` marker.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/employee-list.spec.ts
@@
-const ROW_SELECTOR = 'tbody tr';
+const ROW_SELECTOR = '[data-employee-row]';
*** End Patch
PATCH
```

### 7. Clean artifacts
```bash
rm -rf test-results
```

## Tests & Verification
```bash
set -euo pipefail
npm run build
npm run test -- --project=chromium --workers=1
```

## Acceptance Checklist
- [ ] Employee list renders through `DataTable` with virtualization smooth (verify via manual scroll if possible).
- [ ] Selection mode banners and bulk actions behave as before.
- [ ] Playwright suite passes without adapting selectors.

## Rollback
```bash
set -euo pipefail
git reset --hard HEAD
git clean -fd src/components/EmployeeListTable.tsx
```

---

**Next Plan:** `plans/04_cleanup.plan.md`
