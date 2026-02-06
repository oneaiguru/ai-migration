import os
from pathlib import Path
import csv
import runpy

import pytest


@pytest.mark.spec_id("SITE-BT-UNIT-001")
def test_metrics_and_monthly_join(tmp_path: Path):
    # Create tiny service actuals (two service days)
    svc = tmp_path / "sites_service.csv"
    with svc.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id", "service_dt", "collect_volume_m3"])  # header
        w.writerow(["S1", "2024-10-01", "10"])  # Oct
        w.writerow(["S1", "2024-10-08", "20"])  # Oct
        w.writerow(["S1", "2024-11-01", "30"])  # Nov

    # Create tiny sites forecast (pred_volume_m3 for same dates)
    sites_csv = tmp_path / "daily_fill_2024-10-01_to_2024-11-30.csv"
    with sites_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])  # header
        w.writerow(["S1", "2024-10-01", "0.5", "12", "0"])  # +2 error
        w.writerow(["S1", "2024-10-08", "0.6", "18", "0"])  # -2 error
        w.writerow(["S1", "2024-11-01", "0.7", "30", "1"])  # exact

    outdir = tmp_path / "out"
    argv = [
        "backtest_sites.py",
        "--train-until", "2024-09-30",
        "--daily-window", "2024-10-01:2024-11-30",
        "--monthly-window", "2024-10:2024-11",
        "--sites-registry", str(tmp_path / "sites_registry.csv"),  # optional file; not required for core join
        "--sites-service", str(svc),
        "--outdir", str(outdir),
        "--use-existing-sites-csv", str(sites_csv),
    ]

    import sys
    old = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/backtest_sites.py", run_name="__main__")
    finally:
        sys.argv = old

    # Verify outputs exist and basic content
    daily = outdir / "scoreboard_site_daily.csv"
    monthly = outdir / "scoreboard_site_monthly.csv"
    summary = outdir / "SUMMARY.md"
    assert daily.exists() and monthly.exists() and summary.exists()

    # Read monthly scoreboard and check totals and metric computation on a known row
    rows = list(csv.DictReader(monthly.open()))
    assert rows and set(rows[0].keys()) == {"site_id", "year_month", "actual", "forecast", "wape", "smape", "mae"}
    # October row (actual 30, forecast 30) → zero error
    oct_rows = [r for r in rows if r["year_month"] == "2024-10"]
    assert oct_rows
    assert float(oct_rows[0]["mae"]) == pytest.approx(0.0, abs=1e-6)
    # November row (30 vs 30)
    nov_rows = [r for r in rows if r["year_month"] == "2024-11"]
    assert nov_rows
    assert float(nov_rows[0]["wape"]) == pytest.approx(0.0, abs=1e-6)

    summary_text = summary.read_text(encoding="utf-8")
    assert "Overall site-level WAPE" in summary_text
    assert "Median per-site WAPE" in summary_text
    assert "Best Sites (Lowest WAPE)" in summary_text
