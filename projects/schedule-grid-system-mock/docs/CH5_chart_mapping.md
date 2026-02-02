# CH5 Schedule Reports → Chart Wrapper Mapping

_Date: 2025-10-20_

**Status:** Frozen – awaiting UAT visual capture. Keep visuals unchanged until updated specs arrive.

| Doc (section) | Visualization | Component | Props (units / clamps / toggles / targets) | Notes |
| --- | --- | --- | --- | --- |
| CH5 Schedule Build §3.1 | Покрытие смен по дням | `LineChart` | `yUnit="people"`, `area`, labels derived from dates | Forecast vs план view в `ForecastChart` и `ChartOverlay` — https://schedule-grid-system-mock-7hx5y0g9x-granins-projects.vercel.app |
| CH5 Schedule Build §3.1 | План vs прогноз (столбцы отклонений) | `BarChart` | `yUnit="people"`, negative values via `metadata.color`, clamp auto | Переключение «Прогноз + план» ↔ «Отклонения» на прод-URL выше |
| CH5 Schedule Advanced §2.4 | Уровень сервиса | `LineChart` | `yUnit="percent"`, `clamp={{ min: 70, max: 100 }}`, `targets=[{ label: 'Цель 90%', style: 'dashed' }]` | Service view in `ForecastChart` and `ChartOverlay` |
| CH5 Schedule Build §2.2 | KPI карточки (coverage/adherence/SL) | `KpiCardGrid` | Items with `variant` + `trend` glyphs | Mounted under chart (Coverage, SL; Adherence “—”) |
| CH5 Schedule Build §4.6 | Журнал построения / действия | `ReportTable` | Columns: дата, смена, план, факт | Placeholder rows generated locally |

## Unknowns for UAT Capture
- Precise цветовые токены и тени для серий и столбцов (снимки UI нужны).
- Окончательный шаблон штриховки целевых линий (длина штриха, прозрачность).
- Подписи осей/легенд в продуктивной UI (формулировки и регистр).
- Сценарии пустых/ошибочных данных в боевой системе (доп. копирайтинг).
- Подтвердить, что RU локаль (`registerCharts` + date-fns ru) удовлетворяет требованиям прод-UI (UAT сделает контроль).

## Validation
- `npm run build`
- `npm run test`
- `npm run storybook:build`
- Production preview: https://schedule-grid-system-mock-hoyghvtpm-granins-projects.vercel.app

## UAT – Behavioral Checks (2025-10-20)
> Scope: behaviour only (no pixel/color/dash checks). Verified on the latest public build.

| Check | Pass/Fail | Notes | Screenshot |
| --- | --- | --- | --- |
| Day/Period toggle | Pass | Added time grouping in overlay and container; `ForecastChart`/`ChartOverlay` apply `toPeriodSeries` and pass `timeScale`. | — |
| Coverage/Adherence toggle | Fail | Not present as a direct toggle; overlay exposes tabs for Прогноз+план/Отклонения/SL only. | — |
| KPI tiles | Pass | `KpiCardGrid` mounted under chart with Coverage, SL, and Adherence (—); visible in both default and 500+ (virtualized) views. | KPI area |
| Σ/123 overlays (headcount/FTE) | Pass | Derived from real schedules and toggled via header checkboxes; appended as extra line datasets. | — |
| Tooltips/Legend (RU) | Partial | Legends display RU series names and target lines, but tooltips do not appear on hover and legend items are not interactive. | Forecast view |
| Units/Labels | Pass | RU numbers/percent and sensible clamps via `registerCharts` + formatters. | — |
| Filters/Toolbar | Partial | Search input (“Поиск по навыкам”) is inert (expected); virtualization switch works and does not break charts. | — |
| Empty/Error states | Pass | Wrappers show clean empty/error states; stories cover both. | — |
| Accessibility | Pass (wrapper level) | `figure` with `aria-label/description`; toggles are native buttons. Note: header exposes hidden controls reachable via keyboard only (documented quirk). | — |
| Performance/Errors | Blocked | Live behind auth. Local build responsive; no console errors in stories/tests. | — |

Functional notes
- Coverage/Adherence toggle is not present (out of scope for this slice).
- Tooltips are optional and may not appear (non‑blocking per walkthrough).

## Proposed Behaviour Wiring (Design-only)
> No code in this pass. This outlines the minimal adapter/series strategy and insertion points so Planner/Executor can implement without changing visuals.

- Day → Period regrouping
  - Adapter: `toPeriodSeries(input: Series[], { unit: 'week' | 'month' })` that buckets by ISO week/month and aggregates by unit: `people|hours → sum`, `percent → mean`.
  - Where to apply: after assembling `forecastSeries`, `deviationSeries`, `serviceSeries` in `src/components/ChartOverlay.tsx:36` and `src/components/ForecastChart.tsx:11`; pass `timeScale` to `LineChart` per `types.ts:27`.

- Coverage/Adherence toggle
  - Strategy: use `BarChart`'s built‑in `viewToggle/activeViewId` and tag series via `metadata.viewId` (see story `src/components/charts/__stories__/BarChart.stories.tsx:63`).
  - Where: wire simple toggle in overlay header near view tabs; filter datasets by `activeViewId` before passing to `BarChart`.

- KPI consistency (Coverage, SL; Adherence “—”)
  - Source: Coverage from `scheduleStats.coveragePercentage` (`src/components/ScheduleGridContainer.tsx:147`); SL from the last point of the service series assembled for `ForecastChart` (`src/components/ForecastChart.tsx:11`). Adherence: “—” until a backing series exists.
  - Where: mount `KpiCardGrid` under the chart in `src/components/ScheduleGridContainer.tsx:444`.

- Σ/123 overlays (headcount/FTE)
  - Derived series (design):
    - `headcount` (`unit: 'people'`): unique `employeeId` count per date across `schedules`.
    - `fte` (`unit: 'hours'`): per‑date sum of `durationMinutes/60` across `schedules`.
  - Where: compute in container from real schedules (`src/components/ScheduleGridContainer.tsx:190`), pass as `overlaySeries` to overlay/chart; render as extra Line datasets when corresponding checkboxes are enabled.

- RU formatting, empty/error, a11y
  - Already covered by wrappers: RU locale registered (`src/utils/charts/register.ts:1`), wrappers expose `ariaTitle/ariaDesc`, and have empty/error rendering. No visual changes required.

Open questions for Planner
- Should Day/Period live as a two‑state tab (“День/Период”) or a segmented toggle near the existing view tabs?
- Do Coverage/Adherence need to coexist with the current “Отклонения” bar view, or is that a separate screen in CH5?
- Confirm KPI ordering and exact labels in RU.
