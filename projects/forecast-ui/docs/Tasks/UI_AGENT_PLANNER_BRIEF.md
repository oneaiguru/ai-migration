# UI Planner – Handoff Brief (Demo-safe, post‑demo refactors)

## 1) Role & Toolkit
- You are the Planner. Read CE prompts before drafting the plan:
  - /Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md:1
  - /Users/m/git/tools/agentos/docs/System/CE_MAGIC_PROMPTS/PLAN-USING-MAGIC-PROMPT.md:1
  - /Users/m/git/tools/agentos/docs/System/context-engineering.md:1

## 2) Required Context
- UI plan (current session): forecast-ui/plans/2025-11-05_ui-demo-readiness.plan.md:1
- Scout anchors (UI): forecast-ui/docs/Tasks/NEXT_UI_AGENT_SCOUT.md:1
- Review confirmations (reference):
  - reviews/20251105/ui_components/2_followup/ui_components.md:1
  - reviews/20251105/ui_config/2_followup/ui_config_support.md:1
- Test SOP: forecast-ui/docs/SOP/TEST_RUN_SOP.md:1
- E2E config/specs: forecast-ui/playwright.config.ts:1, forecast-ui/tests/e2e/*.spec.ts:1

## 3) What Needs Planning (post‑demo, no behavior change)
1. File hygiene splits (only if files exceed thresholds)
   - Target: keep each file < 300–400 LoC; no functional changes.
   - Candidates today (sizes):
     - forecast-ui/src/components/Routes.tsx (≈242 LoC)
     - forecast-ui/src/components/RoutesTable.tsx (≈191 LoC)
     - forecast-ui/src/components/Sites.tsx (≈165 LoC)
   - Plan structure: split into `components/routes/RoutesContainer.tsx` and `components/routes/RoutesTableView.tsx`, plus keep `hooks/useRoutesData.ts`. Mirror for Sites if it grows.

2. Add nightly E2E spec for Registry filter (non‑blocking on PRs)
   - New spec: `forecast-ui/tests/e2e/registry_filter.spec.ts`
   - Base flow: open prod alias → sidebar “Реестр КП” → ensure list visible → set risk or text filter → expect filtered rows and badge counts.
   - CI: guard behind NIGHTLY flag or a separate job.

3. ESLint/Prettier advisory setup (no fail on PR initially)
   - Add minimal config: `.eslintrc.cjs`, `.prettierrc`, `eslint-plugin-react`, `@typescript-eslint/*` (advisory).
   - NPM scripts: `lint`, `format:check`, `format`.
   - CI: optional step printing warnings only (convert to strict post‑demo if desired).

4. Size‑gate waivers review & cleanup
   - Policy: warn >350, block >500 unless `// @allow-large-file:<ticket>` present.
   - Add simple check script under `scripts/ci/check_large_files_ui.sh` (advisory now), wire to CI later.

## 4) Plan Expectations (use CE planning format)
- Quote file:line anchors for each change group.
- Provide apply_patch‑ready edits and exact move/create commands.
- Validation commands must include: unit + E2E smokes, lint/format checks (advisory), and bundle build.
- Rollback notes for any structural moves.

## 5) Validation & Gates (expected)
- Unit: `cd forecast-ui && npm test -s` (Vitest green).
- E2E PR smoke (prod alias): `PW_TIMEOUT_MS=30000 E2E_BASE_URL=$URL npx playwright test --workers=1 --reporter=line`.
- Nightly (separate job): `PW_TIMEOUT_MS=60000 E2E_TAKE_SHOTS=1 E2E_ALLOW_DOWNLOAD=1 npx playwright test --workers=1`.
- Advisory lint: `npm run lint` (non‑blocking initially) and `npm run format:check`.

## 6) Deliverables
- Plan file: `plans/2025-11-06_ui-postdemo-refactor.plan.md` (to be authored by you).
- New spec (skeleton): `tests/e2e/registry_filter.spec.ts` (behind NIGHTLY flag or skip on PRs).
- Docs updated: `docs/SOP/TEST_RUN_SOP.md` if timings/process change; `reviews/WORK_DONE_OVERVIEW.md` with latest timings.
- Handoff: append summary + commands to `NEXT_AGENT_HANDOFF.md` and (optionally) a short entry under a shared `docs/SESSION_HANDOFF.md` if adopted.

