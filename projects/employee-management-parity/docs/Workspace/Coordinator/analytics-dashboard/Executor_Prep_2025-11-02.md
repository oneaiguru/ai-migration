# Executor Prep — Analytics Dashboard Parity Remediation (2025-11-02)

## Current State Summary
- **Shared module** (`${EMPLOYEE_MGMT_REPO}/src/modules/forecasting/*`)
  - Queue tree, horizon builder, absenteeism run history, trend/accuracy generators, exception CSV helpers, and report download notices now live in the shared package.
  - Vitest coverage in `src/modules/forecasting/__tests__/data.test.ts` (38 assertions) verifies the new helpers.
- **Analytics runtime bridge** (`${ANALYTICS_REPO}`)
  - `tsconfig.json`/`tsconfig.node.json` point `@wfm/shared/forecasting` to the shared repo and enable `allowImportingTsExtensions`.
  - `src/types/shared-forecasting-runtime.ts` re-exports the shared module via relative imports and preserves async wrappers.
  - `vite.config.ts` resolves both `@wfm/shared/forecasting` and sub-paths to the shared sources; no Vitest stubs remain.
- **Validation**
  - Shared repo: `npm run test:unit -- --run src/modules/forecasting/__tests__/data.test.ts` ✅ (38 tests).
  - Analytics repo: `npm_config_workspaces=false npm run ci` ✅ (typecheck → vitest → Vite build → Storybook build → Playwright).
- **Documentation**
  - `docs/Tasks/analytics-dashboard_parity-remediation-2025-11-02.task.md` (executor notes) updated with accurate status: Phase 1 done, runtime bridge ready, UI wiring outstanding.
  - `docs/SESSION_HANDOFF.md` entry refreshed with the real commands and remaining work.

## Outstanding Work (Plan Phase 2+)
1. **UI wiring in `${ANALYTICS_REPO}`**
   - Update `src/features/forecasting/ForecastBuilder.tsx`, `ExceptionsWorkspace.tsx`, `AbsenteeismWorkspace.tsx`, and reports components to consume the shared helpers directly (queue tree, horizons, trend/accuracy data, absenteeism runs, report notifications).
   - Remove any remaining local mocks/adapters once shared helpers are wired in.
2. **RU formatting verification**
   - Ensure KPI deck and accuracy cards render using the shared RU-formatted values after wiring.
3. **Documentation/UAT**
   - Refresh `docs/System/forecasting-analytics_illustrated-guide.md`, `uat-agent-tasks/analytics-dashboard_2025-11-02_parity-spotcheck.md`, and screenshot aliases once the UI reflects the shared data.
4. **Validation**
   - Re-run `${ANALYTICS_REPO}: npm_config_workspaces=false npm run ci` after wiring + emit updated Playwright artifacts.

## Files & SOPs to Read Before Execution
1. `PROGRESS.md` (confirm active workstream).
2. Plan: `plans/2025-11-02_analytics-dashboard-parity-remediation.plan.md` (Phase 2 onwards).
3. CE executor prompts: `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`, `${CE_MAGIC_PROMPTS_DIR}/EXECUTE-WITH-MAGIC-PROMPT.md`.
4. SOPs: `docs/SOP/plan-execution-sop.md` (executor section), `docs/SOP/demo-refactor-playbook.md` (Forecasting ↔ Analytics Cohesion).
5. Task file: `docs/Tasks/analytics-dashboard_parity-remediation-2025-11-02.task.md` (Scout + Planner + updated Executor notes).
6. Overlap guidance: `docs/Tasks/analytics-forecasting-overlap-discovery.md`.
7. Reference docs: `docs/System/forecasting-analytics_illustrated-guide.md`, `uat-agent-tasks/analytics-dashboard_2025-11-02_parity-spotcheck.md`, manuals `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md` + `CH6_Reports.md`.

## Validation Commands to Run After UI Wiring
```bash
cd ${EMPLOYEE_MGMT_REPO}
npm run test:unit -- --run src/modules/forecasting/__tests__/data.test.ts

cd ${ANALYTICS_REPO}
npm_config_workspaces=false npm run ci
```

Document results in `docs/SESSION_HANDOFF.md` and update the task file’s Executor notes upon completion.
