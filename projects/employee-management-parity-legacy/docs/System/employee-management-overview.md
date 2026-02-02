# Employee Management Overview

## UI Modules
- **Employee list (`src/components/EmployeeListContainer.tsx`)** – toolbar, filters, selection mode, bulk edit matrix (status/team/hour norm/work scheme/skills/reserve skills/tags), import/export validation, column settings, quick add trigger.
- **Employee edit drawer (`src/components/EmployeeEditDrawer.tsx`)** – required/additional blocks, scheme & skill panels, task timeline, create intro step, scheme-history readout, dismiss/restore actions.
- **Quick add (`src/components/QuickAddEmployee.tsx`)** – WFM-style minimal login/password dialog feeding the edit drawer.
- **Shared hooks/utils** – `src/hooks/useFocusTrap.ts` for modal focus trapping, `src/utils/task.ts` for timeline entries.
- **Demo tabs** – Photo gallery, performance metrics, status manager, certification tracker marked as demo-only.

## Data Model Highlights
- Seed data in `src/App.tsx` includes: skills, reserve skills, tags, preferences with `schemePreferences`, `personnelNumber`, `actualAddress`, `tasks` log.
- Shared types defined in `src/types/employee.ts` (ensure new fields stay in sync).

## Tests
- `tests/employee-list.spec.ts` covers row interactions, quick add focus behaviour, bulk edit (tags/skills/reserve skills), dismiss/restore timelines, import/export validation (Теги/Отпуска).

## References
- Manual: CH3 Employees, CH5 Schedule chapters (Advanced, Shifts, Build).
- Screenshots: see `docs/SCREENSHOT_INDEX.md` for toolbar (`image171.png`), drawer (`image180.png`), bulk edit (`image5.png`).

Keep this document updated when modules or data contracts change.
