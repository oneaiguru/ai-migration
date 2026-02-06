# Post-Phase 9 Demo Execution Roadmap (Phases A–C)

> Scope: Work that begins **after Phase 9 – Scheduling Behavior Parity** wraps and the second demo handoff is complete. These phases organise refactor/parity execution across the remaining demos, using the existing SOP stack (`docs/SOP/plan-execution-sop.md`, `docs/SOP/demo-refactor-playbook.md`, `docs/SOP/docs-coordinator-workflow.md`).

## Phase A – Manager Portal Refactor-First
- **Objective**: Replace Recharts usage with shared Chart.js wrappers (BarChart, DoughnutChart, KpiCardGrid, ReportTable, Dialog) while preserving existing layout.
- **Primary plan**: `plans/2025-10-12_manager-portal-refactor.plan.md`
- **Inputs**:
  - Canonical evidence in `docs/System/DEMO_PARITY_INDEX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`
  - UAT guidance: `docs/Tasks/uat-packs/parity_static.md`, `docs/Tasks/uat-packs/trimmed_smoke.md`, `docs/Tasks/uat-packs/chart_visual_spec.md`
  - Playbook notes: `docs/SOP/demo-refactor-playbook.md` (Manager Portal section)
- **Dependencies**: Phase 9 scheduling work complete; wrapper library stable per Phase 7 notes.
- **Exit criteria**:
  - Adapter/stories/tests added per plan
  - UAT packs validated; unknowns logged
  - SESSION_HANDOFF + PROGRESS updated with results

## Phase B – Analytics Dashboard Refactor-First
- **Objective**: Extract CDN Chart.js + inline React demos into React components wired to shared wrappers (LineChart, DoughnutGauge, HeatmapChart, RadarChart, ReportTable, KpiCardGrid) with RU locale support.
- **Primary plan**: `plans/2025-10-12_analytics-extraction.plan.md`
- **Inputs**: Same evidence reports + Analytics entries in UAT packs and playbook.
- **Additional references**: `docs/System/DEMO_EXECUTION_DECISION.md` (risks, reuse%)
- **Exit criteria**:
  - Components encapsulated inside repo (no CDN dependency)
  - Wrappers hydrated with adapters & tests
  - Visual/behavior gaps documented in UAT packs and `docs/Tasks/uat-packs/chart_visual_spec.md`

## Phase C – WFM Employee Portal Parity-First
- **Objective**: Wire forms/tables/dialog behaviours using shared wrappers, validations, and RU formatting per parity requirements.
- **Primary plan**: `plans/2025-10-12_employee-portal-parity.plan.md`
- **Inputs**: Portal sections in reports, UAT packs, screenshot checklist.
- **Focus areas**:
  - Form validation/masks (Profile + New Request)
  - RU date/number formatting helpers
  - ReportTable + Dialog integrations, FilterGroup behaviour
- **Exit criteria**:
  - Behaviours validated via parity_static + trimmed_smoke UAT packs
  - Appendix 1 statuses confirmed/updated as needed
  - Documentation + handoff updated with evidence

## Execution Protocol
1. **Role assignment**: For each phase, designate Planner/Executor per SOP. Planner updates/augments the corresponding plan if scope shifts; Executor follows `docs/SOP/plan-execution-sop.md`.
2. **Required Reading**: Agents must review `PROGRESS.md`, this roadmap, the relevant plan, and the CE prompts/SOPs for their role before touching files.
3. **Documentation updates**: After each phase, update:
   - `docs/SESSION_HANDOFF.md` (new section per phase)
   - `PROGRESS.md` (Docs/Coordinator + Active Plan summaries)
   - `docs/System/parity-roadmap.md` (mark phase complete & note learnings)
4. **Verification**: Run `npm run build`, applicable unit/e2e tests, and UAT scripts specified in the plan. Log results under Test Log in `PROGRESS.md`.
5. **Handoff**: Use `docs/SOP/session-prep-and-handoff.md` to ensure all evidence, screenshots, and plan statuses are captured.

### UAT Findings → Task (simple handoff)
- After each UAT pass, create a short findings task using `docs/Workspace/Templates/13_UAT_Findings_Task.md` in the demo’s Coordinator folder. This becomes the next pass input for the same or next agent.
- Keep it outcome‑based: link the deploy URL, paste the checks table, list fixes/tests/docs, and define acceptance.
- See pipeline: `docs/SOP/agent-pipeline-3plus1.md`.

## Agent Assignments & Outcomes (Single Agent per Demo)
> One agent per demo at a time. Identify role and work to the outcome; no timebox language.

Agent ID format
- Use human‑readable IDs per `docs/SOP/agent-id-conventions.md`:
  - `<demo-slug>-<role>-<yyyy-mm-dd>-<handle>` (e.g., `analytics-dashboard-exec-2025-10-13-am`)

