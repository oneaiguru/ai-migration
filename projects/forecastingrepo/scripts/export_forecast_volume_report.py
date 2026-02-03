#!/usr/bin/env python3
"""
Export long forecast CSV (site_id,date,forecast_m3) into a short "Отчет по объему" CSV.

Output format:
  Код КП;<day columns for each month in period>

The output uses ';' as delimiter and comma as the decimal separator.
"""
from __future__ import annotations

import argparse
import csv
from datetime import date, datetime
from pathlib import Path
from typing import Optional, Sequence

import pandas as pd

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from src.sites.wide_report import parse_period_from_filename, write_wide_report


REPO_ROOT = Path(__file__).resolve().parent.parent
DATE_FMT = "%Y-%m-%d"
HEADER_SITE = "Код КП"
DEFAULT_KP_MAP = REPO_ROOT / "data/raw/jury_volumes/derived/jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv"


def parse_date(value: str) -> date:
    return datetime.strptime(value.strip(), DATE_FMT).date()


def format_volume_text(raw: str) -> Optional[str]:
    text = raw.strip()
    if not text or text in {"-", "—"}:
        return None
    text = text.replace(" ", "")
    normalized = text.replace(",", ".")
    try:
        float(normalized)
    except ValueError:
        return None
    return normalized.replace(".", ",")


def load_kp_map(path: Path) -> dict[str, str]:
    if not path.exists():
        raise FileNotFoundError(path)
    with path.open("r", encoding="utf-8", errors="replace") as fh:
        reader = csv.reader(fh, delimiter=";")
        header = None
        for row in reader:
            if row and "Код КП" in row and "Адрес" in row:
                header = row
                break
        if header is None:
            raise RuntimeError(f"Missing header row with 'Код КП' and 'Адрес' in {path}")
        code_idx = header.index("Код КП")
        addr_idx = header.index("Адрес")
        mapping: dict[str, str] = {}
        for row in reader:
            if not row or not any(cell.strip() for cell in row):
                continue
            if len(row) <= max(code_idx, addr_idx):
                continue
            code = row[code_idx].strip()
            addr = row[addr_idx].strip()
            if code and addr and addr not in mapping:
                mapping[addr] = code
    return mapping


def normalize_site_ids(series: pd.Series, kp_map: Optional[dict[str, str]]) -> pd.Series:
    ids = series.astype("string").fillna("").str.strip()
    float_mask = ids.str.fullmatch(r"\d+\.0+").fillna(False)
    ids = ids.where(~float_mask, ids.str.split(".").str[0])
    numeric_mask = ids.str.fullmatch(r"\d+").fillna(False)
    if kp_map:
        mapped = ids.map(kp_map)
        missing_mask = (~numeric_mask) & mapped.isna() & (ids != "")
        if missing_mask.any():
            missing = ids[missing_mask].unique().tolist()
            sample = ", ".join(missing[:3])
            print(
                f"[WARN] Missing KP code mapping for {len(missing)} site_id values. Example: {sample}. "
                "These rows will be dropped if non-numeric after mapping."
            )
        ids = ids.where(numeric_mask | mapped.isna(), mapped)
    return ids


def enforce_numeric_site_ids(df: pd.DataFrame) -> pd.DataFrame:
    ids = df["site_id"].astype("string").fillna("").str.strip()
    numeric_mask = ids.str.fullmatch(r"\d+").fillna(False)
    dropped = int((~numeric_mask & (ids != "")).sum())
    if dropped:
        print(f"[WARN] Dropping {dropped} rows with non-numeric site_id values.")
    df = df.loc[numeric_mask].copy()
    df["site_id"] = ids[numeric_mask]
    return df


