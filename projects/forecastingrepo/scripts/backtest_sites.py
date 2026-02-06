#!/usr/bin/env python3
"""
Site-level backtests (S6): join site forecasts with service-based actuals

Scope and guardrails:
- No changes to forecast logic or default outputs; this is an evaluation helper.
- Reads site service history and (optionally) an existing sites forecast CSV
  produced by the pipeline (daily_fill_*.csv).
- Computes daily and monthly scoreboards at the site level with WAPE/SMAPE/MAE.
- Deterministic: sets PYTHONHASHSEED/TZ/LC_ALL when invoking subprocess.

CLI (minimal):
- --train-until YYYY-MM-DD
- --daily-window YYYY-MM-DD:YYYY-MM-DD   (repeatable)
- --monthly-window YYYY-MM:YYYY-MM       (repeatable)
- --sites-registry PATH                  (CSV; used for potential future QA)
- --sites-service PATH                   (CSV; site_id,service_dt,collect_volume_m3)
- --outdir PATH                          (reports/site_backtest_<cutoff>)
- --use-existing-sites-csv PATH          (optional; daily_fill_*.csv)

Outputs:
- scoreboard_site_daily.csv   (site_id,date,actual,forecast,wape,smape,mae)
- scoreboard_site_monthly.csv (site_id,year_month,actual,forecast,wape,smape,mae)
- SUMMARY.md                  (simple quantiles and counts)

Note: If --use-existing-sites-csv is not provided, this script can be extended
to call the main forecast CLI with sites flag enabled. To keep scope limited
and avoid behavior changes, we rely on an existing sites forecast CSV when used
in tests.
"""
from __future__ import annotations

import argparse
import csv
import os
from collections import defaultdict
from datetime import datetime
from typing import Dict, Iterable, Tuple


EPS = 1e-9


def ensure_dir(p: str) -> None:
    os.makedirs(p, exist_ok=True)


def ym_of(date_str: str) -> str:
    dt = datetime.strptime(date_str, "%Y-%m-%d").date()
    return f"{dt.year}-{dt.month:02d}"


def wape_num_denom(pairs: Iterable[Tuple[float, float]]) -> Tuple[float, float]:
    err_sum = 0.0
    y_sum = 0.0
    for a, yhat in pairs:
        err_sum += abs(a - yhat)
        y_sum += abs(a)
    return err_sum, y_sum


def smape(a: float, yhat: float) -> float:
    return (2.0 * abs(a - yhat)) / (abs(a) + abs(yhat) + EPS)


def mae(a: float, yhat: float) -> float:
    return abs(a - yhat)


