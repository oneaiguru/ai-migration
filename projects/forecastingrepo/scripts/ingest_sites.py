#!/usr/bin/env python3
"""
Sites ingest (PR‑S1) — CSV/XLSX loader that writes tidy outputs under data/sites/.

Behavior:
  - Parses one or more input files (CSV or XLSX)
  - Resolves Russian/English headers to canonical fields
  - Emits two CSVs: sites_registry.csv, sites_service.csv

No changes to forecast pipeline — this script is standalone and only used in tests for PR‑S1.
"""
from __future__ import annotations

import argparse
from pathlib import Path
from typing import List, Dict, Any

import pandas as pd

from src.sites.aliases_ru import map_headers
from src.sites.schema import SiteRegistryRow, SiteServiceRow, ensure_unique_keys, ensure_nonnegative_volume, coerce_date


EPS = 1e-9


def _read_csv(path: Path) -> pd.DataFrame:
    return pd.read_csv(path)


def _read_xlsx(path: Path) -> pd.DataFrame:
    # Scan sheets and pick the first with at least one known header
    import openpyxl  # noqa: F401
    xl = pd.ExcelFile(path)
    for sheet in xl.sheet_names:
        df = xl.parse(sheet)
        if not df.empty:
            mapping = map_headers(list(df.columns))
            if mapping:
                return df
    # Fallback: first sheet
    return xl.parse(xl.sheet_names[0])


def _standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    mapping = map_headers(list(df.columns))
    # Build new df with canonical columns when possible, while preserving original
    out = df.copy()
    # Apply canonical renames where available
    rename: Dict[str, str] = {}
    for orig, canon in mapping.items():
        rename[orig] = canon
    if rename:
        out = out.rename(columns=rename)
    return out


def _to_registry_rows(df: pd.DataFrame) -> List[SiteRegistryRow]:
    rows: List[SiteRegistryRow] = []
    if "site_id" not in df.columns:
        return rows
    # Only treat as registry if at least one registry-specific column is present
    reg_cols = {"lat", "lon", "bin_count", "bin_size_liters", "bin_type", "land_use"}
    has_any_reg = any(c in df.columns for c in reg_cols)
    if not has_any_reg:
        return rows
    for _, r in df.iterrows():
        site_id = r.get("site_id")
        if pd.isna(site_id):
            continue
        rows.append(
            SiteRegistryRow(
                site_id=str(site_id),
                district=_opt_str(r.get("district")),
                lat=_opt_float(r.get("lat")),
                lon=_opt_float(r.get("lon")),
                bin_count=_opt_int(r.get("bin_count")),
                bin_size_liters=_opt_float(r.get("bin_size_liters")),
                bin_type=_opt_str(r.get("bin_type")),
                land_use=_opt_str(r.get("land_use")),
            )
        )
    return rows


def _to_service_rows(df: pd.DataFrame) -> List[SiteServiceRow]:
    rows: List[SiteServiceRow] = []
    if "site_id" not in df.columns or "service_dt" not in df.columns:
        # Attempt to detect a date column alias left un-renamed
        # If no date-like column, nothing to extract
        return rows
    for _, r in df.iterrows():
        site_id = r.get("site_id")
        if pd.isna(site_id):
            continue
        dt_raw = r.get("service_dt")
        try:
            dt = coerce_date(dt_raw) if not pd.isna(dt_raw) else None
        except Exception:
            # Skip rows with invalid dates
            continue
        if dt is None:
            continue
        volume = r.get("collect_volume_m3")
        volume_val = _opt_float(volume)
        emptied = r.get("emptied_flag")
        emptied_bool = _to_bool(emptied)
        rows.append(
            SiteServiceRow(
                site_id=str(site_id),
                service_dt=dt,
                service_time=_opt_str(r.get("service_time")),
                emptied_flag=emptied_bool,
                collect_volume_m3=volume_val,
                district=_opt_str(r.get("district")),
            )
        )
    return rows


def _opt_str(x: Any) -> str | None:
    if x is None:
        return None
    if isinstance(x, str):
        s = x.strip()
        return s if s != "" else None
    return str(x)


