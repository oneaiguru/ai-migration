## Naumen Real UI – Evidence (2025-10-13)

Purpose
- Curate verified screenshots from the real Naumen WFM UI and map them to CH chapters and demo parity targets. Behaviour-only; use as authoritative anchors for UAT and planning.

Evidence Set (files live in `docs/Tasks/uat-packs/`)

1) Reports index – Основные
- File: `5e3e0282-bce3-4836-a757-0182f6635065.png`
- Path: Отчеты → Основные
- CH: CH6 Reports (overview)
- Observed: list includes График рабочего времени, График рабочего времени (сутки), Пунктуальность за сутки, Общая пунктуальность, Рабочий график сотрудников, Табель учета рабочего времени (T‑13), Журнал построения расписания, Лицензии.
- Demo parity target: Analytics Dashboard → add Reports index page with this list; each links to a stub view (ReportTable + Export).

2) Reports index – Tabs visible
- File: `a8a92086-c6d8-4f72-85a4-704dfcf52f1d.png`
- Path: Отчеты (tabs: Основные, Дашборды)
- CH: CH6 Reports (dashboards optional)
- Target: keep Dashboards as secondary; primary UAT focus is Reports list.

3) Employees list toolbar
- File: `50368a13-c84a-473e-9385-e7f1dbacadd8.png`
- Path: Сотрудники
- CH: CH3 Employees (toolbar)
- Observed: toolbar buttons «Теги», «Импортировать», «Экспортировать»; checkbox «Показывать уволенных»; counter (51/51); «Снять все фильтры».
- Target: Employee Portal → surface equivalent toolbar actions on list views; ensure RU copy and order.

4) Employees column picker
- File: `6e65c9c7-f203-45f9-bdba-3eb686dfe125.png`
- Path: Сотрудники → Настройка отображения
- CH: CH3 Employees (fields/visibility)
- Observed: large set of optional fields (логины, навыки, схема работы, теги, адрес, телефон, email, даты и т.д.).
- Target: Employee Portal → add column picker or documented subset + RU labels; align to CH3.

5) Scheduling → События (event form)
- File: `7a4f2839-126f-403f-ba9a-1b50c369127f.png`
- Path: Расписание → События
- CH: CH5 Events
- Observed: form with Время проведения, Название, Длительность, Активность, Участники (Тег/Структура/Офис/Навык/Должность), тип распределения (одновременно/последовательно/по нагрузке), комментарий.
- Target: Scheduling demo → optional: add stub “Add event” flow (non-blocking) or document as out‑of‑scope for MVP.

6) Scheduling → Отпуска (vacations planner)
- File: `cb5d3ea9-a55b-4a52-ab64-7cda5158cd95.png`
- Path: Расписание → Отпуска
- CH: CH5 Vacations
- Observed: tabs (Непостроенные/Построенные/Опубликованные), year selector, импорт/экспорт графика.
- Target: Employee Portal → ensure vacation requests and plans align; Scheduling demo may link to this as non‑MVP reference.

Usage
- Link these entries from UAT packs and demo CodeMaps; cite file names as evidence in System reports.
- Add more real-UI captures to `docs/Tasks/uat-packs/` and index them in `docs/SCREENSHOT_INDEX.md`.
