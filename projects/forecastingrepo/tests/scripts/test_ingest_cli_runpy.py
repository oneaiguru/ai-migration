import sys
import csv
import runpy
from pathlib import Path
from datetime import date, timedelta

import pytest


@pytest.mark.spec_id("CLI-001")
def test_ingest_cli_forecast_runpy(tmp_path, monkeypatch):
    """
    Execute scripts/ingest_and_forecast.py in-process (runpy) with synthetic
    tiny inputs so coverage accrues to scripts/ingest_and_forecast.py.

    This touches:
      - argparse path for 'forecast' subcommand
      - window parsing
      - training cutoff filtering
      - forecast file emission
      - QA/metadata outputs creation

    No behavior changes; all outputs confined to tmp_path.
    """
    # Deterministic env (mirrors CI)
    env = {
        "PYTHONHASHSEED": "0",
        "TZ": "UTC",
        "LC_ALL": "C.UTF-8",
    }
    monkeypatch.setenv("PYTHONHASHSEED", env["PYTHONHASHSEED"])
    monkeypatch.setenv("TZ", env["TZ"])
    monkeypatch.setenv("LC_ALL", env["LC_ALL"])

    # Minimal synthetic DAILY training data covering the last 56 days before cutoff
    cutoff = date(2024, 12, 31)
    daily_csv = tmp_path / "daily.csv"
    with daily_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date", "district", "actual_m3"])
        # Give non-zero values on Mondays only for two districts across 56 days
        for i in range(56):
            d = cutoff - timedelta(days=55 - i)
            if d.weekday() == 0:  # Monday
                w.writerow([d.isoformat(), "D1", "10.0"])
                w.writerow([d.isoformat(), "D2", "5.0"])

    # Minimal MONTHLY training data (last 3 months) for two districts
    monthly_csv = tmp_path / "monthly.csv"
    with monthly_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "district", "actual_m3"])
        for ym in ["2024-10", "2024-11", "2024-12"]:
            w.writerow([ym, "D1", "100"])
            w.writerow([ym, "D2", "80"])

    outdir = tmp_path / "deliveries_out"

    # Build CLI argv (choose daily window that includes a Monday)
    argv = [
        "ingest_and_forecast.py", "forecast",
        "--train-until", "2024-12-31",
        "--daily-window", "2025-01-06:2025-01-08",
        "--monthly-window", "2025-01:2025-01",
        "--scopes", "region,districts",
        "--methods", "daily=weekday_mean,monthly=last3m_mean",
        "--daily-csv", str(daily_csv),
        "--monthly-csv", str(monthly_csv),
        "--outdir", str(outdir),
    ]

    # Run in-process so pytest-cov captures coverage under scripts/*
    monkeypatch.setenv("PYTHONPATH", str(Path.cwd()))
    monkeypatch.chdir(Path.cwd())
    monkeypatch.setenv("MPLBACKEND", "Agg")

    old_argv = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/ingest_and_forecast.py", run_name="__main__")
    finally:
        sys.argv = old_argv

    runs = list(outdir.glob("phase*_*"))
    assert runs, "No run directory was created under outdir"
    run_dir = runs[0]

    # Forecast files
    fc_d = list((run_dir / "forecasts").glob("daily_*.csv"))
    fc_m = list((run_dir / "forecasts").glob("monthly_*.csv"))
    assert fc_d and fc_m

    # QA & metadata
    assert (run_dir / "qa" / "checks.json").exists()
    assert (run_dir / "metadata" / "run.json").exists()
    assert (run_dir / "summary" / "POC_summary.md").exists()
