import os
from pathlib import Path
import csv

import pytest

import scripts.quicklook_report as ql


@pytest.mark.spec_id("VIZ-001")
def test_quicklook_readers_and_plots(tmp_path: Path, monkeypatch):
    # Build tiny actual daily and monthly
    ad = tmp_path / "actual_daily.csv"
    with ad.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date", "district", "actual_m3"])
        w.writerow(["2024-12-30", "D1", "10"])  # Mon
        w.writerow(["2024-12-31", "D1", "10"])  # Tue
        w.writerow(["2024-12-30", "D2", "5"])   # Mon
        w.writerow(["2024-12-31", "D2", "5"])   # Tue

    am = tmp_path / "actual_monthly.csv"
    with am.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "district", "actual_m3"])
        w.writerow(["2024-10", "D1", "100"]) 
        w.writerow(["2024-11", "D1", "100"]) 
        w.writerow(["2024-12", "D1", "100"]) 
        w.writerow(["2024-10", "D2", "80"])  
        w.writerow(["2024-11", "D2", "80"])  
        w.writerow(["2024-12", "D2", "80"])  

    # Build tiny forecast files (daily and monthly)
    fd = tmp_path / "fore_daily.csv"
    with fd.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["level", "district", "date", "forecast_m3"])
        for d in ["2025-01-01", "2025-01-02", "2025-01-03"]:
            # region rows are ignored by reader
            w.writerow(["region", "__region__", d, "15"]) 
            w.writerow(["district", "D1", d, "10"]) 
            w.writerow(["district", "D2", d, "5"]) 

    fm = tmp_path / "fore_monthly.csv"
    with fm.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["level", "district", "year_month", "forecast_m3"])
        for ym in ["2025-01", "2025-02", "2025-03"]:
            w.writerow(["region", "__region__", ym, "180"]) 
            w.writerow(["district", "D1", ym, "100"]) 
            w.writerow(["district", "D2", ym, "80"]) 

    outdir = tmp_path / "out"
    ql.ensure_dir(outdir)

    by_date_dist = ql.read_actual_daily(str(ad))
    assert by_date_dist
    by_month_dist = ql.read_actual_monthly(str(am))
    assert by_month_dist
    by_d_fore = ql.read_forecast_daily([str(fd)])
    assert by_d_fore
    by_m_reg, by_m_dist = ql.read_forecast_monthly([str(fm)])
    assert by_m_reg and by_m_dist

    p1 = ql.save_region_monthly_chart(str(outdir), by_month_dist, by_m_reg)
    assert p1 and os.path.exists(p1)
    p2 = ql.save_top5_districts_chart(str(outdir), by_month_dist, by_m_dist, topk=2)
    assert p2 and os.path.exists(p2)

