# Parity Backlog & Implementation Plan

Manual references: CH3 Employees, CH5 Schedule (Advanced, Shifts, Build), screenshots `image5.png`, `image8.png`, `image13.png`, `image171.png`, `image180.png`.

## Phase 1 – Bulk Edit Enhancements (Severity A/B)
1. **Matrix actions (Add/Replace/Delete)**
   - Update `src/components/EmployeeListContainer.tsx`, `src/types/employee.ts`, `tests/employee-list.spec.ts`.
   - Match manual `рис.23.11–23.13`: provide controls per field for “Добавить всем / Заменить всем / Удалить всем”.
   - Handle fields: статус, команда, схемы, навыки, резервные навыки, теги, норма часов.
   - Extend Playwright coverage with one scenario per action type.

2. **Tag manager parity**
   - Ensure modal mirrors manual (common tags, colour chips, removal badges, 4-tag limit).
   - Support add/replace/remove semantics synced with bulk edit selections.

3. **Task timeline integration**
   - Record bulk-edit comments as dated timeline entries in employee drawer.
   - Display historical tasks with newest first, allow copy-to-clipboard for agents.

## Phase 2 – Interaction & Accessibility Parity (Severity A/B)
4. **Row & selection semantics**
   - Remove checkbox-as-primary interaction; adopt WFM pattern (row click opens drawer, multi-select via dedicated toolbar action or modifier click only).
   - Ensure closing the drawer returns focus to the exact triggering row control.
   - Cover in Playwright (row click, Ctrl/Cmd click, keyboard Enter/Space).
   - **Files:** `src/components/EmployeeListContainer.tsx` (selection logic around lines 160–520, 1960–2140), `tests/employee-list.spec.ts:13-52`.

5. **CRUD completeness (Dismiss/Restore)**
   - Add toolbar/actions for dismissing and restoring employees (status transition, undo path, toast).
   - Reflect dismiss state in list, filters, counters, and timeline.
   - Include tests for dismiss → restore → verify visibility toggles.
   - **Files:** `src/components/EmployeeEditDrawer.tsx:110-220`, `src/components/EmployeeListContainer.tsx:780-940`, `tests/employee-list.spec.ts:41-62`.

6. **Bulk edit parity sweep**
   - Implement matrix sections for work scheme history entries, primary/reserve skills, tags, hours norm with add/replace/remove semantics matching manual.
   - Persist bulk-edit comments into task timeline with source badges.
   - Extend Playwright to cover add/remove for tags, skills, reserve skills, scheme remove.
   - **Files:** `src/components/EmployeeListContainer.tsx:940-1380`, `src/components/EmployeeEditDrawer.tsx:320-520`, `tests/employee-list.spec.ts:169-240`.
   - ✅ (07 Oct 2025) Tag matrix enforcing ≤4 тегов, Playwright сценарии закрывают add/remove/replace для skills/reserve, таймлайн фиксирует массовые комментарии.

7. **Tag manager as global catalogue**
   - Allow managing the tag library without a selection (create, edit colour, delete) while keeping apply actions disabled until rows selected.
   - Surface limit warnings (4 tags) and ARIA messaging; ensure import/export references align with Appendix 6.
   - **Files:** `src/components/EmployeeListContainer.tsx:1340-1860`, future Playwright coverage.
   - ✅ (07 Oct 2025) Catalogue remains editable without selection; apply button gates correctly, limit warnings surface via alert.

8. **Import / Export categories**
   - CSV/Отпуска/Теги экспортируют данные из отфильтрованного/выбранного списка (шаблоны Appendix 6/8). Доработать, когда появятся реальные отпускные периоды.
   - Расширить валидацию: помимо расширений проверить обязательные колонки и пустые файлы; добавить позитивный сценарий (валидный CSV) в автотесты.
   - **Files:** `src/components/EmployeeListContainer.tsx:1400-1680`, `tests/employee-list.spec.ts:291-452`.
   - ✅ (07 Oct 2025) Extension + пустой файл + full header check для “Сотрудника” (Appendix 1), “Навыки” (Appendix 3), “Смены предпочтений” (Appendix 4), “Схемы” (Appendix 8), “Теги”, “Отпуска”; Playwright покрывает позитив/негатив.

