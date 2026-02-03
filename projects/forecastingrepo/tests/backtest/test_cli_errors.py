import os
import subprocess
from pathlib import Path

import pytest


@pytest.mark.spec_id("BT-002")
def test_backtest_missing_args_fails(tmp_path: Path):
    # No args -> argparse usage error
    res = subprocess.run(["python", "scripts/backtest_eval.py"], capture_output=True, text=True)
    assert res.returncode != 0


@pytest.mark.spec_id("BT-002")
def test_backtest_invalid_window_format_fails(tmp_path: Path):
    # Minimal actuals to let CLI start
    daily = tmp_path / "daily.csv"
    daily.write_text("date,district,actual_m3\n2024-09-30,D1,1\n", encoding="utf-8")
    monthly = tmp_path / "monthly.csv"
    monthly.write_text("year_month,district,actual_m3\n2024-09,D1,1\n", encoding="utf-8")

    cmd = [
        "python", "scripts/backtest_eval.py",
        "--train-until", "2024-09-30",
        "--daily-window", "bad-format-window",
        "--monthly-window", "2024-10:2024-12",
        "--scopes", "region,districts",
        "--methods", "daily=weekday_mean,monthly=last3m_mean",
        "--actual-daily", str(daily),
        "--actual-monthly", str(monthly),
        "--outdir", str(tmp_path / "reports" / "bt"),
    ]
    env = os.environ.copy()
    env.update({"PYTHONHASHSEED": "0", "TZ": "UTC", "LC_ALL": "C.UTF-8"})
    res = subprocess.run(cmd, capture_output=True, text=True, env=env)
    # Forecast CLI should fail parsing the window; backtest propagates failure
    assert res.returncode != 0

