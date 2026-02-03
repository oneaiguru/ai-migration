## Metadata
- Task: UI Demo Readiness — Parity, Tests, Bundle
- Discovery: reviews/20251105/ui_components/2_followup/ui_components.md:1; reviews/20251105/ui_config/2_followup/ui_config_support.md:1; forecastingrepo/docs/Tasks/NEXT_AGENT_SCOUT.md:1 (UI anchors)
- Related docs: forecast-ui/docs/SOP/TEST_RUN_SOP.md:1; forecast-ui/HOWTO_E2E.md:1; forecast-ui/playwright.config.ts:1; forecast-ui/scripts/make_ui_review_bundle.sh:1

## Desired End State
- Sidebar IDs match tabs (overview, districts, sites, routes, routes2) and tabs render only in Forecast section.
- Unit + E2E smokes pass against prod alias within expected timings.
- Review bundle ZIP (dist + HTML report + screenshots + timings) produced and dropped into reviewer folders.
- No contract changes; no heavy refactors pre‑demo.

### Key Discoveries (file:line)
- forecast-ui/src/components/Sidebar.tsx:10 — menu IDs present and correct.
- forecast-ui/src/components/Layout.tsx:51 — tabs render only when `currentSection === 'forecast'`.
- forecast-ui/src/App.tsx:41–45 — routes for tabs include routes2.
- forecast-ui/src/components/Routes.tsx:7–15 — CSV UX present; uses `useRoutesData`.
- forecast-ui/src/components/RoutesTable.tsx:14–33 — sites join + zod guards.
- forecast-ui/src/hooks/useRoutesData.ts:6–31; useSitesData.ts:6–20 — data hooks wired.
- forecast-ui/playwright.config.ts:15 — baseURL defaults to prod alias.
- forecast-ui/scripts/make_ui_review_bundle.sh:1–35 — bundler copies dist/report/shots/timings.

## What We're NOT Doing (pre‑demo)
- No API contract or schema changes.
- No large refactors (Routes/Sites splits) unless files exceed thresholds.
- No router framework change or Next.js migration.

## Implementation Approach
- Verify UI parity and tests. Produce bundle. Keep doc updates minimal (SOP only).

## Phase 1: Verify Navigation Parity
### Changes Required
- None expected (parity already implemented). Reconfirm:
  - `forecast-ui/src/components/Sidebar.tsx` IDs list.
  - `forecast-ui/src/components/Layout.tsx` tab rendering condition.

## Phase 2: Run Tests (Unit + E2E)
### Commands
```
cd forecast-ui
npm test -s
PW_TIMEOUT_MS=30000 E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npx playwright test --workers=1 --reporter=line
```
### Expect
- Unit: all passing.
- E2E: 5 specs passing; total ~40–50s; routes ≤45s; HTML report in `playwright-report/`.

## Phase 3: Build Review Bundle
### Commands
```
cd forecast-ui && npm run bundle:review
```
### Expect
- ZIP at `~/Downloads/ui_review_bundle_<timestamp>.zip` with: `dist/`, `playwright-report/`, `screenshots/`, `TIMINGS.md`, `ENDPOINTS.txt`.

## Phase 4: Deliver & Handoff
### Actions
- Drop ZIP into:
  - `/Users/m/Downloads/review_flat_20251105_134628/UI_Reviewer/`
  - `/Users/m/Downloads/review_flat_20251105_134628/UI_Components_Reviewer/`
  - `/Users/m/Downloads/review_flat_20251105_134628/UI_Config_Reviewer/`
  - `/Users/m/Downloads/review_flat_20251105_134628/UI_Supporting_Reviewer/`
- Update `forecast-ui/reviews/WORK_DONE_OVERVIEW.md` with latest timings and bundle path if changed.

## Tests & Validation
- Unit + E2E results pasted to coordinator message.
- `curl -m5 -fsSI https://mytko-forecast-ui.vercel.app` returns 200 OK.

## Rollback
- No code changes planned. If SOP text changed, revert via git: `git checkout -- docs/SOP/TEST_RUN_SOP.md`.

## Handoff
- Post one-liner status + curls + ZIP paths.
- Note in UI handoff doc (`NEXT_AGENT_HANDOFF.md`) if timings drift from expected.

