#!/usr/bin/env python3
"""
Generate a site-level forecast CSV for a given evaluation window using service history.

The script reads `sites_service.csv` (flattened volume report) and `sites_registry.csv`
to compute weekday rates (m3/day) for each site based on the 56-day window preceding
`--train-until`, then simulates fill trajectories for the requested date window.

Output format matches the pipeline's daily_fill CSV:
level,site_id,date,fill_pct,pred_volume_m3,overflow_prob
"""
from __future__ import annotations

import argparse
import csv
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, Iterable, Tuple


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create site-level forecast CSV from service history.")
    parser.add_argument("--services", required=True, help="Path to data/sites/sites_service.csv")
    parser.add_argument("--registry", required=True, help="Path to data/sites/sites_registry.csv")
    parser.add_argument("--train-until", required=True, help="Cutoff date (YYYY-MM-DD)")
    parser.add_argument("--start", required=True, help="Forecast start date (YYYY-MM-DD)")
    parser.add_argument("--end", required=True, help="Forecast end date (YYYY-MM-DD)")
    parser.add_argument("--out", required=True, help="Output CSV path")
    parser.add_argument("--window-days", type=int, default=56, help="Training window length (default 56)")
    parser.add_argument("--overflow-threshold", type=float, default=0.8, help="Overflow threshold as fill pct (default 0.8)")
    parser.add_argument("--default-capacity", type=float, default=1100.0, help="Fallback capacity in liters per site (default 1100)")
    return parser.parse_args()


def daterange(start: date, end: date) -> Iterable[date]:
    days = (end - start).days
    for i in range(days + 1):
        yield start + timedelta(days=i)


def read_registry(path: Path, default_capacity: float) -> Dict[str, float]:
    capacities: Dict[str, float] = {}
    with path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for rec in reader:
            site_id = rec.get("site_id")
            if not site_id:
                continue
            try:
                bin_count = float(rec.get("bin_count") or 1.0)
            except Exception:
                bin_count = 1.0
            try:
                bin_size = float(rec.get("bin_size_liters") or default_capacity)
            except Exception:
                bin_size = default_capacity
            capacities[site_id] = max(1.0, bin_count) * max(1.0, bin_size)
    return capacities


def read_service_window(path: Path, window_start: date, cutoff: date) -> Dict[str, Dict[date, float]]:
    site_day_volume: Dict[str, Dict[date, float]] = defaultdict(lambda: defaultdict(float))
    with path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for rec in reader:
            dt_str = rec.get("service_dt")
            if not dt_str:
                continue
            dt = datetime.strptime(dt_str, "%Y-%m-%d").date()
            if dt < window_start or dt > cutoff:
                continue
            site_id = rec.get("site_id")
            if not site_id:
                continue
            try:
                volume = float(rec.get("collect_volume_m3") or 0.0)
            except Exception:
                volume = 0.0
            if volume <= 0:
                continue
            site_day_volume[site_id][dt] += volume
    return site_day_volume


def estimate_weekday_rates(
    site_day_mass: Dict[str, Dict[date, float]],
    window_start: date,
    cutoff: date,
) -> Tuple[Dict[Tuple[str, int], float], Dict[str, float]]:
    weekday_sum: Dict[Tuple[str, int], float] = defaultdict(float)
    weekday_count: Dict[Tuple[str, int], int] = defaultdict(int)
    overall_rates: Dict[str, list[float]] = defaultdict(list)
    for site_id, day_mass in site_day_mass.items():
        if not day_mass:
            continue
        days_sorted = sorted(day_mass.keys())
        prev_dt: date | None = None
        for dt in days_sorted:
            volume = day_mass[dt]
            if prev_dt is None:
                gap = max(1, min(7, (dt - window_start).days if dt > window_start else 7))
                rate = volume / float(gap)
                overall_rates[site_id].append(rate)
                for offset in range(gap, 0, -1):
                    d = dt - timedelta(days=offset)
                    if d < window_start:
                        continue
                    weekday_sum[(site_id, d.weekday())] += rate
                    weekday_count[(site_id, d.weekday())] += 1
                prev_dt = dt
                continue

            delta = (dt - prev_dt).days
            if delta <= 0:
                prev_dt = dt
                continue
            rate = volume / float(delta)
            overall_rates[site_id].append(rate)
            for i in range(1, delta + 1):
                d = prev_dt + timedelta(days=i)
                if d > cutoff:
                    break
                weekday_sum[(site_id, d.weekday())] += rate
                weekday_count[(site_id, d.weekday())] += 1
            prev_dt = dt

    weekday_rates: Dict[Tuple[str, int], float] = {}
    overall_mean: Dict[str, float] = {}
    for site_id, rates in overall_rates.items():
        if rates:
            overall_mean[site_id] = sum(rates) / len(rates)

    for key, total in weekday_sum.items():
        site_id, weekday = key
        cnt = weekday_count[key]
        mean = overall_mean.get(site_id, 0.0)
        if cnt >= 1:
            weekday_rates[key] = total / cnt if cnt else mean
        else:
            weekday_rates[key] = mean
    return weekday_rates, overall_mean


def simulate_forecast(
    capacities: Dict[str, float],
    weekday_rates: Dict[Tuple[str, int], float],
    overall_mean: Dict[str, float],
    start: date,
    end: date,
    overflow_threshold: float,
) -> Iterable[Tuple[str, str, float, float, int]]:
    dates = list(daterange(start, end))
    output_rows = []
    site_ids = set(site for site, _ in weekday_rates.keys())
    site_ids.update(overall_mean.keys())
    for site_id in site_ids:
        cap_l = capacities.get(site_id, capacities.get("__default__", 1100.0))
        cap_m3 = cap_l / 1000.0 if cap_l > 0 else 0.0
        fill_m3 = 0.0
        for d in dates:
            rate = weekday_rates.get((site_id, d.weekday()), overall_mean.get(site_id, 0.0))
            fill_m3 = max(0.0, fill_m3 + rate)
            fill_pct = 0.0 if cap_m3 <= 0 else min(1.0, fill_m3 / cap_m3)
            overflow = 1 if fill_pct >= overflow_threshold else 0
            output_rows.append(
                (
                    "site",
                    site_id,
                    d.isoformat(),
                    min(fill_pct, 1.5),  # guard against unrealistic >150 p2 for output readability
                    fill_m3,
                    overflow,
                )
            )
    return output_rows


def main() -> None:
    args = parse_args()
    services_path = Path(args.services)
    registry_path = Path(args.registry)
    out_path = Path(args.out)
    train_until = datetime.strptime(args.train_until, "%Y-%m-%d").date()
    start_dt = datetime.strptime(args.start, "%Y-%m-%d").date()
    end_dt = datetime.strptime(args.end, "%Y-%m-%d").date()
    window_start = train_until - timedelta(days=args.window_days - 1)

    out_path.parent.mkdir(parents=True, exist_ok=True)

    capacities = read_registry(registry_path, args.default_capacity)
    window_data = read_service_window(services_path, window_start, train_until)
    weekday_rates, overall_mean = estimate_weekday_rates(window_data, window_start, train_until)
    capacities["__default__"] = args.default_capacity

    rows = simulate_forecast(
        capacities,
        weekday_rates,
        overall_mean,
        start_dt,
        end_dt,
        args.overflow_threshold,
    )

    with out_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["level", "site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])
        for level, site_id, d, fill_pct, volume, overflow in rows:
            writer.writerow([level, site_id, d, f"{fill_pct:.6f}", f"{volume:.6f}", overflow])

    print(f"[OK] Wrote {len(rows)} forecast rows to {out_path}")


if __name__ == "__main__":
    main()
