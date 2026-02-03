#!/usr/bin/env python3
"""Spikeify a smooth daily wide forecast into service-day-like spikes.

Motivation
- Jury evaluates day-level WAPE. If actuals are sparse (many zero days) but the
  forecast is smooth (positive every day), sum(abs error) becomes large even
  when totals are close.

This script:
1) Infers per-KP service weekday pattern from a historical volume report
   (Jan–May 2025 derived CSV export).
2) Redistributes each week's forecast total onto those service weekdays only,
   keeping weekly (and thus overall) totals unchanged.

Input (wide daily)
- CSV with delimiter ';' and decimal comma.
- Header: 'Код КП;1;2;...'

Output
- Same wide format, with zeros on non-service weekdays for KPs where a stable
  weekly pattern is inferred.

Guardrails
- No addresses written.
- Keeps output small and streaming (row-by-row).
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Dict, Iterable, Iterator, List, Optional, Sequence, Tuple

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
from src.sites.wide_report import format_decimal


DEFAULT_HISTORY = (
    REPO_ROOT
    / "data/raw/jury_volumes/derived/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv"
)

PERIOD_RE = re.compile(r"Период:\s*(\d{2}\.\d{2}\.\d{4})\s*-\s*(\d{2}\.\d{2}\.\d{4})")
DATE_FMT_DOT = "%d.%m.%Y"
DATE_FMT_ISO = "%Y-%m-%d"


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Spikeify smooth daily wide forecast into service-day spikes.")
    parser.add_argument("--forecast-wide", required=True, help="Input wide daily forecast CSV (Код КП + day columns).")
    parser.add_argument("--start", required=True, help="Forecast start date (YYYY-MM-DD).")
    parser.add_argument("--out", required=True, help="Output wide CSV path.")
    parser.add_argument("--stats-out", default=None, help="Optional JSON path to write run stats/validation metrics.")
    parser.add_argument(
        "--history",
        default=str(DEFAULT_HISTORY),
        help="Historical volumes report CSV used to infer service weekdays (default: derived Jan–May export).",
    )
    parser.add_argument("--history-start", default=None, help="History window start (YYYY-MM-DD). Defaults to report period start.")
    parser.add_argument("--history-end", default=None, help="History window end (YYYY-MM-DD). Defaults to report period end.")
    parser.add_argument("--min-events", type=int, default=8, help="Min service events to infer a weekly pattern (default 8).")
    parser.add_argument(
        "--min-events-per-week",
        type=float,
        default=0.75,
        help="Require at least this avg events/week to apply weekly pattern (default 0.75).",
    )
    parser.add_argument(
        "--max-k",
        type=int,
        default=3,
        help="Cap inferred service days/week to this value (default 3).",
    )
    parser.add_argument(
        "--schedule-alignment-threshold",
        type=float,
        default=0.6,
        help=(
            "Schedule-quality gate: require alignment >= threshold to trust parsed 'График вывоза' weekdays "
            "(default 0.6). Set <=0 to disable gating."
        ),
    )
    parser.add_argument(
        "--daily-mode",
        choices=["noop", "redistribute"],
        default="noop",
        help=(
            "How to treat 'Ежедневно' schedules: noop leaves the forecast unchanged (default); "
            "redistribute applies spikeify across all 7 weekdays using weights."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and infer patterns, but do not write an output forecast.",
    )
    return parser.parse_args(argv)


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

    # Prime until header is found
    for _ in data_iter():
        break

    if header is None:
        raise RuntimeError(f"Header row not found in {path}")

    # Re-create iterator (we consumed 1 row)
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


def infer_weekly_patterns(
    report_path: Path,
    history_start: Optional[date],
    history_end: Optional[date],
    min_events: int,
    min_events_per_week: float,
    max_k: int,
    schedule_alignment_threshold: float,
    daily_mode: str,
) -> Tuple[Dict[str, ServiceDayPattern], Dict[str, str]]:
    if history_start is None or history_end is None:
        p_start, p_end = detect_period(report_path)
        history_start = history_start or p_start
        history_end = history_end or p_end

    header, data_rows = read_header_and_data_rows(report_path)

    def find_col(name: str) -> int:
        try:
            return header.index(name)
        except ValueError:
            raise RuntimeError(f"Missing column '{name}' in {report_path}")

    idx_site = find_col("Код КП")
    idx_graph = find_col("График вывоза")

    idx_total = None
    for candidate in ("Итого, м3", "Итого, м³", "Итого"):
        if candidate in header:
            idx_total = header.index(candidate)
            break
    if idx_total is None:
        raise RuntimeError(f"Missing total column (e.g. 'Итого, м3') in {report_path}")

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

    months = list(month_iter(history_start, history_end))
    if len(month_blocks) != len(months):
        raise RuntimeError(
            f"Detected {len(month_blocks)} month column blocks but window spans {len(months)} months"
        )

    counts: Dict[str, List[int]] = defaultdict(lambda: [0] * 7)
    sums: Dict[str, List[float]] = defaultdict(lambda: [0.0] * 7)
    grafik: Dict[str, tuple[int, ...]] = {}

    for row in data_rows:
        if idx_site >= len(row):
            continue
        site_id = row[idx_site].strip()
        if not site_id:
            continue
        # Only numeric KPs for this workflow.
        if not site_id.isdigit():
            continue

        if site_id not in grafik and idx_graph < len(row):
            graf_days = parse_grafik_weekdays(row[idx_graph])
            if graf_days:
                grafik[site_id] = graf_days

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
                if dt < history_start or dt > history_end:
                    continue
                wd = dt.weekday()
                counts[site_id][wd] += 1
                sums[site_id][wd] += v

    total_days = (history_end - history_start).days + 1
    total_weeks = total_days / 7.0 if total_days > 0 else 1.0

    patterns: Dict[str, ServiceDayPattern] = {}
    sources: Dict[str, str] = {}

    def infer_from_counts(site_id: str) -> Optional[ServiceDayPattern]:
        wd_counts = counts.get(site_id, [0] * 7)
        wd_sums = sums.get(site_id, [0.0] * 7)
        total_events = sum(wd_counts)
        if total_events < min_events:
            return None
        events_per_week = total_events / total_weeks
        if events_per_week < min_events_per_week:
            return None
        k = int(round(events_per_week))
        k = max(1, min(int(max_k), min(7, k)))
        weekdays = pick_top_k_weekdays(wd_counts, k=k)
        if not weekdays:
            return None
        wd_weights = mean_weights_from_sums_and_counts(wd_sums, wd_counts)
        return ServiceDayPattern(weekdays=weekdays, weekday_weights=wd_weights)

    def schedule_alignment(site_id: str, schedule_weekdays: tuple[int, ...]) -> float:
        wd_counts = counts.get(site_id, [0] * 7)
        total_events = sum(wd_counts)
        if total_events <= 0:
            return 0.0
        in_sched = sum(int(wd_counts[wd]) for wd in schedule_weekdays if 0 <= wd <= 6)
        return in_sched / float(total_events)

    daily_weekdays = tuple(range(7))

    for site_id in sorted(set(counts.keys()) | set(grafik.keys())):
        graf_weekdays = grafik.get(site_id, tuple())
        wd_sums = sums.get(site_id, [0.0] * 7)

        if graf_weekdays:
            if daily_mode == "noop" and graf_weekdays == daily_weekdays:
                sources[site_id] = "daily_noop"
                continue

            align = schedule_alignment(site_id, graf_weekdays)
            if float(schedule_alignment_threshold) > 0 and align < float(schedule_alignment_threshold):
                inferred = infer_from_counts(site_id)
                if inferred is not None:
                    patterns[site_id] = inferred
                    sources[site_id] = "gated_to_inferred"
                else:
                    sources[site_id] = "gated_to_none"
                continue

            wd_weights = mean_weights_from_sums_and_counts(wd_sums, counts.get(site_id, [0] * 7))
            patterns[site_id] = ServiceDayPattern(weekdays=graf_weekdays, weekday_weights=wd_weights)
            sources[site_id] = "schedule"
            continue

        inferred = infer_from_counts(site_id)
        if inferred is not None:
            patterns[site_id] = inferred
            sources[site_id] = "inferred"
        else:
            sources[site_id] = "none"

    return patterns, sources


def read_forecast_header(path: Path) -> List[str]:
    with path.open("r", encoding="utf-8", errors="replace", newline="") as f:
        reader = csv.reader(f, delimiter=";")
        header = next(reader)
    if not header or header[0].strip() != "Код КП":
        raise RuntimeError("Expected wide header starting with 'Код КП'")
    return header


def spikeify_forecast(
    in_path: Path,
    out_path: Path,
    start: date,
    patterns: Dict[str, ServiceDayPattern],
    sources: Dict[str, str],
) -> dict:
    header = read_forecast_header(in_path)
    n_days = len(header) - 1
    dates = iter_dates(start, n_days)
    groups = week_groups_split_by_month(dates)

    out_path.parent.mkdir(parents=True, exist_ok=True)

    adjusted = 0
    rows = 0
    total_before = 0.0
    total_after = 0.0
    sum_abs_delta = 0.0

    modified_volume = 0.0

    src_counts: Dict[str, int] = defaultdict(int)

    month_keys = [(dt.year, dt.month) for dt in dates]
    month_to_idx: Dict[Tuple[int, int], int] = {}
    months: List[Tuple[int, int]] = []
    for key in month_keys:
        if key not in month_to_idx:
            month_to_idx[key] = len(months)
            months.append(key)
    month_idx = [month_to_idx[key] for key in month_keys]

    month_before = [0.0] * len(months)
    month_after = [0.0] * len(months)

    jun_oct_end = date(start.year, 10, 31)
    is_jun_oct = [dt <= jun_oct_end for dt in dates]
    jun_oct_before = 0.0
    jun_oct_after = 0.0

    max_per_kp_month_diff = 0.0

    with in_path.open("r", encoding="utf-8", errors="replace", newline="") as fin, out_path.open(
        "w", encoding="utf-8", newline=""
    ) as fout:
        reader = csv.reader(fin, delimiter=";")
        writer = csv.writer(fout, delimiter=";")
        header_in = next(reader)
        writer.writerow(header_in)

        for row in reader:
            if not row:
                continue
            site_id = (row[0] or "").strip()
            if not site_id:
                continue

            values: List[float] = []
            # Pad short rows.
            if len(row) < n_days + 1:
                row = row + [""] * (n_days + 1 - len(row))
            for cell in row[1 : n_days + 1]:
                values.append(parse_float(cell))

            before = sum(values)
            total_before += before
            src_counts[sources.get(site_id, "none")] += 1

            per_kp_month_before = [0.0] * len(months)
            for i, v in enumerate(values):
                mi = month_idx[i]
                per_kp_month_before[mi] += v
                month_before[mi] += v
                if is_jun_oct[i]:
                    jun_oct_before += v

            before_values = values
            pat = patterns.get(site_id)
            if pat is not None:
                values = spikeify_weekly_values(dates, before_values, pat, groups=groups, decimals=6)
                adjusted += 1
                modified_volume += before

            per_kp_month_after = [0.0] * len(months)
            for i, v_new in enumerate(values):
                mi = month_idx[i]
                per_kp_month_after[mi] += v_new
                month_after[mi] += v_new
                if is_jun_oct[i]:
                    jun_oct_after += v_new
                sum_abs_delta += abs(v_new - before_values[i])

            for mi in range(len(months)):
                diff = abs(per_kp_month_after[mi] - per_kp_month_before[mi])
                if diff > max_per_kp_month_diff:
                    max_per_kp_month_diff = diff

            after = sum(values)
            total_after += after

            formatted = [format_decimal(v) for v in values]
            writer.writerow([site_id, *formatted])
            rows += 1

    sum_pred = total_before
    impact_ratio = (sum_abs_delta / sum_pred) if sum_pred > 0 else float("nan")

    month_rows: List[dict] = []
    for (y, m), b, a in zip(months, month_before, month_after):
        month_rows.append(
            {
                "year": y,
                "month": m,
                "before": b,
                "after": a,
                "diff": a - b,
            }
        )

    return {
        "rows": rows,
        "sites_adjusted": adjusted,
        "total_before": total_before,
        "total_after": total_after,
        "total_diff": total_after - total_before,
        "sum_abs_delta": sum_abs_delta,
        "impact_ratio": impact_ratio,
        "modified_volume": modified_volume,
        "modified_volume_share": (modified_volume / total_before) if total_before > 0 else float("nan"),
        "days": n_days,
        "sources": dict(sorted(src_counts.items(), key=lambda kv: kv[0])),
        "jun_oct_total_before": jun_oct_before,
        "jun_oct_total_after": jun_oct_after,
        "jun_oct_total_diff": jun_oct_after - jun_oct_before,
        "month_totals": month_rows,
        "max_per_kp_month_diff": max_per_kp_month_diff,
    }


def main(argv: Optional[Sequence[str]] = None) -> None:
    args = parse_args(argv)

    forecast_path = Path(args.forecast_wide)
    out_path = Path(args.out)
    history_path = Path(args.history)

    start_dt = datetime.strptime(args.start, DATE_FMT_ISO).date()
    history_start = datetime.strptime(args.history_start, DATE_FMT_ISO).date() if args.history_start else None
    history_end = datetime.strptime(args.history_end, DATE_FMT_ISO).date() if args.history_end else None

    patterns = infer_weekly_patterns(
        history_path,
        history_start=history_start,
        history_end=history_end,
        min_events=int(args.min_events),
        min_events_per_week=float(args.min_events_per_week),
        max_k=int(args.max_k),
        schedule_alignment_threshold=float(args.schedule_alignment_threshold),
        daily_mode=str(args.daily_mode),
    )
    patterns_map, sources = patterns

    print(f"[OK] Inferred weekly patterns for {len(patterns_map):,} KPs")

    if args.dry_run:
        return

    summary = spikeify_forecast(
        forecast_path,
        out_path,
        start=start_dt,
        patterns=patterns_map,
        sources=sources,
    )

    print(
        "[DONE] Spikeified wide forecast: "
        f"rows={summary['rows']:,}, sites_adjusted={summary['sites_adjusted']:,}, "
        f"days={summary['days']}, total_diff={summary['total_diff']:.6f}"
    )
    print(
        "[IMPACT] "
        f"modified_kps={summary['sites_adjusted']:,} ({summary['sites_adjusted'] / max(1, summary['rows']):.1%}), "
        f"modified_volume_share={summary['modified_volume_share']:.1%}, "
        f"sum_abs_delta/sum_pred={summary['impact_ratio']:.4f}"
    )
    print(
        "[TOTALS] "
        f"jun_oct_diff={summary['jun_oct_total_diff']:.6f}, "
        f"max_per_kp_month_diff={summary['max_per_kp_month_diff']:.6f}"
    )

    if args.stats_out:
        stats_path = Path(args.stats_out)
        stats_path.parent.mkdir(parents=True, exist_ok=True)
        stats = {
            "forecast": {
                "path": str(forecast_path),
                "start": start_dt.isoformat(),
                "days": summary["days"],
                "rows": summary["rows"],
            },
            "history": {
                "path": str(history_path),
                "history_start": history_start.isoformat() if history_start else None,
                "history_end": history_end.isoformat() if history_end else None,
                "min_events": int(args.min_events),
                "min_events_per_week": float(args.min_events_per_week),
                "max_k": int(args.max_k),
                "schedule_alignment_threshold": float(args.schedule_alignment_threshold),
                "daily_mode": str(args.daily_mode),
            },
            "result": summary,
        }
        stats_path.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
