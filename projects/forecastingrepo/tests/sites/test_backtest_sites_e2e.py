import csv
import hashlib
from pathlib import Path
import runpy

import pytest


def _hash(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            h.update(chunk)
    return h.hexdigest()


@pytest.mark.spec_id("SITE-BT-E2E-001")
def test_backtest_sites_e2e_deterministic(tmp_path: Path, monkeypatch):
    # Tiny deterministic fixtures
    svc = tmp_path / "sites_service.csv"
    with svc.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id", "service_dt", "collect_volume_m3"])  # header
        w.writerow(["S1", "2024-10-01", "10"])  # Oct
        w.writerow(["S1", "2024-11-01", "30"])  # Nov

    sites_csv = tmp_path / "daily_fill_2024-10-01_to_2024-11-30.csv"
    with sites_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"])  # header
        w.writerow(["S1", "2024-10-01", "0.5", "10", "0"])  # exact
        w.writerow(["S1", "2024-11-01", "0.7", "30", "1"])  # exact

    out1 = tmp_path / "out1"
    out2 = tmp_path / "out2"

    argv = [
        "backtest_sites.py",
        "--train-until", "2024-09-30",
        "--daily-window", "2024-10-01:2024-11-30",
        "--monthly-window", "2024-10:2024-11",
        "--sites-registry", str(tmp_path / "sites_registry.csv"),
        "--sites-service", str(svc),
        "--outdir", str(out1),
        "--use-existing-sites-csv", str(sites_csv),
    ]

    import sys, os
    env = os.environ.copy()
    env.update({"PYTHONHASHSEED": "0", "TZ": "UTC", "LC_ALL": "C.UTF-8"})
    old = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/backtest_sites.py", run_name="__main__")
    finally:
        sys.argv = old

    # second run to different outdir
    argv[-3] = str(out2)  # replace outdir arg value
    try:
        sys.argv = argv
        runpy.run_path("scripts/backtest_sites.py", run_name="__main__")
    finally:
        sys.argv = old

    # Compare hashes for deterministic outputs
    for name in ["scoreboard_site_daily.csv", "scoreboard_site_monthly.csv", "SUMMARY.md"]:
        p1 = (out1 / name)
        p2 = (out2 / name)
        assert p1.exists() and p2.exists()
        assert _hash(p1) == _hash(p2)
    assert "Overall site-level WAPE" in (out1 / "SUMMARY.md").read_text(encoding="utf-8")
