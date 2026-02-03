# Scout Notes — UI File & Line Anchors (2025‑11‑05)

All references are 1‑based line numbers.

## Navigation & Parity (verified)
- forecast-ui/src/components/Sidebar.tsx:10 — menu IDs: overview, districts, sites, routes, routes2 (plus plans, registry).
- forecast-ui/src/components/Layout.tsx:51 — tabs render only when `currentSection === 'forecast'`.
- forecast-ui/src/App.tsx:41 — tab switch includes `routes2`.

## Routes screens
- forecast-ui/src/components/Routes.tsx:1 — main container (≈242 LoC). CSV UX:
  - Busy/label: :115, :162; error inline: :12, :118, :165.
- forecast-ui/src/components/RoutesTable.tsx:1 — presentational table (≈191 LoC); joins sites and guards with zod; fetch at :30–33.
- forecast-ui/src/hooks/useRoutesData.ts:6 — strict/showcase fetch; fallback derive from sites when needed.

## Sites screen
- forecast-ui/src/components/Sites.tsx:1 — container (≈165 LoC). Filters and counts at :15, :85.
- forecast-ui/src/hooks/useSitesData.ts:6 — fetch + zod guard.

## API & validators
- forecast-ui/src/api/client.ts:1 — `VITE_API_URL` base; `apiGet` and `apiGetCsv` used by screens.
- forecast-ui/src/types/validators.ts:54 — `parseSites`, `parseRoutes`.

## E2E config & specs
- forecast-ui/playwright.config.ts:15 — baseURL defaults to prod alias; HTML report output.
- forecast-ui/tests/e2e/overview.spec.ts:1 — overview screenshot when `E2E_TAKE_SHOTS`.
- forecast-ui/tests/e2e/routes_table.spec.ts:1 — PR smoke with optional download; routes timeout 45s.
- forecast-ui/tests/e2e/districts_table.spec.ts:1 — district table + pie chart.
- forecast-ui/tests/e2e/sites_table.spec.ts:1 — sites table + filter present.
- forecast-ui/tests/e2e/plan_assignments.spec.ts:1 — critical‑only toggle.

## Bundle & SOP
- forecast-ui/scripts/make_ui_review_bundle.sh:1 — dist + HTML report + shots + timings in ZIP under ~/Downloads.
- forecast-ui/docs/SOP/TEST_RUN_SOP.md:1 — PR timeouts (30s), nightly (60s), background runs, observed timings.

## Suggested Targets (post‑demo)
- Split (no behavior change):
  - Routes → `components/routes/RoutesContainer.tsx`, `components/routes/RoutesTableView.tsx` (keep hooks in `hooks/*`).
  - Sites → `components/sites/SitesContainer.tsx`, `components/sites/SitesTableView.tsx` when/if file grows >300–350 LoC.
- New nightly spec: `tests/e2e/registry_filter.spec.ts` covering text/risk filter behavior in the Registry view.
- Advisory lint/format: add ESLint + Prettier configs; wire `npm run lint` + `format:check` (non‑blocking initially).
- Size‑gate advisory: add `scripts/ci/check_large_files_ui.sh` with warn>350, block>500 (block enforce later).

