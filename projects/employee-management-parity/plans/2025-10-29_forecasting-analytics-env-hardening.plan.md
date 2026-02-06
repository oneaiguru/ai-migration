# Plan — Forecasting & Analytics Environment Hardening & Redeploy

## Metadata
- **Discovery Sources:**
  - `docs/Tasks/forecasting-analytics_invalid-hook-scout-2025-10-28-codex.task.md`
  - `docs/Tasks/forecasting-analytics-routing-discovery.md`
  - `docs/Tasks/forecasting-analytics_parity-scout-2025-10-27-codex.task.md`
- **Target Repository:** `${FORECASTING_ANALYTICS_REPO}`
- **Related Docs:**
  - `docs/Workspace/Coordinator/forecasting-analytics/Progress_Forecasting-Analytics_2025-10-14.md`
  - `uat-agent-tasks/manual_forecasting-analytics-crosswalk.md`
  - `uat-agent-tasks/2025-10-26_forecasting-uat.md`
  - `docs/System/WRAPPER_ADOPTION_MATRIX.md`
  - `docs/System/PARITY_MVP_CHECKLISTS.md`
  - `docs/System/learning-log.md`
  - `docs/Tasks/post-phase9-demo-execution.md`
  - `docs/SESSION_HANDOFF.md`, `PROGRESS.md`

## Desired End State
The Vercel production deploy uses a single React runtime (18.3.1) installed via `npm ci` and serves all SPA routes (`/build`, `/exceptions`, `/trends`, `/absenteeism`, `/accuracy`, `/adjustments`) without hook errors or 404s. Local preview runs on port 4155. `vite.config.ts` is the sole Vite config with `base: '/'`. `npm run smoke:routes` passes locally and against prod before UAT. Step 6 UAT (`parity_static`, `chart_visual_spec`) succeeds on the new deploy, with results captured in the UAT doc, system matrices, tracker, CodeMap, PROGRESS, and SESSION_HANDOFF.

### Key Discoveries
- `package.json:15-32` keeps `react`/`react-dom` on `^18.2.0` and the committed lockfile mirrors caret ranges, enabling duplicate React installs on Vercel (scout report §Dependency Graph Findings).
- Dual Vite configs (`vite.config.ts:1-13`, `vite.config.js:1-9`) and nonstandard `base: './'` were flagged as potential build divergences (scout report §Config & Build Differences).
- Vercel uses rewrites but lacks an enforced `installCommand`; prod build used `npm install` with an outdated dependency graph and crashed (`docs/Tasks/forecasting-analytics_invalid-hook-scout-2025-10-28-codex.task.md:41-83`).
- Smoke runner `scripts/smoke-routes.mjs:25-108` already enumerates all forecasting routes; planner must ensure it runs pre- and post-deploy for verification.

## What We're NOT Doing
- No API contract changes or backend integration; fixtures remain as-is.
- No redesign of forecasting workspaces or UI beyond removing residual marketing badges if encountered.
- No additional automated tests beyond existing Vitest suite and smoke script.
- No alterations to other demos or shared chart wrappers.

## Implementation Approach
Pin the React stack to 18.3.1 with an updated lockfile and enforce deterministic installs via `npm ci`. Remove the legacy JS Vite config and align the TS config with other demos (`base: '/'`, `server.port = 4155`). Extend `vercel.json` to set `installCommand`/`buildCommand`. After regenerating dependencies, run the standard validation stack (`npm ci`, tests, build, smoke) locally, redeploy, smoke prod, and rerun Step 6 UAT to prove routing stability. Finish by syncing documentation (UAT table, matrices, tracker, handoff, PROGRESS).

## Phase 1: Dependency Pinning & Node Engine

### Overview
Lock React to 18.3.1, align type packages, and enforce Node ≥18 so installs behave the same locally and on Vercel.

### Changes Required

