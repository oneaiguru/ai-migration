# Overlay Migration – Phase 6 Task 1

## Metadata
## Required Reading (read in full)
- PROGRESS.md
- docs/SOP/plan-execution-sop.md
- docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md

- **Objective**: remove legacy overlay fallback, adopt Radix `Overlay` wrapper across all employee-management surfaces.
- **Source Notes**: `docs/Tasks/06_phase-6-migration-planning-prd.md` (Stage 1), research notes in `ai-docs/RESEARCH_BRIEF.md`.
- **Target Files**:
  - `src/components/common/Overlay.tsx`
  - `src/utils/featureFlags.ts`
  - `src/env.d.ts`
  - `src/components/EmployeeListContainer.tsx`
  - `src/components/QuickAddEmployee.tsx`
  - `src/components/EmployeeEditDrawer.tsx`
  - `src/hooks/useFocusTrap.ts` (remove)
  - `tests/employee-list.spec.ts`

## Pre-checks
```bash
set -euo pipefail
npm install
git status -sb
```

## Change Steps

### 1. Canonicalise Overlay Wrapper
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/common/Overlay.tsx
@@
-import { type CSSProperties, type ReactNode, useRef } from 'react';
-import { Dialog } from '@wrappers/ui/Dialog';
-import useFocusTrap from '../../hooks/useFocusTrap';
-import { RADIX_OVERLAYS_ENABLED } from '../../utils/featureFlags';
+import { type CSSProperties, type ReactNode } from 'react';
+import { Dialog } from '@wrappers/ui/Dialog';
@@
-  const useRadix = RADIX_OVERLAYS_ENABLED;
-  const legacyContentRef = useRef<HTMLDivElement | null>(null);
-
-  if (!open) {
-    return null;
-  }
-
-  if (useRadix) {
-    return (
-      <Dialog
-        open
-        onOpenChange={(next) => {
-          if (!next) {
-            onOpenChange(false);
-          }
-        }}
-        variant={variant === 'sheet' ? 'sheet' : 'modal'}
-        title={title}
-        description={description}
-        preventClose={preventClose}
-        testId={testId}
-        contentStyles={{ padding: 0, ...(contentStyles ?? {}) }}
-      >
-        <div
-          className={
-            variant === 'sheet'
-              ? contentClassName ?? 'flex h-full flex-col overflow-y-auto'
-              : contentClassName
-          }
-        >
-          {children}
-        </div>
-      </Dialog>
-    );
-  }
-
-  const overlayBaseClass =
-    variant === 'sheet'
-      ? 'fixed inset-0 z-50 bg-black/45 flex'
-      : 'fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4';
-  const contentBaseClass =
-    variant === 'sheet'
-      ? 'ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col'
-      : 'bg-white shadow-2xl rounded-xl w-full max-w-xl';
-
-  const handleOverlayClick = () => {
-    if (!preventClose && closeOnOverlayClick) {
-      onOpenChange(false);
-    }
-  };
-
-  useFocusTrap(legacyContentRef, {
-    enabled: open,
-    onEscape: () => {
-      if (!preventClose) {
-        onOpenChange(false);
-      }
-    },
-  });
-
-  return (
-    <div
-      className={`${overlayBaseClass} ${overlayClassName ?? ''}`.trim()}
-      onClick={handleOverlayClick}
-      role="presentation"
-    >
-      <div
-        ref={legacyContentRef}
-        role="dialog"
-        aria-modal="true"
-        aria-labelledby={ariaLabelledBy}
-        aria-describedby={ariaDescribedBy}
-        data-testid={testId}
-        className={`${contentBaseClass} ${contentClassName ?? ''}`.trim()}
-        style={contentStyles}
-        onClick={(event) => event.stopPropagation()}
-        tabIndex={-1}
-      >
-        {children}
-      </div>
-    </div>
-  );
+  if (!open) {
+    return null;
+  }
+
+  return (
+    <Dialog
+      open
+      onOpenChange={(next) => {
+        if (!next) {
+          onOpenChange(false);
+        }
+      }}
+      variant={variant === 'sheet' ? 'sheet' : 'modal'}
+      title={title}
+      description={description}
+      preventClose={preventClose}
+      testId={testId}
+      overlayClassName={overlayClassName}
+      closeOnOverlayClick={closeOnOverlayClick}
+      contentStyles={{ padding: 0, ...(contentStyles ?? {}) }}
+      ariaLabelledBy={ariaLabelledBy}
+      ariaDescribedBy={ariaDescribedBy}
+    >
+      <div
+        className={
+          variant === 'sheet'
+            ? contentClassName ?? 'flex h-full flex-col overflow-y-auto'
+            : contentClassName
+        }
+      >
+        {children}
+      </div>
+    </Dialog>
+  );
 }
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/utils/featureFlags.ts
@@
-export const RADIX_OVERLAYS_ENABLED = parseFlag(
-  import.meta.env.VITE_USE_RADIX_OVERLAYS,
-  false,
-);
-
 export const TANSTACK_TABLE_ENABLED = parseFlag(
   import.meta.env.VITE_USE_TANSTACK_TABLE,
   true,
 );
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/env.d.ts
@@
 declare global {
   interface ImportMetaEnv {
-    readonly VITE_USE_RADIX_OVERLAYS?: string;
     readonly VITE_USE_TANSTACK_TABLE?: string;
   }
 }
