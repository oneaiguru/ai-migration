from __future__ import annotations

import csv
import re
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Iterable, Optional, Tuple

import pandas as pd

DATE_FMT = "%Y-%m-%d"
HEADER_SITE = "Код КП"
FILENAME_DATE_RE = re.compile(r"(\d{4}-\d{2}-\d{2})")


def parse_period_from_filename(path: Path) -> Optional[Tuple[date, date]]:
    matches = FILENAME_DATE_RE.findall(path.name)
    if len(matches) >= 2:
        return date.fromisoformat(matches[0]), date.fromisoformat(matches[1])
    return None


def build_date_columns(start: date, end: date) -> list[date]:
    if end < start:
        raise ValueError("end must be on or after start")
    dates: list[date] = []
    current = start
    while current <= end:
        dates.append(current)
        current += timedelta(days=1)
    return dates


def parse_decimal(text: str) -> Optional[float]:
    raw = text.strip()
    if not raw or raw in {"-", "—"}:
        return None
    raw = raw.replace(" ", "").replace(",", ".")
    try:
        return float(raw)
    except ValueError:
        return None


def format_decimal(value: float) -> str:
    text = f"{value:.6f}".rstrip("0").rstrip(".")
    return text.replace(".", ",")


def _find_header(reader: Iterable[list[str]]) -> list[str]:
    for row in reader:
        if not row:
            continue
        first = row[0].strip().lstrip("\ufeff").strip('"')
        if first == HEADER_SITE:
            cleaned = [cell.strip() for cell in row]
            cleaned[0] = first
            return cleaned
    raise RuntimeError("Header row with 'Код КП' not found")


def read_wide_report(
    path: Path,
    start: Optional[date],
    end: Optional[date],
    value_col: str,
) -> pd.DataFrame:
    if start is None or end is None:
        period = parse_period_from_filename(path)
        if period:
            start, end = period
    if start is None or end is None:
        raise RuntimeError("Wide CSV needs --start/--end or dates in filename")

    dates = build_date_columns(start, end)

    records: list[dict] = []
    with path.open("r", encoding="utf-8") as fh:
        reader = csv.reader(fh, delimiter=";")
        header = _find_header(reader)
        header_days = header[1:]
        while header_days and not header_days[-1].strip():
            header_days.pop()
        if len(header_days) != len(dates):
            raise RuntimeError("Wide header day count does not match period")
        for idx, dt in enumerate(dates):
            day_text = header_days[idx].strip()
            if not day_text:
                raise RuntimeError("Wide header day sequence mismatch")
            try:
                day_value = int(day_text)
            except ValueError:
                raise RuntimeError("Wide header day sequence mismatch") from None
            if day_value != dt.day:
                raise RuntimeError("Wide header day sequence mismatch")

        for row in reader:
            if not row or not row[0].strip():
                continue
            site_id = row[0].strip()
            if len(row) < len(dates) + 1:
                row = row + [""] * (len(dates) + 1 - len(row))
            for col_idx, dt in enumerate(dates, start=1):
                val = parse_decimal(row[col_idx])
                if val is None:
                    continue
                records.append(
                    {
                        "site_id": site_id,
                        "date": dt.isoformat(),
                        value_col: val,
                    }
                )

    return pd.DataFrame.from_records(records, columns=["site_id", "date", value_col])


def write_wide_report(
    df: pd.DataFrame,
    output_path: Path,
    start: date,
    end: date,
    value_col: str,
    include_metadata: bool = False,
) -> None:
    dates = build_date_columns(start, end)
    date_to_idx = {dt: idx for idx, dt in enumerate(dates)}
    output_path.parent.mkdir(parents=True, exist_ok=True)

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(["site_id", "date"])

    with output_path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh, delimiter=";")
        if include_metadata:
            writer.writerow(["Отчет по объему вывезенных контейнеров"])
            writer.writerow([f"Период: {start:%d.%m.%Y} - {end:%d.%m.%Y}"])
        writer.writerow([HEADER_SITE, *[str(d.day) for d in dates]])

        current_site = None
        current_row = [""] * len(dates)
        for _, row in df.iterrows():
            site = str(row["site_id"])
            if current_site is None:
                current_site = site
            elif site != current_site:
                writer.writerow([current_site, *current_row])
                current_site = site
                current_row = [""] * len(dates)

            dt = row["date"].date()
            idx = date_to_idx.get(dt)
            if idx is None:
                continue
            try:
                val = float(row[value_col])
            except Exception:
                continue
            if pd.isna(val):
                continue
            current_row[idx] = format_decimal(val)

        if current_site is not None:
            writer.writerow([current_site, *current_row])
