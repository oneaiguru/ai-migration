# Renewal Radar - Cowork Runbook

Non-technical guide for running Renewal Radar on macOS.

## What is Renewal Radar?

Renewal Radar helps identify which advertiser accounts are at risk of churning (not renewing) based on their engagement with our content.

## Quick Start (with Demo Data)

1. Open Terminal (press Cmd+Space, type "Terminal", press Enter)

2. Navigate to the project folder:
   ```bash
   cd ~/ai/projects/renewal-radar
   ```

3. Install dependencies (first time only):
   ```bash
   pip3 install -r requirements.txt
   ```

4. Run the demo:
   ```bash
   python3 demo_renewal_radar.py
   ```

5. Open the results folder:
   ```bash
   open reports/
   ```

The main file to review is `renewal_radar_at_risk_YYYY-MM-DD.csv`.

## Understanding the Output

### Risk Levels
- **Healthy** (<30% churn probability): No action needed
- **At Risk** (30-50%): Monitor engagement
- **High Risk** (50-70%): Prioritize outreach
- **Critical** (70%+): Urgent action required

### Key Columns in At-Risk Report
- `company`: Account name
- `churn_prob_end`: Churn probability at end of forecast
- `engagement_score_end`: Engagement score (0-1, higher is better)
- `arr`: Annual recurring revenue at risk
- `renewal_date`: When the contract is up for renewal

## Running with Your Own Data

Contact the data team to:
1. Export your account list to `data/real/accounts.csv`
2. Export engagement data to `data/real/touchpoints.csv`

Then run:
```bash
python3 run_renewal_radar.py \
  --accounts data/real/accounts.csv \
  --touchpoints data/real/touchpoints.csv \
  --summary
```

## Troubleshooting

**"Module not found" error**: Run `pip3 install -r requirements.txt` again.

**Empty results**: Check that your CSV files have the required columns.

**Need help**: Ask in the #data-science Slack channel.
