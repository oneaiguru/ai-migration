# Demo Code Map — WFM Employee Portal

Meta
- Repo: ${EMPLOYEE_PORTAL_REPO}
- Deploy URL: https://wfm-employee-portal-l28i6hyl1-granins-projects.vercel.app (canonical: https://wfm-employee-portal.vercel.app)
- Commit: b91773e1e968b1103a6e6608b5c156b6d17bbe0a · Date: 2025-10-14
- UAT: 2025-10-26 parity_static + trimmed_smoke → Pass (EP-1 dedupe regression covered by new tests); 2025-11-02 redeploy adds period-history filters — rerun parity_static + trimmed_smoke on latest build

Screens
- Dashboard (route `/`)
  - Entry/layout: Shell + module nav `${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx:1-183`, Work Structure drawer `${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:16-211`; router mounting tracked in `${EMPLOYEE_PORTAL_REPO}/src/App.tsx` (pending parity refactor).
  - Primary component: `${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:1-337` loads stats, balances, recent/upcoming requests via mock services.
  - Wrappers/UI: semantic card grid; quick actions and upcoming vacations use RU helpers from `${EMPLOYEE_PORTAL_REPO}/src/utils/format.ts:1-35` (`formatPhone`, default locale).
  - Events/flows: data fetched in `useEffect` `${EMPLOYEE_PORTAL_REPO}/src/pages/Dashboard.tsx:35-54`; quick links route to `/vacation-requests` & `/profile` lines 195-271.

- Vacation Requests (route `/vacation-requests`)
  - Primary component: `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:1-1163` (filters, ReportTable, dialogs).
  - Helpers: history aggregation + status metadata `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:65-165` (DEFAULT_HISTORY_STATUSES, summary counters).
  - Wrappers: `FilterGroup` controls `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:248-344`, `ReportTable` rows `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:333-597`, `Dialog` + `FormField` based form `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:334-804`; reusable `DateField` ensures RU placeholder handling `${EMPLOYEE_PORTAL_REPO}/src/components/inputs/DateField.tsx:1-134`.
  - Adapters/series IDs: row mapping + status labels `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:91-210`; CSV exporter `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:91-165`; period summary block `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:755-774`.
  - Events/flows: sort handlers `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:159-210`; submit pipeline `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:216-310` with year re-alignment and RU toast; export handler `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:631-742`; period dialog mode toggles `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:816-905`.
  - KPI: counter summary `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:202-243`; duration preview `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:717-724`; aggregated history summary `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:1002-1054`.

- Profile (route `/profile`)
  - Primary component: `${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:1-343` with tabbed sections (personal/contacts/work/address/emergency).
  - Wrappers: `FormField` usage across tabs `${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:214-732`.
  - Events/flows: edit/save toggle `${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:168-205`; validation helper `${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:33-75`; toast feedback lines 118-125 & 736-740.
  - KPI: tenure chip via `calculateWorkYears` `${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:7-16`; structure chips lines 241-256 align with Appendix 1.

Data & Services
- Mock domain: `${EMPLOYEE_PORTAL_REPO}/src/types/index.ts:1-170` (extended employee domain + structure metadata).
- Work structure fixture & stats: `${EMPLOYEE_PORTAL_REPO}/src/data/mockData.ts:1-210` (structure tree/index, vacation history, Appendix 1 identifiers) (hierarchy tree, contacts, work settings, emergency contact copy).
- Formatters & locale strings: `${EMPLOYEE_PORTAL_REPO}/src/utils/format.ts:1-70` (`formatPhone`, `formatTimeZoneRu`, RU status/type labels, message type formatter); copy catalog `${EMPLOYEE_PORTAL_REPO}/src/locale/ru.ts:1-26`.

Routes & Layout
- Router entry: `${EMPLOYEE_PORTAL_REPO}/src/App.tsx:1-18`.
- Shell + module nav: `${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx:1-147` (module bar, Work Structure sheet, notifications/help cluster, footer).
- Work structure drawer: `${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:16-211`; context provider `${EMPLOYEE_PORTAL_REPO}/src/components/OrgSelectionContext.tsx:1-56`. (org path, contacts, emergency block).

RU & A11y
- Locale formatting (`formatDate/Time`, RU status/type labels, timezone helper) lives in `${EMPLOYEE_PORTAL_REPO}/src/utils/format.ts:1-70`; `DateField` wrapper (`${EMPLOYEE_PORTAL_REPO}/src/components/inputs/DateField.tsx:1-134`) renders RU placeholder `дд.мм.гггг` and normalises input values.
- Dialogs expose `title/description/testId` `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:334-345` & `${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:50-100`; aggregated history dialog adds accessible summary/counters `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:926-1163`.
- FilterGroup/ReportTable provide `aria-label` and semantic table structure `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:247-344` and `${EMPLOYEE_PORTAL_REPO}/src/wrappers/data/ReportTable.tsx:1-46`.

Tests & Stories
- Vitest coverage: `${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx:1-320` (validation, dedupe regression, CSV RU headers, period-history status toggles); `${EMPLOYEE_PORTAL_REPO}/src/__tests__/Profile.test.tsx:1-140` (required personal fields); `${EMPLOYEE_PORTAL_REPO}/src/__tests__/Layout.work-structure.test.tsx:1-40` (drawer trigger renders structure + contacts).
- Commands: `npm run build`, `npm run test -- --run` (see ${EMPLOYEE_PORTAL_REPO}/package.json:7-11).
- Storybook wrappers unchanged; refer to `${EMPLOYEE_PORTAL_REPO}/src/wrappers/*` for shared dialog/form patterns.

UAT Links
- Packs: `docs/Tasks/uat-packs/parity_static.md` (Employee Portal section) and `docs/Tasks/uat-packs/trimmed_smoke.md`.
- Screenshot aliases: `portal-dashboard-overview.png`, `portal-requests-playwright.png`, `portal-vacation-history.png`, `portal-profile-appendix.png`, `portal-work-structure.png`, `portal-work-structure-search.png` (see `docs/SCREENSHOT_INDEX.md`).
- Manual crosswalk: `uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md` (maps CH2/CH3/CH5/CH7 to demo flows).

Open Gaps
- Chart/KPI wrappers still pending (dashboard cards remain static). Proposal: adopt shared `KpiCardGrid` once parity approved — Owner: Employee Portal squad.
- Attachments for vacation requests (CH5 §5.4) still out of scope — capture backlog ticket post-UAT. Owner: Product.
- Phone/email validation is lightweight; escalate to shared validators when library lands. Owner: Engineering.

References
- Manuals: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH2_Login_System.md` §2.1–2.3, `CH3_Employees.md` §3.0, `CH5_Schedule_Advanced.md` §5.4, `CH7_Appendices.md` Appendix 1.
- System reports to mirror: docs/System/DEMO_PARITY_INDEX.md, docs/System/WRAPPER_ADOPTION_MATRIX.md, docs/System/CHART_COVERAGE_BY_DEMO.md, docs/System/APPENDIX1_SCOPE_CROSSWALK.md.
