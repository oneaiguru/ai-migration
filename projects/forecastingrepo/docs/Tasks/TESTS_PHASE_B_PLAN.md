# Phase B — API Tests Expansion Plan (Read‑only, Filesystem‑backed)

## Scope
- Expand tests across existing endpoints to improve confidence without changing contracts.
- Keep runs fast and deterministic; use tiny fixtures in `tmp_path` + env overrides.

## Environment
- Export: `PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 MPLBACKEND=Agg`
- Env overrides per test module:
  - `SITES_DATA_DIR`, `DELIVERIES_DIR`, `REPORTS_DIR`, optional `DEMO_DEFAULT_DATE`.

## High‑Value Tests (Implement Next)
- Sites listing
  - Headers/paging: JSON+CSV headers (`X-Total-Count`,`X-Unmapped-Sites`), large `limit/offset`.
  - Filters: `date` and `district` with a small `data/sites/sites_registry.csv`.
  - CSV header exactness: `site_id,district,date,fill_pct,overflow_prob,pred_volume_m3`.
- Routes collection
  - Join semantics: ensure `fill_pct/overflow_prob/last_service_dt` types/nulls are correct when joined.
  - CSV header exactness: `site_id,date,policy,visit,volume_m3,schedule,fill_pct,overflow_prob,last_service_dt`.
  - UTF‑8 and commas in `address/schedule` are safely quoted in CSV.
- Security and robustness
  - Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` on representative routes.
  - CORS preflight: honors `API_CORS_ORIGIN` for OPTIONS preflight.
  - CSV injection safety: strings starting with `=,+,-,@` are safely emitted in CSV.
  - Optional: rate limit (skip if `slowapi` missing) yields 429 under burst.
- Determinism
  - `DEMO_DEFAULT_DATE` appears in `/api/metrics` and is used by readers that depend on it (document behavior if not consumed elsewhere).
- OpenAPI
  - `scripts/export_openapi.py --check` parity test; schema param shapes (already covered partially).

## Structure & Helpers
- Add a `client_with_tmp_env` helper in `tests/conftest.py` to seed tiny fixtures and env; reuse across tests.
- Build tiny CSVs on the fly in `tmp_path` — avoid touching repo data; ensure cleanup via tmp fixtures.

## Acceptance
- New tests pass locally; no endpoint behavior changes.
- OpenAPI check remains green; no edits to exporter required.

## Commands
```
pytest -q
pytest --maxfail=1 --disable-warnings -q --cov=scripts --cov=src --cov-report=term-missing:skip-covered
behave --tags @smoke --no-capture --format progress
python scripts/export_openapi.py --write && python scripts/export_openapi.py --check
```

## Handoff
- Update `reviews/ATTACH_BE_BACKEND_API/06_test_report.md` with the new coverage snapshot and bullets of tests added.
- Append a short summary to `docs/SESSION_HANDOFF.md` (commands, outcomes, next step or confirm none).
