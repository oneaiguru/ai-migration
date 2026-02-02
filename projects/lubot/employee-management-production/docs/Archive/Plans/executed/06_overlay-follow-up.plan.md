## Metadata
- **Task**: Phase 6 Overlay Follow-up – Hidden Titles, Dependencies, and Guardrails
- **Plan Date**: 2025-10-10
- **Owner**: Planner → next Executor
- **Source Discovery**: `docs/Tasks/phase-6-overlay-discovery.md`
- **Target Files**:
  - `package.json`, `package-lock.json`
  - `src/wrappers/ui/Dialog.tsx`, `src/components/common/Overlay.tsx`
  - `src/components/EmployeeListContainer.tsx`
  - `src/components/QuickAddEmployee.tsx`
  - `src/components/EmployeeEditDrawer.tsx`
  - `tests/employee-list.spec.ts`
  - `src/wrappers/ui/README.md`
  - `docs/Tasks/phase-6-overlay-discovery.md`, `docs/SESSION_HANDOFF.md`, `PROGRESS.md`

## Desired End State
All overlays render accessible Radix titles/descriptions without console warnings, the shared dialog wrapper exposes hidden-title helpers backed by `@radix-ui/react-visually-hidden`, and Playwright fails fast if Radix warnings reappear. Docs capture the new wrapper contract and the discovery checklist reflects the reduced backlog. Execution finishes with clean builds/tests and a documented handoff.

### Key Discoveries:
- `docs/Tasks/phase-6-overlay-discovery.md:41-49` – empty `title=""` props trigger Radix `DialogContent requires a DialogTitle` warnings; need hidden headings + VisuallyHidden dependency.
- `package.json:14-24` – `@radix-ui/react-visually-hidden` missing from dependencies; required to render hidden titles consistently.
- `src/components/EmployeeListContainer.tsx:2442-3127` – bulk edit, column settings, tag manager, import/export overlays rely on manual `<h3>` + `title=""`.
- `src/components/QuickAddEmployee.tsx:174-212` – quick-add modal passes empty title/description while rendering header IDs manually.
- `src/components/EmployeeEditDrawer.tsx:477-525` – edit drawer sheet sets `title=""` and duplicates heading markup.
- `tests/employee-list.spec.ts:15-35` – Playwright suite only logs console errors; Radix warnings slip through.

## What We're NOT Doing
- No refactor of overlay layouts beyond keeping existing visual headers aligned to screenshots.
- No new data persistence or business-logic changes to bulk edit/tag/import/export flows.
- No additional Playwright scenarios beyond the console guardrail hookup.
- No code execution of plan steps in this session (planning only).

## Implementation Approach
Install Radix’s VisuallyHidden helper, extend the shared `Dialog` wrapper with `titleHidden`/`descriptionHidden` toggles, and update the lightweight `Overlay` facade to forward them. Each consumer overlay will set meaningful `title`/`description` strings and mark them hidden while retaining bespoke headers for layout. Finally, tighten Playwright’s console hook to fail on Radix warnings, refresh wrapper docs, and prune discovery notes.

## Phase 0: Review AI Docs Workspace

### Overview
Confirm the latest research context so execution aligns with the Phase 6 knowledge base.

### Changes Required:

1. **Read `ai-docs/README.md`** – understand folder layout (MANIFEST, RESEARCH_BRIEF, QUESTIONS, playground, wrapper drafts).
2. **Skim `ai-docs/MANIFEST.md` and `ai-docs/RESEARCH_BRIEF.md`** – note prior findings for Radix dialog accessibility and wrapper expectations.
3. **Check `ai-docs/QUESTIONS.md`** – confirm no open blockers related to overlay accessibility remain unresolved.
4. **(Optional) Run the playground** – if needed, peek at `ai-docs/playground/src/examples/dialog-demo/DialogDemo.tsx` to compare VisuallyHidden usage before updating production code.

## Phase 1: Wrapper & Dependency Prep

### Overview
Add the missing dependency and enhance the dialog wrapper so executors can hide headings without violating Radix requirements.

### Changes Required:

#### 1. Install Radix VisuallyHidden helper
**File**: `package.json`
**Changes**: add `@radix-ui/react-visually-hidden` to dependencies and sync the lockfile.

```bash
npm install @radix-ui/react-visually-hidden@latest
```

