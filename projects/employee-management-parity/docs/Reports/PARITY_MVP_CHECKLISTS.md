# MVP Parity Checklists (Per Demo)

Note: This file is the canonical MVP slot inventory per the team’s process. A mirrored copy exists at `docs/System/PARITY_MVP_CHECKLISTS.md`; keep them in sync if one is updated.

Purpose: Define behavior “slots” per screen to enable later reuse scoring without scanning code. One component type per slot; visuals frozen.

## Scheduling (CH5) – Slots
- Line chart – Forecast vs План (people)
- Bar chart – Отклонения (people)
- Line chart – Уровень сервиса (percent, target line 90%)
- KPI grid – Coverage, SL; Adherence “—” until backed
- Report table – Build log / actions
- Toggle row – Прогноз/Отклонения/SL tabs (present)
- Toggle row – День/Период regrouping (missing)
- Toggle row – Coverage/Adherence (missing)
- Overlays – Σ (headcount) and 123 (FTE hours) (missing)
- Filters/Toolbar – Basic filter block (present)

Scoring rubric lives in `docs/System/DEMO2_VALIDATION_GATE.md`.

## MVP Scope for Scheduling (CH5)
- Day/Period toggle: Required for MVP. Implement regrouping (day⇄week/month) using adapter + `timeScale` so UAT can validate behavior across granularities.
- Coverage/Adherence toggle: Required for MVP. Implement `viewToggle/activeViewId` wiring and series tagging so users can switch datasets.
- Σ/123 overlays (headcount/FTE): Required for MVP. Derive series from schedules (unique employees per day; FTE hours from duration minutes/60) and make them toggleable.
- Also Required: Forecast/Plan line view, Deviations bar view, Service-Level line with 90% target, RU formatting for ticks/tooltips, basic toolbar intact, KPI area with Coverage and SL (Adherence acceptable as “—” until a backing series exists if not explicitly required by UAT).

Planner Effort (Option B vs. prior Option A)
- Additional planning scope: +0.5 day to specify exact adapter signatures, overlay series IDs/units, toggle UI placement, and tests matrix (day/week/month; coverage/adherence filtering; Σ/123 on/off).
- Execution estimate (incremental vs. day-only MV P): ~2–3 dev days
  - Adapters + tests (toPeriodSeries, headcount, FTE): 0.5–1 day
  - Overlay/Forecast wiring (timeUnit, viewToggle, overlays): 1–1.5 days
  - KPI hookup + validation (RU/tooltips, manual UAT slice): 0.5 day

