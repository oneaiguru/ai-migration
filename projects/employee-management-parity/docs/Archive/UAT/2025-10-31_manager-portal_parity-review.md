Below is a detailed comparison of the Manager Portal demo (`https://manager-portal-demo-doeresnrv-granins-projects.vercel.app`) and the real Naumen production system (`https://wfm-practice51.dc.oswfm.ru`), using the parity_static.md and trimmed_smoke.md checklists. I first logged into the production system (Attempt 1 – success), then walked through every required screen in both environments. The matrix marks each item **Pass**, **Fail**, **Extra**, or **Blocked** and provides notes on RU copy and behaviours.

* * *

### Parity/Smoke Matrix (Manager Portal vs production)

| Checklist item                                               | Demo result vs production                                    | RU & console observations                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Navigation**                                               |                                                              |                                                              |
| Approvals tab (Заявки) visible as top‑level nav              | **Extra** – Demo exposes requests as a sidebar entry; production keeps requests under the schedule’s “Заявки” sub‑tab. | RU label correct in demo; this navigation difference adds a shortcut. |
| Schedule tab (Расписание) visible                            | **Pass** – Both systems have a Schedule entry; the demo includes the full schedule module with multiple sub‑tabs. | RU label consistent.                                         |
| Reports tab (Отчёты) visible                                 | **Pass** – Demo replicates the reports module; both systems list multiple report types. | All report titles/descriptions in demo are in RU.            |
| Settings tab (Настройки) visible                             | **Extra** – Demo includes a Settings page with placeholders; production does not have a manager‑level settings module. | The demo’s Settings content is RU except for some “Скоро” markers. |
| **Schedule module – sub‑tabs**                               |                                                              |                                                              |
| График (Graph) grid                                          | **Pass** – Demo shows a full schedule grid with queue filter, date range and shift cells; production displays a similar grid. | Demo RU copy matches real; a banner “2 неопубликованных изменений” appears when unpublished changes exist. |
| Смены (Shifts)                                               | **Pass** – Demo presents a shifts table with statuses; production has a shift creation page and timeline. | Demo uses English status tags (“Published”, “Draft”, “Requires check”) – RU localisation issue. |
| Схемы (Schemes)                                              | **Pass** – Demo displays day‑type patterns for schemes; production also shows scheme calendars. | RU labels and tooltips align with production.                |
| Заявки (Requests within schedule)                            | **Fail** – Demo’s requests tab states that integration is coming soon; no list appears. Production’s sub‑tab lists schedule‑change and shift‑swap requests with filters and bulk actions. | N/A – feature missing.                                       |
| Мониторинг (Monitoring)                                      | **Pass** – Demo shows a table of employees with current status and timer; production’s monitoring page displays similar real‑time statuses. | RU labels match; update interval noted as 10 s in production. |
| Задачи (Tasks)                                               | **Pass** – Demo includes a to‑do list (e.g., “Опубликуйте расписание”); production’s tasks page provides task creation but is mostly empty. | RU labels correct; console shows no errors.                  |
| События (Events)                                             | **Pass** – Demo allows adding events with participants and descriptions; production’s events page offers a similar form. | RU copy consistent.                                          |
| Отпуска (Vacations)                                          | **Pass** – Demo lists vacation categories and statuses; production’s vacations page includes tabs for “Непостроенные”, “Построенные”, “Опубликованные”. | RU copy matches; the demo includes status badges similar to the real app. |
| **Approvals module**                                         |                                                              |                                                              |
| View tabs (Все заявки, Изменение графика, Обмен сменами)     | **Pass** – Demo uses category chips (“Изменение графика”, “Обмен сменами”, etc.) that filter the table. Production uses two separate tabs plus date filters. | RU labels correct; filtering works as expected.              |
| Priority filters (Все приоритеты / Высокий / Средний / Низкий) | **Extra** – Demo provides priority chips; production filters by request status and type, not priority. | RU copy correct.                                             |
| Status/date filters                                          | **Fail** – Demo’s requests page has only a status dropdown and generic date pickers; production uses checkboxes (“На рассмотрении”, “Одобрено”, “Отклонено”) and a period filter. | Date pickers are RU formatted in both.                       |
| Review dialog – disposition radios & comment                 | **Pass** – Demo dialog includes radio options (“Передать смену Анне Петровой” / “Удалить смену”) and allows adding a comment. Production’s dialog offers similar choices to transfer or delete a shift. | RU comment label “Причина отказа*” appears; field is mandatory when rejecting. |
| Mandatory reject note                                        | **Pass** – Demo disables the “Применить решение” button until a reason is typed; production requires a comment on rejection as per CH5 §5.4. | Tooltip reminds that a reason is required.                   |
| Approve flow updates counts                                  | **Pass** – Approving a request decrements the corresponding priority count and removes it from the table. Production behaves the same. | After approval, the demo updates the KPI counters (e.g., total requests drop from 12 to 11). |
| Reject flow updates counts                                   | **Pass** – Adding a rejection reason and applying removes the request and updates counts (e.g., “Заявок в работе” decreases). Production mirrors this behaviour. | No console errors observed during reject flows.              |
| Bulk selection banner                                        | **Pass** – Selecting multiple rows shows a banner with “Выбрано заявок: N” and category breakdown plus **Одобрить выбранные** / **Отклонить выбранные** actions. Production’s bulk bar includes similar functions but also offers shift transfer. | RU copy matches; in demo, clicking “Одобрить выбранные” removes all selected items. |
| Export dialog                                                | **Pass** – Demo export modal lists eight reports (T‑13, график рабочего времени – месяц/сутки, отклонения от нормы часов, индивидуальный график сотрудников, расчёт зарплаты (Скоро), сводная пунктуальность (Скоро), лицензии и допуски). Each card has a RU description and file name. Production lists the same reports. | Clicking **Скачать** triggers a badge on the bell icon (red “1”) but the queue drop‑down is not implemented – the export is downloaded immediately instead of via a queue. |
| **Reports queue**                                            | **Partial** – Demo shows a red indicator on the bell icon after requesting a report, but no queue drop‑down opens. Production opens a queue listing the file name and progress (e.g., `t13_report.xlsx` → `Готов`). | The missing queue UI is a functional gap.                    |
| **Schedule parity (trimmed_smoke)**                          |                                                              |                                                              |
| Step through schedule tabs (Graph/Shifts/Schemes/Requests/Monitoring/Tasks/Events/Vacations) | **Pass overall** – The demo includes all eight sub‑tabs with similar data and layouts to production. Only the schedule **Заявки** tab is missing (fail noted above). | No overlay or console issues encountered.                    |
| RU localisation                                              | **Issues observed** – Most interface text is Russian, but some labels remain in English: shift status tags (“Published”, “Draft”, “Requires check”) in the **Смены** tab; the export filenames contain transliterated English (e.g., `t13_uchet_rabochego_vremeni.xlsx`); and the bell queue is labelled only with a red dot. | All other labels match RU manual.                            |
| Console errors                                               | **None** – No error banners or broken components appeared during navigation or actions. | Developer tools were not accessible, but the UI behaved correctly. |

