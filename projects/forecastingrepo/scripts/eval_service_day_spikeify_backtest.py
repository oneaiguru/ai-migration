#!/usr/bin/env python3
"""Holdout backtest for service-day spikeify postprocess.

This is a quick sanity check to answer: "does making the forecast sparse
(service-day-like) reduce daily WAPE when actuals have many zero days?"

We use the derived Jan–May 2025 volume report (per KP daily values). For a
train/eval split:
- Train: infer service weekdays + estimate smooth daily baseline (mean/day)
- Eval: compare baseline vs spikeified baseline on daily WAPE

Outputs are printed only (no large exports).
"""

from __future__ import annotations

import argparse
import csv
import re
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, Iterable, Iterator, List, Optional, Sequence, Tuple

import numpy as np

import sys

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from src.sites.service_day_adjust import (
    ServiceDayPattern,
    iter_dates,
    mean_weights_from_sums_and_counts,
    parse_grafik_weekdays,
    pick_top_k_weekdays,
    spikeify_weekly_values,
    week_groups,
    week_groups_split_by_month,
)

DEFAULT_REPORT = (
    REPO_ROOT
    / "data/raw/jury_volumes/derived/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv"
)

PERIOD_RE = re.compile(r"Период:\s*(\d{2}\.\d{2}\.\d{4})\s*-\s*(\d{2}\.\d{2}\.\d{4})")
DATE_FMT_DOT = "%d.%m.%Y"
DATE_FMT_ISO = "%Y-%m-%d"


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Evaluate service-day spikeify on a Jan–May holdout.")
    p.add_argument("--report", default=str(DEFAULT_REPORT), help="Derived volume report CSV (semicolon-separated).")
    p.add_argument("--train-start", default="2025-01-01")
    p.add_argument("--train-end", default="2025-03-31")
    p.add_argument("--eval-start", default="2025-04-01")
    p.add_argument("--eval-end", default="2025-05-31")
    p.add_argument("--min-events", type=int, default=8)
    p.add_argument("--min-events-per-week", type=float, default=0.75)
    p.add_argument("--max-k", type=int, default=3)
    return p.parse_args(argv)


def parse_float(value: str) -> float:
    v = (value or "").strip()
    if not v:
        return 0.0
    try:
        return float(v.replace(" ", "").replace(",", "."))
    except ValueError:
        return 0.0


