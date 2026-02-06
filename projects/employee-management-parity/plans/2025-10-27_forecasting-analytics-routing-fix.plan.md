# Plan — Forecasting & Analytics Routing Fix + UAT Step 6

## Goal
Restore Forecasting & Analytics prod routes so `/accuracy`, `/trends`, and `/adjustments` render correctly, then deliver a clean Step 6 UAT pass with documentation updates.

## Inputs & References
- Discovery: `docs/Tasks/forecasting-analytics-routing-discovery.md`
- Repo: `${FORECASTING_ANALYTICS_REPO}` (App shell `src/App.tsx`, routers, trend/accuracy/adjustment components)
- Build config: `vite.config.ts`, `public/index.html`, Vercel route config (new `vercel.json`)
- Docs to update after execution: `uat-agent-tasks/2025-10-26_forecasting-uat.md`, `docs/System/WRAPPER_ADOPTION_MATRIX.md`, `docs/System/PARITY_MVP_CHECKLISTS.md`, `docs/System/learning-log.md`, `docs/Tasks/post-phase9-demo-execution.md`, `docs/SESSION_HANDOFF.md`, `PROGRESS.md`
- UAT packs: `docs/Tasks/uat-packs/parity_static.md`, `docs/Tasks/uat-packs/chart_visual_spec.md`

## Scope
- Introduce production-safe routing (BrowserRouter + Vercel rewrites preferred; HashRouter fallback acceptable if blockers arise)
- Wire `/accuracy`, `/trends`, `/adjustments` to the existing dashboard components
- Ensure each route gets required props / guards to prevent runtime crashes (trend dateRange defaults, queueIds, adapter null checks, manual adjustments initial state)
- Ship a smoke check that exercises all three routes pre-deploy (Playwright or lightweight script)
- Redeploy to Vercel, rerun Step 6 UAT, and sync parity docs

## Tasks
1. **Routing Infrastructure**
   - Add `BrowserRouter` (or HashRouter if rewrites are infeasible) around `App` root (`src/main.tsx` / new `src/routes.tsx`).
   - Create explicit routes for `/accuracy`, `/trends`, `/adjustments` using `react-router-dom` (`Routes`, `Route`, `Navigate`).
   - Update top navigation/buttons to use `Link`/`NavLink` instead of local state; preserve existing styling/aria labelling.
   - Add Vercel rewrite (`vercel.json`) to send all paths to `/index.html` (skip if HashRouter chosen).

2. **Safe Defaults & Guards**
   - Provide default `queueIds` and `dateRange` values for Trend dashboard route wrapper (e.g., last 7 days, sample queue).
   - Update forecasting adapters/components (`buildTrendMetaSummary`, etc.) to handle missing config gracefully (`dateRange` optional).
   - Ensure manual adjustments route loads `ManualAdjustmentSystem` without relying on in-memory state.
   - Verify accuracy dashboard loads without additional props.

3. **Pre-Deploy Smoke**
   - Add a lightweight check (`npm run smoke:routes` or Playwright snippet) that loads `/accuracy`, `/trends`, `/adjustments` and fails on non-200/console errors.
   - Document how to run the smoke in README or scripts.

4. **Validation & Deploy**
   - Run `npm run build`, unit tests (`npm run test:run`), and the new smoke check locally.
   - Deploy to Vercel (`npx vercel deploy --prod --yes`) once smoke passes.

5. **UAT Step 6 & Documentation**
   - Re-run `parity_static` + `chart_visual_spec` against the new prod URL; record Pass/Fail in `uat-agent-tasks/2025-10-26_forecasting-uat.md` with screenshots/notes.
   - Update system docs (wrapper matrix, MVP checklist, learning log), tracker table, Code Map if needed, and add handoff summary + PROGRESS status.

## Acceptance Criteria
- `/accuracy`, `/trends`, `/adjustments` load without console errors in prod (verified via smoke + UAT).
- Trend dashboard renders confidence band/legend using safe default props.
- Manual Adjustments grid accessible via direct route.
- Step 6 UAT table updated with Pass results and screenshots; tracker + PROGRESS reflect completion.
- Routing strategy documented for future maintainers (note rewrite vs HashRouter) and smoke script included.
