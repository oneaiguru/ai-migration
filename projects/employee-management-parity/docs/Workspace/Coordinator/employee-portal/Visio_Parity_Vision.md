# Employee Portal Parity Vision — Manual Alignment

## Purpose
Deliver an Employee Portal demo that mirrors the real Naumen self-service experience for dashboard, requests, and profile flows, enabling UAT agents to validate behaviour directly against CH2/CH3/CH5/CH7 and the 2025-10-13 real-system captures without additional interpretation.

## Experience Outcomes
- **Shell & Navigation**
  - Top header presents RU module tabs ("Прогнозы", "Расписание", "Сотрудники", "Отчеты") and a dedicated "Рабочая структура" control that opens the org structure drawer.
  - Right-side cluster includes notification indicator, help link, and avatar menu with profile/logout actions; branding matches Naumen colour tone.
  - Layout scales across desktop/tablet with consistent spacing, preserving manual screenshot proportions.

- **Dashboard Landing**
  - Hero banner greets the employee using live profile data (Фамилия Имя Отчество) and surfaces department/position.
  - Stat widgets display total/pending/approved/rejected request counts with RU labels and colour tokens from manual captures.
  - Vacation balance widget visualises available/used/pending days per type, with annotation text in RU, matching CH5 terminology.
  - Quick links module links to "Заявки" and "Профиль" sections, following manual phrasing.

- **Vacation Requests**
  - Header shows request counters for each status ("Все", "На рассмотрении", "Одобрено", "Отклонено"), plus an annual summary for the selected year.
  - Filters include a "Заявки за период" date range picker and quick status toggles, mirroring the manual’s workflow.
  - Table columns capture period, type (with icon), status badge, reviewer, submission timestamp, manager comments, and an action column placeholder for future approvals.
  - Call-to-action buttons along the top align with manual actions: "Построить график отпусков" (future), "Отправить на согласование", "Импорт графика", "Экспорт графика", "Очистить все".
  - New request dialog enforces required fields, includes emergency flag, and displays duration preview; confirmation toast in RU acknowledges submission.

- **Profile Management**
  - Profile overview exposes structural metadata (org unit, office, time zone, employee ID) as read-only badges.
  - Editable Personal, Contacts, and Work tabs host all Appendix 1 required fields: full name (ФИО), дата рождения, адрес, контакты, логины, номер сотрудника, резервные контакты, рабочая схема.
  - Password reset and avatar upload actions appear in the profile header, following CH2 guidance.
  - Validation messages use manual phrasing (e.g., "Укажите обязательное поле"), and save confirmation mirrors Naumen toast copy.

- **Data & Localisation**
  - RU locale applied to all dates, numbers, and copy; helper utilities centralise label dictionaries to keep parity stable.
  - Mock services expose richer sample data including manager comments, structural hierarchy, and status history for requests.
  - Status logic handles cancellation, emergency flagging, and history timeline placeholders for future manager workflows.

- **Documentation & Evidence**
  - Code Map entries will cite updated file:line references once implementation lands.
  - UAT packs (`parity_static`, `trimmed_smoke`) gain new checkpoints for the added filters, fields, and shell controls.
  - Screenshot index expands to include refreshed portal captures aligned with 2025-10-13 gallery.

## Non-Goals (for this pass)
- Implementing manager-side approval workflows or shift transfers (documented as future scope).
- Hooking to live API endpoints; mocks remain but mimic real payload shapes.
- Introducing chart/KPI wrappers beyond existing cards.

## Success Criteria
- UAT agents can traverse the deployed portal and match every visible element to manual references without ambiguity.
- No RU/EN copy mismatches remain across shell, requests, or profile.
- Appendix 1 checklist rows for self-service features graduate to "Implemented" with supporting evidence.