*** End Patch
PATCH
```

### 2. Remove Legacy Focus Hook
```bash
rm src/hooks/useFocusTrap.ts
```

### 3. Update EmployeeListContainer Overlays
> Preserve business logic; only replace overlay shells.

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-import React, { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';
-import EmployeeEditDrawer from './EmployeeEditDrawer';
+import React, { useCallback, useEffect, useMemo, useRef, useState, startTransition } from 'react';
+import EmployeeEditDrawer from './EmployeeEditDrawer';
+import { Overlay } from './common/Overlay';
@@
-import { createTaskEntry } from '../utils/task';
-import useFocusTrap from '../hooks/useFocusTrap';
+import { createTaskEntry } from '../utils/task';
@@
-  const importModalRef = useRef<HTMLDivElement | null>(null);
-  const exportModalRef = useRef<HTMLDivElement | null>(null);
*** End Patch
PATCH
```

Bulk-edit drawer replacement:
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-      {isBulkEditOpen && (
-        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={handleBulkEditClose}>
-          <div
-            tabIndex={-1}
-            role="dialog"
-            aria-modal="true"
-            aria-labelledby="bulk-edit-heading"
-            className="ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
-            onClick={(event) => event.stopPropagation()}
-          >
-            <form className="flex flex-col h-full" onSubmit={handleBulkEditSubmit}>
-              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
-                <div>
-                  <h3 id="bulk-edit-heading" className="text-lg font-semibold text-gray-900">Редактирование данных сотрудников</h3>
-                  <p className="text-sm text-gray-500">
-                    Выбрано: {selectedEmployees.size}{' '}
-                    {selectedEmployees.size === 1 ? 'сотрудник' : 'сотрудников'}.
-                  </p>
-                </div>
-                <button
-                  type="button"
-                  onClick={handleBulkEditClose}
-                  className="text-gray-400 hover:text-gray-600"
-                  aria-label="Закрыть массовое редактирование"
-                >
-                  ✕
-                </button>
-              </div>
+      <Overlay
+        open={isBulkEditOpen}
+        onOpenChange={(open) => {
+          if (!open) {
+            handleBulkEditClose();
+          }
+        }}
+        variant="sheet"
+        title="Редактирование данных сотрудников"
+        description={`Выбрано: ${selectedEmployees.size} ${selectedEmployees.size === 1 ? 'сотрудник' : 'сотрудников'}.`}
+        testId="bulk-edit-overlay"
+        contentStyles={{
+          padding: 0,
+          width: 'min(720px, 100vw)',
+        }}
+      >
+        <form className="flex flex-col h-full" onSubmit={handleBulkEditSubmit}>
@@
-              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
-                <button
-                  type="button"
-                  onClick={handleBulkEditClose}
-                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
-                >
-                  Отмена
-                </button>
-                <button
-                  type="submit"
-                  className="px-5 py-2 bg-blue-600 текст-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
-                >
-                  Применить изменения
-                </button>
-              </div>
-            </form>
-          </div>
-        </div>
-      )}
+          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
+            <button
+              type="button"
+              onClick={handleBulkEditClose}
+              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
+            >
+              Отмена
+            </button>
+            <button
+              type="submit"
+              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
+            >
+              Применить изменения
+            </button>
+          </div>
+        </form>
+      </Overlay>
*** End Patch
PATCH
```

Column settings drawer:
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-      {/* Column settings drawer */}
-      {showColumnSettings && (
-        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={closeColumnSettings}>
-          <div
-            tabIndex={-1}
-            role="dialog"
-            aria-modal="true"
-            aria-labelledby="column-settings-heading"
-            className="ml-auto h-full w-full max-w-sm bg-white shadow-xl flex flex-col"
-            onClick={(event) => event.stopPropagation()}
-          >
+      <Overlay
+        open={showColumnSettings}
+        onOpenChange={(open) => {
+          if (!open) {
+            closeColumnSettings();
+          }
+        }}
+        variant="sheet"
+        title="Настройка отображения"
+        description="Выберите поля для отображения в таблице сотрудников."
+        testId="column-settings-overlay"
+        contentStyles={{
+          padding: 0,
+          width: 'min(384px, 100vw)',
+        }}
+      >
             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
               <div className="flex items-center gap-3">
                 <button
                   type="button"
                   onClick={closeColumnSettings}
                   className="text-gray-500 hover:text-gray-700"
                   aria-label="Вернуться к списку сотрудников"
                 >
                   ←
                 </button>
-                <h3 id="column-settings-heading" className="text-base font-semibold text-gray-900">Настройка отображения</h3>
+                <p className="text-base font-semibold text-gray-900">Настройка отображения</p>
               </div>
               <button
                 type="button"
                 onClick={closeColumnSettings}
                 className="text-gray-400 hover:text-gray-600"
                 aria-label="Закрыть настройки отображения"
               >
                 ✕
               </button>
             </div>
-            <div className="px-5 py-3 border-b border-gray-100">
-              <p className="text-sm text-gray-500">Выберите поля для отображения в таблице сотрудников.</p>
-            </div>
             <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
               {COLUMN_ORDER.map((column) => (
                 <label key={column.key} className="flex items-center gap-3 text-sm text-gray-700">
@@
-            <div className="px-5 py-4 border-t border-gray-200 flex justify-end">
-              <button
-                type="button"
-                onClick={closeColumnSettings}
-                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
-              >
-                Сохранить изменения
-              </button>
-            </div>
-          </div>
-        </div>
-      )}
+        <div className="px-5 py-4 border-t border-gray-200 flex justify-end">
+          <button
+            type="button"
+            onClick={closeColumnSettings}
+            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
+          >
+            Сохранить изменения
+          </button>
+        </div>
+      </Overlay>
*** End Patch
PATCH
```

