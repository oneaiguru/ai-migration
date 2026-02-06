# SOP – Converting Browser-Agent Feedback into PRDs

## Purpose
Establish a deterministic workflow for turning browser-agent parity findings (e.g., bb.markdown, AGENT_PARITY_REPORT.md) into actionable Product Requirements Documents (PRDs) and keeping their status current.

## Inputs
- Latest browser-agent run logs (`bb.markdown`, `docs/AGENT_PARITY_REPORT.md`, session transcripts).
- Reference manuals (`CH3_Employees.md`, `CH5_*`, `CH7_Appendices.md`).
- Existing PRDs under `docs/Tasks/*` and the status index (`docs/PRD_STATUS.md`).
- Parity plan and backlog (`docs/EMPLOYEE_MANAGEMENT_PARITY_PLAN.md`; latest tasks live in `docs/Tasks/`, Phase 1–5 history in `docs/Archive/Tasks/00_parity-backlog-and-plan.md`).

## Workflow
1. **Intake & tagging**
   - Download or copy the latest agent report into `docs/SESSION_HANDOFF.md` “Evidence” section.
   - Highlight new findings with severity (A/B/C) and link to supporting screenshots/manual references.

2. **Triage**
   - Compare findings against existing PRDs and backlog.
   - For each unique delta, decide:
     - **Scope update** → amend an existing PRD.
     - **New slice** → create a new PRD file under `docs/Tasks/` (name: `phase-<n>-<short-slug>-prd.md`).
   - Note conflicts or ambiguity in `docs/SESSION_HANDOFF.md` and ping stakeholders before proceeding.

3. **Draft / Update PRD**
   - Use the PRD template sections: Context, Goals/Non-goals, User stories, Functional requirements, Technical tasks, Acceptance criteria, Open questions, Timeline.
   - Reference specific evidence (screenshots, manual pages) inline.
   - Include status metadata at the top (`Status: Draft/In Progress/Completed`, `Last updated`, `Owner`).

4. **Status Tracking**
   - Add or update the entry in `docs/PRD_STATUS.md` (name, scope summary, current status, link, owner, notes).
   - If a PRD moves to “Completed”, ensure the parity plan/backlog reflects the closure or follow-up work.

5. **Communication & Handoff**
   - Update `docs/SESSION_HANDOFF.md` with a summary of new/updated PRDs and remaining open items.
   - When a slice is implemented, document the verification steps (screenshots, tests) in the PRD and mark status accordingly.

## Tools & Conventions
- Keep PRDs in Markdown under `docs/Tasks/`. Use ASCII, wrap external evidence paths in backticks.
- Every PRD change should be accompanied by updates to `docs/PRD_STATUS.md`, parity backlog, and walkthroughs if behaviour changes.
- Screenshot references go through `docs/SCREENSHOT_INDEX.md` only—do not embed absolute paths in PRDs.

## Review Checklist
- [ ] Findings mapped to PRDs or backlog items.
- [ ] `docs/PRD_STATUS.md` updated (status + link).
- [ ] Session handoff includes pointers to changed PRDs.
- [ ] Parity plan/backlog reflect new scope.
- [ ] Screenshots/walkthrough updated for any UI deltas.

Following this SOP keeps documentation synchronized after each browser-agent run and ensures incoming agents have an unambiguous plan.
