#!/usr/bin/env python3
"""
Post-process site backtest outputs to produce accuracy summaries.

Given a scored `scoreboard_site_monthly.csv`, this script computes:
- site_accuracy_summary.csv (per-site actual/forecast/WAPE/accuracy%)
- site_wape_distribution.csv (bucketed WAPE distribution)
- district_accuracy_summary.csv (weighted accuracy per district)

The registry CSV is used to map site -> district.
"""
from __future__ import annotations

import argparse
import csv
from collections import Counter
from pathlib import Path

import pandas as pd


BUCKETS = [
    (0.0, 0.08, "<=8%"),
    (0.08, 0.12, "8%-12%"),
    (0.12, 0.20, "12%-20%"),
    (0.20, 0.30, "20%-30%"),
    (0.30, 0.50, "30%-50%"),
    (0.50, 1.0, "50%-100%"),
    (1.0, float("inf"), ">100%"),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate accuracy summaries from site backtest scoreboards.")
    parser.add_argument("--scoreboard-monthly", required=True, help="Path to scoreboard_site_monthly.csv")
    parser.add_argument("--registry", required=True, help="Path to sites_registry.csv")
    parser.add_argument("--outdir", required=True, help="Output directory for summary files")
    return parser.parse_args()


def bucketize_wape(wape: float) -> str:
    for low, high, label in BUCKETS:
        if low <= wape <= high:
            return label
    return BUCKETS[-1][2]


def main() -> None:
    args = parse_args()
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    monthly = pd.read_csv(args.scoreboard_monthly)
    monthly["site_id"] = monthly["site_id"].astype(str)
    monthly["actual"] = monthly["actual"].astype(float)
    monthly["forecast"] = monthly["forecast"].astype(float)
    monthly["wape"] = monthly["wape"].astype(float)
    monthly["accuracy_pct"] = (1.0 - monthly["wape"]) * 100.0
    monthly["abs_error"] = (monthly["actual"] - monthly["forecast"]).abs()

    site_summary_path = outdir / "site_accuracy_summary.csv"
    monthly[["site_id", "year_month", "actual", "forecast", "wape", "accuracy_pct", "abs_error"]].to_csv(
        site_summary_path, index=False
    )

    # Distribution
    counter = Counter()
    for wape in monthly["wape"]:
        counter[bucketize_wape(wape)] += 1
    total_sites = len(monthly)
    dist_rows = []
    for _, _, label in BUCKETS:
        count = counter.get(label, 0)
        pct = (count / total_sites * 100.0) if total_sites else 0.0
        dist_rows.append((label, count, pct))
    dist_path = outdir / "site_wape_distribution.csv"
    with dist_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["wape_bucket", "site_count", "percent"])
        writer.writerows(dist_rows)

    # District accuracy
    registry = pd.read_csv(args.registry, usecols=["site_id", "district"])
    registry["site_id"] = registry["site_id"].astype(str)
    merged = monthly.merge(registry, on="site_id", how="left")
    merged["district"] = merged["district"].fillna("__unmapped__")

    agg = merged.groupby("district").agg(
        total_actual=pd.NamedAgg(column="actual", aggfunc="sum"),
        total_forecast=pd.NamedAgg(column="forecast", aggfunc="sum"),
        weighted_abs_error=pd.NamedAgg(column="abs_error", aggfunc="sum"),
        median_wape=pd.NamedAgg(column="wape", aggfunc="median"),
        p25_wape=pd.NamedAgg(column="wape", aggfunc=lambda x: x.quantile(0.25)),
        p75_wape=pd.NamedAgg(column="wape", aggfunc=lambda x: x.quantile(0.75)),
        site_count=pd.NamedAgg(column="site_id", aggfunc="nunique"),
    ).reset_index()
    agg["weighted_wape"] = agg["weighted_abs_error"] / agg["total_actual"].where(agg["total_actual"] != 0, 1.0)
    agg["accuracy_pct"] = (1.0 - agg["weighted_wape"]) * 100.0
    agg_path = outdir / "district_accuracy_summary.csv"
    agg.to_csv(agg_path, index=False)

    print(f"[OK] Wrote summaries to {outdir}")


if __name__ == "__main__":
    main()
