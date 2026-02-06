#!/usr/bin/env python3
import json
import re
from datetime import datetime, date
from pathlib import Path

import pandas as pd


def date_range_from_filename(path: Path):
    """Parse dates or years from file name."""
    text = path.name
    date_pat = re.compile(r"(\d{2}[.\-/]\d{2}[.\-/]\d{4})")
    matches = []
    for m in date_pat.findall(text):
        for fmt in ("%d.%m.%Y", "%d-%m-%Y", "%d/%m/%Y"):
            try:
                matches.append(datetime.strptime(m, fmt).date())
                break
            except ValueError:
                continue
    if matches:
        return min(matches), max(matches)

    years = [int(y) for y in re.findall(r"20\d{2}", text)]
    if years:
        return date(min(years), 1, 1), date(max(years), 12, 31)

    return None


def find_header_row(raw_df):
    for idx, row in raw_df.iterrows():
        if row.astype(str).str.contains("Дата", na=False).any():
            return idx
    return None


def content_date_range(path: Path):
    """Extract min/max dates from date column containing 'Дата'."""
    try:
        raw = pd.read_excel(path, header=None)
    except Exception as exc:
        return None, f"read failed: {exc}"

    header_row = find_header_row(raw)
    if header_row is None:
        return None, "date header not found"

    try:
        df = pd.read_excel(path, header=header_row)
    except Exception as exc:
        return None, f"data read failed: {exc}"

    date_col = next((c for c in df.columns if isinstance(c, str) and "Дата" in c), None)
    if date_col is None:
        return None, "date column missing"

    dates = pd.to_datetime(df[date_col], errors="coerce", dayfirst=True).dropna()
    if dates.empty:
        return None, "no parseable dates"

    return (dates.min().date(), dates.max().date()), None


def coverage_status(found_range, need_start, need_end):
    if not found_range:
        return "none"
    if isinstance(found_range, date):
        f_start = f_end = found_range
    else:
        f_start, f_end = found_range
    if f_start <= need_start and f_end >= need_end:
        return "covers"
    if f_end < need_start or f_start > need_end:
        return "none"
    return "partial"


def main():
    root = Path(".")
    entries = []
    for path in sorted(root.rglob("*.xlsx")):
        if any(part.startswith(".") for part in path.parts):
            continue
        file_range = date_range_from_filename(path)
        content_range, err = content_date_range(path)
        entries.append(
            {
                "path": str(path),
                "filename_range": file_range,
                "content_range": content_range,
                "error": err if content_range is None else None,
            }
        )

    requirements = [
        {"label": "2023 H1", "start": date(2023, 1, 1), "end": date(2023, 6, 30)},
        {"label": "2023 H2", "start": date(2023, 7, 1), "end": date(2023, 12, 31)},
        {"label": "2023 full year", "start": date(2023, 1, 1), "end": date(2023, 12, 31)},
        {"label": "2024 H1", "start": date(2024, 1, 1), "end": date(2024, 6, 30)},
        {"label": "2024 H2", "start": date(2024, 7, 1), "end": date(2024, 12, 31)},
        {"label": "2024 full year", "start": date(2024, 1, 1), "end": date(2024, 12, 31)},
    ]

    summary = {}
    for req in requirements:
        coverage = []
        for e in entries:
            status = coverage_status(e["content_range"], req["start"], req["end"])
            if status != "none":
                coverage.append({"path": e["path"], "status": status, "content_range": e["content_range"]})
        summary[req["label"]] = coverage

    def json_default(obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return str(obj)

    output = {"files": entries, "requirements": requirements, "coverage": summary}
    print(json.dumps(output, indent=2, ensure_ascii=False, default=json_default))


if __name__ == "__main__":
    main()
