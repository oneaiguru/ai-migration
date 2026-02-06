#!/usr/bin/env python3
"""
Stream legacy site-level CSV reports into service history + registry inputs.

Outputs (default paths inside repo):
  - data/sites_service.csv    (site_id, service_dt, collect_volume_m3)
  - data/sites_registry.csv   (site_id, district, address, bin_count, bin_size_liters)

Data sources (pre-converted XLS → CSV drops stored under data/raw/jury_volumes/csv):
  - Отчет_по_объемам_с_01_01_2023_по_30_06_2023,_для_всех_участков_4.csv
    ...
  (See FILES mapping below for the exact set.)

We avoid pandas to keep memory usage low; rows are streamed and written directly.
"""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable, Sequence


REPO_ROOT = Path(__file__).resolve().parent.parent

META_COLUMNS = 14  # N п/п .. График вывоза (inclusive)
DEFAULT_BIN_COUNT = 1
DEFAULT_BIN_SIZE_LITERS = 750.0  # fallback when volume parsing fails


@dataclass(frozen=True)
class ReportFile:
    path: Path
    months: Sequence[tuple[int, int, int]]  # (year, month, days_in_month)


FILES: list[ReportFile] = [
    ReportFile(
        path=REPO_ROOT / "data/raw/jury_volumes/csv/Отчет_по_объемам_с_01_01_2023_по_30_06_2023,_для_всех_участков_4.csv",
        months=[(2023, 1, 31), (2023, 2, 28), (2023, 3, 31), (2023, 4, 30), (2023, 5, 31), (2023, 6, 30)],
    ),
    ReportFile(
        path=REPO_ROOT / "data/raw/jury_volumes/csv/Отчет_по_объемам_с_01_07_2023_по_31_12_2023,_для_всех_участков_2.csv",
        months=[(2023, 7, 31), (2023, 8, 31), (2023, 9, 30), (2023, 10, 31), (2023, 11, 30), (2023, 12, 31)],
    ),
    ReportFile(
        path=REPO_ROOT / "data/raw/jury_volumes/csv/Отчет_по_объемам_с_01_01_2024_по_30_06_2024,_для_всех_участков_1.csv",
        months=[(2024, 1, 31), (2024, 2, 29), (2024, 3, 31), (2024, 4, 30), (2024, 5, 31), (2024, 6, 30)],
    ),
    ReportFile(
        path=REPO_ROOT / "data/raw/jury_volumes/csv/Отчет_по_объемам_с_01_07_2024_по_31_12_2024,_для_всех_участков.csv",
        months=[(2024, 7, 31), (2024, 8, 31), (2024, 9, 30), (2024, 10, 31), (2024, 11, 30), (2024, 12, 31)],
    ),
]


def parse_float(value: str | float | int | None) -> float | None:
    if value is None:
        return None
    if isinstance(value, (float, int)):
        return float(value)
    text = value.strip()
    if not text:
        return None
    text = text.replace(" ", "").replace("\u00a0", "").replace(",", ".")
    try:
        return float(text)
    except ValueError:
        return None


def parse_first_number_cell(raw: str | None) -> float | None:
    if raw is None:
        return None
    first = raw.split("/")[0].strip()
    return parse_float(first)


def pad_row(row: list[str], target_len: int) -> list[str]:
    if len(row) >= target_len:
        return row
    return row + [""] * (target_len - len(row))


