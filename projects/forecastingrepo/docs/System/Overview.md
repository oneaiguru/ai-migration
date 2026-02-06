# System Overview & Handoff

Use this page as the starting point for coordinators and reviewers.

Live links
- UI (local default): http://127.0.0.1:4173 (start via `scripts/dev/local_demo_up.sh`)
- API (local default): http://127.0.0.1:8000 (metrics: `/api/metrics`)
- UI (Vercel, optional): https://mytko-forecast-ui.vercel.app
- API (remote BASE, optional): `<BASE>` (verify `/api/metrics` = 200 before use)

Demo date
- Preferred (UI): `VITE_DEMO_DEFAULT_DATE`
- API fallback: GET `/api/metrics` → `{"demo_default_date":"YYYY-MM-DD"}` (defaults to 2024‑08‑03)

Key docs
- Demo Runbook: docs/System/Demo_Runbook.md
- Local Quickstart: docs/SOP/LOCAL_DEMO_QUICKSTART.md
- API Endpoints (frozen v0): docs/System/API_Endpoints.md
- Health Checks: docs/System/Health_Checks.md
- Deployment State (local): docs/System/Deployment_State.md
- Review Bundles SOP: docs/SOP/review-bundles.md
- Repo Map: docs/System/Repo_Map.md
- Monorepo Plan: docs/System/Monorepo_Plan.md

What changed (Phase‑1 scope)
- S1→S3: sites ingest/baseline/reconcile — behind flags; defaults unchanged
- S6: site-level backtests (eval-only); routes helper included; read‑only API
- Tests green; coverage ≥ 85%; spec_sync/docs_check OK

Accuracy (2024 windows)
- Region WAPE median ≈ 8.13%; District WAPE median ≈ 13.11% (p75 20.06%, p90 33.96%)
- Backtest gallery: `reports/backtest_consolidated_auto/index_en.html`

Acceptance mapping (UI)
- Overview/Districts → `/api/metrics`, `/api/districts`
- Sites/Registry → `/api/sites?date=YYYY-MM-DD`
- Routes cards/table → `/api/routes?date=YYYY-MM-DD&policy=strict|showcase` (fallback in UI if server CSV absent)

Notes
- CORS: set `API_CORS_ORIGIN` to the stable UI origin and restart API
- Sites remain behind flags; default forecasts unchanged
