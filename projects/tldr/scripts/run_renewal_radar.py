#!/usr/bin/env python3
"""
Run Renewal Radar on real input CSVs and write forecast outputs.

Example:
  python3 scripts/run_renewal_radar.py \
    --accounts data/real/accounts.csv \
    --touchpoints data/real/touchpoints.csv \
    --cutoff auto \
    --horizon 30 \
    --out-dir reports
"""

from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path
import sys
from typing import Optional

import pandas as pd

# Allow running as a script without installing the package.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.account_health import ChurnForecastRequest, generate_churn_forecast


def _parse_date(s: str) -> date:
    try:
        return date.fromisoformat(s)
    except ValueError as e:
        raise SystemExit(f"Invalid date '{s}'. Expected YYYY-MM-DD.") from e


def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Run Renewal Radar on real CSV inputs")
    p.add_argument("--accounts", required=True, help="accounts.csv")
    p.add_argument("--touchpoints", required=True, help="touchpoints.csv")
    p.add_argument(
        "--cutoff",
        default="auto",
        help="Last known touchpoint date (YYYY-MM-DD) or 'auto' to use max(touchpoint_dt)",
    )
    p.add_argument("--horizon", type=int, default=30, help="Forecast horizon in days")
    p.add_argument("--window-days", type=int, default=90, help="History window for baseline learning")
    p.add_argument("--min-obs", type=int, default=2, help="Min observations/weekday before smoothing")
    p.add_argument("--decay-rate", type=float, default=0.02, help="Daily decay rate (0.02 = 2%%/day)")
    p.add_argument("--churn-threshold", type=float, default=0.5, help="Engagement threshold for risk center")
    p.add_argument("--risk-threshold", type=float, default=0.5, help="churn_prob >= this => at-risk")
    p.add_argument("--out-dir", default="reports", help="Output directory")
    p.add_argument(
        "--open",
        action="store_true",
        help="On macOS, open the at-risk CSV after writing outputs",
    )
    return p.parse_args()


def _try_open(path: Path) -> None:
    # Best-effort; avoids hard dependency on macOS in shared environments.
    try:
        import subprocess  # noqa: S404 - local, user-initiated

        subprocess.run(["open", str(path)], check=False)
    except Exception:
        return


def _auto_cutoff(touchpoints_df: pd.DataFrame) -> Optional[date]:
    if touchpoints_df.empty or "touchpoint_dt" not in touchpoints_df.columns:
        return None
    max_dt = touchpoints_df["touchpoint_dt"].max()
    return max_dt if isinstance(max_dt, date) else None


