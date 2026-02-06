# Phase 9 – Follow‑ups (Scheduling Behavior Parity)

Status: post‑UAT cleanup list; no visuals.

Latest build(s):
- UAT‑verified: https://schedule-grid-system-mock-7hx5y0g9x-granins-projects.vercel.app
- Log cleanup: https://schedule-grid-system-mock-4z5tqloa9-granins-projects.vercel.app
- KPI visible in 500+ view: https://schedule-grid-system-mock-hoyghvtpm-granins-projects.vercel.app

Scope: behavior‑only; wrappers frozen.

1) Keep KPI cards visible in virtualized view — DONE
- File: src/components/ScheduleGridContainer.tsx:132
- Change: Render chart + KPI area above both grid modes so KPI cards don’t disappear in 500+.
- Validation: manual toggle to 500+ shows KPI cards; coverage updates; no console errors.

2) Integration smoke tests for charts — DONE
- File: tests/unit/charts/linechart.integration.spec.ts:1
- Content: render LineChart for category (day) and time scale (timestamps) via react‑chartjs‑2 mock.

3) Adapters timestamp consistency — DONE
- File: src/utils/charts/adapters.ts:1
- Detail: emit ms timestamps for period buckets and derived overlay series.

4) Optional (future slices)
- Coverage/Adherence toggle in overlay (map via BarChart viewToggle; story reference at src/components/charts/__stories__/BarChart.stories.tsx:63).
- Tooltips/legend interactivity: non‑blocking; consider enabling tooltips if needed.
- Build/FTE header buttons: out of scope; wire to business logic when available.

Validation
- npm run build; npm test (or npx vitest run)
- vercel deploy --prod --yes
- Update docs/CH5_chart_mapping.md and employee‑management‑parity/docs/SESSION_HANDOFF.md with any new build URL.

