import csv
import pytest


@pytest.mark.spec_id("MONTHLY-003")
def test_last3_months_mean(tmp_path):
    monthly = tmp_path / "monthly.csv"
    with monthly.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "district", "actual_m3"])
        w.writerow(["2024-10", "D1", "80"])  
        w.writerow(["2024-11", "D1", "100"]) 
        w.writerow(["2024-12", "D1", "120"]) 

    # Minimal daily to satisfy CLI
    daily = tmp_path / "daily.csv"
    with daily.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date", "district", "actual_m3"])
        # Provide at least one daily record before cutoff so CLI training has districts
        w.writerow(["2024-12-31", "D1", "0"])  

    from conftest import run_cli_forecast

    run_dir = run_cli_forecast(
        str(daily), str(monthly), tmp_path, ["--monthly-window", "2025-01:2025-01"]
    )
    out = next((run_dir / "forecasts").glob("monthly_*.csv"))
    import csv as _csv

    got = None
    with out.open(newline="", encoding="utf-8") as fh:
        for r in _csv.DictReader(fh):
            if r["level"] == "district" and r["district"] == "D1":
                got = float(r["forecast_m3"])
                break
    assert got is not None
    assert abs(got - (80 + 100 + 120) / 3) < 1e-9
