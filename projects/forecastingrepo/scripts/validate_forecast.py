#!/usr/bin/env python3
"""
Blind Forecast Validation Script

TASK-29: Script for Jury to validate forecasts without disclosing actual values.

Usage:
    python validate_forecast.py <forecast.csv> <actuals.csv> <output.csv>

This script:
1. Reads our predicted forecasts
2. Merges with Jury's actual data
3. Computes accuracy metrics using forecast deltas between service events
4. Returns ONLY metrics (no actual values disclosed)

Result can be shared safely - contains no individual actual values.
"""
import argparse
import csv
from datetime import date
import pandas as pd
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from src.sites.wide_report import read_wide_report, parse_period_from_filename

HEADER_SITE = "Код КП"


def _detect_format(path: Path) -> str:
    with path.open("r", encoding="utf-8") as fh:
        reader = csv.reader(fh, delimiter=";")
        for row in reader:
            if not row or not any(cell.strip() for cell in row):
                continue
            first = row[0].strip().lstrip("\ufeff").strip('"')
            if first == HEADER_SITE:
                return "wide"
    return "long"


def _load_long(path: Path, value_col: str) -> pd.DataFrame:
    df = pd.read_csv(path, dtype={"site_id": "string"}, parse_dates=["date"])
    if value_col not in df.columns:
        if value_col == "forecast_m3" and "pred_m3" in df.columns:
            df = df.rename(columns={"pred_m3": value_col})
        else:
            raise ValueError(f"CSV must have '{value_col}' column")
    if "site_id" in df.columns:
        df["site_id"] = df["site_id"].astype("string")
    df["date"] = pd.to_datetime(df["date"])
    return df


def _load_wide(path: Path, start: str | None, end: str | None, value_col: str) -> pd.DataFrame:
    s = date.fromisoformat(start) if start else None
    e = date.fromisoformat(end) if end else None
    df = read_wide_report(path, s, e, value_col)
    if "site_id" in df.columns:
        df["site_id"] = df["site_id"].astype("string")
    df["date"] = pd.to_datetime(df["date"])
    return df