#### 1. Update package metadata
**File:** `${FORECASTING_ANALYTICS_REPO}/package.json`
**Changes:** Pin React packages, align type defs, add Node engine, and document local preview port.

```json
@@
-    "react": "^18.2.0",
-    "react-chartjs-2": "^5.2.0",
-    "react-dom": "^18.2.0",
+    "react": "18.3.1",
+    "react-chartjs-2": "^5.2.0",
+    "react-dom": "18.3.1",
@@
-    "@types/react": "^18.2.0",
-    "@types/react-dom": "^18.2.0",
+    "@types/react": "^18.3.10",
+    "@types/react-dom": "^18.3.7",
@@
-  "devDependencies": {
+  "devDependencies": {
@@
-    "playwright": "^1.49.0"
-  }
+    "playwright": "^1.49.0"
+  },
+  "engines": {
+    "node": ">=18.18.0"
+  }
```

> Note: retain existing scripts and description. Executor must run `npm_config_workspaces=false npm install` afterward to refresh `package-lock.json` with exact React 18.3.1 entries.

#### 2. Regenerate package-lock
**File:** `${FORECASTING_ANALYTICS_REPO}/package-lock.json`
**Changes:** Accept the regenerated lockfile produced by `npm_config_workspaces=false npm install` (expect React 18.3.1 under `packages[""].dependencies`).

## Phase 2: Vite Configuration Alignment

### Overview
Remove the legacy JS config and set the TS config to match other demos (single source, base `/`, local preview on 4155).

### Changes Required

#### 1. Delete legacy config artifacts
**Files:** `${FORECASTING_ANALYTICS_REPO}/vite.config.js`, `${FORECASTING_ANALYTICS_REPO}/vite.config.d.ts`
**Changes:** Remove both files from the repo to prevent Vercel from picking the JS build settings.

#### 2. Update Vite config defaults
**File:** `${FORECASTING_ANALYTICS_REPO}/vite.config.ts`
**Changes:** Switch `base` to `'/'`, set preview port 4155, and note host binding.

```ts
@@
-import { defineConfig } from 'vite'
-import react from '@vitejs/plugin-react'
-
-export default defineConfig({
-  plugins: [react()],
-  base: './',
-  build: {
-    outDir: 'dist',
-    assetsDir: 'assets'
-  },
-  server: {
-    port: 3004,
-    host: '0.0.0.0'
-  }
-})
+import { defineConfig } from 'vite';
+import react from '@vitejs/plugin-react';
+
+export default defineConfig({
+  plugins: [react()],
+  base: '/',
+  build: {
+    outDir: 'dist',
+    assetsDir: 'assets',
+  },
+  server: {
+    port: 4155,
+    host: '0.0.0.0',
+  },
+  preview: {
+    port: 4155,
+    host: '127.0.0.1',
+  },
+});
```

> Executor should run `npm run format` or apply existing linting conventions if needed (file currently unformatted semicolonless; snippet adds semicolons—ensure formatting matches project style when applying patch).

## Phase 3: Vercel Install Discipline

### Overview
Ensure Vercel installs via `npm ci` and documents the build command while preserving SPA rewrites.

### Changes Required

#### 1. Extend Vercel config
**File:** `${FORECASTING_ANALYTICS_REPO}/vercel.json`
**Changes:** Add `installCommand` / `buildCommand`, keep rewrites intact.

```json
@@
-{
-  "rewrites": [
-    { "source": "/(.*)", "destination": "/index.html" }
-  ]
-}
+{
+  "installCommand": "npm ci",
+  "buildCommand": "npm run build",
+  "rewrites": [
+    { "source": "/(.*)", "destination": "/index.html" }
+  ]
+}
```

> After merging, confirm Vercel project settings inherit these commands (no manual override needed).

## Phase 4: Validation, Deploy, and UAT Loop

### Overview
Run the full validation stack locally, redeploy, smoke prod, and capture UAT/Doc updates.

