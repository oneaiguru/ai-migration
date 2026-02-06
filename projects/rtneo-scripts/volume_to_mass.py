#!/usr/bin/env python3
from __future__ import annotations

"""
Convert per-site daily volume (m^3) to mass (kg) using district-level monthly density
derived from monthly waste tonnes (by district) and summed site volumes.

Inputs:
  - --volume-csv: CSV with columns [site_id,district,service_dt,collect_volume_m3]
  - --district-monthly: CSV with columns [year_month,district,waste_tonnes]
  - --year-month: target month in YYYY-MM
  - --out: output CSV path [site_id,service_dt,collect_mass_kg]

Notes:
  - Density per district-month: tonnes_per_m3 = waste_tonnes / sum(volume_m3)
  - Output mass_kg = volume_m3 * tonnes_per_m3 * 1000
  - Rows with missing district or zero volume are skipped.
"""

import argparse
import csv
from collections import defaultdict
from pathlib import Path


def read_monthly_tonnes(path: Path, ym: str) -> dict[str, float]:
    out: dict[str, float] = {}
    with path.open(encoding="utf-8") as f:
        r = csv.DictReader(f)
        for rec in r:
            if (rec.get("year_month") or rec.get("year-month") or "").strip() != ym:
                continue
            d = (rec.get("district") or "").strip()
            if not d:
                continue
            try:
                t = float(rec.get("waste_tonnes") or 0.0)
            except Exception:
                t = 0.0
            out[d] = out.get(d, 0.0) + t
    return out


def read_site_volumes(path: Path, ym: str) -> list[dict]:
    rows: list[dict] = []
    with path.open(encoding="utf-8") as f:
        r = csv.DictReader(f)
        for rec in r:
            dt = (rec.get("service_dt") or "").strip()
            if not dt.startswith(ym):
                continue
            d = (rec.get("district") or "").strip()
            sid = (rec.get("site_id") or "").strip()
            try:
                v = float(rec.get("collect_volume_m3") or 0.0)
            except Exception:
                v = 0.0
            rows.append({"site_id": sid, "district": d, "service_dt": dt, "volume_m3": v})
    return rows


def main(argv: list[str] | None = None) -> None:
    ap = argparse.ArgumentParser(description="Convert per-site daily volume (m^3) to mass (kg) using district monthly density")
    ap.add_argument("--volume-csv", required=True)
    ap.add_argument("--district-monthly", required=True)
    ap.add_argument("--year-month", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args(argv)

    ym = args.year_month
    vol_rows = read_site_volumes(Path(args.volume_csv), ym)
    tonnes_by_district = read_monthly_tonnes(Path(args.district_monthly), ym)

    vol_by_district: dict[str, float] = defaultdict(float)
    for r in vol_rows:
        if r["district"]:
            vol_by_district[r["district"]] += max(0.0, r["volume_m3"])  # guard negatives

    # Compute density tonnes per m^3 per district
    density_t_per_m3: dict[str, float] = {}
    for d, tonnes in tonnes_by_district.items():
        v = vol_by_district.get(d, 0.0)
        if v > 0:
            density_t_per_m3[d] = tonnes / v

    # Write site mass csv
    outp = Path(args.out)
    outp.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    with outp.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id", "service_dt", "collect_mass_kg"])  # kg
        for r in vol_rows:
            d = r["district"]
            v = r["volume_m3"]
            if not d or v is None:
                continue
            dens = density_t_per_m3.get(d)
            if dens is None:
                continue
            mass_kg = v * dens * 1000.0
            w.writerow([r["site_id"], r["service_dt"], f"{mass_kg:.6f}"])
            written += 1
    print(f"[OK] Wrote {written} rows to {outp}")


if __name__ == "__main__":  # pragma: no cover
    main()
