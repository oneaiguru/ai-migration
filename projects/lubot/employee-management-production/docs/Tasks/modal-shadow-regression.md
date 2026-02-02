# Modal Shadow Regression

> **Status:** 🚧 Logged – requires follow-up plan

## Context
- Legacy screenshots (expected): `/Users/m/Desktop/Screenshot 2025-10-11 at 13.39.23.png`, `/Users/m/Desktop/Screenshot 2025-10-11 at 13.39.29.png`.
- Current build screenshots (regression): `/Users/m/Desktop/Screenshot 2025-10-11 at 14.32.40.png`, `/Users/m/Desktop/Screenshot 2025-10-11 at 14.32.50.png`.
- Issue noticed after restoring the overlay scrim and loading design tokens (2025-10-15).

## Summary
Radix modals now render with an overly bright halo/double border along the edges—most visible on the right side near the internal scrollbar. Legacy modals had a subtle shadow; the parity build shows an exaggerated glow, suggesting duplicate drop shadows or incorrect shadow tokens.

## Reproduction Steps
1. `npm install`
2. `npm run preview -- --host 127.0.0.1 --port 4174`
3. Open the employee list.
4. Trigger Quick Add (`+ Новый сотрудник`) or open the Tag Manager (`Теги`).

## Findings
- Modal wrapper (`src/wrappers/ui/Dialog.tsx:66-104`) already applies the shared design-token shadow via `boxShadow: shadowVar("lg")`.
- Individual overlays still add Tailwind shadow utilities:
  - Quick Add modal sets `contentClassName="bg-white rounded-xl max-w-md w-full shadow-2xl"` (`src/components/QuickAddEmployee.tsx:214`).
  - Tag Manager overlay uses `shadow-xl` (`src/components/EmployeeList/TagManagerOverlay.tsx:24`).
  - Edit/Bulk edit drawers retain `shadow-xl` (`src/components/EmployeeEditDrawer.tsx:401`, `src/components/EmployeeList/BulkEditDrawer.tsx:24`).
- While tokens were missing, these Tailwind utilities provided the only shadow. After importing `src/styles/tokens.css`, both the tokenised shadow and Tailwind shadow stack, creating the blown-out edge seen in the screenshots.
- Legacy build appears to rely on a single shadow layer (no noticeable halo), matching the tokenised value.

## Impact
- Visual polish regression: halos make modals look inconsistent with the legacy design and the rest of the parity UI.
- Risk of further mismatches if individual overlays keep diverging from the shared wrapper styling.

## Next Steps
- Remove redundant Tailwind shadow classes from modal/sheet overlays so they rely solely on the shared `Dialog` shadow.
- Verify the token shadow matches the legacy appearance; adjust `--em-shadows-lg` only if necessary.
- Capture before/after screenshots and update documentation once corrected.
