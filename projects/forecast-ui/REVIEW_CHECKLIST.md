# REVIEW CHECKLIST — UI

Pre‑flight
- Confirm Vercel env: `VITE_API_URL` and `VITE_DEMO_DEFAULT_DATE = 2024-08-03`
- Confirm stable alias: https://mytko-forecast-ui.vercel.app

Smokes
- Overview: numbers render from `/api/metrics`
- Districts: table + pie render from `/api/districts`
- Sites: `/api/sites?date=2024-08-03` is non‑empty; risk badges present
- Registry: shows risk column; filter “Переполнение ≥ 80%” reduces rows
- Routes (Маршруты 2.0 → Table): non‑empty, sorted by risk; CSV download works
  - Note: if server routes empty for the date, UI derives strict/showcase from `/api/sites`

Timing/Report
- Run smokes serial with 30s timeout; see docs/SOP/TEST_RUN_SOP.md
- HTML report saved under `playwright-report/`; timings in `tests/e2e/TIMINGS.md`

Screenshots (PNG)
- Overview
- Routes Table (sorted by risk)
- План‑задания with “только критичные (≥80%)” enabled

Accessibility sanity
- Buttons/inputs have visible labels; hover states present; adequate contrast
- Tooltips: WAPE/SMAPE info; badge titles show exact %

Notes
- Table fields (volume/schedule/last_service) populate automatically as backend enriches `/api/routes`
- CSV: server CSV preferred; JSON→CSV fallback when server returns JSON
