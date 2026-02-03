#!/usr/bin/env python3
# allow-large-file:T-SITES-003 (bounded refactor planned post-demo)
"""
Streaming parser and baseline forecaster for the supplied XLSX report

Inputs:
  - data/raw/jury_volumes/xlsx/Отчет_по_объемам_с_01_07_2024_по_31_12_2024,_для_всех_участков.xlsx

Outputs:
  - data/daily_waste_by_district.csv           (date,district,actual_m3)
  - data/monthly_waste_by_district.csv         (year_month,district,actual_m3)
  - data/monthly_waste_region.csv              (year_month,region_actual_m3)
  - forecasts/daily_forecast_30d.csv           (date,forecast_m3)
  - forecasts/monthly_forecast_3m.csv          (year_month,forecast_m3)

Notes:
  - The sheet encodes multiple blocks of day-of-month columns (1..31) for each month in the report period.
  - This script allocates each row's total "Вес, тонн" over the period proportionally to the values in day-of-month cells.
    If all day-of-month cells are empty/zero, it distributes evenly by day across the period.
  - The allocation is simple and avoids assuming whether day-of-month cells are counts or m3 — it uses them as weights.
  - Forecasts are baseline only: daily 30-day (weekly seasonal naive) and monthly 3-month (mean of last 3 months).
"""

import argparse
import csv
import hashlib
import json
import re
import sys
import os
import subprocess
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import List, Tuple, Dict, Optional


REPO_ROOT = Path(__file__).resolve().parent.parent
# Default sample filename (used if no CLI args provided)
XLSX_FILENAME = str(
    REPO_ROOT / "data/raw/jury_volumes/xlsx/Отчет_по_объемам_с_01_07_2024_по_31_12_2024,_для_всех_участков.xlsx"
)


NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}


def col_letters_to_index(letters: str) -> int:
    idx = 0
    for ch in letters:
        if 'A' <= ch <= 'Z':
            idx = idx * 26 + (ord(ch) - ord('A') + 1)
    return idx


def index_to_col_letters(idx: int) -> str:
    letters = []
    while idx > 0:
        idx, rem = divmod(idx - 1, 26)
        letters.append(chr(rem + ord('A')))
    return ''.join(reversed(letters))


def parse_shared_strings(z: zipfile.ZipFile):
    shared_strings = []
    if 'xl/sharedStrings.xml' not in z.namelist():
        return shared_strings
    root = ET.fromstring(z.read('xl/sharedStrings.xml'))
    for si in root.findall('m:si', NS):
        t = si.find('m:t', NS)
        if t is not None:
            shared_strings.append(t.text or '')
        else:
            texts = []
            for r in si.findall('m:r', NS):
                rt = r.find('m:t', NS)
                if rt is not None:
                    texts.append(rt.text or '')
            shared_strings.append(''.join(texts))
    return shared_strings


def read_cell_value(c, shared_strings):
    t = c.attrib.get('t')
    v = c.find('m:v', NS)
    if t == 'inlineStr':
        is_el = c.find('m:is', NS)
        if is_el is not None:
            t_el = is_el.find('m:t', NS)
            if t_el is not None:
                return t_el.text
        return None
    if v is None:
        return None
    text = v.text
    if t == 's':
        try:
            return shared_strings[int(text)]
        except Exception:
            return text
    return text


def detect_period(z: zipfile.ZipFile) -> tuple[date, date]:
    """Scan early rows for a string like 'Период: dd.mm.yyyy - dd.mm.yyyy'"""
    sheet_path = 'xl/worksheets/sheet2.xml'
    period_from = None
    period_to = None
    shared_strings = parse_shared_strings(z)
    with z.open(sheet_path) as f:
        for event, elem in ET.iterparse(f, events=("end",)):
            if elem.tag.endswith('row'):
                values = []
                for c in elem.findall('m:c', NS):
                    val = read_cell_value(c, shared_strings)
                    if val:
                        values.append(val)
                text = " ".join(values)
                m = re.search(r"Период:\s*(\d{2}\.\d{2}\.\d{4})\s*-\s*(\d{2}\.\d{2}\.\d{4})", text)
                if m:
                    try:
                        d1 = datetime.strptime(m.group(1), "%d.%m.%Y").date()
                        d2 = datetime.strptime(m.group(2), "%d.%m.%Y").date()
                        period_from, period_to = d1, d2
                    except ValueError:
                        pass
                if period_from and period_to:
                    break
                elem.clear()
    if not (period_from and period_to):
        raise RuntimeError("Could not detect report period from sheet")
    return period_from, period_to


def month_iter(start: date, end: date):
    # inclusive month iteration
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
    first = date(y, m, 1)
    return (next_month - first).days


def build_day_column_mapping(header_cells: dict[int, str], start: date, end: date) -> list[tuple[date, int]]:
    """Return list of (actual_date, column_index) for each day in the period.
    Consumes exactly the number of headers equal to the days in each month (30 or 31),
    in the sequence from start..end.
    """
    # Collect numeric header columns in increasing column index order
    numeric_cols = [(idx, header_cells[idx]) for idx in sorted(header_cells.keys())
                    if header_cells[idx] and header_cells[idx].strip().isdigit()]
    it_index = 0
    mapping: list[tuple[date, int]] = []
    for y, m in month_iter(start, end):
        dim = days_in_month(y, m)
        # Consume exactly 'dim' headers for this month
        month_headers = numeric_cols[it_index: it_index + dim]
        if len(month_headers) < dim:
            raise RuntimeError(f"Not enough day-of-month columns for {y}-{m:02d}")
        it_index += dim
        # Map day 1..dim
        for d in range(1, dim + 1):
            col_idx, label = month_headers[d - 1]
            mapping.append((date(y, m, d), col_idx))
    return mapping


