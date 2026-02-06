# Phase 9 – Charts Data Contracts & Adapters (Executor)

## Goal
Specify minimal, stable data shapes and add adapters to map domain data to chart datasets (no API calls yet).

## Deliverables
- `docs/Phase9/data-contracts.md` (or inline below):
  - Time series point `{ timestamp: ISO8601, value: number }`
  - Series `{ id, label, unit, points[] }`
  - Target line `{ label, value|series, style: 'dashed' }`
  - Table row `{ [columnId]: string|number }`
- `src/utils/charts/adapters.ts` (stubs):
  - `toLineSeries(domain, opts)`
  - `toBarDatasets(domain, opts)`
  - `toDoughnutDataset(domain, opts)`
- `src/utils/charts/format.ts`:
  - RU date/time formatters, number/percent formatters

## Acceptance
- Unit tests for formatters and adapter shape (Vitest)
- Examples in comments for each adapter (input → output)

## References
- CH6_Reports.pdf (series and tables)
- CH5_Schedule_* (coverage/adherence metrics)