#### 2. Extend shared dialog wrapper for hidden headings
**File**: `src/wrappers/ui/Dialog.tsx`
**Changes**: import `@radix-ui/react-visually-hidden`, add `titleHidden`/`descriptionHidden` props, trim empty strings, and render hidden Radix titles/descriptions when requested.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/wrappers/ui/Dialog.tsx
@@
-import * as DialogPrimitive from "@radix-ui/react-dialog";
-import { type CSSProperties, type ReactNode, useId } from "react";
+import * as DialogPrimitive from "@radix-ui/react-dialog";
+import { Root as VisuallyHidden } from "@radix-ui/react-visually-hidden";
+import { type CSSProperties, type ReactNode, useId } from "react";
@@
   testId?: string;
   closeLabel?: string;
   preventClose?: boolean;
   overlayStyles?: CSSProperties;
   contentStyles?: CSSProperties;
   overlayClassName?: string;
   contentClassName?: string;
   closeOnOverlayClick?: boolean;
   closeOnEscape?: boolean;
   showCloseButton?: boolean;
   ariaLabelledBy?: string;
   ariaDescribedBy?: string;
   portalContainer?: HTMLElement | null;
+  titleHidden?: boolean;
+  descriptionHidden?: boolean;
 }
@@
   overlayClassName,
   contentClassName,
   closeOnOverlayClick = true,
   closeOnEscape = true,
   showCloseButton = true,
   ariaLabelledBy,
   ariaDescribedBy,
   portalContainer,