def infer_period(path: Path, df: pd.DataFrame) -> tuple[date, date]:
    period = parse_period_from_filename(path)
    if period:
        return period
    if "date" not in df.columns:
        raise RuntimeError("Provide --start/--end or include parseable dates in 'date' column")
    parsed = pd.to_datetime(df["date"], errors="coerce")
    if parsed.empty or parsed.isna().all():
        raise RuntimeError("Provide --start/--end or include parseable dates in 'date' column")
    if parsed.isna().any():
        bad_values = df.loc[parsed.isna(), "date"].astype(str).unique().tolist()
        sample = ", ".join(bad_values[:3])
        raise RuntimeError(
            "Provide --start/--end or include parseable dates in 'date' column; "
            f"failed to parse date values: {sample}"
        )
    start_ts = parsed.min()
    end_ts = parsed.max()
    if pd.isna(start_ts) or pd.isna(end_ts):
        raise RuntimeError("Provide --start/--end or include parseable dates in 'date' column")
    return start_ts.date(), end_ts.date()


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert forecast CSV into short Jury report format (Код КП + daily volumes)."
    )
    parser.add_argument("--input", required=True, help="Path to forecast CSV (site_id,date,forecast_m3).")
    parser.add_argument("--output", required=True, help="Output CSV path.")
    parser.add_argument("--start", help="Start date (YYYY-MM-DD). Defaults to min date in input.")
    parser.add_argument("--end", help="End date (YYYY-MM-DD). Defaults to max date in input.")
    parser.add_argument(
        "--input-series",
        choices=["cumulative", "daily"],
        default="cumulative",
        help="Interpret forecast_m3 in the input as cumulative or daily values (default: cumulative).",
    )
    parser.add_argument(
        "--output-series",
        choices=["daily", "cumulative"],
        default="daily",
        help="Write daily volumes (default) or cumulative values to the wide report.",
    )
    parser.add_argument(
        "--kp-map",
        help=(
            "CSV export with 'Код КП' and 'Адрес' columns to map address-style site_id values "
            "to KP codes."
        ),
    )
    parser.add_argument(
        "--include-metadata",
        action="store_true",
        help="Write title/period rows before the header (optional).",
    )
    return parser.parse_args(argv)


def convert_series(df: pd.DataFrame, input_series: str, output_series: str) -> pd.DataFrame:
    if input_series == output_series:
        return df

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["forecast_m3"] = pd.to_numeric(df["forecast_m3"], errors="coerce")
    df = df.dropna(subset=["site_id", "date", "forecast_m3"])
    df = df.sort_values(["site_id", "date"])

    if input_series == "cumulative" and output_series == "daily":
        df["forecast_m3"] = df.groupby("site_id")["forecast_m3"].diff().fillna(df["forecast_m3"])
        negative = df["forecast_m3"] < -1e-9
        if negative.any():
            sample = df.loc[negative, ["site_id", "date", "forecast_m3"]].head(3).to_dict("records")
            raise RuntimeError(
                "Input series is not monotonic; cannot convert cumulative -> daily. "
                f"Examples: {sample}"
            )
        df.loc[df["forecast_m3"] < 0, "forecast_m3"] = 0.0
        return df

    if input_series == "daily" and output_series == "cumulative":
        df["forecast_m3"] = df.groupby("site_id")["forecast_m3"].cumsum()
        return df

    raise ValueError(f"Unsupported conversion {input_series} -> {output_series}")


def export_report(
    input_path: Path,
    output_path: Path,
    start: Optional[date],
    end: Optional[date],
    include_metadata: bool,
    kp_map_path: Optional[Path],
    input_series: str,
    output_series: str,
) -> None:
    df = pd.read_csv(
        input_path,
        dtype={"site_id": str},
        keep_default_na=False,
    )
    if "date" not in df.columns or "site_id" not in df.columns or "forecast_m3" not in df.columns:
        raise RuntimeError(f"Expected columns site_id,date,forecast_m3 in {input_path}")

    if start is None or end is None:
        inferred_start, inferred_end = infer_period(input_path, df)
        if start is None:
            start = inferred_start
        if end is None:
            end = inferred_end
    assert start is not None and end is not None

    kp_map = load_kp_map(kp_map_path) if kp_map_path else None
    df["site_id"] = normalize_site_ids(df["site_id"], kp_map)
    df = enforce_numeric_site_ids(df)
    df = convert_series(df, input_series=input_series, output_series=output_series)
    write_wide_report(df, output_path, start, end, "forecast_m3", include_metadata)


def main(argv: Optional[Sequence[str]] = None) -> None:
    args = parse_args(argv)
    input_path = Path(args.input)
    output_path = Path(args.output)
    start = datetime.strptime(args.start, DATE_FMT).date() if args.start else None
    end = datetime.strptime(args.end, DATE_FMT).date() if args.end else None
    kp_map_path = Path(args.kp_map) if args.kp_map else (DEFAULT_KP_MAP if DEFAULT_KP_MAP.exists() else None)
    export_report(
        input_path,
        output_path,
        start,
        end,
        args.include_metadata,
        kp_map_path,
        input_series=args.input_series,
        output_series=args.output_series,
    )
    print(f"[DONE] Wrote {output_path}")


if __name__ == "__main__":
    main()
