# Task – Manager Portal Parity Follow-up (2025-10-31 · 18:00)

## Context
- Latest UAT report: `docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md`
- Current deploy: https://manager-portal-demo-doeresnrv-granins-projects.vercel.app
- Recent execution pass: `docs/SESSION_HANDOFF.md` entry dated 2025-10-31
- Findings table: `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md`

The demo now mirrors most Naumen behaviours (schedule tabs, approvals disposition, reports catalogue), but the UAT sweep highlighted several gaps we still need to close before handing off to production parity.

## Objective
Produce an updated Scout package that documents the remaining deltas between our demo and the real Naumen portal, with evidence and references that a Planner can turn into an execution plan. Focus on schedule requests parity, approvals filters, download queue UX, and localisation stragglers.

## Required Reading
1. `PROGRESS.md`
2. `docs/System/context-engineering.md` → Scout section + CE prompts in `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md` and `${CE_MAGIC_PROMPTS_DIR}/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
3. SOP: `docs/SOP/code-change-plan-sop.md` (Scout slice)
4. Latest UAT write-up: `docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md`
5. Coordinator assets: `docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md,Localization_Backlog.md}`
6. Manuals for reference: `CH5_Schedule_Advanced.{md,pdf}`, `CH6_Reports.{md,pdf}` (see path conventions)

## Scope & Questions to Answer
1. **Schedule → Заявки sub-tab (missing)**
   - Identify required data fields, filters, and bulk actions from production (CH5 §5.4, live system).
   - Document how the tab should integrate with existing `mockTeams` / approvals data.
2. **Approvals filters alignment**
   - Compare demo vs production status/date filters; capture expected UI/behaviour (checkbox set + period picker, history view).
   - Explain how priority chips should coexist (keep as “extra” or replace?).
3. **Download queue UX**
   - Describe the queue panel behaviour in production (bell badge, drop-down list, status transitions).
   - Outline data/state requirements for our mock download queue to match it.
4. **Localisation gaps**
   - List remaining English tokens (shift status badges, filenames, etc.) with file:line references and RU equivalents.
5. **Extras/decisions**
   - Reassess Dashboard/Settings exposure (flag usage) and note whether they should remain “extra” for the next plan stage.

## Deliverables (Scout)
- Updated discovery notes: `docs/Tasks/manager-portal_parity-followup-2025-10-31-scout-<agent>.task.md`
- Coordinator updates:
  - Append open-gap rows in `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md`
  - Expand Code Map sections (Schedule Requests, Approvals filters, Download queue) with file:line + manual cites
  - Update `Localization_Backlog.md` with the remaining EN → RU replacements
- Handoff summary in `docs/SESSION_HANDOFF.md` and tracker row in `docs/Tasks/post-phase9-demo-execution.md`

## Acceptance Criteria
- Each gap is backed by production evidence (manual cite + real-system observation) and mapped to demo files requiring change.
- Deliverables list above is complete and ready for Planner handoff.
- No code changes this pass; Scout work is documentation/analysis only.

## Notes
- No backend access; all future work stays mock-driven.
- Use the production credentials in the UAT pack to verify behaviours, but do not modify real data.
