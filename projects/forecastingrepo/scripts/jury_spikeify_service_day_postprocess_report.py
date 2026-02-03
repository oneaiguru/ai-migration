#!/usr/bin/env python3
"""Jury spikeify: evaluation + small report artifacts (address-free).

Generates:
- reports/jury_spikeify_<YYYYMMDD>/holdout_metrics.csv
- reports/jury_spikeify_<YYYYMMDD>/regressions_top20.csv (KP-only)
- reports/jury_spikeify_<YYYYMMDD>/district_regressions_top20.csv (district aggregates)
- reports/jury_spikeify_<YYYYMMDD>/SUMMARY.md
- reports/jury_spikeify_<YYYYMMDD>/REPRO.md

Scope: evaluation + postprocess only (no model/pipeline changes).
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, Iterable, Iterator, List, Optional, Sequence, Tuple

import numpy as np


REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from src.sites.service_day_adjust import (  # noqa: E402
    ServiceDayPattern,
    iter_dates,
    mean_weights_from_sums_and_counts,
    parse_grafik_weekdays,
    pick_top_k_weekdays,
    spikeify_weekly_values,
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
    p = argparse.ArgumentParser(description="Generate Jury spikeify holdout + regressions report artifacts.")
    p.add_argument("--report", default=str(DEFAULT_REPORT), help="Derived Jan–May 2025 volume report CSV.")
    p.add_argument("--train-start", default="2025-01-01")
    p.add_argument("--train-end", default="2025-03-31")
    p.add_argument("--eval-start", default="2025-04-01")
    p.add_argument("--eval-end", default="2025-05-31")
    p.add_argument("--min-events", type=int, default=8)
    p.add_argument("--min-events-per-week", type=float, default=0.75)
    p.add_argument("--max-k", type=int, default=3)
    p.add_argument(
        "--schedule-alignment-threshold",
        type=float,
        default=0.6,
        help="Schedule-quality gate threshold (alignment >= X) for trusting parsed schedule weekdays.",
    )
    p.add_argument("--top-n", type=int, default=20, help="How many regressions to export (default 20).")
    p.add_argument("--run-date", default=None, help="Override YYYYMMDD used for output folder naming.")
    p.add_argument("--outdir", default=None, help="Override output directory (default reports/jury_spikeify_<YYYYMMDD>/).")
    p.add_argument(
        "--forecast-stats",
        default=None,
        help="Optional JSON stats from scripts/jury_spikeify_daily_forecast.py --stats-out (included in SUMMARY.md).",
    )
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


def normalize_schedule_text(text: str) -> str:
    norm = (text or "").strip()
    if not norm:
        return ""
    if "/" in norm:
        norm = norm.split("/", 1)[0].strip()
    return norm


def schedule_alignment(counts: Sequence[int], schedule_weekdays: Sequence[int]) -> float:
    total_events = sum(int(x) for x in counts[:7])
    if total_events <= 0:
        return 0.0
    in_sched = sum(int(counts[wd]) for wd in schedule_weekdays if 0 <= int(wd) <= 6)
    return in_sched / float(total_events)


def infer_from_counts(
    counts: Sequence[int],
    sums: Sequence[float],
    total_weeks: float,
    min_events: int,
    min_events_per_week: float,
    max_k: int,
) -> Optional[ServiceDayPattern]:
    total_events = sum(int(x) for x in counts[:7])
    if total_events < int(min_events):
        return None
    events_per_week = total_events / float(total_weeks) if total_weeks > 0 else 0.0
    if events_per_week < float(min_events_per_week):
        return None
    k = int(round(events_per_week))
    k = max(1, min(int(max_k), min(7, k)))
    weekdays = pick_top_k_weekdays(counts, k=k)
    if not weekdays:
        return None
    weights = mean_weights_from_sums_and_counts(sums, counts)
    return ServiceDayPattern(weekdays=weekdays, weekday_weights=weights)


@dataclass(frozen=True)
class HoldoutSiteMetrics:
    site_id: str
    district: str
    actual_total: float
    abs_err_baseline: float
    abs_err_spike_nogate: float
    abs_err_spike_gate: float
    wape_baseline: float
    wape_spike_nogate: float
    wape_spike_gate: float
    delta_abs_err_gate: float


def compute_holdout_metrics(
    report_path: Path,
    train_start: date,
    train_end: date,
    eval_start: date,
    eval_end: date,
    min_events: int,
    min_events_per_week: float,
    max_k: int,
    schedule_alignment_threshold: float,
) -> dict:
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

    idx_district = find_col("Район")
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
        raise SystemExit(f"Detected {len(month_blocks)} month blocks but report spans {len(months)} months")

    eval_days = (eval_end - eval_start).days + 1
    eval_dates = iter_dates(eval_start, eval_days)
    eval_groups = week_groups_split_by_month(eval_dates)

    train_days = (train_end - train_start).days + 1
    total_weeks = (train_days / 7.0) if train_days > 0 else 1.0

    all_sites: set[str] = set()
    district_by_site: Dict[str, str] = {}
    schedule_text_by_site: Dict[str, str] = {}

    train_sum: Dict[str, float] = defaultdict(float)
    weekday_counts: Dict[str, List[int]] = defaultdict(lambda: [0] * 7)
    weekday_sums: Dict[str, List[float]] = defaultdict(lambda: [0.0] * 7)

    actual_eval: Dict[str, List[float]] = defaultdict(lambda: [0.0] * eval_days)

    for row in data_rows:
        if idx_site >= len(row):
            continue
        site_id = (row[idx_site] or "").strip()
        if not site_id or not site_id.isdigit():
            continue
        all_sites.add(site_id)

        if site_id not in district_by_site and idx_district < len(row):
            district_by_site[site_id] = (row[idx_district] or "").strip()
        if site_id not in schedule_text_by_site and idx_graph < len(row):
            schedule_text_by_site[site_id] = normalize_schedule_text(row[idx_graph] or "")

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

    parsing = {
        "total_kps": len(all_sites),
        "missing": 0,
        "parsed_weekdays": 0,
        "parsed_daily": 0,
        "unparsed": 0,
        "top_unparsed": [],
    }
    unparsed_counter: Counter[str] = Counter()
    daily_weekdays = tuple(range(7))

    for site_id in all_sites:
        raw = schedule_text_by_site.get(site_id, "")
        if not raw or raw in {"-", "—"}:
            parsing["missing"] += 1
            continue
        parsed = parse_grafik_weekdays(raw)
        if parsed == daily_weekdays:
            parsing["parsed_daily"] += 1
            continue
        if parsed:
            parsing["parsed_weekdays"] += 1
            continue
        parsing["unparsed"] += 1
        unparsed_counter[raw] += 1

    parsing["top_unparsed"] = [
        {"text": s, "kps": c, "share_kps": (c / parsing["total_kps"]) if parsing["total_kps"] else 0.0}
        for s, c in unparsed_counter.most_common(20)
    ]

    total_actual = 0.0
    abs_err_baseline = 0.0
    abs_err_spike_nogate = 0.0
    abs_err_spike_gate = 0.0

    per_site_wape_baseline: List[float] = []
    per_site_wape_spike_nogate: List[float] = []
    per_site_wape_spike_gate: List[float] = []

    schedule_parsed_sites = 0
    schedule_gated_out_sites = 0
    schedule_gated_out_volume = 0.0

    rows: List[HoldoutSiteMetrics] = []

    for site_id, actual in actual_eval.items():
        actual_total = float(sum(actual))
        if actual_total <= 0:
            continue

        cnts = weekday_counts.get(site_id, [0] * 7)
        sums = weekday_sums.get(site_id, [0.0] * 7)

        raw_sched = schedule_text_by_site.get(site_id, "")
        sched_days = parse_grafik_weekdays(raw_sched)
        is_daily = sched_days == daily_weekdays
        has_sched = bool(sched_days) and not is_daily

        if has_sched:
            schedule_parsed_sites += 1

        baseline_daily = train_sum.get(site_id, 0.0) / float(train_days)
        baseline = [baseline_daily] * eval_days

        err_b = sum(abs(p - a) for p, a in zip(baseline, actual))
        wape_b = err_b / actual_total

        def apply_spikeify(pattern: Optional[ServiceDayPattern]) -> List[float]:
            if pattern is None:
                return baseline
            return spikeify_weekly_values(eval_dates, baseline, pattern, groups=eval_groups, decimals=6)

        # No-gate: trust parsed schedule whenever available (except 'Ежедневно' -> no-op).
        if has_sched:
            pat_sched = ServiceDayPattern(weekdays=sched_days, weekday_weights=mean_weights_from_sums_and_counts(sums, cnts))
            pred_nogate = apply_spikeify(pat_sched)
        elif is_daily:
            pred_nogate = baseline
        else:
            pat_inf = infer_from_counts(
                cnts,
                sums,
                total_weeks=total_weeks,
                min_events=min_events,
                min_events_per_week=min_events_per_week,
                max_k=max_k,
            )
            pred_nogate = apply_spikeify(pat_inf)

        err_nogate = sum(abs(p - a) for p, a in zip(pred_nogate, actual))
        wape_nogate = err_nogate / actual_total

        # Gate: trust schedule only if it aligns with observed train nonzero weekdays.
        pat_gate: Optional[ServiceDayPattern] = None
        if has_sched:
            align = schedule_alignment(cnts, sched_days)
            if align >= float(schedule_alignment_threshold):
                pat_gate = ServiceDayPattern(
                    weekdays=sched_days, weekday_weights=mean_weights_from_sums_and_counts(sums, cnts)
                )
            else:
                schedule_gated_out_sites += 1
                schedule_gated_out_volume += actual_total
                pat_gate = infer_from_counts(
                    cnts,
                    sums,
                    total_weeks=total_weeks,
                    min_events=min_events,
                    min_events_per_week=min_events_per_week,
                    max_k=max_k,
                )
        elif is_daily:
            pat_gate = None
        else:
            pat_gate = infer_from_counts(
                cnts,
                sums,
                total_weeks=total_weeks,
                min_events=min_events,
                min_events_per_week=min_events_per_week,
                max_k=max_k,
            )

        pred_gate = apply_spikeify(pat_gate)
        err_gate = sum(abs(p - a) for p, a in zip(pred_gate, actual))
        wape_gate = err_gate / actual_total

        total_actual += actual_total
        abs_err_baseline += err_b
        abs_err_spike_nogate += err_nogate
        abs_err_spike_gate += err_gate

        per_site_wape_baseline.append(wape_b)
        per_site_wape_spike_nogate.append(wape_nogate)
        per_site_wape_spike_gate.append(wape_gate)

        rows.append(
            HoldoutSiteMetrics(
                site_id=site_id,
                district=district_by_site.get(site_id, ""),
                actual_total=actual_total,
                abs_err_baseline=err_b,
                abs_err_spike_nogate=err_nogate,
                abs_err_spike_gate=err_gate,
                wape_baseline=wape_b,
                wape_spike_nogate=wape_nogate,
                wape_spike_gate=wape_gate,
                delta_abs_err_gate=err_gate - err_b,
            )
        )

    micro_baseline = abs_err_baseline / total_actual if total_actual > 0 else float("nan")
    micro_nogate = abs_err_spike_nogate / total_actual if total_actual > 0 else float("nan")
    micro_gate = abs_err_spike_gate / total_actual if total_actual > 0 else float("nan")

    def quantiles(arr: List[float]) -> dict:
        if not arr:
            return {}
        a = np.array(arr, dtype=float)
        return {
            "median": float(np.quantile(a, 0.5)),
            "p90": float(np.quantile(a, 0.9)),
            "p95": float(np.quantile(a, 0.95)),
        }

    return {
        "window": {
            "train_start": train_start.isoformat(),
            "train_end": train_end.isoformat(),
            "eval_start": eval_start.isoformat(),
            "eval_end": eval_end.isoformat(),
            "train_days": train_days,
            "eval_days": eval_days,
        },
        "params": {
            "min_events": int(min_events),
            "min_events_per_week": float(min_events_per_week),
            "max_k": int(max_k),
            "schedule_alignment_threshold": float(schedule_alignment_threshold),
            "daily_mode": "noop",
        },
        "parsing": parsing,
        "micro_wape": {
            "baseline": micro_baseline,
            "spikeify_nogate": micro_nogate,
            "spikeify_gate": micro_gate,
        },
        "per_site_quantiles": {
            "baseline": quantiles(per_site_wape_baseline),
            "spikeify_nogate": quantiles(per_site_wape_spike_nogate),
            "spikeify_gate": quantiles(per_site_wape_spike_gate),
        },
        "gate": {
            "schedule_parsed_sites_with_actual": schedule_parsed_sites,
            "schedule_gated_out_sites_with_actual": schedule_gated_out_sites,
            "schedule_gated_out_volume_share": (schedule_gated_out_volume / total_actual) if total_actual > 0 else 0.0,
        },
        "rows": rows,
        "totals": {
            "total_actual": total_actual,
            "abs_err_baseline": abs_err_baseline,
            "abs_err_spikeify_nogate": abs_err_spike_nogate,
            "abs_err_spikeify_gate": abs_err_spike_gate,
        },
    }


def write_csv(path: Path, header: List[str], rows: Iterable[Sequence[object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        for r in rows:
            w.writerow(list(r))


def format_pct(x: float) -> str:
    return f"{x * 100:.2f}%"


def main(argv: Optional[Sequence[str]] = None) -> None:
    args = parse_args(argv)

    run_date = args.run_date or datetime.now().strftime("%Y%m%d")
    outdir = Path(args.outdir) if args.outdir else (REPO_ROOT / "reports" / f"jury_spikeify_{run_date}")
    outdir.mkdir(parents=True, exist_ok=True)

    report_path = Path(args.report)
    train_start = datetime.strptime(args.train_start, DATE_FMT_ISO).date()
    train_end = datetime.strptime(args.train_end, DATE_FMT_ISO).date()
    eval_start = datetime.strptime(args.eval_start, DATE_FMT_ISO).date()
    eval_end = datetime.strptime(args.eval_end, DATE_FMT_ISO).date()

    holdout = compute_holdout_metrics(
        report_path=report_path,
        train_start=train_start,
        train_end=train_end,
        eval_start=eval_start,
        eval_end=eval_end,
        min_events=int(args.min_events),
        min_events_per_week=float(args.min_events_per_week),
        max_k=int(args.max_k),
        schedule_alignment_threshold=float(args.schedule_alignment_threshold),
    )

    micro = holdout["micro_wape"]
    totals = holdout["totals"]
    gate = holdout["gate"]
    parsing = holdout["parsing"]

    holdout_rows = [
        (
            "baseline_smooth_mean_per_day",
            micro["baseline"],
            format_pct(micro["baseline"]),
            totals["total_actual"],
        ),
        (
            "spikeify_no_gate",
            micro["spikeify_nogate"],
            format_pct(micro["spikeify_nogate"]),
            totals["total_actual"],
        ),
        (
            f"spikeify_gate_alignment>={float(args.schedule_alignment_threshold):.2f}",
            micro["spikeify_gate"],
            format_pct(micro["spikeify_gate"]),
            totals["total_actual"],
        ),
    ]
    write_csv(
        outdir / "holdout_metrics.csv",
        header=["variant", "micro_wape_ratio", "micro_wape_pct", "sum_actual"],
        rows=holdout_rows,
    )

    rows: List[HoldoutSiteMetrics] = holdout["rows"]
    worsened_volume = sum(r.actual_total for r in rows if r.wape_spike_gate > r.wape_baseline + 1e-12)
    total_actual = float(totals["total_actual"])
    worsened_volume_share = (worsened_volume / total_actual) if total_actual > 0 else 0.0

    top = sorted(rows, key=lambda r: r.delta_abs_err_gate, reverse=True)[: int(args.top_n)]
    write_csv(
        outdir / "regressions_top20.csv",
        header=[
            "site_id",
            "actual_total",
            "abs_err_baseline",
            "abs_err_spike_gate",
            "delta_abs_err",
            "wape_baseline",
            "wape_spike_gate",
        ],
        rows=[
            (
                r.site_id,
                round(r.actual_total, 6),
                round(r.abs_err_baseline, 6),
                round(r.abs_err_spike_gate, 6),
                round(r.delta_abs_err_gate, 6),
                round(r.wape_baseline, 6),
                round(r.wape_spike_gate, 6),
            )
            for r in top
            if r.delta_abs_err_gate > 0
        ],
    )

    by_district: Dict[str, dict] = defaultdict(lambda: {"actual": 0.0, "err_b": 0.0, "err_g": 0.0})
    for r in rows:
        d = r.district or "(unknown)"
        by_district[d]["actual"] += r.actual_total
        by_district[d]["err_b"] += r.abs_err_baseline
        by_district[d]["err_g"] += r.abs_err_spike_gate

    district_rows = []
    for d, agg in by_district.items():
        delta = agg["err_g"] - agg["err_b"]
        district_rows.append(
            (
                d,
                round(agg["actual"], 6),
                round(agg["err_b"], 6),
                round(agg["err_g"], 6),
                round(delta, 6),
                round((agg["err_b"] / agg["actual"]) if agg["actual"] > 0 else float("nan"), 6),
                round((agg["err_g"] / agg["actual"]) if agg["actual"] > 0 else float("nan"), 6),
            )
        )
    district_rows.sort(key=lambda r: r[4], reverse=True)

    write_csv(
        outdir / "district_regressions_top20.csv",
        header=[
            "district",
            "actual_total",
            "abs_err_baseline",
            "abs_err_spike_gate",
            "delta_abs_err",
            "wape_baseline",
            "wape_spike_gate",
        ],
        rows=[r for r in district_rows[: int(args.top_n)] if r[4] > 0],
    )

    forecast_stats = None
    if args.forecast_stats:
        stats_path = Path(args.forecast_stats)
        if stats_path.exists():
            forecast_stats = json.loads(stats_path.read_text(encoding="utf-8"))

    summary_lines: List[str] = []
    summary_lines.append("# Jury — Spikeify service-day postprocess\n")
    summary_lines.append("## Holdout (Jan–May 2025)\n")
    summary_lines.append(
        f"- Daily micro-WAPE baseline: {micro['baseline']:.4f} ({format_pct(micro['baseline'])})\n"
    )
    summary_lines.append(
        f"- Daily micro-WAPE spikeify (no gate): {micro['spikeify_nogate']:.4f} ({format_pct(micro['spikeify_nogate'])})\n"
    )
    summary_lines.append(
        f"- Daily micro-WAPE spikeify (gate {float(args.schedule_alignment_threshold):.2f}+): "
        f"{micro['spikeify_gate']:.4f} ({format_pct(micro['spikeify_gate'])})\n"
    )
    summary_lines.append(
        f"- Gate: gated_out={gate['schedule_gated_out_sites_with_actual']:,} / "
        f"{gate['schedule_parsed_sites_with_actual']:,} schedule-parsed eval KPs "
        f"(volume share {format_pct(gate['schedule_gated_out_volume_share'])})\n"
    )
    summary_lines.append(
        f"- Regression: volume share worsened (gate vs baseline): {format_pct(worsened_volume_share)}\n"
    )
    summary_lines.append("\n## Parsing coverage (`График вывоза`, Jan–May report)\n")
    summary_lines.append(
        f"- KPs total: {parsing['total_kps']:,}; missing: {parsing['missing']:,}; "
        f"parsed weekdays: {parsing['parsed_weekdays']:,}; parsed daily: {parsing['parsed_daily']:,}; "
        f"unparsed: {parsing['unparsed']:,}\n"
    )
    if parsing.get("top_unparsed"):
        summary_lines.append("- Top unparsed schedule strings (share of KPs):\n")
        for item in parsing["top_unparsed"][:10]:
            summary_lines.append(f"  - {item['kps']:,} ({format_pct(item['share_kps'])}): {item['text']}\n")

    if forecast_stats:
        res = forecast_stats.get("result", {})
        hist = forecast_stats.get("history", {})
        summary_lines.append("\n## Jun–Dec 2025 export checks\n")
        sources = res.get("sources", {}) or {}
        total_rows = int(res.get("rows", 0) or 0)
        def _pct(n: int) -> str:
            return format_pct((n / total_rows) if total_rows else 0.0)

        # Coverage vs impact are intentionally separated (see task doc).
        summary_lines.append("\n### Coverage\n")
        for key in ["schedule", "gated_to_inferred", "gated_to_none", "inferred", "daily_noop", "none"]:
            n = int(sources.get(key, 0) or 0)
            summary_lines.append(f"- {key}: {n:,} ({_pct(n)})\n")

        gated_out_n = int(sources.get("gated_to_inferred", 0) or 0) + int(sources.get("gated_to_none", 0) or 0)
        summary_lines.append(f"- gated_out_total: {gated_out_n:,} ({_pct(gated_out_n)})\n")

        summary_lines.append("\n### Impact\n")
        summary_lines.append(
            f"- Impact: modified_kps={res.get('sites_adjusted'):,} / {res.get('rows'):,} "
            f"({(res.get('sites_adjusted', 0) / max(1, res.get('rows', 1))):.1%}), "
            f"modified_volume_share={format_pct(float(res.get('modified_volume_share', 0.0)))}, "
            f"sum_abs_delta/sum_pred={float(res.get('impact_ratio', float('nan'))):.4f}\n"
        )
        summary_lines.append("\n### Totals Preservation\n")
        summary_lines.append(
            f"- Overall total diff (Jun–Dec): {float(res.get('total_diff', float('nan'))):.6f}\n"
        )
        summary_lines.append(
            f"- Jun–Oct total diff: {float(res.get('jun_oct_total_diff', float('nan'))):.6f}\n"
        )
        summary_lines.append(
            f"- Max per-KP per-month abs diff: {float(res.get('max_per_kp_month_diff', float('nan'))):.6f}\n"
        )
        month_totals = res.get("month_totals", []) or []
        if month_totals:
            summary_lines.append("- Per-month diffs (after - before):\n")
            for m in month_totals:
                y = int(m.get("year"))
                mn = int(m.get("month"))
                diff = float(m.get("diff"))
                summary_lines.append(f"  - {y}-{mn:02d}: {diff:.6f}\n")

        summary_lines.append(
            f"- Gate params: alignment_threshold={hist.get('schedule_alignment_threshold')}, "
            f"daily_mode={hist.get('daily_mode')}\n"
        )

    summary_lines.append("\n## Files\n")
    summary_lines.append(f"- `reports/jury_spikeify_{run_date}/holdout_metrics.csv`\n")
    summary_lines.append(f"- `reports/jury_spikeify_{run_date}/regressions_top20.csv`\n")
    summary_lines.append(f"- `reports/jury_spikeify_{run_date}/district_regressions_top20.csv`\n")

    (outdir / "SUMMARY.md").write_text("".join(summary_lines), encoding="utf-8")

    repro_lines: List[str] = []
    repro_lines.append("# Repro\n\n")
    repro_lines.append("Run from `projects/forecastingrepo/`.\n\n")
    repro_lines.append("## 1) Holdout metrics + regressions\n\n")
    repro_lines.append(
        "```bash\n"
        f"python3.11 scripts/jury_spikeify_service_day_postprocess_report.py \\\n"
        f"  --run-date {run_date} \\\n"
        f"  --schedule-alignment-threshold {float(args.schedule_alignment_threshold):.2f}\n"
        "```\n\n"
    )
    repro_lines.append("## 2) Generate Jun–Dec spikeified wide forecast\n\n")
    repro_lines.append(
        "```bash\n"
        "python3.11 scripts/jury_spikeify_daily_forecast.py \\\n"
        "  --forecast-wide sent/forecast_jun_dec_2025_jury_format_daily.csv \\\n"
        "  --start 2025-06-01 \\\n"
        f"  --out /Users/m/git/clients/rtneo/_incoming/jury_spikeify_{run_date}/forecast_jun_dec_2025_jury_format_daily_spikeified.csv \\\n"
        f"  --stats-out reports/jury_spikeify_{run_date}/forecast_stats.json \\\n"
        f"  --schedule-alignment-threshold {float(args.schedule_alignment_threshold):.2f} \\\n"
        "  --daily-mode noop\n"
        "```\n\n"
    )
    repro_lines.append("## 3) Tests\n\n")
    repro_lines.append("```bash\npython3.11 -m pytest -q tests/sites/test_service_day_adjust.py\n```\n")

    (outdir / "REPRO.md").write_text("".join(repro_lines), encoding="utf-8")

    print(f"[OK] Wrote report artifacts under {outdir}")


if __name__ == "__main__":
    main()
