# Phase 2 – Interaction & Accessibility Parity PRD

**Status:** 🟡 In Progress  
**Last Updated:** 2025-10-07  
**Owner:** Next Agent (browser-automation / UI parity)

## 1. Context
- Source reports: `/Users/m/Desktop/2025-10-06_23-08_detailed-parity-feedback-employees-module.markdown`, `/Users/m/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`.
- Target build inspected: `employee-management-parity-9o205nrhz-granins-projects.vercel.app`.
- Phase 1 (bulk edit/tag/timeline) is complete; this PRD covers the remaining gaps called out by the audit.

## 2. Goals
1. Align row selection/drawer behaviour with WFM (row click opens drawer, multi-select is explicit) and update documentation accordingly.
2. Ensure every overlay (drawer, modal, quick-add) traps focus and closes on `Esc`; keyboard usage must match WFM accessibility expectations.
3. Mirror WFM toolbar utilities: export categories (Vacation, Tags), import guidance references, always-available tag catalogue, and timeline presentation inside the drawer.
4. Remove or justify non-existent fields (manager) and keep PRD/backlog/docs in sync.

## 3. Non-Goals
- Schedule/Reports modules.
- Server-side data persistence (still mock-driven).
- Visual pixel-perfect alignment (copy/layout already acceptable).

## 4. User Stories
1. **Supervisor**: “When I click a row I expect to edit that employee immediately; if I need multi-edit I choose the toolbar action or checkboxes.”
2. **Keyboard-only agent**: “While inside any drawer or modal I can navigate with Tab/Shift+Tab and hit Esc to close without focus leaking out.”
3. **Data steward**: “Exports offer the same Vacation/Tags breakdown as production and imports reference the correct templates.”
4. **Auditor**: “Task history shows when bulk edits were applied versus manual notes, with timestamps.”

## 5. Functional Requirements

### 5.1 Row Interactions & Drawer
- Click anywhere on a row (except checkbox/buttons) → open `EmployeeEditDrawer` for that employee (`src/components/EmployeeListContainer.tsx` ~L1625-L1680).
- Ctrl/Cmd + click toggles selection without opening the drawer; checkboxes remain for explicit selection.
- Table retains keyboard support: `Enter` opens, `Space` toggles selection; focus returns to the row after closing the drawer.
- Update UI walkthrough and docs to reflect behaviour change.

### 5.2 Accessibility (Esc + Focus Trap)
- All overlays (`EmployeeEditDrawer.tsx`, `EmployeeListContainer.tsx` overlays, `QuickAddEmployee.tsx`) use the shared `useFocusTrap` hook (`src/hooks/useFocusTrap.ts`).
- `Esc` closes bulk edit, tag manager, column settings, import/export, edit drawer, and quick-add. Ensure focus returns to the invoking control.
- Add regression notes to walkthrough checklist for keyboard testing.

### 5.3 Toolbar Utilities & Exports
- Export menu (`EmployeeListContainer.tsx` ~L1370-L1450) must offer: CSV (current columns), Отпуска, Теги. Non-CSV entries display the “backend pending” notice.
- Import modal references Appendix templates and keeps copy consistent with CH7.
- Tag manager accessible even with zero selections; enforce 4-tag limit and allow add/replace/remove actions.

### 5.4 Task Timeline & Documentation
- Drawer timeline shows entries with timestamps + source badges (Manual/Bulk Edit/System) (`src/components/EmployeeEditDrawer.tsx` ~L358-L780).
- Manual textarea appends new entries as `source: manual` on save.
- Remove obsolete “Менеджер” field (already done) and update docs to reflect parity with WFM.

## 6. Technical Tasks
1. Confirm `EmployeeListContainer.tsx` row handlers & bulk edit focus trap – adjust if audit finds edge cases.
2. Tighten `useFocusTrap.ts` (already introduced) for any lingering overlays.
3. Verify tag manager action buttons/toggles (matrix-style) and CSV export logic.
4. Update documentation:
   - `docs/SOP/ui-walkthrough-checklist.md` (new keyboard steps).
   - `docs/SESSION_HANDOFF.md`, `docs/SESSION_SUMMARY.md`, `docs/PRD_STATUS.md` (status updates + evidence links).
5. Reinstate Playwright coverage for quick-add once a stable trigger is available (could expose a data-testid or keep helper).

## 7. Acceptance Criteria
- Row click → drawer opens; Ctrl+click + checkboxes manage selection. Verified manually + via updated walkthrough.
- All modals/drawers respond to `Esc` and keep focus trapped (no Axe or keyboard issues).
- Export menu lists CSV/Отпуска/Теги; selecting CSV downloads respecting column options; other items show pending toast.
- Tag manager can be opened without selection, limit 4 tags, add/replace/remove semantics persist.
- Drawer timeline displays timestamped entries with source badges; saving adds manual notes.
- Documentation (walkthrough, PRD status, handoff) reflects changes; screenshots updated if UI changed visually.
- `npm run build` and `npm run test` pass; tests cover row/drawer/bulk-edit flows (quick-add test optional until hook stabilised).

## 8. Risks & Mitigations
- **Keyboard focus leaks**: use Playwright accessibility checks or manual testing with screen reader focus order.
- **Behaviour drift**: keep walkthrough and screenshots up-to-date; run side-by-side with WFM.
- **Automation gap (quick add)**: document workaround (global helper) and plan proper test hook.

## 9. Deliverables
- Code changes across components listed in Section 6.
- Updated documentation (SOPs, handoff, PRD status).
- Deployment notes with confirmatory testing (record command + URL in handoff).