### Changes Required

#### 1. Local validations (run in `${FORECASTING_ANALYTICS_REPO}`)
**Commands:**

```bash
set -euo pipefail
cd ${FORECASTING_ANALYTICS_REPO}
export npm_config_workspaces=false
npm ci
npm run test:run
npm run build
npm run smoke:routes
```

> Expect all commands to pass; smoke script should exit with “Smoke routes check passed.” and capture fresh screenshots in `test-results/`.

#### 2. Deploy & prod smoke
**Commands:**

```bash
set -euo pipefail
cd ${FORECASTING_ANALYTICS_REPO}
export npm_config_workspaces=false
npx vercel deploy --prod --yes
SMOKE_BASE_URL=https://<new-vercel-url> npm run smoke:routes
```

> Record the deployed URL for documentation updates. Prod smoke must pass without console errors.

#### 3. Rerun Step 6 UAT & update docs
**Actions:**
- Deliver updated UAT prompt if needed, run parity packs, and collect Pass results for FA‑1/FA‑2/Accuracy.
- Update `uat-agent-tasks/2025-10-26_forecasting-uat.md` table with new date, Pass statuses, notes referencing manual §§, and screenshot filenames.
- Sync system docs:
  - `docs/System/WRAPPER_ADOPTION_MATRIX.md` — mark Forecasting row “Prod React 18.3.1 locked; routing stable”.
  - `docs/System/PARITY_MVP_CHECKLISTS.md` — reflect completed Step 6 and note dependency pinning.
  - `docs/System/learning-log.md` — add entry about React duplication fix and smoke workflow.
- Update reporting docs:
  - `docs/Tasks/post-phase9-demo-execution.md` — set Forecasting row to “Completed – UAT Pass” with new deploy URL/date.
  - `docs/Workspace/Coordinator/forecasting-analytics/CodeMap.md` — replace deploy link, add note about React pin/Node engine.
  - `docs/SCREENSHOT_INDEX.md` — map any new prod smoke screenshots if filenames changed.
- Handoff updates:
  - Append executor summary to `docs/SESSION_HANDOFF.md` (commands run, deploy URL, UAT outcome).
  - Update `PROGRESS.md` Active Plan section to mark this plan complete and outline next steps (e.g., API integration follow-up).

### 4. Remove marketing badges if still present
**Files:** Inspect top-level hero/headers (`src/App.tsx`, workspace headers) and ensure phrases like “Графики Chart.js ✅” / “Мульти-модели ✅” do not render. If found, replace with production-style copy referencing manual terminology.

## Tests & Validation
- `npm_config_workspaces=false npm ci`
- `npm_config_workspaces=false npm run test:run`
- `npm_config_workspaces=false npm run build`
- `npm_config_workspaces=false npm run smoke:routes`
- `SMOKE_BASE_URL=https://<deploy> npm_config_workspaces=false npm run smoke:routes`
- Manual Step 6 UAT using `uat-agent-tasks/2025-10-26_forecasting-uat.md`

## Rollback
- To revert dependency/config changes:
  - `cd ${FORECASTING_ANALYTICS_REPO}`
  - `git checkout -- package.json vite.config.ts vercel.json`
  - `git checkout -- package-lock.json`
  - Restore deleted files: `git checkout -- vite.config.js vite.config.d.ts`
- If deploy introduced regressions, redeploy previous commit via `npx vercel deploy --prod --yes <previous-deploy-url>` or roll back in Vercel dashboard.

## Handoff
- Commit changes in `${FORECASTING_ANALYTICS_REPO}` once validations pass.
- Update `PROGRESS.md` Active Plan status to “Completed – React pinned & UAT Pass”.
- Append executor details (commands, deploy URL, UAT evidence) to `docs/SESSION_HANDOFF.md`.
- Ensure tracker/UAT docs reflect the new prod status and attach screenshot references.
