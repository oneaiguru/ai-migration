---
name: renewal-radar
description: Forecasts account churn/renewal risk ~30 days out from engagement touchpoints (email opens/clicks/replies, meetings, CRM activities). Use to generate at-risk account lists, churn probabilities, and ARR-at-risk reports for CSM workflows. Supports standardized inputs (accounts.csv + touchpoints.csv) or raw exports from HubSpot/Salesforce/email/calendar.
---

# Renewal Radar

## Workflow

1) Run the included demo on mock data (sanity check)
2) Use the module directly with your own data

## Run the demo (mock data)

```bash
python3 -m pip install -r requirements.txt
python3 demo_renewal_radar.py
```

Read results in `reports/` (especially `reports/renewal_radar_at_risk_2025-01-24.csv`).

## Run on your own data

### Using the CLI wrapper

```bash
python3 run_renewal_radar.py \
  --accounts data/real/accounts.csv \
  --touchpoints data/real/touchpoints.csv \
  --cutoff 2025-01-24 \
  --horizon 30 \
  --summary
```

### Using the Python module

Inputs:
- `accounts.csv`: `account_id`, `company` (recommended: `arr`, `tier`, `renewal_date`)
- `touchpoints.csv`: `account_id`, `touchpoint_dt`, `interaction_value` (optional: `interaction_type`)

```python
import pandas as pd
from datetime import date
from src.account_health import generate_churn_forecast, ChurnForecastRequest

# Load your data
accounts_df = pd.read_csv("data/real/accounts.csv")
touchpoints_df = pd.read_csv("data/real/touchpoints.csv")
touchpoints_df["touchpoint_dt"] = pd.to_datetime(touchpoints_df["touchpoint_dt"]).dt.date

# Generate forecast
request = ChurnForecastRequest(
    cutoff_date=date(2025, 1, 24),
    horizon_days=30,
)
result = generate_churn_forecast(
    request=request,
    touchpoint_df=touchpoints_df,
    registry_df=accounts_df,
)
```

## Outputs

Write these files into `reports/`:
- `renewal_radar_at_risk_<cutoff>.csv`: one row per account, sorted by end-of-horizon risk (primary action list)
- `renewal_radar_account_summary_<cutoff>.csv`: one row per account with end-of-horizon metrics
- `renewal_radar_forecast_<cutoff>.csv`: daily time series per account (debugging / trend charts)
- `renewal_radar_summary_<cutoff>.md`: human-readable summary
- `renewal_radar_watchlist_<cutoff>.csv`: optional (accounts that spike in-horizon but end < threshold)

Use end-of-horizon risk (`churn_prob_end`) for action lists to avoid noisy mid-horizon spikes.

## Algorithm (high level)

1) Learn per-account baseline engagement rates by weekday from a trailing window (default 90d)
2) Simulate engagement forward with daily decay (default 0.02 per day)
3) Convert engagement score to churn probability and flag accounts above the risk threshold

Implementation lives in `src/account_health/`.

## References (load only if needed)

- Cowork runbook (macOS, non-technical): `references/cowork.md`
- Real data playbook (schemas, mapping, prompt templates): `references/real_data.md`
- Integrations (templates/pseudocode): `references/integrations.md`
- FAQ: `references/faq.md`
