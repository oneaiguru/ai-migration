
Below is the requested parity sweep, based on a complete walkthrough of the Naumen production app and the Vercel Manager Portal demo. I logged one OIDC login attempt to the real system (Attempt 1: success) and explored all specified pages in both environments before compiling the observations.

* * *

### Pass/Fail Matrix for parity_static.md & trimmed_smoke.md

| # | Checklist item | Demo vs Real outcome | Evidence notes |
| --- | --- | --- | --- |
| **Navigation – Manager Portal (parity_static)** |  |  |  |
| 1 | Dashboard present | **Extra** | Demo sidebar lists **Панель** landing page. Naumen production has no dashboard; managers land on the schedule grid. |
| 2 | Teams present | **Extra** | Demo offers a **Команды** tab with coverage/requests statistics and team cards. The real app lists individual employees under **Сотрудники**; no team dashboard exists. |
| 3 | Approvals tab present | **Extra** | Demo places requests under a top‑level **Заявки** tab. In production, requests are accessed from the schedule’s **Заявки** sub‑tab. |
| 4 | Schedule (placeholder) present | **Fail** | Demo’s **Расписание** page displays an English placeholder (“Schedule Management – Advanced scheduling features…”) with bullet points. The real system shows a full interactive schedule grid with date range, queue filters and shift cells. |
| 5 | Reports (placeholder) present | **Fail** | Demo **Отчёты** page lists only three exports (T‑13, Work schedule, Deviations). Production provides eight reports including daily schedule, punctuality, employee schedule, build journal and licenses. |
| 6 | Settings present | **Extra** | Demo has a **Настройки** tab with an English “System Settings” placeholder. Production does not expose a manager‑level settings module. |
| **Dashboard – Manager Portal (parity_static)** |  |  |  |
| 7 | KPI card grid | **Extra** | Demo dashboard shows cards for total employees, on shift, requests in work and upcoming vacations. Production has no dashboard or KPI summary. |
| 8 | Team coverage/adherence bar chart | **Extra** | Demo includes a bar chart with toggle between coverage and adherence. No equivalent chart exists in production; managers use reports for coverage. |
| 9 | Request distribution pie chart | **Extra** | Demo shows a donut chart with categories (e.g., Отпуск, Больничный, shift_swap, replacement). The real app does not visualise requests as a pie. |
| 10 | Filters absent on dashboard | **Fail** | Demo dashboard lacks date or team filters. In production, both the schedule and requests pages include date‑range selectors and filters. |
| 11 | Recent activity list | **Extra** | A “Последние действия” table of recent requests appears below the charts. Production displays requests in their own module, not on a dashboard. |
| **Approvals – Manager Portal (parity_static)** |  |  |  |
| 12 | Priority filter chips (all/high/medium/low) | **Extra** | Demo uses chips to filter by priority. Production filters requests by status (under review, approved, rejected) and type (schedule change vs shift swap); there is no priority chip. |
| 13 | Request list | **Fail** | Demo shows a simplified table (employee, team, category, type, period, priority). Production includes more columns (status, shift icons), and separate lists for schedule changes and shift swaps with date filters and status checkboxes. |
| 14 | Review dialog (approve/reject) | **Fail** | Demo modal offers only **Одобрить** and **Отклонить** with an optional comment. Production’s approval dialog includes additional actions to transfer or delete shifts and shows request history; rejecting requires a reason. |
| **Teams – Manager Portal (parity_static)** |  |  |  |
| 15 | Sort by name/coverage/requests | **Extra** | Demo allows sorting cards by name, coverage or requests. The real system does not have team cards to sort. |
| 16 | Team detail modal | **Extra** | Demo modal summarises coverage %, number of employees, requests in work and upcoming vacations; lists members with shift times and status dots. Production displays a detailed employee edit drawer instead of team summaries. |
| 17 | Members list preview | **Extra** | Demo team cards show avatar previews of members. No such preview exists in production. |
| **Manager Portal Demo – Trimmed Smoke (live)** |  |  |  |
| 18 | Dashboard loads with KPI grid and no console errors | **Extra** | Demo dashboard rendered correctly, with blue bars for coverage and multi‑colour donut segments. Production lacks a dashboard. |
| 19 | Dashboard: no filters | **Fail** | The absence of date/team filters in the demo diverges from the production schedule and requests pages, which always provide a date range. |
| 20 | Approvals: toggle priority filters | **Extra** | Priority chips update counts. Production does not have priority filtering. |
| 21 | Approvals: review dialog flows (approve/reject) | **Fail** | Approving or rejecting in the demo simply removes the row; the real app requires handling shift transfers/deletions and provides more context. |
| 22 | Teams: change sort & open detail modal | **Extra** | Sorting and viewing details function as designed in the demo; there is no equivalent in production. |
| 23 | Quick add, edit drawer, bulk edit, tag manager, import/export, timeline (employee/analytics items) | **N/A** | These steps pertain to other portals and were not present in the Manager Portal demo. |

