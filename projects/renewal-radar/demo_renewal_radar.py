#!/usr/bin/env python3
"""
Renewal Radar Demo: Account Churn Forecast for TLDR Advertisers

This script:
1. Loads 198 tech companies (AWS, Google Cloud, Anthropic, etc.)
2. Loads 90 days of engagement touchpoints
3. Generates 30-day churn forecast
4. Identifies at-risk renewal accounts
5. Exports results for CSM review
"""

from datetime import date
from pathlib import Path
import pandas as pd
from src.account_health import generate_churn_forecast, ChurnForecastRequest

# Load mock data
print("Loading TLDR advertiser data...")
accounts_df = pd.read_csv("data/mock_accounts.csv")
touchpoints_df = pd.read_csv("data/mock_touchpoints_90d.csv")

print(f"  - {len(accounts_df)} advertiser accounts")
print(f"  - {len(touchpoints_df)} engagement touchpoints over 90 days")
print(f"  - Total ARR: ${accounts_df['arr'].sum():,.0f}")

# Convert touchpoint_dt to date format
touchpoints_df["touchpoint_dt"] = pd.to_datetime(touchpoints_df["touchpoint_dt"]).dt.date

# Generate 30-day churn forecast
print("\nGenerating 30-day churn forecast...")
request = ChurnForecastRequest(
    cutoff_date=date(2025, 1, 24),  # Last known engagement data
    horizon_days=30,                  # Forecast window
    account_ids=None,                 # All accounts
)

result = generate_churn_forecast(
    request=request,
    touchpoint_df=touchpoints_df,
    registry_df=accounts_df,
    window_days=90,                   # Learn from 90-day window
    decay_rate_per_day=0.02,          # 2% daily decay without activity
    churn_threshold=0.5,              # Flag if engagement <= 0.5
)

forecast_df = result.forecast_df

print(f"  - Forecast generated for {result.account_count} accounts")
print(f"  - Forecast period: {result.start_date.isoformat()} to {result.end_date.isoformat()}")

# Build per-account summary (one row per account) for actionability.
end_iso = result.end_date.isoformat()
end_day = forecast_df[forecast_df["date"] == end_iso][
    ["account_id", "engagement_score", "decay_risk", "churn_prob"]
].rename(
    columns={
        "engagement_score": "engagement_score_end",
        "decay_risk": "decay_risk_end",
        "churn_prob": "churn_prob_end",
    }
)
agg = forecast_df.groupby("account_id", as_index=False).agg(
    max_churn_prob=("churn_prob", "max"),
    min_engagement_score=("engagement_score", "min"),
)
at_risk_points = forecast_df[forecast_df["churn_prob"] >= 0.5]
first_at_risk = (
    at_risk_points.groupby("account_id", as_index=False)["date"]
    .min()
    .rename(columns={"date": "first_at_risk_date"})
)
account_summary = (
    agg.merge(end_day, on="account_id", how="left")
    .merge(first_at_risk, on="account_id", how="left")
    .merge(
        accounts_df[["account_id", "company", "tier", "arr", "renewal_date"]],
        on="account_id",
        how="left",
    )
)

# Identify at-risk accounts (risk at end of horizon).
print("\nIdentifying accounts at churn risk...")
at_risk_merged = account_summary[account_summary["churn_prob_end"] >= 0.5].copy()
at_risk_merged = at_risk_merged.sort_values(["churn_prob_end", "arr"], ascending=[False, False])

print(f"  - {at_risk_merged['account_id'].nunique()} accounts at churn risk (churn_prob_end >= 0.5)")
print(f"  - Total ARR at risk: ${at_risk_merged['arr'].sum():,.0f}")

# Show top at-risk accounts
print("\nTop 20 At-Risk Accounts (End of Horizon):")
print("-" * 120)

