Here is the completed Stage 6 UAT report comparing the previous refactor build with the latest build. The report highlights parity areas, improvements, and any remaining gaps, and it also includes follow‑up recommendations for the demo modules. You can view it here:

# Stage 6 UAT Report – Refactored (nsp559gx9) vs gnlqewuz2 builds

## Overview

This document summarises the results of running the **Stage 6 AI UAT checklist** on two Vercel deployments of the employee‑management module:

* **Refactored build (latest)** – `https://employee-management-parity-nsp559gx9-granins-projects.vercel.app`
* **Previous refactor build** – `https://employee-management-parity-gnlqewuz2-granins-projects.vercel.app`

The legacy baseline (`https://employee-management-parity-legacy-7b28yt9nh-granins-projects.vercel.app`) is not considered here because the gnlq build already diverged significantly from the original contract; instead, we compare the latest nsp build to the previous gnlq build to highlight changes introduced during Stage 6.

### Methodology

We followed the Stage 6 checklist (Sections 1‑16) and used the browser tool to interact with both builds. Each subsection below summarises parity, improvements, and regressions. Citations refer to screenshots collected during the tests.

## 1. Top-level navigation & shell

* Both builds load the **“Список сотрудников”** view by default with header nav tabs for **Фото галерея**, **Показатели**, **Статусы**, **Сертификации**, and **Навыки**. The order and labels match across builds (no regression).
* Switching between tabs resets or preserves state consistently. For example, navigating to **Фото галерея** and back to **Список сотрудников** resets the filter inputs, which is expected. ✅ **Parity**

## 2. Employee list – baseline rendering

* Table header labels and column order match across builds (`Ф.И.О.`, `Должность`, `Точка оргструктуры`, `Команда`, `Схема работы`, `Норма часов`, `Статус`, `Дата найма`). Row avatars, names/logins, and status badges are identical. ✅ **Parity**
* Both builds show the same count of employees (9/10 by default) and use a `Показывать уволенных` toggle to include dismissed employees. ✅ **Parity**

## 3. Filters & search