9. **Accessibility & ARIA**
   - Готово: фокусы/`Esc` для фильтров и всех модальных поверхностей, live-region для выборов/увольнений/экспортов.
   - ✅ (07 Oct 2025) VoiceOver проход: модальные окна получают `aria-labelledby`/`aria-describedby`, импорт/экспорт и теговый менеджер отдают статусы через `role="status"`/`role="alert"`; лог записан в `docs/SESSION_HANDOFF.md` и Phase 4 doc.
   - **Files:** `src/components/EmployeeListContainer.tsx:200-360`, `src/components/EmployeeEditDrawer.tsx:40-360`, `src/components/QuickAddEmployee.tsx:40-220`, `docs/SESSION_HANDOFF.md`.

10. **Edge-case regression tests**
    - Добавлены сценарии на увольнение/восстановление, экспорт тегов и ошибку загрузки. Следующее: лимит тегов, ошибки bulk edit, пустые состояния, проверка localStorage.
    - **Files:** `tests/employee-list.spec.ts:13-140`, `src/components/EmployeeListContainer.tsx:320-380`.
    - ✅ (07 Oct 2025) Added tag-limit regression and import header positive/negative checks.

## Phase 3 – Documentation & Observability (Severity C)
11. **Docs refresh after features**
    - Update parity plan, SOPs, UI walkthrough, screenshot index. Capture new screenshots for dismiss/restore, tag manager, bulk edit matrix.

12. **Session SOP enforcement**
   - Ensure README/AGENTS highlight new doc paths (docs/SOP, docs/System, docs/Tasks).
   - Add reminders to clean `test-results/` and run smoke steps after each slice.

## Future Backlog (Post-Phase 4)
13. **NVDA accessibility sweep**
    - **Severity:** B (compliance follow-up)
    - **Files:** `docs/SESSION_HANDOFF.md`, `docs/SOP/ui-walkthrough-checklist.md` (log findings), `src/components/*` if fixes required.
    - **Notes:** VoiceOver pass is complete on macOS; schedule NVDA on Windows hardware to confirm parity and update docs with results.

14. **Phase 5 – Stabilization & Validation**
    - Tracker: `docs/Tasks/phase-5-stabilization-and-validation-prd.md`.
    - ✅ (07 Oct 2025) Edit persistence with toast/error handling, validation gating (email/phone/hour norm), tag catalogue persistence, context-aware import/export headings + file prefixes, bulk-edit summary/count, Playwright coverage updated.
    - ⏳ NVDA sweep (Windows hardware) and screenshot backfill remain; log results in handoff/PRD once executed.
    - Pull references from `~/Desktop/ff.markdown`, parity report, and the updated walkthrough.

15. **Phase 6 – Migration Planning**
    - Tracker: `docs/Tasks/phase-6-migration-planning-prd.md`.
    - Focus areas: formalise wrapper APIs (Radix dialog/popover, TanStack table, RHF+Zod forms), stage-by-stage migration roadmap, validation/rollback guardrails.
    - Prep references: `migration-prep/README.md`, `MANIFEST.md`, wrapper prototypes under `migration-prep/wrappers-draft/`, playground demos, `migration-prep/ACCESSIBILITY_CHECKLIST.md`.
    - Kick off once Phase 5 ships; migration plan should lock validation cadence (Playwright + NVDA) and document bundle/performance checkpoints.

## Completed (06 Oct 2025)
- Seeded realistic employee dataset with extended fields.
- Converted quick add to minimal login/password plus auto drawer.
- Rebuilt toolbar with icon+label buttons.
- Added bulk edit flow for status/team/comment with Playwright coverage.
- Implemented dismiss/restore workflow with timeline badges, aria-live notices, and automated test coverage.
- Expanded edit drawer with scheme preferences, tasks, personnel number, actual address.
- Added agent documentation structure (SOP/System/Tasks) and UI walkthrough.