def parse_header_row(z: zipfile.ZipFile) -> tuple[int, dict[int, str]]:
    """Detect the header row (contains several known labels) and return (rownum, {col_index: header_text})."""
    sheet_path = 'xl/worksheets/sheet2.xml'
    shared_strings = parse_shared_strings(z)
    target_labels = {"Район", "Участок", "Код КП", "Адрес", "Контрагент",
                     "Количество", "Объём", "График вывоза", "Тип отходов",
                     "Лот", "Итого, м3", "Вес, тонн"}
    with z.open(sheet_path) as f:
        for event, elem in ET.iterparse(f, events=("end",)):
            if elem.tag.endswith('row'):
                header = {}
                for c in elem.findall('m:c', NS):
                    r = c.attrib.get('r', '')
                    col_letters = ''.join([ch for ch in r if ch.isalpha()])
                    idx = col_letters_to_index(col_letters)
                    header[idx] = read_cell_value(c, shared_strings)
                # Count how many known labels present
                present = sum(1 for v in header.values() if v in target_labels or (v and v.strip().isdigit()))
                if present >= 10:  # likely the header row with day numbers
                    try:
                        rownum = int(elem.attrib.get('r', '0'))
                    except Exception:
                        rownum = None
                    return rownum or 0, header
                elem.clear()
    raise RuntimeError("Header row not found")


def to_float(x):
    if x is None:
        return None
    try:
        return float(str(x).replace(',', '.'))
    except Exception:
        return None


def parse_rows_to_daily(z: zipfile.ZipFile, period_from: date, period_to: date) -> dict[tuple[date, str], float]:
    """Parse the sheet and allocate per-row period weight to daily per-date values per district.
    Returns dict keyed by (date, district) -> tonnes.
    """
    sheet_path = 'xl/worksheets/sheet2.xml'
    shared_strings = parse_shared_strings(z)

    header_rownum, header_cells = parse_header_row(z)
    # Build day-of-month mapping in order of columns
    day_col_map = build_day_column_mapping(header_cells, period_from, period_to)

    # Identify key column indexes
    name_to_col = {v: k for k, v in header_cells.items() if v}
    col_district = name_to_col.get('Район')
    # col_site intentionally unused; preserved for future site-level extensions
    col_total_tonnes = name_to_col.get('Вес, тонн')

    # Prepare aggregation
    daily_by_district: dict[tuple[date, str], float] = defaultdict(float)

    with z.open(sheet_path) as f:
        for event, elem in ET.iterparse(f, events=("end",)):
            if elem.tag.endswith('row'):
                rnum = int(elem.attrib.get('r', '0'))
                if rnum <= header_rownum:
                    elem.clear()
                    continue
                row = {}
                for c in elem.findall('m:c', NS):
                    r = c.attrib.get('r', '')
                    col_letters = ''.join([ch for ch in r if ch.isalpha()])
                    idx = col_letters_to_index(col_letters)
                    val = read_cell_value(c, shared_strings)
                    row[idx] = val
                if not row:
                    elem.clear()
                    continue
                # Extract fields
                district = (row.get(col_district) or '').strip()
                if not district:
                    elem.clear()
                    continue
                total_tonnes = to_float(row.get(col_total_tonnes)) or 0.0

                # Collect weights from all day columns
                weights = []  # list of (date, weight_value)
                for d, col_idx in day_col_map:
                    v = row.get(col_idx)
                    vv = to_float(v)
                    if vv is None:
                        vv = 0.0
                    weights.append((d, vv))
                sum_w = sum(w for _, w in weights)

                if total_tonnes <= 0.0:
                    # Nothing to allocate for this row
                    elem.clear()
                    continue

                if sum_w > 0:
                    # Proportional allocation
                    for d, w in weights:
                        if w > 0:
                            daily_by_district[(d, district)] += total_tonnes * (w / sum_w)
                else:
                    # Even allocation across all days in the period
                    num_days = (period_to - period_from).days + 1
                    even = total_tonnes / num_days
                    for d, _ in weights:
                        daily_by_district[(d, district)] += even

                elem.clear()

    return daily_by_district


def ensure_dirs():
    os.makedirs('data', exist_ok=True)
    os.makedirs('forecasts', exist_ok=True)


def write_daily_csv(daily_by_district: dict[tuple[date, str], float]):
    path = 'data/daily_waste_by_district.csv'
    with open(path, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['date', 'district', 'actual_m3'])
        for (d, district), tonnes in sorted(daily_by_district.items()):
            w.writerow([d.isoformat(), district, f"{tonnes:.6f}"])
    return path


