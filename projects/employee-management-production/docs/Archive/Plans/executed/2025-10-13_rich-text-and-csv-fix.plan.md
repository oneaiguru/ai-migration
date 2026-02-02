## Metadata
- **Plan ID**: 2025-10-13_rich-text-and-csv-fix
- **Status**: Ready for execution
- **Owner Role**: Executor
- **Related Docs**: `docs/Tasks/phase-7-component-library-followups.md`, `docs/Tasks/phase-7-component-library-discovery.md`, `docs/SESSION_HANDOFF.md`, `docs/System/parity-roadmap.md`, `ai-docs/llm-reference/AiDocsReference.md`

## Desired End State
- TipTap-based task editor exposes a stable accessible name and gains focus when its `FormField` label is activated.
- Employee list import/export flows rely exclusively on the shared helpers in `src/utils/importExport.ts` for CSV generation and header validation.
- Updated unit/E2E tests and documentation confirm the fixes; repository ends clean with the plan archived per SOP.

### Key Discoveries
- `src/components/common/RichTextEditor.tsx:16-116` – `EditorContent` renders as a `<div>` without `aria-labelledby`, so the label in `FormField` no longer applies.
- `src/components/EmployeeEditDrawer.tsx:318-340` – Drawer wires the editor via RHF `Controller` but spreads only the ARIA props returned by `formFieldAriaProps`.
- `src/components/forms/employeeEditFormHelpers.ts:44-113` – Default/mapper logic now stores rich-text HTML strings and strips them to plain text before persisting tasks.
- `src/utils/importExport.ts:35-176` – Helper functions exist for employee/vacation/tag CSV generation plus header validation but `useEmployeeListState` still duplicates the logic inline.
- `src/components/EmployeeList/useEmployeeListState.tsx:1900-2095` – Legacy import/export code performs manual quoting/validation, diverging from the helpers.
- `tests/employee-list.spec.ts:77-115` – Playwright suite covers list interactions; we need to extend it to assert import/export feedback after the refactor.

## What We're NOT Doing
- Changing MiniSearch integration, charts, Storybook assets, or other Phase 7 follow-ups.
- Modifying backend payloads, localization copy, or quick-add flows.
- Installing additional dependencies beyond those already present.

## Implementation Approach
Execute the phases below sequentially. Commands are idempotent; stop if unexpected files appear in `git status`.

## Phase 0 – Pre-Flight Checks
1. Verify a clean worktree:
   ```bash
   git status -sb
   ```
2. Re-read `docs/Tasks/phase-7-component-library-followups.md` (Rich-text + CSV helper items) and the 2025-10-13 executor entry in `docs/SESSION_HANDOFF.md` (context only).

## Phase 1 – Restore Accessible Rich Text Editor
1. Add stable IDs to the `FormField` label and expose them to consumers:
   ```bash
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/wrappers/form/FormField.tsx
@@
-  const hintId = hint ? `${controlId}-hint` : undefined;
+  const labelId = `${controlId}-label`;
+  const hintId = hint ? `${controlId}-hint` : undefined;
@@
-      <label htmlFor={controlId} style={labelStyle}>
+      <label id={labelId} htmlFor={controlId} style={labelStyle}>
         <span>{label}</span>
         {required ? <span aria-hidden>*</span> : null}
       </label>
*** End Patch
PATCH
   ```
2. Extend `formFieldAriaProps` so it returns the label id without leaking it onto DOM nodes:
   ```bash
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/wrappers/form/FormField.tsx
@@
-export const formFieldAriaProps = ({
-  controlId,
-  hasError,
-  hintId,
-  errorId,
-}: {
-  controlId: string;
-  hasError: boolean;
-  hintId?: string;
-  errorId?: string;
-}) => ({
-  id: controlId,
-  "aria-invalid": hasError || undefined,
-  "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
-});
+export interface FormFieldAriaParams {
+  controlId: string;
+  labelId: string;
+  hasError: boolean;
+  hintId?: string;
+  errorId?: string;
+}
+
+export const formFieldAriaProps = ({
+  controlId,
+  labelId,
+  hasError,
+  hintId,
+  errorId,
+}: FormFieldAriaParams) => ({
+  id: controlId,
+  labelId,
+  "aria-invalid": hasError || undefined,
+  "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
+});
*** End Patch
PATCH
   ```