def _write_summary_md(
    out_path: Path,
    *,
    result_account_count: int,
    start_date: date,
    end_date: date,
    touchpoint_min: Optional[date],
    touchpoint_max: Optional[date],
    summary_df: pd.DataFrame,
    at_risk_df: pd.DataFrame,
    watchlist_df: pd.DataFrame,
    risk_threshold: float,
) -> None:
    # Avoid failing the run if optional columns are missing.
    has_company = "company" in summary_df.columns
    has_arr = "arr" in summary_df.columns
    has_renewal = "renewal_date" in summary_df.columns

    def _name(row: pd.Series) -> str:
        if has_company and isinstance(row.get("company"), str) and row.get("company"):
            return row["company"]
        return str(row.get("account_id", ""))

    # Risk buckets based on end-of-horizon churn_prob.
    buckets = pd.cut(
        summary_df["churn_prob_end"],
        bins=[0.0, 0.3, 0.5, 0.7, 1.0],
        labels=["Healthy (<30%)", "At Risk (30-50%)", "High Risk (50-70%)", "Critical (70%+)"],
        include_lowest=True,
    )
    bucket_counts = buckets.value_counts().to_dict()

    arr_at_risk = float(at_risk_df["arr"].fillna(0).sum()) if has_arr and not at_risk_df.empty else 0.0

    lines: list[str] = []
    lines.append("# Renewal Radar: Forecast Summary")
    lines.append("")
    lines.append(f"- Forecast window: {start_date.isoformat()} to {end_date.isoformat()} ({result_account_count} accounts)")
    if touchpoint_min and touchpoint_max:
        lines.append(f"- Touchpoints observed: {touchpoint_min.isoformat()} to {touchpoint_max.isoformat()}")
    lines.append(f"- At-risk threshold: churn_prob_end >= {risk_threshold:.2f}")
    lines.append("")
    lines.append("## Headline")
    lines.append("")
    lines.append(f"- At-risk accounts: {int(at_risk_df['account_id'].nunique())}")
    if has_arr:
        lines.append(f"- ARR at risk: {arr_at_risk:,.0f}")
    if not watchlist_df.empty:
        lines.append(f"- Watchlist (risk spike in-horizon): {int(watchlist_df['account_id'].nunique())}")
    lines.append("")
    lines.append("## Risk Breakdown (End of Horizon)")
    lines.append("")
    for label in ["Healthy (<30%)", "At Risk (30-50%)", "High Risk (50-70%)", "Critical (70%+)"]:
        lines.append(f"- {label}: {int(bucket_counts.get(label, 0))}")
    lines.append("")
    lines.append("## Top At-Risk Accounts")
    lines.append("")
    top = at_risk_df.head(15)
    if top.empty:
        lines.append("_No accounts exceeded the at-risk threshold._")
    else:
        lines.append("| Account | churn_prob_end | churn_prob_max | ARR | Renewal | First at-risk |")
        lines.append("|---|---:|---:|---:|---|---|")
        for _, r in top.iterrows():
            arr = f"{float(r.get('arr', 0.0)):,.0f}" if has_arr else ""
            renewal = str(r.get("renewal_date", "")) if has_renewal else ""
            first = str(r.get("first_at_risk_date", "")) if "first_at_risk_date" in r.index else ""
            lines.append(
                f"| {_name(r)} | {float(r['churn_prob_end']):.3f} | {float(r.get('max_churn_prob', 0.0)):.3f} | {arr} | {renewal} | {first} |"
            )
    lines.append("")
    if not watchlist_df.empty:
        lines.append("## Watchlist (Spiked During Horizon)")
        lines.append("")
        wl = watchlist_df.head(15)
        lines.append("| Account | churn_prob_end | churn_prob_max | ARR | Renewal | First at-risk |")
        lines.append("|---|---:|---:|---:|---|---|")
        for _, r in wl.iterrows():
            arr = f"{float(r.get('arr', 0.0)):,.0f}" if has_arr else ""
            renewal = str(r.get("renewal_date", "")) if has_renewal else ""
            first = str(r.get("first_at_risk_date", "")) if "first_at_risk_date" in r.index else ""
            lines.append(
                f"| {_name(r)} | {float(r['churn_prob_end']):.3f} | {float(r.get('max_churn_prob', 0.0)):.3f} | {arr} | {renewal} | {first} |"
            )
        lines.append("")

    lines.append("## Next Actions")
    lines.append("")
    lines.append("- Review the at-risk list with CSMs; prioritize by ARR and renewal date.")
    lines.append("- If too many/few accounts are flagged, adjust weights (event_type -> interaction_value) or tune decay rate.")
    lines.append("- Use the watchlist to catch accounts that dipped but recovered by end-of-horizon.")
    lines.append("")

    out_path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    args = _parse_args()
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    accounts_df = pd.read_csv(args.accounts, dtype={"account_id": str})
    touchpoints_df = pd.read_csv(args.touchpoints, dtype={"account_id": str})

    # Basic normalization
    touchpoints_df["touchpoint_dt"] = pd.to_datetime(touchpoints_df["touchpoint_dt"], errors="coerce").dt.date
    touchpoints_df["interaction_value"] = pd.to_numeric(touchpoints_df["interaction_value"], errors="coerce")
    touchpoints_df = touchpoints_df.dropna(subset=["touchpoint_dt", "interaction_value"])

    cutoff = (
        _auto_cutoff(touchpoints_df)
        if str(args.cutoff).strip().lower() in {"auto", ""}
        else _parse_date(args.cutoff)
    )
    if cutoff is None:
        raise SystemExit("Unable to determine cutoff date. Provide --cutoff YYYY-MM-DD or ensure touchpoints have dates.")

    request = ChurnForecastRequest(cutoff_date=cutoff, horizon_days=int(args.horizon))
    result = generate_churn_forecast(
        request=request,
        touchpoint_df=touchpoints_df,
        registry_df=accounts_df,
        window_days=int(args.window_days),
        min_obs=int(args.min_obs),
        decay_rate_per_day=float(args.decay_rate),
        churn_threshold=float(args.churn_threshold),
    )

    forecast_df = result.forecast_df
    forecast_out = out_dir / f"renewal_radar_forecast_{cutoff.isoformat()}.csv"
    forecast_df.to_csv(forecast_out, index=False)

    # Per-account summary for actionability (one row per account).
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
    at_risk_points = forecast_df[forecast_df["churn_prob"] >= float(args.risk_threshold)]
    first_at_risk = (
        at_risk_points.groupby("account_id", as_index=False)["date"]
        .min()
        .rename(columns={"date": "first_at_risk_date"})
    )

    summary = agg.merge(end_day, on="account_id", how="left").merge(first_at_risk, on="account_id", how="left")
    # Enrich with account metadata if present
    enrich_cols = [c for c in ["account_id", "company", "tier", "arr", "renewal_date"] if c in accounts_df.columns]
    if enrich_cols:
        summary = summary.merge(accounts_df[enrich_cols].drop_duplicates("account_id"), on="account_id", how="left")

    summary_out = out_dir / f"renewal_radar_account_summary_{cutoff.isoformat()}.csv"
    summary.to_csv(summary_out, index=False)

    risk_threshold = float(args.risk_threshold)
    at_risk_accounts = summary[summary["churn_prob_end"] >= risk_threshold].copy()
    watchlist = summary[
        (summary["max_churn_prob"] >= risk_threshold) & (summary["churn_prob_end"] < risk_threshold)
    ].copy()

    sort_cols = ["churn_prob_end"]
    ascending = [False]
    if "arr" in at_risk_accounts.columns:
        sort_cols.append("arr")
        ascending.append(False)
    at_risk_accounts = at_risk_accounts.sort_values(sort_cols, ascending=ascending)

    at_risk_out = out_dir / f"renewal_radar_at_risk_{cutoff.isoformat()}.csv"
    at_risk_accounts.to_csv(at_risk_out, index=False)

    watchlist_out = out_dir / f"renewal_radar_watchlist_{cutoff.isoformat()}.csv"
    if not watchlist.empty:
        watchlist = watchlist.sort_values(["max_churn_prob"], ascending=[False])
        watchlist.to_csv(watchlist_out, index=False)

    summary_md_out = out_dir / f"renewal_radar_summary_{cutoff.isoformat()}.md"
    touchpoint_min = touchpoints_df["touchpoint_dt"].min() if not touchpoints_df.empty else None
    touchpoint_max = touchpoints_df["touchpoint_dt"].max() if not touchpoints_df.empty else None
    _write_summary_md(
        summary_md_out,
        result_account_count=int(result.account_count),
        start_date=result.start_date,
        end_date=result.end_date,
        touchpoint_min=touchpoint_min,
        touchpoint_max=touchpoint_max,
        summary_df=summary,
        at_risk_df=at_risk_accounts,
        watchlist_df=watchlist,
        risk_threshold=risk_threshold,
    )

    arr_at_risk = (
        float(at_risk_accounts["arr"].fillna(0).sum()) if "arr" in at_risk_accounts.columns else 0.0
    )

    print(f"Forecast: {forecast_out} ({result.account_count} accounts; {result.start_date}..{result.end_date})")
    print(f"Summary:  {summary_out} (one row per account)")
    print(f"Brief:    {summary_md_out}")
    print(
        f"At-risk:  {at_risk_out} ({at_risk_accounts['account_id'].nunique()} accounts; "
        f"ARR at risk={arr_at_risk:,.0f})"
    )
    if not watchlist.empty:
        print(f"Watchlist: {watchlist_out} ({watchlist['account_id'].nunique()} accounts; risk spike in-horizon)")

    if args.open:
        _try_open(at_risk_out)
        _try_open(summary_md_out)


if __name__ == "__main__":
    main()
