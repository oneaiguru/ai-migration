# CH5 Scheduling – Parity Crosswalk (Behavior Slice)

Scope
- Behavior-only parity for the Schedule Grid (charts, regrouping, overlays, KPIs, virtualization).
- Visuals frozen. Larger CH5 features (Requests, Optimizations, Shifts/Schemes editors) are deferred.

Live URLs
- Latest: https://schedule-grid-system-mock-hoyghvtpm-granins-projects.vercel.app
- UAT‑verified: https://schedule-grid-system-mock-7hx5y0g9x-granins-projects.vercel.app

Spec Sources
- CH5_SCHEDULE_BUILD.md
- CH5_SCHEDULE_ADVANCED.md
- CH5_SCHEDULE_SHIFTS.md

Legend
- Covered (this slice)
- Deferred (future slice)
- N/A (not applicable to demo)

## Crosswalk

1) Forecast + Plan line view
- Spec: CH5_SCHEDULE_BUILD.md (Schedule Grid basics)
- Status: Covered
- Code: src/components/ForecastChart.tsx:1, src/components/ChartOverlay.tsx:1

2) Deviations bar view
- Spec: CH5_SCHEDULE_BUILD.md
- Status: Covered
- Code: src/components/ForecastChart.tsx:1, src/components/ChartOverlay.tsx:1

3) Service (SL) line with target (90%), clamp 70–100
- Spec: CH5_SCHEDULE_ADVANCED.md (service tracking)
- Status: Covered
- Code: src/components/ForecastChart.tsx:1, src/components/ChartOverlay.tsx:1

4) Day → Period regrouping (time scale)
- Spec: CH5_SCHEDULE_BUILD.md (period aggregation)
- Status: Covered
- Code: src/utils/charts/adapters.ts:1 (toPeriodSeries), src/components/{ForecastChart,ChartOverlay}.tsx:1

5) Σ (headcount) / 123 (FTE hours) overlays (Forecast view)
- Spec: CH5_SCHEDULE_BUILD.md (overlay indicators)
- Status: Covered (Forecast view only)
- Code: src/utils/charts/adapters.ts:1 (deriveHeadcountSeries, deriveFteHoursSeries), src/components/{ScheduleGridContainer,ForecastChart,ChartOverlay}.tsx:1

6) KPI cards (Coverage, SL, Adherence “—”)
- Spec: CH5_SCHEDULE_BUILD.md (KPI panel)
- Status: Covered (default and 500+ views)
- Code: src/components/charts/KpiCardGrid.tsx:1, src/components/ScheduleGridContainer.tsx:1

7) Virtualization (8 → 500+ сотрудников)
- Spec: CH5_SCHEDULE_BUILD.md (large datasets)
- Status: Covered
- Code: src/components/ScheduleGridContainer.tsx:1, src/components/VirtualizedScheduleGrid.tsx:1

8) RU formatting & accessibility (figure aria, keyboard to tabs/checkboxes)
- Spec: CH5_SCHEDULE_BUILD.md (general UI)
- Status: Covered (wrapper-level)
- Code: src/components/charts/LineChart.tsx:1, src/components/charts/types.ts:1

9) Coverage/Adherence toggle in overlay
- Spec: CH5_SCHEDULE_BUILD.md (view toggles)
- Status: Deferred (out of scope for this slice)
- Note: Can be wired via BarChart viewToggle (see stories) without visual changes.

10) Tooltips/legend interactivity
- Spec: CH5_SCHEDULE_BUILD.md (UI polish)
- Status: Deferred/Optional
- Note: Non-blocking per walkthrough; can be enabled later.

11) Header actions: “Построить”, “FTE”
- Spec: CH5_SCHEDULE_BUILD.md (actions)
- Status: Deferred
- Note: Placeholders only in this slice.

12) Requests / Approvals / Exchanges (Заявки)
- Spec: CH5_SCHEDULE_BUILD.md (Requests), CH5_SCHEDULE_ADVANCED.md
- Status: Deferred (separate module)

13) Optimization tools (Day/Period)
- Spec: CH5_SCHEDULE_ADVANCED.md
- Status: Deferred (separate module)

14) Shifts / Schemes editors
- Spec: CH5_SCHEDULE_SHIFTS.md
- Status: Deferred (separate module)

## Acceptance
- All “Covered” items verified on latest live URL without console errors.
- Deferred items recorded for future slices; not blocking this demo.

