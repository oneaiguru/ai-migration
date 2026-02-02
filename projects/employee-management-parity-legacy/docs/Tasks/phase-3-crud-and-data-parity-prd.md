# Phase 3 – CRUD, Bulk Edit & Data Parity PRD

**Status:** 🟢 Planned  
**Last Updated:** 2025-10-06  
**Owner:** Next Agent (UI parity / accessibility)

## 1. Context
- Source report: `/Users/m/Desktop/dd.markdown` (comprehensive workflow validation).
- Prior references: `docs/Tasks/phase-2-accessibility-and-parity-prd.md`, `docs/Tasks/parity-backlog-and-plan.md`, cc.markdown gap analysis.
- Latest parity build reviewed: `employee-management-parity-9o205nrhz-granins-projects.vercel.app`.
- Desktop evidence: `~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown` (primary reference for Phase 3/4 gaps).
- Phase 2 delivered focus restoration, dismiss/restore flow and export/import scaffolding; this PRD closes the remaining CRUD/data gaps called out by the dd audit.

## 2. Goals
1. Achieve end-to-end CRUD parity (create, edit, dismiss, restore) with correct UI flows and keyboard support (frontend state only).
2. Bring bulk edit tooling to feature parity: matrix actions for tags/reserve skills/comments and scheme history awareness.
3. Align import/export behaviour with WFM templates (vacations, tags) including validation/error handling.
4. Finalise accessibility and interaction semantics (multi-select workflow, aria-live coverage, Esc handling).

## 3. Non-Goals
- Backend storage or API integration beyond front-end mocks.
- Schedule/reporting modules outside Employees tab.
- Reworking demo-only tabs unless parity gaps explicitly spill over (document as follow-up).

## 4. User Stories
1. **Operations manager:** “When I edit an employee, the UI reflects the changes immediately and I can dismiss or restore them just like in WFM.”
2. **Supervisor:** “Bulk edit lets me update tags, reserve skills and comments for many agents at once; scheme history is retained.”
3. **Data steward:** “Imports reject malformed files with actionable errors; exports deliver vacation/tag data in the templates I expect.”
4. **Keyboard-first agent:** “I can activate multi-select from the toolbar, navigate overlays with Tab/Shift+Tab, use Esc everywhere, and hear announcements for major state changes.”

## 5. Functional Requirements
### 5.1 CRUD Parity & Focus Behaviour
- Quick add opens the full edit drawer immediately; edits reflect instantly in the UI (frontend scope) without backend persistence.
- `Esc` closes the edit drawer and returns focus to the associated row/trigger.
- Dismiss/restore available both individually and via bulk edit; timeline receives timestamped system badges.
- Ensure manager field remains absent; update metadata `previousStatus` only when needed for UI flow.

### 5.2 Bulk Edit Completeness
- Add matrix sections for tags (add/replace/remove), reserve skills, and comments with timeline integration.
- Surface scheme history context in the drawer (read-only) so agents can audit previous assignments; no backend writes required.
- Multi-select semantics mirror WFM: toolbar button enters selection mode, rows expose checkboxes, matrix opens from the same control (no Ctrl-click dependency).

### 5.3 Import / Export Accuracy
- Exports: generate CSVs for `Отпуска` (Appendix 5) and `Теги` (Appendix 6) using mock data; include messaging when no rows available.
- Imports: validate file extension and required headers per category; show success/error toasts via aria-live.
- Provide backlog note to integrate backend once ready.

### 5.4 Accessibility & Feedback
- All overlays honour Esc (filters, bulk edit, tag manager, import/export, quick add, edit drawer).
- aria-live region announces selection counts, dismiss/restore outcomes, import/export statuses.
- Run and document manual screen-reader sweep (NVDA/VoiceOver) covering toolbar → drawer → modals.

## 6. Technical Tasks
1. Ensure quick-add → edit flow renders updates in the UI (no backend persistence expected); include Playwright coverage for dismiss/restore and tag edits.
2. Extend bulk-edit matrix UI with tags/reserve skills/comments; display scheme history from seed data in drawer read-only sections.
3. Convert tag manager into a true catalogue window (create/delete without selection) while gating `Применить` when nothing is selected.
4. Implement export logic for vacation/tag CSVs, reuse for selected/all rows, and assert file contents via tests.
5. Enhance import validation to check extensions and required headers; show errors in modal + live region.
6. Replace checkbox-as-primary multi-select with “Массовое редактирование” selection mode toggle (toolbar enters selection, matrix opens from same control).
7. Add Playwright coverage: selection toggle, tag matrix, import error, export CSV checks, dismiss/restore timeline.
8. Update docs (walkthrough, handoff, PRD status) with new behaviours and keyboard steps.
9. Document non-persistent nature of edits and outline backend integration handoff.

**Progress (07 Oct 2025):** Tasks 2, 3, 5, and 7 now covered — scheme history renders in the drawer, tag manager honours the four-tag cap, import validation checks extensions/headers (Теги + Отпуска) with success/error toasts, and Playwright covers selection mode, tag-limit guard, skills/reserve replace, and import failure/success flows.

## 7. Acceptance Criteria
- Editing a field updates the UI immediately; quick add + Esc flows match WFM (frontend scope).
- Bulk edit supports status/team/hour norm/work scheme/tags/skills/reserve skills/comments with timeline entries.
- Tag manager accessible without selection; tag limit enforced with messaging.
- Exports download CSV files for all categories; imports accept correct templates and reject invalid ones with messages.
- Selection mode mirrors WFM (toolbar toggle, row click opens drawer, checkboxes appear only in selection mode).
- All overlays close on Esc and restore focus; aria-live announces key events.
- Playwright suite covers new flows and passes; manual screen-reader notes captured in handoff.
- Documentation explicitly states that edits remain front-end only until backend integration.

## 8. Risks & Mitigations
- **State drift:** Add automated tests for edit persistence and multi-select to catch regressions.
- **ARIA regressions:** Validate live-region messaging with screen readers before sign-off.
- **Mock data mismatch:** Keep fixtures (`INITIAL_EMPLOYEES`) aligned with scheme history requirements to avoid timeline inconsistencies.

## 9. Deliverables
- Updated source (`src/App.tsx`, `src/components/EmployeeListContainer.tsx`, `src/components/EmployeeEditDrawer.tsx`, `src/components/QuickAddEmployee.tsx`, tests) meeting acceptance criteria.
- Revised documentation (`docs/SOP/ui-walkthrough-checklist.md`, `docs/SESSION_HANDOFF.md`, `docs/PRD_STATUS.md`).
- Playwright artefacts demonstrating new coverage.
