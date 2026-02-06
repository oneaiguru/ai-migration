#!/usr/bin/env python3
"""
Renewal Radar CLI - Generate churn forecasts from command line.

Usage:
    python3 run_renewal_radar.py \
        --accounts data/mock_accounts.csv \
        --touchpoints data/mock_touchpoints_90d.csv \
        --cutoff 2025-01-24 \
        --horizon 30 \
        --out-dir reports
"""

import argparse
import json
from datetime import date
from pathlib import Path
import sys

import pandas as pd

from src.account_health import generate_churn_forecast, ChurnForecastRequest


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate churn forecasts for account renewal risk",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with mock data
  python3 run_renewal_radar.py --accounts data/mock_accounts.csv

  # Custom horizon and threshold
  python3 run_renewal_radar.py \\
    --accounts data/accounts.csv \\
    --touchpoints data/touchpoints.csv \\
    --cutoff 2025-01-24 \\
    --horizon 60 \\
    --risk-threshold 0.4

  # Filter to specific accounts
  python3 run_renewal_radar.py \\
    --accounts data/accounts.csv \\
    --touchpoints data/touchpoints.csv \\
    --account-ids acct-1 acct-2 acct-3
        """
    )
    parser.add_argument(
        "--accounts", "-a",
        required=True,
        help="Path to accounts CSV file (account_id, company, arr, ...)"
    )
    parser.add_argument(
        "--touchpoints", "-t",
        help="Path to touchpoints CSV file (account_id, touchpoint_dt, interaction_value)"
    )
    parser.add_argument(
        "--cutoff", "-c",
        help="Cutoff date (YYYY-MM-DD). Default: latest touchpoint date",
    )
    parser.add_argument(
        "--horizon", "-H",
        type=int,
        default=30,
        help="Forecast horizon in days (1-365). Default: 30"
    )
    parser.add_argument(
        "--window",
        type=int,
        default=90,
        help="Training window in days. Default: 90"
    )
    parser.add_argument(
        "--decay-rate",
        type=float,
        default=0.02,
        help="Daily engagement decay rate (0-1). Default: 0.02"
    )
    parser.add_argument(
        "--risk-threshold",
        type=float,
        default=0.5,
        help="Churn risk threshold (0-1). Default: 0.5"
    )
    parser.add_argument(
        "--account-ids",
        nargs="*",
        help="Filter to specific account IDs (space-separated)"
    )
    parser.add_argument(
        "--out-dir", "-o",
        default="reports",
        help="Output directory for reports. Default: reports/"
    )
    parser.add_argument(
        "--summary",
        action="store_true",
        help="Print summary to stdout"
    )
    return parser.parse_args()


def load_data(args):
    """Load and validate input data."""
    # Load accounts
    accounts_df = pd.read_csv(args.accounts)
    required_cols = {"account_id", "company"}
    missing = required_cols - set(accounts_df.columns)
    if missing:
        sys.exit(f"Error: accounts.csv missing columns: {missing}")

    # Load touchpoints (optional if using mock mode)
    if args.touchpoints:
        touchpoints_df = pd.read_csv(args.touchpoints)
        required_touchpoint_cols = {"account_id", "touchpoint_dt", "interaction_value"}
        missing = required_touchpoint_cols - set(touchpoints_df.columns)
        if missing:
            sys.exit(f"Error: touchpoints.csv missing columns: {missing}")
        touchpoints_df["touchpoint_dt"] = pd.to_datetime(touchpoints_df["touchpoint_dt"]).dt.date
    else:
        touchpoints_df = pd.DataFrame(columns=["account_id", "touchpoint_dt", "interaction_value"])

    return accounts_df, touchpoints_df


def determine_cutoff(args, touchpoints_df):
    """Determine cutoff date from args or data."""
    if args.cutoff:
        try:
            return date.fromisoformat(args.cutoff)
        except ValueError:
            sys.exit(f"Error: Invalid cutoff date format: {args.cutoff}. Use YYYY-MM-DD")
    elif not touchpoints_df.empty:
        return touchpoints_df["touchpoint_dt"].max()
    else:
        return date.today()


def build_forecast_summary(result, accounts_df, at_risk_df, args):
    """Build human-readable summary."""
    cutoff = result.cutoff_date.isoformat()
    total_arr = accounts_df["arr"].sum() if "arr" in accounts_df.columns else 0
    at_risk_arr = at_risk_df["arr"].sum() if not at_risk_df.empty and "arr" in at_risk_df.columns else 0

    lines = [
        "=" * 60,
        "RENEWAL RADAR FORECAST SUMMARY",
        "=" * 60,
        f"Cutoff Date:    {cutoff}",
        f"Forecast Period: {result.start_date.isoformat()} to {result.end_date.isoformat()}",
        f"Horizon:        {args.horizon} days",
        f"Accounts:       {result.account_count}",
        "",
        "-" * 60,
        "AT-RISK ACCOUNTS",
        "-" * 60,
        f"Accounts at risk (≥{int(args.risk_threshold * 100)}%): {at_risk_df['account_id'].nunique() if not at_risk_df.empty else 0}",
        f"Total ARR at risk: ${at_risk_arr:,.0f}" if at_risk_arr > 0 else "Total ARR at risk: N/A",
        f"Percent of ARR:   {at_risk_arr / total_arr * 100:.1f}%" if total_arr > 0 else "",
        "",
    ]

    if not at_risk_df.empty and len(at_risk_df) <= 20:
        lines.extend(["Top At-Risk Accounts:", "-" * 40])
        for _, row in at_risk_df.head(20).iterrows():
            company = row.get("company", row["account_id"])
            churn_prob = row.get("churn_prob_end", 0)
            arr = row.get("arr", 0)
            lines.append(f"  {company:30} Churn: {churn_prob:.1%}  ARR: ${arr:,.0f}")

    lines.append("=" * 60)
    return "\n".join(lines)


def main():
    args = parse_args()

    # Load data
    accounts_df, touchpoints_df = load_data(args)

    # Determine cutoff
    cutoff_date = determine_cutoff(args, touchpoints_df)

    # Build request
    request = ChurnForecastRequest(
        cutoff_date=cutoff_date,
        horizon_days=args.horizon,
        account_ids=args.account_ids if args.account_ids else None,
    )

    # Generate forecast
    print(f"Generating forecast...")
    print(f"  Accounts: {len(accounts_df)}")
    print(f"  Touchpoints: {len(touchpoints_df)}")
    print(f"  Cutoff: {cutoff_date.isoformat()}")
    print(f"  Horizon: {args.horizon} days")

    result = generate_churn_forecast(
        request=request,
        touchpoint_df=touchpoints_df,
        registry_df=accounts_df,
        window_days=args.window,
        decay_rate_per_day=args.decay_rate,
        churn_threshold=args.risk_threshold,
    )

    # Build account summary
    forecast_df = result.forecast_df
    if forecast_df.empty:
        print("No forecast generated (empty population or no data).")
        return

    end_iso = result.end_date.isoformat()
    end_day = forecast_df[forecast_df["date"] == end_iso][
        ["account_id", "engagement_score", "churn_prob"]
    ].rename(columns={
        "engagement_score": "engagement_score_end",
        "churn_prob": "churn_prob_end",
    })

    agg = forecast_df.groupby("account_id", as_index=False).agg(
        max_churn_prob=("churn_prob", "max"),
    )

    at_risk_points = forecast_df[forecast_df["churn_prob"] >= args.risk_threshold]
    first_at_risk = (
        at_risk_points.groupby("account_id", as_index=False)["date"]
        .min()
        .rename(columns={"date": "first_at_risk_date"})
    )

    # Build column list dynamically based on what exists in accounts_df
    required_cols = ["account_id", "company"]
    optional_cols = [c for c in ["tier", "arr", "renewal_date"] if c in accounts_df.columns]
    merge_cols = required_cols + optional_cols

    account_summary = (
        agg.merge(end_day, on="account_id", how="left")
        .merge(first_at_risk, on="account_id", how="left")
        .merge(
            accounts_df[merge_cols],
            on="account_id",
            how="left",
        )
    )

    # Identify at-risk accounts
    at_risk_df = account_summary[account_summary["churn_prob_end"] >= args.risk_threshold].copy()
    # Sort by churn_prob, optionally by arr if column exists
    sort_cols = ["churn_prob_end"]
    if "arr" in at_risk_df.columns:
        sort_cols.append("arr")
    at_risk_df = at_risk_df.sort_values(sort_cols, ascending=[False] * len(sort_cols))

    # Create output directory
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Write outputs
    cutoff_str = result.cutoff_date.isoformat()

    forecast_file = out_dir / f"renewal_radar_forecast_{cutoff_str}.csv"
    forecast_df.to_csv(forecast_file, index=False)

    summary_file = out_dir / f"renewal_radar_account_summary_{cutoff_str}.csv"
    account_summary.to_csv(summary_file, index=False)

    at_risk_file = out_dir / f"renewal_radar_at_risk_{cutoff_str}.csv"
    at_risk_df.to_csv(at_risk_file, index=False)

    print(f"\nResults written to:")
    print(f"  {forecast_file}")
    print(f"  {summary_file}")
    print(f"  {at_risk_file}")

    # Print summary
    if args.summary:
        print("\n")
        print(build_forecast_summary(result, accounts_df, at_risk_df, args))


if __name__ == "__main__":
    main()