def aggregate_monthly(daily_by_district: dict[tuple[date, str], float]):
    monthly_by_district: dict[tuple[str, str], float] = defaultdict(float)
    monthly_region: dict[str, float] = defaultdict(float)
    for (d, district), tonnes in daily_by_district.items():
        ym = f"{d.year}-{d.month:02d}"
        monthly_by_district[(ym, district)] += tonnes
        monthly_region[ym] += tonnes
    # Write district-level
    path1 = 'data/monthly_waste_by_district.csv'
    with open(path1, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['year_month', 'district', 'actual_m3'])
        for (ym, district), tonnes in sorted(monthly_by_district.items()):
            w.writerow([ym, district, f"{tonnes:.6f}"])
    # Write region-level aggregate
    path2 = 'data/monthly_waste_region.csv'
    with open(path2, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['year_month', 'region_actual_m3'])
        for ym in sorted(monthly_region.keys()):
            w.writerow([ym, f"{monthly_region[ym]:.6f}"])
    return path1, path2, monthly_region


def forecast_daily_naive(daily_by_district: dict[tuple[date, str], float]):
    # Build region-level daily series
    by_date = defaultdict(float)
    for (d, district), tonnes in daily_by_district.items():
        by_date[d] += tonnes
    if not by_date:
        raise RuntimeError("No daily data to forecast")
    last_date = max(by_date.keys())
    # Compute weekday averages over last 4 weeks (28 days)
    start_window = last_date - timedelta(days=27)
    weekday_values = defaultdict(list)  # weekday 0..6 -> list of values
    for i in range(28):
        dt = start_window + timedelta(days=i)
        if dt in by_date:
            weekday_values[dt.weekday()].append(by_date[dt])
    weekday_avg = {}
    overall_avg = sum(by_date.values()) / len(by_date)
    for wd in range(7):
        vals = weekday_values.get(wd, [])
        weekday_avg[wd] = (sum(vals) / len(vals)) if vals else overall_avg

    # Forecast next 30 days
    forecasts = []
    for i in range(1, 30 + 1):
        dt = last_date + timedelta(days=i)
        yhat = weekday_avg[dt.weekday()]
        forecasts.append((dt.isoformat(), yhat))

    # Write CSV
    path = 'forecasts/daily_forecast_30d.csv'
    with open(path, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['date', 'forecast_m3'])
        for dt_str, yhat in forecasts:
            w.writerow([dt_str, f"{yhat:.6f}"])
    return path


def forecast_monthly_naive(monthly_region: dict[str, float]):
    # Sort months chronologically
    def ym_key(ym: str):
        y, m = ym.split('-')
        return int(y) * 12 + int(m)

    months = sorted(monthly_region.keys(), key=ym_key)
    if not months:
        raise RuntimeError("No monthly data to forecast")
    # Use last 3 months average
    last3 = months[-3:] if len(months) >= 3 else months
    avg = sum(monthly_region[m] for m in last3) / len(last3)

    # Next 3 months after last observed
    last_ym = months[-1]
    last_y, last_m = map(int, last_ym.split('-'))
    forecasts = []
    y, m = last_y, last_m
    for _ in range(3):
        if m == 12:
            y += 1
            m = 1
        else:
            m += 1
        forecasts.append((f"{y}-{m:02d}", avg))

    path = 'forecasts/monthly_forecast_3m.csv'
    with open(path, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['year_month', 'forecast_m3'])
        for ym, yhat in forecasts:
            w.writerow([ym, f"{yhat:.6f}"])
    return path


def main():
    parser = argparse.ArgumentParser(description="RTNEO Phase-0 forecasting and ingestion utility")
    subparsers = parser.add_subparsers(dest="command")

    # Subcommand: ingest (original behavior to parse XLSX)
    p_ingest = subparsers.add_parser("ingest", help="Parse XLSX and build 2024 aggregates")
    p_ingest.add_argument("xlsx", nargs='*', help="XLSX report files to parse and combine")

    # Subcommand: forecast (Phase-0 CLI wrapper)
    p_fore = subparsers.add_parser("forecast", help="Phase-0: Forecast via aggregated CSVs")
    p_fore.add_argument("--train-until", required=True, help="Cutoff date YYYY-MM-DD (inclusive)")
    p_fore.add_argument("--daily-window", action="append", default=[], help="YYYY-MM-DD:YYYY-MM-DD (repeatable)")
    p_fore.add_argument("--monthly-window", action="append", default=[], help="YYYY-MM:YYYY-MM (repeatable)")
    p_fore.add_argument("--scopes", default="region,districts", help="Comma-separated: region,districts,sites")
    p_fore.add_argument("--methods", default="daily=weekday_mean,monthly=last3m_mean",
                        help="Methods: daily=weekday_mean,monthly=last3m_mean")
    p_fore.add_argument("--daily-csv", default="data/daily_waste_by_district.csv",
                        help="Input daily aggregated CSV")
    p_fore.add_argument("--monthly-csv", default="data/monthly_waste_by_district.csv",
                        help="Input monthly aggregated CSV")
    p_fore.add_argument("--outdir", default="deliveries", help="Base output dir for deliveries")
    p_fore.add_argument("--scenario-path", default=None, help="Optional path to scenario YAML (enables sites if flags set)")

    args = parser.parse_args()

    if args.command == "ingest" or args.command is None:
        # Accept one or more XLSX paths; fallback to default
        paths = args.xlsx if args.command == "ingest" else sys.argv[1:]
        if not paths:
            paths = [XLSX_FILENAME]
        missing = [p for p in paths if not os.path.exists(p)]
        if missing:
            print("ERROR: File(s) not found:\n  " + "\n  ".join(missing))
            sys.exit(1)

        ensure_dirs()
        combined_daily: dict[tuple[date, str], float] = defaultdict(float)
        for p in paths:
            with zipfile.ZipFile(p) as z:
                period_from, period_to = detect_period(z)
                print(f"Detected period in {os.path.basename(p)}: {period_from} to {period_to}")
                part_daily = parse_rows_to_daily(z, period_from, period_to)
                for k, v in part_daily.items():
                    combined_daily[k] += v

        daily_path = write_daily_csv(combined_daily)
        print(f"Wrote daily by district: {daily_path}")
        monthly_district_path, monthly_region_path, monthly_region = aggregate_monthly(combined_daily)
        print(f"Wrote monthly by district: {monthly_district_path}")
        print(f"Wrote monthly region: {monthly_region_path}")

        # Quick baseline forecasts (legacy behavior)
        daily_fc_path = forecast_daily_naive(combined_daily)
        print(f"Wrote daily 30d forecast: {daily_fc_path}")
        monthly_fc_path = forecast_monthly_naive(monthly_region)
        print(f"Wrote monthly 3m forecast: {monthly_fc_path}")
        return

    elif args.command == "forecast":
        run_phase0_forecast(args)
        return

    else:
        parser.print_help()
        sys.exit(1)