## Manager Portal – Slots (Refactor-first)
- Navigation header + Рабочая структура drawer (present) — ${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:1-210; ${MANAGER_PORTAL_REPO}/src/components/OrgStructureDrawer.tsx:1-82
- Approvals view/status/date filters + bulk banner — ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:52-212; ${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts:1-126
- Approvals review dialog (shift disposition radios, reject note) — ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:322-379; tests `${MANAGER_PORTAL_REPO}/src/pages/__tests__/Approvals.test.tsx:32-118`
- Schedule tabs (Graph/Смены/…/Отпуска) — ${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx:1-84; ${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:17-212
- Reports catalogue + download queue — ${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:10-116; ${MANAGER_PORTAL_REPO}/src/state/downloadQueue.tsx:1-84`
- KPI grid / coverage/doughnut / recent activity — ${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:38-80
- RU formatting – Numbers/percents/dates via `src/utils/charts/format.ts:19-83`; export filenames RU (`src/utils/exports.ts:19-76`)

Status: 2025-11-02 follow-up shipped schedule requests presets, approvals history presets, and download queue lifecycle ✅; `npm_config_workspaces=false npm run test -- --run --test-timeout=2000` + `npm_config_workspaces=false npm run build` pass; prod deploy https://manager-portal-demo-doeresnrv-granins-projects.vercel.app. UAT parity_static + trimmed_smoke re-run Pass (MP‑SCH‑REQ/MP‑APR‑FILTERS/MP‑REP‑QUEUE). Outstanding: Settings localisation (see Localization_Backlog).

## Unified Demo – Navigation Checklist
- Top bar should expose modules Прогнозы, Расписание, Сотрудники, Отчёты in that order (per CH2_Login_System.md §2.1 and real-system capture in docs/Archive/UAT/2025-10-13_real-vs-demo-comparison.md).
- Current pilot (Employees/Schedule only) blocked: `https://wfm-unified-demo.vercel.app` returned 404 during UAT — update once redeployed.
- Acceptance: restore deploy, add Forecasts/Reports tabs, rerun `uat-agent-tasks/unified-smoke.md` to confirm navigation matches real system.

## Analytics Dashboard (CH6) – Slots
- KPI grid – 6 карт, трендовые бейджи (present, ${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:15)
- Line chart – 24h звонки + целевой уровень (present, ${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:18)
- Report table – Отделы/звонки/агенты/CSAT/утил (present, ${ANALYTICS_REPO}/src/features/analytics/KpiOverview.tsx:26)
- Gauges – Полукруги SL/Util/CSAT (present, ${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:16)
- Heatmap – Нагрузка по дням/часам (present, ${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:29)
- Radar – Радар эффективности vs цель (present, ${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:37)
- Trend analysis (dual-axis) – Present (primary/secondary оси, `${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:51`)
- Trend toolbar – Present (`${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:69`)
- Absenteeism snapshot – Present (`${ANALYTICS_REPO}/src/features/analytics/AbsenteeismPanel.tsx:10`)
- Forecast Builder – Present (`${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:38`)
- Reports hub – Present (`${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:18`)

### MVP Scope for Analytics
- Подтвердить целевые значения/легенды с продуктом.
- Выполнить UAT пакеты (`parity_static`, `chart_visual_spec`) и приложить скриншоты.
- Добавить Playwright/Storybook покрытия для новых обёрток.
- **Статус 2025-10-27:** UAT (`parity_static`, `chart_visual_spec`) — Pass (включены прогноз/отчёты). Скриншоты `trend-analysis.png`, `forecast-build.png`, `reports-card.png`; см. `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`.

## WFM Employee Portal – Slots
- Status filter tabs — `FilterGroup` (present, ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:247-332)
- Requests table — `ReportTable` with RU formatting + history dialog (present, ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:183-597)
- Period history dialog — `Dialog` "За период" (date/status filters, counters) (present, ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:926-1163)
- New request dialog — `Dialog` + `FormField` (validation, emergency flag, toast) + `DateField` RU placeholder (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:334-804`, `${EMPLOYEE_PORTAL_REPO}/src/components/inputs/DateField.tsx:1-134`)
- Profile edit form — `FormField` (personal/contact/work/emergency tabs) (present, ${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:214-732)
- Locale helpers — `formatDate`, `formatDateTime`, `formatDateRange`, `formatNumber`, `formatPhone`, плюс каталог строк (`${EMPLOYEE_PORTAL_REPO}/src/utils/format.ts:1-70`, `${EMPLOYEE_PORTAL_REPO}/src/locale/ru.ts:1-26`)
- UAT status (2025-11-03) — **Re-run pending**: localisation polish deployed to https://wfm-employee-portal-8h7oh0j1z-granins-projects.vercel.app; rerun parity_static + trimmed_smoke, record findings, and capture updated screenshots.

### MVP Scope for Employee Portal
- Ensure all date/number output uses RU locale helpers (Dashboard stats, vacation periods, profile dates).
- Wire validation for New Request (type/start/end required, duration preview, emergency toggle) and Profile save/cancel (required fields, email/phone format, emergency contact).
- Keep behavior-only parity: dialogs, report tables, and filter tabs match reference flows; visuals untouched.
- Execute UAT packs (`parity_static`, `trimmed_smoke`) post-deploy and log findings/deploy URL in `docs/SESSION_HANDOFF.md`.

## Forecasting & Analytics – Slots
- Accuracy KPI deck — `KpiCardGrid` (implemented, ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/accuracy/AccuracyMetrics.tsx:3). UAT 2025-10-27 Pass on `/accuracy`.
- Accuracy performance trend — `LineChart` (implemented, ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/accuracy/PerformanceChart.tsx:3). Dual-axis legend verified; delta badges backlog remains.
- Error distribution views (time/day/magnitude) — `BarChart` (implemented, ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/accuracy/ErrorAnalysis.tsx:9). chart_visual_spec rerun Pass.
- Trend dashboard — dual-axis `LineChart` + anomaly markers + confidence band (implemented, ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:33). `/trends` renders with confidence band + legend (2025-10-29 smoke).
- Seasonality bars — `BarChart` with positive/negative stacks (same file lines 118-155). Pass; palette alignment follow-up open.
- Manual adjustments grid — `ReportTable` + undo/redo + validation badges (implemented, ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ManualAdjustmentSystem.tsx:1). UAT 2025-10-29 Pass after hook fix; API wiring pending.

### MVP Scope for Forecasting & Analytics
- Confirm dual-axis trend renders target + confidence band; legend matches CH spec. ✅ 2025-10-29
- Validate error analysis toggles (time/day/magnitude) via `chart_visual_spec`. ✅ 2025-10-29
- Manual adjustments now call API wrapper; connect to real backend validation/persist pipeline before sign-off. (Open)
