# UI Walkthrough Checklist

Use this script to validate the parity demo in a browser session or with Playwright. Manual references: CH3 Employees (`/Users/m/Documents/.../CH3_Employees.md`), CH5 Schedule chapters, screenshots noted in `docs/SCREENSHOT_INDEX.md`.

## 0. Prep
- Open latest Vercel deployment or run `npm run preview -- --host 127.0.0.1 --port 4174`.
- Log in with `user20082025` / `user20082025` if prompted.
- Set viewport ≥ 1440×900 to match reference screenshots.

## 1. Toolbar & Global Controls (`image171.png`)
- Verify button order/labels (Filters → Массовое редактирование → Теги → Импорт → Экспорт → Колонки → Новый сотрудник) and confirm each button is reachable via `Tab` with visible focus.
- Toggle filters, confirm counter (`9/10`) and “Снять все фильтры” enable/disable rules. `Esc` should close the filter panel and return focus to the toolbar button.
- Trigger the `Новый сотрудник` button; ensure the quick-add modal opens and closing via `Esc` works.

## 2. Row Interactions & Drawer (`image180.png`)
- Click a row body: selection must remain unchanged and the edit drawer should slide in showing the employee whose row was clicked.
- Use `Ctrl/Cmd + Click` on the same row: row selection toggles without opening the drawer.
- With focus on a row, press `Enter` to open the drawer, and `Space` to toggle selection.
- Confirm the drawer traps focus, supports `Esc` to close, and returns focus to the triggering row.
- Inside the drawer use “Уволить” to dismiss an employee, toggle “Показывать уволенных” to confirm they disappear, and use “Восстановить” to revert. Timeline must show system-generated entries for both actions.
- Clear the email field to confirm the “Сохранить изменения” button disables, restore valid email/phone/hour norm, save to observe the toast, and reopen the drawer after reload to ensure changes persist.

## 3. Quick Add Flow
- Open quick add (“Новый сотрудник”), leave login empty and submit → validation messages should appear.
- Fill login/password, submit. The create drawer must open pre-populated with mock defaults and the new employee should appear at the top of the list after save.
- Confirm the quick-add modal respects keyboard focus order and closes on `Esc` only when not submitting.
- Trigger `Отмена` and ensure focus returns to the toolbar button.

## 4. Edit Drawer Content
- Required block: edit `Фамилия`, `Логин WFM`, `Норма часов`; invalid values should surface inline errors on save.
- Additional block: verify tags list, scheme/shift preference inputs, personnel number, actual address, and the tasks timeline. Bulk-edit comments should appear with “Массовое редактирование” badges; manual notes added in the textarea append with timestamp and “Вручную”.
- Save changes and confirm the table updates instantly.

## 5. Bulk Edit Matrix (`image5.png`)
- Select two rows, open the массовое редактирование drawer. Walk through each matrix section:
  - Status/Team/Норма часов (replace only) require action toggles before enabling inputs.
- Work scheme, skills, reserve skills, tags support add/replace/remove. Adding should dedupe/limit (tags max 4 and reject submissions that would exceed the cap).
  - Comment field adds timeline entries (check in drawer afterward).
- Submit and validate: success toast, rows updated, tasks timeline shows comment with bulk-edit source.
- Retry with no actions/comment: error message should block submission.
- Review the “Выбранные сотрудники” panel (count matches selection) and the “Предстоящие изменения” summary before applying changes.

## 6. Tag Manager (`image69fb8e9b.png`)
- Open “Теги” with no selection: catalogue is still editable; creating a tag requires unique name and displays chosen colour.
- Select two employees and reopen: choose “Добавить всем”, mark up to four tags, apply, confirm chips and column values update; attempts to exceed four must show an inline alert.
- Switch to “Удалить у всех” and remove an existing tag from the selection; catalogue edits remain available without any selection.
- Delete a tag definition and ensure it is removed from all employees instantly.
- Confirm `Esc` closes the modal and focus is trapped while open.
- Close the modal, reopen (or reload then reopen) to ensure newly created catalogue entries persist outside the current selection.

## 7. Import / Export (`image13.png`)
- Open импорт → verify instructions reference Appendix templates (1/3/4/8).
- Upload negative cases for each context:
  - “Сотрудника”: header missing (e.g. omit `hiringDate`).
  - “Навыки”: header missing (omit `priority`).
  - “Схемы”: header missing (omit `id`).
  - “Теги”/“Отпуска”: reuse regression CSV (`login,ФИО` etc.).
- Upload valid CSVs for the same contexts and confirm success messages reference the correct appendix; ensure focus stays within the modal while processing.
- Upload a dummy file with the wrong extension and confirm rejection guidance includes supported formats.
- Open экспорт → confirm options include CSV (active), Отпуска, Теги. CSV учитывает включённые колонки; Отпуска выводит сотрудников со статусом «В отпуске», Теги формирует перечень логинов/тегов.
- Close both модals via `Esc` and ensure focus returns to the toolbar.
- Download “Теги” CSV and spot-check that login/ФИО/тег строки присутствуют.
- Verify the modal heading/description match the selected context and that the downloaded filename uses the expected prefix (`employees_export`, `employees_vacations`, `employees_tags`).

## 8. Column Settings
- Open “Колонки”, toggle a few entries, confirm table updates; restore defaults.
- Validate focus trapping inside the drawer and `Esc` to close.

## 9. Quick Accessibility Sweep
- Cycle through all toolbar controls, modals, and drawers: focus outlines must be visible and `Esc` should close each overlay.
- Check that bulk edit, tag manager, column settings, and import/export announce titles/descriptions via assistive tech (VoiceOver rotor → headings/landmarks).
- Verify the ARIA live region announces selection counts, dismiss/restore notices, and import/export success/error states.
- Schedule the NVDA sweep (Windows) alongside the existing VoiceOver lap and log differences in `docs/SESSION_HANDOFF.md` + Phase 5 PRD.

## 10. Demo Tabs (Regression)
- Each secondary tab remains a placeholder but now shares the same label style as production modules; no “демо” badges should appear.
- Photo gallery filters work; performance tab switches modes without errors.

Log discrepancies in `docs/SESSION_HANDOFF.md` and raise new tasks in `docs/Tasks/parity-backlog-and-plan.md` or the new `docs/Tasks/phase-4-accessibility-and-final-parity.md`.
