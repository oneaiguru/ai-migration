# Demo Code Map — Manager Portal

Meta
- Repo: ${MANAGER_PORTAL_REPO}
- Deploy URL: https://manager-portal-demo-doeresnrv-granins-projects.vercel.app
- Commit: _pending – update after follow-up execution_
- UAT: 2025-11-01 follow-up (uat/manager-portal_illustrated-walkthrough.md, `/Users/m/Desktop/k/k.md`) — MP‑SCH‑REQ/MP‑APR‑FILTERS/MP‑REP‑QUEUE closed in this pass

Screens
- Dashboard (route `dashboard`)
  - Entry/layout: stateful router in `${MANAGER_PORTAL_REPO}/src/App.tsx:1-102`; sidebar/header shell `${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:1-176` с модульными табами и кнопкой «Рабочая структура».
  - Primary component: `${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:29-82` renders KPI, bar, doughnut, and activity table.
  - Wrappers: `KpiCardGrid` `${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:38`; `BarChart` clamp 60–100 `${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:46-52`; `DoughnutChart` legend bottom `${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:60-65`; `ReportTable` recent activity `${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:69-80`.
  - Adapters/series IDs: KPI + coverage/distribution series from `${MANAGER_PORTAL_REPO}/src/adapters/dashboard.ts:12-80` (`id: 'coverage'`, pie segments use request type id/label); categories helper `${MANAGER_PORTAL_REPO}/src/adapters/dashboard.ts:61-62`.
  - Events/flows: recent activity rows built via `buildRecentActivityRows` `${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:15-27`; clock badge uses Lucide icon `${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:71-78`.
  - KPI refresh: adapters consume `mockTeams` snapshot `${MANAGER_PORTAL_REPO}/src/data/mockData.ts:39-173` on render; no background polling.

- Approvals (route `approvals`)
  - Entry/layout: `${MANAGER_PORTAL_REPO}/src/App.tsx:19-20` routes into `<Approvals />` with teams filtered by org-unit selection.
  - Primary component: `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:52-164` now includes CH5 presets — history toggle seeds `ScheduleRequestHistoryPreset` state, “Последние 7 дней”/“Текущий месяц” buttons call `getHistoryPresetRange`, breadcrumb rendered via `formatHistoryBreadcrumb`, and manual date inputs flip preset to `custom`.
  - Wrappers: `ReportTable` multi-select table `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:208-274`; review dialog with shift disposition radios `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:322-379`; export dialog reusing report catalogue `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:398-417`.
  - Adapters/tests: category + RU label mapping `${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts:1-120`; vitest coverage expanded at `${MANAGER_PORTAL_REPO}/src/pages/__tests__/Approvals.test.tsx:32-118` to cover preset toggles and breadcrumb copy; schedule mocks reinforced with history rows `${MANAGER_PORTAL_REPO}/src/data/mockData.ts:161-210`.
  - Mock data extensions: requests include `transferOptions`/`affectedShifts` `${MANAGER_PORTAL_REPO}/src/data/mockData.ts:161-210`; added approved history item `req1-history` for “Заявки за период” view.

- Teams (route `teams`)
  - Entry/layout: `${MANAGER_PORTAL_REPO}/src/App.tsx:17-18`.
  - Primary component: `${MANAGER_PORTAL_REPO}/src/pages/Teams.tsx:1-240` (legacy cards + modal, no shared wrapper yet).
  - Data source: team stats from `${MANAGER_PORTAL_REPO}/src/data/mockData.ts:39-173`; sort handler `${MANAGER_PORTAL_REPO}/src/pages/Teams.tsx:70-124`; modal content `${MANAGER_PORTAL_REPO}/src/pages/Teams.tsx:236-309`.
  - Open behaviour: retains bespoke list; future refactor should migrate to ReportTable/Dialog wrappers.

- Schedule (route `schedule`)
  - Entry/layout: `${MANAGER_PORTAL_REPO}/src/App.tsx:74-120` mounts `<Schedule />` inside the shared shell with the download queue provider.
  - Primary component: `${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx:1-84` keeps queue selector/date range and forwards `dateRange` into tabs for preset seeding.
  - Tabs and panels: `${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:1-212` renders CH5 tabs (График/Смены/Схемы/Заявки/Мониторинг/Задачи/События/Отпуска). Requests sub-tab now filters via `filterRequestsByRange`, shows preset buttons + breadcrumb copy, and summaries prefix queue name.
  - Data feed: `${MANAGER_PORTAL_REPO}/src/data/mockData.ts:46-210` defines `orgQueues` (added engineering/marketing fallbacks) and approved history row `req1-history` backing presets.
  - Adapter helpers: `${MANAGER_PORTAL_REPO}/src/adapters/scheduleRequests.ts:4-165` exports preset helpers (`getHistoryPresetRange`, `historyPresetLabels`, `formatHistoryBreadcrumb`) plus `filterRequestsByRange` used by UI/tests.

