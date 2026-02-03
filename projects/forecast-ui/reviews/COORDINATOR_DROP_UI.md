# Coordinator Drop — UI (Open First)

- Live UI (prod alias): https://mytko-forecast-ui.vercel.app
- Demo date: 2024-08-03 (UI reads from `/api/metrics.demo_default_date`)
- What’s inside the UI ZIP:
  - `dist/` production build
  - `playwright-report/` HTML
  - `screenshots/` (overview.png, routes_table.png, plan_assignments.png)
  - `TIMINGS.md` (per‑spec durations)
  - `ENDPOINTS.txt` (quick pointers)
  - React Query + TanStack adoption notes (see README_STATUS.md)

Quick smoke (serial)
```
PW_TIMEOUT_MS=30000 E2E_BASE_URL=https://mytko-forecast-ui.vercel.app \
  npx playwright test --workers=1 --reporter=line
```

CSV UX check (Routes)
- Click “Скачать CSV” → button shows “Скачивание…” and is disabled during fetch.
- Failure shows an inline error near the button; status is announced (role="status", aria-live="polite").

Site accuracy (demo tile)
- The Sites page shows three tiles sourced from `accuracy_demo.json` (Overall site WAPE, Median site WAPE, Sites evaluated). This is UI‑only and demo‑safe.

Tech stack notes
- Data fetching now uses React Query (caching, dedupe)
- Sites/Routes tables render via TanStack Table (no virtualization yet)

Pagination & table semantics (post‑demo polish now applied)
- Pager controls are labeled (aria-label on Next/Prev; Rows per page)
- Sorted header exposes correct aria-sort; others omit aria-sort
- Stable data-testid anchors added to screens and pager controls

If backend refreshes demo data
- Re‑run the serial E2E to refresh HTML report and TIMINGS before sharing.

API base for backend
- Current BASE (BE tunnel): https://showing-shaved-demo-league.trycloudflare.com
- UI uses build‑time env `VITE_API_URL` to call the API. Ensure this env is set in the Vercel project and redeploy Production if calls fail with “Failed to fetch”.
- Backend CORS should allow https://mytko-forecast-ui.vercel.app (BE has this configured per handoff notes).

PR‑18 (UI) — Site Forecast
- Hook: `src/hooks/useSiteForecast.ts` — wraps `GET /api/sites/{site_id}/forecast` (window preferred; days fallback)
- Component: `src/components/SiteForecast.tsx` — Recharts line chart (`role="region"`, label: «Прогноз по площадке»)
- Optional integration (deferred): “Прогноз” action in Sites table to open a modal with `<SiteForecast />`
