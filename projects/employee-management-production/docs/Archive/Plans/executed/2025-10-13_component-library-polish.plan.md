## Metadata
- **Plan ID**: 2025-10-13_component-library-polish
- **Status**: Ready for execution
- **Owner Role**: Executor
- **Related Docs**: `docs/Tasks/phase-7-component-library-followups.md`, `docs/Tasks/phase-7-component-library-discovery.md`, `ai-docs/llm-reference/AiDocsReference.md`, `docs/System/parity-roadmap.md`

## Desired End State
- Employee list import/export flows delegate CSV/Excel parsing and generation to dedicated helpers with reusable utility tests, enabling exec-ready data exports and stricter validation.
- Employee edit drawer uses a rich text editor with TipTap-style formatting while keeping RHF + FormField wiring and accessibility.
- Virtualized table benchmarks (10k–50k rows) are automated with a repeatable script; results documented in discovery notes for future parity audits.
- Documentation (`phase-7` discovery/follow-ups, parity roadmap) reflects the new utilities, editor integration, and performance baseline.

### Key Discoveries
- `docs/Tasks/phase-7-component-library-followups.md:21-31` – Lists Phase 7 feature gaps (MiniSearch, RTE, CSV helpers) and required benchmarks.
- `ai-docs/llm-reference/AiDocsReference.md:7-12` – External review highlighting the need for CSV/Excel helpers, rich-text editor, and virtualization benchmarking.
- `src/components/EmployeeList/useEmployeeListState.tsx:1836-2109` – Current inline CSV export logic and ad-hoc import validation.
- `src/components/EmployeeEditDrawer.tsx:318-335` – Textarea-based notes field slated for rich text support.
- `src/wrappers/data/DataTable.tsx:118-148` – DataTable implementation targeted for performance benchmarking.

## What We're NOT Doing
- Implementing MiniSearch (covered by the upcoming Phase 7 search plan).
- Activating Tremor/Recharts dashboards (tracked in Phase 9).
- Refactoring backend APIs or altering data models beyond client-side helpers.
- Rewriting existing tests outside the new utility/editor coverage required here.

## Implementation Approach
Introduce shared CSV/Excel utilities and corresponding tests, replace drawer textarea with a reusable rich text editor built on TipTap, and add an automation script to measure virtualized table performance. Update documentation to capture these changes and require validations via build/unit/Playwright plus the new benchmark command.

## Phase 1 – Shared CSV/Excel Helpers

### Overview
Extract import/export logic into reusable utilities backed by Papa Parse + SheetJS so flows can be shared across modules and validated independently.

### Changes Required:

#### 1. Dependencies
**File**: `package.json`
**Changes**: Add runtime dependencies for CSV/Excel helpers and a benchmark npm script.

```diff
     "dependencies": {
+      "papaparse": "^5.4.1",
+      "xlsx": "^0.18.5",
       "@radix-ui/react-dialog": "^1.0.5",
@@
     "scripts": {
       "test:unit": "vitest run",
+      "benchmark:datatable": "tsx scripts/benchmarks/datatable.ts"
     }
```

#### 2. Shared Helpers
**File**: `src/utils/importExport.ts`
**Changes**: New module exposing CSV/Excel parsing and export helpers with schema-aware validation.

```ts
import type { Employee } from '@/types/employee';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface CsvValidationResult {
  valid: boolean;
  missingHeaders: string[];
  message?: string;
}

export const generateEmployeeCsv = (employees: Employee[], columns: Array<{ key: string; label: string }>) => {
  const header = columns.map((column) => column.label);
  const rows = employees.map((employee) =>
    columns.map((column) => {
      switch (column.key) {
        case 'fio':
          return `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim();
        case 'position':
          return employee.workInfo.position;
        case 'orgUnit':
          return employee.orgPlacement.orgUnit;
        case 'team':
          return employee.workInfo.team.name;
        case 'scheme':
          return employee.orgPlacement.workScheme?.name ?? '';
        case 'hourNorm':
          return String(employee.orgPlacement.hourNorm);
        case 'status':
          return employee.status;
        case 'hireDate':
          return employee.workInfo.hireDate.toISOString();
        default:
          return '';
      }
    }),
  );
  return Papa.unparse({ fields: header, data: rows });
};

