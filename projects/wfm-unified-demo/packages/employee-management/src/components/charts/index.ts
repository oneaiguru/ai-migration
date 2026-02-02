/**
 * Chart primitives wired to Chart.js with localisation-ready tooltips.
 *
 * Quick reference:
 * - `LineChart` – use `series`, `clamp`, and `targets` for multi‑серия дашборды (ariaTitle/ariaDesc required).
 * - `BarChart` – supports `viewToggle` + `activeViewId` for дневной/сводный режим и `stacked` агрегаты.
 * - `DoughnutChart` – supply категориальные `series`; legend позиция управляется `legendPosition`.
 * - `KpiCardGrid` – pass массив карточек `items` с `trend`/`variant` для визуального статуса.
 * - `ReportTable` – передавайте `columns`, `rows` и `export` флаги; подсумок читайте из `figcaption`.
 */
export * from './types';
export { default as LineChart } from './LineChart';
export { default as BarChart } from './BarChart';
export { default as DoughnutChart } from './DoughnutChart';
export { default as KpiCardGrid } from './KpiCardGrid';
export { default as ReportTable } from './ReportTable';
