# Next UI Agent Session — Scout → Planner → Executor (Post‑Demo)

Next Task (PR‑18: Site Forecast)
- Read: `docs/Tasks/PR-18_UI_PLANNER_SCOUT.md:1`, then `docs/Tasks/PR-18_site_forecast_ui.md:1`
- Goal: add `useSiteForecast` hook and `SiteForecast.tsx` component (optional modal in Sites table) consuming BE `GET /api/sites/{site_id}/forecast`.
- Acceptance (summary): chart renders for a known site id with ≥1 data point; no console errors; PR smokes remain green.
- Commands: `npm test -s`; `PW_TIMEOUT_MS=30000 E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npx playwright test --workers=1 --reporter=line`.

Status (2025-11-05)
- Phase 1 (CSV a11y) — DONE in `src/components/RoutesTable.tsx` (aria-live/role=status + aria-busy)
- Phase 2 (Data cohesion) — DONE via `useSitesData(date)` in parent `Routes.tsx` and optional `sites` prop in `RoutesTable`
- Tests — Unit 12/12 PASS; PR E2E smokes PASS (serial); no contract changes

Role & Scope
- Role: Start as Scout, then author a Planner doc; execute only after plan is approved.
- Scope: UI only; keep API contracts unchanged. Demo‑safe improvements first.

Required Reading (read in full)
- CE/SOP
  - /Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md:1
  - /Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md:1
  - /Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md:1
  - /Users/m/git/tools/agentos/docs/System/context-engineering.md:1
  - forecast-ui/docs/SOP/TEST_RUN_SOP.md:1
- Reviewer files (UI)
  - forecastingrepo/reviews/20251105/ui_components/1_feedback/UI_Components_Code_Review_Report.md:1
  - forecastingrepo/reviews/20251105/ui_components/2_followup/ui_components.md:1
  - forecastingrepo/reviews/20251105/ui_config/1_feedback/UI_Config_and_Demo_Review/README.md:1
- UI bundle docs
  - forecast-ui/reviews/COORDINATOR_DROP_UI.md:1
  - forecast-ui/reviews/ROUTES_IMPLEMENTATION.md:1
  - forecast-ui/reviews/ui_supporting_bundle/README.md:1

Ground Truth (code anchors)
- CSV UX: `src/components/Routes.tsx:1`, `src/components/RoutesTable.tsx:1`
- Atoms: `src/components/shared/RiskBadge.tsx:1`, `src/components/shared/FillBar.tsx:1`
- Data hooks: `src/hooks/useRoutesData.ts:1`, `src/hooks/useSitesData.ts:1`
- Types/guards: `src/types/api.ts:1`, `src/types/validators.ts:1`
- Layout/nav: `src/components/Sidebar.tsx:1`, `src/components/Layout.tsx:1`

Desired End State (post‑demo, demo‑safe)
- CSV status in table view is announced to assistive tech (aria‑live) and buttons expose aria-busy appropriately.
- Routes table doesn’t briefly show date‑mismatched routes/sites when switching dates.
- E2E PR smokes remain green; no UI behavioral regressions.

What We’re NOT Doing (for this demo)
- No i18n extraction (RU‑only is fine).
- No keyboard navigation overhaul.
- No Route Builder features (prototypes remain docs‑only).

Plan — Phase 1 (CSV a11y semantics) [~0.5h]
- File: `src/components/RoutesTable.tsx:1`
  - Add `aria-live="polite"` and `role="status"` to the CSV status span.
  - Ensure the CSV button has `aria-busy` while downloading.
- Acceptance:
  - Status text appears and is read by screen readers; button is disabled and marked busy during fetch; status auto‑clears.
- Validation:
  - Unit: `npm test -s`
  - PR E2E: `PW_TIMEOUT_MS=30000 E2E_BASE_URL=$URL npx playwright test --workers=1 --reporter=line`

Plan — Phase 2 (Data‑fetch cohesion) [~0.5–1.5d]
- Goal: avoid transient mismatch between routes `recs` and fetched `sites` in `RoutesTable` on date switch.
- Approach A (prop‑first, minimal deps):
  - Create `hooks/useSitesForDate.ts` returning sites for a date (reuses `apiGet` + `parseSites`).
  - In `Routes.tsx:1`, call `useSitesForDate(date)` and pass `sites` to `RoutesTable` via a new optional prop.
  - In `RoutesTable.tsx:1`, if `props.sites` present, skip internal fetch and use the provided array.
- Acceptance:
  - Changing date never shows mismatched routes/sites; redundant site fetch eliminated on table mount.
- Validation:
  - Unit: add a tiny test that supplies `sites` prop and asserts no internal fetch (mock `apiGet`).
  - PR E2E unchanged; smokes green.

Optional — Phase 3 (Performance) [~0.5–1.5d]
- Add simple pagination to Sites and Routes table when row count > N (e.g., 200), or integrate `react-window` for virtualization.
- Acceptance: with 500+ rows, scrolling/render remains smooth.

Commands (always)
- Unit: `cd forecast-ui && npm test -s`
- PR E2E: `PW_TIMEOUT_MS=30000 E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npx playwright test --reporter=line --workers=1`
- Nightly (optional): `npm run test:e2e:nightly`
- Bundle (if requested): `npm run bundle:review`

Handoff Notes
- Keep API contracts unchanged; do not alter table columns/labels.
- Keep size‑gate advisory; no large refactors without approval.
- After execution, append results to `docs/SESSION_HANDOFF.md:1` (commands, outcomes, any follow‑ups).
