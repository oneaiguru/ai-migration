#!/usr/bin/env python3
"""
Backtest driver & scoreboard (PR-2)

Contract:
- Calls existing forecast CLI via subprocess with an earlier cutoff and provided windows.
- Loads actuals and joins with forecasts (daily/monthly) at district and region levels.
- Computes WAPE, SMAPE, MAE per row; writes scoreboard CSVs and SUMMARY.md.
- No changes to forecast logic or outputs.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import os
import shutil
import subprocess
from datetime import date, datetime
from typing import Dict, List, Tuple


EPS = 1e-9


def parse_date(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()


def ym_to_str(y: int, m: int) -> str:
    return f"{y}-{m:02d}"


def read_actual_daily(path: str) -> Dict[Tuple[str, str], float]:
    by = {}
    with open(path, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for rec in r:
            d = rec.get("date")
            dist = rec.get("district")
            try:
                v = float(rec.get("actual_m3", 0) or 0.0)
            except Exception:
                v = 0.0
            if d and dist:
                by[(d, dist)] = by.get((d, dist), 0.0) + v
    return by


def read_actual_monthly(path: str) -> Dict[Tuple[str, str], float]:
    by = {}
    with open(path, newline="", encoding="utf-8") as f:
        r = csv.DictReader(f)
        for rec in r:
            ym = rec.get("year_month")
            dist = rec.get("district")
            try:
                v = float(rec.get("actual_m3", 0) or 0.0)
            except Exception:
                v = 0.0
            if ym and dist:
                by[(ym, dist)] = by.get((ym, dist), 0.0) + v
    return by


def read_forecast_daily(paths: List[str]) -> Dict[Tuple[str, str], float]:
    by = {}
    for p in paths:
        with open(p, newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                if rec.get("level") != "district":
                    continue
                d = rec.get("date")
                dist = rec.get("district")
                try:
                    v = float(rec.get("forecast_m3", 0) or 0.0)
                except Exception:
                    v = 0.0
                if d and dist:
                    by[(d, dist)] = by.get((d, dist), 0.0) + v
    return by


def read_forecast_monthly(paths: List[str]) -> Dict[Tuple[str, str], float]:
    by = {}
    for p in paths:
        with open(p, newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                if rec.get("level") != "district":
                    continue
                ym = rec.get("year_month")
                dist = rec.get("district")
                try:
                    v = float(rec.get("forecast_m3", 0) or 0.0)
                except Exception:
                    v = 0.0
                if ym and dist:
                    by[(ym, dist)] = by.get((ym, dist), 0.0) + v
    return by


def ensure_dir(p: str) -> None:
    os.makedirs(p, exist_ok=True)


def sha256_of_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


def wape(err_abs_sum: float, actual_abs_sum: float) -> float:
    denom = actual_abs_sum if actual_abs_sum > 0 else EPS
    return err_abs_sum / denom


def smape(actual: float, forecast: float) -> float:
    return (2.0 * abs(actual - forecast)) / (abs(actual) + abs(forecast) + EPS)


def mae(actual: float, forecast: float) -> float:
    return abs(actual - forecast)


def compute_region_series(by_kv: Dict[Tuple[str, str], float]) -> Dict[str, float]:
    agg: Dict[str, float] = {}
    for (key, dist), v in by_kv.items():
        agg[key] = agg.get(key, 0.0) + v
    return agg


def write_scoreboard_daily(outdir: str, actual: Dict[Tuple[str, str], float], forecast: Dict[Tuple[str, str], float]) -> str:
    # district rows: intersection keys
    keys = sorted(set(actual.keys()) & set(forecast.keys()))
    path = os.path.join(outdir, 'scoreboard_daily.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(["level", "district", "date", "actual", "forecast", "wape", "smape", "mae"])
        for (d, dist) in keys:
            a = actual[(d, dist)]
            yhat = forecast[(d, dist)]
            w.writerow(["district", dist, d, f"{a:.6f}", f"{yhat:.6f}", f"{(abs(a - yhat)/(abs(a)+EPS)):.6f}", f"{smape(a,yhat):.6f}", f"{mae(a,yhat):.6f}"])
        # region rows from sums
        a_reg = compute_region_series(actual)
        f_reg = compute_region_series(forecast)
        for d in sorted(set(a_reg.keys()) & set(f_reg.keys())):
            a = a_reg[d]
            yhat = f_reg[d]
            w.writerow(["region", "__region__", d, f"{a:.6f}", f"{yhat:.6f}", f"{(abs(a - yhat)/(abs(a)+EPS)):.6f}", f"{smape(a,yhat):.6f}", f"{mae(a,yhat):.6f}"])
    return path


def write_scoreboard_monthly(outdir: str, actual: Dict[Tuple[str, str], float], forecast: Dict[Tuple[str, str], float]) -> str:
    keys = sorted(set(actual.keys()) & set(forecast.keys()))
    path = os.path.join(outdir, 'scoreboard_monthly.csv')
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(["level", "district", "year_month", "actual", "forecast", "wape", "smape", "mae"])
        for (ym, dist) in keys:
            a = actual[(ym, dist)]
            yhat = forecast[(ym, dist)]
            w.writerow(["district", dist, ym, f"{a:.6f}", f"{yhat:.6f}", f"{(abs(a - yhat)/(abs(a)+EPS)):.6f}", f"{smape(a,yhat):.6f}", f"{mae(a,yhat):.6f}"])
        a_reg = compute_region_series(actual)
        f_reg = compute_region_series(forecast)
        for ym in sorted(set(a_reg.keys()) & set(f_reg.keys())):
            a = a_reg[ym]
            yhat = f_reg[ym]
            w.writerow(["region", "__region__", ym, f"{a:.6f}", f"{yhat:.6f}", f"{(abs(a - yhat)/(abs(a)+EPS)):.6f}", f"{smape(a,yhat):.6f}", f"{mae(a,yhat):.6f}"])
    return path


def summarize(outdir: str, monthly_score_path: str) -> str:
    # Simple summary: compute overall region WAPE and top/bottom districts by avg SMAPE
    region_rows = []
    dist_rows = {}
    with open(monthly_score_path, newline='', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for rec in r:
            if rec["level"] == "region":
                region_rows.append(rec)
            elif rec["level"] == "district":
                dist_rows.setdefault(rec["district"], []).append(rec)
    # overall region WAPE (micro): sum|err| / sum|y|
    err_sum = 0.0
    y_sum = 0.0
    worst_month = None
    worst_wape = -1.0
    for rec in region_rows:
        a = float(rec["actual"]) if rec.get("actual") else 0.0
        yhat = float(rec["forecast"]) if rec.get("forecast") else 0.0
        err_sum += abs(a - yhat)
        y_sum += abs(a)
        cur_wape = (abs(a - yhat) / (abs(a) + EPS)) if abs(a) > 0 else 0.0
        if cur_wape > worst_wape:
            worst_wape = cur_wape
            worst_month = rec.get("year_month", "")
    overall_wape = wape(err_sum, y_sum)

    # district smape averages
    top = []
    for d, rows in dist_rows.items():
        vals = [float(x["smape"]) for x in rows if x.get("smape")]
        avg = sum(vals) / len(vals) if vals else 0.0
        top.append((d, avg))
    top_sorted = sorted(top, key=lambda kv: kv[1])
    top5 = top_sorted[:5]
    bottom5 = list(reversed(top_sorted[-5:]))

    text = [
        "# Backtest Summary",
        "",
        f"Region overall monthly WAPE: {overall_wape:.4f}",
        f"Worst month by region WAPE: {worst_month} ({worst_wape:.4f})",
        "",
        "Top districts (lowest SMAPE):",
    ]
    for d, v in top5:
        text.append(f"- {d}: SMAPE~{v:.4f}")
    text.append("")
    text.append("Bottom districts (highest SMAPE):")
    for d, v in bottom5:
        text.append(f"- {d}: SMAPE~{v:.4f}")
    path = os.path.join(outdir, 'SUMMARY.md')
    with open(path, 'w', encoding='utf-8') as f:
        f.write("\n".join(text) + "\n")
    return path


def run_forecast_cli(args) -> str:
    # Build command to call existing forecast CLI
    cmd = [
        'python', 'scripts/ingest_and_forecast.py', 'forecast',
        '--train-until', args.train_until,
        '--scopes', args.scopes,
        '--methods', args.methods,
        '--daily-csv', args.actual_daily,
        '--monthly-csv', args.actual_monthly,
        '--outdir', args._tmp_forecast_outdir,
    ]
    for w in args.daily_window:
        cmd += ['--daily-window', w]
    for w in args.monthly_window:
        cmd += ['--monthly-window', w]
    env = os.environ.copy()
    env.update({'PYTHONHASHSEED': '0', 'TZ': 'UTC', 'LC_ALL': 'C.UTF-8'})
    res = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if res.returncode != 0:
        raise RuntimeError(res.stderr or res.stdout)
    # Identify latest run dir
    runs = sorted([p for p in os.listdir(args._tmp_forecast_outdir) if p.startswith('phase1_run_')])
    if not runs:
        raise RuntimeError("No forecast run directory produced")
    return os.path.join(args._tmp_forecast_outdir, runs[-1])


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description='Backtest evaluation (calls forecast CLI)')
    p.add_argument('--train-until', required=True)
    p.add_argument('--daily-window', action='append', default=[])
    p.add_argument('--monthly-window', action='append', default=[])
    p.add_argument('--scopes', default='region,districts')
    p.add_argument('--methods', default='daily=weekday_mean,monthly=last3m_mean')
    p.add_argument('--actual-daily', required=True)
    p.add_argument('--actual-monthly', required=True)
    p.add_argument('--outdir', required=True)
    return p.parse_args()


def main():
    args = parse_args()

    # Prepare dirs
    outdir = args.outdir
    ensure_dir(outdir)
    tmp_fore_out = os.path.join(outdir, '_forecast_tmp')
    # Clean tmp forecast dir
    if os.path.isdir(tmp_fore_out):
        shutil.rmtree(tmp_fore_out)
    ensure_dir(tmp_fore_out)
    setattr(args, '_tmp_forecast_outdir', tmp_fore_out)

    # 1) Call forecast CLI to generate predictions
    run_dir = run_forecast_cli(args)
    fore_dir = os.path.join(run_dir, 'forecasts')
    daily_files = sorted([os.path.join(fore_dir, x) for x in os.listdir(fore_dir) if x.startswith('daily_') and x.endswith('.csv')])
    monthly_files = sorted([os.path.join(fore_dir, x) for x in os.listdir(fore_dir) if x.startswith('monthly_') and x.endswith('.csv')])

    # 2) Load actuals and forecasts
    a_daily = read_actual_daily(args.actual_daily)
    a_monthly = read_actual_monthly(args.actual_monthly)
    f_daily = read_forecast_daily(daily_files)
    f_monthly = read_forecast_monthly(monthly_files)

    # 3) Write scoreboards
    write_scoreboard_daily(outdir, a_daily, f_daily)
    monthly_path = write_scoreboard_monthly(outdir, a_monthly, f_monthly)

    # 4) Write summary
    summarize(outdir, monthly_path)

    print('Backtest written to', outdir)


if __name__ == '__main__':
    main()
