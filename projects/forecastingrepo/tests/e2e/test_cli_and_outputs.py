import csv
import json
import conftest as cf


@cf.spec_id("CLI-001")
def test_cli_forecast_creates_phase1_delivery(tmp_run, small_fixtures):
    run_dir = cf.run_cli_forecast(
        small_fixtures["daily_csv"],
        small_fixtures["monthly_csv"],
        tmp_run,
        [
            "--daily-window",
            "2025-01-01:2025-01-10",
            "--monthly-window",
            "2025-01:2025-01",
        ],
    )
    # basic structure
    assert (run_dir / "forecasts").is_dir()
    assert (run_dir / "qa").is_dir()
    assert (run_dir / "metadata" / "run.json").exists()
    assert (run_dir / "summary" / "POC_summary.md").exists()
    assert (run_dir / "delivery.zip").exists()


@cf.spec_id("REG-004")
def test_region_canonical_and_debug_csv(tmp_run, small_fixtures):
    run_dir = cf.run_cli_forecast(
        small_fixtures["daily_csv"],
        small_fixtures["monthly_csv"],
        tmp_run,
        [
            "--daily-window",
            "2025-01-01:2025-01-10",
            "--monthly-window",
            "2025-01:2025-01",
        ],
    )
    # Client CSVs
    daily_csvs = list((run_dir / "forecasts").glob("daily_*.csv"))
    assert daily_csvs
    for f in daily_csvs:
        # region rows are present and equal to sum of districts
        rows = list(csv.DictReader(open(f, newline="", encoding="utf-8")))
        by_date = {}
        for r in rows:
            if r["level"] == "district":
                by_date.setdefault(r["date"], 0.0)
                by_date[r["date"]] += float(r["forecast_m3"]) 
        for r in rows:
            if r["level"] == "region":
                assert abs(float(r["forecast_m3"]) - by_date[r["date"]]) < 1e-9

    # Debug CSVs (exist and have schema)
    dbg = list((run_dir / "qa").glob("daily_region_debug_*.csv"))
    assert dbg
    with open(dbg[0], encoding="utf-8") as f:
        hdr = next(csv.reader(f))
    assert hdr == ["date", "aux_region_direct", "districts_sum", "delta_pct"]


@cf.spec_id("QA-005")
def test_qa_and_metadata_contract(tmp_run, small_fixtures):
    run_dir = cf.run_cli_forecast(
        small_fixtures["daily_csv"],
        small_fixtures["monthly_csv"],
        tmp_run,
        ["--daily-window", "2025-01-01:2025-01-05", "--monthly-window", "2025-01:2025-01"],
    )
    with open(run_dir / "qa" / "checks.json", encoding="utf-8") as f:
        checks = json.load(f)
    assert "daily" in checks and "monthly" in checks
    assert checks["daily"][0]["coverage_ok"] is True
    assert "region_warnings" in checks["daily"][0]

    with open(run_dir / "metadata" / "run.json", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta.get("phase_name") == "Phase 1 (POC)"
    assert meta.get("cutoff") == "2024-12-31"
    assert "inputs" in meta and "outputs" in meta


@cf.spec_id("WIN-006")
def test_no_duplicates_within_file(tmp_run, small_fixtures):
    run_dir = cf.run_cli_forecast(
        small_fixtures["daily_csv"],
        small_fixtures["monthly_csv"],
        tmp_run,
        ["--daily-window", "2025-01-01:2025-01-10"],
    )
    f = next((run_dir / "forecasts").glob("daily_*.csv"))
    seen = set()
    with open(f, newline="", encoding="utf-8") as fh:
        for row in csv.DictReader(fh):
            if row["level"] != "district":
                continue
            key = (row["date"], row["district"])
            assert key not in seen
            seen.add(key)