def _opt_int(x: Any) -> int | None:
    try:
        if x is None or (isinstance(x, float) and pd.isna(x)) or (isinstance(x, str) and x.strip() == ""):
            return None
        return int(float(x))
    except Exception:
        return None


def _opt_float(x: Any) -> float | None:
    try:
        if x is None or (isinstance(x, float) and pd.isna(x)) or (isinstance(x, str) and x.strip() == ""):
            return None
        if isinstance(x, str):
            s = x.strip().replace(" ", "")
            # If string uses decimal comma and no dot, convert comma to dot
            if "," in s and "." not in s:
                s = s.replace(",", ".")
            else:
                # Remove thousands separators like "1,234.56" or "1 234,56"
                s = s.replace(",", "")
            return float(s)
        return float(x)
    except Exception:
        return None


def _to_dicts(rows) -> List[Dict[str, Any]]:
    return [r.__dict__ for r in rows]


def _to_bool(x: Any) -> bool | None:
    if x is None:
        return None
    if isinstance(x, bool):
        return x
    if isinstance(x, (int, float)):
        return bool(int(x))
    s = str(x).strip().lower()
    if s in ("да", "true", "1", "y", "yes"):
        return True
    if s in ("нет", "false", "0", "n", "no"):
        return False
    return None


def ingest(inputs: List[Path], outdir: Path) -> None:
    outdir.mkdir(parents=True, exist_ok=True)
    reg_rows: List[SiteRegistryRow] = []
    svc_rows: List[SiteServiceRow] = []

    for p in inputs:
        ext = p.suffix.lower()
        if ext in (".csv", ".txt"):
            df = _read_csv(p)
        elif ext in (".xlsx", ".xlsm", ".xls"):
            df = _read_xlsx(p)
        else:
            raise SystemExit(f"Unsupported file type: {p}")
        df = _standardize_columns(df)
        reg_rows.extend(_to_registry_rows(df))
        svc_rows.extend(_to_service_rows(df))

    # Validate service rows
    ensure_unique_keys(svc_rows)
    ensure_nonnegative_volume(svc_rows)
    # Orphan service check: every service site must appear in registry
    reg_ids = {r.site_id for r in reg_rows}
    if reg_ids:
        orphan = sorted({r.site_id for r in svc_rows if r.site_id not in reg_ids})
        if orphan:
            raise ValueError(f"Orphan services without registry rows: {', '.join(orphan)}")

    # Write outputs
    reg_df = pd.DataFrame(_to_dicts(reg_rows)).drop_duplicates(subset=["site_id"]) if reg_rows else pd.DataFrame(columns=[
        "site_id","district","lat","lon","bin_count","bin_size_liters","bin_type","land_use"
    ])
    svc_df = pd.DataFrame(_to_dicts(svc_rows)) if svc_rows else pd.DataFrame(columns=[
        "site_id","service_dt","service_time","emptied_flag","collect_volume_m3","district"
    ])

    # Ensure date serialization as YYYY-MM-DD
    if not svc_df.empty:
        svc_df["service_dt"] = pd.to_datetime(svc_df["service_dt"]).dt.date.astype(str)

    reg_out = outdir / "sites_registry.csv"
    svc_out = outdir / "sites_service.csv"
    reg_df.to_csv(reg_out, index=False, encoding="utf-8")
    svc_df.to_csv(svc_out, index=False, encoding="utf-8")


def main(argv: List[str] | None = None) -> None:
    ap = argparse.ArgumentParser(description="Sites ingest (CSV/XLSX → tidy CSVs)")
    ap.add_argument("--inputs", nargs="+", required=True, help="Input files (CSV or XLSX)")
    ap.add_argument("--outdir", default="data/sites", help="Output directory (default: data/sites)")
    args = ap.parse_args(argv)

    inputs = [Path(p) for p in args.inputs]
    outdir = Path(args.outdir)
    ingest(inputs, outdir)
    print(f"[OK] Wrote: {outdir / 'sites_registry.csv'} and {outdir / 'sites_service.csv'}")


if __name__ == "__main__":  # pragma: no cover
    main()
