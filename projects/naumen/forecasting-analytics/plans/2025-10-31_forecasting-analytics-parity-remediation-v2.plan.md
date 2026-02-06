# Forecasting & Analytics — Parity Remediation Plan v2 (2025-10-31)

## Metadata
- **Task**: Forecasting parity follow-up (2025-10-30)
- **Source discovery**: `docs/Tasks/forecasting-analytics_parity-followup-2025-10-30.task.md`
- **Supporting docs**: `docs/System/forecasting-remediation-guide.md`, `docs/System/forecasting-uat-guide.md`, `docs/Tasks/uat/2025-10-26_forecasting-uat.md`, `docs/Tasks/uat/2025-10-29_forecasting-demo-vs-naumen.md`
- **Repo**: `${FORECASTING_ANALYTICS_REPO}` (`/Users/m/git/client/naumen/forecasting-analytics`)
- **Preview port**: `127.0.0.1:4155` (see `docs/System/ports-registry.md`)

## Desired End State
- `/build` reproduces the prod queue tree + dual horizon selectors, absenteeism controls, and CSV import/export actions described in CH4 §4.1 (`forecasting-real-build-form`).
- `/exceptions` allows mixed day/interval intervals, smoothing sliders, and dual horizon history selection per CH4 §4.2 (`forecasting-real-exceptions-detail`).
- `/absenteeism` supports the calculator flow (horizon/interval pickers, summary banner) in addition to template CRUD (`forecasting-real-absenteeism-controls`).
- `/trends` seeds per-queue data and auto-selects the first queue/period so the confidence band renders on initial load (`forecasting-real-trend-queue`).
- Fixtures/services expose deterministic data for each queue and new API helpers (build/import/export, exceptions, absenteeism calculation) ready to swap for backend endpoints.
- Vitest suites cover the new helpers and workspace state machines; smoke routes + Step 6 UAT pass on the redeployed build with evidence logged.
- Documentation (CodeMap, parity packs, parity index/matrix/checklists, UAT log, screenshot index, PROGRESS, SESSION_HANDOFF) reflects the remediated flows.

## Current Gaps (from scout pass)
- `src/components/forecasting/build/BuildForecastWorkspace.tsx:43-226` still treats queue selection as flat toggle chips and lacks separate history vs forecast horizon fields; import/export buttons call stubs without queue context.
- `src/components/forecasting/exceptions/ExceptionsWorkspace.tsx:33-179` forces a single mode, omits smoothing controls, and cannot mix day + interval entries; horizon selection limited to one preset.
- `src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx:43-186` exposes template CRUD only; calculator workflow and CSV queue mapping absent.
- `src/components/forecasting/trends/TrendAnalysisDashboard.tsx:28-135` relies on hard-coded queue labels and a sliding 30-day window, leaving charts empty during UAT.
- `src/data/forecastingFixtures.ts:14-110` provides one shared series and shallow queue metadata; `src/services/forecastingApi.ts:104-207` simulates exports without contracts for new workflows.

## Out of Scope
- Replacing mocks with live Naumen APIs (note TODOs + payload expectations only).
- Playwright automation beyond updating screenshot references for UAT evidence.
- Shell, auth, or other demo modules not part of forecasting parity.

## Approach Overview
Execute in four implementation phases (fixtures/services, workspace rebuilds, analytics defaults, tests/documentation) followed by a validation + UAT loop. Each phase references exact files/sections and expected deliverables.

### Phase 1 — Fixtures & Service Layer Alignment
1. **Enrich fixtures** (`src/data/forecastingFixtures.ts`):
   - Add per-queue forecast series + meta for strategic/tactical/operational presets.
   - Provide default queue id + period window exported for `/trends` fallback.
   - Seed dual horizon defaults (history + forecast) and absenteeism calculator presets.
2. **Extend type contracts** (`src/types/forecasting.ts`, `src/types/trends.ts` if needed) for new calculator payloads and dual-horizon structures.
3. **Update services** (`src/services/forecastingApi.ts`):
   - Implement helpers: `fetchForecastBuildOptions`, `calculateAbsenteeism`, `exportForecastCsv`, `exportExceptionsCsv`, `exportAbsenteeismCsv` with deterministic payloads.
   - Document TODO comments for swapping to live endpoints; accept queue ids + period inputs.
4. **Document backend expectations** inside service functions (include payload interfaces + TODO linking to Open Questions in task file).