top_at_risk = at_risk_merged.head(20)
for _, row in top_at_risk.iterrows():
    churn_prob = row["churn_prob_end"]
    risk_level = "CRITICAL" if churn_prob >= 0.8 else "HIGH" if churn_prob >= 0.6 else "MEDIUM"
    print(
        f"{risk_level:15} | {row['company']:25} | "
        f"Churn(end): {churn_prob:.1%} | Churn(max): {row['max_churn_prob']:.1%} | "
        f"Engagement(end): {row['engagement_score_end']:.2f} | "
        f"Renewal: {row['renewal_date']} | ARR: ${row['arr']:,.0f}"
    )

# Show healthy accounts
print("\nHealthy Accounts (churn_prob_end < 0.3):")
print("-" * 120)

healthy = account_summary[account_summary["churn_prob_end"] < 0.3].copy()
top_healthy = healthy.sort_values(["engagement_score_end", "arr"], ascending=[False, False]).head(15)
for _, row in top_healthy.iterrows():
    print(
        f"{'HEALTHY':15} | {row['company']:25} | "
        f"Churn(end): {row['churn_prob_end']:.1%} | Churn(max): {row['max_churn_prob']:.1%} | "
        f"Engagement(end): {row['engagement_score_end']:.2f} | "
        f"ARR: ${row['arr']:,.0f}"
    )

# Summary statistics
print("\nSummary Statistics:")
print("-" * 120)
summary_by_risk = account_summary.copy()
summary_by_risk["risk_bucket"] = pd.cut(
    summary_by_risk["churn_prob_end"],
    bins=[0, 0.3, 0.5, 0.7, 1.0],
    labels=["Healthy (<30%)", "At Risk (30-50%)", "High Risk (50-70%)", "Critical (70%+)"],
)
print(summary_by_risk.groupby("risk_bucket", observed=True).size())

print(f"\nAverage engagement score (all accounts): {summary_by_risk['engagement_score_end'].mean():.2f}")
print(f"Average churn probability (all accounts): {summary_by_risk['churn_prob_end'].mean():.1%}")

# Export results
print("\nExporting results...")
Path("reports").mkdir(parents=True, exist_ok=True)
output_file = "reports/renewal_radar_forecast_2025-01-24.csv"
forecast_df.to_csv(output_file, index=False)
print(f"  - Full forecast: {output_file}")

summary_output = "reports/renewal_radar_account_summary_2025-01-24.csv"
account_summary.to_csv(summary_output, index=False)
print(f"  - Account summary: {summary_output}")

at_risk_output = "reports/renewal_radar_at_risk_2025-01-24.csv"
at_risk_merged.to_csv(at_risk_output, index=False)
print(f"  - At-risk accounts: {at_risk_output}")

watchlist = account_summary[
    (account_summary["max_churn_prob"] >= 0.5) & (account_summary["churn_prob_end"] < 0.5)
].copy()
watchlist_output = "reports/renewal_radar_watchlist_2025-01-24.csv"
if not watchlist.empty:
    watchlist = watchlist.sort_values(["max_churn_prob", "arr"], ascending=[False, False])
    watchlist.to_csv(watchlist_output, index=False)
    print(f"  - Watchlist (risk spike): {watchlist_output}")

# Generate recommendation summary
print("\nCSM Action Items:")
print("-" * 120)
print("1. URGENT (next 7 days):")
critical = at_risk_merged[at_risk_merged["churn_prob_end"] >= 0.75]
for _, row in critical.iterrows():
    print(f"   - {row['company']:30} - Schedule check-in before {row['renewal_date']}")

print(f"\n2. PRIORITY (this month):")
high_risk = at_risk_merged[
    (at_risk_merged["churn_prob_end"] >= 0.5) &
    (at_risk_merged["churn_prob_end"] < 0.75)
]
print(f"   - Reach out to {len(high_risk)} high-risk accounts with renewal offers")

print(f"\n3. MONITOR (ongoing):")
medium_risk = summary_by_risk[
    (summary_by_risk["churn_prob_end"] >= 0.3) &
    (summary_by_risk["churn_prob_end"] < 0.5)
]
print(f"   - Track {len(medium_risk)} medium-risk accounts for engagement patterns")

print("\nRenewal Radar forecast complete!")
print("   Use these insights to prioritize CSM outreach and renewal strategy.")
