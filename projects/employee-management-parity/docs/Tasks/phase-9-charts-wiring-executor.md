# Phase 9 – Charts Wiring Task (Executor)

## Goal
Wire the stubbed chart components to Chart.js via `react-chartjs-2`, adhering to CH doc visuals and the UAT visual spec.

## Targets
- Components: `src/components/charts/*`
- Utilities: `src/utils/charts/*`

## Steps
1) LineChart
   - Render multi-series line with optional area fill
   - Support `clamp` on Y, RU locale tooltips, dashed target lines
   - Storybook: baseline, with targets, empty
2) BarChart
   - Grouped/stacked series, respect `clamp`, implement view toggle
   - Storybook: daily/overall toggle, stacked coverage/adherence
3) DoughnutChart
   - Legend position top/bottom, percent tooltip
   - Storybook: distribution example
4) KpiCardGrid
   - Tokens for colors/typography; trend glyphs
5) ReportTable
   - Sticky header, width hints; no data virtualization needed
6) Adapters/formatters
   - Implement `toLineSeries`, `toBarDatasets`, `toDoughnutDataset` per doc mapping
   - Unit tests for formatters (number/percent/hours)

## Acceptance
- Builds pass, no console warnings
- Stories render as per CH screens (approximate until UAT spec arrives)
- Lint/typecheck clean

## Result – 2025-10-15 (Executor)
- Chart components now render via `react-chartjs-2` with RU-localised tooltips, clamps, targets, and accessible summaries.
- Added adapters/formatters in `src/utils/charts/` plus Vitest coverage.
- Storybook stories cover baseline, target, toggle, empty/error scenarios for each chart primitive.
- Validation: `npm run build`, `npm run typecheck`, `npm run test:unit`, `npm run storybook:build`.
- Commits: `ef067cf` (Phase 9: wire chart components), `807400f` (registrar + Storybook controls).
- Known Unknowns: финальные цветовые токены, точный dash-паттерн для целевых линий, официальные подписи осей/легенд из продуктовой UI-спецификации.

## References
- CH6_Reports, CH5_Schedule_* (visuals & labels)
- `docs/Tasks/phase-9-charts-ui-visual-spec.md`
- `docs/Tasks/phase-9-charts-doc-mapping.md`
