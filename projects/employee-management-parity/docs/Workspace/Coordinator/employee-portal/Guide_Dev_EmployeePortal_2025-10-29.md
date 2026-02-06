# WFM Employee Portal — Implementation Guide (2025-10-29)

This companion guide documents how each manual requirement is satisfied in code after the parity remediation pass. Use it when extending the portal or debugging UAT issues.

## 1. Org Selection & Work Structure Drawer
- **Context provider:** `src/components/OrgSelectionContext.tsx` (lines 1-56) exposes the selected hierarchy node and search index.
- **Shell wiring:** `src/components/Layout.tsx` (lines 1-183) wraps the app in `OrgSelectionProvider`, renders the header trigger, and surfaces the current path in the subtitle/footer.
- **Drawer:** `src/components/WorkStructureDrawer.tsx` (lines 16-211) implements search, tree selection, contact details, working parameters, and emergency contact. The search index lives in `mockEmployee.structureIndex` (see below).
- **Fixtures:** `src/types/index.ts` (lines 1-170) define `WorkStructureNode`/`WorkStructureSearchIndex`; `src/data/mockData.ts` (lines 1-210) seed the tree, index, and employee metadata.
- **Tests:** `src/__tests__/Layout.work-structure.test.tsx` validates the drawer opens, search highlights «Группа QA 1», and timezone formatting is RU.

## 2. Vacation Requests — History & Export
- **Component:** `src/pages/VacationRequests.tsx` (lines 1-880).
  - Filters/tabs: 205-333
  - CSV export helper: 91-104 (`buildCsvRows`) + `downloadCsv` (delegates to `src/utils/export.ts`).
  - Dialog: 760-880 (`VacationHistoryDialog`) renders history entries with RU labels, approver/comment fields, and period formatting.
  - Submit pipeline: 216-260 handles dedupe, counter updates, and year alignment.
- **Formatters:** `src/utils/format.ts` (lines 1-70) expose `VACATION_STATUS_LABEL`, `VACATION_TYPE_LABEL`, and `formatTimeZoneRu`.
- **Tests:** `src/__tests__/VacationRequests.test.tsx` checks CSV export headers, dialog rendering, dedupe behaviour, and submit validation.

## 3. Profile — Appendix 1 & Self-Service
- **Component:** `src/pages/Profile.tsx` (lines 1-343).
  - Tabs render `FormField` sections for personal info, contacts, work settings, address, and emergency contact.
  - Appendix 1 data (personnel number, message type, external IDs, calendar/scheme history) is surfaced under the work tab; history lists implemented via `HistoryList` helper (lines 318-343).
  - Self-service buttons (reset password, avatar upload, notification settings) respect the `allowPasswordReset`/`allowAvatarUpload` flags from mock data.
  - Save/cancel logic + toast: 118-205.
- **Fixtures:** `src/data/mockData.ts` include `personnelNumber`, `externalSystemIds`, `calendarId`, `workCalendarHistory`, `scheduleSchemeId`, and `scheduleSchemeHistory`.
- **Tests:** `src/__tests__/Profile.test.tsx` asserts Appendix 1 fields, history lists, and self-service buttons render in view mode.

## 4. Localisation Checks
- `src/utils/format.ts` ensures RU date/number/phone formatting.
- Date pickers in `VacationRequests.tsx` use RU placeholder text (`дд.мм.гггг`).
- Toast messages and dialog copy are localised directly in component strings; keep them in Russian when adding new flows.

## 5. Mock Data & Types Overview
- `src/types/index.ts`: centralised types for employee, work structure, vacation requests, and history entries. When adding new fields, update mocks, components, and tests simultaneously.
- `src/data/mockData.ts`: single source for employee profile, structure tree/index, vacation requests (history + status/type labels), and dashboard stats.

## 6. Test & Build Commands
- Unit tests: `npm_config_workspaces=false npm run test -- --run` (Vitest).
- Build: `npm_config_workspaces=false npm run build` (Vite).

## 7. Screenshot Aliases
Use these aliases when capturing evidence for docs/SCREENSHOT_INDEX.md:
- `portal-work-structure.png`
- `portal-work-structure-search.png`
- `portal-vacation-history.png`
- `portal-profile-appendix.png`
- Existing: `portal-dashboard-overview.png`, `portal-requests-playwright.png`

## 8. Known Follow-ups / TODOs
- Addressed this pass: Work Structure search, history dialog, CSV export, Appendix 1 + self-service.
- Still optional: integrate back-end APIs, Playwright coverage (future scope).
- Ensure any future changes charted in plans and UAT packs reflect these aliases/manual references.
