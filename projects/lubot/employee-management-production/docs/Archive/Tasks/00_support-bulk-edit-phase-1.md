<!-- ARCHIVED FILE -->
# 00 - Bulk Edit Support Notes (archived)


# Phase 1 – Bulk Edit Enhancements

Manual references: CH3 Employees (рис.23.11–23.13), screenshots `image5.png`, `image8.png`, `image13.png`.

## Overview
Bring the bulk edit experience to parity with WFM. Focus on matrix actions (Add/Replace/Delete), tag manager updates, and task timeline integration.

## Scope & File Map
| Area | Files |
| --- | --- |
| Bulk edit UI logic | `src/components/EmployeeListContainer.tsx` |
| Shared types | `src/types/employee.ts` |
| Edit drawer timeline | `src/components/EmployeeEditDrawer.tsx` |
| Seed data adjustments | `src/App.tsx` (if needed) |
| Tests | `tests/employee-list.spec.ts` |
| Docs | `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`, `docs/SOP/ui-walkthrough-checklist.md`, `docs/SCREENSHOT_INDEX.md`, `docs/Tasks/parity-backlog-and-plan.md` |

## Tasks
1. **Matrix actions (Add/Replace/Delete)**
   - Add segmented control or radio buttons within the bulk edit drawer for each editable field.
   - Supported fields: статус, команда, рабочие схемы, навыки, резервные навыки, теги, норма часов.
   - Update apply handler to perform add/replace/delete logic per field and update metadata timestamps.
   - Ensure state can queue multiple field changes together.

2. **Tag manager parity**
   - Integrate with bulk edit selections to apply tags via add/remove/replace.
   - Display resolved colour chips and limited to four tags per manual specs.
   - Keep the modal accessible (keyboard navigation, `aria-live` feedback).

3. **Task timeline integration**
   - Append bulk edit comments as dated entries in the employee drawer (most recent first).
   - Show origin (e.g., “Массовое редактирование”) and include timestamp.
   - Provide copy-to-clipboard button for each entry (optional but helpful).

4. **Testing & Verification**
   - Extend Playwright test suite with scenarios covering new actions (at least one per mode).
   - Run `npm run build`, `npm run test`.
   - Perform full walkthrough (docs/SOP/ui-walkthrough-checklist.md).

5. **Documentation Updates**
   - Update parity plan (Phase 1 section) with implement status.
   - Refresh backlog file (`docs/Tasks/parity-backlog-and-plan.md`).
   - Update SOP/walkthrough & screenshot index with new UI states.
   - Add session notes in `docs/SESSION_HANDOFF.md`.

## Out-of-Scope
- Manager picker and scheme timeline (Phase 2).
- Additional demo tab enhancements.
