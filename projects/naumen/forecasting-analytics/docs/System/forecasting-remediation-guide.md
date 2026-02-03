# Forecasting & Analytics — Parity Remediation Guide (Internal)

## Context
Latest Step 6 UAT (2025-10-30) flagged gaps between the prod demo (`https://forecasting-analytics-oyldslume-granins-projects.vercel.app`) and Naumen WFM (see screenshots in `docs/SCREENSHOT_INDEX.md`). This guide maps required fixes to code owners.

## 1. Trend Analysis
- **Issue**: `/trends` renders empty charts without seeded queue/period; UAT unable to verify confidence band.
- **Required changes**:
  - Seed default queue + period in `src/data/forecastingFixtures.ts` and expose fallback via `TrendAnalysisDashboard` props.
  - Revisit `TrendAnalysisDashboard.tsx:41-205` to auto-select first queue and clamp period to available data.
  - Add Vitest coverage in `tests/forecasting/trends.test.ts` ensuring fallback data populates charts.
- **Evidence**: `forecasting-real-trend-queue` (prod requirement).

## 2. Build Forecast Workflow
- **Issue**: Demo offers chip-based selector only; missing queue tree, dual horizons, import actions.
- **Required changes**:
  - Implement hierarchical queue tree component (`src/components/forecasting/build/QueueTree.tsx`) and wire into `BuildForecastWorkspace.tsx`.
  - Add dual horizon pickers (historical vs forecast) with validation; adapt `forecastingApi.buildForecast` to accept both ranges.
  - Surface import/export buttons with stub service calls in `src/services/forecastingApi.ts` (mark TODO for real endpoints).
  - Update UI tests (add or extend `tests/forecasting/build.test.ts`).
- **Evidence**: `forecasting-real-build-form`, `forecasting-real-build-header`.

## 3. Exceptions Editor
- **Issue**: Lacks day/interval toggle, dual horizons, ad-hoc range creation.
- **Required changes**:
  - Extend `ExceptionsWorkspace.tsx` to include toggles + date-range picker mirroring prod.
  - Update fixtures (`src/data/forecastingFixtures.ts`) with sample exception sets for both day and interval modes.
  - Validate via new tests (`tests/forecasting/exceptions.test.ts`).
- **Evidence**: `forecasting-real-exceptions-overview`, `forecasting-real-exceptions-detail`.

## 4. Absenteeism Calculator
- **Issue**: Demo shows static templates; prod requires calculator flow.
- **Required changes**:
  - Introduce calculator state machine in `AbsenteeismWorkspace.tsx` with horizon/interval selectors and summary banner.
  - Add API helper stub `forecastingApi.calculateAbsenteeism` returning deterministic data until backend lands.
  - Cover via tests in `tests/forecasting/absenteeism.test.ts`.
- **Evidence**: `forecasting-real-absenteeism-controls`.

## 5. Documentation & UAT
- Update `docs/Tasks/uat-packs/*` once new flows land.
- Refresh screenshot index with updated demo captures after remediation.
- Rerun Step 6 UAT packs and log results in `docs/Tasks/uat/2025-10-26_forecasting-uat.md`.

## Owners
- Frontend: Forecasting feature squad.
- Backend coordination: Ensure API contracts for build/import/export + absenteeism calculation are documented before replacing stubs.
