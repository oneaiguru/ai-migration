# Renewal Radar - Real Data Playbook

## Input Schemas

### accounts.csv

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| account_id | Yes | string | Unique account identifier |
| company | Yes | string | Account/company name |
| arr | No | number | Annual recurring revenue |
| tier | No | string | Customer tier (enterprise, mid-market, smb) |
| renewal_date | No | date | Contract renewal date (YYYY-MM-DD) |

### touchpoints.csv

| Column | Required | Type | Description |
|--------|----------|------|-------------|
| account_id | Yes | string | Must match accounts.csv |
| touchpoint_dt | Yes | date | When the engagement occurred (YYYY-MM-DD) |
| interaction_value | Yes | number | Engagement score (1=open, 2=click, 5=reply, etc.) |
| interaction_type | No | string | Type of interaction (for filtering) |

## Interaction Value Scoring

Recommended scoring:
- Email open: 1.0
- Email click: 2.0
- Email reply: 5.0
- Meeting attended: 5.0
- CRM activity: 3.0
- Website visit: 1.5

## Data Quality Checks

Basic checks before forecasting:
- Ensure `account_id` values match between accounts and touchpoints files
- Check that `touchpoint_dt` is a valid date format (YYYY-MM-DD)
- Verify `interaction_value` is numeric
- Confirm touchpoints fall within your expected date range

## Mapping Columns from Exports

If your column names don't match, rename them before loading:
```json
{
  "accounts": {
    "account_id": "Account_ID",
    "company": "Account_Name",
    "arr": "ARR",
    "tier": "Segment",
    "renewal_date": "Renewal"
  },
  "touchpoints": {
    "account_id": "Account",
    "touchpoint_dt": "Date",
    "interaction_value": "Score",
    "interaction_type": "Type"
  }
}
```

## Sample Data Generation

For testing without real data, use the included mock data:
```bash
python3 demo_renewal_radar.py
```
