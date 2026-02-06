#!/usr/bin/env python3
"""
Generate realistic 90-day engagement touchpoints for TLDR advertisers.

Interaction types:
- 1.0: Report/newsletter open
- 2.0: Email response, link click, campaign engagement
- 3.0: Meeting accept, proposal download, action
- 0.5: Soft engagement (unsubscribe prevention)
"""

import pandas as pd
from datetime import date, timedelta
import random
import numpy as np

# Seed for reproducibility
random.seed(42)
np.random.seed(42)

# Load accounts
accounts_df = pd.read_csv("mock_accounts.csv")

# Date range: 90 days ago to today
cutoff_date = date(2025, 1, 24)
start_date = cutoff_date - timedelta(days=90)
date_range = [(start_date + timedelta(days=i)).isoformat() for i in range(90)]

# Engagement patterns by tier
tier_patterns = {
    "enterprise": {
        "events_per_90_days": (15, 25),  # Frequent engagement
        "high_value_prob": 0.35,  # 35% chance of meeting/high-value event
        "consistency": 0.8,  # High consistency week-to-week
    },
    "mid-market": {
        "events_per_90_days": (8, 15),
        "high_value_prob": 0.20,
        "consistency": 0.6,
    },
    "startup": {
        "events_per_90_days": (4, 10),
        "high_value_prob": 0.10,
        "consistency": 0.4,
    },
}

# Industry-specific engagement multipliers
industry_multipliers = {
    "Cloud Infrastructure": 1.3,
    "AI/ML": 1.25,
    "Collaboration": 1.1,
    "Productivity": 1.0,
    "Developer Tools": 1.15,
    "DevOps": 1.2,
    "Data & AI": 1.25,
    "Payments": 0.9,
    "Communications": 1.05,
    "Design Tools": 1.0,
    "Project Management": 1.05,
}

touchpoints = []

for _, account in accounts_df.iterrows():
    account_id = account["account_id"]
    tier = account["tier"]
    industry = account["industry"]
    arr = account["arr"]

    # Get baseline events for this tier
    min_events, max_events = tier_patterns[tier]["events_per_90_days"]
    base_events = random.randint(min_events, max_events)

    # Apply industry multiplier
    multiplier = industry_multipliers.get(industry, 1.0)
    adjusted_events = max(int(base_events * multiplier), 1)

    # Generate random dates for touchpoints
    selected_dates = random.sample(date_range, min(adjusted_events, len(date_range)))

    for touchpoint_date in selected_dates:
        # Determine interaction value
        if random.random() < tier_patterns[tier]["high_value_prob"]:
            # High-value interaction (meeting, proposal)
            interaction_value = 3.0
            interaction_type = random.choice(["meeting_accept", "proposal_download", "contract_signed"])
        elif random.random() < 0.4:
            # Medium engagement (click, response)
            interaction_value = 2.0
            interaction_type = random.choice(["email_response", "link_click", "content_download"])
        else:
            # Basic engagement (open)
            interaction_value = 1.0
            interaction_type = "report_open"

        # Add some noise (occasional low-value engagement to prevent churn)
        if random.random() < 0.1:
            interaction_value = 0.5
            interaction_type = "email_open_only"

        touchpoints.append({
            "account_id": account_id,
            "touchpoint_dt": touchpoint_date,
            "interaction_value": interaction_value,
            "interaction_type": interaction_type,
        })

# Create DataFrame and sort
touchpoints_df = pd.DataFrame(touchpoints)
touchpoints_df = touchpoints_df.sort_values(["account_id", "touchpoint_dt"])

# Export
touchpoints_df.to_csv("mock_touchpoints_90d.csv", index=False)
print(f"Generated {len(touchpoints_df)} touchpoints for {len(accounts_df)} accounts")
print(f"Date range: {start_date.isoformat()} to {cutoff_date.isoformat()}")
print(f"\nTouchpoint distribution:")
print(touchpoints_df.groupby("interaction_type")["interaction_value"].count())
print(f"\nAverage interactions per account: {len(touchpoints_df) / len(accounts_df):.1f}")
print(f"Accounts with no touchpoints: {len(accounts_df) - touchpoints_df['account_id'].nunique()}")
