## Metadata
- **Plan ID**: 2025-10-15_phase-7-ai-docs-alignment
- **Owner Role**: Planner → Executor
- **Status**: Ready for execution
- **Objective**: Align the AI-docs workspace with the latest component-library updates (accessible form wrappers, CSV helpers, benchmark notes) so future scouts/planners rely on accurate references.
- **Discovery Sources**:
  - `docs/Tasks/phase-7-component-library-discovery.md:18-76`
  - `docs/Tasks/phase-7-component-library-followups.md:5-38`
  - `ai-docs/llm-reference/AiDocsReference.md:7-33`
  - `ai-docs/wrappers-draft/form/FormField.tsx:1-27`
  - `ai-docs/wrappers-draft/form/README.md:1-31`

## Desired End State
AI-docs wrapper drafts demonstrate the same accessibility and data-export patterns now shipping in production, reference snippets cover the shared CSV utilities, and the workspace indexes/manifest document the frozen reference snapshot. Planners can cite the AI-docs materials without cross-checking production after this plan executes.

### Key Discoveries
- `docs/Tasks/phase-7-component-library-discovery.md:18-23` – discovery notes call out the need to mirror production docs/tests into `ai-docs/wrappers-draft/`.
- `docs/Tasks/phase-7-component-library-followups.md:6-13` – follow-up checklist requires keeping READMEs + drafts in sync and capturing a frozen wrapper demo set in AI docs.
- `ai-docs/llm-reference/AiDocsReference.md:26-33` – latest review highlights rich-text labelling and CSV helper updates that must be reflected in the AI workspace.
- `ai-docs/wrappers-draft/form/FormField.tsx:1-27` & `ai-docs/wrappers-draft/form/README.md:11-27` – draft form wrapper still lacks the accessible `formFieldAriaProps` helper described in the README.

## What We're NOT Doing
- No production code or tests change in `src/`. Keep focus on the AI-docs workspace and documentation.
- No Storybook or Vitest additions—those stay covered by prior plans.
- Charts/MiniSearch execution remains out of scope (already handled or deferred to Phase 9).

## Implementation Approach
Refresh the AI-docs form drafts first so they illustrate the new aria helper pattern, then add a CSV helper snippet plus rich-text notes, and finally update the AI-docs index/manifest/discovery docs to log the frozen snapshot. Use `apply_patch`/`cat` commands so executors can replay the plan deterministically.

## Phase 1: Refresh Form Wrapper Drafts

### Overview
Mirror the accessible label wiring (`formFieldAriaProps`) in the AI-docs form drafts so planners see the current API.

### Changes Required:

#### 1. Update FormField draft
**File**: `ai-docs/wrappers-draft/form/FormField.tsx`
**Changes**: Replace the minimal label wrapper with the accessible version that exposes `formFieldAriaProps`.