+  titleHidden = false,
+  descriptionHidden = false,
 }: DialogProps) {
   const generatedTitleId = useId();
   const generatedDescriptionId = useId();
 
-  const hasTitle = Boolean(title && title.trim().length > 0);
-  const hasDescription = Boolean(description);
+  const hasTitle = Boolean(title && title.trim().length > 0);
+  const hasDescription = Boolean(description && description.trim().length > 0);
@@
-          {hasTitle ? (
-            <DialogPrimitive.Title
-              id={shouldAttachGeneratedTitleId ? generatedTitleId : undefined}
-              style={titleStyle}
-            >
-              {title}
-            </DialogPrimitive.Title>
-          ) : null}
-
-          {hasDescription ? (
-            <DialogPrimitive.Description
-              id={shouldAttachGeneratedDescriptionId ? `${generatedDescriptionId}-desc` : undefined}
-              style={descriptionStyle}
-            >
-              {description}
-            </DialogPrimitive.Description>
-          ) : null}
+          {hasTitle
+            ? titleHidden
+              ? (
+                  <DialogPrimitive.Title
+                    id={shouldAttachGeneratedTitleId ? generatedTitleId : undefined}
+                    asChild
+                  >
+                    <VisuallyHidden>{title}</VisuallyHidden>
+                  </DialogPrimitive.Title>
+                )
+              : (
+                  <DialogPrimitive.Title
+                    id={shouldAttachGeneratedTitleId ? generatedTitleId : undefined}
+                    style={titleStyle}
+                  >
+                    {title}
+                  </DialogPrimitive.Title>
+                )
+            : null}
+
+          {hasDescription
+            ? descriptionHidden
+              ? (
+                  <DialogPrimitive.Description
+                    id={shouldAttachGeneratedDescriptionId ? `${generatedDescriptionId}-desc` : undefined}
+                    asChild
+                  >
+                    <VisuallyHidden>{description}</VisuallyHidden>
+                  </DialogPrimitive.Description>
+                )
+              : (
+                  <DialogPrimitive.Description
+                    id={shouldAttachGeneratedDescriptionId ? `${generatedDescriptionId}-desc` : undefined}
+                    style={descriptionStyle}
+                  >
+                    {description}
+                  </DialogPrimitive.Description>
+                )
+            : null}
*** End Patch
PATCH
```

#### 3. Forward hidden-heading props through Overlay facade
**File**: `src/components/common/Overlay.tsx`
**Changes**: allow callers to specify `titleHidden`/`descriptionHidden` and pass them to the dialog wrapper.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/common/Overlay.tsx
@@
   overlayClassName?: string;
   ariaLabelledBy?: string;
   ariaDescribedBy?: string;
   closeOnOverlayClick?: boolean;
   closeOnEscape?: boolean;
   showCloseButton?: boolean;
   contentStyles?: CSSProperties;
   overlayStyles?: CSSProperties;
+  titleHidden?: boolean;
+  descriptionHidden?: boolean;
 }
@@
   ariaLabelledBy,
   ariaDescribedBy,
   closeOnOverlayClick = true,
   closeOnEscape = true,
   showCloseButton = true,
   contentStyles,
   overlayStyles,
+  titleHidden = false,
+  descriptionHidden = false,
 }: OverlayProps) {
@@
       closeOnOverlayClick={closeOnOverlayClick}
       closeOnEscape={closeOnEscape}
       showCloseButton={showCloseButton}
       ariaLabelledBy={ariaLabelledBy}
       ariaDescribedBy={ariaDescribedBy}
+      titleHidden={titleHidden}
+      descriptionHidden={descriptionHidden}
     >
*** End Patch
PATCH
```

## Phase 2: Overlay Consumers & Layout Checks

### Overview
Supply meaningful titles/descriptions to each overlay, hide them via the new props, and verify layouts still match reference screenshots.

### Changes Required:

#### 1. Bulk edit and auxiliary overlays
**File**: `src/components/EmployeeListContainer.tsx`
**Changes**: replace empty titles with explicit strings per overlay, set `titleHidden`, and add concise descriptions where helpful.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-      <Overlay
+      <Overlay
         open={isBulkEditOpen}
@@
-        title=""
+        title="Редактирование данных сотрудников"
+        description="Применение массовых изменений для выбранных сотрудников"
+        titleHidden
+        descriptionHidden
@@
-      <Overlay
+      <Overlay
         open={showColumnSettings}
@@
-        title=""
+        title="Настройка отображения колонок"
+        description="Управление столбцами списка сотрудников"
+        titleHidden
+        descriptionHidden
@@
-      <Overlay
+      <Overlay
         open={showTagManager}
@@
-        title=""
+        title="Управление тегами сотрудников"
+        description="Добавление и обновление тегов для отобранных сотрудников"
+        titleHidden
+        descriptionHidden
@@
-      <Overlay
+      <Overlay
         open={showImportModal}
@@
-        title=""
+        title="Импорт сотрудников"
+        description={`Импорт данных для раздела: ${importContext}`}
+        titleHidden
+        descriptionHidden
@@
-      <Overlay
+      <Overlay
         open={showExportModal}
@@
-        title=""
+        title="Экспорт списка сотрудников"
+        description={`Формирование файла: ${exportContext}`}
+        titleHidden
+        descriptionHidden
*** End Patch
PATCH
```

After applying the patch, double-check string interpolation for `${importContext}`/`${exportContext}` remains inside template literals.

#### 2. Quick Add modal accessibility
**File**: `src/components/QuickAddEmployee.tsx`
**Changes**: provide real title/description strings and hide them in the wrapper; keep existing visual header IDs for layout.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/QuickAddEmployee.tsx
@@
-    <Overlay
+    <Overlay
       open={isOpen}
@@
-      title=""
-      ariaLabelledBy={headingId}
-      ariaDescribedBy={descriptionId}
+      title="Быстрое добавление сотрудника"
+      description="Создаёт черновик карточки по логину и паролю"
+      titleHidden
+      descriptionHidden
+      ariaLabelledBy={headingId}
+      ariaDescribedBy={descriptionId}
*** End Patch
PATCH
```

#### 3. Employee edit drawer sheet
**File**: `src/components/EmployeeEditDrawer.tsx`
**Changes**: feed the dynamic employee name into the overlay title, add a description summarising the mode, and hide both in the wrapper.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeEditDrawer.tsx
@@
-  return (
-    <Overlay
+  const overlayDescription = isCreateMode
+    ? 'Создание новой карточки сотрудника'
+    : 'Редактирование данных действующего сотрудника';
+
+  return (
+    <Overlay
       open={isOpen}
@@
-      title=""
-      ariaLabelledBy="employee-drawer-heading"
+      title={headerName}
+      description={overlayDescription}
+      titleHidden
+      descriptionHidden
+      ariaLabelledBy="employee-drawer-heading"
*** End Patch
PATCH
```

#### 4. Manual layout verification
After code updates, run a quick preview (`npm run preview -- --host 127.0.0.1 --port 4174`) and compare bulk edit, tag manager, import/export, quick add, and edit drawer headers against the reference screenshots noted in `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`. Capture any spacing regressions in the handoff if found.

## Phase 3: Playwright Console Guardrail

### Overview
Ensure the employee list suite fails when Radix emits console warnings about missing dialog titles/descriptions.

### Changes Required:

#### 1. Promote warnings to test failures
**File**: `tests/employee-list.spec.ts`
**Changes**: enhance the existing `page.on('console')` hook to throw on warning messages mentioning `DialogContent requires a DialogTitle` or `DialogContent requires either aria-label or aria-labelledby`.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/employee-list.spec.ts
@@
-    page.on('console', (message) => {
-      if (message.type() === 'error') {
-        // eslint-disable-next-line no-console
-        console.error('Console error:', message.text());
-      }
-    });
+    page.on('console', (message) => {
+      if (message.type() === 'error') {
+        throw new Error(`Console error: ${message.text()}`);
+      }
+      if (
+        message.type() === 'warning' &&
+        /DialogContent requires (a DialogTitle|either aria-label or aria-labelledby)/.test(message.text())
+      ) {
+        throw new Error(`Radix dialog warning: ${message.text()}`);
+      }
+    });
*** End Patch
PATCH
```

## Phase 4: Documentation & Discovery Updates

### Overview
Record the new wrapper contract and close out discovery notes so future planners/executors share the same expectations.

### Changes Required:

#### 1. Update wrapper README with new props
**File**: `src/wrappers/ui/README.md`
**Changes**: document the `titleHidden`/`descriptionHidden` flags and reference the new dependency.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/wrappers/ui/README.md
@@
-## Dialogs & Overlays
-- Always provide an accessible heading for `DialogContent`. If the visual design needs the title hidden,
-  render a `DialogPrimitive.Title` wrapped in Radix's `VisuallyHidden` and pass its id via `ariaLabelledBy`.
-  Skipping this will trigger runtime console warnings and break screen reader expectations.
-- When you expose an opt-in empty title (e.g. our sheet variant), ensure the caller supplies
-  `ariaLabelledBy`/`ariaDescribedBy` to match their visible heading/description.
+## Dialogs & Overlays
+- Always provide an accessible heading for `DialogContent`. When the visual design hides it, set
+  `titleHidden`/`descriptionHidden` on `Dialog`/`Overlay` so the wrapper renders Radix's
+  `VisuallyHidden` elements automatically (requires `@radix-ui/react-visually-hidden`).
+- If you rely on bespoke headers inside the overlay body, keep `ariaLabelledBy`/`ariaDescribedBy`
+  pointing at those elements so assistive tech announces the same copy users see.
*** End Patch
PATCH
```

#### 2. Trim resolved discovery bullets
**File**: `docs/Tasks/phase-6-overlay-discovery.md`
**Changes**: note that hidden titles, dependency gaps, and warning guardrails are addressed by this plan, leaving any remaining scouting items.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/Tasks/phase-6-overlay-discovery.md
@@
-## 2025-10-10 – Scout Notes
-- Radix still raises `DialogContent requires a DialogTitle` warnings whenever overlays pass `title=""` (console output reproduced while running `tests/employee-list.spec.ts`). The shared wrapper needs a built-in hidden-title path.
-- `@radix-ui/react-visually-hidden` is **not** listed in `package.json`; add it alongside `@radix-ui/react-dialog` so the wrapper can render hidden headings without custom hacks.
-- Employee overlays that render bespoke headers must provide real title/description strings before hiding them:
-  - `src/components/EmployeeListContainer.tsx` (bulk edit, column settings, tag manager, import/export) currently pass empty strings.
-  - `src/components/QuickAddEmployee.tsx` leans on `ariaLabelledBy` instead of a dialog title/description.
-  - `src/components/EmployeeEditDrawer.tsx` sets `title=""` while rendering manual `<h2>` headers.
-- After titles move into the shared wrapper, recheck the bulk-edit, import, and export layouts so summary blocks still match the reference screenshots.
-- Harden Playwright: keep using overlay `data-testid`s and fail the suite if Radix logs dialog-title warnings again.
+## 2025-10-10 – Scout Notes
+- Hidden title/descriptions: address via wrapper `titleHidden`/`descriptionHidden` props (see plan `plans/2025-10-10_overlay-follow-up.plan.md`).
+- Dependency hygiene: add `@radix-ui/react-visually-hidden` alongside Radix dialog before execution.
+- Overlay consumers: update Employee list overlays, QuickAdd, and EmployeeEditDrawer to pass real strings while hiding headings.
+- Layout audit: after execution, compare bulk edit/import/export/tag manager headers against parity screenshots.
+- Playwright guardrail: promote Radix dialog warnings to failures in `tests/employee-list.spec.ts`.
*** End Patch
PATCH
```

## Tests & Validation
- `npm run build`
- `npm run test -- --project=chromium --workers=1 --grep "Employee list"`
- Manual overlay sweep in preview build to confirm headers render correctly and no new console warnings appear (`bulk edit → tag manager → import → export → quick add → edit drawer`).

## Rollback
If any step fails:
1. `git restore package.json package-lock.json src/wrappers/ui/Dialog.tsx src/components/common/Overlay.tsx src/components/EmployeeListContainer.tsx src/components/QuickAddEmployee.tsx src/components/EmployeeEditDrawer.tsx tests/employee-list.spec.ts src/wrappers/ui/README.md docs/Tasks/phase-6-overlay-discovery.md`
2. `npm install` (to resync dependencies).

## Handoff
- Update `PROGRESS.md` Active Plan status to reflect progress (e.g., In Progress → Completed) and keep the notes concise.
- Append execution outcomes, console warning observations, and manual check results to `docs/SESSION_HANDOFF.md` referencing this plan filename.
- Leave the repository with a clean `git status` (no unstaged or untracked files).
