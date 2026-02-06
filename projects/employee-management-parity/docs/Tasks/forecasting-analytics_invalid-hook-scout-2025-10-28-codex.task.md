# Task — Forecasting & Analytics Invalid Hook Call (Scout)

Meta
- Agent: forecasting-analytics-scout-2025-10-28-codex
- Date: 2025-10-28
- Repo under investigation: `${FORECASTING_ANALYTICS_REPO}`
- Comparison repos (same toolchain): `${MANAGER_PORTAL_REPO}`, `${ANALYTICS_REPO}`, `${EMPLOYEE_PORTAL_REPO}`
- Deploy that fails: https://forecasting-analytics-f66jldzvz-granins-projects.vercel.app
- Local baseline: `npm_config_workspaces=false npm run build` (passes), `npm_config_workspaces=false npm run preview -- --host 127.0.0.1 --port 4180` (SPA works)
- Failure signature (prod only):
  - Network OK, bundle served → `TypeError: Cannot read properties of null (reading 'useEffect')`
  - Stack trace from Playwright: `ReactCurrentDispatcher.current` null while running `useEffect` inside `BuildForecastWorkspace`
  - DOM remains empty so `/build`, `/exceptions`, `/absenteeism`, `/trends`, `/accuracy`, `/adjustments` all blank

## Required Reading
1. `PROGRESS.md`
2. `docs/System/context-engineering.md`
3. `${CE_MAGIC_PROMPTS_DIR}/SIMPLE-INSTRUCTIONS.md`
4. `${CE_MAGIC_PROMPTS_DIR}/RESEARCH-FOLLOWING-MAGIC-PROMPT.md`
5. `docs/SOP/code-change-plan-sop.md` (exploration section)
6. `docs/SOP/ui-walkthrough-checklist.md`
7. `docs/Tasks/forecasting-analytics_parity-scout-2025-10-27-codex.task.md`
8. `docs/Tasks/forecasting-analytics-routing-discovery.md`
9. `docs/Workspace/Coordinator/forecasting-analytics/Progress_Forecasting-Analytics_2025-10-14.md`
10. `${MANUALS_ROOT}/estimation/processing_manual/process/chapters/CH4_Forecasts.md` §§4.1–4.4 (context, not for fix)
11. Vite + React references from working demos:
    - `${MANAGER_PORTAL_REPO}/vite.config.ts`
    - `${ANALYTICS_REPO}/vite.config.ts`
    - `${EMPLOYEE_PORTAL_REPO}/vite.config.ts`
12. `docs/System/ports-registry.md` (port claims; 4180 reserved locally during investigation)

## Objective
Identify why the Vite production build served by Vercel triggers React’s “invalid hook call” (dispatcher is null) while the local preview works. Root cause is likely duplicate/mismatched React instances or bundler splitting mistakes. Scout must inventory configuration differences, dependency graphs, and bundler outputs across all related repos so the planner can scope a reliable fix.

## Repro Steps (Prod)
1. `node - <<'NODE' …` (Playwright headless snippet) hitting `https://forecasting-analytics-f66jldzvz-granins-projects.vercel.app/build` immediately logs `TypeError: Cannot read properties of null (reading 'useEffect')`.
2. Browser dev tools show bundle `assets/index-Dxg4f2Eb.js`; first call into React hooks fails before any JSX renders.
3. Smoke script `SMOKE_BASE_URL=https://forecasting-analytics-f66jldzvz-granins-projects.vercel.app npm_config_workspaces=false npm run smoke:routes` times out on every route.

## Local Baseline
- Commands run: `npm_config_workspaces=false npm run test:run`, `npm_config_workspaces=false npm run build`, `npm_config_workspaces=false npm run preview -- --host 127.0.0.1 --port 4180`. All pass; SPA renders without errors. Deployed bundle produced from same commit.
- Generated `dist/assets/index-Dxg4f2Eb.js` contains only one copy of React when inspected locally (minified file, no duplicated `useEffect` export errors).

## Leads to Investigate
1. **React duplication / version mismatch**
   - Confirm only `react@18.3.1` and `react-dom@18.3.1` ship. Command already run: `npm_config_workspaces=false npm ls react` (single tree). Need to compare with Vercel build logs and the other demos’ lockfiles.
   - Inspect `package-lock.json` (missing? repo relies on top-level? planner needs to verify).
   - Check for hidden dependency bundling (e.g., via `vite` externals, `optimizeDeps` differences) that could cause Vercel to bundle a second React.
2. **Vite config differences**
   - `vite.config.ts` currently sets `base: './'`; working demos may use `/` base.
   - Confirm whether other repos call `react()` plugin differently (`jsxRuntime: 'classic'` vs default). Compare to manager portal / analytics / employee portal.
   - Check for `defineConfig({ optimizeDeps: { include/exclude } })` or manual chunking in other demos.
3. **Build pipeline on Vercel**
   - Examine project settings (framework preset, install command). Ensure the `.vercel/project.json` or `vercel.json` not excluding `node_modules`. (If missing, note for planner.)
   - Determine whether Vercel uses cached dependencies with older React; check project-specific `package-lock.json` (commit?) or `npm install` output in Vercel logs.