def detect_period(path: Path) -> Tuple[date, date]:
    with path.open("r", encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.reader(f, delimiter=";")
        for _ in range(25):
            try:
                row = next(reader)
            except StopIteration:
                break
            text = " ".join(cell for cell in row if cell)
            m = PERIOD_RE.search(text)
            if m:
                return (
                    datetime.strptime(m.group(1), DATE_FMT_DOT).date(),
                    datetime.strptime(m.group(2), DATE_FMT_DOT).date(),
                )
    raise RuntimeError(f"Could not detect report period in {path}")


def iter_report_rows(path: Path) -> Iterator[List[str]]:
    with path.open("r", encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.reader(f, delimiter=";")
        for row in reader:
            if not row:
                continue
            if any(cell.strip() for cell in row):
                yield [cell.strip() for cell in row]


def read_header_and_data_rows(path: Path) -> Tuple[List[str], Iterator[List[str]]]:
    it = iter_report_rows(path)
    header: Optional[List[str]] = None

    def data_iter() -> Iterator[List[str]]:
        nonlocal header
        for row in it:
            if header is None:
                if row and row[0].startswith("N") and "Код КП" in row:
                    header = row
                    continue
                continue
            yield row

    for _ in data_iter():
        break
    if header is None:
        raise RuntimeError(f"Header row not found in {path}")

    it2 = iter_report_rows(path)

    def data_iter2() -> Iterator[List[str]]:
        found = False
        for row in it2:
            if not found:
                if row and row[0].startswith("N") and "Код КП" in row:
                    found = True
                continue
            yield row

    return header, data_iter2()


def month_iter(start: date, end: date) -> Iterable[Tuple[int, int]]:
    y, m = start.year, start.month
    while (y, m) <= (end.year, end.month):
        yield y, m
        if m == 12:
            y += 1
            m = 1
        else:
            m += 1


def days_in_month(y: int, m: int) -> int:
    if m == 12:
        next_month = date(y + 1, 1, 1)
    else:
        next_month = date(y, m + 1, 1)
    return (next_month - date(y, m, 1)).days


def main(argv: Optional[Sequence[str]] = None) -> None:
    args = parse_args(argv)

    report_path = Path(args.report)
    train_start = datetime.strptime(args.train_start, DATE_FMT_ISO).date()
    train_end = datetime.strptime(args.train_end, DATE_FMT_ISO).date()
    eval_start = datetime.strptime(args.eval_start, DATE_FMT_ISO).date()
    eval_end = datetime.strptime(args.eval_end, DATE_FMT_ISO).date()

    if train_end >= eval_start:
        raise SystemExit("train_end must be < eval_start")

    report_start, report_end = detect_period(report_path)
    if train_start < report_start or eval_end > report_end:
        raise SystemExit(
            f"Requested window {train_start}..{eval_end} outside report period {report_start}..{report_end}"
        )

    header, data_rows = read_header_and_data_rows(report_path)

    def find_col(name: str) -> int:
        try:
            return header.index(name)
        except ValueError:
            raise SystemExit(f"Missing column '{name}' in report")

    idx_site = find_col("Код КП")
    idx_graph = find_col("График вывоза")

    idx_total = None
    for candidate in ("Итого, м3", "Итого, м³", "Итого"):
        if candidate in header:
            idx_total = header.index(candidate)
            break
    if idx_total is None:
        raise SystemExit("Missing total column (e.g. 'Итого, м3')")

    daily_start = idx_graph + 1
    daily_end = idx_total

    month_blocks: List[List[int]] = []
    current: List[int] = []
    for col_idx in range(daily_start, min(daily_end, len(header))):
        cell = header[col_idx]
        if not cell.isdigit():
            continue
        day_num = int(cell)
        if day_num == 1 and current:
            month_blocks.append(current)
            current = [col_idx]
        else:
            current.append(col_idx)
    if current:
        month_blocks.append(current)

    months = list(month_iter(report_start, report_end))
    if len(month_blocks) != len(months):
        raise SystemExit(
            f"Detected {len(month_blocks)} month column blocks but report spans {len(months)} months"
        )

    eval_days = (eval_end - eval_start).days + 1
    eval_dates = iter_dates(eval_start, eval_days)
    eval_groups = week_groups_split_by_month(eval_dates)

    train_days = (train_end - train_start).days + 1
    train_weeks = train_days / 7.0 if train_days > 0 else 1.0

    train_sum: Dict[str, float] = defaultdict(float)
    weekday_counts: Dict[str, List[int]] = defaultdict(lambda: [0] * 7)
    weekday_sums: Dict[str, List[float]] = defaultdict(lambda: [0.0] * 7)
    grafik: Dict[str, tuple[int, ...]] = {}

    actual_eval: Dict[str, List[float]] = defaultdict(lambda: [0.0] * eval_days)

    for row in data_rows:
        if idx_site >= len(row):
            continue
        site_id = (row[idx_site] or "").strip()
        if not site_id or not site_id.isdigit():
            continue
        if site_id not in grafik and idx_graph < len(row):
            graf = parse_grafik_weekdays(row[idx_graph])
            if graf:
                grafik[site_id] = graf

        for (y, m), cols in zip(months, month_blocks):
            last_day = days_in_month(y, m)
            for col_idx in cols:
                if col_idx >= len(row):
                    continue
                header_val = header[col_idx]
                if not header_val.isdigit():
                    continue
                day = int(header_val)
                if day > last_day:
                    continue
                v = parse_float(row[col_idx])
                if v <= 0:
                    continue
                dt = date(y, m, day)

                if train_start <= dt <= train_end:
                    train_sum[site_id] += v
                    wd = dt.weekday()
                    weekday_counts[site_id][wd] += 1
                    weekday_sums[site_id][wd] += v
                elif eval_start <= dt <= eval_end:
                    idx = (dt - eval_start).days
                    actual_eval[site_id][idx] += v

    patterns: Dict[str, ServiceDayPattern] = {}
    for site_id in sorted(set(weekday_counts.keys()) | set(grafik.keys())):
        graf_weekdays = grafik.get(site_id, tuple())
        cnts = weekday_counts.get(site_id, [0] * 7)
        sums = weekday_sums.get(site_id, [0.0] * 7)

        if graf_weekdays:
            weights = mean_weights_from_sums_and_counts(sums, cnts)
            patterns[site_id] = ServiceDayPattern(weekdays=graf_weekdays, weekday_weights=weights)
            continue

        total_events = sum(cnts)
        if total_events < int(args.min_events):
            continue
        events_per_week = total_events / train_weeks
        if events_per_week < float(args.min_events_per_week):
            continue
        k = int(round(events_per_week))
        k = max(1, min(int(args.max_k), min(7, k)))
        weekdays = pick_top_k_weekdays(cnts, k=k)
        if not weekdays:
            continue
        weights = mean_weights_from_sums_and_counts(sums, cnts)
        patterns[site_id] = ServiceDayPattern(weekdays=weekdays, weekday_weights=weights)

    total_actual = 0.0
    abs_err_baseline = 0.0
    abs_err_spike = 0.0

    per_site_wape_baseline: List[float] = []
    per_site_wape_spike: List[float] = []

    sites_with_actual = 0
    sites_spike_applied = 0

    for site_id, actual in actual_eval.items():
        actual_total = float(sum(actual))
        if actual_total <= 0:
            continue
        sites_with_actual += 1

        baseline_daily = train_sum.get(site_id, 0.0) / float(train_days)
        baseline = [baseline_daily] * eval_days

        err_b = sum(abs(p - a) for p, a in zip(baseline, actual))
        wape_b = err_b / actual_total

        pat = patterns.get(site_id)
        if pat is not None:
            spike = spikeify_weekly_values(eval_dates, baseline, pat, groups=eval_groups, decimals=6)
            sites_spike_applied += 1
        else:
            spike = baseline

        err_s = sum(abs(p - a) for p, a in zip(spike, actual))
        wape_s = err_s / actual_total

        total_actual += actual_total
        abs_err_baseline += err_b
        abs_err_spike += err_s

        per_site_wape_baseline.append(wape_b)
        per_site_wape_spike.append(wape_s)

    def pct(x: float) -> str:
        return f"{x * 100:.1f}%"

    micro_b = abs_err_baseline / total_actual if total_actual > 0 else float("nan")
    micro_s = abs_err_spike / total_actual if total_actual > 0 else float("nan")

    def quantiles(arr: List[float]) -> dict:
        a = np.array(arr, dtype=float)
        return {
            "median": float(np.quantile(a, 0.5)),
            "p90": float(np.quantile(a, 0.9)),
            "p95": float(np.quantile(a, 0.95)),
        }

    q_b = quantiles(per_site_wape_baseline) if per_site_wape_baseline else {}
    q_s = quantiles(per_site_wape_spike) if per_site_wape_spike else {}

    print("[BACKTEST] train:", train_start, "..", train_end, f"({train_days}d)")
    print("[BACKTEST] eval :", eval_start, "..", eval_end, f"({eval_days}d)")
    print(f"[SITES] with actual in eval: {sites_with_actual:,}")
    print(f"[SITES] spike pattern inferred: {len(patterns):,}")
    print(f"[SITES] spike applied on eval sites: {sites_spike_applied:,} ({sites_spike_applied / max(1, sites_with_actual):.1%})")
    print(f"[MICRO WAPE] baseline: {micro_b:.4f} ({pct(micro_b)})")
    print(f"[MICRO WAPE] spikeify: {micro_s:.4f} ({pct(micro_s)})")
    if per_site_wape_baseline:
        print(f"[PER-SITE] baseline median={q_b['median']:.4f}, p90={q_b['p90']:.4f}, p95={q_b['p95']:.4f}")
        print(f"[PER-SITE] spikeify median={q_s['median']:.4f}, p90={q_s['p90']:.4f}, p95={q_s['p95']:.4f}")


if __name__ == "__main__":
    main()
