# Task — Manager Portal Parity Follow-Up (2025-11-01)

## Context
- Latest UAT sweep: `/Users/m/Desktop/k/k.md`, `docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md`.
- Illustrated guides: `docs/System/manager-portal_illustrated-guide.md` (dev) and `uat/manager-portal_illustrated-walkthrough.md` (UAT).
- New production captures staged under `docs/UAT/real-naumen/2025-11-01_manager-portal/`; aliases registered in `docs/SCREENSHOT_INDEX.md`.

## Goal
Close remaining behaviour gaps between the Manager Portal parity demo and the Naumen production system (schedule requests tab, approvals filters/history, download queue lifecycle, vacations/events parity, RU localisation). Outcome = parity_static + trimmed_smoke Pass, docs updated, and deploy published.

---

## Scout (Discovery)
- **Read**: `PROGRESS.md`, `docs/System/context-engineering.md` (Scout), `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`, `${CE_MAGIC_PROMPTS_DIR}/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`, this task file, illustrated guide + walkthrough, `docs/Archive/UAT/2025-10-31_manager-portal_parity-review.md`, `/Users/m/Desktop/k/k.md`.
- **Do**:
  1. Refresh discovery notes (`docs/Workspace/Coordinator/manager-portal/UAT_Findings_2025-10-13_template.md`) with MP IDs for any new gaps.
  2. Update `docs/Workspace/Coordinator/manager-portal/CodeMap.md` sections (Schedule requests, Approvals filters/history, Reports queue, Events/Vacations, Settings flag) with file:line evidence using the illustrated guide.
  3. Flag localisation items in `docs/Workspace/Coordinator/manager-portal/Localization_Backlog.md` (e.g., queue summary copy, report filenames).
  4. Add learning-log entries (`docs/System/learning-log.md`) highlighting production behaviours not yet covered by tests or wrappers.
- **Deliverable**: `docs/Tasks/manager-portal_parity-followup-2025-11-01-scout-<id>.task.md` summarising findings + blockers. Update tracker row (`docs/Tasks/post-phase9-demo-execution.md`).

## Planner (Plan Authoring)
- **Read**: Scout deliverable, this task file, illustrated guide, UAT walkthrough, `docs/SOP/code-change-plan-sop.md` (planning section), `${CE_MAGIC_PROMPTS_DIR}/PLAN-USING-MAGIC-PROMPT.md`.
- **Do**:
  1. Draft `plans/2025-11-XX_manager-portal-parity-followup.plan.md` with phased work: data/adapters, UI parity, approvals enhancements, download queue lifecycle, settings/localisation, docs+UAT updates.
  2. Reference code artifacts (e.g., `src/adapters/scheduleRequests.ts`, `src/pages/Approvals.tsx`, `src/state/downloadQueue.tsx`) and manual line citations.
  3. Include validation commands (`npm_config_workspaces=false npm run test -- --run --test-timeout=2000`, `npm_config_workspaces=false npm run build`, preview smoke, UAT packs) and rollback.
  4. Log planner handoff in `docs/SESSION_HANDOFF.md` + tracker.

## Executor (Implementation)
- **Read**: Planner plan, `docs/SOP/plan-execution-sop.md`, `${CE_MAGIC_PROMPTS_DIR}/EXECUTE-WITH-MAGIC-PROMPT.md`, illustrated guide, UAT walkthrough.
- **Do**:
  1. Execute plan verbatim in `${MANAGER_PORTAL_REPO}` (feature branch). Keep Settings feature flag default off unless instructed.
  2. Expand mocks (`src/data/mockData.ts`) to cover event fields, vacation actions, report catalogue, and queue metadata.
  3. Implement schedule requests table, approvals filter/history parity, download queue lifecycle, and RU localisation fixes per plan.
  4. Add/extend unit tests (`src/adapters/scheduleRequests.test.ts`, `src/pages/__tests__/Approvals.test.tsx`) to cover new logic.
  5. Run validations with explicit timeouts:
     - `npm_config_workspaces=false npm run test -- --run --test-timeout=2000`
     - `npm_config_workspaces=false npm run build`
     - `npm run preview -- --host 127.0.0.1 --port 4174` (manual smoke: schedule requests, approvals history, download bell)
  6. Deploy via `vercel deploy --prod --yes`.
  7. Re-run Manager Portal sections of `docs/Tasks/uat-packs/parity_static.md` and `docs/Tasks/uat-packs/trimmed_smoke.md`; capture new screenshots if behaviour changed and update `docs/SCREENSHOT_INDEX.md`.
  8. Update docs: CodeMap, Findings, Localization backlog, `docs/System/{DEMO_PARITY_INDEX.md,WRAPPER_ADOPTION_MATRIX.md,CHART_COVERAGE_BY_DEMO.md,PARITY_MVP_CHECKLISTS.md}`, `docs/Reports/PARITY_MVP_CHECKLISTS.md`, `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`, `docs/SESSION_HANDOFF.md`, tracker.
- **Deliverable**: Clean working tree with committed changes, deploy URL, and updated documentation set.

## Acceptance
- parity_static + trimmed_smoke Pass captured in consolidated sweep.
- Download queue, schedule requests, approvals history filters, events/vacations actions, and localisation match production captures listed in the illustrated guide.
- Documentation and screenshot index fully refreshed; tracker row marked Completed.
