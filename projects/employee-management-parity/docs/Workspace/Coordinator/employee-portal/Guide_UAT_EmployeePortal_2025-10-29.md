# WFM Employee Portal — UAT Walkthrough (2025-10-29)

Use this guide when rerunning the Employee Portal parity packs after the 2025‑11‑01 remediation deploy. It maps each checklist item to the real Naumen manuals, expected behaviour, and the screenshot alias you must capture. (Keep this version code‑reference free so it can be shared directly with the browser UAT agent.)

## 1. Header & Work Structure Drawer
- **Manual reference:** CH2_Login_System.md §§2.1–2.2 (header, organisational drawer)
- **Live steps:**
  1. Load https://wfm-employee-portal.vercel.app.
  2. Open the header button «Рабочая структура».
  3. In the search field type `Группа QA 1`; the list should filter and highlight the matching node.
  4. Verify the drawer shows the hierarchy path, manager name, corporate email/phone, office, timezone («МСК (UTC+3)»), work scheme, and the emergency contact strip.
- **Screenshots:**
  - `portal-work-structure.png` — drawer open on initial load.
  - `portal-work-structure-search.png` — search results with «Группа QA 1» highlighted.

## 2. Dashboard Overview
- **Manual reference:** CH3_Employees.md §3.2 (personal dashboard summary)
- **Checks:**
  - Stat cards for total/pending/approved/upcoming requests show RU labels and values.
  - Vacation balance widget displays three progress bars (Отпуск, Больничный, Личные дни).
  - Recent requests list renders with RU date format `дд.мм.гггг` and status pills.
  - Quick action buttons («Подать заявку», «Мои заявки», «Профиль») present.
- **Screenshot:** `portal-dashboard-overview.png` (existing alias).

## 3. Vacation Requests
- **Manual reference:** CH5_Schedule_Advanced.md §5.4.1 («Заявки за период» workflow)
- **Checks:**
  1. Cycle through the status tabs (Все, На рассмотрении, Одобрено, Отклонено); counters update and the table filters.
  2. Click toolbar button «Заявки за период», choose a date range, and confirm the dialog lists matching history entries (status, approver, comments).
  3. Trigger CSV export via «Экспорт заявок» — expect a toast confirming download and a UTF‑8 RU header.
  4. Submit a new request via «Новая заявка», confirm duration preview (`📅 Продолжительность`), mark as emergency if needed, and ensure exactly one new row appears with counter incremented by 1.
- **Screenshots:**
  - `portal-vacation-history.png` — dialog open with RU status labels.
  - `portal-requests-playwright.png` or fresh capture showing the table with filters applied.

## 4. Profile & Appendix 1 Fields
- **Manual reference:** CH3_Employees.md §§3.3–3.4, CH7_Appendices.md (Appendix 1)
- **Checks:**
  - Tabs for «Личные данные», «Контакты», «Рабочие настройки», «Адрес», «Экстренный контакт» render.
  - Appendix 1 identifiers visible: personnel number, message type, external system IDs, calendar ID, scheme ID.
  - History chips show calendar/scheme history with effective dates.
  - Self-service buttons: «Сбросить пароль», «Обновить фото профиля», «Настройки уведомлений» (disabled state respected if not allowed).
  - Toggle «Редактировать», change a safe field, click «Сохранить», and confirm toast «Профиль сохранён» plus persisted values.
- **Screenshot:** `portal-profile-appendix.png` — work tab highlighting Appendix 1 fields and history.

## 5. Localisation Spot Checks
- Ensure date inputs in the request dialog use RU placeholder `дд.мм.гггг`.
- Tooltips and validation messages appear in Russian (e.g., emergency checkbox, required field errors).
- Toasts for export/profile save are RU (e.g., «Экспорт успешно сформирован», «Профиль сохранён»).

## 6. Reporting Results
- Update `docs/Tasks/uat-packs/parity_static.md` and `docs/Tasks/uat-packs/trimmed_smoke.md` (Employee Portal sections) with Pass/Fail + notes.
- Record the same outcomes in `docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md` (use the table format).
- Store captured screenshots in the shared gallery (`~/Desktop/shots epml mamgnt/`) with the aliases listed above.

This checklist aligns one-to-one with the remediation items from the latest plan; any regression should be logged immediately for follow-up.
