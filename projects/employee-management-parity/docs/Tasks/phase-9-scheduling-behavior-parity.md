# Phase 9 — Scheduling Behavior Parity (Discovery)

> Role: Scout (analysis only; no code). Visuals are frozen — focus strictly on behavior.

## Context
- We keep all planning/notes/docs in this repo. The scheduling repo remains code-only.
- Code target (read-only for Scout): `${SCHEDULE_REPO}`
- Live URL (if accessible): https://schedule-grid-system-mock-oc2jc37u9-granins-projects.vercel.app
- Library API reference (read-only): `src/components/charts/*`, `src/utils/charts/*` in this repo

## Required Reading
- `docs/CH5_chart_mapping.md` (in scheduling repo, read-only)
- This task: `docs/Tasks/phase-9-scheduling-behavior-parity.md`
- Reference API (read-only): `${EMPLOYEE_MGMT_REPO}/src/components/charts/*` and `${EMPLOYEE_MGMT_REPO}/src/utils/charts/*`
- UAT style (reference): `docs/Tasks/uat-packs/PromptUATparity.md`, `docs/Tasks/uat-packs/trimmed_smoke.md`

## What To Inspect (scheduling repo; read-only)
- Chart overlay code: `src/components/ChartOverlay.tsx`, `src/components/ForecastChart.tsx`
- Wrappers: `src/components/charts/{LineChart,BarChart,KpiCardGrid,ReportTable}.tsx`
- Utilities: `src/utils/charts/{register.ts,format.ts,adapters.ts}`
- Stories/tests as behavior truth: `src/components/charts/__stories__/*.stories.tsx`, `tests/unit/charts/*.spec.ts`

## What To Figure Out (behavior only)
- Day/Period toggle: current state (likely missing); simplest adapter to group day→period; where toggle lives in `ChartOverlay`/`ForecastChart`.
- Coverage/Adherence toggle: confirm status; propose using wrappers’ `viewToggle`/`activeViewId` with stable series IDs.
- KPI tiles: where to place `KpiCardGrid` and which values derive from active datasets (coverage, adherence, SL).
- Σ / 123 overlay: how to overlay headcount/FTE series without changing visuals.
- A11y: confirm wrappers expose `ariaTitle`/`ariaDesc`; outline keyboardable toggle approach.
- Empty/Error: confirm wrapper states and how overlay surfaces them.
- RU: confirm registrar/formatters cover RU dates/numbers across stories.

## Acceptance Criteria for Discovery
- [ ] Current state documented with file:line refs for all 8 behaviors:
  - Day/Period toggle
  - Coverage/Adherence toggle
  - KPI tiles
  - Σ / 123 overlay
  - Tooltips
  - Legend
  - Accessibility (ariaTitle/ariaDesc; keyboardable toggles)
  - Empty/Error states
- [ ] Proposed mapping includes adapter shape or series ID strategy for Day/Period and Coverage/Adherence toggles (design only; no code)
- [ ] KPI computation notes specify which dataset fields feed coverage/adherence/SL values
- [ ] Open questions listed (e.g., “Where should Day/Period toggle live in the UI?”)
- [ ] No code written; Discovery is analysis only

## Scope Boundary
- Do not propose or change colors, fonts, dash patterns, legend placement, or axis styling.
- Behavior only: datasets shown, toggle logic, a11y wiring, RU formatting, empty/error handling.

## Deliverables (in this file; no code changes)
- Fill the Discovery section below with:
  - Current state summary (exists vs. missing) with `file:line` refs in the scheduling repo
  - Proposed mapping for Day/Period and Coverage/Adherence toggles (adapter shape or series ID strategy)
  - KPI computation notes (which dataset fields; when to refresh)
  - Σ/123 overlay sketch (series names/units; how to switch)
  - A11y/empty/error considerations
  - Open questions blocking Planner
- Optional: add a short “Proposed Implementation Map” here (behavior only). Do not modify the scheduling repo docs during Discovery.

