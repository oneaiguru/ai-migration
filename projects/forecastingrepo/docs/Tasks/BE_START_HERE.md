# BE Handoff — Start Here (Demo Freeze)

Role & scope: demo‑safe; no API contract changes. Produce credible site‑level WAPE (or confirm district‑only), refresh evidence, and attach flat bundles for chat‑based review.

## Must Read (full files)
- reviews/DEMO_FREEZE.md:1
- reviews/COORDINATOR_DROP/README.md:1
- docs/SOP/review-process.md:1
- docs/System/Review_Pack.md:1
- docs/adr/DECISIONS_INDEX.md:1 (links ADR‑0001..0006)
- docs/Tasks/BE_AGENT_SESSION.md:1
- docs/Tasks/PR-18_site_forecast_be.md:1

## Environment & Branch
- Repo: `/Users/m/git/clients/rtneo/forecastingrepo`
- Working branch: `chore/reviewer-bundles-and-adr` (created locally)
  - Push + PR: `git push -u origin chore/reviewer-bundles-and-adr`
- Python venv: `.venv` (if present)
- Size-gate waiver for large reviewer artifact (if needed): Python `# allow-large-file:REVIEW_BUNDLE`
- Stack helper: run `bash scripts/dev/start_stack.sh` to bring up the FastAPI API (8000) and both UIs (4173 accuracy, 5174 MyTKO); stop via `bash scripts/dev/stop_stack.sh`. Always verify `curl http://127.0.0.1:8000/api/metrics` plus both UI URLs before declaring the stack healthy.

## Immediate Checks (Now)
1) Live endpoints (use BASE from coordinator doc):
```
curl -m5 -fsS "$BASE/api/metrics" | jq .
curl -m5 -fsS "$BASE/api/districts" | jq '.[0:3]'
curl -m5 -fsS "$BASE/api/sites?date=2024-08-03&limit=5" | jq '.[0:5]'
curl -m5 -fsS "$BASE/api/routes?date=2024-08-03&policy=strict" | jq '.[0:5]'
```
2) OpenAPI + tests:
```
python scripts/export_openapi.py --write
pytest -q
behave --tags @smoke --no-capture --format progress
python scripts/export_openapi.py --check
```

## Site‑level WAPE Loop (Decision: show Sites vs District)
Inputs (update to real data if different):
- `data/sites/sites_registry.csv`
- `data/sites/sites_service.csv` (actuals)
- Forecasts CSV with overlapping dates: `reports/sites_demo/daily_fill_2024-08-01_to_2024-08-07.csv`

Run:
```
python scripts/backtest_sites.py \
  --train-until 2024-07-31 \
  --daily-window 2024-08-01:2024-08-07 \
  --monthly-window 2024-08:2024-08 \
  --sites-registry data/sites/sites_registry.csv \
  --sites-service data/sites/sites_service.csv \
  --use-existing-sites-csv reports/sites_demo/daily_fill_2024-08-01_to_2024-08-07.csv \
  --outdir reports/site_backtest_candidate
```

Acceptance:
- `reports/site_backtest_candidate/SUMMARY.md` includes “Overall site WAPE (micro)” and “Median per‑site WAPE”
- `scoreboard_site_daily.csv` and `scoreboard_site_monthly.csv` exist and are non‑empty
- Behave smokes remain green; OpenAPI unchanged

## Update Evidence & Notes
- Copy artifacts into coordinator drop:
  - `reviews/COORDINATOR_DROP/backend/SUMMARY.md`
  - `reviews/COORDINATOR_DROP/backend/scoreboard_site_daily.csv`
  - `reviews/COORDINATOR_DROP/backend/scoreboard_site_monthly.csv`
- Append decision and numbers:
  - `reviews/NOTES/eval.md` (overall + median site WAPE, decision)
  - `reviews/NOTES/api.md` (paste 4 cURL outputs)

## Attachables (Flat Folders for Chat Reviewers)
Root: `/Users/m/git/clients/rtneo/forecastingrepo/reviews/ATTACH_REVIEWERS`
- UI bundles (reference for UI review):
  - `UI_COMPONENTS`, `UI_CONFIG`, `UI_SUPPORTING`
- BE bundles:
  - `BE_BACKEND_API` (00_README, openapi.json, behave log if needed)
  - `BE_BACKTESTING_EVAL` (00_README, notes)
  - `BE_CORE_PIPELINE` (00_README)
  - `BE_DOCS_SCHEMA` (00_README)

## Ground‑Truth Anchors (code/tests)
- `scripts/api_app.py:1`, `scripts/export_openapi.py:1`, `scripts/backtest_sites.py:1`
- `specs/bdd/features/api_metrics_smoke.feature:1`, `behave.ini:1`
- `src/sites/{schema.py,baseline.py,reconcile.py,simulator.py}:1`

## Constraints
- No API shape changes pre‑demo; only evidence refresh + site‑WAPE computation
- Flat attach folders only; no zips or nested directories
- Demo date used in evidence: `2024-08-03`

## PR & Commit
1) Push branch and open PR:
```
git push -u origin chore/reviewer-bundles-and-adr
```
2) PR title:
```
docs+review: ADR pack, flat bundles, coordinator evidence; OpenAPI/tests aligned
```

## Cross‑links (UI awareness)
- UI PR already open (post‑demo a11y/table polish):
  - https://github.com/granin/forecast-ui/pull/17
- UI live alias (PR smokes target):
  - https://mytko-forecast-ui.vercel.app
