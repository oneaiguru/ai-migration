import os
import subprocess
import sys
import csv
import shutil
from pathlib import Path
import pytest

# Ensure repo root is on sys.path for 'scripts' imports
sys.path.insert(0, str(Path.cwd()))


def spec_id(id: str):
    return pytest.mark.spec_id(id)


@pytest.fixture
def tmp_run(tmp_path: Path):
    out = tmp_path / "deliveries"
    out.mkdir()
    return out


@pytest.fixture
def small_fixtures(tmp_path: Path):
    # Create small daily/monthly fixtures covering late 2024
    data_dir = tmp_path / "fixtures"
    data_dir.mkdir()
    daily = data_dir / "daily_small.csv"
    monthly = data_dir / "monthly_small.csv"

    # Two districts with a handful of non-zero days in the last 56d window
    # Cutoff: 2024-12-31
    rows = [
        ("2024-12-23", "D1", 5.0),   # Monday
        ("2024-12-25", "D1", 8.0),   # Wednesday
        ("2024-12-30", "D1", 10.0),  # Monday
        ("2024-12-31", "D1", 20.0),  # Tuesday
        ("2024-12-23", "D2", 3.0),   # Monday
        ("2024-12-25", "D2", 5.0),   # Wednesday
        ("2024-12-30", "D2", 7.0),   # Monday
        ("2024-12-31", "D2", 14.0),  # Tuesday
    ]
    with daily.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date", "district", "actual_m3"])
        for r in rows:
            w.writerow(r)

    mrows = [
        ("2024-10", "D1", 100.0),
        ("2024-11", "D1", 110.0),
        ("2024-12", "D1", 120.0),
        ("2024-10", "D2", 80.0),
        ("2024-11", "D2", 90.0),
        ("2024-12", "D2", 100.0),
    ]
    with monthly.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["year_month", "district", "actual_m3"])
        for r in mrows:
            w.writerow(r)

    return {
        "daily_csv": str(daily),
        "monthly_csv": str(monthly),
    }


def run_cli_forecast(daily_csv: str, monthly_csv: str, outdir: Path, windows):
    cmd = [
        sys.executable,
        "scripts/ingest_and_forecast.py",
        "forecast",
        "--train-until",
        "2024-12-31",
        "--scopes",
        "region,districts",
        "--methods",
        "daily=weekday_mean,monthly=last3m_mean",
        "--daily-csv",
        daily_csv,
        "--monthly-csv",
        monthly_csv,
        "--outdir",
        str(outdir),
    ] + windows
    env = os.environ.copy()
    env["PYTHONHASHSEED"] = "0"
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(Path.cwd()), env=env)
    assert res.returncode == 0, res.stderr or res.stdout
    # Return latest run dir path
    runs = sorted(outdir.glob("phase1_run_*"))
    assert runs, "No run directory created"
    return runs[-1]


@pytest.fixture
def accuracy_testbed(tmp_path: Path, monkeypatch):
    """
    Copy minimal accuracy CSV fixtures into a temp reports directory and
    provide a helper for constructing a TestClient bound to that dataset.
    """
    tests_root = Path(__file__).resolve().parent
    repo_root = tests_root.parent
    candidates = [
        repo_root / "tests" / "fixtures" / "accuracy",
        repo_root / "fixtures" / "accuracy",
    ]
    fixtures_root = next((path for path in candidates if path.exists()), None)
    if fixtures_root is None:
        raise FileNotFoundError("tests/fixtures/accuracy not found")
    dest = tmp_path / "reports"
    shutil.copytree(fixtures_root, dest)

    def _make_client():
        from fastapi.testclient import TestClient
        from scripts.api_app import create_app

        monkeypatch.setenv("ACCURACY_REPORTS_DIR", str(dest))
        return TestClient(create_app())

    return {"root": dest, "make_client": _make_client, "monkeypatch": monkeypatch}


@pytest.fixture
def client_with_tmp_env(tmp_path: Path, monkeypatch):
    """
    Factory fixture to create a FastAPI TestClient backed by tiny, per-test CSV fixtures
    without touching repo data. It patches scripts.api_app module constants and
    optional registry mapping for deterministic behavior.
    """

    def _make(
        *,
        sites_rows: list[dict] | None = None,
        routes_rows: list[dict] | None = None,
        registry_map: dict[str, str] | None = None,
    ):
        # Layout
        sites_dir = tmp_path / "sites_demo"
        routes_dir = sites_dir / "routes"
        sites_dir.mkdir(parents=True, exist_ok=True)
        routes_dir.mkdir(parents=True, exist_ok=True)

        # Default minimal rows
        if sites_rows is None:
            sites_rows = [
                {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.5", "overflow_prob": "0.1", "pred_volume_m3": "12.3", "last_service_dt": "2024-08-01"},
                {"site_id": "S2", "date": "2024-08-03", "fill_pct": "0.8", "overflow_prob": "0.2", "pred_volume_m3": "15.0"},
            ]
        if routes_rows is None:
            routes_rows = [
                {"site_id": "S1", "date": "2024-08-03", "policy": "strict", "visit": "1", "volume_m3": "3.5", "schedule": "Morning, Shift"},
                {"site_id": "S3", "date": "2024-08-03", "policy": "strict", "visit": "0", "volume_m3": "", "schedule": ""},
            ]

        # Write sites daily CSV covering the date window
        daily_path = sites_dir / "daily_fill_2024-08-01_to_2024-08-10.csv"
        with daily_path.open("w", newline="", encoding="utf-8") as f:
            import csv as _csv
            fieldnames = ["site_id", "date", "fill_pct", "overflow_prob", "pred_volume_m3", "last_service_dt"]
            w = _csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            for r in sites_rows:
                w.writerow(r)

        # Write routes recommendation CSV for strict policy
        routes_path = routes_dir / "recommendations_strict_2024-08-03.csv"
        with routes_path.open("w", newline="", encoding="utf-8") as f:
            import csv as _csv
            fieldnames = ["site_id", "date", "policy", "visit", "volume_m3", "schedule"]
            w = _csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            for r in routes_rows:
                w.writerow(r)

        # Patch api_app module paths and optional registry
        import importlib
        import scripts.api_app as api_app
        monkeypatch.setattr(api_app, "SITES_DATA_DIR", sites_dir, raising=False)
        monkeypatch.setattr(api_app, "DELIVERIES_DIR", tmp_path / "deliveries", raising=False)
        if registry_map is not None:
            def _fake_load_registry():
                # Return mapping and a fake path for observability
                return registry_map, tmp_path / "data" / "sites" / "sites_registry.csv"
            monkeypatch.setattr(api_app, "_load_registry", _fake_load_registry, raising=False)

        import fastapi  # ensure fastapi available
        from fastapi.testclient import TestClient
        import scripts.api_app as api_app2
        app = api_app2.create_app()
        return TestClient(app), {"sites_dir": sites_dir, "routes_dir": routes_dir}

    return _make
