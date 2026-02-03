import csv
import json
import runpy
from pathlib import Path


def _write_minimal_inputs(tmp_path: Path):
    # registry with district mapping and one site
    reg_dir = tmp_path / "data" / "sites"
    reg_dir.mkdir(parents=True, exist_ok=True)
    (reg_dir / "sites_registry.csv").write_text("site_id,district,bin_count,bin_size_liters\nS1,D1,1,1100\n", encoding="utf-8")
    (reg_dir / "sites_service.csv").write_text("site_id,service_dt,collect_volume_m3\nS1,2024-07-01,10\nS1,2024-07-08,20\n", encoding="utf-8")
    # training agg CSVs
    daily = tmp_path / "daily.csv"
    daily.write_text("date,district,actual_m3\n2024-07-01,D1,10\n", encoding="utf-8")
    monthly = tmp_path / "monthly.csv"
    monthly.write_text("year_month,district,actual_m3\n2024-07,D1,100\n", encoding="utf-8")
    return daily, monthly


def test_sites_qa_counters_present(tmp_path: Path):
    daily_csv, monthly_csv = _write_minimal_inputs(tmp_path)
    outdir = tmp_path / "deliveries_out"
    scenario = tmp_path / "site_level.yml"
    scenario.write_text("id: s\nflags:\n  enable_sites: true\n", encoding="utf-8")

    # Ensure CWD has data/sites for the script
    cwd_sites = Path.cwd() / "data" / "sites"
    cwd_sites.mkdir(parents=True, exist_ok=True)
    for p in (tmp_path / "data" / "sites").glob("*.csv"):
        (cwd_sites / p.name).write_text(p.read_text(encoding="utf-8"), encoding="utf-8")

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
    old = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/ingest_and_forecast.py", run_name="__main__")
    finally:
        sys.argv = old

    run_dirs = list(outdir.glob("phase1_run_*"))
    assert run_dirs
    qa_path = run_dirs[0] / "qa" / "checks.json"
    data = json.loads(qa_path.read_text(encoding="utf-8"))
    assert "sites" in data and data["sites"], "sites qa block missing"
    rec = data["sites"][0]["reconciliation"]
    # New counters must exist
    for k in ("unmapped_sites", "clip_applied_count", "zero_district_total_days"):
        assert k in rec