Tag manager modal:
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-      {/* Tag manager */}
-      {showTagManager && (
-        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={closeTagManager}>
-          <div
-            tabIndex={-1}
-            role="dialog"
-            aria-modal="true"
-            aria-labelledby="tag-manager-heading"
-            className="bg-white rounded-xl max-w-lg w-full shadow-xl"
-            onClick={(event) => event.stopPropagation()}
-          >
-            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
-              <div>
-                <h3 id="tag-manager-heading" className="text-lg font-semibold text-gray-900">Управление тегами</h3>
-                <p className="text-sm text-gray-500">См. Appendix 6 — Tag Import Template</p>
-              </div>
-              <button
-                type="button"
-                onClick={closeTagManager}
-                className="text-gray-400 hover:text-gray-600"
-                aria-label="Закрыть управление тегами"
-              >
-                ✕
-              </button>
-            </div>
+      <Overlay
+        open={showTagManager}
+        onOpenChange={(open) => {
+          if (!open) {
+            closeTagManager();
+          }
+        }}
+        variant="modal"
+        title="Управление тегами"
+        description="См. Appendix 6 — Tag Import Template"
+        testId="tag-manager-overlay"
+        contentStyles={{
+          padding: 0,
+          width: 'min(544px, 100vw - 32px)',
+          overflow: 'hidden',
+        }}
+      >
             <div className="px-6 py-5 space-y-5">
@@
-            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
-              <button
-                type="button"
-                onClick={closeTagManager}
-                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
-              >
-                Отмена
-              </button>
-              <button
-                type="button"
-                onClick={handleApplyTags}
-                disabled={selectedEmployees.size === 0}
-                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
-                  selectedEmployees.size === 0
-                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
-                    : 'bg-blue-600 text-white hover:bg-blue-700'
-                }`}
-              >
-                Применить изменения
-              </button>
-            </div>
-          </div>
-        </div>
-      )}
+        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
+          <button
+            type="button"
+            onClick={closeTagManager}
+            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
+          >
+            Отмена
+          </button>
+          <button
+            type="button"
+            onClick={handleApplyTags}
+            disabled={selectedEmployees.size === 0}
+            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
+              selectedEmployees.size === 0
+                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
+                : 'bg-blue-600 text-white hover:bg-blue-700'
+            }`}
+          >
+            Применить изменения
+          </button>
+        </div>
+      </Overlay>
*** End Patch
PATCH
```

Import/export modals already covered inside previous patch (ensure `description` added). No further changes needed after executing commands above.

### 4. Quick Add & Edit Drawer Titles
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/QuickAddEmployee.tsx
@@
-import React, { useEffect, useMemo, useState } from 'react';
+import React, { useEffect, useMemo, useState } from 'react';
@@
-      contentClassName="bg-white rounded-xl max-w-md w-full shadow-2xl"
-      contentStyles={{ padding: 0 }}
+      contentClassName="bg-white rounded-xl max-w-md w-full shadow-2xl"
+      contentStyles={{ padding: 0 }}
@@
-        <div>
-          <p className="text-lg font-semibold text-gray-900">Быстрое добавление сотрудника</p>
-          <p className="text-sm text-gray-500">
-            Создавайте черновик карточки: только логин и пароль — как в WFM.
-          </p>
-        </div>
+        <div>
+          <p className="text-lg font-semibold text-gray-900">Быстрое добавление сотрудника</p>
+          <p className="text-sm text-gray-500">Создавайте черновик карточки: только логин и пароль — как в WFM.</p>
+        </div>
*** End Patch
PATCH
```

