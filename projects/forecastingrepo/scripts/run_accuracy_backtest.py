#!/usr/bin/env python3
"""
Run district/region + site-level accuracy backtests for fixed monthly windows.

Guardrails:
- Evaluation only (no model/pipeline behavior changes).
- Outputs under reports/accuracy_backtest_<YYYYMMDD>/.
- Safe outputs: aggregates + district + site_id only (no addresses).
"""
from __future__ import annotations

import argparse
import csv
import os
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

try:
    import pandas as pd  # type: ignore
except Exception:  # pragma: no cover
    pd = None


DATE_FORMATS = ("%Y-%m-%d", "%Y/%m/%d", "%d.%m.%Y", "%d/%m/%Y")
VALUE_COL_CANDIDATES = ("collect_volume_m3", "volume_m3")


@dataclass(frozen=True)
class Window:
    label: str
    start: str
    end: str
    cutoff: str
    horizon: int

    @property
    def month(self) -> str:
        return self.start[:7]


WINDOWS: List[Window] = [
    Window("2025-01", "2025-01-01", "2025-01-31", "2024-12-31", 31),
    Window("2025-02", "2025-02-01", "2025-02-28", "2025-01-31", 28),
    Window("2025-03", "2025-03-01", "2025-03-31", "2025-02-28", 31),
    Window("2025-04", "2025-04-01", "2025-04-30", "2025-03-31", 30),
    Window("2025-05", "2025-05-01", "2025-05-31", "2025-04-30", 31),
]


def parse_date(raw: str) -> date | None:
    if not raw:
        return None
    text = raw.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(text, fmt).date()
        except Exception:
            continue
    return None


def parse_float(raw: str | None) -> float:
    if raw is None:
        return 0.0
    text = str(raw).strip().replace(" ", "")
    if not text or text in {"-", "—"}:
        return 0.0
    if "," in text and "." not in text:
        text = text.replace(",", ".")
    else:
        text = text.replace(",", "")
    try:
        return float(text)
    except Exception:
        return 0.0


def load_registry_map(path: Path) -> Dict[str, str]:
    mapping: Dict[str, str] = {}
    if not path.exists():
        return mapping
    with path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for rec in reader:
            site_id = (rec.get("site_id") or "").strip()
            if not site_id:
                continue
            district = (rec.get("district") or "").strip() or "__unmapped__"
            mapping[site_id] = district
    return mapping


def detect_value_column(fieldnames: Iterable[str], preferred: str | None) -> str:
    names = [name.strip().lstrip("\ufeff") for name in fieldnames if name]
    if preferred and preferred in names:
        return preferred
    for candidate in VALUE_COL_CANDIDATES:
        if candidate in names:
            return candidate
    raise ValueError(f"None of {VALUE_COL_CANDIDATES} found in service CSV.")


