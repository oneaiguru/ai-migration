# UAT Pack – Trimmed Live Smoke (Employees Only)

## Manager Portal Demo – Live Smoke (Targeted)

Use the current Manager Portal deploy recorded in the tracker/hand-off (Agent Assignments table) before running this smoke.

- Dashboard
  - Load default view; verify KPI grid renders without console errors; note chart colors and tooltip formats (src/pages/Dashboard.tsx:90, :126, :143)
  - Confirm no date/team filters (CH6 §6.1) — expected for this demo

- Approvals
  - Switch between view tabs (Все/Изменение графика/Обмен сменами) and confirm counts (src/pages/Approvals.tsx:223-278)
  - Toggle status presets (“Последние 7 дней”, “Текущий месяц”), adjust custom dates, confirm breadcrumb updates (src/pages/Approvals.tsx:280-346)
  - Open Review dialog; select shift disposition option, approve, then reject with mandatory note (src/pages/Approvals.tsx:322-379)

- Teams
  - Change sort (name/coverage/requests) and open Team Detail modal (src/pages/Teams.tsx:155, :236)

- Schedule
  - Select each tab (График/Смены/Схемы/Заявки/Мониторинг/Задачи/События/Отпуска); confirm data placeholders render (src/components/schedule/ScheduleTabs.tsx:64-205)
  - In «Заявки», validate queue summary matches presets and affected shift chips display RU status (src/components/schedule/ScheduleTabs.tsx:120-187)
  - Verify queue/date filters update header badge (src/pages/Schedule.tsx:13-77)

- Reports
  - Click “Скачать” on an available report; confirm confirm-modal copy, queue shows pending → ready with RU expiry (src/pages/Reports.tsx:10-116, src/components/Layout.tsx:148-206)

Screenshots to capture listed in docs/Tasks/screenshot-checklist.md under “Manager Portal Demo”.

- Log into trimmed build and run checks: nav (Employees only), list/selection/Esc, quick add → edit drawer, edit save gating/persistence, bulk edit (if in scope), tag manager (if in scope), import/export headings/validation, dismiss/restore timeline.
- Capture 7 screenshots (default, selection mode, bulk edit, quick add + edit drawer, tag manager limit, import/export modals, timeline view).
- Output: Pass/Fail per check, screenshot alias list, ambiguities with CH page refs.
## Analytics Dashboard Demo – Live Smoke (Targeted)

- KPI Overview (index.html)
  - Verify KPI card deck renders; values/targets/trend icons (index.html:418)
  - Verify Call Volume Trend line chart; tooltips/legend/axes (index.html:427)
  - Verify DepartmentPerformance table renders with utilization bar (index.html:275)

- Advanced Charts (advanced-charts.html)
  - Gauges: circumference/rotation, center labels (advanced-charts.html:313)
  - Heatmap: color intensity scaling, tooltip content (advanced-charts.html:54)
  - Radar: legend bottom, dashed target (advanced-charts.html:171)
  - Trend Analysis: dual axes titles/units (advanced-charts.html:240)

Screenshots to capture listed in docs/Tasks/screenshot-checklist.md under “Analytics Dashboard Demo”.
## WFM Employee Portal – Live Smoke (Targeted)

- Navigation + shell
  - Open header "Рабочая структура"; verify search (`Группа QA 1`) and org tree reflect Naumen hierarchy, contacts, working parameters (src/components/WorkStructureDrawer.tsx:16-211)

- Dashboard
  - Confirm stat cards and vacation balance load without console errors (src/pages/Dashboard.tsx:105, :150)
  - Verify recent requests list items and RU date format (src/pages/Dashboard.tsx:216)

- Vacation Requests
  - Switch filter tabs and verify counts (src/pages/VacationRequests.tsx:202-243)
  - Open New Request modal; submit a valid request; verify list updates (src/pages/VacationRequests.tsx:334-804) — date inputs must display `дд.мм.гггг` via `DateField` (`${EMPLOYEE_PORTAL_REPO}/src/components/inputs/DateField.tsx`)
  - Open "Заявки за период" dialog; confirm date/status toggles, summary "Найдено записей", RU labels (src/pages/VacationRequests.tsx:926-1163)
  - Trigger CSV export; confirm toast and RU header (src/pages/VacationRequests.tsx:91-165, :631-742)

- Profile
  - Toggle Edit; change a field; Save and verify reflect in view mode (src/pages/Profile.tsx:118-205)
  - Inspect Appendix 1/History blocks (calendar ID, scheme history, self-service buttons) (src/pages/Profile.tsx:214-343)

Screenshots to capture listed in docs/Tasks/screenshot-checklist.md under “WFM Employee Portal”.