Data & Services
- Types + mocks: `${MANAGER_PORTAL_REPO}/src/data/mockData.ts:46-210` (orgQueues, scheduleDays, расширенные заявки с transferOptions/affectedShifts + approved history row `req1-history`).
- Adapters/helpers: `${MANAGER_PORTAL_REPO}/src/adapters/dashboard.ts:12-90` (фильтрация по подразделению), `${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts:1-126` (категории, RU labels, selection summary), `${MANAGER_PORTAL_REPO}/src/adapters/scheduleRequests.ts:4-165` (history presets, queue summaries, range filtering), `${MANAGER_PORTAL_REPO}/src/utils/exports.ts:1-82` (полный каталог CH6 с RU именами файлов и статусами).
- Utilities: Chart.js formatter `${MANAGER_PORTAL_REPO}/src/utils/charts/format.ts:19-83`; registrar `${MANAGER_PORTAL_REPO}/src/utils/charts/register.ts:19-47`; download queue context `${MANAGER_PORTAL_REPO}/src/state/downloadQueue.tsx:1-84` powering notification bell and queue sheet.
- Note: Approvals mocks already держат `transferOptions`/`affectedShifts`; история заявок теперь использует `ScheduleRequestHistoryPreset` при рендере “Заявки за период”.

Routes & Layout
- Router hub: `${MANAGER_PORTAL_REPO}/src/App.tsx:1-124` (stateful navigation, feature flags, DownloadQueueProvider, org фильтр).
- Shell: `${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:1-210` (conditioned module tabs, bell dropdown lines 148-207). Queue panel now retains entries through pending → ready → acknowledged and shows expiry copy (“Доступно до …”), `expire()` prunes stale rows.
- Reports: `${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:1-116` wires confirm modal before enqueueing downloads, stores `queueId`, and leaves acknowledgement/clear actions to the bell dropdown. Forecasts remains stub `${MANAGER_PORTAL_REPO}/src/pages/Forecasts.tsx:1-20`.

RU & A11y
- Locale: Chart.js adapter keeps ru locale `${MANAGER_PORTAL_REPO}/src/utils/charts/register.ts:24-45`; donut/request legend localised via `${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts:36-88`.
- Formatting: numbers/percent/dates `${MANAGER_PORTAL_REPO}/src/utils/charts/format.ts:19-83`; export filenames remain RU `${MANAGER_PORTAL_REPO}/src/utils/exports.ts:19-76`; schedule request summaries prefix queue names `${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:158-187`.
- Accessibility: report tables surface aria labels `${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:64-205`, approvals dialog + radio group `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:322-379`, export dialog `${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:398-417`.

Tests & Stories
- Unit tests: `${MANAGER_PORTAL_REPO}/src/adapters/dashboard.test.ts:1-105`, `${MANAGER_PORTAL_REPO}/src/adapters/approvals.test.ts:1-78`, `${MANAGER_PORTAL_REPO}/src/adapters/scheduleRequests.test.ts:1-154`, `${MANAGER_PORTAL_REPO}/src/state/downloadQueue.test.tsx:1-60`, `${MANAGER_PORTAL_REPO}/src/adapters/exports.test.ts:1-25`.
- UI smoke: `${MANAGER_PORTAL_REPO}/src/pages/__tests__/Approvals.test.tsx:32-118` (disposition radios + history presets).
- CI gate: `npm_config_workspaces=false npm run test -- --run --test-timeout=2000`, `npm_config_workspaces=false npm run build`.

UAT Links
- Packs: `docs/Tasks/uat-packs/parity_static.md` (Manager Portal section), `docs/Tasks/uat-packs/trimmed_smoke.md`, `docs/Tasks/uat-packs/chart_visual_spec.md`.
- Screenshot aliases: `manager-dashboard-playwright.png`, `playwright-manager-approvals.png`, `manager-teams-modal.png` in `docs/SCREENSHOT_INDEX.md`.

Open Gaps
- Request distribution still lacks drill/filter behaviour noted in CH5 §5.4. Proposal: add легенду/фильтр once analytics requirements are confirmed; Owner: Product/UX.
- Teams modal remains bespoke (no shared wrappers). Proposal: migrate to `Dialog/ReportTable` wrappers during next refactor sprint.
- Settings extras remain behind feature flag (`${MANAGER_PORTAL_REPO}/src/config/features.ts:1-4`); determine whether to surface RU copy or keep disabled.

References
- CH docs: CH2_Login_System.md §2.1–2.3 (navigation), CH3_Employees.md §3.0 (profiles), CH5_Schedule_Advanced.md §5.4 (approvals/request flow), CH6_Reports.md §6.2 (coverage reports).
- System reports to keep in sync: docs/System/DEMO_PARITY_INDEX.md, docs/System/WRAPPER_ADOPTION_MATRIX.md, docs/System/CHART_COVERAGE_BY_DEMO.md, docs/System/APPENDIX1_SCOPE_CROSSWALK.md.
