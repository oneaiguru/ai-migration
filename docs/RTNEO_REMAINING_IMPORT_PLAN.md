# RTNEO Remaining Import Plan

Use this plan after the forecastingrepo PRs finish. Phase 1 is import-only:
- Each PR `import:<slug>:NN-scope`, ≤ ~300 KB diff.
- Copy files into `projects/<slug>/…`, add AGENTS.md, update `.gitignore`.
- Ping `@codex review`, fix feedback, merge, repeat.

## Forecastingrepo follow-ons
1. **08-dev-tools** — `projects/forecastingrepo/scripts/dev/*`, `scripts/ci/*`, `scripts/health/*`, `.tools/*`, `CE_MAGIC_PROMPTS/*`, `plans/*`, helpers such as `scripts/ingest_jury_volume_excel.py`, `scripts/volume_to_mass.py`.
2. **09-reports** — only curated samples (`reports/site_backtest_candidate/*.csv`) and README notes; keep large data (reports/backtest_*, forecasts/*.csv, deliveries/*, reviews/*.zip, artifacts/viz/, `_incoming/`) ignored.

## Root docs bundles
### `projects/rtneo-docs/`
- Source: `/Users/m/git/clients/rtneo/docs/`, `docs-internal/`, `ai-docs/`, `archive-related-projects/`, root `README.md`.
- Ignore `_incoming/`, `.claude*/`, large zips.
- PR sequence: `import:rtneo-docs:01-public` (docs/), `:02-internal` (docs-internal/), `:03-ai-docs` (ai-docs/ + archive).

## Mock archives
### `projects/rtneo-mock/`
- Source: `clients/rtneo/mock/` (specs, HTML demos, task assets). Remove nested `mock/.git`.
- If huge binaries appear, document and ignore them.
- Single PR `import:rtneo-mock:01-all` (or split if >300 KB).

## UI repos
### `projects/forecast-ui/`
1. `import:forecast-ui:01-scaffold` (package/configs/README/AGENTS).
2. `:02-src-core` (src/components/hooks/utils/types/data).
3. `:03-tests-e2e` (unit + Playwright).
4. `:04-docs-scripts` (docs/, scripts, review bundles minus zips).
- Ignore `node_modules/`, `dist/`, `.vite/`, `playwright-report/`, `test-results/`.

### `projects/mytko-forecast-demo/`
1. `import:mytko-forecast-demo:01-scaffold`.
2. `:02-src-demo-data` (src/* + `public/demo_data/`).
3. `:03-tests-docs` (if any).
- Ignore `node_modules/`, `dist/`.

### `projects/rtneo-ui-docs/`
- Copy `ui/START_HERE.md`, `TECHNICAL_OVERVIEW.md`, `CODE_EXAMPLES.md`, `VISUAL_GUIDE.md`, `INDEX.md`, `ui/docs/`, `ui/reviews/` (skip zipped bundles unless tiny).
- PR `import:rtneo-ui-docs:01-all`.

## Root scripts & reports
### `projects/rtneo-scripts/`
- Copy `/Users/m/git/clients/rtneo/scripts/volume_to_mass.py`, `ingest_jury_volume_excel.py`.
### `projects/rtneo-reports/`
- Copy curated CSVs from `/Users/m/git/clients/rtneo/reports/site_backtest_candidate/`. Note in AGENTS that larger reports stay ignored.

## Special notes
- Always update `.gitignore` to cover `_incoming/`, `.claude*/`, `node_modules/`, `dist/`, `.vite/`, `.venv/`, raw data (`forecastingrepo/data/*.csv`, `reports/sites_demo/*.csv`, `artifacts/viz/`), zipped review bundles, Playwright artifacts, etc.
- Remove any nested `.git` folders when copying.
- Keep AGENTS concise: purpose, commands (npm install/build, uvicorn, pytest, etc.).
- After each PR merges, update `docs/ProjectIndex.md` with the new status.

Follow this plan sequentially until all directories under `/Users/m/git/clients/rtneo` are imported.