def validate_forecast(
    forecast_path: Path,
    actuals_path: Path,
    output_path: Path,
    fmt_forecast: str,
    fmt_actuals: str,
    start: str | None,
    end: str | None,
    forecast_series: str,
) -> None:
    """
    Validate forecast against actual data. Output only metrics.

    Args:
        forecast_path: Path to forecast CSV (site_id, date, pred_m3)
        actuals_path: Path to actuals CSV (site_id, date, actual_m3)
        output_path: Path to write metrics CSV (safe to share)
    """
    print(f"Loading forecast from {forecast_path}...")
    if fmt_forecast == "auto":
        fmt_forecast = _detect_format(forecast_path)
    if fmt_forecast == "wide":
        forecast = _load_wide(forecast_path, start, end, "forecast_m3")
    else:
        forecast = _load_long(forecast_path, "forecast_m3")

    print(f"Loading actuals from {actuals_path}...")
    if fmt_actuals == "auto":
        fmt_actuals = _detect_format(actuals_path)
    if fmt_actuals == "wide":
        actuals = _load_wide(actuals_path, start, end, "actual_m3")
    else:
        actuals = _load_long(actuals_path, "actual_m3")

    # Merge on site_id + date (service event dates)
    print("Merging data...")
    merged = forecast.merge(
        actuals[['site_id', 'date', 'actual_m3']],
        on=['site_id', 'date'],
        how='inner',
    )

    if len(merged) == 0:
        print("ERROR: No matching records between forecast and actuals!")
        sys.exit(1)

    def _infer_forecast_series(df: pd.DataFrame) -> str:
        diffs = df.groupby("site_id")["forecast_m3"].diff().dropna()
        if diffs.empty:
            return "cumulative"
        negative_share = float((diffs < -1e-9).mean())
        return "cumulative" if negative_share < 0.01 else "daily"

    # Compute metrics using per-event deltas (or daily values when provided)
    print("Computing metrics...")
    merged = merged.sort_values(['site_id', 'date'])
    if forecast_series == "auto":
        forecast_series = _infer_forecast_series(merged)
        print(f"[INFO] Detected forecast series: {forecast_series}")
    if forecast_series == "daily":
        merged["forecast_delta_m3"] = merged["forecast_m3"]
    elif forecast_series == "cumulative":
        merged['forecast_delta_m3'] = merged.groupby('site_id')['forecast_m3'].diff()
        merged['forecast_delta_m3'] = merged['forecast_delta_m3'].fillna(merged['forecast_m3'])
    else:
        raise ValueError("forecast_series must be one of: cumulative, daily, auto")

    # Overall WAPE
    merged['error_abs'] = abs(merged['forecast_delta_m3'] - merged['actual_m3'])
    total_forecast = merged['forecast_delta_m3'].sum()
    total_actual = merged['actual_m3'].sum()
    total_error = merged['error_abs'].sum()
    overall_wape = total_error / total_actual if total_actual > 0 else 0.0

    # Per-row errors
    merged['error_pct'] = (
        abs(merged['forecast_delta_m3'] - merged['actual_m3'])
        / merged['actual_m3'].clip(lower=0.01)
        * 100
    )

    # Distribution
    within_10 = (merged['error_pct'] <= 10).mean() * 100
    within_20 = (merged['error_pct'] <= 20).mean() * 100
    within_50 = (merged['error_pct'] <= 50).mean() * 100

    # Per-site WAPE
    site_metrics = merged.groupby('site_id').agg({
        'forecast_delta_m3': 'sum',
        'actual_m3': 'sum',
    }).reset_index()
    site_metrics['site_wape'] = (
        abs(site_metrics['forecast_delta_m3'] - site_metrics['actual_m3'])
        / site_metrics['actual_m3'].clip(lower=0.01)
    )

    worst_sites = site_metrics.nlargest(10, 'site_wape')['site_id'].tolist()
    best_sites = site_metrics.nsmallest(10, 'site_wape')['site_id'].tolist()

    # Summary (safe to share!)
    summary = {
        'date_generated': pd.Timestamp.now().isoformat(),
        'overall_wape': round(overall_wape, 4),
        'total_forecast_m3': round(total_forecast, 2),
        'total_actual_m3': round(total_actual, 2),
        'records_evaluated': len(merged),
        'sites_evaluated': merged['site_id'].nunique(),
        'days_evaluated': merged['date'].nunique(),
        'error_mean_pct': round(merged['error_pct'].mean(), 2),
        'error_median_pct': round(merged['error_pct'].median(), 2),
        'error_std_pct': round(merged['error_pct'].std(), 2),
        'within_10_pct': round(within_10, 1),
        'within_20_pct': round(within_20, 1),
        'within_50_pct': round(within_50, 1),
        'worst_sites': '|'.join(str(s) for s in worst_sites),
        'best_sites': '|'.join(str(s) for s in best_sites),
    }

    # Ensure output directory exists
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write summary (no actual values!)
    print(f"Writing metrics to {output_path}...")
    pd.DataFrame([summary]).to_csv(output_path, index=False)

    # Also write per-site WAPE (IDs + error only)
    per_site_path = output_path.with_name(
        output_path.stem + '_per_site.csv'
    )
    site_metrics[['site_id', 'site_wape']].to_csv(per_site_path, index=False)

    # Print summary
    print("\n=== VALIDATION SUMMARY ===")
    print(f"Overall WAPE: {overall_wape:.2%}")
    print(f"Total Forecast: {total_forecast:,.0f} m3")
    print(f"Total Actual: {total_actual:,.0f} m3")
    print(f"Total Error: {total_error:,.0f} m3")
    print(f"\nError Distribution:")
    print(f"  Within 10%: {within_10:.1f}%")
    print(f"  Within 20%: {within_20:.1f}%")
    print(f"  Within 50%: {within_50:.1f}%")
    print(f"\nRecords: {len(merged)} (from {merged['site_id'].nunique()} sites, {merged['date'].nunique()} days)")
    print(f"\nWorst 5 sites: {worst_sites[:5]}")
    print(f"Best 5 sites: {best_sites[:5]}")
    print(f"\nMetrics saved to {output_path}")
    print(f"Per-site details saved to {per_site_path}")


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument("forecast_csv")
    p.add_argument("actuals_csv")
    p.add_argument("output_csv")
    p.add_argument("--forecast-format", choices=["auto", "long", "wide"], default="auto")
    p.add_argument("--actuals-format", choices=["auto", "long", "wide"], default="auto")
    p.add_argument("--start")
    p.add_argument("--end")
    p.add_argument(
        "--forecast-series",
        choices=["cumulative", "daily", "auto"],
        default="cumulative",
        help=(
            "How to interpret forecast values: cumulative (default, will be diff'ed per site), "
            "daily (use as-is), or auto (try to detect by monotonicity)."
        ),
    )
    args = p.parse_args()

    validate_forecast(
        forecast_path=Path(args.forecast_csv),
        actuals_path=Path(args.actuals_csv),
        output_path=Path(args.output_csv),
        fmt_forecast=args.forecast_format,
        fmt_actuals=args.actuals_format,
        start=args.start,
        end=args.end,
        forecast_series=args.forecast_series,
    )
