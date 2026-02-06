# Onboarding
## Goal
Get a new contributor productive in <30 min: run tests, understand specs, and create a forecast delivery.

## Steps
1. Clone repo; `pip install -r requirements-dev.txt`
2. Run tests: `pytest -q --cov=scripts --cov-report=term-missing`
3. Run spec sync: `python .tools/spec_sync.py` (must be OK)
4. Docs check: `python .tools/docs_check.py`
5. Create a sample delivery:

```
python scripts/ingest_and_forecast.py forecast \
 --train-until 2024-12-31 \
 --daily-window 2025-01-01:2025-01-31 \
 --monthly-window 2025-01:2025-03 \
 --scopes region,districts \
 --methods daily=weekday_mean,monthly=last3m_mean
```

6. Read order: Repo_Layout → Testing → Spec_Sync → CI_CD → Release

### Demo stack bring-up
- (Stack orchestration scripts are not yet imported. For now run the FastAPI app via `uvicorn --factory scripts.api_app:create_app --reload` and start each UI from its project directory, e.g., `cd projects/forecast-ui && npm run dev`.)

## Quicklook (visual check)
- See docs/System/Quicklook.md for details.
- After generating a delivery, you can produce a headless visualization report:

```
python scripts/quicklook_report.py \
  --actual-daily data/daily_waste_by_district.csv \
  --actual-monthly data/monthly_waste_by_district.csv \
  --forecast-daily deliveries/*/forecasts/daily_2025-01-01_to_2025-03-31.csv \
  --forecast-monthly deliveries/*/forecasts/monthly_2025-01_to_2025-12.csv \
  --outdir reports/quicklook_demo
```
- MyTKO demo data refresh notes live in `docs/System/Demo_Data.md`.

### Bootstrap (optional)
To set up a venv and run tests + checks in one go:

```
bash scripts/bootstrap.sh
```