```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeEditDrawer.tsx
@@
-import React, { useEffect, useMemo, useState } from 'react';
+import React, { useEffect, useMemo, useState } from 'react';
@@
     <Overlay
       open={isOpen}
       onOpenChange={(openState) => {
         if (!openState && !isSubmitting && !isLoading) {
           onClose();
         }
       }}
       variant="sheet"
+      title={headerName}
+      description={isCreateMode ? 'Создание нового сотрудника' : 'Редактирование данных сотрудника'}
       preventClose={isLoading || isSubmitting}
*** End Patch
PATCH
```

### 5. Tests – Align Selectors with Data Test IDs
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/employee-list.spec.ts
@@
 const openImportModal = async (page: Page, context: string) => {
   await page.locator('[title="Импортировать"]').first().click();
   const testId = IMPORT_CONTEXT_TEST_IDS[context];
   await page.getByTestId(`import-option-${testId}`).click();
-  await expect(page.getByRole('heading', { name: /Импорт/ })).toBeVisible();
+  await expect(page.getByTestId('import-modal')).toBeVisible();
 };
 
 const openExportModal = async (page: Page, context: string) => {
   await page.locator('[title="Экспортировать"]').first().click();
   const testId = EXPORT_CONTEXT_TEST_IDS[context];
   const popover = page.getByTestId('export-toolbar-popover');
   await popover.getByRole('button', { name: context }).click();
-  await expect(page.getByRole('heading', { name: /Экспорт/ })).toBeVisible();
+  await expect(page.getByTestId('export-modal')).toBeVisible();
 };
@@
-    await expect(page.getByRole('heading', { name: 'Импорт навыков' })).toBeVisible();
-    await expect(page.getByText('Шаблон: Appendix 3')).toBeVisible();
+    const importModal = page.getByTestId('import-modal');
+    await expect(importModal).toBeVisible();
+    await expect(importModal.getByText('Шаблон: Appendix 3')).toBeVisible();
@@
-    await expect(page.getByRole('heading', { name: 'Экспорт отпусков' })).toBeVisible();
-    await expect(page.getByText('Выгрузка сотрудников со статусом «В отпуске».')).toBeVisible();
+    const exportModal = page.getByTestId('export-modal');
+    await expect(exportModal).toBeVisible();
+    await expect(exportModal.getByText('Выгрузка сотрудников со статусом «В отпуске».')).toBeVisible();
*** End Patch
PATCH
```

Bulk edit drawer assertion update:
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/employee-list.spec.ts
@@
-    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
+    await expect(page.getByTestId('employee-edit-drawer')).toBeVisible();
*** End Patch
PATCH
```

### 6. Git Clean Up
```bash
rm -rf test-results
```

## Tests & Verification
```bash
set -euo pipefail
npm run build
npm run test -- --project=chromium --workers=1 --grep "Employee list"
```
(Full suite optional afterwards.)

## Acceptance Checklist
- [ ] No console errors about missing `DialogTitle` during Playwright run.
- [ ] Bulk-edit, tag manager, import/export, column settings, quick add, edit drawer open/close via Radix overlays with focus trapping intact.
- [ ] Import/export helpers in tests target `data-testid` overlays successfully.
- [ ] `src/hooks/useFocusTrap.ts` removal confirmed (`git status` clean for code files).

## Rollback
```bash
set -euo pipefail
git reset --hard HEAD
git clean -fd
```

---

**Next Plan:** `plans/02_form-migration.plan.md`
