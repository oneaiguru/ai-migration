# Routes 2.0 — “Three New Columns” Implementation

Scope: Explain how the UI renders the Routes table with the extra forecast columns that reviewers asked for. This doc is included in the UI review bundle.

What the table shows
- Core: Site ID, Address
- Forecast: Fill percent (`fill_pct`), Overflow risk (`overflow_prob`)
- New columns (joined when present): Volume (`volume`), Schedule (`schedule`), Last service date (`last_service_dt`)

Code references
- Routes table component: `src/components/RoutesTable.tsx:1`
  - Data shape: `SiteWithForecast` (address/volume/schedule/fill_pct/risk/last_service)
  - Risk badge: `components/shared/RiskBadge.tsx:1`
  - Fill bar: `components/shared/FillBar.tsx:1`
- Types & validation
  - Types: `src/types/api.ts:1` (`ApiRouteRec`, `SiteWithForecast`)
  - Runtime guards: `src/types/validators.ts:1` (`parseRoutes`, `parseSites`)
- Data sources & merge
  - Props `recs` from `Routes.tsx` (policy strict/showcase)
  - `RoutesTable` fetches `/api/sites?date=...` and merges additional fields via `sitesById`

CSV download UX
- Server-first: `apiGetCsv('/api/routes?date&policy')`
- Feedback: disabled state + status message
- Fallback: if server returns JSON, client renders CSV from JSON (safe for demo)

Fallback behaviour
- If `/api/routes` returns empty, `useRoutesData` derives strict/showcase lists from `/api/sites` thresholds (strict ≥80% overflow or fill; showcase ≥50% overflow or ≥60% fill).

Acceptance
- Column parity visible in UI and screenshots (Routes table, sorted by risk).
- CSV button shows “Скачивание…” during download; error feedback on failure.

Notes
- No API changes required; table renders new columns only when values are present in `/api/routes`.

