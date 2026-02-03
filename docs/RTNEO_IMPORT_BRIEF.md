# RTNEO Import Brief

**Goal:** Import *all* remaining content from `/Users/m/git/clients/rtneo` into this monorepo under `projects/…` so the Codex review bot sees the entire workspace. Phase 1 stays import-only (no refactors). Use the existing conventions:
- PR names: `import:<repo>:NN-<scope>`; keep diffs ≤ ~300 KB, one coherent area per PR.
- Add `projects/<repo>/AGENTS.md` with 2–3 sentences + commands (tests/build/OpenAPI, npm run build, etc.).
- Update `.gitignore` to drop junk (node_modules/, dist/, .vite/, .venv/, `_incoming/`, `.claude*/`, raw data like `forecastingrepo/data/*.csv`, `reports/sites_demo/*.csv`, `artifacts/viz/`, giant zips).
- Ping `@codex review` on each PR; merge only after Codex says “no issues.”

## What’s already imported
- `projects/forecastingrepo/` core code (src/, scripts/, tests/, minimal docs + docs/api/openapi.json). PRs #1–#7 cover code/tests/backtest fixes.

## What still needs import
(See `docs/RTNEO_REMAINING_IMPORT_PLAN.md` for directory inventory.)

1. **forecastingrepo docs/data**
   - `docs/` (System, Tasks, ADR, Notes, SOP, Methodology, data contracts) ~ dozens of files.
   - `docs-internal/`, `ai-docs/`, `plans/`, `CE_MAGIC_PROMPTS/`, `scenarios/`, `reviews/` text manifests.
   - Curated data artifacts (`reports/backtest_*`, `forecasts/*.csv` etc.) — either ignore or include small samples with documentation.
   - *Data note:* forecastingrepo contains ~658 MB total; ~656 MB is data under `data/`, `reports/`, `artifacts/`. Do **not** commit raw 4.6M-row CSVs (`data/containers_long.csv`, etc.); keep ignoring them.

2. **UI projects**
   - `ui/forecast-ui/` (~1.2 MB, 7.3k code LOC; includes docs/, scripts/, tests/e2e, review bundles).
   - `ui/mytko-forecast-demo/` (~similar size; includes `public/demo_data/` curated CSVs, ignore `node_modules/dist`).
   - `ui/docs/`, `ui/reviews/`, `ui/_incoming/` (doc bundles; ignore zips if huge).

3. **Mock & archives**
   - `mock/` (~62.9 MB, mostly docs/specs/HTML in `mock/`, `mock/task/`, `mock/disp/`).
   - `.git` inside `mock/` (strip or convert to artifact; do not nest repo).
   - `archive-related-projects/` (markdown docs).

4. **Root docs & knowledge**
   - `/docs/` (ASR-focused specs, SOPs, roadmaps, PRDs).
   - `/docs-internal/` (SYSTEM_GATE*).
   - `/ai-docs/` (SOURCE_OF_TRUTH, pro_messages, indexes).

5. **Scripts & reports**
   - `/scripts/` (volume_to_mass.py, ingest_jury_volume_excel.py).
   - `/reports/` (site_backtest_candidate/ CSV). Keep curated CSVs if small; otherwise document and ignore large ones.

6. **Misc root files**
   - `_incoming/` (ignore), `.claude-trace/` (ignore), `Archive.zip` (document only), root `README.md`.

## Suggested PR slices (examples)
- `import:rtneo-docs:01-public`, `:02-internal`, `:03-ai-docs`.
- `import:forecast-ui:01-scaffold`, `:02-src`, `:03-tests`, `:04-docs`.
- `import:mytko-demo:01-scaffold`, `:02-src-demo-data`, `:03-tests/docs`.
- `import:rtneo-mock:01-specs`, `:02-assets`.
- `import:rtneo-scripts:01-tools`, `import:rtneo-reports:01-site-backtest` (if small) or just update `.gitignore` to keep them local.

Keep each PR ≤ ~300 KB; split further if needed. Update `docs/ProjectIndex.md` as PRs merge.

**Process checklist:**
1. Run `find`/`rg --files` in each remaining directory to confirm files.
2. Draft PR plan per area; get approval if scopes change.
3. Copy files into `~/ai/projects/<slug>/…`, add AGENTS.md + ignores. No refactors.
4. Run `git status`, ensure only intended files added, open PR.
5. Post comment `@codex review`, wait for approval, then merge sequentially.

Phase 2 (later) can reorganize into `apps/<client>/…` or add tooling; Phase 1 is solely about importing everything for review.