# -------------------------
# Phase-0 Forecasting (CSV)
# -------------------------

def parse_date(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()

def parse_year_month(s: str) -> Tuple[int, int]:
    y, m = s.split('-')
    return int(y), int(m)

def ym_to_str(y: int, m: int) -> str:
    return f"{y}-{m:02d}"

def ym_range(start_ym: str, end_ym: str) -> List[str]:
    sy, sm = parse_year_month(start_ym)
    ey, em = parse_year_month(end_ym)
    out = []
    y, m = sy, sm
    while (y < ey) or (y == ey and m <= em):
        out.append(ym_to_str(y, m))
        if m == 12:
            y += 1
            m = 1
        else:
            m += 1
    return out

def daterange(start: date, end: date) -> List[date]:
    n = (end - start).days
    return [start + timedelta(days=i) for i in range(n + 1)]

def sha256_of_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()

def get_git_commit() -> Optional[str]:
    try:
        out = subprocess.check_output(["git", "rev-parse", "HEAD"], stderr=subprocess.DEVNULL).decode().strip()
        return out
    except Exception:
        return None

def load_daily_csv(path: str) -> List[Tuple[date, str, float]]:
    rows = []
    with open(path, newline='') as f:
        r = csv.DictReader(f)
        for rec in r:
            d = parse_date(rec['date'])
            district = rec['district']
            try:
                val = float(rec['actual_m3'])
            except Exception:
                continue
            rows.append((d, district, val))
    return rows

def load_monthly_csv(path: str) -> List[Tuple[str, str, float]]:
    rows = []
    with open(path, newline='') as f:
        r = csv.DictReader(f)
        for rec in r:
            ym = rec['year_month']
            district = rec['district']
            try:
                val = float(rec['actual_m3'])
            except Exception:
                continue
            rows.append((ym, district, val))
    return rows

def run_phase0_forecast(args):
    # Methods validation
    methods = {k.strip(): v.strip() for k, v in (item.split('=') for item in args.methods.split(',') if '=' in item)}
    if methods.get('daily') != 'weekday_mean' or methods.get('monthly') != 'last3m_mean':
        print("ERROR: Only daily=weekday_mean and monthly=last3m_mean are supported in Phase-0")
        sys.exit(1)

    scopes = set(x.strip() for x in args.scopes.split(',') if x.strip())
    if not scopes.issubset({'region', 'districts', 'sites'}):
        print("ERROR: --scopes must be from {region,districts,sites}")
        sys.exit(1)

    # Load training data
    train_until = parse_date(args["train_until"]) if isinstance(args, dict) else parse_date(args.train_until)
    daily_rows = load_daily_csv(args.daily_csv)
    monthly_rows = load_monthly_csv(args.monthly_csv)

    # Filter to training cutoff
    daily_rows = [(d, dist, v) for (d, dist, v) in daily_rows if d <= train_until]
    # monthly cutoff: include months <= train_until's month if year-month <= cutoff ym
    cutoff_ym = ym_to_str(train_until.year, train_until.month)
    monthly_rows = [(ym, dist, v) for (ym, dist, v) in monthly_rows if ym <= cutoff_ym]

    # Build district sets
    districts = sorted(set(dist for (_, dist, _) in daily_rows))
    if not districts:
        print("ERROR: No districts found in daily training data after cutoff")
        sys.exit(1)

    # Training windows
    max_date = max(d for (d, _, _) in daily_rows)
    start_8w = max_date - timedelta(days=55)
    # daily_recent intentionally unused; kept for potential diagnostics
    dates_8w = [start_8w + timedelta(days=i) for i in range(56)]
    wd_dates: Dict[int, List[date]] = defaultdict(list)  # type: ignore
    for dt in dates_8w:
        wd_dates[dt.weekday()].append(dt)

    # Aggregate helpers
    by_date_dist: Dict[Tuple[date, str], float] = defaultdict(float)
    for d, dist, v in daily_rows:
        by_date_dist[(d, dist)] += v
    by_date_region: Dict[date, float] = defaultdict(float)
    for (d, dist), v in by_date_dist.items():
        by_date_region[d] += v

    # Daily weekday means per district (last 8 weeks)
    weekday_means_dist: Dict[str, Dict[int, float]] = {}
    overall_means_dist: Dict[str, float] = {}
    for dist in districts:
        # Overall mean across 56 days, filling missing with 0
        overall_sum = 0.0
        for dt in dates_8w:
            overall_sum += by_date_dist.get((dt, dist), 0.0)
        overall_mean = overall_sum / len(dates_8w)
        overall_means_dist[dist] = overall_mean
        # Weekday means across fixed weekday date sets, missing filled with 0
        wd_means = {}
        for wd, dlist in wd_dates.items():
            s = 0.0
            for dt in dlist:
                s += by_date_dist.get((dt, dist), 0.0)
            wd_means[wd] = s / len(dlist) if dlist else 0.0
        weekday_means_dist[dist] = wd_means

    # Region weekday means (direct)
    region_vals_recent = [v for (d, v) in sorted(by_date_region.items()) if d >= start_8w]
    region_overall_mean = (sum(region_vals_recent) / len(region_vals_recent)) if region_vals_recent else 0.0
    # Region weekday means across fixed weekday date sets
    weekday_means_region = {}
    for wd, dlist in wd_dates.items():
        s = 0.0
        for dt in dlist:
            s += by_date_region.get(dt, 0.0)
        weekday_means_region[wd] = s / len(dlist) if dlist else 0.0

    # Monthly last-3m mean per district
    by_month_dist: Dict[Tuple[str, str], float] = defaultdict(float)
    for ym, dist, v in monthly_rows:
        by_month_dist[(ym, dist)] += v
    by_month_region: Dict[str, float] = defaultdict(float)
    for (ym, dist), v in by_month_dist.items():
        by_month_region[ym] += v

    def last3_mean_dist(dist: str) -> float:
        # months sorted
        months = sorted({ym for (ym, d) in by_month_dist.keys() if d == dist})
        if not months:
            return 0.0
        last3 = months[-3:]
        vals = [by_month_dist[(ym, dist)] for ym in last3]
        return sum(vals) / len(vals)

    def last3_mean_region() -> float:
        months = sorted(by_month_region.keys())
        if not months:
            return 0.0
        last3 = months[-3:]
        vals = [by_month_region[ym] for ym in last3]
        return sum(vals) / len(vals)

    # Prepare run directory
    ts = datetime.now().strftime('%Y%m%d_%H%M')
    run_dir = os.path.join(args.outdir, f"phase1_run_{ts}")
    out_fore_dir = os.path.join(run_dir, 'forecasts')
    out_meta_dir = os.path.join(run_dir, 'metadata')
    out_qa_dir = os.path.join(run_dir, 'qa')
    out_sum_dir = os.path.join(run_dir, 'summary')
    os.makedirs(out_fore_dir, exist_ok=True)
    os.makedirs(out_meta_dir, exist_ok=True)
    os.makedirs(out_qa_dir, exist_ok=True)
    os.makedirs(out_sum_dir, exist_ok=True)

    qa_report = {"daily": [], "monthly": []}

    # Daily windows
    for w in args.daily_window:
        start_s, end_s = w.split(':')
        d_start, d_end = parse_date(start_s), parse_date(end_s)
        dates = daterange(d_start, d_end)
        rows_out = []  # list of dicts
        # District forecasts
        if 'districts' in scopes:
            for d in dates:
                wd = d.weekday()
                for dist in districts:
                    yhat = weekday_means_dist[dist].get(wd, overall_means_dist[dist])
                    rows_out.append({"level": "district", "district": dist, "date": d.isoformat(), "forecast_m3": yhat})
        # Region direct and sum
        reg_direct = {}
        if 'region' in scopes:
            for d in dates:
                wd = d.weekday()
                yhat_dir = weekday_means_region.get(wd, region_overall_mean)
                reg_direct[d] = yhat_dir
        # Consolidate region by sum of districts
        reg_sum = {}
        if 'region' in scopes and 'districts' in scopes:
            for d in dates:
                s = sum(r['forecast_m3'] for r in rows_out if r['level'] == 'district' and r['date'] == d.isoformat())
                reg_sum[d] = s
                rows_out.append({"level": "region", "district": "__region__", "date": d.isoformat(), "forecast_m3": s})
        # If only region requested without districts, skip client region rows to keep canon as districts_sum only

        # QA checks
        # 1) Coverage
        expected_rows = 0
        if 'districts' in scopes:
            expected_rows += len(dates) * len(districts)
        if 'region' in scopes and 'districts' in scopes:
            expected_rows += len(dates)
        coverage_ok = (len(rows_out) == expected_rows)

        # 2) No duplicates
        keys = [(r['level'], r['district'], r['date']) for r in rows_out]
        duplicates = len(keys) != len(set(keys))

        # 3) No NaN/inf and totals > 0
        import math
        bad_nums = any((r['forecast_m3'] is None or math.isinf(r['forecast_m3']) or math.isnan(r['forecast_m3'])) for r in rows_out)
        has_negative = any(r['forecast_m3'] < 0 for r in rows_out)
        all_zero = sum(r['forecast_m3'] for r in rows_out) == 0

        # 4) All districts present for each date if districts in scope
        missing_dists = []
        if 'districts' in scopes:
            for d in dates:
                ds_for_d = {r['district'] for r in rows_out if r['level'] == 'district' and r['date'] == d.isoformat()}
                miss = set(districts) - ds_for_d
                if miss:
                    missing_dists.append({"date": d.isoformat(), "missing": sorted(list(miss))})

        # 5) Region consistency: |region - sum(districts)|/region <= 0.005 per date
        region_warns = []
        if 'region' in scopes and 'districts' in scopes:
            for d in dates:
                region_val = reg_direct.get(d, reg_sum.get(d, 0.0))
                sum_val = reg_sum.get(d, 0.0)
                if region_val > 0:
                    ratio = abs(region_val - sum_val) / region_val
                else:
                    ratio = 0.0 if sum_val == 0 else 1.0
                if ratio > 0.005:
                    region_warns.append({"date": d.isoformat(), "region_direct": region_val, "district_sum": sum_val, "ratio": ratio})
        # Write debug CSV with region comparison (not client-facing)
        if 'region' in scopes and 'districts' in scopes:
            dbg_path = os.path.join(out_qa_dir, f"daily_region_debug_{d_start.isoformat()}_to_{d_end.isoformat()}.csv")
            with open(dbg_path, 'w', newline='') as f:
                wdbg = csv.DictWriter(f, fieldnames=["date", "aux_region_direct", "districts_sum", "delta_pct"])
                wdbg.writeheader()
                for d in dates:
                    dirv = reg_direct.get(d, 0.0)
                    s = reg_sum.get(d, 0.0)
                    pct = (abs(dirv - s) / dirv) if dirv > 0 else (0.0 if s == 0 else 1.0)
                    wdbg.writerow({"date": d.isoformat(), "aux_region_direct": dirv, "districts_sum": s, "delta_pct": pct})
        # Canonical: district sum in output already

        qa_item = {
            "type": "daily",
            "window": {"start": d_start.isoformat(), "end": d_end.isoformat()},
            "coverage_ok": coverage_ok,
            "duplicates": duplicates,
            "bad_numbers": bad_nums,
            "totals_not_all_zero": (not all_zero),
            "missing_districts": missing_dists,
            "region_warnings": region_warns,
        }
        qa_report["daily"].append(qa_item)

        # Fail gates (region_warnings are WARN only)
        if not coverage_ok or duplicates or bad_nums or has_negative or all_zero or missing_dists:
            # Write QA and fail
            with open(os.path.join(out_qa_dir, 'checks.json'), 'w') as f:
                json.dump(qa_report, f, ensure_ascii=False, indent=2)
            print("ERROR: QA checks failed for daily window", qa_item)
            sys.exit(1)
        if region_warns:
            print(f"WARNING: region vs districts differ on {len(region_warns)} dates in {start_s}..{end_s}")

        # Write forecast CSV
        fname = f"daily_{d_start.isoformat()}_to_{d_end.isoformat()}.csv"
        out_path = os.path.join(out_fore_dir, fname)
        with open(out_path, 'w', newline='') as f:
            w = csv.DictWriter(f, fieldnames=["level", "district", "date", "forecast_m3"])
            w.writeheader()
            for r in rows_out:
                w.writerow(r)

    # Monthly windows
    for w in args.monthly_window:
        start_s, end_s = w.split(':')
        months = ym_range(start_s, end_s)
        rows_out = []
        # Districts
        if 'districts' in scopes:
            for ym in months:
                for dist in districts:
                    yhat = last3_mean_dist(dist)
                    rows_out.append({"level": "district", "district": dist, "year_month": ym, "forecast_m3": yhat})
        # Region direct and sum
        reg_direct = {}
        if 'region' in scopes:
            yhat_dir = last3_mean_region()
            for ym in months:
                reg_direct[ym] = yhat_dir
        reg_sum = {}
        if 'region' in scopes and 'districts' in scopes:
            # sum rows_out per ym
            for ym in months:
                s = sum(r['forecast_m3'] for r in rows_out if r['level'] == 'district' and r['year_month'] == ym)
                reg_sum[ym] = s
                rows_out.append({"level": "region", "district": "__region__", "year_month": ym, "forecast_m3": s})
        # If only region requested without districts, skip client region rows

        # QA checks
        # 1) Coverage
        expected_rows = 0
        if 'districts' in scopes:
            expected_rows += len(months) * len(districts)
        if 'region' in scopes and 'districts' in scopes:
            expected_rows += len(months)
        coverage_ok = (len(rows_out) == expected_rows)
        # 2) No duplicates
        keys = [(r['level'], r['district'], r['year_month']) for r in rows_out]
        duplicates = len(keys) != len(set(keys))
        # 3) No NaN/inf and totals > 0
        import math
        bad_nums = any((r['forecast_m3'] is None or math.isinf(r['forecast_m3']) or math.isnan(r['forecast_m3'])) for r in rows_out)
        has_negative = any(r['forecast_m3'] < 0 for r in rows_out)
        all_zero = sum(r['forecast_m3'] for r in rows_out) == 0
        # 4) All districts present for each month
        missing_dists = []
        if 'districts' in scopes:
            for ym in months:
                ds_for_ym = {r['district'] for r in rows_out if r['level'] == 'district' and r['year_month'] == ym}
                miss = set(districts) - ds_for_ym
                if miss:
                    missing_dists.append({"year_month": ym, "missing": sorted(list(miss))})
        # 5) Region consistency
        region_warns = []
        if 'region' in scopes and 'districts' in scopes:
            for ym in months:
                region_val = reg_direct.get(ym, reg_sum.get(ym, 0.0))
                sum_val = reg_sum.get(ym, 0.0)
                if region_val > 0:
                    ratio = abs(region_val - sum_val) / region_val
                else:
                    ratio = 0.0 if sum_val == 0 else 1.0
                if ratio > 0.005:
                    region_warns.append({"year_month": ym, "region_direct": region_val, "district_sum": sum_val, "ratio": ratio})
        # Debug CSV for monthly comparison
        if 'region' in scopes and 'districts' in scopes:
            dbg_path = os.path.join(out_qa_dir, f"monthly_region_debug_{start_s}_to_{end_s}.csv")
            with open(dbg_path, 'w', newline='') as f:
                wdbg = csv.DictWriter(f, fieldnames=["year_month", "aux_region_direct", "districts_sum", "delta_pct"])
                wdbg.writeheader()
                for ym in months:
                    dirv = reg_direct.get(ym, 0.0)
                    s = reg_sum.get(ym, 0.0)
                    pct = (abs(dirv - s) / dirv) if dirv > 0 else (0.0 if s == 0 else 1.0)
                    wdbg.writerow({"year_month": ym, "aux_region_direct": dirv, "districts_sum": s, "delta_pct": pct})

        qa_item = {
            "type": "monthly",
            "window": {"start": start_s, "end": end_s},
            "coverage_ok": coverage_ok,
            "duplicates": duplicates,
            "bad_numbers": bad_nums,
            "totals_not_all_zero": (not all_zero),
            "missing_districts": missing_dists,
            "region_warnings": region_warns,
        }
        qa_report["monthly"].append(qa_item)

        if not coverage_ok or duplicates or bad_nums or has_negative or all_zero or missing_dists:
            with open(os.path.join(out_qa_dir, 'checks.json'), 'w') as f:
                json.dump(qa_report, f, ensure_ascii=False, indent=2)
            print("ERROR: QA checks failed for monthly window", qa_item)
            sys.exit(1)
        if region_warns:
            print(f"WARNING: region vs districts differ on {len(region_warns)} months in {start_s}..{end_s}")

        # Write forecast CSV
        fname = f"monthly_{start_s}_to_{end_s}.csv"
        out_path = os.path.join(out_fore_dir, fname)
        with open(out_path, 'w', newline='') as f:
            w = csv.DictWriter(f, fieldnames=["level", "district", "year_month", "forecast_m3"])
            w.writeheader()
            for r in rows_out:
                w.writerow(r)

    # Optional Sites (behind flag or scope). This does not affect default outputs.
    enable_sites = False
    cap_default = 1100
    overflow_thr = 0.8
    if getattr(args, 'scenario_path', None):
        try:
            import yaml  # type: ignore
            with open(args.scenario_path, 'r', encoding='utf-8') as sf:
                sc = yaml.safe_load(sf) or {}
            flags = sc.get('flags', {}) or {}
            params = sc.get('params', {}) or {}
            sim = (params.get('simulator') or {})
            enable_sites = bool(flags.get('enable_sites', False))
            cap_default = int(sim.get('capacity_default_liters', cap_default))
            thr = sim.get('overflow_threshold_pct', overflow_thr)
            try:
                overflow_thr = float(thr)
            except Exception:
                pass
        except Exception:
            # scenario is optional; ignore parse errors
            pass
    if 'sites' in scopes:
        enable_sites = True
    if enable_sites:
        try:
            import pandas as pd  # type: ignore
            from src.sites.baseline import estimate_weekday_rates  # type: ignore
            from src.sites.simulator import simulate_fill  # type: ignore
            from src.sites.reconcile import reconcile_sites_to_district  # type: ignore

            # Determine daily forecast window for sites
            def _parse_window(s: str):
                a, b = s.split(':')
                return parse_date(a), parse_date(b)

            if args.daily_window:
                sdt, edt = _parse_window(args.daily_window[0])
            else:
                sdt = max_date + timedelta(days=1)
                edt = sdt + timedelta(days=6)

            reg_path = os.path.join('data', 'sites', 'sites_registry.csv')
            svc_path = os.path.join('data', 'sites', 'sites_service.csv')
            if os.path.exists(reg_path) and os.path.exists(svc_path):
                reg_df = pd.read_csv(reg_path)
                svc_df = pd.read_csv(svc_path)
                rates = estimate_weekday_rates(svc_df, train_until, window_days=56, min_obs=4)
                out_df = simulate_fill(reg_df, rates, sdt, edt, capacity_liters=cap_default, overflow_threshold=overflow_thr)
                sites_dir = os.path.join(out_fore_dir, 'sites')
                os.makedirs(sites_dir, exist_ok=True)
                out_fp = os.path.join(sites_dir, f"daily_fill_{sdt.isoformat()}_to_{edt.isoformat()}.csv")
                out_df.insert(0, 'level', 'site')
                # Build district forecast for the same window (replicate logic)
                # dates and weekday mapping
                dates = daterange(sdt, edt)
                rows_fc = []
                for d in dates:
                    wd = d.weekday()
                    for dist in districts:
                        yhat = weekday_means_dist[dist].get(wd, overall_means_dist[dist])
                        rows_fc.append({"date": d.isoformat(), "district": dist, "forecast_m3": yhat})
                district_fc_df = pd.DataFrame(rows_fc)

                if 'district' in reg_df.columns:
                    # Reconcile sites to district sums
                    adj_df, dbg_df, warns = reconcile_sites_to_district(
                        out_df, reg_df, district_fc_df, tolerance_pct=0.5, method='proportional', clip_min=0.9, clip_max=1.1, default_capacity_liters=cap_default
                    )
                    adj_df.to_csv(out_fp, index=False)

                    # QA files
                    dbg_path = os.path.join(out_qa_dir, f"sites_reconcile_debug_{sdt.isoformat()}_to_{edt.isoformat()}.csv")
                    dbg_df.to_csv(dbg_path, index=False)
                    # Counters for QA
                    try:
                        # Count unmapped sites (no district mapping in registry)
                        _join = out_df.merge(reg_df[["site_id", "district"]], on="site_id", how="left")
                        unmapped_sites = int(_join["district"].isna().sum())
                    except Exception:
                        unmapped_sites = 0
                    try:
                        clip_applied_count = int((dbg_df["scale_applied"].notna()) & (dbg_df["scale_applied"] != 1.0)).sum()
                    except Exception:
                        clip_applied_count = 0
                    try:
                        EPS2 = 1e-9
                        zero_district_total_days = int((dbg_df["district_fc_m3"] <= EPS2).sum())
                    except Exception:
                        zero_district_total_days = 0

                    qa_item_sites = {
                        "type": "sites",
                        "window": {"start": sdt.isoformat(), "end": edt.isoformat()},
                        "reconciliation": {
                            "warn_count": len(warns),
                            "tolerance_pct": 0.5,
                            "unmapped_sites": unmapped_sites,
                            "clip_applied_count": clip_applied_count,
                            "zero_district_total_days": zero_district_total_days,
                        },
                        "coverage_ok": bool(len(adj_df) > 0),
                        "nonnegative": (bool(adj_df["pred_volume_m3"].min() >= 0) if not adj_df.empty else True),
                    }
                    # Append to qa_report if present
                    try:
                        qa_report.setdefault('sites', []).append(qa_item_sites)
                        with open(os.path.join(out_qa_dir, 'checks.json'), 'w') as f:
                            json.dump(qa_report, f, ensure_ascii=False, indent=2)
                    except Exception:
                        pass
                else:
                    # No district mapping in registry → write raw site file (no reconcile)
                    out_df.to_csv(out_fp, index=False)
            else:
                os.makedirs(os.path.join(out_fore_dir, 'sites'), exist_ok=True)
        except Exception as e:
            with open(os.path.join(out_qa_dir, 'sites_optional_error.txt'), 'w') as f:
                f.write(str(e))

    # Write QA checks consolidated
    with open(os.path.join(out_qa_dir, 'checks.json'), 'w') as f:
        json.dump(qa_report, f, ensure_ascii=False, indent=2)

    # Metadata run.json
    commit = get_git_commit() or "n/a"
    meta = {
        "commit": commit,
        "phase_name": "Phase 1 (POC)",
        "cutoff": args.train_until,
        "methods": args.methods,
        "scopes": list(scopes),
        "inputs": {
            "daily_csv": args.daily_csv,
            "daily_csv_sha256": sha256_of_file(args.daily_csv) if os.path.exists(args.daily_csv) else None,
            "monthly_csv": args.monthly_csv,
            "monthly_csv_sha256": sha256_of_file(args.monthly_csv) if os.path.exists(args.monthly_csv) else None,
        },
        "outputs": {},
    }
    # Hash outputs
    for fn in os.listdir(out_fore_dir):
        p = os.path.join(out_fore_dir, fn)
        if os.path.isdir(p):
            continue
        meta["outputs"][fn] = {"sha256": sha256_of_file(p)}
    with open(os.path.join(out_meta_dir, 'run.json'), 'w') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    # Summary POC
    poc = f"""
# Phase 1 Forecast Summary (POC)

Cutoff (train-until): {args.train_until}
Scopes: {', '.join(sorted(scopes))}
Methods: {args.methods}

How to read the CSVs
- Daily forecast files (daily_YYYY-MM-DD_to_YYYY-MM-DD.csv):
  - Columns: level [district|region], district [district name or __region__], date [YYYY-MM-DD], forecast_m3 [float]
- Monthly forecast files (monthly_YYYY-MM_to_YYYY-MM.csv):
  - Columns: level [district|region], district [district name or __region__], year_month [YYYY-MM], forecast_m3 [float]

Notes
- Region entries equal the sum of district forecasts (canonical). Region-direct predictions are computed for QA only and written as aux values into QA debug CSVs.
- If region and districts differ by >0.5%, a warning is logged; delivery is not failed. Canonical region stays as districts_sum.
- All forecasts are generated strictly from data ≤ {args.train_until}.
"""
    with open(os.path.join(out_sum_dir, 'POC_summary.md'), 'w') as f:
        f.write(poc)

    # Create delivery.zip
    zip_path = os.path.join(run_dir, 'delivery.zip')
    # Use shutil.make_archive-like behavior without importing it to minimize deps
    import zipfile as _zip
    with _zip.ZipFile(zip_path, 'w', _zip.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(run_dir):
            for fn in files:
                if fn == 'delivery.zip':
                    continue
                fp = os.path.join(root, fn)
                arcname = os.path.relpath(fp, run_dir)
                zf.write(fp, arcname)

    print(f"Phase 1 delivery created at: {run_dir}\nZip: {zip_path}")


if __name__ == '__main__':
    main()
