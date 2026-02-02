# Overlay Migration – 2025-10-10

## Metadata
- **Plan ID**: 2025-10-10_overlay-migration
- **Objective**: Move every employee-management overlay onto the shared Radix wrapper so focus handling lives in `@wrappers/ui/Dialog`/`Overlay`, delete the legacy focus-trap hook, and stabilise Playwright selectors with `data-testid` targets.
- **Source Notes**: `docs/Tasks/phase-6-overlay-discovery.md`
- **Target Files**:
  - `src/wrappers/ui/Dialog.tsx`
  - `src/components/common/Overlay.tsx`
  - `src/components/EmployeeListContainer.tsx`
  - `src/components/QuickAddEmployee.tsx`
  - `src/components/EmployeeEditDrawer.tsx`
  - `src/hooks/useFocusTrap.ts` (remove)
  - `tests/employee-list.spec.ts`
  - `docs/SESSION_HANDOFF.md`

## Required Reading (complete before changes)
1. `PROGRESS.md`
2. `docs/SOP/plan-execution-sop.md`
3. `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`
4. `docs/Tasks/phase-6-overlay-discovery.md`

## Pre-checks
```bash
set -euo pipefail
npm install
git status -sb
```

## Change Steps

### 1. Extend dialog wrappers for overlay controls
Add the missing prop surface to `@wrappers/ui/Dialog` and thread them through `Overlay` so every consumer can toggle overlay/escape closure and class hooks.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/wrappers/ui/Dialog.tsx
@@
 export interface DialogProps {
   open?: boolean;
   defaultOpen?: boolean;
   onOpenChange?: (open: boolean) => void;
   trigger?: ReactNode;
   title: string;
   description?: string;
   children: ReactNode;
   footer?: ReactNode;
   size?: DialogSize;
   variant?: DialogVariant;
   testId?: string;
   closeLabel?: string;
   preventClose?: boolean;
   overlayStyles?: CSSProperties;
   contentStyles?: CSSProperties;
+  overlayClassName?: string;
+  contentClassName?: string;
+  closeOnOverlayClick?: boolean;
+  closeOnEscape?: boolean;
+  showCloseButton?: boolean;
+  ariaLabelledBy?: string;
+  ariaDescribedBy?: string;
   portalContainer?: HTMLElement | null;
 }