### Phase 2 — Workspace Parity Rebuilds
1. **Build Forecast** (`src/components/forecasting/build/BuildForecastWorkspace.tsx`):
   - Introduce expandable queue tree with parent/child checkboxes and partial-selection indicator.
   - Separate history horizon vs forecast window controls (align with prod: history slider + forecast duration input).
   - Surface absenteeism profile + manual override plus new “Импорт/Экспорт” actions referencing updated services.
   - Display build progress log (mock job id) and validation states.
2. **Exceptions** (`src/components/forecasting/exceptions/ExceptionsWorkspace.tsx`):
   - Support toggling between day/interval modes per interval row; allow mixed entries within template.
   - Add history horizon picker + smoothing sliders; expose conflict badges similar to `forecasting-real-exceptions-detail` using local validation.
   - Provide CSV download/upload stubs via new service helpers.
3. **Absenteeism** (`src/components/forecasting/absenteeism/AbsenteeismWorkspace.tsx`):
   - Layer calculator workflow (queue + horizon selection, preview metrics, summary banner) on top of template CRUD.
   - Call `calculateAbsenteeism` stub and show results in a mini report table.
   - Fix CSV export mapping to use actual queue ids.
4. **Shared UI**: extract shared widgets (queue tree, horizon select) if duplicated to keep components concise.

### Phase 3 — Trend Defaults & Analytics Enhancements
1. **TrendAnalysisDashboard** (`src/components/forecasting/trends/TrendAnalysisDashboard.tsx`):
   - Auto-select seeded default queue/period; clamp user selection to fixture ranges.
   - Map per-queue series from fixtures so each tab renders data immediately.
   - Ensure anomaly tagging persists per queue and the CSV export uses new service helper.
2. **Adapters** (`src/adapters/forecasting/*`):
   - Adjust builders to accept per-queue series; add tests for multi-series handling.
3. **Accuracy/Manual Adjustments review**: confirm RU formatting & statuses unaffected; add TODO if future backend required (no rework unless regression introduced).

### Phase 4 — Tests, Validation, Documentation
1. **Vitest suites**:
   - Add/extend `tests/forecasting/build.test.ts`, `tests/forecasting/exceptions.test.ts`, `tests/forecasting/absenteeism.test.ts`, `tests/forecasting/trends.test.ts` to cover new helpers + UI logic (queue defaults, calculator outputs, smoothing validation).
   - Update existing tests to reflect new fixtures/service contracts.
2. **Validation commands** (run in repo root):
   - `npm ci`
   - `npm run test:run`
   - `npm run build`
   - `npm run smoke:routes`
   - `npm run preview -- --host 127.0.0.1 --port 4155` for manual checks
   - Deploy: `vercel deploy --prod --yes`
   - Post-deploy: `SMOKE_BASE_URL=<deploy-url> npm run smoke:routes`
3. **UAT rerun**:
   - Execute Step 6 packs (`parity_static`, `chart_visual_spec`) against new prod deploy, capture screenshots (use forecasting aliases) into `/Users/m/Desktop/tmp-forecasting-uat/`.
   - Update `docs/Tasks/uat/2025-10-26_forecasting-uat.md` with Pass results and attach new evidence.
4. **Documentation updates**:
   - `docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md`
   - `docs/System/DEMO_PARITY_INDEX.md`
   - `docs/System/PARITY_MVP_CHECKLISTS.md`
   - `docs/System/WRAPPER_ADOPTION_MATRIX.md`
   - `docs/Tasks/post-phase9-demo-execution.md`
   - UAT packs (`docs/Tasks/uat-packs/parity_static.md`, `chart_visual_spec.md`)
   - Screenshot index (`docs/SCREENSHOT_INDEX.md`)
   - `PROGRESS.md` (Phase D status) & `docs/SESSION_HANDOFF.md`

## Risks & Mitigations
- **Backend contract drift**: keep service helpers isolated with TODO tags and align with backend once specs arrive. Document expectations in code comments + task file.
- **Fixture bloat**: centralise fixture builders to avoid duplicating large arrays; ensure tests reuse helpers.
- **UAT timing**: schedule Step 6 rerun only after deploying and verifying smoke routes.

## Exit Criteria Checklist
- [ ] All Phase 1–3 code changes merged with deterministic fixtures + services.
- [ ] Vitest + smoke routes + build succeed locally (`npm run test:run`, `npm run build`, `npm run smoke:routes`).
- [ ] Production deploy succeeds; prod smoke routes green.
- [ ] Step 6 UAT passes with refreshed screenshots & notes.
- [ ] Documentation and trackers updated; `git status` clean.
- [ ] Handoff recorded in `docs/SESSION_HANDOFF.md` referencing this plan.

