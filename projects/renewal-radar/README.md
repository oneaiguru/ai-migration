# Renewal Radar

Account churn/renewal risk forecasting ~30 days out from engagement touchpoints (email opens/clicks/replies, meetings, CRM activities).

## Features

- **Churn Forecast**: Predict account churn probability 1-365 days into the future
- **Engagement Scoring**: Learn per-account baseline engagement patterns by day-of-week
- **Risk Stratification**: Flag accounts at risk for CSM outreach prioritization
- **Flexible Inputs**: Standardized CSV or raw exports from HubSpot/Salesforce/email/calendar

## Quick Start

```bash
# Install dependencies
python3 -m pip install -r requirements.txt

# Run demo with mock data
python3 demo_renewal_radar.py
```

Results are written to `reports/`:
- `renewal_radar_at_risk_YYYY-MM-DD.csv` - Primary action list
- `renewal_radar_account_summary_YYYY-MM-DD.csv` - Per-account metrics
- `renewal_radar_forecast_YYYY-MM-DD.csv` - Daily time series (debugging)

## Usage

### Using the CLI wrapper (recommended)

```bash
python3 run_renewal_radar.py \
  --accounts data/mock_accounts.csv \
  --touchpoints data/mock_touchpoints_90d.csv \
  --cutoff 2025-01-24 \
  --horizon 30 \
  --out-dir reports \
  --summary
```

Options:
- `--accounts, -a`: Accounts CSV file (required)
- `--touchpoints, -t`: Touchpoints CSV file
- `--cutoff, -c`: Cutoff date YYYY-MM-DD (default: latest touchpoint)
- `--horizon, -H`: Forecast days 1-365 (default: 30)
- `--decay-rate`: Daily decay rate 0-1 (default: 0.02)
- `--risk-threshold`: Churn threshold 0-1 (default: 0.5)
- `--account-ids`: Filter to specific accounts
- `--out-dir, -o`: Output directory (default: reports/)
- `--summary`: Print summary to stdout

### Using the module directly

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

# Export results
result.forecast_df.to_csv("reports/forecast.csv", index=False)
```

### Run the demo

```bash
python3 demo_renewal_radar.py
```

## Input Schemas

**accounts.csv**: `account_id`, `company` (optional: `arr`, `tier`, `renewal_date`)

**touchpoints.csv**: `account_id`, `touchpoint_dt`, `interaction_value` (optional: `interaction_type`)

## Algorithm

1. Learn per-account baseline engagement rates by weekday from trailing window (default 90d)
2. Simulate engagement forward with daily decay (default 2%/day)
3. Convert engagement score to churn probability using sigmoid around threshold (0.5)

## Development

```bash
# Run tests
pytest tests/ -v

# Run specific test
pytest tests/test_baseline.py -v
```

## References

- `references/cowork.md` - Non-technical runbook for macOS users
- `references/real_data.md` - Data schemas and mapping guide
- `references/integrations.md` - Integration templates
- `references/faq.md` - Frequently asked questions
