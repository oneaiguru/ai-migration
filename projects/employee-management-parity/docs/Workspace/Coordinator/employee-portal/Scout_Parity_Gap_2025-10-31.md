# Scout Notes — Employee Portal Parity Gaps (2025-10-31)

## Summary
- Work structure drawer still lacks the searchable hierarchy shown in CH2; current UI only lists the employee path without tree nodes or filtering hooks.
- Vacation requests page needs a dedicated "Заявки за период" history flow and RU-localised exports; current CSV emits raw type codes and there is no period history dialog to match the manual.
- Profile screens omit several Appendix 1 fields (personnel number, external IDs, message type) and the self-service actions called out in CH2 (password/avatar updates, periodic field history).
- Localisation gaps remain for time-zone labels and exported request types; additional RU copy alignment is required before the next UAT pass.

## Findings

### Shell & Work Structure
- Drawer renders only the linear `structurePath` array; there is no search input, tree of departments, or filtering behaviour. Manual reference CH2_Login_System.md:23 and screenshots `~/Desktop/employee-portal-manual-pack/images/image162.png`, `image163.png` show search + hierarchy expected. Code references: `${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:15-37`, `${EMPLOYEE_PORTAL_REPO}/src/data/mockData.ts:39-44`, `${EMPLOYEE_PORTAL_REPO}/src/types/index.ts:35-58`.
- Layout keeps drawer data static (`mockEmployee`) and does not surface the selected org unit to downstream pages. Planner/executor will need to introduce org selection state once the tree/search behaviour exists (see `${EMPLOYEE_PORTAL_REPO}/src/components/Layout.tsx:9-62`).

### Vacation Requests — History & Export
- Manual CH5_Schedule_Advanced.md:159 (`Заявки за период`, image79.png) expects a separate period history workflow with status toggles. Current implementation exposes inline date fields only and no dedicated history dialog (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:565-606`).
- Export helper writes the raw enum (`vacation`, `sick_leave`, etc.) directly to CSV instead of RU labels; see `${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:91-113`. Manual CH5 report export note (image76.png) requires RU columns for both current and historical datasets.
- Stub buttons for "Построить график отпусков" and "Импорт графика" still log to console (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:524-633`). Either wire these to real flows or gate them until parity scope covers schedule/CSV import.

### Profile & Appendix 1 Fields
- Appendix 1 requires personnel number, message channel, external IDs, scheme/calendar IDs, etc. (`CH7_Appendices.md:12-24`). Types and UI currently omit these fields (`${EMPLOYEE_PORTAL_REPO}/src/types/index.ts:35-58`, `${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:274-552`).
- CH2_Login_System.md:42 states employees can change password, phone, email, DOB, address, and avatar. Profile header (`${EMPLOYEE_PORTAL_REPO}/src/pages/Profile.tsx:174-209`) exposes neither password reset nor avatar upload controls; periodic field history/"Добавить" actions from CH3 (`CH3_Employees.md:15-33`, images `image178.png`, `image175.png`) are also missing.
- `Employee` mocks lack work-scheme history arrays and structural metadata needed for the drawer search; extend fixtures in `${EMPLOYEE_PORTAL_REPO}/src/data/mockData.ts:23-74` accordingly.

### Localisation & Copy
- Drawer shows `Europe/Moscow` verbatim instead of RU format like "МСК (UTC+3)" (`${EMPLOYEE_PORTAL_REPO}/src/data/mockData.ts:35-38`, `${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx:66-68`).
- CSV export emits semicolon-separated rows but still returns English type codes (see finding above). Ensure RU tokens propagate to download and toast copy remains accurate (`${EMPLOYEE_PORTAL_REPO}/src/pages/VacationRequests.tsx:91-117`).

### Out-of-Scope / Document
- Shift-exchange tooling described in CH5 §5.4 (`images/image81.png`, `image73.png`) is not present and remains out-of-scope for this parity pass—document clearly so UAT doesn’t expect it.

## Tests to Plan
- Add Work Structure drawer tests covering search input, tree rendering, and selection (new Vitest file targeting `${EMPLOYEE_PORTAL_REPO}/src/components/WorkStructureDrawer.tsx`).
- Extend VacationRequests tests for "Заявки за период" history dialog, RU CSV output, and status counters after export (`${EMPLOYEE_PORTAL_REPO}/src/__tests__/VacationRequests.test.tsx`).
- Broaden Profile tests to cover new required fields (personnel number, external IDs) and password/avatar controls once implemented (`${EMPLOYEE_PORTAL_REPO}/src/__tests__/Profile.test.tsx`).

## Documentation & UAT Updates
- Update `uat-agent-tasks/manual_employee-portal-navigation-crosswalk.md` with Work Structure search steps and new screenshot alias once drawer parity lands.
- Append parity_static / trimmed_smoke packs with “Заявки за период” checklist rows referencing the upcoming history dialog.
- Refresh screenshot index with real-portal captures for the history export panel and profile self-service actions once implemented.

## Risks / Open Questions
- Need confirmation whether employee self-service should expose schedule graph/import actions or hide them until manager workflows arrive.
- Clarify with planner whether Work Structure selection should filter dashboard/request/profile data immediately or simply display hierarchy for parity.