def build_actuals(
    service_path: Path,
    registry_map: Dict[str, str],
    start: date,
    end: date,
    months: List[str],
    outdir: Path,
    value_col: str | None,
) -> Tuple[Path, Path, Dict[str, Path], str, str]:
    outdir.mkdir(parents=True, exist_ok=True)
    district_dir = outdir / "district_actuals"
    district_dir.mkdir(parents=True, exist_ok=True)
    site_dir = outdir / "site"
    site_dir.mkdir(parents=True, exist_ok=True)

    daily_by: Dict[Tuple[str, str], float] = defaultdict(float)
    monthly_by: Dict[Tuple[str, str], float] = defaultdict(float)
    site_by_month: Dict[str, Dict[Tuple[str, str], float]] = {
        month: defaultdict(float) for month in months
    }

    with service_path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise RuntimeError("Service CSV missing header row.")
        value_key = detect_value_column(reader.fieldnames, value_col)
        date_key = "service_dt" if "service_dt" in reader.fieldnames else "date"
        site_key = "site_id"
        for rec in reader:
            site_id = (rec.get(site_key) or "").strip()
            if not site_id:
                continue
            dt = parse_date(rec.get(date_key) or "")
            if dt is None or dt < start or dt > end:
                continue
            value = parse_float(rec.get(value_key))
            if value <= 0:
                continue
            district = registry_map.get(site_id, "__unmapped__")
            date_str = dt.isoformat()
            month_key = f"{dt.year}-{dt.month:02d}"
            daily_by[(date_str, district)] += value
            monthly_by[(month_key, district)] += value
            if month_key in site_by_month:
                site_by_month[month_key][(site_id, date_str)] += value

    daily_path = district_dir / "daily_waste_by_district_2024_2025.csv"
    with daily_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["date", "district", "actual_m3"])
        for (dt, district) in sorted(daily_by.keys()):
            writer.writerow([dt, district, f"{daily_by[(dt, district)]:.6f}"])

    monthly_path = district_dir / "monthly_waste_by_district_2024_2025.csv"
    with monthly_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["year_month", "district", "actual_m3"])
        for (ym, district) in sorted(monthly_by.keys()):
            writer.writerow([ym, district, f"{monthly_by[(ym, district)]:.6f}"])

    site_paths: Dict[str, Path] = {}
    for month in months:
        path = site_dir / f"actuals_{month}.csv"
        site_paths[month] = path
        with path.open("w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["site_id", "date", "actual_m3"])
            for (site_id, dt) in sorted(site_by_month[month].keys()):
                m3 = site_by_month[month][(site_id, dt)]
                writer.writerow([site_id, dt, f"{m3:.6f}"])

    return daily_path, monthly_path, site_paths, value_key, "m3"


def run_cmd(cmd: List[str], cwd: Path, env: Dict[str, str] | None = None) -> None:
    print(f"[RUN] {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=str(cwd), env=env, check=False, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Command failed ({res.returncode}): {' '.join(cmd)}")


def build_summary_and_excel(outdir: Path, windows: List[Window]) -> None:
    if pd is None:
        print("[WARN] pandas not available; skipping XLSX summary.")
        return

    summary_rows = []
    district_errors: Dict[str, float] = defaultdict(float)
    district_actuals: Dict[str, float] = defaultdict(float)
    site_wape_by_month: List[pd.DataFrame] = []
    district_scoreboards: List[pd.DataFrame] = []

    for w in windows:
        district_dir = outdir / "district" / f"backtest_{w.cutoff}"
        score_path = district_dir / "scoreboard_monthly.csv"
        region_wape = None
        if score_path.exists():
            df = pd.read_csv(score_path)
            district_scoreboards.append(df.assign(month=w.month))
            region_rows = df[df["level"] == "region"]
            if not region_rows.empty:
                region_wape = float(region_rows.iloc[0]["wape"])
            dist_rows = df[df["level"] == "district"].copy()
            dist_rows["abs_error"] = (dist_rows["actual"] - dist_rows["forecast"]).abs()
            for _, rec in dist_rows.iterrows():
                district = str(rec["district"])
                district_errors[district] += float(rec["abs_error"])
                district_actuals[district] += abs(float(rec["actual"]))

        metrics_path = outdir / "site" / f"metrics_{w.month}.csv"
        site_wape = None
        records = None
        if metrics_path.exists():
            metrics_df = pd.read_csv(metrics_path)
            if not metrics_df.empty:
                row = metrics_df.iloc[0]
                site_wape = float(row.get("overall_wape", 0.0))
                records = int(row.get("records_evaluated", 0))
            site_wape_by_month.append(metrics_df.assign(month=w.month))

        summary_rows.append(
            {
                "month": w.month,
                "district_region_wape": region_wape,
                "site_overall_wape": site_wape,
                "site_records": records,
            }
        )

    summary_df = pd.DataFrame(summary_rows)
    summary_path = outdir / "summary_monthly.csv"
    summary_df.to_csv(summary_path, index=False)

    worst_districts = []
    for district, err_sum in district_errors.items():
        actual_sum = district_actuals.get(district, 0.0)
        wape = err_sum / actual_sum if actual_sum > 0 else 0.0
        worst_districts.append((district, wape, actual_sum))
    worst_districts.sort(key=lambda x: x[1], reverse=True)
    worst_districts_df = pd.DataFrame(
        worst_districts, columns=["district", "weighted_wape", "total_actual"]
    )
    worst_districts_path = outdir / "worst_districts.csv"
    worst_districts_df.head(50).to_csv(worst_districts_path, index=False)

    worst_sites_df = pd.DataFrame()
    if site_wape_by_month:
        per_site_frames = []
        for w in windows:
            per_site_path = outdir / "site" / f"metrics_{w.month}_per_site.csv"
            if per_site_path.exists():
                df = pd.read_csv(per_site_path)
                if not df.empty:
                    df["month"] = w.month
                    per_site_frames.append(df)
        if per_site_frames:
            per_site_all = pd.concat(per_site_frames, ignore_index=True)
            worst_sites_df = (
                per_site_all.groupby("site_id")["site_wape"]
                .mean()
                .reset_index()
                .sort_values("site_wape", ascending=False)
            )
            worst_sites_df.head(100).to_csv(outdir / "worst_sites.csv", index=False)
            per_site_all_path = outdir / "site" / "metrics_per_site_all.csv"
            per_site_all.to_csv(per_site_all_path, index=False)

    summary_md = outdir / "SUMMARY.md"
    lines = [
        "# Accuracy Backtest Summary",
        "",
        "| Month | District/Region WAPE | Site WAPE | Site Records |",
        "| --- | --- | --- | --- |",
    ]
    for _, row in summary_df.iterrows():
        lines.append(
            f"| {row['month']} | {row['district_region_wape']:.4f} | {row['site_overall_wape']:.4f} | {int(row['site_records'] or 0)} |"
        )
    lines.append("")
    lines.append("Notes:")
    lines.append("- District actuals are derived from site service rows (column name: actual_m3).")
    lines.append("- Site actuals are derived from site service rows (column name actual_m3).")
    lines.append("- Service units: m3 (no conversions applied).")
    lines.append("- Outputs include site_id only (no address fields).")
    summary_md.write_text("\n".join(lines) + "\n", encoding="utf-8")

    # Excel bundle (optional)
    xlsx_path = outdir / "accuracy_jan_may_2025.xlsx"
    try:
        with pd.ExcelWriter(xlsx_path, engine="openpyxl") as writer:
            summary_df.to_excel(writer, sheet_name="summary_monthly", index=False)
            worst_districts_df.head(50).to_excel(writer, sheet_name="worst_districts", index=False)
            if not worst_sites_df.empty:
                worst_sites_df.head(100).to_excel(writer, sheet_name="worst_sites", index=False)

            if district_scoreboards:
                district_all = pd.concat(district_scoreboards, ignore_index=True)
                if len(district_all) <= 1_000_000:
                    district_all.to_excel(writer, sheet_name="district_scoreboard", index=False)

            if site_wape_by_month:
                site_summary = pd.concat(site_wape_by_month, ignore_index=True)
                if len(site_summary) <= 1_000_000:
                    site_summary.to_excel(writer, sheet_name="site_metrics", index=False)

            per_site_all = outdir / "site" / "metrics_per_site_all.csv"
            if per_site_all.exists():
                per_site_df = pd.read_csv(per_site_all)
                if len(per_site_df) <= 1_000_000:
                    per_site_df.to_excel(writer, sheet_name="site_per_site", index=False)
        print(f"[OK] Wrote Excel workbook: {xlsx_path}")
    except Exception as exc:  # pragma: no cover
        print(f"[WARN] Excel export skipped: {exc}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Run accuracy backtests (district + site) for Jan-May 2025.")
    parser.add_argument("--services", default="data/sites/sites_service.csv")
    parser.add_argument("--registry", default="data/sites/sites_registry.csv")
    parser.add_argument("--start", default="2024-01-01")
    parser.add_argument("--end", default="2025-05-31")
    parser.add_argument("--tag", default=None, help="Output tag for reports/accuracy_backtest_<tag>")
    parser.add_argument("--value-col", default=None, help="Override service value column (default auto-detect)")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    service_path = repo_root / args.services
    registry_path = repo_root / args.registry
    if not service_path.exists():
        raise SystemExit(f"Service CSV not found: {service_path}")
    if not registry_path.exists():
        raise SystemExit(f"Registry CSV not found: {registry_path}")

    start = datetime.strptime(args.start, "%Y-%m-%d").date()
    end = datetime.strptime(args.end, "%Y-%m-%d").date()
    tag = args.tag or datetime.utcnow().strftime("%Y%m%d")
    outdir = repo_root / "reports" / f"accuracy_backtest_{tag}"
    outdir.mkdir(parents=True, exist_ok=True)

    months = [w.month for w in WINDOWS]
    print("[INFO] Building district and site actuals...")
    daily_actuals, monthly_actuals, site_actuals_paths, value_key, units = build_actuals(
        service_path=service_path,
        registry_map=load_registry_map(registry_path),
        start=start,
        end=end,
        months=months,
        outdir=outdir,
        value_col=args.value_col,
    )
    print(f"[INFO] Service value column: {value_key} ({units})")
    print(f"[OK] District actuals: {daily_actuals}, {monthly_actuals}")
    print(f"[OK] Site actuals: {len(site_actuals_paths)} files")

    env = os.environ.copy()
    env["SITES_SERVICE_PATH"] = str(service_path)
    env["SITES_REGISTRY_PATH"] = str(registry_path)

    for w in WINDOWS:
        district_out = outdir / "district" / f"backtest_{w.cutoff}"
        district_out.mkdir(parents=True, exist_ok=True)
        run_cmd(
            [
                sys.executable,
                "scripts/backtest_eval.py",
                "--train-until",
                w.cutoff,
                "--daily-window",
                f"{w.start}:{w.end}",
                "--monthly-window",
                f"{w.month}:{w.month}",
                "--scopes",
                "region,districts",
                "--methods",
                "daily=weekday_mean,monthly=last3m_mean",
                "--actual-daily",
                str(daily_actuals),
                "--actual-monthly",
                str(monthly_actuals),
                "--outdir",
                str(district_out),
            ],
            cwd=repo_root,
        )

        site_forecast = outdir / "site" / f"forecast_{w.month}.csv"
        run_cmd(
            [
                sys.executable,
                "scripts/export_validation_forecast.py",
                "--cutoff",
                w.cutoff,
                "--horizon",
                str(w.horizon),
                "--format",
                "long",
                "--output",
                str(site_forecast),
            ],
            cwd=repo_root,
            env=env,
        )

        site_actuals = site_actuals_paths[w.month]
        site_metrics = outdir / "site" / f"metrics_{w.month}.csv"
        run_cmd(
            [
                sys.executable,
                "scripts/validate_forecast.py",
                str(site_forecast),
                str(site_actuals),
                str(site_metrics),
                "--forecast-format",
                "long",
                "--actuals-format",
                "long",
                "--forecast-series",
                "cumulative",
            ],
            cwd=repo_root,
        )

    print("[INFO] Building summary + Excel bundle...")
    build_summary_and_excel(outdir, WINDOWS)
    print(f"[DONE] Outputs in {outdir}")


if __name__ == "__main__":
    main()
