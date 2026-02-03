import csv
import hashlib
import os
import subprocess
from pathlib import Path

import pytest


def sha256_of_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


@pytest.mark.spec_id("BT-001")
@pytest.mark.spec_id("BT-002")
@pytest.mark.spec_id("BT-003")
@pytest.mark.spec_id("BT-004")
def test_backtest_eval_end_to_end(tmp_path: Path):
    # Tiny actuals fixtures
    daily = tmp_path / "daily.csv"
    with daily.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date", "district", "actual_m3"])
        # include a couple of pre-cutoff training days so forecast CLI can train
        for d in ["2024-09-29", "2024-09-30", "2024-12-30", "2024-12-31"]:
            w.writerow([d, "D1", "10"])  # simple values
            w.writerow([d, "D2", "5"])  

    monthly = tmp_path / "monthly.csv"
    with monthly.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "district", "actual_m3"])
        # include 3 training months up to cutoff so monthly baseline has signal
        for ym in ["2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12"]:
            w.writerow([ym, "D1", "100"])
            w.writerow([ym, "D2", "80"])

    outdir = tmp_path / "reports" / "backtest_2024-09-30"

    cmd = [
        "python",
        "scripts/backtest_eval.py",
        "--train-until", "2024-09-30",
        "--daily-window", "2024-10-01:2024-12-31",
        "--monthly-window", "2024-10:2024-12",
        "--scopes", "region,districts",
        "--methods", "daily=weekday_mean,monthly=last3m_mean",
        "--actual-daily", str(daily),
        "--actual-monthly", str(monthly),
        "--outdir", str(outdir),
    ]
    env = os.environ.copy()
    env.update({"PYTHONHASHSEED": "0", "TZ": "UTC", "LC_ALL": "C.UTF-8"})

    # First run
    res = subprocess.run(cmd, capture_output=True, text=True, env=env)
    assert res.returncode == 0, res.stderr or res.stdout

    # Files exist
    sm = outdir / "scoreboard_monthly.csv"
    sd = outdir / "scoreboard_daily.csv"
    summ = outdir / "SUMMARY.md"
    assert sm.exists() and sd.exists() and summ.exists()

    # Schemas
    with sm.open(newline="", encoding="utf-8") as f:
        hdr = next(csv.reader(f))
    assert hdr == ["level", "district", "year_month", "actual", "forecast", "wape", "smape", "mae"]
    with sd.open(newline="", encoding="utf-8") as f:
        hdrd = next(csv.reader(f))
    assert hdrd == ["level", "district", "date", "actual", "forecast", "wape", "smape", "mae"]

    # Non-empty
    assert sum(1 for _ in open(sm, encoding="utf-8")) > 1
    assert sum(1 for _ in open(sd, encoding="utf-8")) > 1

    # Determinism: run again
    res2 = subprocess.run(cmd, capture_output=True, text=True, env=env)
    assert res2.returncode == 0, res2.stderr or res2.stdout
    h1_sm, h1_sd = sha256_of_file(str(sm)), sha256_of_file(str(sd))
    h2_sm, h2_sd = sha256_of_file(str(sm)), sha256_of_file(str(sd))
    assert h1_sm == h2_sm and h1_sd == h2_sd

    # Region equals sum of districts
    def read_rows(fp, date_key):
        rows = list(csv.DictReader(open(fp, newline="", encoding="utf-8")))
        # group by key
        by_key = {}
        for r in rows:
            k = r[date_key]
            by_key.setdefault(k, []).append(r)
        return by_key

    # Daily
    daily_by_date = read_rows(sd, "date")
    for k, rows in daily_by_date.items():
        dist_sum = sum(float(r["forecast"]) for r in rows if r["level"] == "district")
        reg = next((float(r["forecast"]) for r in rows if r["level"] == "region"), None)
        assert reg is not None
        assert abs(reg - dist_sum) < 1e-9
    # Monthly
    mon_by_ym = read_rows(sm, "year_month")
    for k, rows in mon_by_ym.items():
        dist_sum = sum(float(r["forecast"]) for r in rows if r["level"] == "district")
        reg = next((float(r["forecast"]) for r in rows if r["level"] == "region"), None)
        assert reg is not None
        assert abs(reg - dist_sum) < 1e-9
