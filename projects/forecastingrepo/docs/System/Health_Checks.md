# Health Checks & Smokes

This page summarizes quick checks to verify the repo and the read‑only API.

## Backend gates
```
pytest -q --cov=scripts --cov-report=term-missing
python .tools/spec_sync.py
python .tools/docs_check.py
```

## API smokes
```
API_BASE=${API_BASE:-http://127.0.0.1:8000}

# Metrics JSON
curl -fsS "$API_BASE/api/metrics" | jq . | head -n 20

# Districts JSON (top 50)
curl -fsS "$API_BASE/api/districts" | jq '.[0:5]'

# Sites for a date (CSV)
curl -fsS "$API_BASE/api/sites?date=2024-08-03&limit=5&format=csv" | column -t -s,

# Routes for a date (JSON)
curl -fsS "$API_BASE/api/routes?date=2024-08-03&policy=strict" | jq '.[0:5]'
```

## Bootstrap
```
# Create venv, run tests/specs/docs; optionally start API
bash scripts/bootstrap.sh
# Start API on port 8000 too
START_API=1 PORT=8000 bash scripts/bootstrap.sh
```

## UI wiring
Local default:
```
scripts/dev/local_demo_up.sh
# UI → http://127.0.0.1:4173, API → http://127.0.0.1:8000/api/metrics
```

Remote (optional):
```
cloudflared tunnel --url http://127.0.0.1:8000
# Then set Vercel VITE_API_URL to the printed https URL and redeploy
```

## Notes
- Determinism: export `PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8` for tests.
- API config via env: `REPORTS_DIR`, `SITES_DATA_DIR`, `DELIVERIES_DIR`, `API_CORS_ORIGIN`.