## Discovery (to be completed by Scout)
- Current State:
  - Day/Period toggle → Not present in overlay components. `src/components/ChartOverlay.tsx:10` keeps its own `activeView` over three modes (no day/period granularity). `src/components/ForecastChart.tsx:6` accepts `activeView` only. Line chart supports time scale (`src/components/charts/LineChart.tsx:140` uses `timeScale` and Chart.js `time` axis), and RU date adapter is registered (`src/utils/charts/register.ts:18`, `:44-:47`). No adapter exists to group daily points into period buckets.
  - Coverage/Adherence toggle → Not implemented in overlay components. BarChart supports built-in view toggles via `viewToggle`/`activeViewId` and filters series by `viewId` (`src/components/charts/BarChart.tsx:93`, `:214-:233`, `:318-:327`). Story demonstrates the pattern (`src/components/charts/__stories__/BarChart.stories.tsx:63-:81`). ChartOverlay currently switches views via local buttons (`src/components/ChartOverlay.tsx:91-:118`) and does not pass `viewToggle` to BarChart.
  - KPI tiles → Component exists (`src/components/charts/KpiCardGrid.tsx:1`) but not used in `ChartOverlay.tsx` or `ForecastChart.tsx`. No computed KPI values in overlays.
  - Σ / 123 overlay → UI checkboxes rendered but not wired (`src/components/ChartOverlay.tsx:121-:129`). No logic overlays headcount (Σ) or FTE (123) series onto charts.
  - Tooltips → RU formatting in place. LineChart tooltip title/value callbacks (`src/components/charts/LineChart.tsx:226-:247`) use `formatTooltipTitle`/`formatTooltipValue` with RU defaults. BarChart similarly (`src/components/charts/BarChart.tsx:214-:233`).
  - Legend → Enabled, top position, point-style labels: Line (`src/components/charts/LineChart.tsx:214-:221`), Bar (`src/components/charts/BarChart.tsx:238-:245`). No custom legend toggling yet beyond `viewToggle` UI.
  - A11y (titles/descriptions, keyboard toggles) → Charts wrap in `figure` with `role="group"`, `aria-label`, `aria-description`, and `figcaption` summary (Line: `src/components/charts/LineChart.tsx:277-:287`; Bar: `src/components/charts/BarChart.tsx:320-:331`). BarChart’s built-in view toggle renders a `role="tablist"` with `role="tab"` buttons and `aria-selected` (`src/components/charts/BarChart.tsx:333-:352`). ChartOverlay local buttons are plain buttons without roles (`src/components/ChartOverlay.tsx:91-:118`).
  - Empty/Error → Both charts support empty and error states: Line empty (`src/components/charts/LineChart.tsx:257-:271`), Line error (`src/components/charts/LineChart.tsx:168-:182`); Bar empty (`src/components/charts/BarChart.tsx:300-:314`), Bar error (`src/components/charts/BarChart.tsx:181-:195`). Stories cover `Empty` and `ErrorState` variants (`src/components/charts/__stories__/LineChart.stories.tsx:34`, `:41-:48`; `src/components/charts/__stories__/BarChart.stories.tsx:83-:88`).

- Proposed Mapping:
  - Day/Period adapter shape → Add a grouping helper in `src/utils/charts/adapters.ts` (design only):
    - Input: `Series[]` with `points.timestamp` or `points.label` (ISO date string or parsable date).
    - Options: `{ unit: 'day' | 'week' | 'month' }`.
    - Output: `Series[]` with points aggregated by unit (e.g., sum for `people`, average for `percent`). Consumers then pass `timeScale` to LineChart or provide category labels to BarChart. Example signature: `toPeriodSeries(series, { unit: 'week', percentStrategy: 'avg' })`.
    - Surface toggle: add a small Day/Period button group in `ChartOverlay.tsx` header beside existing view buttons; set local state and swap datasets via the adapter before rendering.
  - Coverage/Adherence series ID strategy → Use BarChart’s `viewToggle`/`activeViewId`. Tag each series (or each point) with `metadata.viewId: 'coverage' | 'adherence' | 'deviations'` and pass `viewToggle=[{id:'coverage',label:'Покрытие/Соблюдение'},{id:'deviations',label:'Отклонения'}]`. For LineChart trends, use separate screens or tabs as needed; keep visuals unchanged.
  - KPI values source fields → Compute from the active dataset:
    - Coverage (%): from the currently active `coverage` series — default to average over the displayed window; show last value as trend arrow direction (compare last vs. previous).
    - Adherence (%): analogous to coverage from `adherence` series.
    - SL (%): from the `service` series (LineChart) — clamp already 70–100; KPI displays last value with target 90% indicator.
    - If in Forecast/Plan view: optionally show Σ (sum of `forecast`) and Plan Σ (sum of `plan`) as neutral KPI tiles without altering the chart visuals.
  - Σ / 123 overlay approach → Wire the existing checkboxes to overlay additional series:
    - Σ (headcount): add a thin line dataset on top of `forecast`/`plan` (unit: `people`, style: solid, `pointRadius:0`).
    - 123 (FTE): add another line dataset or reuse a secondary Bar if required (unit: `hours`), but keep current visuals (no dual-axis yet). Both remain read-only overlays and can be dashed if they are targets; otherwise solid.
  - A11y wiring + RU formatters → Keep `figure` semantics and summaries. For ChartOverlay’s header toggles, adopt `role="tablist"`/`role="tab"`/`aria-selected` like BarChart to ensure keyboard access. RU locale is already enforced centrally via `register.ts` for time ticks; number/percent labels are RU via `format.ts`.
  - Empty/Error surfacing → In overlay container, detect data load failures and pass `errorMessage` to charts; if adapters yield no points, render charts with their built-in empty state. Keep behavior-only; do not change empty state visuals.

