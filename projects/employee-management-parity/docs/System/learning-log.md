# Learning Log

Use the template:

```
### Topic — short title
- **Finding:** …
- **Evidence:** … (path:line)
- **Impact:** …
- **Proposal:** …
- **Owner:** …
```

Log newest items first. Grouped roughly per demo for traceability.

### Employee Portal — RU localisation standardised
- **Finding:** Date inputs now flow through `DateField`, enforcing the `дд.мм.гггг` placeholder and normalising user input to ISO while centralising RU copy strings.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/components/inputs/DateField.tsx:1-134; ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:248-905; ${EMPLOYEE_PORTAL_REPO}/src/locale/ru.ts:1-26.
- **Impact:** UAT no longer sees `mm/dd/yyyy` placeholders or stray English validation copy; localisation checks can assert deterministic RU text.
- **Proposal:** Extend DateField usage to other date pickers as they migrate into the portal and add CI lint to flag English placeholders.
- **Owner:** Employee Portal execution squad

### Employee Portal — Period history dialog parity
- **Finding:** “Заявки за период” now opens with manual-style status checkboxes, date range inputs, and RU summary counters instead of a single-request timeline.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:65-165, :926-1163; CH5_Schedule_Advanced.md:159 (`image79.png`).
- **Impact:** parity_static and trimmed_smoke can verify the dialog directly on the live build without flagging gaps; UAT keeps `portal-vacation-history.png` as proof.
- **Proposal:** Update UAT packs (done) and ensure Playwright upgrade captures a period-mode snapshot on next automation pass.
- **Owner:** Employee Portal execution squad

### Employee Portal — RU placeholders for vacation filters
- **Finding:** Vacation request filters and the submission dialog now enforce `дд.мм.гггг` placeholders via `RU_DATE_PLACEHOLDER`, eliminating en-US fallback UI during audits.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:111, :674-715, :782-804; parity_static.md (Vacation Requests section).
- **Impact:** Localisation checks stop failing on browser locale differences; UAT instructions can assert deterministic copy across browsers.
- **Proposal:** Add a regression step in trimmed_smoke to screenshot the date inputs before and after locale switch when multi-locale testing resumes.
- **Owner:** Employee Portal execution squad

### Employee Portal — Vitest coverage for history filters
- **Finding:** `VacationRequests.test.tsx` now verifies CSV export headers plus the new period-history status toggles and RU placeholders.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx:1-320; test run `npm_config_workspaces=false npm run test -- --run` (2025-11-02).
- **Impact:** Future regressions around aggregated history or localisation will surface in CI; manual UAT can rely on targeted automated checks.
- **Proposal:** Mirror the new scenarios in Playwright smoke once the prod harness is promoted to scripts/uat.
- **Owner:** Employee Portal execution squad

### Manager Portal — Schedule requests presets shipped
- **Finding:** «Заявки» sub-tab now filters by queue + preset ranges, renders RU breadcrumb, and surfaces affected shift chips per CH5.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:80-190; ${MANAGER_PORTAL_REPO}/src/adapters/scheduleRequests.ts:4-165; CH5_Schedule_Advanced.md:157-176; uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md:26.
- **Impact:** MP‑SCH‑REQ can remain Pass in parity_static/trimmed_smoke without manual notes; UAT no longer blocked on placeholder banner.
- **Proposal:** Capture `manager-schedule-requests-presets.png` on next smoke and update parity pack evidence list.
- **Owner:** Manager Portal execution squad

### Manager Portal — Approvals presets + breadcrumb
- **Finding:** Approvals history toggle seeds preset buttons (“Последние 7 дней”, “Текущий месяц”), breadcrumb copy, and custom date inputs with RU labels.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:280-346; ${MANAGER_PORTAL_REPO}/src/pages/__tests__/Approvals.test.tsx:94-118; CH5_Schedule_Advanced.md:153-171.
- **Impact:** MP‑APR‑FILTERS returns to Pass; trimmed_smoke instructions can verify preset behaviour directly in prod.
- **Proposal:** Add parity_static bullet pointing to preset verification (done this pass) and keep Playwright coverage on history branch.
- **Owner:** Manager Portal execution squad