4. **Bundle analysis**
   - Run `npm_config_workspaces=false npm run build -- --minify=false` (if needed) to examine final output; locate where `React` import resolves.
   - Use `npx vite build --ssr src/main.tsx` to see SSR graph (optional note).
   - Compare hashed bundle names against prod (both `index-Dxg4f2Eb.js` locally and on Vercel). If identical but runtime fails, likely runtime environment difference.
5. **Check other repos’ deployments**
   - Manager Portal / Analytics / Employee Portal share similar stack and deploy fine. Gather file:line of their React imports and Vite config. Scout should document any divergences (e.g., `base: './'` vs `/`, usage of `@vitejs/plugin-legacy`, etc.).
6. **Look for global React**
   - Ensure no global `window.React = …` expectation in build (not the case locally, but record confirmation).

## Deliverables
- Updated discovery doc (this file) with findings, citing file:line references (e.g., `src/App.tsx:5`, `vite.config.ts:4`, Vercel logs). Add sections:
  - **Dependency Graph Findings** — confirm or deny duplicate React.
  - **Config Differences** — highlight any variance with working demos.
  - **Hypotheses** — potential fixes (e.g., align React version, adjust `base`, remove `base: './'`, add `build.rollupOptions.external`).
  - **Open Questions** — e.g., “Does Vercel build with `npm ci` using an older lock?”
- Update `docs/SESSION_HANDOFF.md` with a scout entry referencing this task.
- If scout confirms root cause (e.g., Vercel using React 18.2, missing `package-lock.json`), note exact evidence so planner can craft fix plan.

## Notes / Context
- The repo currently lacks `package-lock.json`; confirm whether Vercel install picks up transitive 18.3 vs 18.2.
- `base: './'` is nonstandard for Vercel SPA (others use `/`). If that is culprit, note it.
- Keep existing fixtures/workspaces untouched; focus purely on build/runtime parity.

## Discovery Log – 2025-10-28

### Dependency Graph Findings
- `package.json:21-24` in `${FORECASTING_ANALYTICS_REPO}` still pins `react` / `react-dom` to `^18.2.0`, allowing multiple 18.x resolutions, and the repo does **not** commit a lockfile (`git status` shows `?? package-lock.json`). Local installs currently dedupe to `react@18.3.1` / `react-dom@18.3.1` (`npm ls react`, `npm ls react-dom`), but a fresh Vercel build without the lock can resolve a second React copy to satisfy `react-dom@18.3.1`’s peer constraint, producing the classic “dispatcher is null” hook failure on prod.
- No other libraries vendor React, so duplicate bundles likely come from npm resolution variance rather than a dependency importing its own React build.

### Config & Build Differences
- The demo ships two Vite config files: `vite.config.ts:4-14` (uses `base: './'`, custom `assetsDir`, `server.host = '0.0.0.0'`) and a legacy `vite.config.js:1-9` left in place with default settings. Vite prefers TypeScript configs locally, but Vercel’s builder may pick the `.js` file first, skipping our newer settings. Working demos (manager portal, analytics dashboard, employee portal) only keep the `.ts` config with default `base`, so the extra `.js` file and `base: './'` are both suspects.
- Unlike other repos, there is no `engines.node` field or `.nvmrc` to force Node ≥18 on Vercel. If the project falls back to Node 16, npm 8’s resolver increases the chance of duplicate React trees when peers mismatch.

### Runtime Evidence (Prod)
- Playwright snapshot against https://forecasting-analytics-f66jldzvz-granins-projects.vercel.app/build reproduces the failure: `TypeError: Cannot read properties of null (reading 'useEffect')` at `assets/index-Dxg4f2Eb.js:9:5999`. That stack resolves to the minified `Se.useEffect` wrapper (React module) before our components render, confirming React’s dispatcher is null on prod while local preview remains healthy.
- The deployed bundle hash (`index-Dxg4f2Eb.js`) matches the local `dist/` output, so the breakage stems from runtime module resolution (React instance mismatch) rather than a different compiled artifact.

### Hypotheses
1. Missing `package-lock.json` lets Vercel install separate React trees (root vs nested under `react-dom`), so planner should lock versions (`18.3.1`) or switch to `npm ci` with a committed lockfile.
2. Remove or archive `vite.config.js` and verify the TypeScript config is the only one Vercel sees; align `base` with other demos (likely `/`) to avoid loader quirks.
3. Explicitly pin Node ≥18 in `package.json`/Vercel project to keep npm 10 resolver parity with local runs; confirm Vercel’s build log once the lockfile exists.

### Open Questions / Next Steps
- Does the current Vercel project log show dual React installs (e.g., `node_modules/react-dom/node_modules/react`)? If yes, capture the tree for planner.
- Should we add a smoke step in CI that runs `npm ci && npm run build` inside a clean container to surface duplicate React installs before deploy?
- After locking deps, rerun the prod Playwright check to prove the dispatcher error disappears before looping UAT.
- 2025-10-29 update: executor relocated stray top-level `useEffect` in `ManualAdjustmentSystem.tsx` (root cause of invalid hook call), pinned React 18.3.1 with committed lockfile, and re-ran smoke/UAT on https://forecasting-analytics-p6z0l224h-granins-projects.vercel.app.
