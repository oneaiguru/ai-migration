# UI Review Follow‑ups — Minimal Work (Demo‑Safe)

Owner: UI Agent

Adopted
- CSV a11y status + aria-busy (Routes table)
- Data cohesion (sites fetched once in parent)
- React Query for metrics/sites/routes; caching + dedupe
- TanStack Table for Sites and Routes (no virtualization)
- Sites/Routes pagination (server/client respectively)

Remaining (small tasks)
- Ensure labels/aria-labels on filter selects and pager select (Sites, Routes)
- Verify visible focus styles on buttons/links across tabs
- Add header semantics confirmation in TanStack tables (scope via column headers)
- Optional nightly a11y presence check (status + pager labels)

Acceptance
- Manual Tab traversal is smooth (no traps); status announcements present where applicable
- No API contract changes; PR E2E smokes pass

Commands
- Unit: `cd forecast-ui && npm test -s`
- PR E2E (serial): `PW_TIMEOUT_MS=30000 E2E_BASE_URL=$URL npx playwright test --workers=1 --reporter=line`
- Nightly: `npm run test:e2e:nightly`
