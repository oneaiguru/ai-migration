# UAT Pack – Parity Static (No Login)

## Manager Portal Demo – Static Parity Matrix

- Navigation (default flags `VITE_MANAGER_PORTAL_DASHBOARD/TEAMS` = off)
  - Approvals (src/components/Layout.tsx:26-32; src/App.tsx:19-20)
  - Schedule (src/components/Layout.tsx:28-32; src/pages/Schedule.tsx:1-84)
  - Reports (src/components/Layout.tsx:29-32; src/pages/Reports.tsx:10-116)
  - Settings (placeholder) (src/components/Layout.tsx:30-32; src/pages/Settings.tsx:9)
  - Extras: Dashboard/Teams available when feature flags are set to `on`.

- Dashboard (src/pages/Dashboard.tsx)
  - KPI card grid — Present (src/pages/Dashboard.tsx:90) [CH5 §5.3]
  - Team coverage/adherence bar chart — Present (toggle buttons, ${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:43-53) [CH5 §5.2]
  - Request distribution pie — Present (src/pages/Dashboard.tsx:143) [CH5 §5.4]
  - Filters (team/date) — Absent [CH6 §6.1]
  - Recent activity list — Present (src/pages/Dashboard.tsx:167) [CH5 §5.6]

- Approvals (src/pages/Approvals.tsx)
  - View tabs + priority/category chips — Present (src/pages/Approvals.tsx:223-278) [CH5 §5.4]
  - Status/date filters + presets breadcrumb — Present (src/pages/Approvals.tsx:280-346) [CH5 §5.4]
  - Review dialog (shift disposition radios, reject note required) — Present (src/pages/Approvals.tsx:322-379) [CH5 §5.4]

- Teams (src/pages/Teams.tsx)
  - Sort by name/coverage/requests — Present (src/pages/Teams.tsx:155)
  - Team detail modal — Present (src/pages/Teams.tsx:236)
  - Members list preview — Present (src/pages/Teams.tsx:216)

- Schedule (src/pages/Schedule.tsx)
  - Queue/date filters + unpublished badge — Present (src/pages/Schedule.tsx:13-77) [CH5 §5.3]
  - CH5 tabs rendered via `src/components/schedule/ScheduleTabs.tsx:17-212` (Graph/Смены/Схемы/Заявки/Мониторинг/Задачи/События/Отпуска)
  - Graph tab displays required vs published coverage per day — Present (src/components/schedule/ScheduleTabs.tsx:64-89)
  - Shifts tab shows slot list with RU status labels — Present (src/components/schedule/ScheduleTabs.tsx:92-111)
  - Requests tab shows queue-aware ReportTable with presets/breadcrumb — Present (src/components/schedule/ScheduleTabs.tsx:120-187)
  - Vacations tab lists draft slots awaiting confirmation — Present (src/components/schedule/ScheduleTabs.tsx:189-205)

- Reports (src/pages/Reports.tsx)
  - Full CH6 catalogue with RU filenames/status badges — Present (src/utils/exports.ts:19-76)
  - Download confirm modal and queue lifecycle — Present (src/pages/Reports.tsx:10-116, src/state/downloadQueue.tsx:1-84, src/components/Layout.tsx:148-206)

Use the active Manager Portal deploy recorded in `docs/Tasks/post-phase9-demo-execution.md` (Agent Assignments table) or the latest handoff entry.

Unknowns to confirm live: color tokens for charts, legend copy, RU date/number formats, and axis clamps — capture via the Chart Visual Spec UAT pack.

- Compare CH docs/screenshots to code only; no environments, no browsing.
- Fill a regression matrix with doc refs and code file:line for Navigation, List, Selection/Toolbar, Quick Add, Edit Drawer, Bulk Edit (if in scope), Tag Manager (if in scope), Import/Export, Timeline, A11y.
- Output: Markdown table + mismatch list + unknowns for live confirmation.
## Analytics Dashboard Demo – Static Parity Matrix

- Engine/Setup
  - Vite + React 18 + shared wrappers — Present (`${ANALYTICS_REPO}/src/components/charts/*`, `${ANALYTICS_REPO}/src/App.tsx:1`)
  - RU locale helpers wired (`${ANALYTICS_REPO}/src/utils/charts/format.ts:1`)

- KPI Overview (`${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx`)
  - KPI card grid — Present (line 15) [CH6 §6.3]
  - Call Volume Trend (24h) LineChart — Present (line 18) [CH6 §6.4]
  - Department performance ReportTable — Present (line 26) [CH6 §6.2]
  - Live status widget — Present via `LiveStatus` section (`${ANALYTICS_REPO}/src/features/analytics/LiveStatus.tsx:4`) [CH6 §6.8]

- Advanced Charts (`${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx`)
  - Gauge charts (Service/Util/CSAT) — Present (lines 16-23) [CH6 §6.3]
  - Heatmap (intensity by hour/day) — Present (line 29) [CH6 §6.4]
  - Radar (performance dimensions) — Present (line 37) [CH6 §6.4]
  - Trend analysis (dual-axis line) — Present (line 51) [CH6 §6.4]
  - Toolbar adjustments (smooth + target nudges) — Present (line 69) [CH6 Appendix]
  - Confidence band (shaded) — Present (data via `${ANALYTICS_REPO}/src/data/mock.ts:208`)

- Absenteeism analytics (`${ANALYTICS_REPO}/src/features/analytics/AbsenteeismPanel.tsx`)
  - Async load (spinner state) — Present (line 26)
  - Observed vs forecast series — Present (line 48)
  - Reason breakdown table — Present (line 56)

- Forecast Builder (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx`)
  - Form controls (history/projection weeks) — Present (lines 71-96)
  - Build button state + reset — Present (lines 66-97)
  - Result chart with confidence band — Present (line 101)
  - Result table (period/target/delta) — Present (line 109)

- Reports panel (`${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx`)
  - Report cards (Т‑13, Пунктуальность, Отклонения) — Present (line 67)
  - CSV download stub (available reports) — Present (line 79)
  - Status badge ("Скоро") for unavailable reports — Present (line 84)

Unknowns to confirm live: цветовые токены и подписей легенд на gauge/radar; подтверждение осевых значений для dual-axis (пороговые зоны). Capture via Chart Visual Spec UAT pack.
## WFM Employee Portal – Static Parity Matrix

- Navigation + shell (`${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx`)
  - Главная / Заявки / Профиль tabs present (`${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx:23-136`)
  - "Рабочая структура" sheet соответствует manual: searchable drawer (`WorkStructureDrawer.tsx:16-211`) с путём, контактами, рабочими параметрами, экстренным контактом

- Dashboard (`${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx`)
  - RU locale formatting on dates/numbers (`${EMPLOYEE_PORTAL_REPO}/src/utils/format.ts:11-34`, `${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:35-54`)
  - Stat cards (totals/pending/approved/upcoming) present (`${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:105-150`)
  - Vacation balance widget present (`${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:285-334`)
  - Recent requests list present (`${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:200-240`)
  - Quick actions present (`${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:190-209`)

- Vacation Requests (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx`)
  - Filter tabs all/pending/approved/rejected/отменено present (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:202-243`) [CH6 §6.1]
  - Year/period filters use `DateField` placeholder `дд.мм.гггг` (`${EMPLOYEE_PORTAL_REPO}/src/components/inputs/DateField.tsx:1-134`; `VacationRequests.tsx:674-724`) and keep counters in sync with selected year (toast confirms submission)
  - Aggregated "Заявки за период" dialog exposes date/status toggles + summary counts (`VacationHistoryDialog` `VacationRequests.tsx:926-1163`); verify checkbox defaults (pending/approved/rejected) and "Найдено записей" updates per manual image79
  - New Request dialog (validation, emergency flag, duration preview) (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:334-804`) [CH6 §6.7]
  - CSV экспорт RU (`buildCsvRows`:91-104); кнопка "Экспорт CSV" обновлена, "Импорт графика" остаётся stub для менеджеров
  - After submit, year auto-selects request year; ensure counter increments by 1 без дубликатов

- Profile (`${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx`)
  - Tabs personal/contact/work/address/emergency present (`${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:214-732`)
  - Appendix 1 поля + история календарей/графиков (`Profile.tsx:8-343`)
  - Save/Cancel + toast present (`${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:118-205`)

Unknowns: attachments in request dialog (CH5 §5.4), manager approval flow, advanced input masks.

## Forecasting & Analytics Demo – Static Parity Matrix

- Reference docs: `docs/System/forecasting-analytics_illustrated-guide.md`, `uat-agent-tasks/forecasting-illustrated-quick-sheet.md`.
- Navigation tabs (Build, Exceptions, Trends, Absenteeism, Accuracy, Adjustments) — ${FORECASTING_ANALYTICS_REPO}/src/App.tsx:7-92 (mirrors production shell); analytics shell variant lives in `${ANALYTICS_REPO}/src/App.tsx:22-89` (status copy trimmed).
- Build Forecast workspace — ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/build/BuildForecastWorkspace.tsx:40-200 (queue tree, day/interval toggle, multi-horizon, uploads, confirmation banner). Analytics slice remains simplified (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:40-132`, `${ANALYTICS_REPO}/src/features/forecasting/ForecastingWorkspace.tsx:46-118`) — queue tree/selection summary missing.
- Set Exceptions — ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:1-200 (custom ranges + import/export). Analytics panel only offers preset cards; parity tracked in illustrated guide (`${ANALYTICS_REPO}/src/features/forecasting/ExceptionsWorkspace.tsx:17-173`).
- Trend Analysis — ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:1-222 (strategic/tactical/operational tabs + Σ overlay). Analytics module shows charts only (`${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:27-128`), lacks tactical/operational tables.
- Absenteeism — ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:1-210 (history table, template CRUD). Analytics workspace handles duplication/edit but no run log yet (`${ANALYTICS_REPO}/src/features/forecasting/AbsenteeismWorkspace.tsx:24-200`).
- Manual Adjustments — ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ManualAdjustmentSystem.tsx:27-210 (validation, undo/redo, warning badges). Analytics panel keeps local session without validation badges (`${ANALYTICS_REPO}/src/features/forecasting/AdjustmentsPanel.tsx:17-113`).
- Accuracy dashboard — ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/AccuracyDashboard.tsx:1-170 (full deviation metrics, exports). Analytics dashboard only renders simplified table/legend (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:108-128`, `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:69-128`).
- Reports hub — Shared catalogue via `${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/reports/index.ts:1-110`; analytics UI renders format dropdown + CSV stub (`${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:15-86`), notification bell pending.

Use the active Forecasting & Analytics deploy listed in the tracker/hand-off before running these checks.

Unknowns to capture live: RU formatting for deviation metrics, notification bell linkage for downloads, parity of analytics queue tree/day–interval toggle, and tactical/operational data tables (see illustrated guide for open gaps).
