# UI Supporting Bundle — Types & Configs

Purpose: Give reviewers a single place to verify API types, validators, and configs used by the UI.

Included paths (clickable in repo)
- Types: `src/types/api.ts:1` — `ApiRouteRec`, `ApiSite`, `SiteWithForecast`
- Validators: `src/types/validators.ts:1` — `parseRoutes`, `parseSites`, `parseMetrics`
- API client: `src/api/client.ts:1` — `apiGet`, `apiGetCsv` (server-first CSV + JSON fallback)
- Demo utils: `src/utils/demo.ts:1` — derives `VITE_DEMO_DEFAULT_DATE`
- Vite config: `vite.config.ts:1` — prod build + test env
- Env slots: `VITE_API_URL`, `VITE_DEMO_DEFAULT_DATE` (documented in Coordinator Drop)

Notes for reviewers
- Zod guards are applied where helpful; UI tolerates missing optional fields and shows zero-states.
- Routes table joins site fields when present to show the “3 new columns” (volume/schedule/last service).
- CSV UX: buttons disable during fetch; errors surface inline. See E2E HTML report + TIMINGS in the UI bundle.

Acceptance
- Open the linked files to confirm shapes and fallbacks.
- Compare with API OpenAPI document for `/api/sites` and `/api/routes`.

