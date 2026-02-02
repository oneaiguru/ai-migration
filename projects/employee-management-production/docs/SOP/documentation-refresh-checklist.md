# SOP – Documentation Refresh Checklist (End of Session)

Use this sequence whenever a session involves notable UI/code changes or a parity validation run. It keeps the written guidance, evidence, and handoff notes aligned before the next agent takes over.

## 1. Capture Evidence & References
- [ ] Append new desktop validation reports to `docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md` and note the latest canonical file.
- [ ] Update `docs/SCREENSHOT_INDEX.md` with any new captures (include placeholder rows if screenshots will be taken in the next session).
- [ ] Reference the latest report(s) inside relevant PRDs (`docs/Tasks/phase-*.md`) and `docs/SESSION_HANDOFF.md`.

## 2. Update Planning Surface Area
- [ ] Roll the day’s accomplishments into `docs/SESSION_SUMMARY.md` and the dated log within the parity plan.
- [ ] Update the relevant task specs in `docs/Tasks/` (status badge, links to latest handoff) and reflect outcomes in `docs/PRD_STATUS.md`. Touch `docs/Archive/Tasks/00_parity-backlog-and-plan.md` only when Phase 1–5 history changes.
- [ ] Refresh `docs/TODO_AGENT.md` with the focused next-step list and command guardrails.

## 3. SOPs & Onboarding Docs
- [ ] Ensure `docs/README.md`, `docs/System/documentation-index.md`, and `docs/System/documentation-structure.md` point to new or relocated docs.
- [ ] Update `docs/SOP/ui-walkthrough-checklist.md` and `docs/SOP/session-prep-and-handoff.md` if steps or commands changed.
- [ ] Add cross-links to this checklist wherever end-of-session routines are mentioned (hand-off docs, SOPs).

## 4. Archive & Cleanup
- [ ] Move superseded plans or handoffs into `docs/Archive/` with a clear banner pointing to the latest reference.
- [ ] Record deployment/test commands in `docs/SESSION_HANDOFF.md`; note when preview was (or was not) run.
- [ ] Confirm the repo is clean (no leftover `test-results/` or temporary assets) before committing.

## 5. Verification
- [ ] Run `npm run build` and `npm run test -- --reporter=list --project=chromium --workers=1` (or document why not).
- [ ] Commit documentation updates alongside any code changes so the history stays coherent.

Check off each section before declaring the session complete. This keeps parity artefacts, SOPs, and handoff guidance in lockstep with the implemented build.