- Open Questions:
  - Where should the Day/Period toggle live: next to the three view buttons in `ChartOverlay.tsx:91-:118`, or globally above both overlay sections?
  - For KPIs, confirm whether we show last value or window average as the primary value, and which tiles are required per view (coverage/adherence/SL vs. Σ/Plan Σ).
  - For Σ/123 overlays, confirm data source shape (are these computed or fetched?), and whether they should appear across all three views or only in Forecast/Plan.
  - Confirm that no secondary Y-axis is needed for 123 (hours) while visuals are frozen.

## Handoff
- When Discovery is complete, ping Planner to author `plans/YYYY-MM-DD_scheduling-behavior-parity.plan.md` in this repo with exact edits/tests/deploy/rollback for the scheduling repo. Visuals remain frozen until UAT returns.

### Data Flow (Mock-Only)

Current mock series shape (from code)
- LineChart story uses timestamped points; structure matches `Series` in `src/components/charts/types.ts` (scheduling repo):
  {
    "id": "coverage",
    "label": "Покрытие смен",
    "unit": "percent",
    "color": "#2563eb",
    "points": [
      { "timestamp": "2025-07-01", "value": 82 },
      { "timestamp": "2025-07-02", "value": 83 },
      { "timestamp": "2025-07-03", "value": 84 }
    ]
  }
  - Source: ${SCHEDULE_REPO}/src/components/charts/__stories__/LineChart.stories.tsx:23
  - Type shape: ${SCHEDULE_REPO}/src/components/charts/types.ts:17

Day/Period toggle flow
- Current: Option C — not wired in overlays. No day/period state exists; only `activeView` for forecast/deviations/service.
  - ChartOverlay header buttons: ${SCHEDULE_REPO}/src/components/ChartOverlay.tsx:91
  - ForecastChart consumes only `activeView`: ${SCHEDULE_REPO}/src/components/ForecastChart.tsx:6
- Expected (design): Day/Period state in ChartOverlay; when toggled, call adapter (to be added) to group existing `Series[]` by week/month, then pass grouped series to LineChart with `timeScale` set accordingly. No re-fetch.

Coverage/Adherence toggle flow (mock)
- Implemented at the component level in BarChart via `viewToggle` + `activeViewId`. Filtering is by `metadata.viewId` or `series.id`.
  - Filtering logic: ${SCHEDULE_REPO}/src/components/charts/BarChart.tsx:214-233, 318-327
  - Demo story (mock data with view ids): ${SCHEDULE_REPO}/src/components/charts/__stories__/BarChart.stories.tsx:63-81

KPI computation (mock sources)
- KpiCardGrid displays precomputed items; it does not compute from raw series.
  - Component: ${SCHEDULE_REPO}/src/components/charts/KpiCardGrid.tsx:1
- Candidate data sources:
  - Coverage %: schedule statistics from API mock → `coveragePercentage`.
    - Set in container: ${SCHEDULE_REPO}/src/components/ScheduleGridContainer.tsx:167-171
    - Provided by service: ${SCHEDULE_REPO}/src/services/realScheduleService.ts:88-103
    - Mock value: ${SCHEDULE_REPO}/src/data/mockData.ts:212
  - Service Level (SL): last point of `service` line series in ForecastChart dataset.
    - Series assembly: ${SCHEDULE_REPO}/src/components/ForecastChart.tsx:56-65
  - Adherence %: no adherence series in overlays; only demonstrated in BarChart story. Planner must decide whether to source from a new series or derive.

Σ / 123 overlays (mock status)
- Checkboxes exist in overlay headers; no data wired.
  - ChartOverlay checkboxes: ${SCHEDULE_REPO}/src/components/ChartOverlay.tsx:121-129
  - ScheduleGridContainer checkboxes: ${SCHEDULE_REPO}/src/components/ScheduleGridContainer.tsx:287-296
- No mock `fte` or `headcount` series currently. Potential mock sources:
  - Headcount: derive per day from number of unique `employeeId` in schedules for that date (mockScheduleEntries).
  - FTE: derive hours from `duration` fields aggregated per day then normalised.
    - Schedules data: ${SCHEDULE_REPO}/src/data/mockData.ts:148-204

Series IDs in use (overlays & stories)
- Overlays: `forecast`, `plan`, `deviations`, `service`.
  - Forecast/Plan: ${SCHEDULE_REPO}/src/components/ForecastChart.tsx:38-53
  - Deviations: ${SCHEDULE_REPO}/src/components/ForecastChart.tsx:67-82
  - Service: ${SCHEDULE_REPO}/src/components/ForecastChart.tsx:56-65
- Stories: `coverage`, `adherence`, `deviations` (with `metadata.viewId`).
  - ${SCHEDULE_REPO}/src/components/charts/__stories__/BarChart.stories.tsx:22-36, 39-51, 63-81
