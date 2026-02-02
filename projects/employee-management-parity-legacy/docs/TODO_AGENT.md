# Targeted Follow-Up Tasks (Post 9o205nrhz Validation)

This checklist summarises the outstanding gaps from the comprehensive parity review (`~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`). Work inside `~/git/client/employee-management-parity` only. Follow the Magic Prompt guidelines in `AGENTS.md` before starting.

## Completed to Date
- Phase 1 (Bulk edit & tag parity) – dataset expansion, quick add login/password flow, toolbar + edit drawer parity.
- Phase 2 (Interaction polish) – selection mode, scheme history readout, dismiss/restore parity, navigation labels aligned.
- Phase 3 (CRUD/data parity) – bulk-edit matrix across all sections, tag-cap enforcement, import validation (extensions + headers), Playwright coverage for selection/tags/imports.
- Phase 4 (Accessibility polish) – focus/Esc parity across overlays, VoiceOver sweep, docs refreshed.
- Phase 5 (Stabilization – in progress) – localStorage-backed persistence with toast/error handling, validation gating for save, tag catalogue persistence, context-aware import/export headings, bulk-edit summary/count, new Playwright coverage. NVDA + screenshot backlog remain.

## Outstanding Work – Phase 5 Wrap-Up

### 1. NVDA Regression Pass (Severity A)
- **Files**: `src/components/EmployeeListContainer.tsx`, `src/components/EmployeeEditDrawer.tsx`, `src/components/QuickAddEmployee.tsx`, `src/hooks/useFocusTrap.ts`.
- Mirror the VoiceOver audit with NVDA when hardware is available; log findings in `docs/SESSION_HANDOFF.md` and update SOPs if reading order changes.

### 2. Screenshot Backfill Instructions (Severity B)
- **Purpose:** Provide the browser agent with repeatable steps; they can capture during their next review.
- **Selection-mode banner** – `Tab` to “Массовое редактирование”, press `Space` to enter selection mode, `Tab` to the first body row and press `Space` to select. Confirm the blue banner + toolbar state, then capture.
- **Dismiss/restore timeline** – Activate the first row (`Enter`), choose “Уволить”, check “Показывать уволенных”, reopen the same employee, choose “Восстановить”, then open the timeline panel and capture the system entries.
- **Tag-limit alert** – Select one row, open “Теги”, choose “Добавить всем”, pick four existing tags, attempt to add a fifth (keyboard focus on the checkbox list) and capture the red alert.
- Register new filenames in `docs/SCREENSHOT_INDEX.md` once captures are produced.

### 3. Post-Parity Planning (Severity C)
- Align with product/backend on the next parity module (Schedule/Reporting) and confirm API integration milestones once NVDA closes.
- Ensure updated documentation (parity plan, SOPs, parity report) ships alongside the screenshot drop.

### 4. Upcoming – Migration Planning (Phase 6)
- Read `docs/Tasks/phase-6-migration-planning-prd.md` after Phase 5 stabilisation to confirm wrapper readiness tasks.
- Before adopting wrappers, finish the accessibility checklist in `migration-prep/ACCESSIBILITY_CHECKLIST.md` and capture Playwright smoke tests for the playground demos.
- Plan NVDA + VoiceOver verification after each migration stage (overlays → table → forms) and log outcomes in `docs/SESSION_HANDOFF.md`.
- Review ADRs 0001–0003 to align on library stack, wrapper ownership, and branch-based rollout before starting Stage 0.

## Operational Checklist
```bash
npm run build
npm run test -- --reporter=list --project=chromium --workers=1
# Run preview only on request: npm run preview -- --host 127.0.0.1 --port 4174
```

## Reference Materials
- Phase 5 task detail: `docs/Tasks/phase-5-stabilization-and-validation-prd.md`
- Phase 4 task detail (for historical context): `docs/Tasks/phase-4-accessibility-and-final-parity.md`
- Comprehensive validation report: `~/Desktop/2025-10-07_09-00_comprehensive-validation-report.markdown`
- Previous audits (now archived): `~/Desktop/2025-10-06_*` (link from `docs/Archive/` after facelift)
- Magic Prompt process: `AGENTS.md`
- Environment guardrails: `docs/ENVIRONMENT_FIX_TODO.md`

Maintain a clean working tree—commit or stash between slices so the diff history stays readable.
