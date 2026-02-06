# Task – Manager Portal Parity Remediation (2025-10-27 · 14:30)

## Context
- Latest UAT sweep: `docs/Archive/UAT/2025-10-27_manager-portal_parity-sweep.md`
- Current deploy: https://manager-portal-demo-dpxk5jk50-granins-projects.vercel.app
- Findings recorded in `docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md`
- No backend services available; all parity fixes must be front-end prototypes with mocked data.

_Status 2025-10-31:_ ✅ Executor implemented schedule tabs, approvals disposition, reports queue, and localisation per this brief (see SESSION_HANDOFF + Findings table). Remaining notes below kept for historical context.

## Objective
Produce a Scout/Plan package that maps the gaps identified in the 2025-10-27 UAT report to implementable front-end work. The outcome should enable an Executor to bring the Manager Portal demo to behavioural parity with the real Naumen system and pass parity_static + trimmed_smoke on the next UAT cycle.

## Required Reading
1. `docs/Archive/UAT/2025-10-27_manager-portal_parity-sweep.md`
2. `docs/Workspace/Coordinator/manager-portal/{CodeMap.md,UAT_Findings_2025-10-13_template.md}`
3. `docs/Tasks/manager-portal_parity-scout-2025-10-26-codex.task.md` (previous discovery)
4. Manuals staged for UAT briefing (`CH2_Login_System.{md,pdf}`, `CH3_Employees.{md,pdf}`, `CH5_Schedule_Advanced.{md,pdf}`, `CH6_Reports.{md,pdf}`)
5. Relevant SOPs: `docs/SOP/code-change-plan-sop.md`, `docs/SOP/demo-refactor-playbook.md`, `docs/SOP/plan-execution-sop.md`

## Deliverables
- A refreshed parity plan (Planner role) capturing scopes below with file:line targets and mock data strategy.
- Updated Coordinator artifacts:
  - Append new rows to `UAT_Findings_2025-10-13_template.md` with acceptance criteria for each gap (Schedule, Reports, Approvals, Localisation, Extras decision).
  - Update `docs/Workspace/Coordinator/manager-portal/CodeMap.md` annotations for any planned new components/wrappers.
- Task handoff summary in `docs/SESSION_HANDOFF.md` + tracker row in `docs/Tasks/post-phase9-demo-execution.md`.

## Scope Breakdown (front-end only)
1. **Schedule Module Parity**
   - Replace placeholder page with mocked schedule grid reflecting CH5 sub-tabs (Graph, Shifts, Schemes, Requests, Monitoring, Tasks, Events, Vacations).
   - Implement date-range filter, queue selector, unpublished-changes badge.
   - Prototype request tabs inside schedule for parity with production navigation.

2. **Approvals Workflow Alignment**
   - Split requests into Schedule Change vs Shift Swap views; add status/date filters.
   - Extend approve/reject dialog with shift transfer/delete options and mandatory rejection reason.
   - Surface request history and mass-processing banner actions per CH5 §5.4.

3. **Reports Catalogue & Exports**
   - Replace three-card placeholder with full report list (Work schedule, Daily schedule, Employee schedule, T‑13, Punctuality, Total Punctuality, Build Journal, Licenses).
   - Stub CSV/XLSX downloads (mocked payload) and RU descriptions per CH6.

4. **Navigation & Shell Extras Review**
   - Decide whether to keep dashboard/teams modules as “value add” or gate behind feature flag; document recommendation.
   - Add notification bell/unpublished change badge and Work Structure drawer behaviour matching production.

5. **Localisation Cleanup**
   - Audit remaining English strings (dashboard pie legend, schedule/settings placeholders, team modal tags, export filenames) and specify RU replacements.

6. **UAT Readiness**
   - Draft updated UAT packs if new flows require coverage.
   - Plan mock data updates (`src/data/mockData.ts`) and adapter/tests to validate new behaviour without backend.

## Acceptance Criteria (for this planning task)
- Parity plan enumerates tasks above with component/file references, mock data notes, test strategy, rollback guidance, and UAT/deploy instructions.
- Findings table updated with actionable acceptance statements and owner placeholders.
- Coordinator + tracker docs reflect the new remediation cycle and target next UAT window.

## Next Steps After Plan
- Assign Executor to implement plan.
- Run parity_static + trimmed_smoke, capture narrative evidence, and schedule follow-up UAT agent pass.