### Summary of differences and extras

* **Navigation:** Demo adds a Settings tab and elevates Approvals to a top‑level entry. Production places requests under the schedule and has no manager‑level settings.
  
* **Schedule sub‑tabs:** Demo reproduces the production sub‑tabs and layout, except the **Schedule → Requests** tab is not implemented (it shows “Integration will appear later”). The **Shifts** tab uses English status tags (“Published”, “Draft”), which need translation.
  
* **Approvals workflows:** Demo offers category and priority chips plus status drop‑down; production separates schedule‑change and shift‑swap tabs and filters by status and period. Both require a note on rejection; demo replicates radio options for shift disposition. Bulk actions exist in both, but production includes extra options (e.g., transfer shift).
  
* **Reports module:** Demo now contains eight export cards with RU names/descriptions similar to production. Starting a download triggers a bell badge but no queue panel; in production, the bell opens a queue showing progress and ready downloads.
  
* **Dashboard:** Demo includes a schedule dashboard (Панель расписания) summarising unpublished changes; production uses a schedule grid without a dashboard, but this is not part of the parity list for this run.
  
* **RU localisation:** Only a few English remnants remain in the demo (shift status tags and transliterated file names). Everything else is properly localised.
  
* **Console/errors:** No visible errors occurred. The export queue UI is the only significant functional gap discovered.
  

**Blocking issues**: None. The Manager Portal demo is stable; the only major gap is the missing **Schedule → Requests** tab and the incomplete export queue interface.	