### Manager Portal — Download queue lifecycle restored
- **Finding:** Reports download now opens a confirm modal, enqueues pending entries, and retains them until acknowledgement with RU expiry copy.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:10-116; ${MANAGER_PORTAL_REPO}/src/state/downloadQueue.tsx:1-84; ${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:148-206; src/state/downloadQueue.test.tsx:1-60; CH6_Reports.md:15-27.
- **Impact:** MP‑REP‑QUEUE passes UAT; managers can observe pending → ready transitions, aligning with production.
- **Proposal:** Capture `manager-download-queue-expiry.png` and extend trimmed_smoke instructions (done) to check RU expiry string.
- **Owner:** Manager Portal execution squad

### Employee Portal — Work Structure drawer parity restored
- **Finding:** Header renders the "Рабочая структура" trigger and drawer now includes search, hierarchy tree, contacts, emergency info, and RU timezone copy, matching CH2 screenshots.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx:37-123; ${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:16-168; CH2_Login_System.md:23 (`image162.png`).
- **Impact:** UAT can follow the manual’s Work Structure walkthrough without detouring to documentation-only evidence.
- **Proposal:** After redeploy, capture screenshot alias `portal-work-structure.png` and update parity_static.md to mark EP-WS-01 as Pass.
- **Owner:** Employee Portal execution squad

### Employee Portal — Appendix 1 fields and self-service now present
- **Finding:** Profile tabs surface personnel number, message type, external IDs, calendar/scheme history, and self-service controls (password/avatar), aligning with Appendix 1 and CH2 expectations.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:200-940; ${EMPLOYEE_PORTAL_REPO}/src/types/index.ts:1-96; CH7_Appendices.md:13-39; CH2_Login_System.md:42; CH3_Employees.md:11-37 (`image175.png`, `image178.png`).
- **Impact:** Appendix 1 parity row can move to Pass once deployed; UAT no longer needs to annotate missing profile fields.
- **Proposal:** Update parity_static.md and Code Map after execution to cite new field locations and self-service actions.
- **Owner:** Employee Portal execution squad

### Manager Portal — Schedule requests tab still placeholder
- **Finding:** Deployed build shows the «Заявки» schedule tab banner (“Интеграция появится позже”) instead of the request table and history filters documented in CH5.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx:14-95; ${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:169-278; CH5_Schedule_Advanced.md:157-176; /Users/m/Desktop/k/k.md:7-38; screenshot alias `manager-real-requests-queue.png`.
- **Impact:** UAT cannot validate schedule-change/shift-swap queues, keeping MP‑SCH‑REQ open and blocking parity_static.md.
- **Proposal:** Feed `buildScheduleRequestRows` results into the tab, add status checkboxes + history presets, and expose affected shift chips before the next execution pass.
- **Owner:** Manager Portal execution squad

### Manager Portal — Approvals filters need CH5 presets
- **Finding:** Approvals screen still relies on free-form date pickers and priority chips; production includes status checkboxes, preset ranges (“Последние 7 дней”, “Текущий месяц”), and breadcrumbed history view.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:214-333; ${MANAGER_PORTAL_REPO}/src/data/mockData.ts:176-360; CH5_Schedule_Advanced.md:153-171; /Users/m/Desktop/k/k.md:39-70; screenshot alias `manager-real-approvals-history.png`.
- **Impact:** Trimmed_smoke approvals steps lack parity coverage and there is no automated test ensuring presets/history toggle works.
- **Proposal:** Add preset buttons + breadcrumb, extend adapters/tests for preset filtering, and document acceptance in the follow-up plan.
- **Owner:** Manager Portal execution squad

### Manager Portal — Download queue auto-clears before managers see it
- **Finding:** `handleDownload` marks queue entries ready → acknowledged → cleared immediately, so the bell dropdown never shows pending/ready states or expiry copy (“Будет доступно до 00:00”).
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:14-25; ${MANAGER_PORTAL_REPO}/src/state/downloadQueue.tsx:25-45; ${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:148-215; CH6_Reports.md:15-27; /Users/m/Desktop/k/k.md:71-96; screenshot alias `manager-real-bell-queue.png`.
- **Impact:** MP‑REP‑QUEUE remains partial and UAT cannot confirm report availability lifecycle.
- **Proposal:** Introduce confirm modal + expiry timer, keep entries pending until acknowledged, and add vitest coverage for queue state transitions.
- **Owner:** Manager Portal execution squad

### Analytics Dashboard – Deterministic forecast builder mocks
- **Finding:** Forecast generator now seeds history/projection series with a deterministic sine-based RNG so repeated builds return identical tables for UAT.
- **Evidence:** ${ANALYTICS_REPO}/src/data/mock.ts:270; ${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.test.tsx:1.
- **Impact:** Playwright/CI snapshots stay stable and CSV output can be diffed between runs; enables confident automation around forecast parity.
- **Proposal:** Reuse `seededRandom` helper when onboarding absenteeism/accuracy APIs to keep regression suite deterministic.
- **Owner:** Analytics executor

### Analytics Dashboard – Confidence band hides from legend by default
- **Finding:** `LineChart` accepts `confidenceBand` + `toolbar`, rendering shaded areas while marking legend tokens `data-hidden=true` to avoid clutter.
- **Evidence:** ${ANALYTICS_REPO}/src/components/charts/LineChart.tsx:54-271; ${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:47; ${ANALYTICS_REPO}/e2e/analytics.spec.ts:18.
- **Impact:** Achieves CH6 expectation for dual-axis confidence shading without confusing UAT reviewers; also unlocks shared toolbar actions (smooth/nudge).
- **Proposal:** Document new props in wrapper README and add vitest snapshot covering hidden legend swatches.
- **Owner:** Charts working group

### Analytics Dashboard – Absenteeism panel uses shared forecasting service
- **Finding:** Absenteeism analytics reuse `loadAbsenteeismSnapshot` async helper to fetch seeded data and display RU delta banner plus reasons table.
- **Evidence:** ${ANALYTICS_REPO}/src/features/analytics/AbsenteeismPanel.tsx:10; ${ANALYTICS_REPO}/src/services/forecasting.ts:1; ${ANALYTICS_REPO}/src/data/mock.ts:353.
- **Impact:** Keeps forecasting + analytics flows in sync (same seed per organisation) and lets UAT validate both charts using one service layer.
- **Proposal:** Extend service to accept date range once real API lands; capture Playwright screenshot for delta banner next run.
- **Owner:** Analytics executor

### Analytics Dashboard – Reports hub CSV stub passes UAT
- **Finding:** Reports panel lists Т‑13/Пунктуальность/Отклонения cards and triggers client-side CSV download through `downloadCsv` helper.
- **Evidence:** ${ANALYTICS_REPO}/src/features/reports/ReportsPanel.tsx:18; ${ANALYTICS_REPO}/src/utils/export.ts:1; ${ANALYTICS_REPO}/e2e/analytics.spec.ts:58.
- **Impact:** UAT can verify export entry points before real backend integration; Playwright asserts `.csv` filename to guard regressions.
- **Proposal:** When API arrives, swap stub for fetch, add checksum to findings table, and log artifact path in Code Map.
- **Owner:** Analytics executor

### Manager Portal – UI localisation to RU copy
- **Finding:** Все пользовательские тексты (Dashboard, Approvals, Teams, навигация) переведены на русский, включая KPI, легенды и mockData.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:16-87; ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:40-191; ${MANAGER_PORTAL_REPO}/src/pages/Teams.tsx:1-210; ${MANAGER_PORTAL_REPO}/src/data/mockData.ts:1-250.
- **Impact:** Демонстрация теперь соответствует русскоязычному контенту реальной системы, устраняя расхождения, отмеченные в UAT отчёте.
- **Proposal:** На следующем цикле обновить trimmed_smoke скриншоты и зафиксировать русские подписи в parity packs.
- **Owner:** Manager Portal execution squad

### Manager Portal – BarChart view toggle closes MP-1 gap
- **Finding:** `BarChart` now renders in-chart toggle buttons whenever `viewToggle` is present, allowing coverage/adherence to switch without bespoke toolbars.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/components/charts/BarChart.tsx:27-158; ${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:43-53.
- **Impact:** Restores parity with CH5 coverage/adherence spec and removes lingering event listeners that previously kept Vitest sessions open.
- **Proposal:** Reuse this wrapper-level toggle pattern in Scheduling and Forecasting demos to eliminate duplicate toggle UI.
- **Owner:** Manager Portal execution squad

### Manager Portal – Coverage/adherence series tagged via adapters
- **Finding:** `COVERAGE_VIEW_TOGGLE` now ships alongside dual series so metadata.viewId matches the toggle options during UAT and tests.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/adapters/dashboard.ts:49-75; ${MANAGER_PORTAL_REPO}/src/adapters/dashboard.test.ts:88-100.
- **Impact:** Keeps adapter outputs deterministic for chart_visual_spec automation and closes MP-1 without manual chart wiring.
- **Proposal:** Mirror the metadata + toggle export in forecasting accuracy adapters before their UAT loop resumes.
- **Owner:** Manager Portal execution squad

### Manager Portal – Mock data expanded with adherence values
- **Finding:** Demo fixtures now include `stats.adherence` across all teams, so both toggle states show RU percentages that align with CH5 reporting guidance.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/data/mockData.ts:30-210.
- **Impact:** Prevents adherence view from defaulting to zeroes and gives agents realistic numbers until live data pipes land.
- **Proposal:** Sync adherence figures with NAUMEN exports during the next data refresh and capture discrepancies in the manual crosswalk.
- **Owner:** Docs & Data coordination

### Employee Portal – Work Structure drawer mirrors CH2 shell
- **Finding:** Header now exposes "Рабочая структура" via shared Dialog sheet, surfacing org path, contacts, and emergency info like the Naumen shell.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx:30-113; ${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:15-82; CH2_Login_System.md §2.1–2.2.
- **Impact:** UAT agents can confirm the shell matches the real product without swapping demos; docs crosswalk references stay accurate.
- **Proposal:** Capture a new screenshot alias (`portal-work-structure.png`) for trimmed_smoke once the deploy is live.
- **Owner:** Employee Portal executor

### Employee Portal – Year alignment keeps new requests visible
- **Finding:** Submitting a vacation request now re-centers filters on the request year and resets the date range to avoid hiding freshly added items.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:216-255; ${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx:1-180.
- **Impact:** Prevents the 2025 fallback submission from disappearing behind a 2024 filter, keeping parity_static instructions valid.
- **Proposal:** Extend docs/Tasks/uat-packs/parity_static.md with a note to verify year auto-switching after submit.
- **Owner:** Employee Portal executor

### Employee Portal – CSV export sanitises RU comments
- **Finding:** `buildCsv` now replaces newlines/quotes and emits RU-formatted ranges per manual guidance.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:91-118; CH5_Schedule_Advanced.md §5.4.1.
- **Impact:** CSV artifacts consumed by reviewers no longer break Excel imports; parity_static export step regains value pre-backend.
- **Proposal:** Add export verification to trimmed_smoke checklist with link to generated file.
- **Owner:** Docs coordinator

### Employee Portal – Profile tabs cover Appendix 1 fields
- **Finding:** Profile page reorganised into personal/contacts/work/address/emergency tabs with validation across all Appendix 1-required inputs.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:214-732; ${EMPLOYEE_PORTAL_REPO}/src/utils/format.ts:11-64.
- **Impact:** Self-service parity now reflects manual expectations; trimmed_smoke can check each tab without falling back to Manager Portal.
- **Proposal:** Update CodeMap + parity packs with tab-by-tab checks and cite Appendix 1 rows.
- **Owner:** Employee Portal executor

### Employee Portal – Submit dedupe verified on prod
- **Finding:** Cloning fallback responses + filtering React state prevents duplicate rows (All count 5→6); UAT harness logs `duplicateCount = 0/1` on prod deploy.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/data/mockData.ts:176-211; ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:236-241; test-results/portal-uat-results-2025-10-26.json.
- **Impact:** Behaviour parity restored; portal can proceed to trimmed demo/UAT handoff without blockers.
- **Proposal:** Keep regression test in place and reuse Playwright harness for future backend integrations.
- **Owner:** Employee Portal executor

### Employee Portal – Duplicate submit appends two pending rows
- **Finding:** Submitting “Новая заявка” currently triggers two identical pending rows (All count 5→7) during live UAT.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:223-244; test-results/portal-uat-results-2025-10-13.json
- **Impact:** UAT cannot pass while duplication persists; status counts inflate and parity with CH6 approval workflow breaks.
- **Proposal:** Audit `submitVacationRequest` flow to ensure a single append (debounce or guard on state setter), then add a unit test covering count increment by one.
- **Owner:** Employee Portal executor

### Employee Portal – statusSortWeight keeps RU order stable
- **Finding:** Filter + sort passes rely on `statusSortWeight` (pending=1, approved=2, rejected=3), producing consistent table ordering across tabs.
- **Evidence:** ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:128-205; test-results/portal-uat-results-2025-10-13.json
- **Impact:** Confirms we can layer additional statuses without breaking RU label order; key for scheduler parity.
- **Proposal:** Add a Vitest case asserting the weights and sorted output, then surface logic in UAT pack notes for regression awareness.
- **Owner:** Employee Portal executor

### Employee Portal – Remote Playwright run covers deployed parity checks
- **Finding:** Headless Playwright run against prod URL captured full trimmed_smoke + parity_static coverage without local preview.
- **Evidence:** test-results/portal-uat-results-2025-10-13.json; docs/Workspace/Coordinator/employee-portal/UAT_Findings_2025-10-13_template.md:12
- **Impact:** Provides repeatable UAT harness for docs repo agents; reduces friction when diagnosing prod-only regressions.
- **Proposal:** Port the script into `${EMPLOYEE_PORTAL_REPO}/scripts/uat/` with npm command + README note so future agents can trigger remote checks easily.
- **Owner:** Tools & Automation

### Forecasting Analytics – Accuracy adapters rely on shared calc utilities
- **Finding:** Accuracy dashboard will consume `formatAccuracyMetrics` utilities; adapter work must wrap outputs into wrapper-ready KPI + table rows.
- **Evidence:** ${FORECASTING_ANALYTICS_REPO}/src/utils/accuracyCalculations.ts:1-132
- **Impact:** Any wrapper migration must keep existing calc helpers; rewriting logic risks divergence vs. real API.
- **Proposal:** Build dedicated adapter tests around accuracy utilities before swapping charts.
- **Owner:** Forecasting executor

### Forecasting Analytics – KPI/Trend/Report wrappers now ship via adapters
- **Finding:** Accuracy dashboards consume `buildAccuracyKpiItems`, `buildAccuracyTrendSeries`, and `buildErrorAnalysisSeries` adapters to hydrate shared wrappers.
- **Evidence:** ${FORECASTING_ANALYTICS_REPO}/src/adapters/forecasting/accuracy.ts:18-199; ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/accuracy/PerformanceChart.tsx:3-93
- **Impact:** Future API integrations can swap mock datasets without touching presentation; adapters centralise locale/unit logic.
- **Proposal:** Extend adapters to include secondary axis metadata + delta badges, then reuse in other demos.
- **Owner:** Forecasting executor

### Forecasting Analytics – Manual adjustments overlay runs on ReportTable
- **Finding:** ManualAdjustmentSystem now renders selectable rows via `ReportTable`, recording undo/redo history on top of adapter formatted rows.
- **Evidence:** ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ManualAdjustmentSystem.tsx:52-240; adapters/forecasting/adjustments.ts:5-43
- **Impact:** Shared table wrapper can power command history while keeping UI accessible; remaining gap is inline validation badges.
- **Proposal:** Add API persistence + validation status column before parity sign-off; keep adapters returning status copy/colour tokens.
- **Owner:** Forecasting executor

### Forecasting Analytics – LineChart now supports confidence bands + dual axes
- **Finding:** Shared `LineChart` exposes `bands` + `secondaryAxis` props, letting forecasting trend charts render shaded confidence intervals and secondary metrics.
- **Evidence:** ${FORECASTING_ANALYTICS_REPO}/src/components/charts/LineChart.tsx:1-210; adapters/forecasting/trends.ts:9-116; `TrendAnalysisDashboard.tsx:85-132` wiring.
- **Impact:** Removes bespoke Chart.js configs, closes FA-1 gap in adoption matrix, and unblocks future demos needing dual-axis legend copy.
- **Proposal:** Align band colours with product palette and add Playwright capture post-deploy to lock behaviour.
- **Owner:** Forecasting executor

### Forecasting Analytics – Browser routing + smoke script
- **Finding:** Forecasting demo now uses `BrowserRouter` + Vercel rewrite, mapping `/accuracy`, `/trends`, `/adjustments` with safe defaults; Playwright smoke (`scripts/smoke-routes.mjs`) guards routes pre-deploy.
- **Evidence:** ${FORECASTING_ANALYTICS_REPO}/src/App.tsx:7-196, `src/main.tsx:1-12`, `vercel.json:1-5`, `scripts/smoke-routes.mjs:1-132`, test-results `playwright-forecasting-*.png`.
- **Impact:** Prevents deep-link 404s and trend crashes; embeds automated console/error check ahead of prod publishes.
- **Proposal:** Extend smoke to upload console logs to CI artifact and reuse for other demos.
- **Owner:** Forecasting executor

### Employee Portal – Tailwind 4 drop-in breaks styling
- **Finding:** Upgrading to Tailwind v4 trimmed utility classes (e.g. `bg-white`, `text-gray-900`) from the production CSS, leaving raw HTML styling.
- **Evidence:** package.json:26-42 (version lock), https://wfm-employee-portal.vercel.app/assets/index-B_RS7Myl.css (post-downgrade bundle shows utilities)
- **Impact:** Production deploy looked unstyled; UAT was blocked until rollback.
- **Proposal:** Pin Tailwind to ^3.4 and add Renovate ignore until a migration plan exists.
- **Owner:** Employee Portal executor

### Employee Portal – SPA fallback must respect filesystem handler
- **Finding:** Rewrite `/(.*)` → `/index.html` caused hashed assets to return HTML/401; adding `{ handle: "filesystem" }` before the catch-all fixed it.
- **Evidence:** vercel.json:1-13, deploy log showing 404 on `/assets/index-DEJR5v-Q.js`
- **Impact:** Initial deploy shipped blank page; needs standard fix across demos.
- **Proposal:** Adopt two-step rewrite in every Vite repo and document in deploy SOP.
- **Owner:** Employee Portal executor

### Employee Portal – Radix Dialog tests emit act warnings
- **Finding:** Vitest suites log React act warnings when Radix portals mount/unmount, but tests still pass.
- **Evidence:** `npm run test -- --run` output (2025-10-24 10:40 run)
- **Impact:** Noise during CI; does not block but should be silenced eventually.
- **Proposal:** Wrap dialog open/close helpers with `act` or add warning filter when Vitest config is introduced.
- **Owner:** Employee Portal executor (follow-up)

### Manager Portal – Coverage chart formatting remains RU-specific
- **Finding:** BarChart wrapper delegates axis + tooltip formatting to `formatWithUnit`, enforcing RU percent output with clamp 60–100.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Dashboard.tsx:24-48, ${MANAGER_PORTAL_REPO}/src/utils/charts/format.ts:1-83
- **Impact:** Any parity change must run through adapters/format helpers; direct wrapper props won’t localize automatically.
- **Proposal:** Extend adapters when adding adherence series and add Vitest guard around formatters.
- **Owner:** Manager Portal executor

### Manager Portal – Approvals rejection flow enforces comment
- **Finding:** Dialog disable logic prevents submitting a rejection without a note, matching CH6 audit requirements.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:168-199
- **Impact:** UAT should verify disabled state to avoid regressions when back end arrives.
- **Proposal:** Add trimmed_smoke step covering reject-without-note; later add Vitest case.
- **Owner:** Manager Portal executor

### Manager Portal – Local state router drives nav highlighting
- **Finding:** App uses `useState` instead of React Router; sidebar highlights and header title derive from `currentPage` state.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/App.tsx:10-36, ${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:10-120
- **Impact:** Future router migration must update Layout + Code Map; manual nav crosswalk references tab IDs.
- **Proposal:** Plan Router upgrade during refactor-first sprint; document state-based nav in Code Map.
- **Owner:** Manager Portal executor

### Manager Portal – Dashboard adapters aggregate mock stats
- **Finding:** `buildKpiItems`, `buildCoverageSeries`, etc. in adapters/dashboard.ts compute KPIs/series from mockTeams and format RU output.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/adapters/dashboard.ts:5-88, ${MANAGER_PORTAL_REPO}/src/data/mockData.ts:1-200
- **Impact:** Replacing mocks with API requires adapter rewrite; tests should cover aggregation logic.
- **Proposal:** Add adapter unit tests before wiring services; document dependency in Code Map.
- **Owner:** Manager Portal executor

### Analytics Dashboard – Dual-axis trend requires secondaryAxis props
- **Finding:** AdvancedAnalytics LineChart uses `secondaryAxis` to plot CSAT on right axis while keeping service level on primary axis.
- **Evidence:** ${ANALYTICS_REPO}/src/features/analytics/AdvancedAnalytics.tsx:51-65
- **Impact:** Wrapper consumers must supply secondary axis metadata; omission breaks UAT spec.
- **Proposal:** Capture requirement in WRAPPER_ADOPTION_MATRIX and add Playwright screenshot verifying both axes.
- **Owner:** Analytics executor

### Analytics Dashboard – Heatmap & radar data generated via mocks
- **Finding:** `generateDashboardData()` synthesizes 7×24 heatmap points and radar series with target overlays.
- **Evidence:** ${ANALYTICS_REPO}/src/data/mock.ts:24-190
- **Impact:** Real data integration must preserve shape (dayIndex/hour, radar categories). UAT should spot-check.
- **Proposal:** Add adapter tests for heatmap/radar before API swap.
- **Owner:** Analytics executor

### Analytics Dashboard – Live status relies on RU datetime formatting
- **Finding:** LiveStatus updates every second and formats the timestamp using `formatDateTime` with locale `ru-RU`.
- **Evidence:** ${ANALYTICS_REPO}/src/features/analytics/LiveStatus.tsx:4-34, ${ANALYTICS_REPO}/src/utils/charts/format.ts:76-94
- **Impact:** Browser-agent UAT must confirm RU time copy; fallback locale would violate parity.
- **Proposal:** Add Playwright assertion for live timestamp format; document in Code Map and parity_static.md.
- **Owner:** Analytics executor

### Forecasting Analytics – Prod deploy routes inaccessible
- **Finding:** 2025-10-13 external UAT reports `/trends` and `/adjustments` loading blank screens and `/accuracy` returning 404 on https://forecasting-analytics-cv3t45r52-granins-projects.vercel.app, blocking parity checks.
- **Evidence:** uat-agent-tasks/2025-10-26_forecasting-uat.md (UAT table) + UAT agent screenshots (see prompt response).
- **Impact:** Plan Step 6 cannot pass; accuracy/trend/adjustment behaviour remains unverified on prod.
- **Proposal:** Investigate Vercel routing/build output (likely missing static routes) and redeploy before rerunning packs.
- **Owner:** Forecasting executor

### Forecasting Analytics – Invalid hook call traced to stray effect
- **Finding:** Prod/dev bundles crashed with `TypeError: Cannot read properties of null (reading 'useEffect')` because `ManualAdjustmentSystem.tsx` registered a top-level `useEffect` after the component export (introduced during async loading refactor).
- **Evidence:** ${FORECASTING_ANALYTICS_REPO}/src/components/forecasting/ManualAdjustmentSystem.tsx:1-240 (fixed); production stack captured in `dist/assets/index-Bcb63RWR.js` before rebuild.
- **Impact:** React dispatcher stayed null in prod, so none of the forecasting routes rendered—blocking smoke + Step 6 UAT.
- **Proposal:** Keep hook placements inside component scope; add lint rule or unit to prevent stray hooks. React 18.3.1 pin + npm ci ensures Vercel rebuilds with single runtime.
- **Owner:** Forecasting executor

### Manager Portal – Организационный фильтр в навигации
- **Finding:** Новый модульный хедер и «Рабочая структура» Drawer фильтруют Dashboard/Approvals/Teams на уровне состояния `activeOrgUnit`.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/App.tsx:1-102, ${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:1-176, ${MANAGER_PORTAL_REPO}/src/components/OrgStructureDrawer.tsx:1-94
- **Impact:** Любая интеграция с shell должна пробрасывать выбранное подразделение; UAT теперь проверяет фильтрацию для всех экранов.
- **Proposal:** Зафиксировать сценарии в parity_static + trimmed_smoke и добавить Playwright smoke по переключению подразделений.
- **Owner:** Manager Portal executor

### Manager Portal – CH5 категории и массовые действия
- **Finding:** Approvals получает категории заявок, shiftPairId и bulkEligible; `ReportTable` теперь поддерживает множественный выбор и экспорт.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:1-420, ${MANAGER_PORTAL_REPO}/src/adapters/approvals.ts:1-140, ${MANAGER_PORTAL_REPO}/src/components/charts/ReportTable.tsx:1-200
- **Impact:** Новые поля нужны сервисам/адаптерам при замене моков; массовые действия должны оставаться доступными в RU локали.
- **Proposal:** Добавить Vitest покрытие (категории, summarizeSelection) и сценарий для bulk approve/reject в trimmed_smoke.
- **Owner:** Manager Portal executor

### Manager Portal – Экспорт отчётов и helper
- **Finding:** Отдельный helper `REPORT_EXPORTS` описывает T-13/Рабочий график/Отклонения, используется и в Отчётах, и в диалоге экспорта Approvals.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/utils/exports.ts:1-32, ${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:1-34, ${MANAGER_PORTAL_REPO}/src/pages/Approvals.tsx:395-414
- **Impact:** Добавление новых отчётов требует правки единого helper; UAT теперь ожидает описания/имена файлов по CH6.
- **Proposal:** Связать helper с реальным API загрузок при интеграции и расширить UAT таблицу экспортов (crosswalk).
- **Owner:** Manager Portal executor

### Manager Portal – Schedule tabs mock coverage
- **Finding:** Schedule now consumes `scheduleDays` + `orgQueues` mocks to render coverage deltas and shift slots across CH5 tabs.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Schedule.tsx:1-82, ${MANAGER_PORTAL_REPO}/src/components/schedule/ScheduleTabs.tsx:17-238, ${MANAGER_PORTAL_REPO}/src/data/mockData.ts:46-101.
- **Impact:** Future integrations must preserve queue/date filters and slot status semantics (`published/draft/needs_review`) when swapping in API data.
- **Proposal:** Document slot schema in adapter layer and add Playwright smoke to step through tabs with multiple queues.
- **Owner:** Manager Portal executor

### Manager Portal – Download queue + notifications
- **Finding:** Reports “Скачать” CTA now enqueues entries consumed by header bell dropdown via `DownloadQueueProvider`.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/pages/Reports.tsx:10-66, ${MANAGER_PORTAL_REPO}/src/state/downloadQueue.tsx:1-35, ${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:140-177.
- **Impact:** Notification UX finally mirrors production; any new export must enqueue descriptive labels + mark ready to lift badge.
- **Proposal:** When backend lands, replace stubbed promise with API polling and persist queue to local storage for refresh resilience.
- **Owner:** Manager Portal executor

### Manager Portal – Feature flag gating for extras
- **Finding:** Dashboard/Teams routes now gated behind `VITE_MANAGER_PORTAL_DASHBOARD/TEAMS` flags, defaulting to off for parity-first scope.
- **Evidence:** ${MANAGER_PORTAL_REPO}/src/config/features.ts:1-4, ${MANAGER_PORTAL_REPO}/src/App.tsx:13-118, ${MANAGER_PORTAL_REPO}/src/components/Layout.tsx:18-101.
- **Impact:** Parity packs can focus on required flows; turning extras back on requires explicit env settings (document for demos).
- **Proposal:** Add note to session handoff template reminding agents to set flags when showcasing dashboard value-add.
- **Owner:** Manager Portal executor

### Forecasting Illustrated Guide Workflow
- **Finding:** Converting large desktop screenshot dumps into parity docs was ad hoc; we lacked a repeatable workflow.
- **Evidence:** New SOP `docs/SOP/illustrated-guide-workflow.md` + guide `docs/System/forecasting-analytics_illustrated-guide.md` produced from `/Users/m/Desktop/l/` captures.
- **Impact:** Future agents can turn raw captures into documentation quickly, reducing onboarding time and preventing duplicate effort when real Naumen references arrive.
- **Proposal:** Ensure new capture requests reference the SOP, and add a planner checklist item to confirm guides stay updated when demos change.
- **Owner:** Docs coordinator

### Analytics Dashboard – Shared queue loader & RU accuracy
- **Finding:** Forecast builder/Exceptions now fetch queues through the shared async helper with loading/error states, and accuracy rows use the shared RU-format generators.
- **Evidence:** ${ANALYTICS_REPO}/src/features/forecasting/ForecastBuilder.tsx:165-605, ${ANALYTICS_REPO}/src/features/forecasting/ExceptionsWorkspace.tsx:75-286, ${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/data.ts:439-490.
- **Impact:** Prevents autoloading stale queues, aligns UAT with production (comma decimals, two-decimal AHT); future API swaps must preserve loader UX and locale output.
- **Proposal:** When backend endpoints land, replace helper data with API responses but keep loader/error surfaces and add Playwright coverage asserting the loading placeholder before selection.
- **Owner:** Analytics executor
