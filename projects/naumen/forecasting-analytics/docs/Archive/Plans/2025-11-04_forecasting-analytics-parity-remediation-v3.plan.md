# Forecasting & Analytics — Parity Remediation Plan v3 (2025-11-04)

## Metadata
- **Task**: Forecasting parity follow-up (timezone + history parity)
- **Source discovery**: `docs/Tasks/forecasting-analytics_parity-followup-2025-10-30.task.md`
- **Supporting docs**: `plans/2025-10-31_forecasting-analytics-parity-remediation-v2.plan.md`, `docs/System/forecasting-remediation-guide.md`, `docs/Tasks/uat/2025-10-26_forecasting-uat.md`, `/Users/m/Desktop/x/Real Naumen observations.md`
- **Repo**: `${FORECASTING_ANALYTICS_REPO}` (`/Users/m/git/client/naumen/forecasting-analytics`)
- **Preview port**: `127.0.0.1:4155` (`docs/System/ports-registry.md`)

## Desired End State
- Build, exceptions, and absenteeism workspaces respect operator-selected timezone (e.g., Moscow UTC+03, Chelyabinsk UTC+05) across UI labels, payload serialization, and CSV exports.
- Trend dashboard behaves like Naumen: charts stay blank until a queue + period block is configured; operators can add/edit periods and only then render seeded data aligned to chosen timezone.
- Absenteeism workspace shows summary banner + run-history table matching production, with deterministic data surfaced via fixtures/services.
- Accuracy + manual adjustments tabs either gated behind clear "demo-only" messaging or tucked under an Advanced accordion per product direction, keeping parity expectations explicit.
- Vitest suites cover timezone math, trend configuration state, and absenteeism history. Smoke + UAT reruns confirm parity.
- Documentation and trackers describe the new timezone workflow, trend config, and absenteeism history updates.

## Current Gaps (from 2025-11-03 scout)
- No timezone selector; build/exceptions payloads serialise UTC midnight ignoring operator offset (`BuildForecastWorkspace.tsx:104-207`, `ExceptionsWorkspace.tsx:33-220`, `forecastingApi.ts:178-345`).
- Trend dashboard seeds defaults instead of waiting for queue/period confirmation; there is no UI for period blocks (`TrendAnalysisDashboard.tsx:20-220`).
- Absenteeism view lacks the horizon banner and run-history list; CSV export mis-identifies queue id (`AbsenteeismWorkspace.tsx:288-520`).
- Accuracy/manual tabs still present despite not existing in Naumen module; expectations need clarification.

## Out of Scope
- Wiring to live Naumen APIs (leave TODOs + contracts documented).
- Extending Playwright beyond updating screenshot evidence once parity lands.
- Broader analytics module changes outside `/forecasting` routes.

## Approach Overview
Execute work in four phases (timezone infra, trend config, absenteeism history, parity refinement & validation) followed by validation/documentation updates.

### Phase 1 — Timezone Infrastructure
1. **Shared timezone selector**
   - Create `src/components/forecasting/common/TimezoneSelector.tsx` (or similar) with fixtures listing at least Moscow (UTC+03) and Chelyabinsk (UTC+05). Persist choice in context/store (`useTimezone` hook) scoped to forecasting routes.
   - Update fixtures (`src/data/forecastingFixtures.ts`) and types (`src/types/forecasting.ts`) to expose available timezones + default.
2. **Apply timezone to build/exceptions UI**
   - Wire selector into `BuildForecastWorkspace.tsx` and `ExceptionsWorkspace.tsx` so date pickers display localised labels (`ДД.ММ.ГГГГ (UTC+03)` etc.) and clamps respect offset.
   - Update CSV/export payload builders in `src/services/forecastingApi.ts` to convert picked local dates into UTC ISO strings using the selected offset.
   - Add unit helpers (e.g., `convertLocalRangeToUtc`) with Vitest coverage (`tests/forecasting/timezone.test.ts` or extend existing files).
3. **Persist + hydrate**
   - Store timezone selection in `localStorage` (namespaced key) and restore on mount. Provide default fallback to Moscow when storage empty.