3. Update `RichTextEditor` to accept the new `ariaLabelledBy` prop and ensure focus/label coordination:
   ```bash
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/common/RichTextEditor.tsx
@@
 export interface RichTextEditorProps {
   value: string;
   onChange: (next: string) => void;
   onBlur?: () => void;
   disabled?: boolean;
   placeholder?: string;
   id?: string;
   ariaDescribedBy?: string;
   ariaInvalid?: boolean;
+  ariaLabelledBy?: string;
 }
@@
-  ariaDescribedBy,
-  ariaInvalid,
+  ariaDescribedBy,
+  ariaInvalid,
+  ariaLabelledBy,
 }) => {
@@
-  return (
-    <div className="space-y-2" id={id ? `${id}-wrapper` : undefined}>
+  return (
+    <div
+      className="space-y-2"
+      id={id ? `${id}-wrapper` : undefined}
+      onMouseDown={(event) => {
+        if (event.target instanceof HTMLLabelElement) {
+          event.preventDefault();
+          editor.commands.focus('end');
+        }
+      }}
+    >
       <div className="flex gap-1" role="toolbar" aria-label="Редактирование текста">
@@
         <EditorContent
           editor={editor}
           className="prose prose-sm max-w-none px-3 py-2 outline-none"
           id={id}
           aria-describedby={ariaDescribedBy}
           aria-invalid={ariaInvalid || undefined}
+          aria-labelledby={ariaLabelledBy}
           role="textbox"
           aria-multiline="true"
           onBlur={onBlur}
+          onFocus={() => editor.commands.focus('end')}
         />
*** End Patch
PATCH
   ```
   *(If TypeScript complains about the mouse handler, adjust it during execution to use a `ref` + `labelId`.)*
4. In `EmployeeEditDrawer`, destructure the label id and pass it to the editor:
   ```bash
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeEditDrawer.tsx
@@
-    const ariaProps = formFieldAriaProps({
-      controlId: fieldId,
-      hasError: Boolean(error),
-      errorId: error ? `${fieldId}-error` : undefined,
-      hintId: config.hint ? `${fieldId}-hint` : undefined,
-    });
+    const { labelId, ...ariaProps } = formFieldAriaProps({
+      controlId: fieldId,
+      labelId: `${fieldId}-label`,
+      hasError: Boolean(error),
+      errorId: error ? `${fieldId}-error` : undefined,
+      hintId: config.hint ? `${fieldId}-hint` : undefined,
+    });
@@
-    const describedBy = ariaProps['aria-describedby'] as string | undefined;
-    const ariaInvalid = ariaProps['aria-invalid'] as boolean | undefined;
+    const describedBy = ariaProps['aria-describedby'] as string | undefined;
+    const ariaInvalid = ariaProps['aria-invalid'] as boolean | undefined;
@@
                 <RichTextEditor
                   id={fieldId}
                   value={(field.value as string) ?? ''}
                   onChange={(next) => field.onChange(next)}
                   onBlur={field.onBlur}
                   disabled={isLoading}
                   placeholder={config.placeholder}
                   ariaDescribedBy={describedBy}
                   ariaInvalid={ariaInvalid}
+                  ariaLabelledBy={labelId}
                 />
*** End Patch
PATCH
   ```

## Phase 2 – Wire Employee List to Shared Helpers
1. Import helper utilities in the hook:
   ```bash
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeList/useEmployeeListState.tsx
@@
-import { createTaskEntry } from '../../utils/task';
+import { createTaskEntry } from '../../utils/task';
+import {
+  generateEmployeeCsv,
+  generateTagCsv,
+  generateVacationCsv,
+  stripRichTextToPlain,
+  toRichText,
+  validateCsvHeaders,
+  parseWorkbookHeaders,
+} from '../../utils/importExport';
*** End Patch
PATCH
   ```