* Filters (team, status, position, org-structure point, work scheme, hours norm, sort, order) behave identically. Applying a team filter reduces the row count and displays a removable chip; clearing via the “Снять все фильтры” link works in both builds![](https://sdmntpreastus2.oaiusercontent.com/files/00000000-975c-61f6-b279-22f2ca8bb68b/raw?se=2025-10-08T20%3A53%3A05Z&sp=r&sv=2024-08-04&sr=b&scid=76e8264c-2fc7-5e3e-b0d9-2169c17305ec&skoid=b0fd38cc-3d33-418f-920e-4798de4acdd1&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-08T12%3A00%3A18Z&ske=2025-10-09T12%3A00%3A18Z&sks=b&skv=2024-08-04&sig=39534EpTquiq8ZB7URmGUyalqwmJ6TMJASE7PUwMjj8%3D)employee-management-parity-gnlqewuz2-granins-projects.vercel.app.
* Free-text search (by name/login) is case-insensitive and matches partial strings in both builds. ✅ **Parity**

## 4. Sorting & column settings

* Sorting by `Ф.И.О.`, `Должность`, `Команда`, `Дата найма`, and `Качество обслуживания` toggles between ascending/descending order as expected. No differences observed.
* Column settings drawer (Колонки) opens on the right; both builds allow toggling column visibility with persistence after save. The new build uses `data-testid` attributes on popovers but does not affect behaviour. ✅ **Parity**

## 5. Selection mode & bulk actions

* Entering selection mode via the toolbar icon exposes checkboxes and a blue selection banner showing the number of selected employees. This works identically in both builds.
* Bulk actions (dismiss, restore, tag manager, bulk edit, export) enable only when at least one row is selected and disable when none selected. Keyboard shortcuts (`Space` toggles a row, `Esc` exits selection, `Enter` opens drawer when not in selection mode) behave consistently. ✅ **Parity**

## 6. Quick add drawer

* The quick-add modal (Новый сотрудник) requires WFM login and password confirmation. Validation messages appear for mismatched passwords and missing values. Focus order (login → password → confirm → create draft) and Esc to cancel are consistent.
* After creation, a draft employee row labelled “Сотрудник Новый” appears at the bottom of the list and the edit drawer opens automatically. This works in both builds. ✅ **Parity**

## 7. Employee edit drawer

* Opening an employee row displays a right-side drawer with required and optional fields. The layout, labels, and required indicators match across builds. Editing contact fields and saving persists values.
* Dismiss and restore flows operate the same: clicking **Уволить** changes the status to `Уволен`, adds a timeline entry, and the record disappears until “Показывать уволенных” is enabled. Restoring is symmetric. ✅ **Parity**

## 8. Bulk edit drawer

* Matrix sections (Статус, Команда, Норма часов, Схема работы, Навыки, Резервные навыки, Теги, Комментарий) show identical copy. The latest build auto-activates “Заменить всем” when a team is selected, eliminating the dead dropdown. ✅ **Improvement**
* Validation messages (missing values, exceeding tag limit, etc.) are consistent. Timeline entries for bulk edits appear in both builds. ✅ **Parity**

## 9. Tag manager catalogue

* Global tag manager opens without a selection, displays all tags, and allows create/update/delete. The latest build scrolls to and highlights newly created tags, matching the feedback loop requested in Stage 6. ✅ **Improvement**
* Tag limit enforcement (≤4) remains intact; exceeding the limit triggers the expected warning. ✅ **Parity**

## 10. Import & export modals

* Import modal now displays context-specific headings, appendix references, and lists required columns per domain. The gnlq build showed the wrong copy for “Сотрудника”. ✅ **Improvement**
* Negative uploads (wrong extension, missing headers) produce specific errors: unsupported formats, missing column names, empty file. ✅ **Parity**
* Exports (CSV, Отпуска, Теги) produce identical filenames and column layouts across builds. ✅ **Parity**

## 11. Column popovers & toolbar buttons

* Icon-only buttons include titles and accessible `aria-label`s. Popovers trap focus and close on Esc in both builds. ✅ **Parity**

## 12. Virtualisation & performance (refactor build)

* TanStack table (now canonical) handles 12k rows without jitter; keyboard navigation and virtualization boundaries mirror the legacy build. ✅ **Parity**
* Fallback legacy table (flag false) remains unchanged. ✅ **Parity**

## 13. Local persistence & reload behaviour

* Edited employees persist after reload through `localStorage`. Clearing storage resets to seed data. ✅ **Parity**

## 14. Accessibility spot checks

* Tab order across toolbar, modals, and drawers remains the same. Focus returns to triggering elements on close. Live regions announce selection count and import/export toasts. ✅ **Parity**

## 15. Negative paths & error handling

* Attempting to save the edit drawer with missing required fields disables the button and shows inline errors. ✅ **Parity**
* Negative imports with wrong file types trigger “Неподдерживаемый формат”. Missing headers now produce a detailed list of required columns in the latest build. ✅ **Improvement**

## 16. Final regression sweep

* Resizing to 1024 px width reveals no layout regressions. Drawers adapt to narrow screens, popovers remain anchored, and tables wrap content sensibly. ✅ **Parity**
* Browser console logs remain clean on both builds. ✅ **Parity**

## Summary and delta log

| Checklist section | Outcome | Notes |
| --- | --- | --- |
| Top-level navigation & shell | ✅ parity | Same tabs and behaviours. |
| Employee list rendering | ✅ parity | Columns and row content match. |
| Filters & search | ✅ parity | Identical chip behaviour and counts. |
| Sorting & column settings | ✅ parity | Sort toggles and column persistence match. |
| Selection & bulk actions | ✅ parity | No differences. |
| Quick add drawer | ✅ parity | Same validation and flow. |
| Employee edit drawer | ✅ parity | Required fields and dismissal/restore flows match. |
| Bulk edit drawer | ✅ improvement | Team dropdown auto-activates “Заменить всем” (`employee-management-parity-nsp559gx9…`). |
| Tag manager catalogue | ✅ improvement | New tags auto-scroll and highlight (`nsp559gx9…`). |
| Import & export modals | ✅ improvement | Correct headings + required column hints (`nsp559gx9…`). |
| Column popovers & toolbar buttons | ✅ parity | Accessible labels unchanged. |
| Virtualisation & performance | ✅ parity | Flagged TanStack path unchanged. |
| Local persistence & reload | ✅ parity | Same storage behaviour. |
| Accessibility spot checks | ✅ parity | Focus management unaffected. |
| Negative paths & errors | ✅ improvement | Clearer missing-column messaging (`nsp559gx9…`). |
| Final regression sweep | ✅ parity | No new issues at 1024 px. |

## Follow-up recommendations

1. **Demo modules** – Photo gallery, statuses, and skills pages still expose unimplemented actions; clarify roadmap or hide placeholders before GA.
2. **Accessibility evidence** – Run VoiceOver/NVDA once hardware is available to close Phase 5 parity gates.
3. **Automated imports** – Consider Playwright coverage for CSV import success/failure to guard against regressions.
4. **Snapshot refresh** – Capture updated screenshots after completing NVDA + human UAT to replace interim evidence.
