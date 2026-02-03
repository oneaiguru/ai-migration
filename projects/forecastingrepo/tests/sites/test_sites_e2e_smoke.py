import csv
import os
import runpy
from pathlib import Path

import pytest


def _write_sites_inputs(tmp_path: Path):
    reg_dir = tmp_path / "data" / "sites"
    reg_dir.mkdir(parents=True, exist_ok=True)
    reg = reg_dir / "sites_registry.csv"
    svc = reg_dir / "sites_service.csv"
    with reg.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id", "bin_count", "bin_size_liters"])  # registry
        w.writerow(["S1", 1, 1100])
    with svc.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id", "service_dt", "collect_volume_m3"])  # service
        w.writerow(["S1", "2024-07-08", "7"])  # one event
        w.writerow(["S1", "2024-07-15", "14"])  # second event


@pytest.mark.spec_id("SITE-SIM-001")
def test_sites_flag_off_no_outputs(tmp_path, monkeypatch):
    # Create minimal training CSVs for district/region to satisfy CLI
    daily_csv = tmp_path / "daily.csv"
    with daily_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date", "district", "actual_m3"])
        w.writerow(["2024-07-01", "D1", "10"])  # one day
    monthly_csv = tmp_path / "monthly.csv"
    with monthly_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "district", "actual_m3"])
        w.writerow(["2024-07", "D1", "100"])  # one month

    outdir = tmp_path / "deliveries_out"
    argv = [
        "ingest_and_forecast.py", "forecast",
        "--train-until", "2024-07-31",
        "--daily-window", "2024-08-01:2024-08-07",
        "--monthly-window", "2024-08:2024-08",
        "--scopes", "region,districts",
        "--methods", "daily=weekday_mean,monthly=last3m_mean",
        "--daily-csv", str(daily_csv),
        "--monthly-csv", str(monthly_csv),
        "--outdir", str(outdir),
    ]
    import sys
    old_argv = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/ingest_and_forecast.py", run_name="__main__")
    finally:
        sys.argv = old_argv

    run_dirs = list(outdir.glob("phase1_run_*"))
    assert run_dirs
    sites_dir = run_dirs[0] / "forecasts" / "sites"
    # Flag off: sites dir should not exist
    assert not sites_dir.exists()


@pytest.mark.spec_id("SITE-SIM-001")
def test_sites_flag_on_outputs_present(tmp_path):
    _write_sites_inputs(tmp_path)

    # Minimal training data for CLI
    daily_csv = tmp_path / "daily.csv"
    with daily_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date", "district", "actual_m3"])
        w.writerow(["2024-07-01", "D1", "10"])  # one day
    monthly_csv = tmp_path / "monthly.csv"
    with monthly_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "district", "actual_m3"])
        w.writerow(["2024-07", "D1", "100"])  # one month

    outdir = tmp_path / "deliveries_out"
    scenario = tmp_path / "site_level.yml"
    scenario.write_text(
        """
id: site_level_poc
flags:
  enable_sites: true
params:
  simulator:
    capacity_default_liters: 1100
    overflow_threshold_pct: 0.8
""",
        encoding="utf-8",
    )

    argv = [
        "ingest_and_forecast.py", "forecast",
        "--train-until", "2024-07-31",
        "--daily-window", "2024-08-01:2024-08-07",
        "--monthly-window", "2024-08:2024-08",
        "--scopes", "region,districts,sites",
        "--scenario-path", str(scenario),
        "--methods", "daily=weekday_mean,monthly=last3m_mean",
        "--daily-csv", str(daily_csv),
        "--monthly-csv", str(monthly_csv),
        "--outdir", str(outdir),
    ]
    import sys
    import os
    import shutil
    # Ensure the script can find data/sites under CWD
    cwd_sites = Path.cwd() / "data" / "sites"
    cwd_sites.mkdir(parents=True, exist_ok=True)
    for srcp in (tmp_path / "data" / "sites").glob("*.csv"):
        shutil.copy(srcp, cwd_sites / srcp.name)
    old_argv = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/ingest_and_forecast.py", run_name="__main__")
    finally:
        sys.argv = old_argv

    run_dirs = list(outdir.glob("phase1_run_*"))
    assert run_dirs
    sites_dir = run_dirs[0] / "forecasts" / "sites"
    assert sites_dir.exists()
    files = list(sites_dir.glob("daily_fill_*.csv"))
    assert files, "site forecast CSV not emitted"