| Demo | Repo Var | Role | Agent | Status | Deploy URL | Outcome |
| --- | --- | --- | --- | --- | --- | --- |
| Manager Portal | `${MANAGER_PORTAL_REPO}` | Executor | manager-portal-exec-2025-11-02-codex | Completed – UAT Pass 2025-11-02 | https://manager-portal-demo-doeresnrv-granins-projects.vercel.app | Follow-up delivered schedule requests presets, approvals history presets, download queue lifecycle, docs/CodeMap/UAT updated; remaining localisation: Settings helper text. |
| Analytics Dashboard | `${ANALYTICS_REPO}` | Executor | analytics-dashboard-exec-2025-10-27-codex | Completed – UAT Pass 2025-10-27 | https://analytics-dashboard-demo-3lsuzfi0w-granins-projects.vercel.app | Forecast builder/absenteeism/reports shipped; `npm run ci` + Playwright artifacts logged; docs/CodeMap/Progress/Handoff updated |
| WFM Employee Portal | `${EMPLOYEE_PORTAL_REPO}` | Executor | employee-portal-exec-2025-11-02-codex | Completed – Awaiting UAT rerun 2025-11-03 | https://wfm-employee-portal-8h7oh0j1z-granins-projects.vercel.app | Period history dialog + RU localisation (DateField + locale catalog) shipped; `npm_config_workspaces=false npm run build` & `npm_config_workspaces=false npm run test -- --run` ✅. Update parity_static/trimmed_smoke + findings on this deploy. |
| Forecasting & Analytics | `${FORECASTING_ANALYTICS_REPO}` | Executor | forecasting-analytics-exec-2025-10-29-codex | Completed – UAT Pass 2025-10-29 | https://forecasting-analytics-p6z0l224h-granins-projects.vercel.app | React 18.3.1 pinned; stray hook fixed; `npm ci` + smoke pre/post deploy; parity_static + chart_visual_spec Pass. |

### Agent Header (paste at top of PR/CodeMap/Handoff)
```
Agent: <name> · Role: Executor · Demo: <Manager|Analytics|Employee>
Repo: ${MANAGER_PORTAL_REPO}|${ANALYTICS_REPO}|${EMPLOYEE_PORTAL_REPO}
Plan: plans/<matching‑plan>.md · Deploy: <url> · Commit: <sha>
Outcome: Deploy + UAT Pass + System reports + Checklist + CodeMap updated
```

### Handoff Checklist (every pass)
- Update System reports + canonical checklist
- Paste deploy URL + summary into `docs/SESSION_HANDOFF.md`
- Update Code Map with file:line evidence
- Add 1–2 entries to `docs/System/learning-log.md`
- Append new screenshots to `docs/SCREENSHOT_INDEX.md` (use aliases)

## Tracking Table
| Phase | Demo | Mode | Status | Primary Owner | Key Docs |
| --- | --- | --- | --- | --- | --- |
| A | Manager Portal | Refactor-first | Completed – schedule requests/approvals presets/queue lifecycle 2025-11-02 | manager-portal-exec-2025-11-02-codex | plan, reports, UAT packs |
| B | Analytics Dashboard | Refactor-first | Completed (Storybook + Playwright coverage live) | Executor (this session) | plan, reports, UAT packs |
| C | WFM Employee Portal | Parity-first | Completed – period history filters + RU placeholders 2025-11-02 (UAT rerun pending) | employee-portal-exec-2025-11-02-codex | plan, reports, UAT packs |

Update this file after each phase to reflect status changes (e.g., In Progress, Completed) and cross-link new evidence or follow-up tasks.

## Unified Demo Pilot – Assignments (Employees + Scheduling)
> Goal: mount two demos under one shell with `/employees` and `/schedule` routes (single deploy). See `plans/2025-10-15_unified-demo-pilot.plan.md`.

| Role | Agent | Status | Repo | Key Docs |
| --- | --- | --- | --- | --- |
| Integrator | unified-demo-exec-2025-10-14-codex | Completed – shell chrome + auth shipped 2025-10-14 | `${UNIFIED_DEMO_REPO}` | plan, unified CodeMap, Coordinator README |
| Employees Prep | employee-management-exec-2025-10-13-codex | Completed – package exports delivered | `${EMPLOYEE_MGMT_REPO}` | employees prep task |
| Scheduling Prep | scheduling-exec-2025-10-13-tbd | Completed – package exports delivered | `${SCHEDULE_REPO}` | scheduling prep task |

Updated shell deploy: https://wfm-unified-demo-p1prfmmh7-granins-projects.vercel.app (role-aware nav + login).