### Narrative “screenshots”

**manager‑org‑drawer**

On the demo’s dashboard, clicking the **Рабочая структура** button opens a centred modal titled **“Рабочая структура.”** The modal lists “Все подразделения” and individual units: **Головной офис**, **Контакт‑центр**, **Продажи**, **Разработка**, **HR**, **Маркетинг → Продукт**, **Финансы** and **Стратегия**. When I selected **Контакт‑центр**, the modal closed and a banner appeared under the page header reading “Отфильтровано по подразделению: Контакт‑центр.” All dashboard widgets updated: the “Всего сотрудников” card dropped to 12, the coverage bar chart reduced to a single bar, the donut chart showed only two categories, and the recent activity list displayed requests from that department. In the real app, the organisation tree appears as a slide‑out drawer from the right when clicking the username in the top bar; it displays deeper hierarchy nodes like **Отдел_2**, **Отдел_3**, **Отдел качества**, **Отдел телемаркетинга**, and filters data across schedule and reports.

**manager‑approvals‑bulk**

On the demo **Заявки** page, a checkbox column allows selecting multiple requests. When I selected the header checkbox, eight requests were selected and a banner appeared below the table stating **“Выбрано заявок: 8”** with category breakdown such as “Отсутствие — 6” and “Изменение графика — 2.” The banner contained two action buttons: **“Одобрить выбранные”** (green) and **“Отклонить выбранные”** (red). Clicking **Одобрить выбранные** removed all selected rows from the table and updated the summary counts. Above the table, the **Экспортировать отчёты** button opened a modal titled **“Экспорт отчётов.”** This modal presented three report cards: **T‑13 (табель учёта)** – described as an Excel timesheet of work hours and absences (file `t13_report.xlsx`); **Рабочий график** – described as coverage by departments (file `work_schedule.csv`); and **Отклонения и соблюдение** – described as a deviation/adherence report (file `deviation_report.csv`). Each card had a download icon. In the real application, the bulk‑action banner offers additional actions such as transferring shifts, and the export menu provides more report types, including daily schedules, employee schedules, punctuality and payroll.

### Comparison summary – gaps and extras

* **Dashboard absent in production:** The demo adds a full dashboard (KPI cards, coverage/adherence bar chart, request distribution pie, recent actions) that does not exist in the real system.
    
* **Org‑structure control:** The demo uses a modal to pick a department; the production system displays the organisation tree in a slide‑out panel triggered by the username and includes more hierarchy levels.
    
* **Approvals workflow simplified:** The demo merges all requests into one list and filters by priority and category; the real system separates schedule changes and shift swaps, includes date‑range and status filters, and provides an approval form that can transfer or delete shifts.
    
* **Bulk actions limited:** Demo supports only “approve selected” and “reject selected.” Production offers more mass‑processing options and requires handling associated shifts.
    
* **Reports restricted:** Demo offers three export reports; production offers eight reports covering daily schedules, punctuality, employee schedules, the schedule build journal and licenses.
    
* **Teams vs Employees:** The demo introduces team cards with coverage metrics and a detail modal; production manages individual employees with a comprehensive edit drawer (surname, login, office, timezone, work scheme, skills, etc.) and no team cards.
    
* **Schedule placeholder:** Demo’s schedule page is a static English placeholder. Production provides a fully functional schedule grid with date range filters, queue/skill filters, sub‑tabs (Shifts, Schemes, Graph, Requests, Monitoring, Tasks, Events, Vacations) and editing capabilities.
    
* **Settings placeholder:** Demo includes a system‑settings placeholder page in English; production has no manager‑level settings page.
    
* **Navigation differences:** Demo uses a left sidebar with many top‑level entries; production uses a horizontal top bar with sub‑tabs under **Расписание**.
    
* **Notifications:** Production features a bell icon for notifications and a badge for unpublished schedule changes; the demo lacks these indicators.
    

### RU localisation issues (demo)

* The schedule page placeholder is entirely in English (“Schedule Management,” “Advanced scheduling features,” “Team shift planning and assignment,” etc.).
    
* The settings page is in English (“System Settings,” “User profile and preferences,” “Notification settings,” “Security and access controls”).
    
* In the dashboard’s pie chart legend, two labels are in English: **shift_swap** and **replacement**.
    
* Priority tags in the team detail modal display **medium** and **high** instead of “Средний” and “Высокий.”
    
* File names in the export modal are English (`t13_report.xlsx`, `work_schedule.csv`, `deviation_report.csv`).
    

### Blocking issues and console observations

No blocking defects were encountered. The Manager Portal demo loaded reliably across pages, and actions (approving, rejecting, filtering) executed without visible errors. I could not access developer tools in this environment, but there were no visible console error messages or crashed components. Therefore, no redeploy is required for technical stability. The main gaps are functional: the demo lacks several core features (full schedule editing, comprehensive reports, advanced approval options) and contains untranslated labels.