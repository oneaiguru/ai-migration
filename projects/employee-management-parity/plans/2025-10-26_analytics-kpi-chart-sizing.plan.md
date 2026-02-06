# Plan — Analytics KPI Chart Sizing Fix

## Goal
Stop the KPI line chart (`"Звонки / Цель"`) from stretching vertically when sharing a grid row with the department report table. The chart should keep a consistent, readable height across breakpoints while remaining responsive and accessible.

## Current Evidence
- Layout component: `src/features/analytics/KpiOverview.tsx:17-41` renders `<LineChart>` and `<ReportTable>` inside the same `.panel__grid`.
- Grid styling: `.panel__grid` in `src/styles/index.css:52-74` uses CSS Grid with auto-fit columns; items inherit the tallest sibling’s height, so the chart container expands to match the table.
- Chart wrapper: `src/components/charts/LineChart.tsx:102-161` sets `maintainAspectRatio: false`, causing Chart.js to fill the parent height. Parent currently stretches with the grid, producing the endless spikes shown in UAT screenshots.

## Proposed Changes
1. Layout constraint
   - Update `.panel__grid` styles to stop cross-axis stretching (`align-items: start`) so shorter items are not forced to fill the tallest row.
   - Give `.chart-container` a deterministic height using CSS `clamp()` (desktop target ≈ 340px, lower bound 260px for small screens, upper bound 380px). This ensures Chart.js reads a stable computed height instead of inheriting the table’s 600px+ row height.
   - Keep responsiveness with a supporting media query (e.g., reduce height on ≤768px screens to avoid overflow while still keeping legends readable).

2. Chart configuration
   - Keep `maintainAspectRatio: false`; with an explicit container height Chart.js will render to the clamp value.
   - If QA still sees stretching, fall back to `maintainAspectRatio: true` with `aspectRatio: 16 / 9` as a contingency (documented but not part of the main change).

3. Regression safety nets
   - Add a Playwright assertion in `e2e/analytics.spec.ts` to capture the chart container height (should fall within an expected band, e.g., 280–380px after render).
   - Update Storybook story for `KpiOverview` to include a visual regression note (or Chromatic baseline) so future layout tweaks get flagged.

4. Documentation / Tracking
   - Note the sizing rule in `docs/System/WRAPPER_ADOPTION_MATRIX.md` under the LineChart entry (secondary axis, fixed height) and in the Analytics Code Map so coordinators know the constraint.
   - Update `docs/Tasks/uat-packs/parity_static.md` with the new expected screenshot (no stretched spikes).

## Acceptance Criteria
- KPI line chart renders at the designed height on desktop and tablet breakpoints, independent of the table height.
- No “infinite” stretching observed in Chrome and Safari (manual spot-check).
- Playwright test passes with the new height assertion.
- Existing UAT packs (`parity_static`, `chart_visual_spec`) remain green with updated visuals.
- Documentation updated to reflect the sizing rule and new deploy URL.

## Rollback Plan
- Revert CSS and LineChart option changes if the layout regresses (restore current `src/styles/index.css` and `LineChart.tsx`).
- Remove any new Playwright assertions if they prove flaky, pending a better measurement approach.
