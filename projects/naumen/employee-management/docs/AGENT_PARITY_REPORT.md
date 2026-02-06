# Employee Management – Feature Parity Report and Agent Task Plan (October 5 2025)

## Goal
Your prototype at [employee-management-sigma-eight.vercel.app](https://employee-management-sigma-eight.vercel.app) shows the *look* of a WFM employee management application.  To use this UI as a specification for back‑end development, you need to make sure it matches the real system’s functionality and text.  The objective is not pixel‑perfect visuals but 1:1 feature parity and terminology.  This report compares the real WFM system (available at `wfm-practice51.dc.oswfm.ru`) with the prototype and summarises the work that should be carried out by automated agents to identify gaps and generate a to‑do list for developers.

## Evidence from the Real WFM System

### Employee list
- When logged into the real system and navigating to **Сотрудники (Employees)**, a table lists all employees (51 in the current test account) with columns such as **Ф.И.О.** (full name) and **Должность** (position).  The header bar contains icons for:
  - **Display settings** – opens a side panel where you can choose which fields appear in the table (e.g., external logins, hire date, phone number, skills, tags, time zone); changes are saved by clicking **Сохранить изменения**.
  - **Tags** – manage tags associated with employees.
  - **Import** and **Export** – import employees via Excel or export the current list.
  - A checkbox **Показывать уволенных** (Show dismissed employees) for toggling whether dismissed staff appear in the list.
  - A filter indicator showing `51/51` with an option to **Снять все фильтры** (Remove all filters).  Filters persist across sessions.
- Clicking an employee opens a side panel labelled **Редактирование данных сотрудника** (Edit employee data) with two sections: **Обязательные поля** (required fields) and **Дополнительные поля** (optional fields).  The required section contains last name, first name, middle name, WFM login, external logins, password, organisational unit, office, position, time zone and **Norm of hours**.  Optional fields include preferred shifts, work scheme, skills (with priorities) and reserve skills, tasks, tags, ID number, actual address, phone number, email, date of birth and hire date.  A **Сохранить изменения** button saves changes.  This matches the functional description in the documentation: editing periodic fields, connecting work schemes, attaching skills and reserve skills, setting hour norm, and assigning tags.

### Missing features in the prototype
Your prototype currently shows only a heading and a placeholder “Основные компоненты загружены” (Main components loaded) on the Employees page.  It lacks:
- The actual employee list table and column customisation panel.
- The ability to open/edit employee cards with required and optional fields.
- Actions for tags, import/export, bulk editing or display settings.
- The **dismiss/restore** toggle and filters for showing dismissed employees.

### Quick add / New employee
- In the real system a plus button appears near the employee table (not visible in our run due to screen resolution or permissions), which opens a multi‑step wizard to create a new employee.  According to the documentation, the wizard comprises steps for personal information (names, logins, passwords), assignment to organisation unit and position, work scheme and skills, and a summary with the option to save.  Required fields are highlighted.  This matches the mockup you provided for **Быстрое добавление** (Quick Add) step 1 (first name, last name, email, phone).  The later steps in the real wizard include WFM login, password, work scheme, skills and tags, which are not yet present in your prototype.

### Photo gallery
- The real system does not have a dedicated “Photo Gallery” tab.  Employee photos appear in the employee card and can be uploaded individually.  Your prototype includes a separate **Фото галерея** page with search filters (name, team, status, department), display settings (photo size, names, positions, teams, statuses), and mass upload/export buttons.  This is an extra feature; if you intend to keep it, you will need to implement back‑end support for storing photos, search filters, bulk upload and export.

### Performance indicators
- Your prototype includes a **Показатели** (performance metrics) page showing KPI cards for service quality, schedule adherence, calls per hour, average handling time and customer satisfaction.  A ranking table lists employees with metric values and a Chart.js area reserved for trends.  In the real system, performance metrics are part of the reporting or monitoring modules rather than a dedicated page.  The documentation for reports mentions T‑13 timesheet, work schedule, deviations and other reports with export to Excel.  There is no evidence of a ranking dashboard like the one in your prototype.  You will need to verify with stakeholders whether to build such a dashboard and, if so, define how it derives metrics from existing reports (e.g., calls per hour from telephony data, schedule adherence from schedule vs actual).

### Other modules (Statuses, Certifications, Skills)
- The real system includes **Skills** and **Tags** management within the employee card and import templates for skills and in appendix 3.  It doesn’t expose a top‑level “Statuses” or “Certifications” tab.  These may be custom features you wish to add.  If so, you should base them on actual requirements: define what statuses and certifications represent, how they are stored and linked to employees, and how they affect scheduling and reporting.

### Schedule and schemes
- The schedule module in the real system is very comprehensive.  Users can manage **shifts** (создать / copy / move, define activities within a shift), **work schemes** (multi‑day cycles with floating days off and inter‑shift intervals), build schedules for employees, handle **requests** and **shift exchanges**, generate **additional shifts**, optimise breaks, and publish schedules.  None of these features appear in your prototype.  If your back‑end will ultimately support scheduling, the UI will need to replicate these capabilities or at least those relevant to your scope.

### Reports
- The real system offers default reports: **T‑13 timesheet**, **Work schedule** (monthly/daily), **Deviations**, **Employee work schedule**, **Payroll calculation**, each with date selectors and export options.  Your prototype doesn’t include a reports section.  Decide whether to implement these or rely on existing analytics.

## Agent Task Plan (350 tasks over 12 hours)
To achieve feature parity, allocate browser agents to systematically compare your prototype with the real system and gather actionable evidence.  The tasks can be split into three groups:

### 1. Delta detection on existing prototypes (200 tasks)
For each of the five prototype sections (Employees, Photo gallery, Performance, Quick add, Additional tabs) assign agents to perform side‑by‑side comparisons with the real system.  Each task should:
1. Open the corresponding page in your prototype and the analogous page in the real system.
2. Capture screenshots and note all UI elements: labels, buttons, fields, tooltips, and navigation items.
3. Record any *missing*, *extra* or *different* features.  Examples:
   - Employee list missing column customisation, filters, import/export; existing fields names may differ.
   - Quick add step 1 matches partially; subsequent steps (login, scheme, skills) are absent.
   - Photo gallery doesn’t exist in the real system and will need new back‑end endpoints for mass upload/export.
   - KPI names differ or do not exist in the real product.
4. Log behavioural differences: e.g., clicking an employee opens a side panel with fields; in the prototype there is no action.
5. Summarise findings concisely; provide a fix list or open questions for developers.

*Outcome:* A comprehensive delta list for the 5 prototype modules, guiding developers on what to implement or change.

### 2. Evidence capture for uncovered sections (100 tasks)
Many critical WFM functions are not represented in your prototype but will influence back‑end design.  Assign agents to explore these areas in the real system and document them:
1. **Employee card features** – editing periodic fields, assigning work schemes, managing skills/reserve skills, tagging, copying employee cards, dismiss/restore behaviour, and bulk editing.
2. **Schedule management** – create shifts with activities, define work schemes with floating days off, build schedules, publish schedules, handle requests and shift exchanges, generate additional shifts, and apply optimisation rules.
3. **Reports** – generate each available report, note required inputs, view outputs, and export options.
4. **Import/export templates** – download templates (employees, skills, schedule activity, work schemes, tags) and list required columns and validation rules.
5. **Permissions and roles** – observe how access is controlled (e.g., why the add‑employee button may not be visible) to ensure your back‑end enforces the same restrictions.

*Outcome:* A library of evidence (screenshots, notes, downloaded templates) for features not yet prototyped, allowing you to plan additional UI pages and endpoints.

### 3. Golden journey extraction (50 tasks)
Some workflows span multiple modules.  Assign agents to execute end‑to‑end scenarios and document each step, including system states and data changes:
1. **Create and onboard an employee** – open quick add, enter required and optional fields, assign scheme and skills, save; then search for the employee in the list.
2. **Schedule an employee** – assign them to a shift, include them in a work scheme, publish the schedule, and verify how their card reflects the new scheme.
3. **Process a schedule change request** – submit a request, approve it as a manager, and verify the schedule grid and reports.
4. **Generate and export a report** – create a T‑13 timesheet or deviations report for a period, view the output, export to Excel, and check the downloads area.
5. **Import data** – use the employee or skills import templates to add/update data, and verify results and error messages.

*Outcome:* Detailed journey maps capturing the sequence of actions, required data, UI transitions and resulting system state.  These journeys will inform back‑end API designs and integration tests.

## Practical advice for using the prototype as specification
- **Align labels and tooltips:** Use the exact wording from the real system in your UI.  For example, the employee card divides fields into *Обязательные* and *Дополнительные*; the list uses *Ф.И.О.*, *Должность*, etc.  Ensure translations in the prototype match these.
- **Mirror required vs optional fields:** The real quick add wizard enforces certain fields.  Implement the same validation logic in the back‑end and highlight required fields in the UI.
- **Expose configuration options:** Add interfaces for column customisation, tag management, import/export, and filters; these are essential for users to tailor the employee list.
- **Capture hidden behaviours:** Some features (e.g., saving changes creates a new version effective from a date, or dismissing an employee automatically removes them from the schedule) are not visible in the UI.  Agents should note these behaviours so developers can implement appropriate business logic.
- **Plan new features:** If your product roadmap includes extra modules (Photo gallery, Statuses, Certifications), design corresponding back‑end endpoints and data models since the real system does not provide them.

## Summary
Your current prototype is a good starting point but covers only a fraction of the real WFM system’s functionality.  By allocating 350 browser-agent tasks as outlined above, you can build a comprehensive delta report and evidence library.  This practical comparison will guide your development team to implement the missing features, adjust the UI text, and design back‑end APIs that faithfully reproduce the behaviour of the production system.