@@
 export function Dialog({
   open,
   defaultOpen,
   onOpenChange,
   trigger,
   title,
   description,
   children,
   footer,
   size = "md",
   variant = "modal",
   testId,
   closeLabel = "Закрыть",
   preventClose = false,
   overlayStyles: overlayOverrides,
   contentStyles: contentOverrides,
+  overlayClassName,
+  contentClassName,
+  closeOnOverlayClick = true,
+  closeOnEscape = true,
+  showCloseButton = true,
+  ariaLabelledBy,
+  ariaDescribedBy,
   portalContainer,
 }: DialogProps) {
-  const descriptionId = useId();
-  const headingId = useId();
-
-  const ariaDescriptionId = description ? `${descriptionId}-desc` : undefined;
+  const generatedTitleId = useId();
+  const generatedDescriptionId = useId();
+
+  const titleId = ariaLabelledBy ?? generatedTitleId;
+  const descriptionId = ariaDescribedBy ?? (description ? `${generatedDescriptionId}-desc` : undefined);
@@
         <DialogPrimitive.Overlay
           data-testid={testId ? `${testId}-overlay` : undefined}
           style={mergedOverlayStyle}
+          className={overlayClassName}
         />
         <DialogPrimitive.Content
           data-testid={testId}
-          aria-describedby={ariaDescriptionId}
-          aria-labelledby={headingId}
+          aria-describedby={descriptionId}
+          aria-labelledby={titleId}
           data-variant={variant}
           style={mergedContentStyle}
-        >
-          {!preventClose && (
+          className={contentClassName}
+          onPointerDownOutside={(event) => {
+            if (preventClose || !closeOnOverlayClick) {
+              event.preventDefault();
+            }
+          }}
+          onEscapeKeyDown={(event) => {
+            if (preventClose || !closeOnEscape) {
+              event.preventDefault();
+            }
+          }}
+        >
+          {!preventClose && showCloseButton && (
             <DialogPrimitive.Close asChild>
               <button
                 type="button"
                 aria-label={closeLabel}
                 style={closeButtonStyle}
@@
-          <DialogPrimitive.Title id={headingId} style={titleStyle}>
+          <DialogPrimitive.Title id={titleId} style={titleStyle}>
             {title}
           </DialogPrimitive.Title>
 
           {description ? (
-            <DialogPrimitive.Description id={ariaDescriptionId} style={descriptionStyle}>
+            <DialogPrimitive.Description id={descriptionId ?? undefined} style={descriptionStyle}>
               {description}
             </DialogPrimitive.Description>
           ) : null}
*** End Patch
PATCH
```
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/common/Overlay.tsx
@@
   contentClassName?: string;
   overlayClassName?: string;
   ariaLabelledBy?: string;
   ariaDescribedBy?: string;
   closeOnOverlayClick?: boolean;
+  closeOnEscape?: boolean;
+  showCloseButton?: boolean;
+  closeLabel?: string;
   contentStyles?: CSSProperties;
 }
@@
   testId,
   contentClassName,
   overlayClassName,
   ariaLabelledBy,
   ariaDescribedBy,
   closeOnOverlayClick = true,
+  closeOnEscape = true,
+  showCloseButton = true,
+  closeLabel,
   contentStyles,
 }: OverlayProps) {
@@
       testId={testId}
       contentStyles={{ padding: 0, ...(contentStyles ?? {}) }}
       overlayClassName={overlayClassName}
       closeOnOverlayClick={closeOnOverlayClick}
+      closeOnEscape={closeOnEscape}
+      showCloseButton={showCloseButton}
+      closeLabel={closeLabel}
       ariaLabelledBy={ariaLabelledBy}
       ariaDescribedBy={ariaDescribedBy}
+      contentClassName={contentClassName}
     >
       <div
         className={
           variant === 'sheet'
             ? contentClassName ?? 'flex h-full flex-col overflow-y-auto'
*** End Patch
PATCH
```

### 2. Migrate `EmployeeListContainer` overlays to the shared wrapper
Swap imports, drop focus-trap refs, and replace each bespoke overlay surface with `<Overlay>` + stable test ids.
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
-import EmployeeEditDrawer from './EmployeeEditDrawer';
+import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
+import EmployeeEditDrawer from './EmployeeEditDrawer';
+import { Overlay } from './common/Overlay';
@@
-import { createTaskEntry } from '../utils/task';
-import useFocusTrap from '../hooks/useFocusTrap';
+import { createTaskEntry } from '../utils/task';
*** End Patch
PATCH
```
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-  const bulkEditContainerRef = useRef<HTMLDivElement | null>(null);
-  const columnSettingsRef = useRef<HTMLDivElement | null>(null);
-  const tagManagerRef = useRef<HTMLDivElement | null>(null);
-  const importModalRef = useRef<HTMLDivElement | null>(null);
-  const exportModalRef = useRef<HTMLDivElement | null>(null);
   const filterToggleRef = useRef<HTMLButtonElement | null>(null);
*** End Patch
PATCH
```
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-  useFocusTrap(bulkEditContainerRef, {
-    enabled: isBulkEditOpen,
-    onEscape: handleBulkEditClose,
-  });
-
-  useFocusTrap(columnSettingsRef, {
-    enabled: showColumnSettings,
-    onEscape: closeColumnSettings,
-  });
-
-  useFocusTrap(tagManagerRef, {
-    enabled: showTagManager,
-    onEscape: closeTagManager,
-  });
-
-  useFocusTrap(importModalRef, {
-    enabled: showImportModal,
-    onEscape: closeImportModal,
-  });
-
-  useFocusTrap(exportModalRef, {
-    enabled: showExportModal,
-    onEscape: closeExportModal,
-  });
-
*** End Patch
PATCH
```
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeListContainer.tsx
@@
-      {isBulkEditOpen && (
-        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={handleBulkEditClose}>
-          <div
-            ref={bulkEditContainerRef}
-            tabIndex={-1}
-            role="dialog"
-            aria-modal="true"
-            aria-labelledby="bulk-edit-heading"
-            className="ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
-            onClick={(event) => event.stopPropagation()}
-          >
-            <form className="flex flex-col h-full" onSubmit={handleBulkEditSubmit}>
+      <Overlay
+        open={isBulkEditOpen}
+        onOpenChange={(next) => {
+          if (!next) {
+            handleBulkEditClose();
+          }
+        }}
+        variant="sheet"
+        title="Редактирование данных сотрудников"
+        description={`Выбрано: ${selectedEmployees.size} ${selectedEmployees.size === 1 ? 'сотрудник' : 'сотрудников'}.`}
+        testId="bulk-edit-overlay"
+        overlayClassName="z-40 flex"
+        contentClassName="ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
+        showCloseButton={false}
+      >
+        <form className="flex flex-col h-full" onSubmit={handleBulkEditSubmit}>
               <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                 <div>
-                  <h3 id="bulk-edit-heading" className="text-lg font-semibold text-gray-900">Редактирование данных сотрудников</h3>
+                  <h3 className="text-lg font-semibold text-gray-900">Редактирование данных сотрудников</h3>
                   <p className="text-sm text-gray-500">
                     Выбрано: {selectedEmployees.size}{' '}
                     {selectedEmployees.size === 1 ? 'сотрудник' : 'сотрудников'}.
                   </p>
                 </div>
@@
               <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                 <button
                   type="button"
                   onClick={handleBulkEditClose}
                   className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                 >
                   Отмена
                 </button>
                 <button
                   type="submit"
                   className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                 >
                   Применить изменения
                 </button>
               </div>
-            </form>
-          </div>
-        </div>
-      )}
+        </form>
+      </Overlay>
@@
-      {showColumnSettings && (
-        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={closeColumnSettings}>
-          <div
-            ref={columnSettingsRef}
-            tabIndex={-1}
-            role="dialog"
-            aria-modal="true"
-            aria-labelledby="column-settings-heading"
-            className="ml-auto h-full w-full max-w-sm bg-white shadow-xl flex flex-col"
-            onClick={(event) => event.stopPropagation()}
-          >
-            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
+      <Overlay
+        open={showColumnSettings}
+        onOpenChange={(next) => {
+          if (!next) {
+            closeColumnSettings();
+          }
+        }}
+        variant="sheet"
+        title="Настройка отображения"
+        description="Выберите поля для отображения в таблице сотрудников."
+        testId="column-settings-overlay"
+        overlayClassName="z-40 flex"
+        contentClassName="ml-auto h-full w-full max-w-sm bg-white shadow-xl flex flex-col"
+        showCloseButton={false}
+      >
+        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
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
+                <h3 className="text-base font-semibold text-gray-900">Настройка отображения</h3>
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
+        <div className="px-5 py-3 border-b border-gray-100">
               <p className="text-sm text-gray-500">Выберите поля для отображения в таблице сотрудников.</p>
             </div>
-            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
+        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
               {COLUMN_ORDER.map((column) => (
                 <label key={column.key} className="flex items-center gap-3 text-sm text-gray-700">
                   <input
                     type="checkbox"
                     className="rounded text-blue-600 focus:ring-blue-500"
@@
               <button
                 type="button"
                 onClick={closeColumnSettings}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
               >
                 Сохранить изменения
               </button>
             </div>
-          </div>
-        </div>
-      )}
+      </Overlay>
@@
-      {showTagManager && (
-        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={closeTagManager}>
-          <div
-            ref={tagManagerRef}
-            tabIndex={-1}
-            role="dialog"
-            aria-modal="true"
-            aria-labelledby="tag-manager-heading"
-            className="bg-white rounded-xl max-w-lg w-full shadow-xl"
-            onClick={(event) => event.stopPropagation()}
-          >
-            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
+      <Overlay
+        open={showTagManager}
+        onOpenChange={(next) => {
+          if (!next) {
+            closeTagManager();
+          }
+        }}
+        title="Управление тегами"
+        description="См. Appendix 6 — Tag Import Template"
+        testId="tag-manager-overlay"
+        overlayClassName="z-40 flex items-center justify-center"
+        contentClassName="bg-white rounded-xl max-w-lg w-full shadow-xl"
+        showCloseButton={false}
+      >
+        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
               <div>
-                <h3 id="tag-manager-heading" className="text-lg font-semibold text-gray-900">Управление тегами</h3>
+                <h3 className="text-lg font-semibold text-gray-900">Управление тегами</h3>
                 <p className="text-sm text-gray-500">См. Appendix 6 — Tag Import Template</p>
               </div>
               <button
                 type="button"
                 onClick={closeTagManager}
@@
               <button
                 type="button"
                 onClick={handleApplyTags}
                 disabled={selectedEmployees.size === 0}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                   selectedEmployees.size === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
@@
               </button>
             </div>
-          </div>
-        </div>
-      )}
+      </Overlay>
@@
-      {showImportModal && (
-        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={closeImportModal}>
-          <div
-            ref={importModalRef}
-            tabIndex={-1}
-            role="dialog"
-            aria-modal="true"
-            aria-labelledby="import-modal-heading"
-            className="bg-white rounded-xl max-w-xl w-full shadow-xl"
-            onClick={(event) => event.stopPropagation()}
-          >
-            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
+      <Overlay
+        open={showImportModal}
+        onOpenChange={(next) => {
+          if (!next) {
+            closeImportModal();
+          }
+        }}
+        title="Импорт сотрудников"
+        description="Шаблоны: Appendix 1/3/4/8"
+        testId="import-modal"
+        overlayClassName="z-40 flex items-center justify-center"
+        contentClassName="bg-white rounded-xl max-w-xl w-full shadow-xl"
+        showCloseButton={false}
+      >
+        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
               <div>
-                <h3 id="import-modal-heading" className="text-lg font-semibold text-gray-900">Импорт сотрудников</h3>
+                <h3 className="text-lg font-semibold text-gray-900">Импорт сотрудников</h3>
                 <p className="text-sm text-gray-500">Шаблоны: Appendix 1/3/4/8</p>
               </div>
               <button
                 type="button"
                 onClick={closeImportModal}
@@
               {importFeedback && <p className="text-sm text-blue-700">{importFeedback}</p>}
             </div>
-          </div>
-        </div>
-      )}
+      </Overlay>
@@
-      {showExportModal && (
-        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={closeExportModal}>
-          <div
-            ref={exportModalRef}
-            tabIndex={-1}
-            role="dialog"
-            aria-modal="true"
-            aria-labelledby="export-modal-heading"
-            className="bg-white rounded-xl max-w-xl w-full shadow-xl"
-            onClick={(event) => event.stopPropagation()}
-          >
-            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
+      <Overlay
+        open={showExportModal}
+        onOpenChange={(next) => {
+          if (!next) {
+            closeExportModal();
+          }
+        }}
+        title="Экспорт списка сотрудников"
+        description="Учёт активных колонок и фильтров"
+        testId="export-modal"
+        overlayClassName="z-40 flex items-center justify-center"
+        contentClassName="bg-white rounded-xl max-w-xl w-full shadow-xl"
+        showCloseButton={false}
+      >
+        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
               <div>
-                <h3 id="export-modal-heading" className="text-lg font-semibold text-gray-900">Экспорт списка сотрудников</h3>
+                <h3 className="text-lg font-semibold text-gray-900">Экспорт списка сотрудников</h3>
                 <p className="text-sm text-gray-500">Учёт активных колонок и фильтров</p>
               </div>
               <button
                 type="button"
                 onClick={closeExportModal}
@@
               {exportFeedback && <p className="text-sm text-blue-700">{exportFeedback}</p>}
             </div>
-          </div>
-        </div>
-      )}
+      </Overlay>
*** End Patch
PATCH
```

### 3. Move `QuickAddEmployee` onto `<Overlay>`
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/QuickAddEmployee.tsx
@@
-import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
+import React, { useEffect, useId, useMemo, useState } from 'react';
 import { Employee, Team } from '../types/employee';
-import useFocusTrap from '../hooks/useFocusTrap';
+import { Overlay } from './common/Overlay';
 import { createTaskEntry } from '../utils/task';
@@
-  const containerRef = useRef<HTMLDivElement | null>(null);
   const headingId = useId();
   const descriptionId = useId();
@@
-  useFocusTrap(containerRef, {
-    enabled: isOpen,
-    onEscape: () => onClose({ restoreFocus: true }),
-  });
-
   const defaultTeam = useMemo(() => teams[0] ?? FALLBACK_TEAM, [teams]);
@@
-  return (
-    <div
-      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
-      role="dialog"
-      aria-modal="true"
-      aria-labelledby={headingId}
-      aria-describedby={descriptionId}
-    >
-      <div
-        ref={containerRef}
-        tabIndex={-1}
-        className="bg-white rounded-xl max-w-md w-full shadow-2xl"
-      >
-        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
+  return (
+    <Overlay
+      open={isOpen}
+      onOpenChange={(next) => {
+        if (!next) {
+          onClose({ restoreFocus: true });
+        }
+      }}
+      title="Быстрое добавление сотрудника"
+      description="Создавайте черновик карточки: только логин и пароль — как в WFM."
+      testId="quick-add-modal"
+      overlayClassName="z-50 flex items-center justify-center p-4"
+      contentClassName="bg-white rounded-xl max-w-md w-full shadow-2xl"
+      showCloseButton={false}
+    >
+      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
           <div>
             <h2 id={headingId} className="text-lg font-semibold text-gray-900">
               Быстрое добавление сотрудника
             </h2>
             <p id={descriptionId} className="text-sm text-gray-500">
               Создавайте черновик карточки: только логин и пароль — как в WFM.
             </p>
           </div>
           <button
             type="button"
             onClick={() => onClose({ restoreFocus: true })}
             className="text-gray-400 hover:text-gray-600"
             aria-label="Закрыть быстрое добавление"
             disabled={isSubmitting}
           >
             ✕
           </button>
         </div>
 
         <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
@@
           </div>
         </form>
-      </div>
-    </div>
+    </Overlay>
   );
 };
*** End Patch
PATCH
```

### 4. Replace `EmployeeEditDrawer` overlay implementation
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: src/components/EmployeeEditDrawer.tsx
@@
-import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
+import React, { useCallback, useEffect, useMemo, useState } from 'react';
 import { Employee, EmployeeStatus, EmployeeTask } from '../types/employee';
 import { createTaskEntry } from '../utils/task';
-import useFocusTrap from '../hooks/useFocusTrap';
+import { Overlay } from './common/Overlay';
@@
-  const handleOverlayClick = () => {
-    onClose();
-  };
-
-  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
-    event.stopPropagation();
-  };
-
@@
-  const drawerRef = useRef<HTMLDivElement | null>(null);
-
-  useFocusTrap(drawerRef, {
-    enabled: isOpen,
-    onEscape: () => {
-      if (!isLoading) {
-        onClose();
-      }
-    },
-  });
-
   const validationSnapshot = useMemo(
     () => (formState ? computeValidationErrors(formState) : {}),
     [computeValidationErrors, formState]
   );
@@
-  return (
-    <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={handleOverlayClick}>
-      <div
-        ref={drawerRef}
-        tabIndex={-1}
-        role="dialog"
-        aria-modal="true"
-        aria-labelledby="employee-drawer-heading"
-        className="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
-        onClick={handleContentClick}
-      >
-        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
+  return (
+    <Overlay
+      open={isOpen}
+      onOpenChange={(next) => {
+        if (!next && !isLoading && !isSaving) {
+          onClose();
+        }
+      }}
+      variant="sheet"
+      title={headerName}
+      description={isCreateMode ? 'Создание нового сотрудника' : 'Редактирование данных сотрудника'}
+      testId="employee-edit-drawer"
+      preventClose={isLoading || isSaving}
+      overlayClassName="z-40 flex"
+      contentClassName="relative ml-auto h-full w-full max-w-2xl bg-white shadow-xl flex flex-col"
+      showCloseButton={false}
+    >
+      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
           <div className="space-y-1">
             <p className="text-xs uppercase text-gray-500">
               {isCreateMode ? 'Создание нового сотрудника' : 'Редактирование данных сотрудника'}
             </p>
-            <h2 id="employee-drawer-heading" className="text-lg font-semibold text-gray-900">{headerName}</h2>
+            <h2 className="text-lg font-semibold text-gray-900">{headerName}</h2>
             <p className="text-sm text-gray-500">Логин WFM: {headerLogin}</p>
           </div>
           <div className="flex items-center gap-2">
             {!isCreateMode && employee.status !== 'terminated' && (
               <button
@@
           </div>
         </div>
         {showCreateIntro ? (
           <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
@@
         )}
 
         {isLoading && (
           <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm flex items-center justify-center">
             <div className="w-10 h-10 border-4 border-blue-200 border-t-transparent rounded-full animate-spin" />
           </div>
         )}
-      </div>
-    </div>
+    </Overlay>
   );
 };
*** End Patch
PATCH
```

### 5. Remove the legacy focus-trap hook
```bash
rm src/hooks/useFocusTrap.ts
```

### 6. Update Playwright selectors to rely on `data-testid`
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: tests/employee-list.spec.ts
@@
 const openImportModal = async (page: Page, context: string) => {
   await page.locator('[title="Импортировать"]').first().click();
   const optionButtons = page.locator(`button:has-text("${context}")`);
   const count = await optionButtons.count();
   const index = count > 1 ? 1 : 0;
   await optionButtons.nth(index).click();
-  await expect(page.getByRole('heading', { name: /Импорт/ })).toBeVisible();
+  await expect(page.getByTestId('import-modal')).toBeVisible();
 };
 
 const openExportModal = async (page: Page, context: string) => {
   await page.locator('[title="Экспортировать"]').first().click();
   const optionButtons = page.locator(`button:has-text("${context}")`);
   const count = await optionButtons.count();
   const index = count > 1 ? 1 : 0;
   await optionButtons.nth(index).click();
-  await expect(page.getByRole('heading', { name: /Экспорт/ })).toBeVisible();
+  await expect(page.getByTestId('export-modal')).toBeVisible();
 };
@@
-    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
+    await expect(page.getByTestId('employee-edit-drawer')).toBeVisible();
@@
-    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
+    await expect(page.getByTestId('employee-edit-drawer')).toBeVisible();
@@
-    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
+    await expect(page.getByTestId('employee-edit-drawer')).not.toBeVisible();
@@
-    await expect(page.getByText(DRAWER_TEXT)).not.toBeVisible();
+    await expect(page.getByTestId('employee-edit-drawer')).not.toBeVisible();
@@
-    await expect(page.getByRole('dialog', { name: /Быстрое добавление сотрудника/i })).toBeVisible();
-    await expect(page.getByRole('dialog', { name: /Быстрое добавление сотрудника/i })).not.toBeVisible();
+    await expect(page.getByTestId('quick-add-modal')).toBeVisible();
+    await expect(page.getByTestId('quick-add-modal')).not.toBeVisible();
@@
-    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
+    await expect(page.getByTestId('employee-edit-drawer')).toBeVisible();
@@
-    await expect(page.getByText(DRAWER_TEXT)).toBeVisible();
+    await expect(page.getByTestId('employee-edit-drawer')).toBeVisible();
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

### 7. Refresh handoff documentation (no more focus-trap hook)
```bash
apply_patch <<'PATCH'
*** Begin Patch
*** Update File: docs/SESSION_HANDOFF.md
@@
-- `src/hooks/useFocusTrap.ts`: Shared trap utility used across all overlays (bulk edit, tag manager, column settings, quick add, edit drawer).
+- Shared overlays now standardised via `src/components/common/Overlay.tsx` + `@wrappers/ui/Dialog`; Radix handles focus/escape for bulk edit, tag manager, column settings, quick add, and the edit drawer.
*** End Patch
PATCH
```

## Tests & Verification
```bash
set -euo pipefail
npm run build
npm run test -- --project=chromium --workers=1 --grep "Employee list"
```

## Acceptance Checklist
- [ ] All overlay surfaces (bulk edit, column settings, tag manager, import, export, quick add, edit drawer) render via `<Overlay>` with stable `data-testid`s.
- [ ] `npm run build` and the targeted Playwright suite pass without console errors.
- [ ] `src/hooks/useFocusTrap.ts` is gone and no imports reference it.
- [ ] Focus returns to the invoking control after closing each overlay; Esc and overlay clicks honour `preventClose` states.
- [ ] Docs (`docs/SESSION_HANDOFF.md`) describe the new overlay stack.

## Rollback
```bash
set -euo pipefail
git reset --hard HEAD
rm -f plans/2025-10-10_overlay-migration.plan.md
```
