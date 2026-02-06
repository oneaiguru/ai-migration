# Task – Analytics ↔ Forecasting Shared Extraction (Phase 2)

## Role Sequence
1. **Scout** – inventory the remaining forecasting-only flows (exceptions wizard, absenteeism calculation, report exports) and capture file:line evidence.
2. **Planner** – design the extraction plan (shared APIs, adapter moves, testing impact, rollback).
3. **Executor** – implement shared modules + swap analytics imports feature-by-feature, run tests, update docs/UAT.

## Why
We have the forecast builder and absenteeism snapshot sharing the new module. The bigger parity gaps (exceptions, absenteeism builder, reports export) still live only in `${FORECASTING_ANALYTICS_REPO}`. This task drives the full extraction so Analytics and Forecasting stop diverging.

## Repos
- Read: `${FORECASTING_ANALYTICS_REPO}`, `${ANALYTICS_REPO}` (no writes for Scout).
- Shared library: `${EMPLOYEE_MGMT_REPO}` (code changes happen here + in analytics repo during execution).

## Required Reading
- `plans/2025-10-27_analytics-forecasting-parity.plan.md` (phase scope).
- `docs/Tasks/analytics-forecasting-overlap-discovery.md` (current overlap matrix).
- `docs/SOP/demo-refactor-playbook.md#forecasting-%E2%86%94-analytics-cohesion`.
- `uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md` (use existing AD rows).
- `docs/System/WRAPPER_ADOPTION_MATRIX.md` (analytics + forecasting rows).
- CH4 & CH6 manuals: `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md`, `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH6_Reports.md`.

## Scout Deliverable
Add a new section to `docs/Tasks/analytics-forecasting-overlap-discovery.md` covering:
- Real vs demo file:line evidence for
  1. **Exceptions wizard** (build forecast → set atypical days).
  2. **Absenteeism calculation** (profile creation).
  3. **Report export slots** (T‑13, Punctuality, Deviations + missing Daily schedule, etc.).
  4. **Trend adapters** (seasonality/anomaly metadata).
  5. **Adjustments services** (undo/redo, validation badges).
- For each, note current adapter/service shape in `${FORECASTING_ANALYTICS_REPO}` and the analytics counterpart/gap.
- Identify API surface needed in `src/modules/forecasting/` (types, services, adapters).
- Capture test coverage sources (vitest/playwright) that must move with the code.
- Flag routing considerations (browser vs hash) if shared module assumes deep links.

## Planner Checklist
- Summarise scout findings; design extraction phases (ordering of exceptions/absenteeism/reports).
- Define shared API signatures + file structure (types/services/adapters).
- Decide on test migration (which vitest suites move, new test harness).
- Outline changes to analytics repo (import swaps, Storybook updates, UAT evidence) and forecasting repo (replace local implementations with shared imports).
- Include rollback plan (restore local modules, revert aliases) and validation commands (typecheck, vitest, Playwright, build, UAT packs).
- Plan must explicitly reference existing UAT IDs (AD-1..AD-4, FA-1..FA-3) and note documentation outputs.

## Executor Acceptance Criteria
- Shared module exports exceptions/absenteeism/report helpers + adapters + types.
- `${FORECASTING_ANALYTICS_REPO}` consumes shared module for those flows.
- `${ANALYTICS_REPO}` swaps to shared helpers without regressions (typecheck/tests/build OK).
- Docs updated: overlap discovery, SOP cohesion note, WRAPPER_ADOPTION_MATRIX, DEMO_PARITY_INDEX, parity packs if needed.
- UAT table (`uat-agent-tasks/2025-10-26_consolidated-uat-sweep.md`) updated under existing AD rows with reuse note per feature.
- Evidence captured (screenshots/Playwright artifacts) for exceptions/absenteeism/report flows.

## SOP Reminders
- Follow Scout → Planner → Executor sequence; log each handoff in `docs/SESSION_HANDOFF.md` and `PROGRESS.md`.
- Keep work tracked per repo (no local-only changes hidden).
- Use `npm_config_workspaces=false npm run typecheck` / `npm_config_workspaces=false npm run test` for analytics; forecasting repo uses its own scripts (`npm run test`, `npm run smoke:routes` if needed).
- Do not mint new UAT IDs; reuse AD-1 .. AD-4 / FA-1 .. FA-3.