```tsx
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: ai-docs/wrappers-draft/form/FormField.tsx
@@
-import type { FieldError } from "react-hook-form";
-import type { ReactNode } from "react";
-
-/**
- * Draft helper mirroring the structure used in Employee Management drawers.
- * Production version adds tokens + VisuallyHidden support – see src/wrappers/form/FormField.tsx.
- */
-interface FormFieldProps {
-  label: string;
-  input: ReactNode;
-  error?: FieldError;
-  hint?: string;
-}
-
-export function FormField({ label, input, error, hint }: FormFieldProps) {
-  return (
-    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
-      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
-      {input}
-      {error ? (
-        <span role="alert" style={{ color: "#dc2626", fontSize: 12 }}>
-          {error.message}
-        </span>
-      ) : hint ? (
-        <span style={{ fontSize: 12, color: "#94a3b8" }}>{hint}</span>
-      ) : null}
-    </label>
-  );
-}
+import type { FieldError } from "react-hook-form";
+import type { ReactNode } from "react";
+import { useId } from "react";
+
+/**
+ * Draft helper mirroring the accessible pattern used in production drawers.
+ * Production version adds tokens + VisuallyHidden support – see src/wrappers/form/FormField.tsx.
+ */
+interface FormFieldProps {
+  fieldId?: string;
+  label: string;
+  children: ReactNode;
+  error?: FieldError | string;
+  hint?: string;
+  required?: boolean;
+  testId?: string;
+}
+
+const containerStyle: React.CSSProperties = {
+  display: "grid",
+  gap: 8,
+};
+
+const labelStyle: React.CSSProperties = {
+  fontWeight: 600,
+  fontSize: 14,
+  display: "inline-flex",
+  gap: 4,
+};
+
+const hintStyle: React.CSSProperties = {
+  fontSize: 12,
+  color: "#64748b",
+};
+
+const errorStyle: React.CSSProperties = {
+  ...hintStyle,
+  color: "#dc2626",
+};
+
+export function getFormFieldLabelId(controlId: string): string {
+  return `${controlId}-label`;
+}
+
+export function FormField({
+  fieldId,
+  label,
+  children,
+  error,
+  hint,
+  required,
+  testId,
+}: FormFieldProps) {
+  const generatedId = useId();
+  const controlId = fieldId ?? generatedId;
+  const labelId = getFormFieldLabelId(controlId);
+  const hintId = hint ? `${controlId}-hint` : undefined;
+  const errorMessage = typeof error === "string" ? error : error?.message;
+  const errorId = errorMessage ? `${controlId}-error` : undefined;
+
+  return (
+    <div style={containerStyle} data-testid={testId}>
+      <label id={labelId} htmlFor={controlId} style={labelStyle}>
+        <span>{label}</span>
+        {required ? <span aria-hidden>*</span> : null}
+      </label>
+      {children}
+      {errorMessage ? (
+        <span id={errorId} role="alert" style={errorStyle}>
+          {errorMessage}
+        </span>
+      ) : hint ? (
+        <span id={hintId} style={hintStyle}>
+          {hint}
+        </span>
+      ) : null}
+    </div>
+  );
+}
+
+export interface FormFieldAriaParams {
+  controlId: string;
+  hasError: boolean;
+  hintId?: string;
+  errorId?: string;
+  labelId?: string;
+}
+
+export interface FormFieldAriaResult {
+  id: string;
+  labelId: string;
+  "aria-invalid"?: boolean;
+  "aria-describedby"?: string;
+}
+
+export function formFieldAriaProps({
+  controlId,
+  hasError,
+  hintId,
+  errorId,
+  labelId,
+}: FormFieldAriaParams): FormFieldAriaResult {
+  const resolvedLabelId = labelId ?? getFormFieldLabelId(controlId);
+
+  return {
+    id: controlId,
+    labelId: resolvedLabelId,
+    "aria-invalid": hasError || undefined,
+    "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
+  };
+}
*** End Patch
PATCH
```

#### 2. Update EmployeeForm draft
**File**: `ai-docs/wrappers-draft/form/EmployeeForm.tsx`
**Changes**: Demonstrate how to consume `formFieldAriaProps` and hint/error IDs when wiring RHF controls.

```tsx
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: ai-docs/wrappers-draft/form/EmployeeForm.tsx
@@
-import { FormField } from "./FormField";
+import { FormField, formFieldAriaProps } from "./FormField";
@@
-  return (
-    <form onSubmit={handleSubmit((values) => onSubmit?.(values))} style={{ display: "grid", gap: 16 }}>
-      <FormField
-        label="Логин"
-        input={<input {...register("login")} />}
-        error={errors.login}
-      />
-      <FormField
-        label="Email"
-        input={<input type="email" {...register("email")} />}
-        error={errors.email}
-        hint="Используйте корпоративный адрес"
-      />
-      <FormField
-        label="Статус"
-        input={
-          <select {...register("status")}>
-            <option value="active">Активен</option>
-            <option value="trial">Испытательный</option>
-            <option value="dismissed">Уволен</option>
-          </select>
-        }
-        error={errors.status}
-      />
-      <button type="submit" style={{ justifySelf: "end" }}>
-        Сохранить
-      </button>
-    </form>
-  );
+  const loginIds = formFieldAriaProps({
+    controlId: "demo-login",
+    hasError: Boolean(errors.login),
+    errorId: errors.login ? "demo-login-error" : undefined,
+  });
+
+  const emailIds = formFieldAriaProps({
+    controlId: "demo-email",
+    hasError: Boolean(errors.email),
+    hintId: "demo-email-hint",
+    errorId: errors.email ? "demo-email-error" : undefined,
+  });
+
+  const statusIds = formFieldAriaProps({
+    controlId: "demo-status",
+    hasError: Boolean(errors.status),
+    errorId: errors.status ? "demo-status-error" : undefined,
+  });
+
+  return (
+    <form onSubmit={handleSubmit((values) => onSubmit?.(values))} style={{ display: "grid", gap: 16 }}>
+      <FormField fieldId={loginIds.id} label="Логин" error={errors.login} required>
+        <input
+          {...register("login")}
+          id={loginIds.id}
+          aria-invalid={loginIds["aria-invalid"]}
+          aria-describedby={loginIds["aria-describedby"]}
+        />
+      </FormField>
+
+      <FormField
+        fieldId={emailIds.id}
+        label="Email"
+        error={errors.email}
+        hint="Используйте корпоративный адрес"
+      >
+        <input
+          type="email"
+          {...register("email")}
+          id={emailIds.id}
+          aria-invalid={emailIds["aria-invalid"]}
+          aria-describedby={emailIds["aria-describedby"]}
+        />
+      </FormField>
+
+      <FormField fieldId={statusIds.id} label="Статус" error={errors.status}>
+        <select
+          {...register("status")}
+          id={statusIds.id}
+          aria-invalid={statusIds["aria-invalid"]}
+          aria-describedby={statusIds["aria-describedby"]}
+        >
+          <option value="active">Активен</option>
+          <option value="trial">Испытательный</option>
+          <option value="dismissed">Уволен</option>
+        </select>
+      </FormField>
+
+      <button type="submit" style={{ justifySelf: "end" }}>
+        Сохранить
+      </button>
+    </form>
+  );
 }
*** End Patch
PATCH
```

