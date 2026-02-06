# Forecasting & Analytics – Routing & Runtime Failure Discovery

## Objective
Document why the Forecasting & Analytics demo breaks when agents navigate via direct URLs (`/accuracy`, `/trends`, `/adjustments`) so the next planner can scope a routing/initialisation fix that allows UAT Step 6 to complete.

## Current Behaviour
- **No router / local-state tabs only.** `src/App.tsx` swaps views through `useState<'accuracy'|'trends'|'forecasting'>` and `setCurrentView`, never mounting React Router despite the dependency (`react-router-dom`) being installed. Top buttons do not change the browser URL (`forecasting-analytics/src/App.tsx:9-74`).
- **Direct URLs 404 in prod.** Opening `https://forecasting-analytics-cv3t45r52-granins-projects.vercel.app/trends` (or `/adjustments`, `/accuracy`) returns Vercel’s `404: NOT_FOUND` page because the build lacks rewrites to `index.html` (`test-results/forecasting-uat-results-2025-10-13.json`; manual Playwright check captured the same 404).
- **Trend tab crashes even when loaded via UI.** Clicking “Анализ трендов (3 графика)” while staying on `/` throws `TypeError: Cannot read properties of undefined (reading 'start')` and leaves a blank screen (`playwright console log`: index bundle line ~63). Root cause: `TrendAnalysisDashboard` expects a `dateRange` prop and dereferences `dateRange.start` without a fallback, but `App.tsx` mounts the component without passing `queueIds` or `dateRange` (`forecasting-analytics/src/App.tsx:43-46`, `forecasting-analytics/src/components/forecasting/trends/TrendAnalysisDashboard.tsx:20-38`, `…/adapters/forecasting/trends.ts:146-159`).
- **Manual adjustments route unavailable.** External UAT reports `/adjustments` blank. Locally, the component renders when mounted through tabs, but any future router must expose a `/adjustments` path that loads `ManualAdjustmentSystem` (currently only reachable through `currentView === 'forecasting'`).

## Impact
- Prod deploy is unusable via deep links; UAT cannot run parity packs or capture screenshots, blocking plan step 6 and downstream documentation updates.
- Trend dashboard tab collapses the entire app due to the `dateRange` null dereference, explaining the blank screenshots UAT returned even when clicking the tab from the landing page.
- Any planner must account for both routing infrastructure and runtime defaults before asking UAT to retry.

## Inventory & Evidence
| Area | Location | Notes |
| --- | --- | --- |
| Nav shell | `forecasting-analytics/src/App.tsx:9-74` | Buttons toggle `currentView`; URL never changes. |
| Trend dashboard props | `forecasting-analytics/src/App.tsx:43-46` | Component invoked without `queueIds`/`dateRange`; needs defaults or router-level loader. |
| Trend meta builder | `forecasting-analytics/src/adapters/forecasting/trends.ts:146-159` | Uses `dateRange.start/end` unconditionally → runtime `TypeError`. |
| Console failure | Playwright console capture (`console: error TypeError…` from `index-C1mYo6a8.js`) | Confirms blank screen cause when tab clicked. |
| Direct-route 404 | `https://forecasting-analytics-cv3t45r52-granins-projects.vercel.app/trends` | Returns Vercel 404; no SPA fallback configured. |
| Router assets | repo contains `react-router-dom` but no `<BrowserRouter>` and no `vercel.json` rewrites (`forecasting-analytics/package.json:15-21`, project root lacks routing config). |

## Risks & Open Questions
- Adding routing may require restructuring layout state (breadcrumbs, hero tabs) into route-aware components; planner should confirm how to keep existing styling with `<NavLink>` or similar.
- Vercel fallback needs either `vercel.json` rewrites or switching to `HashRouter` to avoid additional infra work—decide which approach keeps parity with other demos.
- Trend dashboard sample data currently regenerated in `useEffect`; ensure route-level initialisation preserves that behaviour and avoids double timers.

## Recommendations for Planner
1. Pick a routing strategy: lightweight HashRouter (no backend rewrites) vs BrowserRouter + `vercel.json` rewrite to `/index.html`. Align with other parity demos (Employee Management uses BrowserRouter + rewrite).
2. Update `App.tsx` to define explicit routes (`/accuracy`, `/trends`, `/adjustments`) that render the existing components. Wire top buttons to `<Link>`/`useNavigate` instead of `useState`.
3. Provide default props for trend dashboard (e.g., sample `queueIds` array and `dateRange` spanning last 7 days) inside the route wrapper so the component stops crashing. Alternatively make adapters tolerate missing dates.
4. Add regression: manual smoke harness hitting each route (Playwright smoke or simple fetch) so 404s surface before deploy.
5. After routing fix, rerun `parity_static` + `chart_visual_spec` and refresh documentation with passing evidence.

## Hand-off Snapshot
- External UAT evidence stored in `uat-agent-tasks/2025-10-26_forecasting-uat.md` (all three checks Fail).
- Trend tab runtime error reproduced locally; screenshot `test-results/trend-click.png` captures blank result after console error.
- Blocking issue flagged in `PROGRESS.md` and tracker; awaiting planner plan once routing approach confirmed.
