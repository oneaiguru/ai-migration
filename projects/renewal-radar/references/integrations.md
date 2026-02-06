# Renewal Radar - Integration Guide

## HubSpot Integration

```python
import hubspot

def fetch_hubspot_touchpoints(days=90):
    """Fetch engagement from HubSpot."""
    client = hubspot.Client.create(api_key="YOUR_KEY")

    # Get email opens
    opens = client.marketing.events.email_open_api.get_page()

    # Transform to standard format
    rows = []
    for event in opens.results:
        rows.append({
            "account_id": event.customer_id,
            "touchpoint_dt": event.occurred_at[:10],
            "interaction_value": 1.0,
            "interaction_type": "email_open"
        })

    return pd.DataFrame(rows)
```

## Salesforce Integration

```python
from simple_salesforce import Salesforce

def fetch_salesforce_activities(days=90):
    """Fetch activities from Salesforce."""
    sf = Salesforce(
        username='user@example.com',
        password='password',
        security_token='token'
    )

    # Query activities
    result = sf.query_all("""
        SELECT AccountId, ActivityDate, Description
        FROM Task
        WHERE ActivityDate = LAST_N_DAYS:90
    """)

    rows = []
    for row in result['records']:
        rows.append({
            "account_id": row['AccountId'],
            "touchpoint_dt": row['ActivityDate'],
            "interaction_value": 3.0,
            "interaction_type": "salesforce_task"
        })

    return pd.DataFrame(rows)
```

## Google Calendar Integration

```python
from googleapiclient.discovery import build

def fetch_calendar_meeting(days=90):
    """Fetch meetings from Google Calendar."""
    service = build('calendar', 'v3', credentials=creds)

    events = service.events().list(
        calendarId='primary',
        timeMin=datetime.now().isoformat()
    ).execute()

    rows = []
    for event in events.get('items', []):
        if 'attendees' in event:
            for attendee in event['attendees']:
                if attendee.get('email'):
                    rows.append({
                        "account_id": extract_account_from_email(attendee['email']),
                        "touchpoint_dt": event['start'][:10],
                        "interaction_value": 5.0,
                        "interaction_type": "meeting"
                    })

    return pd.DataFrame(rows)
```

## Exporting Results Back to CRM

```python
def push_risk_scores_to_hubspot(risk_df):
    """Push churn risk scores to HubSpot."""
    client = hubspot.Client.create(api_key="YOUR_KEY")

    for _, row in risk_df.iterrows():
        # Update custom property
        client.crm.companies.basic_api.update(
            company_id=row['account_id'],
            simple_properties={
                "churn_probability": row['churn_prob_end'],
                "engagement_score": row['engagement_score_end']
            }
        )
```
