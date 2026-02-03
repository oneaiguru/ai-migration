# Task: Forecasting Illustrated Guide Gap Remediation (2025-11-07)

## Role
Scout (completed groundwork) → This dossier hands over to the next Planner.

## Required Reading for Planner
1. `PROGRESS.md` — Forecasting entries up to 2025-11-07.
2. `docs/SESSION_HANDOFF.md` — latest executor notes (2025-11-07 entry).
3. CE prompts for Planner:
   - `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`
   - `${CE_MAGIC_PROMPTS_DIR}/PLAN-USING-MAGIC-PROMPT.md`
4. SOP: `docs/SOP/code-change-plan-sop.md` (Planning section).
5. Context docs:
   - `docs/Tasks/uat/2025-11-07_forecasting-illustrated-guide-review.md`
   - `docs/Tasks/uat/2025-11-07_forecasting-real-vs-demo-validation.md`
   - `uat-agent-tasks/2025-11-06_forecasting-real-vs-demo.md`

## Goal
Close the remaining gaps between the demo and the illustrated guide so the forecasting module hits functional parity (100%) for notification feedback and exports.

## Findings & File References
1. **Trend export lacks notification feedback**
   - Demo export buttons in `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:300` trigger CSV but no inline banner / bell entry.
   - Notification helper available via `src/components/forecasting/common/NotificationCenter.tsx:1`.

2. **Accuracy export missing visible success banner / bell dropdown focus issue**
   - Export handler `src/components/forecasting/AccuracyDashboard.tsx:242-267` pushes to bell but offers no inline toast; testers couldn’t open dropdown reliably.
   - Bell component at `src/components/forecasting/common/NotificationBell.tsx:1` for focus tweaks.

3. **Absenteeism calculator does not notify bell**
   - Calculator success banner in `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:210-330` (no notification hook yet).
   - API helper `src/services/forecastingApi.ts:338-420` handles absenteeism export/calc results—extend to emit notifications.

4. **Docs + Tests updates required**
   - Vitest suites: `tests/forecasting/trends.test.ts:1-120`, `tests/forecasting/accuracy.test.ts:1-134`, `tests/forecasting/absenteeism.test.ts:1-120`.
   - Documentation: `docs/System/DEMO_PARITY_INDEX.md:5`, `docs/System/PARITY_MVP_CHECKLISTS.md:1-10`, `docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md:1-29`, `docs/Tasks/uat/2025-10-26_forecasting-uat.md` (latest UAT entry), `docs/SCREENSHOT_INDEX.md` (forecasting aliases).

## Deliverable Expectations for Planner
- Produce a plan that wires trend/accuracy/absenteeism exports into inline + bell notifications, resolves bell focus usability, and updates tests/docs.
- Include validation steps: `npm run test:run`, `npm run build`, `npm run smoke:routes`, prod deploy + remote smoke, UAT packs (`parity_static`, `chart_visual_spec`).
- Document follow-up for real portal gaps (still missing modules) as part of parity notes.

## Notes
- Current prod demo: https://forecasting-analytics-3pemuiun9-granins-projects.vercel.app.
- Real Naumen portal remains non-functional in trends/accuracy/absenteeism; planners should mark demo-only status but leave integrations ready for future backend fixes.