#### 3. Update form README
**File**: `ai-docs/wrappers-draft/form/README.md`
**Changes**: Call out the aria helper, include a usage example, and mark the draft as part of the frozen snapshot.

```markdown
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: ai-docs/wrappers-draft/form/README.md
@@
-1. Generate a stable control ID with `useId` when consumers do not provide one.
-2. Provide `formFieldAriaProps` helpers that wire `aria-describedby` to hint/error elements.
-3. Default inputs to Employee Management tokens (padding, border, background).
-4. Expose `required` flag logic while leaving validation copy to RHF/Zod.
+1. Generate a stable control ID with `useId` when consumers do not provide one.
+2. Provide `formFieldAriaProps` helpers that wire `aria-describedby` to hint/error elements and expose `aria-invalid`.
+3. Default inputs to Employee Management tokens (padding, border, background) in production; draft samples keep inline styles for clarity.
+4. Expose `required` flag logic while leaving validation copy to RHF/Zod.
@@
-```
-const emailProps = formFieldAriaProps({
-  controlId: "employee-email",
-  hasError: Boolean(errors.email),
-  errorId: errors.email ? "employee-email-error" : undefined,
-});
-
-<FormField label="Email" required fieldId={emailProps.id} error={errors.email}>
-  <input type="email" {...register("email")} {...emailProps} />
-</FormField>
-```
+```
+const emailIds = formFieldAriaProps({
+  controlId: "employee-email",
+  hasError: Boolean(errors.email),
+  errorId: errors.email ? "employee-email-error" : undefined,
+  hintId: "employee-email-hint",
+});
+
+<FormField fieldId={emailIds.id} label="Email" error={errors.email} hint="Используйте корпоративный адрес">
+  <input
+    type="email"
+    {...register("email")}
+    id={emailIds.id}
+    aria-invalid={emailIds["aria-invalid"]}
+    aria-describedby={emailIds["aria-describedby"]}
+  />
+</FormField>
+```
@@
-- Mirror any production changes (new props, styling tokens) here before shipping plans.
-- Add Storybook examples and smoke tests in production, then link them back to this README for planners.
+- Mirror any production changes (new props, styling tokens) here before shipping plans.
+- Add Storybook examples and smoke tests in production, then link them back to this README for planners.
+- Flag this folder as the "frozen" Phase 7 reference once audits complete; note that production may diverge until a new snapshot is captured.
*** End Patch
PATCH
```

## Phase 2: Add CSV & Rich Text References

### Overview
Provide planners with self-contained snippets for the CSV helpers and note how rich-text defaults behave.

### Changes Required:

#### 1. Add CSV helper snippet
**File**: `ai-docs/reference/snippets/utils/import-export.ts`
**Changes**: Create a trimmed example showing how to reuse the shared helper to produce CSV/Excel exports.

