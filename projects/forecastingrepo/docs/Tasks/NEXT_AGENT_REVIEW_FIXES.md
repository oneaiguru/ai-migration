# Next Agent: Apply Review‑Driven Fixes (no behavior change to defaults)

Source
- reviews/MASTER_CODE_REVIEW.md (central audit with risk table and fix recipes)
- Review bundles READMEs (Pipeline/API/Eval/Config + UI)

Goals (P0 → P1)
- P0: Demo‑proof polish and safety (read‑only API; CSV escaping; CORS; limiter; demo routes rows)
- P1: Improve realism + metrics quality (simulator reset; NaN guards; site‑level WAPE summary)

P0 — Backend (API & Demo Safety)
1) CORS lock
- Set `API_CORS_ORIGIN=https://mytko-forecast-ui.vercel.app` and restart uvicorn
- Verify with `curl -I -H "Origin: https://mytko-forecast-ui.vercel.app" $API/api/metrics`

2) CSV safety
- Ensure all CSV responses are produced via `csv.DictWriter` (no string joins)

3) Basic rate limiting
- Add `slowapi` (e.g., `@limiter.limit("30/minute")`) to `/api/sites` and `/api/routes`

4) Demo date
- `/api/metrics` must include `"demo_default_date":"2024-08-03"` (UI env remains canonical)

5) Demo routes rows
- Ensure `/api/routes?date=2024-08-03&policy=strict|showcase` returns non‑empty JSON & CSV
- Source: `reports/sites_demo/routes/recommendations_*_2024-08-03.csv`

Acceptance (P0)
- CORS not `*`; CSV opens in Excel without formula execution
- `/api/metrics` shows demo_default_date 2024‑08‑03
- `/api/routes?...` returns rows (strict/showcase) and downloadable CSV

P1 — Backend (Realism & Metrics)
6) Simulator reset & NaN guards
- Reset fill after capacity (simulated service); guard NaNs with `fillna(0.0)` before simulation

7) Site‑level WAPE summary (S6)
- In `backtest_sites.py`, compute Overall site WAPE `(Σ|err|)/(Σ|actual|)` and Median per‑site WAPE; write in `SUMMARY.md`

8) Docs & small visuals
- Append 1‑line “what changed” to `reports/sites_demo/README_en.md`

Acceptance (P1)
- S6 `SUMMARY.md` shows Overall and Median site‑level WAPE
- Simulator no longer produces unrealistic accumulating fill without reset

Docs & Process (no code behavior change)
- Add Review_Pack.md (UI URL, API URL, demo date, 5 curls, bundle links, acceptance checklist)
- Update Testing.md: test pyramid (unit/integration → Behave acceptance → UI e2e smoke nightly)
- Optional: OpenAPI models + export `docs/api/openapi.json`

Admin
- Publish release `v0.5.0-site-backtests` and attach 4 backend + 3 UI bundles
- Close superseded S4 PR (#37); reference S6 PR (#39)
