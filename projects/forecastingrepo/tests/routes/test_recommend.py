import csv
import runpy
from pathlib import Path


def _mk_sites_csv(tmp_path: Path) -> Path:
    p = tmp_path / "daily_fill_demo.csv"
    with p.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site_id","date","fill_pct","pred_volume_m3","overflow_prob"])  # header
        w.writerow(["S1","2025-01-03","0.82","12","0.67"])  # should pass strict
        w.writerow(["S2","2025-01-03","0.40","7","0.10"])   # no
        w.writerow(["S3","2025-01-03","0.55","8","0.20"])   # showcase
    return p


def test_routes_recommend_strict_and_showcase(tmp_path: Path):
    sites = _mk_sites_csv(tmp_path)
    routes_dir = tmp_path / "routes"

    # Strict
    argv = [
        "routes_recommend.py",
        "--sites-csv", str(sites),
        "--d-day", "2025-01-03",
        "--lookahead", "3",
        "--policy", "risk>=0.8 or fill>=0.8",
        "--outdir", str(routes_dir)
    ]
    import sys
    old = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/routes_recommend.py", run_name="__main__")
    finally:
        sys.argv = old
    strict = routes_dir / "recommendations_strict_2025-01-03.csv"
    assert strict.exists()
    rows1 = list(csv.DictReader(strict.open()))
    assert any(int(r["visit"]) == 1 for r in rows1)

    # Showcase
    argv[argv.index("--policy")+1] = "fill>=0.5"
    try:
        sys.argv = argv
        runpy.run_path("scripts/routes_recommend.py", run_name="__main__")
    finally:
        sys.argv = old
    showcase = routes_dir / "recommendations_showcase_2025-01-03.csv"
    assert showcase.exists()
    rows2 = list(csv.DictReader(showcase.open()))
    assert sum(int(r["visit"]) for r in rows2) >= 2