```bash
mkdir -p ai-docs/reference/snippets/utils
cat <<'CSV_SNIPPET' > ai-docs/reference/snippets/utils/import-export.ts
import Papa from "papaparse";
import { utils as xlsxUtils, writeFileXLSX } from "xlsx";

type EmployeeRow = {
  id: string;
  fullName: string;
  login: string;
  position: string;
  team: string;
  notes?: string;
};

const CSV_HEADERS: Record<string, string> = {
  fullName: "ФИО",
  login: "Логин",
  position: "Должность",
  team: "Команда",
  notes: "Комментарии",
};

export function formatEmployeesForCsv(rows: EmployeeRow[]): string {
  const data = rows.map(({ id: _ignore, ...columns }) => columns);
  return Papa.unparse({
    fields: Object.values(CSV_HEADERS),
    data: data.map((row) => Object.keys(CSV_HEADERS).map((key) => row[key as keyof typeof row] ?? "")),
  });
}

export function downloadEmployeeWorkbook(rows: EmployeeRow[], filename = "employees.xlsx") {
  const worksheet = xlsxUtils.json_to_sheet(rows, { header: Object.keys(CSV_HEADERS) });
  const workbook = xlsxUtils.book_new();
  xlsxUtils.book_append_sheet(workbook, worksheet, "Сотрудники");
  writeFileXLSX(workbook, filename, { compression: true });
}
CSV_SNIPPET
```

#### 2. Update wrapper draft index
**File**: `ai-docs/wrappers-draft/README.md`
**Changes**: Reference the new CSV snippet and note that the draft captures the Phase 7 snapshot.

```markdown
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: ai-docs/wrappers-draft/README.md
@@
-- `form/EmployeeForm.tsx` – Example RHF + Zod form composition using the field helper.
+- `form/EmployeeForm.tsx` – Example RHF + Zod form composition using the field helper + aria wiring.
+- `reference/snippets/utils/import-export.ts` documents the shared CSV/Excel helpers used in production.
@@
-These files illustrate desired props/usage and are not production ready (inline styles, no theming, minimal typing).
+These files illustrate desired props/usage and are not production ready (inline styles, no theming, minimal typing).
+
+> Phase 7 snapshot: treat this folder as the frozen reference for planners. When production diverges, record a new snapshot and update this note.
*** End Patch
PATCH
```

#### 3. Document rich-text defaults
**File**: `ai-docs/llm-reference/AiDocsReference.md`
**Changes**: Add a note that the draft now mirrors TipTap labelling and CSV helpers.

```markdown
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: ai-docs/llm-reference/AiDocsReference.md
@@
 - Shared CSV/Excel helper module (`src/utils/importExport.ts`) now backs all employee list import/export flows; helper
   tests and Playwright coverage demonstrate header validation + empty file errors. Future planners can reuse these
   utilities for other modules rather than recreating parsing logic.
 - Virtualization benchmark results refreshed after helper consolidation (10k → 95.21 ms, 30k → 133.03 ms, 50k → 318.67 ms); update comparison tables when evaluating performance regressions.
+- Phase 7 audit snapshot (2025-10-15): AI-doc drafts now include the accessible `formFieldAriaProps` example and a CSV/Excel helper snippet (`ai-docs/reference/snippets/utils/import-export.ts`) so future plans can cite the living patterns.
*** End Patch
PATCH
```

## Phase 3: Update Index, Manifest, and Discovery Notes

### Overview
Log the audit in the AI-docs index/manifest and ensure discovery/follow-up docs reflect the completed work.

### Changes Required:

#### 1. Update AI-docs index
**File**: `docs/System/ai-docs-index.md`
**Changes**: Mark the frozen snapshot expectation and link to the new snippet.

```markdown
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/System/ai-docs-index.md
@@
 - `ai-docs/wrappers-draft/form/`
   - `FormField.tsx` – label/hint/error wrapper.
   - `EmployeeForm.tsx` – RHF + Zod example form.
   - `README.md` – draft guidance for form wrappers.
+  - **Snapshot note** – Folder now mirrors the Phase 7 frozen reference (aria helper + CSV guidance).
@@
 - `ai-docs/reference/snippets/`
   - `tanstack-table/basic/src/main.tsx` – canonical table usage.
   - `tanstack-table/virtualized-rows/src/main.tsx` – virtualization with dynamic row heights.
   - `tanstack-virtual/table/src/main.tsx` – offset math for virtual table.
   - `minisearch/basic-search.ts` – fuzzy search helper.
+  - `utils/import-export.ts` – CSV/Excel helper derived from Employee Management shared utility.
   - `tremor/performance-card.tsx`, `recharts/basic-area-chart.tsx` – chart samples.
@@
 - Once the component-library refactor stabilises (Phase 7 follow-ups), produce a trimmed “frozen” reference snapshot of critical demos, note that status here, and avoid routine
   updates unless the reference intentionally changes.
+- **Status:** Phase 7 snapshot captured (2025-10-15). Update this note when the next snapshot is recorded.
*** End Patch
PATCH
```

