# Task: Forecasting & Analytics — Parity Gap Remediation (2025-10-29)

## Summary
- Latest UAT (2025-10-30) shows parity gaps remain despite initial remediation pass.
- Use this task as the canonical list of outstanding items tied to prod screenshots (`forecasting-real-*`).

## Findings (Outstanding)
1. **Build Forecast Workspace** — Demo lacks queue tree, dual horizon pickers, and import actions present in prod (`forecasting-real-build-form`).
2. **Exceptions Workspace** — Missing day/interval toggle, dual horizons, and custom date ranges (`forecasting-real-exceptions-detail`).
3. **Trend Analytics** — Charts blank until queue/period provided; seed defaults so confidence band renders (`forecasting-real-trend-queue`).
4. **Absenteeism Workflow** — Need calculator flow (horizon + interval selectors, summary banner) beyond static templates (`forecasting-real-absenteeism-controls`).
5. **Accuracy Metrics** — RU formatting confirmed; maintain coverage (no change needed).
6. **Import/Export APIs** — Service stubs exist; wire to real endpoints once backend ready.

## Backend / Data Follow-ups
- Provide live endpoints for build/import/export + manual adjustments.
- Align payload schemas with Naumen API once delivered (document contracts in plan).
- Extend error handling once endpoints respond with validation codes.

## Evidence
- UAT: `docs/Tasks/uat/2025-10-26_forecasting-uat.md`
- Screenshots: `/Users/m/Desktop/tmp-forecasting-uat/` (`forecasting-real-*`, `playwright-forecasting-*`).
- Tests: `npm run test:run` (Vitest), `npm run smoke:routes` (Playwright).
