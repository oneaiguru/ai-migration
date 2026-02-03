# Demo Runbook (Sites + Backtests)

This runbook guides a clean demo using the read‑only API and existing artifacts. No behavior changes; sites remain behind a flag.

## Prerequisites
- Python 3.11+
- repo cloned; checkout `main`
- Optional: FastAPI dev deps installed (`requirements-dev.txt`)

## One‑command bootstrap (recommended)
```
bash scripts/bootstrap.sh
# or start the API too:
START_API=1 PORT=8000 bash scripts/bootstrap.sh
```

## Manual steps
1) Create venv and install deps
```
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
```
2) Verify gates
```
pytest -q --cov=scripts --cov-report=term-missing
python .tools/spec_sync.py
python .tools/docs_check.py
```
3) Generate (or reuse) per‑site demo outputs (flag ON)
```
PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 PYTHONPATH=. \
python scripts/ingest_and_forecast.py forecast \
  --train-until 2024-07-31 \
  --daily-window 2024-08-01:2024-08-07 \
  --monthly-window 2024-08:2024-08 \
  --scopes region,districts,sites \
  --scenario-path scenarios/site_level.yml \
  --methods daily=weekday_mean,monthly=last3m_mean \
  --daily-csv data/daily_waste_by_district.csv \
  --monthly-csv data/monthly_waste_by_district.csv \
  --outdir deliveries/sites_run
```
4) Build routes CSVs (strict + showcase)
```
python scripts/routes_recommend.py \
  --sites-csv deliveries/.../forecasts/sites/daily_fill_YYYY-MM-DD_to_YYYY-MM-DD.csv \
  --d-day YYYY-MM-DD --lookahead 3 --policy 'risk>=0.8 or fill>=0.8'
python scripts/routes_recommend.py \
  --sites-csv deliveries/.../forecasts/sites/daily_fill_YYYY-MM-DD_to_YYYY-MM-DD.csv \
  --d-day YYYY-MM-DD --lookahead 3 --policy 'fill>=0.5'
```
5) Start the read‑only API
```
uvicorn scripts.api_app:app --host 127.0.0.1 --port 8000
```
6) Verify endpoints
- http://127.0.0.1:8000/api/metrics
- http://127.0.0.1:8000/api/districts
- http://127.0.0.1:8000/api/sites?date=YYYY-MM-DD
- http://127.0.0.1:8000/api/routes?date=YYYY-MM-DD&policy=strict

7) Evidence pack files (optional, already included)
- `reports/backtest_consolidated_auto/index_en.html`
- `reports/backtest_consolidated_auto/scoreboard_consolidated.csv`
- `reports/backtest_consolidated_auto/metrics_summary.json`

8) Share zips (already built in this session)
- `~/Downloads/proposal_pack_<ts>.zip`
- `~/Downloads/review_bundle_<ts>.zip`

9) Determinism
- Env: `PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 MPLBACKEND=Agg`

10) Defaults unchanged
- Sites behind scenario flag; golden (region/district) untouched when flag OFF.

