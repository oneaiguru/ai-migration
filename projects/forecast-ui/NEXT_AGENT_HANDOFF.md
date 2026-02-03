# Next UI Agent Handoff (Read Queue + Tasks)

This is the single page the next UI agent should start with. It lists all the files to read (in order), where things live, and what to do next. No app code changes required pre‑demo.

## Environment & URLs
- Stable UI (prod): https://mytko-forecast-ui.vercel.app
- API base: https://received-cingular-prepared-defendant.trycloudflare.com
- Vercel env (prod):
  - `VITE_API_URL`
  - `VITE_DEMO_DEFAULT_DATE = 2024-08-03`

## Branches
- `feat/routes-table-forecast` — review docs + bundles, routes fallback docs
- `feat/optimized-configs` — optimized build config, nav↔tabs mapping, API demo date adoption, Playwright scaffold

## Read Queue (in this order)
1) review docs (UI repo root)
   - `REVIEW_GUIDE.md` — links; env vars; tab→endpoint mapping; fallback logic; CSV semantics; zero‑states/tooltips
   - `REVIEW_CHECKLIST.md` — pre‑flight, smokes, screenshots, accessibility sanity
   - `CHANGES.md` — what’s new, non‑breaking, known limits

2) core wiring (short, skim)
   - `src/api/client.ts` — env‑driven base; JSON+CSV; client CSV fallback
   - `src/utils/demo.ts` — demo default date from sessionStorage → env → today
   - `src/types/api.ts` — API shapes

3) navigation & layout
   - `src/components/Layout.tsx` — sidebar↔tabs mapping (Обзор, Районы, Площадки, Маршруты)
   - `src/App.tsx` — seeds demo default date from `/api/metrics.demo_default_date`

4) forecast module (tabs)
   - `src/components/Overview.tsx` — metrics; WAPE tooltip
   - `src/components/Districts.tsx` — SMAPE table/pie; SMAPE tooltip
   - `src/components/Sites.tsx` — table; sticky filters; badges
   - `src/components/Routes.tsx` — cards+table router; routes fallback from sites
   - `src/components/RoutesTable.tsx` — table; risk sort/filter; CSV buttons
   - `src/components/RoutesPrototype.tsx` — before/after mock view (non‑blocking)

5) other sections
   - `src/components/PlanAssignments.tsx` — badges, critical‑only filter
   - `src/components/RegistryView.tsx` — risk column + ≥80% filter
   - `src/components/InfoTooltip.tsx` — small tooltip atom

6) styles & build
   - `tailwind.config.js` — palette (lighter sidebar, blue accent)
   - `src/index.css` — `.btn-primary`, `.compact-table`, `.risk-badge`
   - `vite.config.ts` — optimized split (on optimized branch)

7) e2e smoke (Playwright)
   - `playwright.config.ts`
   - `tests/e2e/overview.spec.ts`
   - `tests/e2e/routes_table.spec.ts`
   - `tests/e2e/plan_assignments.spec.ts`
   - `tests/e2e/README.md`

## Review Bundles (system copies)
- `~/reviews/ui_components_bundle/` — components + API client (zip + README)
- `~/reviews/ui_config_bundle/` — config/styles/app shell (zip + README)
- `~/reviews/ui_supporting_bundle/` — types/utils/data/config (zip + README)

## What to DO (pre‑demo)
- Run smoke E2E locally (optional):
  - `cd forecast-ui && npm i -D @playwright/test && npx playwright install --with-deps`
  - `E2E_BASE_URL=https://mytko-forecast-ui.vercel.app npx playwright test`
- Capture 3 screenshots (PNG):
  - Overview; Маршруты 2.0 → Таблица (sorted by risk); План‑задания (critical‑only)
- Open PRs:
  - “docs(review): add REVIEW_GUIDE, REVIEW_CHECKLIST, CHANGES…” (if not merged)
  - “feat(ui): nav↔tabs mapping; demo date adoption; e2e scaffold” (if not merged)

## Post‑demo (refactor tickets)
- Extract shared atoms: `components/shared/RiskBadge.tsx`, `components/shared/FillBar.tsx` and replace in `RoutesTable`, `PlanAssignments`, `RegistryView`
- Begin file splits to keep files < 300–400 LoC; add `// @allow-large-file:<ticket>` header only when deferring
- Optional: adopt optimized Vite/Tailwind on main if preview/prod parity is acceptable

---

## 2025‑11‑05 — UI Executor wrap and next steps

- Executed plan: `plans/2025-11-05_ui-demo-readiness.plan.md`
- Tests: unit + E2E (prod alias) green; HTML report + `tests/e2e/TIMINGS.md` included in bundle.
- CSV UX: loading state + disabled + inline error message (Routes). No contract changes.
- Bundle: latest ZIP copied to four UI reviewer folders under `~/Downloads/review_flat_20251105_134628/`.

Next (Planner handoff)
- Read CE prompts and context-engineering guide (paths in the brief).
- Use `docs/Tasks/UI_AGENT_PLANNER_BRIEF.md` and `docs/Tasks/NEXT_UI_AGENT_SCOUT.md` to draft the post‑demo plan for:
  - Routes/Sites splits (if/when files exceed thresholds),
  - New nightly E2E for Registry filters,
  - Advisory ESLint/Prettier setup + CI hints,
  - Size‑gate advisory script and waiver cleanup.
