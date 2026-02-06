# Integrations (Templates)

These snippets are intentionally minimal and should be treated as templates/pseudocode.
They assume you already have authenticated clients for your CRM and messaging systems.

## HubSpot

Goal: write risk fields back to HubSpot so CSMs can filter/sort inside the CRM.

```python
# Pseudocode: adapt to your HubSpot object type + SDK.
#
# Example fields you might upsert:
# - renewal_churn_prob_end
# - renewal_engagement_end
# - renewal_radar_run_date

end = account_summary_df  # one row per account (end-of-horizon metrics)

for _, row in end.iterrows():
    company_id = row["account_id"]  # often a HubSpot Company ID
    hubspot.crm.companies.basic_api.update(
        company_id=company_id,
        simple_public_object_input={
            "properties": {
                "renewal_churn_prob_end": float(row["churn_prob_end"]),
                "renewal_engagement_end": float(row["engagement_score_end"]),
            }
        },
    )
```

## Salesforce

Goal: create a task/opportunity for accounts that end the horizon above the risk threshold.

```python
# Pseudocode: adapt to your Salesforce client + object model.

for _, row in at_risk_df.iterrows():
    sf.Task.create(
        WhatId=row["account_id"],  # or AccountId depending on your org
        Subject=f"Renewal risk: {row.get('company','(unknown)')}",
        Priority="High",
        Status="Not Started",
        Description=(
            f"Renewal Radar end-of-horizon churn_prob={row['churn_prob_end']:.2f}. "
            "Review engagement and schedule outreach."
        ),
    )
```

## Slack

Goal: post a daily digest with new at-risk accounts and a link to the CSV.

```python
# Pseudocode: adapt to your Slack SDK.

new_ids = set(today_at_risk_df["account_id"]) - set(yesterday_at_risk_df["account_id"])

slack.chat_postMessage(
    channel="#renewal-radar",
    text=f"{len(new_ids)} accounts entered the churn zone today. See the latest at-risk CSV in reports/.",
)
```

