# Review Pack (Demo)

This page collects the stable URLs, quick curls, and review bundle pointers so reviewers can validate the demo quickly.

## URLs
- UI (stable): https://mytko-forecast-ui.vercel.app
- API (tunnel): https://showing-shaved-demo-league.trycloudflare.com
- Demo date: 2024-08-03 (also exposed by `/api/metrics.demo_default_date`)

## Curls (smoke)
```
curl -m 5 -fsS "$API_BASE/api/metrics" | jq .
curl -m 5 -fsS "$API_BASE/api/districts" | jq .
curl -m 5 -fsS "$API_BASE/api/sites?date=2024-08-03&limit=5" | jq .
curl -m 5 -fsS "$API_BASE/api/routes?date=2024-08-03&policy=strict" | jq .
```

## Notes
- CORS is locked via `API_CORS_ORIGIN` env; CSV exports use `csv.DictWriter` for safety.
- Minimal rate-limit via `slowapi` on read-only endpoints (10/min per IP).
- Routes enrichment includes: `fill_pct, overflow_prob, last_service_dt, volume_m3, schedule` when present in CSV.
- API contracts live in `docs/api/openapi.json`; regenerate with `python scripts/export_openapi.py --write` before packaging.
- Generate concatenated context bundles with `python tools/concat_context.py` (use manifest in `docs/Tasks/context_manifest.yml`).

## Bundles
- Desktop (local): `/Users/m/Desktop/reviews/*.zip` — Core, API, Eval, Config, Rest
- UI bundles: `~/reviews/ui_components_bundle/`, `~/reviews/ui_config_bundle/`, `~/reviews/ui_supporting_bundle/`
- Context bundle outputs: `concatenated_output/*.md` (generated on demand for reviewers)

## Acceptance
- `/api/metrics` returns `demo_default_date = 2024-08-03`.
- `/api/routes?...` non-empty JSON & CSV for the demo date; CSV opens safely in Excel.
- Health script green: `bash scripts/health/health_check.sh`.
