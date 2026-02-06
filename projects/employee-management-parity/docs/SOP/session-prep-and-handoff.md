# SOP – Session Prep & Handoff Checklist

Follow this procedure before pausing work or handing the repo to the next agent.

## 1. Confirm Code State
- [ ] Run `npm run build` and ensure it passes without warnings.
- [ ] Run `npm run test -- --reporter=list --project=chromium --workers=1` (or targeted Playwright suites) and record results.
- [ ] Note any failing checks in `docs/SESSION_HANDOFF.md` with a pointer to the relevant PRD item.

## 2. Update Planning Docs
- [ ] Review active PRDs (`docs/PRD_STATUS.md`) and mark progress/status changes.
- [ ] Update the appropriate task specs in `docs/Tasks/` (status badge, TODOs, links to the latest handoff). Touch the archived backlog (`docs/Archive/Tasks/00_parity-backlog-and-plan.md`) only when modifying Phase 1–5 history.
- [ ] If a new PRD slice is required, create it under `docs/Tasks/phase-<n>-<slug>-prd.md` and register it in the status table.

## 3. Capture Implementation Notes
- [ ] Refresh `docs/SESSION_HANDOFF.md` (our CE message log):
  - Summary of changes landed this session.
  - Outstanding tasks per PRD/backlog with file pointers and role guidance for the next agent.
  - Verification commands executed (build/tests) and their outcome.
  - Archive older sections under `docs/Archive/` if the file grows unwieldy.
- [ ] Update `docs/SOP/ui-walkthrough-checklist.md` if workflows changed.
- [ ] Note whether preview was required; only run `npm run preview -- --host 127.0.0.1 --port 4174` when expressly requested.
- [ ] Archive any superseded evidence files under `docs/Archive/` (date-stamped).

## 4. Prepare Agent Guidance
- [ ] Ensure `AGENTS.md` references the latest PRDs/backlog items and role expectations (`docs/System/context-engineering.md`).
- [ ] Provide file/offset guidance in the handoff (e.g., `src/components/EmployeeListContainer.tsx:120-1960`) along with the role the next agent should assume.
- [ ] Highlight blockers or assumptions from browser-agent reports (bb/cc/dd) and link to the relevant sections.
- [ ] If the next step is an AI/browser UAT pass:
  - Draft the message using `docs/Tasks/uat-packs/PromptUATparity.md` as a template and save it to `uat-agent-tasks/<demo>_s<session#>_m<message#>_<yyyyMMdd-HHmm>.txt`. Put the Vercel deploy URL and the production OIDC login block at the top of the prompt so the agent sees the targets immediately.
  - Copy only the required references for that demo (crosswalk file, `parity_static.md`, `trimmed_smoke.md`, plus the CH chapters cited in the crosswalk). When both Markdown and PDF versions of a chapter exist, include both in `~/Desktop/tmp-<demo>-uat/`. Note the exact list and source paths in your handoff so the next coordinator knows what was staged.
  - In the prompt, instruct the agent to study the attached manuals first, plan their navigation (with scene anchors from the PDFs), and compare the real Naumen instance and the Vercel demo in parallel while taking notes. Require plain-text evidence (pass/fail table, scene descriptions, localisation notes) so you can paste the results back into Findings/trackers.
  - After dispatching the prompt, log the folder path and prompt filename in `docs/SESSION_HANDOFF.md` alongside any follow-up actions.

## 5. Repository Hygiene
- [ ] Remove transient artefacts (`dist/`, `test-results/`, screenshots) that shouldn’t be committed.
- [ ] Verify `git status` is clean or staged appropriately before handing off.
- [ ] Tag any new helper utilities (e.g., shared hooks) in `docs/System/project-structure.md` if structure changed.

## 6. Future Module Staging (Optional)
- [ ] If parity work impacts upcoming modules (Schedule, Reporting, Forecasting, Personal Portal), log a note in `docs/System/parity-roadmap.md`.
- [ ] Capture cross-module learnings (e.g., selection-mode pattern) to reuse later.

Completing this checklist ensures the next agent can resume work without re-discovery or duplicated effort.

## 7. Limited Access Contingencies
- Always attempt to authenticate to the real system first using the credentials/roles listed in the parity pack.
- If login still fails (bad credentials, missing role, maintenance outage), stop and document it before proceeding with UAT.
  - Log the failure in your UAT findings and `docs/SESSION_HANDOFF.md`, including the URL, credentials used, error messages, and which role was denied.
  - Fall back to the staged manuals/screenshots only after recording the failure, and state clearly in your results that behaviour was verified against reference docs rather than the live portal.
  - Add a learning-log entry (`docs/System/learning-log.md`) so future agents see the restricted-access context.
  - Flag the issue in `PROGRESS.md` (Current State) so the owner/coordinator can restore access before the next pass.
- Never attempt unauthorised workarounds; documentation + escalation keeps the parity record trustworthy.
