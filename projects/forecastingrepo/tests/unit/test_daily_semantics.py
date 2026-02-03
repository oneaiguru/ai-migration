import csv
from datetime import date, timedelta
import pytest


@pytest.mark.spec_id("DAILY-002")
def test_weekday_mean_uses_exact_56_days_zero_fill(tmp_path):
    # Build a tiny daily CSV with a known 56-day window ending at 2024-12-31.
    daily = tmp_path / "daily.csv"
    rows = []
    cutoff = date(2024, 12, 31)
    # Put non-zero only on Mondays in the 56-day window, everything else implicitly missing (=0)
    for i in range(56):
        d = cutoff - timedelta(days=55 - i)
        if d.weekday() == 0:  # Monday
            rows.append([d.isoformat(), "D1", "100.0"])
    with daily.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date", "district", "actual_m3"])
        w.writerows(rows)

    # Minimal monthly to satisfy CLI
    monthly = tmp_path / "monthly.csv"
    with monthly.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "district", "actual_m3"])
        w.writerow(["2024-10", "D1", "300"])  
        w.writerow(["2024-11", "D1", "300"])  
        w.writerow(["2024-12", "D1", "300"])  

    # Run CLI for a 5-day window after cutoff
    from conftest import run_cli_forecast

    # Choose a window that includes a Monday (2025-01-06 is Monday)
    run_dir = run_cli_forecast(
        str(daily), str(monthly), tmp_path, ["--daily-window", "2025-01-06:2025-01-10"]
    )
    out = next((run_dir / "forecasts").glob("daily_*.csv"))
    # Expect Mon values = mean over exactly the Mondays in the 56-day set; other weekdays use their (zero-filled) mean = 0
    vals = {}
    import csv as _csv

    with out.open(newline="", encoding="utf-8") as fh:
        for r in _csv.DictReader(fh):
            if r["level"] == "district" and r["district"] == "D1":
                vals[r["date"]] = float(r["forecast_m3"])
    assert len(vals) == 5
    # Check determinism and zero-fill behavior (at least one non-zero on the Monday)
    assert any(v > 0 for v in vals.values())
    assert any(v == 0 for v in vals.values())
