# SOP – Session Prep & Handoff Checklist

Follow this procedure before pausing work or handing the repo to the next agent.

## 1. Confirm Code State
- [ ] Run `npm run build` and ensure it passes without warnings.
- [ ] Run `npm run test -- --reporter=list --project=chromium --workers=1` (or targeted Playwright suites) and record results.
- [ ] Note any failing checks in `docs/SESSION_HANDOFF.md` with a pointer to the relevant PRD item.

## 2. Update Planning Docs
- [ ] Review active PRDs (`docs/PRD_STATUS.md`) and mark progress/status changes.
- [ ] Sync `docs/Tasks/parity-backlog-and-plan.md` with newly completed or outstanding work.
- [ ] If a new PRD slice is required, create it under `docs/Tasks/phase-<n>-<slug>-prd.md` and register it in the status table.

## 3. Capture Implementation Notes
- [ ] Refresh `docs/SESSION_HANDOFF.md`:
  - Summary of changes landed this session.
  - Outstanding tasks per PRD/backlog with file pointers.
  - Verification commands executed (build/tests) and their outcome.
- [ ] Update `docs/SOP/ui-walkthrough-checklist.md` if workflows changed.
- [ ] Note whether preview was required; only run `npm run preview -- --host 127.0.0.1 --port 4174` when expressly requested.
- [ ] Archive any superseded evidence files under `docs/Archive/` (date-stamped).

## 4. Prepare Agent Guidance
- [ ] Ensure `AGENTS.md` references the latest PRDs/backlog items.
- [ ] Provide file/offset guidance in the handoff (e.g., `src/components/EmployeeListContainer.tsx:120-1960`).
- [ ] Highlight blockers or assumptions from browser-agent reports (bb/cc/dd) and link to the relevant sections.

## 5. Repository Hygiene
- [ ] Remove transient artefacts (`dist/`, `test-results/`, screenshots) that shouldn’t be committed.
- [ ] Verify `git status` is clean or staged appropriately before handing off.
- [ ] Tag any new helper utilities (e.g., shared hooks) in `docs/System/project-structure.md` if structure changed.

## 6. Future Module Staging (Optional)
- [ ] If parity work impacts upcoming modules (Schedule, Reporting, Forecasting, Personal Portal), log a note in `docs/System/parity-roadmap.md`.
- [ ] Capture cross-module learnings (e.g., selection-mode pattern) to reuse later.

Completing this checklist ensures the next agent can resume work without re-discovery or duplicated effort.