def compute_site_aggregate_wapes(monthly_path: str) -> tuple[float, dict[str, float]]:
    """Compute overall WAPE and per-site WAPE aggregates from monthly scoreboard."""
    site_errors: dict[str, float] = defaultdict(float)
    site_actuals: dict[str, float] = defaultdict(float)
    total_error = 0.0
    total_actual = 0.0
    with open(monthly_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for rec in reader:
            sid = (rec.get("site_id") or "").strip()
            if not sid:
                continue
            try:
                actual = float(rec.get("actual") or 0.0)
                forecast = float(rec.get("forecast") or 0.0)
            except Exception:
                actual = 0.0
                forecast = 0.0
            error = abs(actual - forecast)
            site_errors[sid] += error
            site_actuals[sid] += abs(actual)
            total_error += error
            total_actual += abs(actual)
    overall = total_error / (total_actual if total_actual > 0 else EPS)
    per_site_wape: dict[str, float] = {}
    for sid, err_sum in site_errors.items():
        denom = site_actuals.get(sid, 0.0)
        per_site_wape[sid] = err_sum / (denom if denom > 0 else EPS)
    return overall, per_site_wape


def read_sites_service(path: str) -> Dict[Tuple[str, str], float]:
    """Return {(site_id,date): collect_volume_m3} for service events.
    If multiple rows exist per site/date, they are summed.
    Expected columns: site_id, service_dt, collect_volume_m3.
    """
    by = defaultdict(float)
    with open(path, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for rec in r:
            sid = (rec.get("site_id") or "").strip()
            d = (rec.get("service_dt") or rec.get("date") or "").strip()
            if not sid or not d:
                continue
            try:
                v = float(rec.get("collect_volume_m3") or 0.0)
            except Exception:
                v = 0.0
            by[(sid, d)] += v
    return dict(by)


def read_sites_forecast_daily(path: str) -> Dict[Tuple[str, str], float]:
    """Return {(site_id,date): pred_volume_m3} from daily_fill CSV.
    Expected columns: site_id,date,pred_volume_m3 (fill_pct,overflow_prob present).
    """
    by = {}
    with open(path, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for rec in r:
            sid = (rec.get("site_id") or "").strip()
            d = (rec.get("date") or "").strip()
            if not sid or not d:
                continue
            try:
                yhat = float(rec.get("pred_volume_m3") or 0.0)
            except Exception:
                yhat = 0.0
            by[(sid, d)] = by.get((sid, d), 0.0) + yhat
    return by


def write_scoreboard_daily(outdir: str,
                           actual: Dict[Tuple[str, str], float],
                           forecast: Dict[Tuple[str, str], float]) -> str:
    keys = sorted(set(actual.keys()) & set(forecast.keys()))
    path = os.path.join(outdir, "scoreboard_site_daily.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id", "date", "actual", "forecast", "wape", "smape", "mae"])
        for (sid, d) in keys:
            a = float(actual[(sid, d)])
            yhat = float(forecast[(sid, d)])
            w.writerow([
                sid,
                d,
                f"{a:.6f}",
                f"{yhat:.6f}",
                f"{(abs(a - yhat) / (abs(a) + EPS)):.6f}",
                f"{smape(a, yhat):.6f}",
                f"{mae(a, yhat):.6f}",
            ])
    return path


def write_scoreboard_monthly(outdir: str,
                             actual: Dict[Tuple[str, str], float],
                             forecast: Dict[Tuple[str, str], float]) -> str:
    # Aggregate by (site_id, year_month)
    a_by = defaultdict(float)
    for (sid, d), v in actual.items():
        a_by[(sid, ym_of(d))] += v
    f_by = defaultdict(float)
    for (sid, d), v in forecast.items():
        f_by[(sid, ym_of(d))] += v
    keys = sorted(set(a_by.keys()) & set(f_by.keys()))
    path = os.path.join(outdir, "scoreboard_site_monthly.csv")
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id", "year_month", "actual", "forecast", "wape", "smape", "mae"])
        for (sid, ym) in keys:
            a = float(a_by[(sid, ym)])
            yhat = float(f_by[(sid, ym)])
            w.writerow([
                sid,
                ym,
                f"{a:.6f}",
                f"{yhat:.6f}",
                f"{(abs(a - yhat) / (abs(a) + EPS)):.6f}",
                f"{smape(a, yhat):.6f}",
                f"{mae(a, yhat):.6f}",
            ])
    return path


def write_summary(outdir: str, monthly_path: str) -> str:
    """Write SUMMARY.md with aggregate site-level WAPE and distribution stats."""
    overall_wape, site_wapes = compute_site_aggregate_wapes(monthly_path)
    row_wapes: list[float] = []
    with open(monthly_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for rec in reader:
            try:
                row_wapes.append(float(rec.get("wape") or 0.0))
            except Exception:
                continue
    if not row_wapes:
        row_wapes = [0.0]
    row_wapes.sort()
    site_values = sorted(site_wapes.values())

    def quantile(values: list[float], p: float) -> float:
        if not values:
            return 0.0
        if p <= 0:
            return values[0]
        if p >= 1:
            return values[-1]
        idx = int(p * (len(values) - 1))
        return values[idx]

    summary_lines = [
        "# Site Backtest Summary",
        "",
        "## Aggregate WAPE (Micro-Averaged)",
        f"**Overall site-level WAPE: {overall_wape:.4f} ({overall_wape * 100:.2f}%)**",
        f"Sites evaluated: {len(site_wapes)}",
        f"Monthly observations: {len(row_wapes)}",
        "",
        "## Per-Site WAPE Distribution",
        f"Median per-site WAPE: {quantile(site_values, 0.5):.4f}",
        f"P75 per-site WAPE: {quantile(site_values, 0.75):.4f}",
        f"P90 per-site WAPE: {quantile(site_values, 0.90):.4f}",
        "",
        "## Row-Level Error Statistics",
        f"Median row-level WAPE: {quantile(row_wapes, 0.5):.4f}",
        f"P75 row-level WAPE: {quantile(row_wapes, 0.75):.4f}",
    ]

    ranked_sites = sorted(site_wapes.items(), key=lambda item: item[1])
    if ranked_sites:
        summary_lines.append("")
        summary_lines.append("## Best Sites (Lowest WAPE)")
        for sid, val in ranked_sites[:5]:
            summary_lines.append(f"- {sid}: {val:.4f} ({val * 100:.2f}%)")
        summary_lines.append("")
        summary_lines.append("## Worst Sites (Highest WAPE)")
        for sid, val in reversed(ranked_sites[-5:]):
            summary_lines.append(f"- {sid}: {val:.4f} ({val * 100:.2f}%)")

    path = os.path.join(outdir, "SUMMARY.md")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(summary_lines) + "\n")
    return path


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Site-level backtest (evaluation only)")
    p.add_argument("--train-until", required=True)
    p.add_argument("--daily-window", action="append", default=[])
    p.add_argument("--monthly-window", action="append", default=[])
    p.add_argument("--sites-registry", required=True)
    p.add_argument("--sites-service", required=True)
    p.add_argument("--outdir", required=True)
    p.add_argument("--use-existing-sites-csv", default=None, help="Path to daily_fill_*.csv")
    return p.parse_args()


def main():
    args = parse_args()
    ensure_dir(args.outdir)

    if not args.use_existing_sites_csv:
        raise SystemExit("--use-existing-sites-csv is required in this version to avoid calling forecast pipeline")

    actual = read_sites_service(args.sites_service)
    forecast = read_sites_forecast_daily(args.use_existing_sites_csv)

    write_scoreboard_daily(args.outdir, actual, forecast)
    monthly_path = write_scoreboard_monthly(args.outdir, actual, forecast)
    write_summary(args.outdir, monthly_path)

    print("Site backtest written to", args.outdir)


if __name__ == "__main__":
    main()