def stream_report_rows(file_cfg: ReportFile) -> Iterable[tuple[dict, list[str]]]:
    path = file_cfg.path
    if not path.exists():
        raise FileNotFoundError(path)
    with path.open("r", encoding="utf-8", errors="ignore") as fh:
        reader = csv.reader(fh, delimiter=";")
        header: list[str] | None = None
        for row in reader:
            if any(cell == "Код КП" for cell in row):
                header = row
                break
        if header is None:
            raise RuntimeError(f"Header row with 'Код КП' not found in {path}")

        # Precompute column spans for each month
        spans: list[tuple[int, int, int, int]] = []  # (year, month, start_idx, end_idx)
        start_idx = META_COLUMNS
        for year, month, days in file_cfg.months:
            spans.append((year, month, start_idx, start_idx + days))
            start_idx += days
        target_len = len(header)

        for row in reader:
            if not row or not "".join(row).strip():
                continue
            row = pad_row(row, target_len)
            meta = {
                "kp_id": row[4].strip(),
                "district": row[1].strip(),
                "site": row[2].strip(),
                "address": row[5].strip(),
                "bin_count_raw": row[10] if len(row) > 10 else "",
                "bin_size_raw": row[11] if len(row) > 11 else "",
            }
            if not meta["kp_id"]:
                continue
            yield meta, row, spans


def write_outputs(service_path: Path, registry_path: Path) -> tuple[int, int]:
    service_path.parent.mkdir(parents=True, exist_ok=True)
    registry_path.parent.mkdir(parents=True, exist_ok=True)

    registry_seen: dict[str, dict] = {}
    event_count = 0

    with service_path.open("w", newline="", encoding="utf-8") as service_f:
        service_writer = csv.writer(service_f)
        service_writer.writerow(["site_id", "service_dt", "collect_volume_m3"])

        for file_cfg in FILES:
            print(f"[convert] Processing {file_cfg.path.name}")
            for meta, row, spans in stream_report_rows(file_cfg):
                site_id = meta["kp_id"]
                if site_id not in registry_seen:
                    bin_count = parse_first_number_cell(meta["bin_count_raw"])
                    bin_count = int(bin_count) if bin_count and bin_count > 0 else DEFAULT_BIN_COUNT
                    bin_size_m3 = parse_first_number_cell(meta["bin_size_raw"])
                    if bin_size_m3 and bin_size_m3 > 0:
                        bin_size_liters = (bin_size_m3 * 1000.0) / max(bin_count, 1)
                    else:
                        bin_size_liters = DEFAULT_BIN_SIZE_LITERS
                    registry_seen[site_id] = {
                        "site_id": site_id,
                        "district": meta["district"],
                        "address": meta["address"],
                        "bin_count": bin_count,
                        "bin_size_liters": round(bin_size_liters, 2),
                    }

                for year, month, start, end in spans:
                    for day_offset, col_idx in enumerate(range(start, end), start=1):
                        if col_idx >= len(row):
                            continue
                        volume = parse_float(row[col_idx])
                        if volume is None or volume <= 0:
                            continue
                        try:
                            service_dt = datetime(year, month, day_offset).strftime("%Y-%m-%d")
                        except ValueError:
                            continue
                        service_writer.writerow([site_id, service_dt, f"{volume:.3f}"])
                        event_count += 1

    with registry_path.open("w", newline="", encoding="utf-8") as registry_f:
        fieldnames = ["site_id", "district", "address", "bin_count", "bin_size_liters"]
        writer = csv.DictWriter(registry_f, fieldnames=fieldnames)
        writer.writeheader()
        for record in registry_seen.values():
            writer.writerow(record)

    return event_count, len(registry_seen)


def main() -> None:
    parser = argparse.ArgumentParser(description="Build service + registry CSVs from legacy wide reports.")
    parser.add_argument("--services-out", default="data/sites_service.csv", help="Path to write service history CSV.")
    parser.add_argument("--registry-out", default="data/sites_registry.csv", help="Path to write registry CSV.")
    args = parser.parse_args()

    service_path = Path(args.services_out)
    registry_path = Path(args.registry_out)

    events, sites = write_outputs(service_path, registry_path)
    print(f"[convert] Wrote {events:,} service events covering {sites:,} sites.")
    print(f"[convert] Services → {service_path}")
    print(f"[convert] Registry → {registry_path}")


if __name__ == "__main__":
    main()
REPO_ROOT = Path(__file__).resolve().parent.parent
