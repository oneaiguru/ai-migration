# Phase 4 – Accessibility Sweep & Final Parity Polish

**Status:** 🟡 In Progress  
**Last Updated:** 2025-10-07  
**Owner:** Next Agent (A11y & Test Hardening)

## 1. Scope
- Close the remaining gaps called out in the comprehensive parity audit (`~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`).
- Validate keyboard + screen-reader behaviour across every overlay (filters, bulk edit, tag manager, import/export, edit drawer, quick add) and capture findings.
- Harden Playwright coverage for the remaining bulk-edit matrix flows and CSV validation paths.
- Ensure documentation reflects the “no demo labels / no tech names” policy and that SOPs reference updated verification steps.

## 2. Tasks
1. **A11y Sweep (NVDA / VoiceOver)**
   - Files: `src/components/EmployeeListContainer.tsx:200-320`, `src/components/EmployeeEditDrawer.tsx:40-120`, `src/components/QuickAddEmployee.tsx:40-220`, `src/hooks/useFocusTrap.ts`.
   - Actions: Run NVDA or VoiceOver against the latest deploy (`https://employee-management-parity-9o205nrhz-granins-projects.vercel.app`), verify focus order, Esc behaviour, aria-live messaging, and document findings in `docs/SESSION_HANDOFF.md`.

2. **Bulk Edit Matrix Coverage (skills/reserve remove)**
   - Files: `src/components/EmployeeListContainer.tsx:1100-1280`, `tests/employee-list.spec.ts:169-210`.
   - Actions: Extend Playwright cases for add/remove/replace on skills and reserve skills (currently only “replace” is covered). Confirm UI prevents empty submissions and timeline entries are applied when comments are supplied.

3. **Import/Export Validation Follow-ups**
   - Files: `src/components/EmployeeListContainer.tsx:1490-1640`, `tests/employee-list.spec.ts:219-300`.
   - Actions: Ensure CSV checks exist for all Appendix contexts (employees, skills, schemes). Add Playwright coverage where feasible; otherwise log manual verification steps in the walkthrough.

4. **Doc & Evidence Refresh**
   - Files: `docs/SOP/ui-walkthrough-checklist.md`, `docs/Tasks/parity-backlog-and-plan.md`, `docs/SESSION_HANDOFF.md`, `docs/SESSION_SUMMARY.md`, `docs/System/ui-guidelines.md`, `docs/AGENT_PARITY_REPORT.md`, `docs/SCREENSHOT_INDEX.md`.
   - Actions: Update SOPs with any new keyboard/a11y notes, archive outdated handoff snippets, append new screenshot aliases, and confirm the backlog references the line ranges above.

## 3. Deliverables
- Updated source/tests meeting the acceptance criteria above.
- Playwright run (`npm run test -- --reporter=list --project=chromium --workers=1`) green.
- `docs/SESSION_HANDOFF.md` updated with a11y findings + verification summary.
- Backlog/PRD entries adjusted to reflect completed work.

## 4. Risks & Notes
- Focus-trap regressions: re-run quick regression after each overlay change.
- CSV parsing is front-end only; document any server-side expectations for follow-up integration.
- Refactors to shadcn/Radix remain out of scope until parity ≥95 %; capture any refactor ideas separately.
