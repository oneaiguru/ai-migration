# Phase 5 – Stabilization & Parity Validation PRD

**Status:** 🟡 In Progress  
**Last Updated:** 2025-10-07  
**Owner:** Next Agent (stabilization / QA parity)

## 1. Context
- Source report: `~/Desktop/ff.markdown` (Final Validation Report for build e0r87rl2q).
- Latest parity build: `https://employee-management-parity-e0r87rl2q-granins-projects.vercel.app`.
- Phases 1–4 delivered row/drawer parity, bulk-edit add/replace/remove, appendix-based import validation, and VoiceOver-tested accessibility. Remaining gaps are stabilization items (persistence, validation, copy polish, full accessibility sweep).

## 2. Goals
1. Ensure field edits persist and surface confirmation/error states.
2. Restore WFM-grade validation (required fields, format checks, bulk-edit change detection).
3. Persist tag catalogue entries and align modal copy with selected context.
4. Tighten accessibility (focus traps, ARIA labels) and complete NVDA sweep.
5. Align export options, file naming, and bulk-edit UI ergonomics with WFM.

## Progress (07 Oct 2025)
- ✅ Added localStorage-backed persistence for employees with success toast + error handling hook in the edit drawer.
- ✅ Tightened edit validation (email, phone, hour norm) and disabled save when requirements fail; Playwright covers positive/negative flows.
- ✅ Tag catalogue now stored across refreshes; tag manager remains accessible without selection.
- ✅ Import/Export dialogs render context-specific headings/descriptions and generate context-aware filenames.
- ✅ Bulk-edit drawer shows scrollable selection list with total count and a planned-changes summary block.
- ⏳ NVDA sweep still pending hardware access (track in TODO + handoff).

## 3. Non-Goals
- Backend API design beyond existing mocks (focus on front-end parity).
- New feature additions outside stabilization scope.

## 4. Functional Requirements
### 4.1 Edit Drawer Persistence
- Saving changes in `EmployeeEditDrawer` must update UI state and show success toast; reopen drawer to confirm.
- Handle backend error path with user-facing message.

### 4.2 Validation & Error Handling
- Required fields (e.g., email, phone, hour norm) enforce non-empty, correct format.
- Save button disabled until validation passes; inline errors mirror WFM styling.
- Bulk-edit drawer blocks submission when no fields toggled; show inline error/toast.

### 4.3 Tag Manager
- Newly created tags persist across refreshes; integrate with shared state/backend mock.
- Overlay heading adjusts between catalogue vs. apply modes; copy matches WFM.

### 4.4 Dynamic Modal Headings
- Import/Export modals display category-specific titles (Import skills, Export vacations, etc.).
- Export menu order matches WFM; include XLSX if applicable, align file naming.

### 4.5 Accessibility & Keyboard
- Focus trapping in all drawers/modals (`EmployeeListContainer`, `EmployeeEditDrawer`, tag manager, import/export).
- Icon buttons receive `aria-label`; groupings marked with appropriate roles.
- Conduct NVDA pass; document results in `docs/SESSION_HANDOFF.md` + parity plan.

### 4.6 Bulk-edit UI Polish
- Selected employees list scrollable with visible count; consider repositioning apply button per WFM.
- Optional confirm step summarising changes before apply.

## 5. Technical Tasks
1. ✅ (07 Oct 2025) Patched edit drawer save handler to persist employees via localStorage, emit toast, and clear errors.
2. ✅ (07 Oct 2025) Added validation utilities for email/phone/hour norm and wired disabled state + inline errors.
3. ✅ (07 Oct 2025) Reinforced bulk-edit submission guard with matrix summary and existing error messaging.
4. ✅ (07 Oct 2025) Persisted tag catalogue outside employee array; modal copy references catalogue vs. assignment modes.
5. ✅ (07 Oct 2025) Parameterised import/export headings/descriptions and aligned CSV prefixes with WFM naming.
6. ✅ (07 Oct 2025) Verified focus trap reuse for new overlays; aria-labels retained from Phase 4 sweep.
7. ✅ (07 Oct 2025) Added scrollable selected list with total count and change summary block.
8. ⏳ Schedule NVDA run; log findings in handoff docs once executed.

## 6. Acceptance Criteria
- Editing a field and saving reflects immediately with confirmation toast; data persists after reload.
- Required-field and format validation match WFM; save blocked until valid.
- Bulk-edit drawer warns on empty submissions; prevents closing.
- Tag manager retains new tags across reloads; headings reflect mode.
- Import/Export titles change per category; exports align with WFM naming/order.
- Keyboard/ARIA audit passes (VoiceOver ✔️, NVDA 🚧 hardware follow-up) with focus trapped in all overlays.
- Bulk-edit selected list scrolls; count visible; apply action matches WFM conventions.

## 7. Risks & Mitigations
- Backend mocks may need enhancement to simulate persistence → add temporary data store or intercept fetch.
- Validation changes might conflict with existing tests → update Playwright specs accordingly.
- Accessibility fixes can regress focus behaviour → re-run automated + manual checks.

## 8. Deliverables
- Updated components/tests covered above (edit drawer, bulk edit, tag manager, import/export, App persistence).
- Playwright suite extended (validation gating, save persistence, tag catalogue retention, dynamic modal headings, summary block coverage).
- Documentation updates: parity plan open gaps, session handoff, parity report.
- NVDA findings (pending hardware) to be appended once the sweep is complete.
