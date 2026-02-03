#!/usr/bin/env python3
"""
Quicklook report helpers (minimal, headless-safe).

Functions used by tests:
- ensure_dir(outdir)
- read_actual_daily(path)
- read_actual_monthly(path)
- read_forecast_daily(paths)
- read_forecast_monthly(paths) -> (by_month_region, by_month_district)
- save_region_monthly_chart(outdir, by_month_actual, by_month_region_forecast)
- save_top5_districts_chart(outdir, by_month_actual, by_month_district_forecast, topk=5)

This module does not change pipeline behavior; it is used for visualization/unit tests only.
"""
from __future__ import annotations

import csv
import os
from typing import Dict, List, Tuple

# Force headless backend for CI stability
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402


def ensure_dir(p: str) -> None:
    os.makedirs(p, exist_ok=True)


def read_actual_daily(path: str) -> Dict[Tuple[str, str], float]:
    by: Dict[Tuple[str, str], float] = {}
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
    by: Dict[Tuple[str, str], float] = {}
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
    by: Dict[Tuple[str, str], float] = {}
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


def read_forecast_monthly(paths: List[str]) -> Tuple[Dict[str, float], Dict[Tuple[str, str], float]]:
    by_reg: Dict[str, float] = {}
    by_dist: Dict[Tuple[str, str], float] = {}
    for p in paths:
        with open(p, newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                level = rec.get("level")
                ym = rec.get("year_month")
                dist = rec.get("district")
                try:
                    v = float(rec.get("forecast_m3", 0) or 0.0)
                except Exception:
                    v = 0.0
                if level == "region" and ym:
                    by_reg[ym] = by_reg.get(ym, 0.0) + v
                elif level == "district" and ym and dist:
                    by_dist[(ym, dist)] = by_dist.get((ym, dist), 0.0) + v
    return by_reg, by_dist


def save_region_monthly_chart(outdir: str, by_month_actual: Dict[Tuple[str, str], float], by_m_reg_fore: Dict[str, float]) -> str:
    """Plot region monthly actual vs forecast sums and save PNG.

    by_month_actual is keyed by (ym, district); we aggregate to region.
    by_m_reg_fore is keyed by ym.
    """
    ensure_dir(outdir)
    # Aggregate actual to region
    actual_reg: Dict[str, float] = {}
    for (ym, _dist), v in by_month_actual.items():
        actual_reg[ym] = actual_reg.get(ym, 0.0) + v

    months = sorted(set(actual_reg.keys()) | set(by_m_reg_fore.keys()))
    y_actual = [actual_reg.get(m, 0.0) for m in months]
    y_fore = [by_m_reg_fore.get(m, 0.0) for m in months]

    fig, ax = plt.subplots(figsize=(6, 3))
    ax.plot(months, y_actual, label="Actual", marker="o")
    ax.plot(months, y_fore, label="Forecast", marker="o")
    ax.set_title("Region Monthly — Actual vs Forecast")
    ax.set_xlabel("Year-Month")
    ax.set_ylabel("m3")
    ax.legend()
    fig.tight_layout()
    path = os.path.join(outdir, "region_monthly.png")
    fig.savefig(path)
    plt.close(fig)
    return path


def save_top5_districts_chart(outdir: str, by_month_actual: Dict[Tuple[str, str], float], by_m_dist_fore: Dict[Tuple[str, str], float], topk: int = 5) -> str:
    """Bar chart for top-K districts by total actuals (sum over months)."""
    ensure_dir(outdir)
    # Sum actuals by district
    totals: Dict[str, float] = {}
    for (ym, dist), v in by_month_actual.items():
        totals[dist] = totals.get(dist, 0.0) + v
    # Pick top-K
    top = sorted(totals.items(), key=lambda kv: kv[1], reverse=True)[:topk]
    labels = [d for d, _ in top]
    values = [totals[d] for d in labels]

    fig, ax = plt.subplots(figsize=(6, 3))
    ax.bar(labels, values)
    ax.set_title(f"Top {len(labels)} Districts by Actuals")
    ax.set_xlabel("District")
    ax.set_ylabel("m3 (sum)")
    fig.tight_layout()
    path = os.path.join(outdir, "top_districts.png")
    fig.savefig(path)
    plt.close(fig)
    return path


# ------------------ CLI ------------------
def _parse_args():
    import argparse
    p = argparse.ArgumentParser(description="Quicklook visualization report (headless)")
    p.add_argument("--actual-daily", required=True, help="Path to actual daily CSV (date,district,actual_m3)")
    p.add_argument("--actual-monthly", required=True, help="Path to actual monthly CSV (year_month,district,actual_m3)")
    p.add_argument("--forecast-daily", action="append", default=[], help="Path to forecast daily CSV (repeatable)")
    p.add_argument("--forecast-monthly", action="append", default=[], help="Path to forecast monthly CSV (repeatable)")
    p.add_argument("--outdir", required=True, help="Output directory for images")
    p.add_argument("--top-k", type=int, default=5, help="Top K districts for comparison")
    return p.parse_args()


def main(argv=None) -> int:
    args = _parse_args()
    ensure_dir(args.outdir)
    by_monthly_actual = read_actual_monthly(args.__dict__["actual_monthly"])  # (ym,dist)->val
    by_m_reg, by_m_dist = read_forecast_monthly(args.__dict__["forecast_monthly"]) if args.__dict__["forecast_monthly"] else ({}, {})
    images = []
    if by_m_reg:
        images.append(save_region_monthly_chart(args.outdir, by_monthly_actual, by_m_reg))
    if by_m_dist:
        images.append(save_top5_districts_chart(args.outdir, by_monthly_actual, by_m_dist, topk=args.top_k))
    if images:
        rpt = os.path.join(args.outdir, "REPORT.md")
        with open(rpt, "w", encoding="utf-8") as f:
            f.write("# Quicklook Report\n\n")
            for p in images:
                f.write(f"- {os.path.basename(p)}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