export const validateCsvHeaders = (text: string, required: string[]): CsvValidationResult => {
  const [firstLine] = text.split(/\r?\n/).filter(Boolean);
  if (!firstLine) {
    return { valid: false, missingHeaders: required, message: 'Файл не содержит данных.' };
  }
  const headers = firstLine.split(',').map((column) => column.replace(/"/g, '').trim().toLowerCase());
  const missing = required.filter((column) => !headers.includes(column.toLowerCase()));
  return { valid: missing.length === 0, missingHeaders: missing };
};

export const parseWorkbookHeaders = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheet];
  const json = XLSX.utils.sheet_to_json<string[]>({ ...worksheet, '!range': undefined }, { header: 1 });
  const [headerRow] = json;
  return (headerRow ?? []).map((value) => String(value ?? '').trim());
};
```

#### 3. Utility Tests
**File**: `src/utils/__tests__/importExport.test.ts`
**Changes**: Add Vitest coverage for helper functions.

```ts
import { describe, expect, it } from 'vitest';
import { generateEmployeeCsv, validateCsvHeaders } from '@/utils/importExport';
import type { Employee } from '@/types/employee';

describe('import/export helpers', () => {
  const employee: Employee = {
    id: '1',
    personalInfo: { lastName: 'Иванов', firstName: 'Иван', middleName: null, photo: null },
    credentials: { wfmLogin: 'ivanov', email: 'ivanov@example.com' },
    workInfo: {
      position: 'Оператор',
      team: { id: 'team-1', name: 'Команда 1', color: '#2563eb' },
      hireDate: new Date('2022-01-01'),
      scheme: null,
    },
    orgPlacement: { orgUnit: 'Москва', hourNorm: 40, workScheme: null, workSchemeHistory: [] },
    performance: { qualityScore: 98 },
    tags: ['ментор'],
    status: 'active',
    tasks: [],
    metadata: { createdAt: new Date(), updatedAt: new Date(), lastModifiedBy: 'system' },
  };

  it('generates CSV with requested columns', () => {
    const csv = generateEmployeeCsv([employee], [
      { key: 'fio', label: 'Ф.И.О.' },
      { key: 'team', label: 'Команда' },
    ]);
    expect(csv).toContain('Ф.И.О.,Команда');
    expect(csv).toContain('Иванов Иван,Команда 1');
  });

  it('validates required headers', () => {
    const valid = validateCsvHeaders('login,ФИО,Тег\nivanov,Иванов Иван,ментор', ['login', 'Тег']);
    expect(valid.valid).toBe(true);
    const invalid = validateCsvHeaders('login,ФИО\nivanov,Иванов Иван', ['login', 'Тег']);
    expect(invalid.valid).toBe(false);
    expect(invalid.missingHeaders).toEqual(['Тег']);
  });
});
```

#### 4. Employee List State Updates
**File**: `src/components/EmployeeList/useEmployeeListState.tsx`
**Changes**: Replace inline CSV/Excel logic with the new helpers and cover Excel validation.

```diff
-import { createTaskEntry } from '../../utils/task';
+import { createTaskEntry } from '../../utils/task';
+import {
+  generateEmployeeCsv,
+  parseWorkbookHeaders,
+  validateCsvHeaders,
+} from '../../utils/importExport';
@@
-    const requiredHeaders = extension === 'csv' ? IMPORT_REQUIRED_HEADERS[activeContext] : undefined;
+    const requiredHeaders = IMPORT_REQUIRED_HEADERS[activeContext];
@@
-    if (requiredHeaders) {
-      const reader = new FileReader();
-      reader.onload = () => {
-        try {
-          const text = String(reader.result ?? '');
-          const lines = text
-            .split(/\r?\n/)
-            .map((line) => line.trim())
-            .filter((line) => line.length > 0);
-
-          if (lines.length === 0) {
-            announceImportError(`Файл «${file.name}» не содержит строк данных.`);
-            resetInput();
-            return;
-          }
-
-          const headerLine = lines[0];
-          const parsedHeaders = headerLine
-            .split(',')
-            .map((column) => column.replace(/"/g, '').trim());
-
-          const normalizedHeaders = parsedHeaders.map((column) => column.toLowerCase());
-          const missing = requiredHeaders.filter((column) => !normalizedHeaders.includes(column.toLowerCase()));
-
-          if (missing.length > 0) {
-            announceImportError(`Отсутствуют обязательные колонки: ${missing.join(', ')}.`);
-            resetInput();
-            return;
-          }
-
-          announceImportSuccess(successMessage);
-        } catch (error) {
-          announceImportError(`Не удалось обработать файл «${file.name}».`);
-        } finally {
-          resetInput();
-        }
-      };
-
-      reader.onerror = () => {
-        announceImportError(`Не удалось прочитать файл «${file.name}».`);
-        resetInput();
-      };
-
-      reader.readAsText(file, 'utf-8');
-      return;
-    }
-
-    announceImportSuccess(successMessage);
-    resetInput();
+    const reader = new FileReader();
+    reader.onload = async () => {
+      try {
+        if (extension === 'csv') {
+          const text = String(reader.result ?? '');
+          const { valid, missingHeaders } = validateCsvHeaders(text, requiredHeaders);
+          if (!valid) {
+            announceImportError(`Отсутствуют обязательные колонки: ${missingHeaders.join(', ')}.`);
+            return;
+          }
+        } else {
+          const headers = await parseWorkbookHeaders(file);
+          const normalized = headers.map((value) => value.toLowerCase());
+          const missing = requiredHeaders.filter((column) => !normalized.includes(column.toLowerCase()));
+          if (missing.length > 0) {
+            announceImportError(`Отсутствуют обязательные колонки: ${missing.join(', ')}.`);
+            return;
+          }
+        }
+        announceImportSuccess(successMessage);
+      } catch (error) {
+        announceImportError(`Не удалось обработать файл «${file.name}».`);
+      } finally {
+        resetInput();
+      }
+    };
+
+    reader.onerror = () => {
+      announceImportError(`Не удалось прочитать файл «${file.name}».`);
+      resetInput();
+    };
+
+    if (extension === 'csv') {
+      reader.readAsText(file, 'utf-8');
+    } else {
+      reader.readAsArrayBuffer(file);
+    }
   };
@@
-    const csv = [header, ...rows].join('\n');
-    downloadCsv(csv, exportContext);
+    const csv = generateEmployeeCsv(exportEmployees, columns);
+    downloadCsv(csv, exportContext);
   };
