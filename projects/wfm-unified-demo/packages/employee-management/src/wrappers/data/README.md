# Data Wrapper Library

`DataTable` wraps TanStack Table + Virtual to power the employee list. Treat it as an experimental module
until Storybook/tests graduate it from alpha.

## Props
- `data`, `columns` – forwarded to `useReactTable`; columns may include `meta.headerStyle`/`meta.cellStyle`.
- `rowHeight`, `height` – control the virtualiser viewport (defaults: 48px rows, 400px viewport).
- `enableKeyboardNavigation` – toggles Home/End/Arrow key support and Enter activation.
- `onRowClick`, `onRowKeyDown`, `onRowFocus` – receive `{ row, index, event }` context objects.
- `getRowProps` – allows per-row classes/test ids; merge with the wrapper's handlers carefully.
- `testId` – surfaces `data-testid` hooks consumed by Playwright.

## Keyboard & Accessibility
- Rows expose `tabIndex` and `aria-rowindex`. Focus restoration uses `scheduleRowFocus` during
  virtualization updates.
- Header buttons announce sorting via `aria-sort`; align Storybook stories with the production strings.
- Provide a visible table caption upstream for screen readers if you hide standard headings.

## Testing Guidance
- Vitest: `src/wrappers/__tests__/DataTable.test.tsx` covers click + keyboard payloads; expand coverage as
  new features land.
- Playwright expects the outer element to expose `data-testid="employee-table"` and row indices. Keep them
  stable when extending the API.

## Performance Notes
- Virtualisation defaults handle 5k–10k rows comfortably. Benchmark larger datasets before promising
  50k-row parity; record results in the discovery doc and AI reference.

## Storybook
See `DataTable.stories.tsx` for basic usage and selection handling. Extend scenarios for column pinning,
async loading, and pagination once those features migrate.
