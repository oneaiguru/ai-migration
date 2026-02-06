---
name: renewal-radar
description: Forecasts account churn/renewal risk ~30 days out from engagement touchpoints (email opens/clicks/replies, meetings, CRM activities). Use to generate at-risk account lists, churn probabilities, and ARR-at-risk reports for CSM workflows. Supports standardized inputs (accounts.csv + touchpoints.csv) or raw exports from HubSpot/Salesforce/email/calendar via included scripts.
---

# Renewal Radar

## Workflow

Follow one of these workflows (prefer scripts over re-implementing logic):

1) Run the included demo on mock data (sanity check)
2) Run on standardized inputs (`accounts.csv` + `touchpoints.csv`)
3) Run from raw exports (Cowork-friendly, one command)

## Run the demo (mock data)

```bash
python3 -m pip install -r requirements.txt
python3 demo_renewal_radar.py
```

Read results in `reports/` (especially `reports/renewal_radar_at_risk_2025-01-24.csv`).

## Run on standardized inputs

Use this when standardized inputs already exist (or after generating them from exports).

Inputs:
- `accounts.csv`: `account_id`, `company` (recommended: `arr`, `tier`, `renewal_date`)
- `touchpoints.csv`: `account_id`, `touchpoint_dt`, `interaction_value` (optional: `interaction_type`)

```bash
python3 scripts/validate_renewal_radar_inputs.py \
  --accounts data/real/accounts.csv \
  --touchpoints data/real/touchpoints.csv

python3 scripts/run_renewal_radar.py \
  --accounts data/real/accounts.csv \
  --touchpoints data/real/touchpoints.csv \
  --cutoff auto \
  --horizon 30 \
  --risk-threshold 0.5 \
  --out-dir reports
```

## Run from raw exports (one command)

Put two exports in place:
- `exports/accounts_raw.csv`
- `exports/events_raw.csv`

Then run:

```bash
python3 scripts/cowork_one_click.py --open
```

If mapping or column names do not match, generate a starter mapping and edit it:

```bash
python3 scripts/inspect_exports.py --write-mapping config/renewal_radar_mapping.json
```

Then re-run `python3 scripts/cowork_one_click.py --open`.

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
