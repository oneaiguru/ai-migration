# Deployment State (Local Demo)

This snapshot documents the current local-only demo state for forecastingrepo.
No Vercel or remote frontend deployments are used in this phase.

## Snapshot
- Date: 2026-01-15
- Repo path: /Users/m/ai/projects/forecastingrepo
- Branch: qbsf-name-conflict-autosuffix
- Commit: 09cb4215b35216e0e50ab009badbefcbff5eb5e9
- Demo default date: 2024-08-03
- API base (local): http://127.0.0.1:8000
- UI base (local optional): http://127.0.0.1:4173
- Scenario flags: sites behind scenarios/site_level.yml (default off)
- Golden baseline: enforced by tests/golden/golden.yml

## Rolling Forecast Cache
- Key format: forecast_{cutoff}_{start}_{end}_w{window_days}_m{min_obs}[_suffix]
- suffix = build_cache_suffix(...) hash of window_days, min_obs, and filters
- Cache location: data/cache/forecasts

## Rollback (Local)
1. Revert to the previous commit (git revert <sha> or checkout a known-good tag).
2. If cache keys or forecast logic change, clear cached files in data/cache/forecasts.
3. Restart the local API (scripts/dev/local_demo_up.sh or uvicorn scripts.api_app:app).
4. Re-run targeted tests:
   - pytest -q tests/sites/test_forecast_cache.py tests/sites/test_rolling_forecast.py
   - pytest -q tests/api/test_rolling_forecast_endpoint.py
