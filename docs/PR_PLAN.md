# Phase 1 PR Plan (import-only)

Root: `~/ai` (monorepo). Imports land in `~/ai/projects/<repo>/...`. Phase 1 keeps PRs small and coherent (≤ ~300 KB), no refactors.

## General rules
- PR naming: `import:<repo>:NN-<scope>` (e.g., `import:forecastingrepo:01-scaffold`).
- Each PR adds: scoped files only; minimal ignores (node_modules, dist, .vite, .venv, zips, _incoming, large CSVs, artifacts/viz, reports/sites_demo/*.csv); `projects/<repo>/AGENTS.md` with purpose + run commands.
- If a repo cannot be split cleanly, a single `import:<repo>:all` PR is acceptable.
- Merge each PR after review before opening the next in that series.

## Forecastingrepo (backend) — proposed series
1) scaffold — configs, top-level init, minimal docs.
2) core-sites — src/sites/*, src/accuracy/*, plugins/weather adapter.
3) api-cli — api_app, openapi export, routes_recommend, ingest_and_forecast.
4) backtest-viz — backtest/viz/report scripts.
5) tests-remaining — any remaining tests (api/scripts/unit/weather/e2e).
6) docs-tasks-adrs — docs/System, docs/Tasks, ADRs, data docs, Notes, SOP, Methodology, AgentMode, PRDs, API docs, research, eval, architecture.
7) dev-tools — scripts/dev, scripts/ci, scripts/health, .tools, CE_MAGIC_PROMPTS, plans.
8) artifacts-ignores — only small necessary samples; otherwise rely on ignore rules for data/reports/forecasts/review zips/deliveries.

Split any slice further if it exceeds ~300 KB.

## forecast-ui — proposed series
1) scaffold — package/configs/README/AGENTS.
2) src-core — components/hooks/utils/types/data.
3) tests-e2e — unit + Playwright and supporting scripts.
4) docs-scripts — docs/Tasks/SOP/handoffs, scripts, review bundle readmes (exclude zips), ignores for node_modules/dist/.vite.

## mytko-forecast-demo — proposed series
1) scaffold — package/configs/README/AGENTS.
2) src-and-demo-data — src/* and curated public/demo_data/*.
3) tests-docs — tests/docs if present (otherwise fold into 2); ignore node_modules/dist/.vite.

## Minimal AGENTS.md content
```
# <Project Name>
- What: <2–3 sentences on purpose>
- Backend tests: python -m pytest (or pytest -q)
- OpenAPI: python scripts/export_openapi.py --check
- UI build: npm run build
- Start stack (if applicable): API_PORT=8000 FORECAST_UI_PORT=4173 MYTKO_UI_PORT=5174 bash scripts/dev/start_stack.sh
```

## Tracking
- Update `docs/ProjectIndex.md` as PRs open/merge.
