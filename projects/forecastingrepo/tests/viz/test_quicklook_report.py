import os
import csv
from pathlib import Path
import subprocess
import pytest


@pytest.mark.spec_id("VIZ-001")
@pytest.mark.spec_id("VIZ-002")
@pytest.mark.spec_id("VIZ-003")
@pytest.mark.spec_id("VIZ-004")
def test_quicklook_report_end_to_end(tmp_path):
    # Prepare small fixtures via existing forecast CLI
    # Minimal daily fixture
    daily = tmp_path / "daily.csv"
    with daily.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date", "district", "actual_m3"])
        w.writerow(["2024-12-30", "D1", "10"])  # Mon
        w.writerow(["2024-12-31", "D1", "10"])  # Tue
        w.writerow(["2024-12-30", "D2", "5"])   # Mon
        w.writerow(["2024-12-31", "D2", "5"])   # Tue

    # Minimal monthly fixture
    monthly = tmp_path / "monthly.csv"
    with monthly.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "district", "actual_m3"])
        w.writerow(["2024-10", "D1", "100"]) 
        w.writerow(["2024-11", "D1", "100"]) 
        w.writerow(["2024-12", "D1", "100"]) 
        w.writerow(["2024-10", "D2", "80"])  
        w.writerow(["2024-11", "D2", "80"])  
        w.writerow(["2024-12", "D2", "80"])  

    # Run forecast to produce a daily and monthly forecast file
    outdir = tmp_path / "deliveries"
    cmd = [
        "python", "scripts/ingest_and_forecast.py",
        "forecast",
        "--train-until", "2024-12-31",
        "--daily-window", "2025-01-01:2025-01-10",
        "--monthly-window", "2025-01:2025-01",
        "--scopes", "region,districts",
        "--methods", "daily=weekday_mean,monthly=last3m_mean",
        "--daily-csv", str(daily),
        "--monthly-csv", str(monthly),
        "--outdir", str(outdir)
    ]
    env = os.environ.copy()
    env["PYTHONHASHSEED"] = "0"
    res = subprocess.run(cmd, capture_output=True, text=True, env=env)
    assert res.returncode == 0, res.stderr or res.stdout

    # Locate produced forecast files
    run_dirs = sorted(outdir.glob("phase1_run_*"))
    assert run_dirs
    run_dir = run_dirs[-1]
    f_daily = list((run_dir / "forecasts").glob("daily_*.csv"))
    f_monthly = list((run_dir / "forecasts").glob("monthly_*.csv"))
    assert f_daily and f_monthly

    # Run quicklook
    q_out = tmp_path / "reports" / "quicklook_test"
    cmd2 = [
        "python", "scripts/quicklook_report.py",
        "--actual-daily", str(daily),
        "--actual-monthly", str(monthly),
        "--outdir", str(q_out)
    ]
    # Add at least one daily and one monthly forecast file
    cmd2 += ["--forecast-daily", str(f_daily[0])]
    cmd2 += ["--forecast-monthly", str(f_monthly[0])]

    env2 = os.environ.copy()
    env2["MPLBACKEND"] = "Agg"
    res2 = subprocess.run(cmd2, capture_output=True, text=True, env=env2)
    assert res2.returncode == 0, res2.stderr or res2.stdout

    # Validate outputs
    pngs = list(q_out.glob("*.png"))
    assert pngs, "No PNGs produced"
    # PNG signature check and size
    for p in pngs:
        with open(p, "rb") as fh:
            sig = fh.read(8)
            assert sig == b"\x89PNG\r\n\x1a\n"
        assert p.stat().st_size > 1024
    # REPORT.md links
    rpt = q_out / "REPORT.md"
    assert rpt.exists(), "REPORT.md missing"
    text = rpt.read_text(encoding="utf-8")
    for p in pngs:
        assert os.path.basename(p) in text
