#!/usr/bin/env python3
"""
Validate and summarize Renewal Radar input CSVs.

Example:
  python3 scripts/validate_renewal_radar_inputs.py \
    --accounts data/real/accounts.csv \
    --touchpoints data/real/touchpoints.csv
"""

from __future__ import annotations

import argparse

import pandas as pd


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Validate Renewal Radar inputs")
    p.add_argument("--accounts", required=True, help="accounts.csv")
    p.add_argument("--touchpoints", required=True, help="touchpoints.csv")
    return p.parse_args()


def main() -> None:
    args = _parse_args()
    accounts = pd.read_csv(args.accounts, dtype={"account_id": str})
    touchpoints = pd.read_csv(args.touchpoints, dtype={"account_id": str})

    required_accounts = {"account_id", "company"}
    missing_accounts = required_accounts - set(accounts.columns)
    if missing_accounts:
        raise SystemExit(f"accounts: missing required columns: {sorted(missing_accounts)}")

    required_touchpoints = {"account_id", "touchpoint_dt", "interaction_value"}
    missing_touchpoints = required_touchpoints - set(touchpoints.columns)
    if missing_touchpoints:
        raise SystemExit(f"touchpoints: missing required columns: {sorted(missing_touchpoints)}")

    touchpoints["touchpoint_dt"] = pd.to_datetime(touchpoints["touchpoint_dt"], errors="coerce")
    touchpoints["interaction_value"] = pd.to_numeric(touchpoints["interaction_value"], errors="coerce")
    bad_dates = int(touchpoints["touchpoint_dt"].isna().sum())
    bad_values = int(touchpoints["interaction_value"].isna().sum())
    if bad_dates or bad_values:
        raise SystemExit(
            f"touchpoints: invalid rows: bad touchpoint_dt={bad_dates}, bad interaction_value={bad_values}"
        )

    touchpoints["touchpoint_dt"] = touchpoints["touchpoint_dt"].dt.date

    acct_count = int(accounts["account_id"].nunique())
    acct_rows = int(len(accounts))
    dup_account_ids = int(acct_rows - acct_count)
    tp_count = int(len(touchpoints))
    tp_accounts = int(touchpoints["account_id"].nunique())
    min_dt = touchpoints["touchpoint_dt"].min() if tp_count else None
    max_dt = touchpoints["touchpoint_dt"].max() if tp_count else None

    # Touchpoints per account distribution
    per_acct = touchpoints.groupby("account_id").size()
    account_set = set(accounts["account_id"])
    touchpoint_set = set(touchpoints["account_id"])
    missing_tp_accounts = sorted(account_set - touchpoint_set)
    unknown_tp_accounts = sorted(touchpoint_set - account_set)
    unknown_tp_rows = int((~touchpoints["account_id"].isin(account_set)).sum())

    print("Inputs OK")
    print(f"Accounts:    {acct_count}")
    if dup_account_ids:
        print(f"Note: {dup_account_ids} duplicate account_id rows in accounts.csv (kept; forecast uses unique account_id)")
    print(f"Touchpoints: {tp_count} across {tp_accounts} accounts; date range {min_dt}..{max_dt}")
    print(
        "Touchpoints/account: "
        f"min={int(per_acct.min()) if tp_count else 0} "
        f"p50={float(per_acct.quantile(0.5)) if tp_count else 0:.1f} "
        f"p90={float(per_acct.quantile(0.9)) if tp_count else 0:.1f} "
        f"max={int(per_acct.max()) if tp_count else 0}"
    )
    print(f"Accounts with 0 touchpoints: {len(missing_tp_accounts)}")
    if unknown_tp_accounts:
        print(f"Touchpoints with unknown account_id: {len(unknown_tp_accounts)} ({unknown_tp_rows} rows)")
        preview = ", ".join(unknown_tp_accounts[:10])
        if preview:
            print(f"Unknown account_id examples: {preview}")


if __name__ == "__main__":
    main()
