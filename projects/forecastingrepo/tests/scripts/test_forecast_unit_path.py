from pathlib import Path
import csv

import scripts.ingest_and_forecast as ing


def _mk_small_csvs(tmp_path: Path):
    daily = tmp_path / "daily.csv"
    with daily.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date","district","actual_m3"])
        for d in ["2024-12-23","2024-12-25","2024-12-30","2024-12-31"]:
            w.writerow([d, "D1", 5.0])
            w.writerow([d, "D2", 3.0])
    monthly = tmp_path / "monthly.csv"
    with monthly.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month","district","actual_m3"])
        for ym in ["2024-10","2024-11","2024-12"]:
            w.writerow([ym, "D1", 100.0])
            w.writerow([ym, "D2", 80.0])
    return str(daily), str(monthly)


def test_run_phase0_forecast_unit(tmp_path: Path):
    daily_csv, monthly_csv = _mk_small_csvs(tmp_path)
    args = type("Args", (), {
        "methods": "daily=weekday_mean,monthly=last3m_mean",
        "scopes": "region,districts",
        "train_until": "2024-12-31",
        "daily_csv": daily_csv,
        "monthly_csv": monthly_csv,
        "outdir": str(tmp_path / "deliveries"),
        "daily_window": ["2025-01-01:2025-01-10"],
        "monthly_window": ["2025-01:2025-01"],
    })
    ing.run_phase0_forecast(args)
    runs = sorted((Path(args.outdir)).glob("phase1_run_*/forecasts/*.csv"))
    assert runs
