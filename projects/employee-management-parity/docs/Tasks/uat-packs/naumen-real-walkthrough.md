## Real Naumen Walkthrough – Behaviour Checks (Scheduling, Employees, Reports)

Purpose
- Give AI UAT a precise, reproducible path through the real Naumen UI, tied to CH docs, so results are actionable. Behaviour only; no pixel/color work.

References (use path vars from docs/System/path-conventions.md)
- Manuals: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login.md`, `CH3_Employees.md`, `CH5_Schedule_Build.md`, `CH5_Schedule_Advanced.md`, `CH6_Reports.md`, `CH7_Appendices.md`
- Target (auth): OIDC URL per parity plan; login with provided test credentials.

Global
- After login, confirm top‑level tabs: Прогнозы, Сотрудники, Расписание, Отчеты (visible in this environment). Use the nav to reach modules below.
- Capture evidence into `docs/SCREENSHOT_INDEX.md` aliases.

1) Scheduling → График (CH5 Build §3.1; Advanced §2.4)
- Path: Расписание → График
- Expected controls: view tabs (прогноз/план/SL), Day/Period switch, Σ, 123, build/publish area if available
- Behaviour checks:
  - Switch view tabs; confirm dataset changes
  - Toggle День ↔ Период; confirm weekly aggregation; values adjust sensibly
  - Toggle Σ/123; confirm extra line overlays share x‑domain (on forecast view)
  - SL view clamps ~70–100% with dashed target line “Цель 90%”
- Screenshots: header controls, Day view, Period view, Σ/123 on, SL with target

2) Scheduling → Смены (CH5 Shifts)
- Path: Расписание → Смены
- Expected: list of shift types; controls to create/edit with start interval/step/period length
- Behaviour checks: create/edit flow reachable; validation; list updates
- Screenshots: list view, create/edit dialog

3) Scheduling → Схемы (CH5 Schemes)
- Path: Расписание → Схемы
- Expected: calendar matrix; mark days; add schemes; atypical days config
- Behaviour checks: add scheme; mark days; save
- Screenshots: matrix, add scheme dialog

4) Scheduling → Заявки (Requests)
- Path: Расписание → Заявки
- Expected: categories (Изменение расписания/Обмен сменами); bulk approve/reject
- Behaviour checks: filters present; bulk actions visible
- Screenshots: list with category filter and bulk actions

5) Scheduling → Мониторинг / Задачи / События / Отпуска
- Path: Расписание → (each tab)
- Expected: monitoring statuses; task list; event creation form; vacations planner (built/published tabs)
- Behaviour checks: page loads; core actions visible
- Screenshots: one per tab

6) Employees (CH3 Employees)
- Path: Сотрудники
- Expected: list with toolbar (tags/import/export), create employee, bulk edit, show dismissed
- Behaviour checks: open create; confirm required fields; open bulk edit/import/export dialogs
- Screenshots: list, create form, bulk edit, import/export menu

7) Reports (CH6 Reports)
- Path: Отчеты
- Expected: list includes T‑13, work schedule, daily schedule, punctuality, employee schedule, build log, licenses
- Behaviour checks: select period; open any report; export/print available
- Screenshots: report list; one opened report; export dialog

Notes
- If a module is not accessible in this environment, record “unavailable” and move on.
- Do not infer missing behaviour; cite only what is visible in UI and CH docs.

Output
- For each section above, add a short block to the demo’s mapping or curated UAT file: path, Pass/Fail, 1–2 lines of notes, and screenshot alias.

One‑liner to run UAT
- “Login to Naumen; follow docs/Tasks/uat-packs/naumen-real-walkthrough.md; fill Pass/Fail + notes with screenshot aliases; paste actionable behaviour deltas into the target demo’s mapping.”

