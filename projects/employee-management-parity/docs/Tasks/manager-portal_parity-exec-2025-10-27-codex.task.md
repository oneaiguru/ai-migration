
# Task — Manager Portal Parity Execution 2025-10-27

Meta
- Agent: manager-portal-exec-2025-10-27-codex
- Repo: ${MANAGER_PORTAL_REPO}
- Source docs: docs/Workspace/Coordinator/manager-portal/Progress_Manager-Portal_2025-10-14.md, docs/Workspace/Coordinator/manager-portal/CodeMap.md, uat-agent-tasks/manual_manager-portal-crosswalk.md, uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md, /Users/m/Desktop/e.tex

## Goal
Deliver behaviour parity between the manager portal demo and the real Naumen WFM manager shell by implementing the remaining gaps called out in the October parity report.

## Scope (behaviour only)
1. **Navigation parity and unified shell readiness**
   - Mirror production module tabs (Прогнозы/Расписание/Сотрудники/Отчёты) and ensure the “Рабочая структура” drawer filters Dashboard, Approvals, Teams.
   - Update mock data with organisational metadata; flow selection state via adapters.
   - Coordinate with `${UNIFIED_DEMO_REPO}` to expose the Manager Portal tab when unified shell deploy resumes.

2. **Requests workflow (CH5 §5.4)**
   - Add request categories (schedule_change, shift_exchange, absence, overtime), shift pair metadata, history trail.
   - Extend Approvals table to support selection; implement bulk approve/reject UI + validation.
   - Surface export buttons with the three CH6 report types from both Approvals toolbar and Reports route.

3. **Documentation & UAT assets**
   - Update coordinator CodeMap, UAT crosswalk, screenshot index, and parity checklists with file:line evidence.
  - Rerun `parity_static` + `trimmed_smoke`, attach screenshots (org drawer, bulk banner) and record findings in `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`.
   - Log results in `docs/SESSION_HANDOFF.md`, `PROGRESS.md`, and tracker row `docs/Tasks/post-phase9-demo-execution.md`.

## Required Reading
- docs/Workspace/Coordinator/manager-portal/Progress_Manager-Portal_2025-10-14.md
- docs/Tasks/manager-portal_parity-scout-2025-10-26-codex.task.md
- /Users/m/Desktop/e.tex
- docs/SOP/plan-execution-sop.md
- docs/SOP/demo-refactor-playbook.md

## Implementation Checklist
- [ ] Extend `src/data/mockData.ts` with `OrgUnit`, request categories/history, and helper `filterTeamsByOrgUnit`.
- [ ] Create `src/components/OrgStructureDrawer.tsx` and wire state in `src/components/Layout.tsx` + `src/App.tsx`.
- [ ] Adjust `src/pages/Dashboard.tsx`, `src/pages/Teams.tsx`, `src/pages/Approvals.tsx` to consume filtered teams and show org context.
- [ ] Update `src/components/charts/ReportTable.tsx` to support selectable rows; expand adapters/tests (`src/adapters/approvals.ts`, `*.test.ts`).
- [ ] Introduce `src/utils/exports.ts`, update `src/pages/Approvals.tsx` and `src/pages/Reports.tsx` to expose export options with RU copy.
- [ ] Add Vitest coverage (`src/adapters/approvals.test.ts`, `src/adapters/dashboard.test.ts`, `src/adapters/exports.test.ts`).
- [ ] Run `npm_config_workspaces=false npm run test -- --run --test-timeout=2000` and `npm_config_workspaces=false npm run build`.
- [ ] Deploy via `vercel deploy --prod --yes`; rerun UAT packs and capture required screenshots.
- [ ] Sync docs and trackers listed in Scope (3).

## Risks / Notes
- Unified shell deploy currently 404; document dependency and coordinate once shell redeploys.
- Real data integration will eventually replace mocks; adapters/tests must be resilient to missing fields.
- Monitor RU copy; avoid reintroducing English labels flagged in localisation backlog.

## Deliverables
- Code changes implementing the above scope in `${MANAGER_PORTAL_REPO}`.
- Updated docs (CodeMap, crosswalk, reports), screenshot evidence, UAT findings.
- Handoff entry in `docs/SESSION_HANDOFF.md` with test/build/UAT results.
