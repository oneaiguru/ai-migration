# REVIEW GUIDE — UI Demo (Vercel)

This guide helps reviewers verify the UI against the read‑only API in minutes.

- Stable UI: https://mytko-forecast-ui.vercel.app
- API base (Vercel env): VITE_API_URL = https://received-cingular-prepared-defendant.trycloudflare.com
- Demo default date: VITE_DEMO_DEFAULT_DATE = 2024-08-03

## Tabs → Endpoints
- Overview → GET /api/metrics (quantiles; also returns demo_default_date for reference)
- Districts → GET /api/districts (SMAPE leaderboard)
- Sites → GET /api/sites?date=YYYY-MM-DD (grid + risk badges)
- Registry → GET /api/sites?date=YYYY-MM-DD (risk badge column + ≥80% filter)
- Routes
  - Cards + Table → GET /api/routes?date=YYYY-MM-DD&policy=strict|showcase
  - CSV download → server CSV if available; otherwise JSON→CSV fallback client‑side

## Fallback logic (Routes)
If GET /api/routes returns no rows for the demo date, the UI derives:
- strict: overflow_prob ≥ 0.8 OR fill_pct ≥ 0.8 (from /api/sites)
- showcase: overflow_prob ≥ 0.5 OR fill_pct ≥ 0.6 (from /api/sites)
This keeps the Table view meaningful for demos. When the backend adds real routes for the date, the UI uses them instead and CSV will contain server rows.

## Zero‑states and tooltips
- All tabs: friendly zero‑states when empty; no crashes on missing fields
- Tooltips: WAPE/SMAPE info in Overview/Districts; risk badges show exact % via title

## Env variables (Vercel → Settings → Environment Variables)
- VITE_API_URL: API base URL (no trailing slash)
- VITE_DEMO_DEFAULT_DATE: default date seeded in pickers (e.g., 2024-08-03)

## Quick smoke steps
1) Overview loads numbers from /api/metrics
2) Districts renders table + pie from /api/districts
3) Sites/Registry show non‑empty lists for date=2024‑08‑03
4) Routes → Table: sorted by risk; CSV buttons work (server CSV preferred; fallback OK)

## Screenshot targets (PNG)
- Overview
- Routes Table (Маршруты 2.0) with sorting by risk
- План‑задания with “только критичные (≥80%)” enabled

