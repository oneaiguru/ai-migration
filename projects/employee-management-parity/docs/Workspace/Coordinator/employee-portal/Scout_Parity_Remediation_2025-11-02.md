# Scout Notes — Employee Portal Parity Remediation (2025-11-02)

## Summary
- Confirmed the repository now ships the Work Structure drawer, vacation request history/export tooling, and Appendix 1 profile fields that were missing in the 2025‑11‑02 live audit. Behaviour aligns with CH2/CH5/CH7 guidance, and Vitest suites cover the new flows.
- Remaining gap: the "Заявки за период" dialog shows history for a single request instead of providing the status/date toggles described in CH5; planners should decide whether to extend the dialog or document the current approach.
- Recommend redeploying to Vercel and re-running `parity_static`/`trimmed_smoke` once execution completes, then share the hashed URL with UAT.

## Findings

### Header & Work Structure
- Drawer trigger and sheet now match the manual: header renders the "🗂️ Рабочая структура" button and opens a sheet with search, hierarchy trail, contacts, emergency info, and timezone formatted as "МСК (UTC+3)".
  - Manual: CH2_Login_System.md:23 (`image162.png`, `image163.png`).
  - Code: ${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx:37-123, ${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:16-168.
  - Data: hierarchical tree and search index seeded in ${EMPLOYEE_PORTAL_REPO}/src/data/mockData.ts:13-82.
- Org selection context propagates chosen node to header/footer badges (Layout uses `useOrgSelection`, Profile badges render `selection.path`).
  - Code: ${EMPLOYEE_PORTAL_REPO}/src/components/OrgSelectionContext.tsx:1-62, ${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:200-207.
- Tests: `src/__tests__/Layout.work-structure.test.tsx:1-34` covers opening the drawer, searching for «Группа QA 1», and ensuring RU timezone copy.

### Vacation Requests — History & Export
- Toolbar exposes "📂 Заявки за период", RU CSV export, and import placeholder as expected.
  - Manual: CH5_Schedule_Advanced.md:159 (`image79.png`, `image76.png`).
  - Code: ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:365-521.
- CSV helper emits RU headers/values with BOM to preserve Cyrillic (see `buildCsvRows` + `downloadCsv`).
  - Code: ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:91-105, ${EMPLOYEE_PORTAL_REPO}/src/utils/export.ts:1-15.
- History dialog surfaces timeline entries with RU labels/date formatting; matches manual copy for per-status audit trails.
  - Code: ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:739-818.
- Remaining question: dialog currently displays history for the selected request (default = first row). Manual text implies users can set a period + statuses before entering history mode. Planners should confirm whether the existing page-level filters satisfy CH5 or if dialog needs dedicated controls.
- Tests: `src/__tests__/VacationRequests.test.tsx` already asserts dedupe + RU export; extend to cover `downloadCsv` contents if planner keeps this behaviour.

### Profile & Appendix 1 Fields
- Profile now has five tabs (Личные данные / Контакты / Рабочие настройки / Адрес / Экстренный контакт) and exposes Appendix 1 columns: personnel number, message type, external IDs, calendar/scheme IDs, work/holiday histories, plus self-service actions.
  - Manual: CH7_Appendices.md:13-39 (`image175.png`), CH2_Login_System.md:42 (self-service), CH3_Employees.md:11-37 (`image178.png`).
  - Code: ${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:200-940, ${EMPLOYEE_PORTAL_REPO}/src/types/index.ts:1-96, ${EMPLOYEE_PORTAL_REPO}/src/data/mockData.ts:122-178.
- Save flow validates mandatory fields and shows "Профиль сохранён" toast; cancel restores original data.
  - Code: ${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:112-189, 618-739.
- Tests: `src/__tests__/Profile.test.tsx:1-120` covers Appendix fields, history blocks, and self-service toggles.

### Localisation & UX Checks
- RU localisation applied across new flows: Drawer uses `formatTimeZoneRu` (returns "МСК (UTC+3)"), CSV headers in Cyrillic, toasts copy is RU only.
  - Code: ${EMPLOYEE_PORTAL_REPO}/src/utils/format.ts:74-110, ${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:405-413.
- Date inputs still rely on the browser’s locale for placeholders (type="date"), which can show `mm/dd/yyyy` if the agent’s locale is en-US. Consider adding explicit placeholder text (`placeholder="дд.мм.гггг"`) if UAT requires deterministic copy.

### Documentation / Tests
- Updated tests exist for drawer, profile, and vacation requests. Ensure planners include any new coverage (e.g., CSV export assertions, history dialog filters) in Phase 5 of the execution plan.
- Docs to refresh after execution: Code Map, manual crosswalk (`docs/Tasks/uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md`), parity checklists, screenshot index, learning log.

## Risks & Open Questions
1. **History dialog scope:** Manual describes selecting statuses inside "Заявки за период"; verify with stakeholders whether the page-level FilterGroup covers the same workflow or if the dialog must gain status toggles/date inputs.
2. **Org selection consumers:** Dashboard still renders `mockEmployee.fullName` and badges regardless of current selection. If parity expects contextual content (e.g., contact card showing selected node), highlight for planner.
3. **Browser locale placeholders:** To avoid repeated UAT failures, consider forcing RU placeholders on `<input type="date">` elements or documenting the locale dependency.

## Next Steps for Planner
- Use this scout doc plus `docs/Archive/UAT/2025-11-02_employee-portal_live-parity-audit.md` to draft `plans/2025-11-02_employee-portal-parity-remediation.plan.md` (per task brief).
- In the plan, decide whether to adjust the history dialog UX and integrate org selection into dashboard/requests/profile summaries.
- Schedule validation: `npm_config_workspaces=false npm run build`, `npm_config_workspaces=false npm run test -- --run`, local smoke on port 4180, deploy via `vercel deploy --prod --yes`, rerun `parity_static` + `trimmed_smoke`.

## Artefacts & References
- Manuals: CH2_Login_System.md:23,42; CH3_Employees.md:12-37; CH5_Schedule_Advanced.md:159; CH7_Appendices.md:13-39.
- Screenshot pack: `~/Desktop/employee-portal-manual-pack/images/image162.png`, `image163.png`, `image79.png`, `image76.png`, `image175.png`, `image178.png`.
- Tests: `src/__tests__/Layout.work-structure.test.tsx`, `src/__tests__/VacationRequests.test.tsx`, `src/__tests__/Profile.test.tsx`.