2. Replace inline CSV header validation with helper calls for both CSV and Excel inputs:
   ```bash
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeList/useEmployeeListState.tsx
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
+    if (extension === 'csv') {
+      const reader = new FileReader();
+      reader.onload = () => {
+        const text = String(reader.result ?? '');
+        const { valid, missingHeaders, message } = validateCsvHeaders(text, requiredHeaders);
+        if (!valid) {
+          announceImportError(message ?? `Отсутствуют обязательные колонки: ${missingHeaders.join(', ')}.`);
+          resetInput();
+          return;
+        }
+        announceImportSuccess(successMessage);
+        resetInput();
+      };
+      reader.onerror = () => {
+        announceImportError(`Не удалось прочитать файл «${file.name}».`);
+        resetInput();
+      };
+      reader.readAsText(file, 'utf-8');
+      return;
+    }
+
+    parseWorkbookHeaders(file)
+      .then((headers) => {
+        const normalized = headers.map((header) => header.toLowerCase());
+        const missing = requiredHeaders.filter((key) => !normalized.includes(key.toLowerCase()));
+        if (missing.length > 0) {
+          announceImportError(`Отсутствуют обязательные колонки: ${missing.join(', ')}.`);
+          return;
+        }
+        announceImportSuccess(successMessage);
+      })
+      .catch(() => announceImportError(`Не удалось обработать файл «${file.name}».`))
+      .finally(resetInput);
*** End Patch
PATCH
   ```
3. Swap the export branches to use helper outputs:
   ```bash
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeList/useEmployeeListState.tsx
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
 
-    if (exportContext === 'Теги') {
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
+    if (exportContext === 'Теги') {
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
+    const csv = generateEmployeeCsv(exportEmployees, columns.map(({ key, label }) => ({ key, label })));
+    downloadCsv(csv, exportContext);
*** End Patch
PATCH
   ```
4. Remove the now-unused `quoted` helper and any redundant imports (executor can prune during implementation).

## Phase 3 – Keep Rich Text Helpers in Sync
1. Ensure `mapEmployeeToForm` and `createEmployeeEditDefaultValues` convert plain strings using `toRichText` where appropriate:
   ```bash
   apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/forms/employeeEditFormHelpers.ts
@@
-    tasks: '<p></p>',
+    tasks: toRichText(employee.tasks?.map((task) => task.message).join('\n') ?? ''),
@@
-    tasks: '<p></p>',
+    tasks: '<p></p>',
@@
-  const newTaskMessages = stripRichTextToPlain(values.additional.tasks)
+  const newTaskMessages = stripRichTextToPlain(values.additional.tasks)
*** End Patch
PATCH
   ```
   *(Adjust during execution if double conversion occurs; goal is to ensure helpers remain the single source of truth.)*

## Phase 4 – Tests & Validation
1. Expand Vitest coverage for import/export helpers (e.g., vacation CSV edge cases, header error messages) in `src/utils/__tests__/importExport.test.ts`.
2. Add a Playwright assertion that uploading a CSV with missing headers surfaces the helper error (`.tests/employee-list.spec.ts`).
3. Run the required commands:
   ```bash
   npm run build
   npm run typecheck
   npm run test:unit
   npm run test -- --project=chromium --workers=1 --grep "Employee list"
   ```
4. Optionally rerun `npm run benchmark:datatable` to ensure the helper edits didn’t affect performance logging (record only if rerun).

## Phase 5 – Documentation & Handoff
1. Update `docs/Tasks/phase-7-component-library-followups.md` and `docs/Tasks/phase-7-component-library-discovery.md` to mark the rich-text accessibility and CSV helper items complete (include benchmark/test notes if rerun).
2. Reflect the fixes in `docs/System/parity-roadmap.md` and log results/tests in `docs/SESSION_HANDOFF.md`.
3. Set this plan to **Completed** in `PROGRESS.md`, archive it under `docs/Archive/Plans/executed/`, and ensure `git status -sb` is clean before handoff.

## Rollback Plan
```bash
git checkout -- src/wrappers/form/FormField.tsx src/components/common/RichTextEditor.tsx src/components/EmployeeEditDrawer.tsx src/components/forms/employeeEditFormHelpers.ts src/components/EmployeeList/useEmployeeListState.tsx src/utils/importExport.ts src/utils/__tests__/importExport.test.ts tests/employee-list.spec.ts docs/Tasks/phase-7-component-library-discovery.md docs/Tasks/phase-7-component-library-followups.md docs/System/parity-roadmap.md docs/SESSION_HANDOFF.md PROGRESS.md
git clean -fd
npm run build
```

## Acceptance Criteria
- Screen readers announce “Новые задачи” through the TipTap editor, and activating the field label focuses the editor.
- Import/export logic delegates fully to `src/utils/importExport.ts`; no duplicate CSV/header code remains in the hook.
- `npm run build`, `npm run typecheck`, `npm run test:unit`, and the targeted Playwright slice pass; Playwright covers the new helper behaviour.
- Documentation and handoff files describe the change, with the plan archived and the repo clean.
