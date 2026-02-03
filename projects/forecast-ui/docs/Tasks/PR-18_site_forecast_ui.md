# PR-18 UI — Site Forecast React View

## Scope
- Add a lightweight “Site Forecast” view for a single site: hook + component (+ optional modal). No routing churn, RU labels, demo-safe.

## Files
- `src/hooks/useSiteForecast.ts`
  - React Query key: `['siteForecast', siteId, window]`.
  - Fetch `GET /api/sites/{site_id}/forecast?window=…`.
  - Config: `{ staleTime: 30000, gcTime: 300000, retry: (count) => count < 1 }`.
- `src/components/SiteForecast.tsx`
  - Render line chart (Recharts) of `pred_mass_kg` (or `fill_pct`) vs `date`.
  - Accessible region: `role="region"`, `aria-label="Прогноз по площадке"`.
- *(Optional integration)* add a “Прогноз” button in the Sites table row to open modal/drawer with `<SiteForecast siteId=… />`.
  - Touch `src/components/table/SitesTanStackTable.tsx` if you add the action/column.

## Tests
- Unit (RTL):
  - `src/hooks/tests/useSiteForecast.test.ts`.
  - `src/components/tests/SiteForecast.test.tsx`.
- E2E (optional nightly):
  - `tests/e2e/site_forecast_modal.spec.ts` (open modal for one site, assert chart renders).

## Config & docs
- No API contract changes beyond the new endpoint.
- Add a short note to `reviews/COORDINATOR_DROP_UI.md` (“Site forecast view”).

## Flat review bundles (UI)
- `reviews/ATTACH_REVIEWERS/UI_COMPONENTS/` → add `SiteForecast.tsx` (and any small modal wrapper if created).
- `reviews/ATTACH_REVIEWERS/UI_SUPPORTING/` → only if you add date-window utilities.
- `reviews/ATTACH_REVIEWERS/UI_CONFIG/` → unchanged.

## Acceptance
- Open Sites tab, click “Прогноз” for a known site ID (e.g., `S001`).
- Chart renders with ≥1 data point, no console errors, PR smokes stay green.