```

#### 5. Export Helpers for Vacation/Tags
**File**: `src/utils/importExport.ts`
**Changes**: Add convenience functions for tag/vacation exports to simplify hook logic.

```ts
export const generateVacationCsv = (employees: Employee[], statusLabel: (status: Employee['status']) => string) => {
  const rows = employees
    .filter((employee) => employee.status === 'vacation')
    .map((employee) => ({
      login: employee.credentials.wfmLogin,
      name: `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim(),
      status: statusLabel(employee.status),
      team: employee.workInfo.team.name,
      comment: 'Отпуск по графику',
    }));
  if (!rows.length) {
    return null;
  }
  return Papa.unparse(rows, { columns: ['login', 'name', 'status', 'team', 'comment'] });
};

export const generateTagCsv = (employees: Employee[]) => {
  const rows = employees.flatMap((employee) => {
    const fio = `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim();
    return (employee.tags.length === 0
      ? [{ login: employee.credentials.wfmLogin, name: fio, tag: '' }]
      : employee.tags.map((tag) => ({ login: employee.credentials.wfmLogin, name: fio, tag }))
    );
  });
  if (!rows.length) {
    return null;
  }
  return Papa.unparse(rows, { columns: ['login', 'name', 'tag'] });
};
```

#### 6. Hook Updates for Tag/Vacation Export
**File**: `src/components/EmployeeList/useEmployeeListState.tsx`
**Changes**: Delegate tag/vacation CSV generation to helper functions.

```diff
-import const downloadCsv = (csv: string, context: string) => {
+const downloadCsv = (csv: string, context: string) => {
@@
-    if (exportContext === 'Отпуска') {
-      const header = ['login', 'ФИО', 'Статус', 'Команда', 'Комментарий'];
-      const rows = exportEmployees
-        .filter((employee) => employee.status === 'vacation')
-        .map((employee) => (
-          [
-            employee.credentials.wfmLogin,
-            `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim(),
-            STATUS_LABELS[employee.status],
-            employee.workInfo.team.name,
-            'Отпуск по графику',
-          ].map(quoted).join(',')
-        ));
-
-      if (rows.length === 0) {
+    if (exportContext === 'Отпуска') {
+      const csv = generateVacationCsv(exportEmployees, (status) => STATUS_LABELS[status]);
+      if (!csv) {
         setExportFeedback('Нет сотрудников в отпуске для выгрузки.');
         setStatusNotice('Нет данных для экспорта «Отпуска».');
         setLiveMessage('Экспорт «Отпуска»: нет данных');
         setSelectionOverrideExpires(Date.now() + 4000);
         return;
       }
-
-      const csv = [header.join(','), ...rows].join('\n');
       downloadCsv(csv, exportContext);
       return;
     }
 
     if (exportContext === 'Теги') {
-      const header = ['login', 'ФИО', 'Тег'];
-      const rows = exportEmployees.flatMap((employee) =>
-        (employee.tags.length === 0
-          ? [[employee.credentials.wfmLogin, `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim(), '']]
-          : employee.tags.map((tag) => [
-              employee.credentials.wfmLogin,
-              `${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim(),
-              tag,
-            ])
-        ).map((values) => values.map(quoted).join(','))
-      );
-
-      if (rows.length === 0) {
+      const csv = generateTagCsv(exportEmployees);
+      if (!csv) {
         setExportFeedback('У выбранных сотрудников отсутствуют теги для экспорта.');
         setStatusNotice('Нет данных для экспорта «Теги».');
         setLiveMessage('Экспорт «Теги»: нет данных');
         setSelectionOverrideExpires(Date.now() + 4000);
         return;
       }
-
-      const csv = [header.join(','), ...rows].join('\n');
       downloadCsv(csv, exportContext);
       return;
     }
 
-    const columns = COLUMN_ORDER.filter((column) => columnVisibility[column.key]);
-    const header = columns.map((column) => column.label).join(',');
-    const rows = exportEmployees.map((employee) =>
-      columns
-        .map((column) => {
-          switch (column.key) {
-            case 'fio':
-              return quoted(`${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`.trim());
-            case 'position':
-              return quoted(employee.workInfo.position);
-            case 'orgUnit':
-              return quoted(employee.orgPlacement.orgUnit);
-            case 'team':
-              return quoted(employee.workInfo.team.name);
-            case 'scheme':
-              return quoted(employee.orgPlacement.workScheme?.name ?? '');
-            case 'hourNorm':
-              return String(employee.orgPlacement.hourNorm);
-            case 'status':
-              return STATUS_LABELS[employee.status];
-            case 'hireDate':
-              return employee.workInfo.hireDate.toLocaleDateString('ru-RU');
-            default:
-              return '';
-          }
-        })
-        .join(',')
-    );
-
-    const csv = [header, ...rows].join('\n');
-    downloadCsv(csv, exportContext);
+    const columns = COLUMN_ORDER.filter((column) => columnVisibility[column.key]);
+    const csv = generateEmployeeCsv(exportEmployees, columns);
+    downloadCsv(csv, exportContext);
   };
```

## Phase 2 – Rich Text Editor Integration

### Overview
Replace the edit drawer textarea with a TipTap-backed rich text editor that preserves RHF controls and FormField accessibility.

### Changes Required:

#### 1. Dependencies
**File**: `package.json`
**Changes**: Add TipTap packages.

```diff
     "dependencies": {
       "@radix-ui/react-dialog": "^1.0.5",
+      "@tiptap/react": "^2.5.6",
+      "@tiptap/starter-kit": "^2.5.6",
```

#### 2. Shared Editor Component
**File**: `src/components/common/RichTextEditor.tsx`
**Changes**: New component wrapping TipTap editor with toolbar controls and FormField-friendly props.

```tsx
import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export interface RichTextEditorProps {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, disabled, placeholder }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <button type="button" className="px-2 py-1 border rounded" onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Полужирный">
          B
        </button>
        <button type="button" className="px-2 py-1 border rounded" onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Курсив">
          I
        </button>
        <button type="button" className="px-2 py-1 border rounded" onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Маркированный список">
          •
        </button>
      </div>
      <div className={`border rounded-lg p-3 text-sm ${disabled ? 'bg-gray-50 text-gray-400' : 'focus-within:ring-2 focus-within:ring-blue-500'}`}>
        {!value && placeholder ? <p className="text-gray-400 select-none" aria-hidden>{placeholder}</p> : null}
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />
      </div>
    </div>
  );
};
```

#### 3. Drawer Integration
**File**: `src/components/EmployeeEditDrawer.tsx`
**Changes**: Replace textarea rendering with `RichTextEditor` wrapped in RHF `Controller`.

```diff
-import { Controller, useForm } from 'react-hook-form';
+import { Controller, useForm } from 'react-hook-form';
+import { RichTextEditor } from '../common/RichTextEditor';
@@
-          {config.type === 'textarea' ? (
-            <textarea
-              id={fieldId}
-              className={`${inputClass} min-h-[92px]`}
-              placeholder={config.placeholder}
-              {...register(config.name as keyof EmployeeEditFormValues & string)}
-              {...ariaProps}
-            />
-          ) : (
+          {config.type === 'textarea' ? (
+            <Controller
+              name={config.name as keyof EmployeeEditFormValues & string}
+              control={control}
+              render={({ field }) => (
+                <RichTextEditor
+                  value={field.value as string}
+                  onChange={field.onChange}
+                  disabled={Boolean(config.disabled)}
+                  placeholder={config.placeholder}
+                />
+              )}
+            />
+          ) : (
             <input
               id={fieldId}
               type={config.type ?? 'text'}
               placeholder={config.placeholder}
               min={config.type === 'number' ? 1 : undefined}
               className={inputClass}
               {...register(config.name as keyof EmployeeEditFormValues & string)}
               {...ariaProps}
             />
           )}
```

#### 4. Drawer Schema Defaults
**File**: `src/components/forms/employeeEditFormHelpers.ts`
**Changes**: Ensure rich text content defaults to HTML string.

```diff
   notes: z.string().max(2000).optional().nullable(),
@@
-export const defaultEmployeeEditValues: EmployeeEditFormValues = {
+export const defaultEmployeeEditValues: EmployeeEditFormValues = {
   firstName: '',
@@
-  notes: '',
+  notes: '<p></p>',
 };
```

#### 5. Drawer Tests/Storybook
**File**: `src/components/EmployeeEditDrawer.stories.tsx`
**Changes**: Add story demonstrating formatted notes and ensure README references new editor (executor to update copy accordingly).

```diff
   args: {
     employee: fixtures.employee,
     isOpen: true,
+    initialNotes: '<p>Привет <strong>команда</strong>!</p>',
   },
 }
```

#### 6. Documentation
**File**: `docs/Tasks/phase-7-component-library-discovery.md`
**Changes**: Note rich text editor integration and helper introduction in execution notes.

```diff
 - Wrapper READMEs now exist under `src/wrappers/ui|form|data/README.md` and cover hidden-title guidance, button
@@
+- 2025-10-13 – Execution Notes
+- CSV/Excel helpers extracted to `src/utils/importExport.ts`, replacing ad-hoc logic in `useEmployeeListState.tsx` and covered by Vitest.
+- Employee edit drawer now uses a TipTap-based rich text editor (`src/components/common/RichTextEditor.tsx`) for the notes field while preserving RHF/FormField patterns.
```

## Phase 3 – DataTable Benchmarks

### Overview
Add an automated benchmark to measure virtualization performance with 10k–50k rows and document the findings for future regressions.

### Changes Required:

#### 1. Benchmark Script
**File**: `scripts/benchmarks/datatable.ts`
**Changes**: New script rendering the DataTable headless and logging render timings.

```ts
import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { DataTable } from '@/wrappers/data/DataTable';
import type { ColumnDef } from '@tanstack/react-table';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>');
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;

interface RowData {
  id: string;
  fio: string;
  team: string;
  position: string;
}

const columns: ColumnDef<RowData>[] = [
  { accessorKey: 'fio', header: 'Ф.И.О.' },
  { accessorKey: 'team', header: 'Команда' },
  { accessorKey: 'position', header: 'Должность' },
];

const generate = (count: number): RowData[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `emp-${index}`,
    fio: `Сотрудник ${index}`,
    team: `Команда ${index % 10}`,
    position: 'Оператор контакт-центра',
  }));

const container = document.getElementById('root')!;
const root = createRoot(container);

const run = async (count: number) => {
  const data = generate(count);
  const start = performance.now();
  root.render(
    React.createElement(DataTable<RowData>, {
      data,
      columns,
      rowHeight: 48,
      height: 600,
      testId: 'benchmark-table',
      enableKeyboardNavigation: false,
    }),
  );
  await new Promise((resolve) => setTimeout(resolve, 0));
  const end = performance.now();
  return end - start;
};

(async () => {
  for (const size of [10000, 30000, 50000]) {
    const duration = await run(size);
    console.log(`Размер ${size}: ${duration.toFixed(2)}ms`);
  }
  process.exit(0);
})();
```

#### 2. Documentation Updates
**File**: `docs/Tasks/phase-7-component-library-followups.md`
**Changes**: Record benchmark requirement as satisfied after execution.

```diff
-## Accessibility & Performance Validation
-- Schedule axe-core/Storybook sweeps for wrapper stories once the documentation/tests work lands.
-- Benchmark TanStack virtualization in `src/wrappers/data/DataTable.tsx:1-320` with 10k–50k rows, noting overscan and Enter-key behaviour.
-- Document benchmark results and accessibility findings in `docs/Tasks/phase-7-component-library-discovery.md` and the AI workspace.
+## Accessibility & Performance Validation
+- ✅ DataTable virtualization benchmarks automated via `npm run benchmark:datatable` (records 10k/30k/50k timings in console and discovery notes).
+- Schedule axe-core/Storybook sweeps for wrapper stories once the documentation/tests work lands.
```

#### 3. Discovery Log
**File**: `docs/Tasks/phase-7-component-library-discovery.md`
**Changes**: Add benchmark summary placeholder for executors to fill.

```diff
+- Benchmark results (10k/30k/50k rows) captured via `npm run benchmark:datatable` – update this section with timings after execution.
```

## Tests & Validation
- `npm install` (to pick up new dependencies).
- `npm run build`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- `npm run benchmark:datatable` (record timings in `docs/Tasks/phase-7-component-library-discovery.md`).

## Rollback
- `git restore --staged . && git checkout .` to drop pending changes.
- Remove `papaparse`, `xlsx`, `@tiptap/react`, and `@tiptap/starter-kit` entries from `package.json` if installed.
- Delete `src/utils/importExport.ts`, `src/utils/__tests__/importExport.test.ts`, `src/components/common/RichTextEditor.tsx`, and `scripts/benchmarks/datatable.ts` if created.
- Revert modifications to `src/components/EmployeeList/useEmployeeListState.tsx`, `src/components/EmployeeEditDrawer.tsx`, storybook/docs updates, and `package.json` scripts.

## Handoff
- Update `PROGRESS.md` setting this plan to _Completed_ and note next steps (MiniSearch/charts planner).
- Append execution notes (helpers/editor/benchmarks + timings) to `docs/SESSION_HANDOFF.md`.
- Document benchmark measurements in `docs/Tasks/phase-7-component-library-discovery.md` and sync AI-doc references if new patterns emerge.
- Archive this plan under `docs/Archive/Plans/executed/` after successful execution.
