# Plan — Scheduling Behavior Parity (Behavior Only)

Status: Final — Ready to Execute
Role: Executor (follow steps below)
 Target repo (code-only): /Users/m/git/client/schedule-grid-system-mock
 Docs live here (this repo): employee-management-parity
 Scope: Behavior only (no visuals). Freeze colors/dash/legend/axis styling.
 
 ## Goal
 Wire scheduling charts behavior without visual changes:
 - Day/Period grouping (day → week/month) for line trends
 - Coverage/Adherence view toggles in overlay via BarChart’s `viewToggle`
 - KPI tiles sourced from mock stats/series (coverage, SL; adherence optional)
 - Σ (headcount) / 123 (FTE hours) overlays derived from mock schedules
 
 ## Required Reading
 - Discovery + Data Flow: docs/Tasks/phase-9-scheduling-behavior-parity.md:1
 - Scheduling chart types/API (read-only): ../employee-management-parity/src/components/charts/*, ../employee-management-parity/src/utils/charts/*
 - RU registrar & formatters (scheduling repo): src/utils/charts/register.ts:1, src/utils/charts/format.ts:1
 - Bar view toggle demo: src/components/charts/__stories__/BarChart.stories.tsx:63
 
 ## Files To Change (scheduling repo)
 - src/utils/charts/adapters.ts
 - src/components/ChartOverlay.tsx
 - src/components/ForecastChart.tsx
 - src/components/ScheduleGridContainer.tsx
 - tests/unit/charts/adapters.spec.ts
 
## Edits
 
 1) Add grouping + derived-data adapters
 - File: src/utils/charts/adapters.ts
 - Add types and functions:
   - `export type TimeUnit = 'day' | 'week' | 'month'`
   - `export interface PeriodOptions { unit: TimeUnit }`
   - `export function toPeriodSeries(input: Series[], opts: PeriodOptions): Series[]`
     - If `unit==='day'` → return input unchanged
     - Bucket by ISO week (e.g., 2025-W27) or by month (e.g., 2025-07); preserve order
     - Aggregate by `series.unit`: people|hours → sum; percent → average of numeric points
     - Output points: `{ label: periodKey, value, timestamp?: firstDateOfBucket }`
   - `export function deriveHeadcountSeries(dates: string[], schedules: ScheduleData[]): Series`
     - Unique `employeeId` per date → points
     - `{ id:'headcount', label:'Численность (Σ)', unit:'people' }`
   - `export function deriveFteHoursSeries(dates: string[], schedules: ScheduleData[]): Series`
     - Sum `duration` (minutes)/60 per date → points
     - `{ id:'fte', label:'FTE часы', unit:'hours' }`
 - Reference types: src/components/charts/types.ts:1 (Series, SeriesPoint, Unit)
 
 2) ChartOverlay: Day/Period toggle + Σ/123 overlay plumbing
 - File: src/components/ChartOverlay.tsx
 - Add period state near component state: src/components/ChartOverlay.tsx:10
   - `const [timeUnit, setTimeUnit] = useState<'day'|'week'|'month'>('day');`
 - Header UI (beside existing view buttons): src/components/ChartOverlay.tsx:91-118
   - Add small tablist (role="tablist") with “День” (day) and “Период” (week) tabs → update `timeUnit`
 - Data assembly: src/components/ChartOverlay.tsx:36-81
   - Build forecast/deviation/service series as today
   - If `timeUnit!=='day'` → wrap each via `toPeriodSeries([...], { unit: timeUnit })`
 - LineChart props where used:
   - Pass `timeScale={ timeUnit === 'day' ? 'day' : (timeUnit === 'week' ? 'week' : 'month') }`
 - Σ/123 checkboxes: src/components/ChartOverlay.tsx:121-129
   - Add local checkbox state; accept `overlaySeries?: Series[]` prop (from container)
   - When Σ checked → append `headcount` series; when 123 checked → append `fte` series
   - Keep overlays as additional line datasets (solid, pointRadius: 0); no axis changes
 
 3) ForecastChart: accept time unit and overlay series
 - File: src/components/ForecastChart.tsx
 - Extend props (top): src/components/ForecastChart.tsx:5-9
   - `{ activeView: 'forecast'|'deviations'|'service'; timeUnit?: 'day'|'week'|'month'; overlaySeries?: Series[] }`
 - After building datasets: src/components/ForecastChart.tsx:38-82 (forecast/deviations), :56-65 (service)
   - If `timeUnit && timeUnit!=='day'` → apply `toPeriodSeries` to displayed series
   - Pass `timeScale` prop to LineChart mapped from `timeUnit`
   - Append `overlaySeries` based on parent toggles
 
 4) ScheduleGridContainer: compute overlays + mount KPI tiles
 - File: src/components/ScheduleGridContainer.tsx
 - Dates array exists: src/components/ScheduleGridContainer.tsx:132-161 → create `const dateLabels = dates.map(d => d.dateString)`
 - After schedules map build: src/components/ScheduleGridContainer.tsx:190-206
   - Snapshot to array → `const schedulesArray: ScheduleData[] = Array.from(shifts.values())` (or rebuild from API response)
   - Compute overlays:
     - `const headcountSeries = deriveHeadcountSeries(dateLabels, schedulesArray)`
     - `const fteSeries = deriveFteHoursSeries(dateLabels, schedulesArray)`
     - `const overlaySeries = [headcountSeries, fteSeries]`
   - Pass `overlaySeries` and `timeUnit` into `ChartOverlay`
 - KPI tiles under chart area
   - Coverage: `scheduleStats.coveragePercentage` (src/components/ScheduleGridContainer.tsx:167-171)
   - SL: last value of `service` series (mirror child’s generation or compute in container for consistency)
   - Adherence: leave “—” until a series exists in overlays
   - Use `KpiCardGrid` (src/components/charts/KpiCardGrid.tsx:1)
 
 5) (Optional) Bar view toggle in overlay
 - Use `viewToggle`/`activeViewId` with `metadata.viewId` to filter coverage/adherence vs deviations
 - Reference filtering: src/components/charts/BarChart.tsx:214-233, 318-327
 - Reference story: src/components/charts/__stories__/BarChart.stories.tsx:63-81
 
6) Tests
 - File: tests/unit/charts/adapters.spec.ts
 - Add `toPeriodSeries` cases: day passthrough; week/month grouping; unit-aware aggregation; gaps safe
 - Add `deriveHeadcountSeries`/`deriveFteHoursSeries` smoke tests with a tiny schedules array

## How To Execute (scheduling repo)
1) Pre-flight
   - `cd /Users/m/git/client/schedule-grid-system-mock`
   - `npm ci` (or `npm install`)
   - Verify: `npm run test:unit` passes on main before edits
2) Apply edits from this plan
   - Implement adapters in `src/utils/charts/adapters.ts`
   - Wire Day/Period + Σ/123 in `src/components/ChartOverlay.tsx`
   - Extend `src/components/ForecastChart.tsx` for `timeUnit`/`overlaySeries` + pass `timeScale`
   - Compute overlays and mount KPIs in `src/components/ScheduleGridContainer.tsx`
   - Add/extend tests in `tests/unit/charts/adapters.spec.ts`
3) Validate locally
   - `npm run build`
   - `npm run test:unit`
   - Optional: `npm run storybook:build` (no visual changes expected)
4) Commit & push
   - `git add src/utils/charts/adapters.ts src/components/ChartOverlay.tsx src/components/ForecastChart.tsx src/components/ScheduleGridContainer.tsx tests/unit/charts/adapters.spec.ts`
   - `git commit -m "Phase 9: Scheduling behavior parity (Day/Period, Bar view toggle, KPIs, Σ/123 overlays); add adapters + tests (visuals frozen)"`
   - `git push origin main`
5) Deploy (optional, if requested)
   - `vercel deploy --prod --yes` (ensure the project is linked)
   - Paste the production URL into the scheduling repo’s `docs/CH5_chart_mapping.md` and this repo’s `docs/SESSION_HANDOFF.md`

## Validation
 - Build: `npm run build`
 - Unit tests: `npm run test:unit`
 - Optional stories: `npm run storybook:build`
 - Manual:
   - Toggling День/Период re-groups points without console errors; RU ticks/tooltips remain
   - Bar view toggle filters datasets per view correctly
 - KPI tiles render and reflect mock stats/series; no crashes
  - Σ/123 checkboxes append/remove overlays; single-axis remains

## Acceptance Criteria
 - Day/Period behavior implemented using adapter; no re-fetch; LineChart `timeScale` respected
 - Bar view toggles work in overlay using existing BarChart API
 - KPI tiles show coverage (from stats) and SL (from series last point); adherence optional
 - Σ/123 overlays computed from mock schedules and toggleable
 - Tests added for adapters; build/tests green; no visual changes

## Rollback
 - Files to revert: src/utils/charts/adapters.ts, src/components/ChartOverlay.tsx, src/components/ForecastChart.tsx, src/components/ScheduleGridContainer.tsx, tests/unit/charts/adapters.spec.ts
 - `git checkout -- <files>` or revert the single execution commit

## Notes / Risks
 - No secondary Y-axis introduced; 123 (hours) remains on single axis per “visuals frozen” constraint
 - Adherence KPI pending a real adherence series in overlays (present in Bar stories only)
 - If container and ForecastChart generate data differently, prefer container-sourced values to keep KPIs consistent
