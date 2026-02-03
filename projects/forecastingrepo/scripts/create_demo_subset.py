#!/usr/bin/env python3
"""Generate slim CSV slices for the MyTKO demo UI."""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import shutil
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Tuple


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sites", nargs="+", required=True, help="Site IDs to keep (e.g., 38105070)")
    parser.add_argument("--history", required=True, help="Path to containers_long.csv with actual volumes")
    parser.add_argument("--forecast", required=True, help="Path to forecast CSV slice (daily_fill_*.csv)")
    parser.add_argument("--start", required=True, help="Start date YYYY-MM-DD (inclusive)")
    parser.add_argument("--end", required=True, help="End date YYYY-MM-DD (inclusive)")
    parser.add_argument("--out-dir", required=True, help="Output directory (e.g., ui/mytko-forecast-demo/public/demo_data)")
    parser.add_argument(
        "--vehicle-volume",
        type=float,
        default=22.0,
        help="Vehicle capacity in m^3 used to convert fill_pct into forecast volume (default: 22)",
    )
    parser.add_argument(
        "--site-forecast-dir",
        help="Optional directory with per-site forecast CSVs (e.g., artifacts/viz) to copy into the demo bundle",
    )
    return parser.parse_args()


def _iso(date_str: str) -> dt.date:
    return dt.date.fromisoformat(date_str)


def daterange(start: dt.date, end: dt.date) -> Iterable[dt.date]:
    cur = start
    while cur <= end:
        yield cur
        cur += dt.timedelta(days=1)


def read_history(path: Path, site_ids: set[str], start: dt.date, end: dt.date) -> Tuple[Dict[Tuple[str, dt.date], float], Dict[str, dt.date]]:
    lookup: Dict[Tuple[str, dt.date], float] = defaultdict(float)
    last_service: Dict[str, dt.date] = {}
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            site = (row.get("kp_id") or row.get("site_id") or "").strip()
            if site not in site_ids:
                continue
            date_field = (row.get("date") or "").strip()
            if not date_field:
                continue
            try:
                row_date = _iso(date_field)
            except ValueError:
                continue
            if row_date < start or row_date > end:
                continue
            volume_val = row.get("volume_m3") or row.get("actual_m3") or "0"
            try:
                volume = float(str(volume_val).replace(",", "."))
            except ValueError:
                volume = 0.0
            if volume <= 0:
                continue
            lookup[(site, row_date)] += volume
            prev_dt = last_service.get(site)
            if prev_dt is None or row_date > prev_dt:
                last_service[site] = row_date
    return lookup, last_service


def read_forecast(path: Path, site_ids: set[str], start: dt.date, end: dt.date, vehicle_volume: float) -> Dict[Tuple[str, dt.date], Dict[str, float]]:
    forecast: Dict[Tuple[str, dt.date], Dict[str, float]] = {}
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            site = (row.get("site_id") or row.get("kp_id") or row.get("level") or "").strip()
            if row.get("level") == "site" and row.get("site_id"):
                site = row["site_id"].strip()
            if site not in site_ids:
                continue
            date_field = (row.get("date") or "").strip()
            if not date_field:
                continue
            try:
                row_date = _iso(date_field)
            except ValueError:
                continue
            if row_date < start or row_date > end:
                continue
            fill_pct_raw = row.get("fill_pct") or row.get("fillPercent") or ""
            overflow_raw = row.get("overflow_prob") or row.get("overflowProbability") or ""
            pred_mass_raw = row.get("pred_volume_m3") or ""
            fill_pct = _safe_float(fill_pct_raw)
            overflow_prob = _safe_float(overflow_raw)
            pred_mass = _safe_float(pred_mass_raw)
            forecast_m3 = None
            if pred_mass is not None:
                forecast_m3 = pred_mass
            elif fill_pct is not None:
                forecast_m3 = fill_pct * vehicle_volume
            forecast[(site, row_date)] = {
                "fill_pct": fill_pct if fill_pct is not None else "",
                "overflow_prob": overflow_prob if overflow_prob is not None else "",
                "forecast_m3": forecast_m3 if forecast_m3 is not None else "",
            }
    return forecast


def _safe_float(value) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(str(value).replace(",", "."))
    except ValueError:
        return None


def write_summary(
    out_path: Path,
    site_ids: List[str],
    start: dt.date,
    end: dt.date,
    history_lookup: Dict[Tuple[str, dt.date], float],
    last_service: Dict[str, dt.date],
    forecast_lookup: Dict[Tuple[str, dt.date], Dict[str, float]],
):
    fieldnames = [
        "site_id",
        "date",
        "actual_m3",
        "forecast_m3",
        "fill_pct",
        "overflow_prob",
        "is_collection",
        "last_service_dt",
    ]
    with out_path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        for site in site_ids:
            last_dt = last_service.get(site)
            for day in daterange(start, end):
                key = (site, day)
                actual = history_lookup.get(key, 0.0)
                forecast = forecast_lookup.get(key, {})
                writer.writerow(
                    {
                        "site_id": site,
                        "date": day.isoformat(),
                        "actual_m3": f"{actual:.3f}",
                        "forecast_m3": _format_optional(forecast.get("forecast_m3")),
                        "fill_pct": _format_optional(forecast.get("fill_pct")),
                        "overflow_prob": _format_optional(forecast.get("overflow_prob")),
                        "is_collection": "1" if actual > 0 else "0",
                        "last_service_dt": last_dt.isoformat() if last_dt else "",
                    }
                )


def _format_optional(value) -> str:
    if value in (None, ""):
        return ""
    if isinstance(value, str):
        return value
    return f"{float(value):.6f}".rstrip("0").rstrip(".")


def copy_site_forecasts(site_ids: Iterable[str], source_dir: Path | None, dest_dir: Path):
    if not source_dir or not source_dir.exists():
        return
    for site in site_ids:
        pattern = f"site_{site}_forecast"
        for candidate in sorted(source_dir.glob(f"site_{site}_forecast*.csv")):
            target = dest_dir / candidate.name
            shutil.copyfile(candidate, target)
            break


def main() -> None:
    args = parse_args()
    site_ids = sorted(set(args.sites))
    if not site_ids:
        raise SystemExit("--sites must include at least one site id")
    start = _iso(args.start)
    end = _iso(args.end)
    if start > end:
        raise SystemExit("--start must be <= --end")
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    history_lookup, last_service = read_history(Path(args.history), set(site_ids), start, end)
    forecast_lookup = read_forecast(Path(args.forecast), set(site_ids), start, end, args.vehicle_volume)
    summary_path = out_dir / "containers_summary.csv"
    write_summary(summary_path, site_ids, start, end, history_lookup, last_service, forecast_lookup)
    if args.site_forecast_dir:
        copy_site_forecasts(site_ids, Path(args.site_forecast_dir), out_dir)
    print(f"Wrote summary to {summary_path}")


if __name__ == "__main__":
    main()
