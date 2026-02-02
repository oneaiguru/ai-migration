# Targeted Follow-Up Tasks (Parity Delta 06 Oct 2025)

This checklist maps directly to the outstanding gaps called out in `/Users/m/Desktop/aa.md`. Work inside `~/git/client/employee-management-parity` only. Follow the Magic Prompt guidelines in `AGENTS.md` before you start a run.

## 1. Seed Realistic Employee Rows (Severity C)
- **File**: `src/App.tsx` – initial employees array starts around line `13`.
- Add at least 10 mock employees covering different statuses (active, probation, vacation, terminated) and teams so that multi-select and tag operations can be exercised.
- Mirror the field richness of the existing record (credentials, orgPlacement, skills). Use varied tag sets so the tag modal shows diversity.
- After seeding, adjust the Playwright smoke test (`tests/employee-list.spec.ts`) if needed so it still targets the first row reliably.

## 2. Align “+ Новый сотрудник” Flow with WFM (Severity A)
- **Files**: `src/App.tsx` (button handler ~line `90`), `src/components/EmployeeListContainer.tsx` (~line `820`), `src/components/EmployeeEditDrawer.tsx` (~line `300`), `src/components/QuickAddEmployee.tsx`.
- WFM shows a minimal drawer with only login + password. Update the demo so “+ Новый сотрудник” launches that minimal form instead of the four-step wizard.
- If we retain the full wizard, expose it as a secondary action (e.g., “Расширенная анкета”) and badge it as demo-only.
- Update the Playwright smoke test to cover the new flow.

## 3. Row Selection & Bulk Edit Parity (Severity A/B)
- **File**: `src/components/EmployeeListContainer.tsx` (row rendering around lines `940–1040`).
- Choose one strategy: (a) match WFM exactly (remove checkboxes, rely on icon-driven bulk edit) and add a placeholder bulk-edit drawer; or (b) keep checkboxes but stop opening the drawer on row click.
- Add a stub drawer/modal titled “Редактирование данных сотрудников” to mirror the real bulk-edit entry point.
- Adjust Playwright tests accordingly.

## 4. Toolbar Icons / Cosmetic Parity (Severity C)
- **File**: `src/components/EmployeeListContainer.tsx` (toolbar block ~line `820`).
- Replace labelled buttons with icon-only controls that mirror WFM ordering (add employee, bulk edit, tag, import, export). Provide tooltips for accessibility.

## 5. Optional Tabs (Severity C)
- **File**: `src/App.tsx`, tabs array near line `120`.
- Either remove demo-only modules (photo gallery, KPI, statuses, certifications, skills) or label them “Demo / prototype”. Document the decision in `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`.

## 6. Documentation & Tests
- Update `AGENTS.md` if scripts or smoke procedures change.
- Note progress in `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`.
- Run and record:
  ```bash
  npm run build
  npm run test
  npm run preview -- --host 127.0.0.1 --port 4174
  ```
  (Stop preview once manual checks are done.)

## Reference
- Delta report: `/Users/m/Desktop/aa.md`
- Magic Prompt process: `AGENTS.md`
- Screenshot sets: `docs/reference/screenshots/**/*`

Keep the working tree clean—commit or stash between tasks so the diff history stays readable.
