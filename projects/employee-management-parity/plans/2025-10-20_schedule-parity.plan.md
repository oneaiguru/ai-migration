# Plan: Phase 9 – Schedule Grid System Parity (Executor)

## Metadata
- Date: 2025-10-20
- Owner: Executor (frontend)
- Target Repo: `~/Users/m/git/client/schedule-grid-system-mock`
- Inputs: CH5_Schedule_Build.pdf, CH5_Schedule_Advanced.pdf, CH7_Appendices.md
- Internal Specs: `docs/Tasks/phase-9-charts-*.md`
- Library: `src/components/charts/*`, `src/utils/charts/*` (from parity repo)

## Objective
Align the Scheduling demo with CH5 visuals and our shared component library. Replace ad‑hoc charts with wrappers, add KPI/table views, and document props (units, clamps, toggles, targets) for future reuse.

## Scope (Doc → Component)
- Coverage % over time (period/day views) → `BarChart` (stacked/grouped), Y clamp 70–100 %
- Adherence % trend (daily/weekly) → `LineChart` (targets optional)
- Shift distribution / utilization KPIs → `KpiCardGrid`
- Schedule build logs / actions → `ReportTable` (no chart)
- Heatmap (if present) → defer to Phase 10 or implement via `BarChart` grid approximation

## Steps
1. Audit & map CH5 screens to wrappers; record props in `docs/Tasks/phase-9-charts-doc-mapping.md` (units, clamps, toggles, targets).
2. In `schedule-grid-system-mock`, add a shared Chart.js registrar (RU locale) and RU formatters.
3. Refactor charts to use `LineChart`/`BarChart`/`KpiCardGrid`/`ReportTable` with adapters.
4. Add Storybook stories: baseline, toggles (day/period, coverage/adherence), empty/error.
5. Add unit tests for any new adapter logic.
6. Validate build + storybook; update mapping doc; list unknowns for UAT visual capture.

## Requirements
- Russian labels/units; Y clamps (coverage 70–100 %, adherence 80–100 % where applicable)
- View toggles (day vs period, coverage vs adherence)
- RU date/number tooltips via registrar + formatters
- Accessibility: aria titles/descriptions; keyboardable toggles

## Acceptance
- Scheduling demo builds cleanly; stories render without console warnings
- Stories reflect CH5 screenshots (labels/clamps/toggles)
- Unit tests pass for adapters/formatters
- Mapping doc updated; unknowns listed for UAT

## Out of Scope
- Full grid virtualization or drag & drop (Phase 10)
- Backend algorithms for optimization

