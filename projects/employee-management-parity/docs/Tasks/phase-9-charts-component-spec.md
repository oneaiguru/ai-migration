# Phase 9 – Charts Component API Spec (Executor)

## Goal
Define doc-driven, reusable chart wrappers that match CH docs visuals (no data plumbing yet).

## Components
- `LineChart` – multi-series, optional area fill, dashed target lines
- `BarChart` – grouped/stacked, view toggles
- `DoughnutChart` – category distribution
- `KpiCardGrid` – KPI tiles with trend/status
- `ReportTable` – tabular reports (T‑13, Payroll, Variance)

## Props (initial)
- Common: `series`, `labels`, `yUnit('hours'|'percent'|'people')`, `clamp?: {min?:number,max?:number}`, `targets?: TargetLine[]`, `ariaTitle`, `ariaDesc`
- LineChart: `area?:boolean`, `timeScale?: 'day'|'week'|'month'`
- BarChart: `stacked?:boolean`, `viewToggle?: {id:string,label:string}[]`, `activeViewId?:string`
- DoughnutChart: `legendPosition?: 'top'|'bottom'`
- KpiCardGrid: `items: {label:string,value:string,trend?:'up'|'down'|'stable'}[]`
- ReportTable: `columns`, `rows`, `export?: {pdf?:boolean,xlsx?:boolean,csv?:boolean}`

## Acceptance
- TS types compile; components render placeholders only
- A11y: accepts `ariaTitle`/`ariaDesc`; no runtime warnings
- Storybook stories stubbed (baseline/empty/error)

## References
- CH6_Reports.pdf (visuals/labels)
- CH5_Schedule_* (coverage/adherence visuals)
- phase-8-triple-uat-brief.md (screenshot expectations)

---

### Out of scope
Real data, styling polish, and adapters are separate tasks.