### Phase 2 — Trend Configuration Workflow
1. **Blank-state & configuration UI**
   - Modify `TrendAnalysisDashboard.tsx` so charts stay disabled until a queue is selected and at least one period block is added. Introduce configuration panel for period blocks (length, horizon) derived from fixtures.
   - Provide seeded period templates in fixtures but require explicit confirmation (e.g., "Добавить период" button) before rendering charts.
2. **Timezone-aware data**
   - Adjust adapters to shift timestamps based on selected timezone before computing trend/seasonality series.
   - Ensure anomaly tagging respects newly applied timezone (update `src/adapters/forecasting/trends.ts` as needed).
3. **Testing**
   - Extend `tests/forecasting/trends.test.ts` to cover blank state, period addition, and timezone shift logic.

### Phase 3 — Absenteeism Summary & History
1. **Summary banner**
   - Enhance `AbsenteeismWorkspace.tsx` with banner showing selected horizon + interval + timezone (e.g., `09.10 – 15.10 (UTC+05, Челябинск)`).
2. **Run-history table**
   - Seed deterministic run history fixtures; render table with columns (date run, queue, profile, author, status, actions) mirroring screenshot `bb02ae80-6abd-4f28-9575-af710a008f33.png`.
   - Provide mock actions (download CSV, reopen) to match prod affordances (stubbed service calls).
3. **CSV export correctness**
   - Fix export payload to use queue id, timezone offset, and selected horizon (update `forecastingApi.calculateAbsenteeism`/`exportAbsenteeismCsv`).
4. **Testing**
   - Add/extend `tests/forecasting/absenteeism.test.ts` for summary formatting, history rows, and payload mapping.

### Phase 4 — Parity Refinement, Validation & Docs
1. **Accuracy/manual tabs decision**
   - Add feature flag or UI callout (e.g., `Demo enhancements` accordion) if we keep tabs; otherwise hide behind config reusing plan-level constant. Document decision in task file + docs.
2. **Command validations**
   - `npm_config_workspaces=false npm ci`
   - `npm_config_workspaces=false npm run test:run`
   - `npm_config_workspaces=false npm run build`
   - `npm_config_workspaces=false npm run smoke:routes`
   - `npm run preview -- --host 127.0.0.1 --port 4155` (manual parity check focusing on timezone, trend blank state, absenteeism history)
   - Deploy: `vercel deploy --prod --yes`
   - Prod smoke: `SMOKE_BASE_URL=<deploy> npm run smoke:routes`
3. **UAT rerun**
   - Execute Step 6 packs (`parity_static`, `chart_visual_spec`) on new deploy; capture screenshots into `/Users/m/Desktop/tmp-forecasting-uat/` using forecasting aliases.
   - Update `docs/Tasks/uat/2025-10-26_forecasting-uat.md` with Pass notes mentioning timezone selector + trend config.
4. **Documentation updates** (list mirrors prior plans)
   - `docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md`
   - `docs/System/DEMO_PARITY_INDEX.md`
   - `docs/System/PARITY_MVP_CHECKLISTS.md`
   - `docs/System/WRAPPER_ADOPTION_MATRIX.md`
   - `docs/Tasks/post-phase9-demo-execution.md`
   - UAT packs `docs/Tasks/uat-packs/{parity_static.md, chart_visual_spec.md}`
   - Screenshot index & aliases
   - `docs/Tasks/forecasting-analytics_parity-followup-2025-10-30.task.md` (Executor section + completion notes)
   - `PROGRESS.md`, `docs/SESSION_HANDOFF.md`

## Risks & Mitigations
- **Timezone math regressions**: Create dedicated utility with exhaustive tests; gate UI on valid conversions.
- **Fixture complexity**: Centralise timezone + queue metadata to avoid duplication; document shape in fixtures file.
- **UAT timing**: Coordinate with UAT agent; ensure evidence folder refreshed before handoff.

## Exit Criteria Checklist
- [ ] Timezone selector integrated; payload conversions tested.
- [ ] Trend dashboard requires explicit queue/period configuration; charts respect timezone.
- [ ] Absenteeism banner + run-history table implemented; CSV payload fixed.
- [ ] Accuracy/manual tabs alignment decided + documented.
- [ ] Validation stack (tests, build, smoke, deploy, UAT) green.
- [ ] Docs + trackers updated; session handoff logged with parity status.