#### 2. Update AI-docs manifest
**File**: `ai-docs/MANIFEST.md`
**Changes**: Mark wrapper prototypes as refreshed and log the new snippet entry.

```markdown
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: ai-docs/MANIFEST.md
@@
-- [ ] Draft wrapper prototypes.
+- [x] Draft wrapper prototypes – refreshed 2025-10-15 with accessible form helpers + CSV snippet.
@@
-- `reference/snippets/minisearch/basic-search.ts`
+- `reference/snippets/minisearch/basic-search.ts`
+- `reference/snippets/utils/import-export.ts`
*** End Patch
PATCH
```

#### 3. Update discovery + follow-up docs
**Files**:
- `docs/Tasks/phase-7-component-library-discovery.md`
- `docs/Tasks/phase-7-component-library-followups.md`
**Changes**: Note that the AI-docs audit is complete and point to the new snippet.

```markdown
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/phase-7-component-library-discovery.md
@@
 - Grow Vitest wrapper suite toward ≥80 % coverage (e.g., DataTable selection, overlay sheet transitions, button
   icon focus) and keep jsdom stubs updated alongside virtualization changes.
-- Mirror production docs/tests into `ai-docs/wrappers-draft/` so planners can reference identical APIs.
+- Mirror production docs/tests into `ai-docs/wrappers-draft/` so planners can reference identical APIs. ✅ 2025-10-15 snapshot captured (accessible form helpers + CSV snippet documented in AI docs).
@@
 - Virtualization benchmark rerun via `npx tsx scripts/benchmarks/datatable.ts` reports faster timings after helper
   consolidation (10k → 95.21 ms, 30k → 133.03 ms, 50k → 318.67 ms); numbers logged below for planners.
+- AI-docs references updated 2025-10-15: see `ai-docs/wrappers-draft/form/README.md` and `ai-docs/reference/snippets/utils/import-export.ts` for the frozen snapshot.
*** End Patch
PATCH
```

```markdown
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/phase-7-component-library-followups.md
@@
 - Keep wrapper READMEs (`src/wrappers/ui|form|data/README.md`) and inline TSDoc in sync with future API tweaks; mirror
-  updates in `ai-docs/wrappers-draft/` + `ai-docs/llm-reference/AiDocsReference.md`.
+  updates in `ai-docs/wrappers-draft/` + `ai-docs/llm-reference/AiDocsReference.md`. ✅ 2025-10-15 audit snapshot recorded.
@@
-- After the EmployeeList refactor stabilises, capture a trimmed “frozen” wrapper demo set in `ai-docs/wrappers-draft/`
-  and mark the frozen status in `docs/System/ai-docs-index.md` so future work knows the reference won’t update automatically.
+- After the EmployeeList refactor stabilises, capture a trimmed “frozen” wrapper demo set in `ai-docs/wrappers-draft/`
+  and mark the frozen status in `docs/System/ai-docs-index.md` so future work knows the reference won’t update automatically. ✅ Phase 7 reference recorded 2025-10-15.
*** End Patch
PATCH
```

## Tests & Validation
- `npm run build`
- `npm run test:unit`
- `git status -sb` (verify only the files above changed)

## Rollback
- `git checkout -- ai-docs/wrappers-draft/form/FormField.tsx ai-docs/wrappers-draft/form/EmployeeForm.tsx ai-docs/wrappers-draft/form/README.md ai-docs/wrappers-draft/README.md ai-docs/reference/snippets/utils/import-export.ts ai-docs/MANIFEST.md ai-docs/llm-reference/AiDocsReference.md docs/System/ai-docs-index.md docs/Tasks/phase-7-component-library-discovery.md docs/Tasks/phase-7-component-library-followups.md`

## Handoff
- Update `docs/SESSION_HANDOFF.md` with the audit summary, validation results, and snippet path.
- In `PROGRESS.md`, mark this plan _Completed_ and move the final-review plan back to **Active** once signed off.
- Archive this plan under `docs/Archive/Plans/executed/` after execution per SOP.
