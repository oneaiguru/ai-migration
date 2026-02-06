import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path

FORECAST_FIXTURE = """site_id,date,forecast_m3
site_001,2025-06-01,10.0
site_001,2025-06-02,20.0
site_001,2025-06-03,30.0
site_002,2025-06-01,5.0
site_002,2025-06-02,10.0
site_003,2025-06-01,-5.0
site_004,2025-06-01,100.0
site_004,2025-06-01,100.0
,2025-06-01,50.0
site_005,2025-06-02,
"""

SERVICE_FIXTURE = """site_id,service_dt,collect_volume_m3,volume_m3,source
site_001,2024-06-15,5.0,5.0,test
site_001,2024-07-15,5.0,5.0,test
site_002,2023-01-01,2.0,2.0,test
"""

REGISTRY_FIXTURE = """site_id,district,address,source
site_001,District A,Address 1,test
site_002,District B,Address 2,test
"""


def test_duckdb_quality_outputs(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[1]
    forecast_path = tmp_path / "forecast.csv"
    service_path = tmp_path / "service.csv"
    registry_path = tmp_path / "registry.csv"
    outdir = tmp_path / "out"

    forecast_path.write_text(FORECAST_FIXTURE)
    service_path.write_text(SERVICE_FIXTURE)
    registry_path.write_text(REGISTRY_FIXTURE)

    result = subprocess.run(
        [
            sys.executable,
            "scripts/analyze_data_quality.py",
            "--forecast-path",
            str(forecast_path),
            "--forecast-format",
            "long",
            "--service-path",
            str(service_path),
            "--registry-path",
            str(registry_path),
            "--forecast-start",
            "2025-06-01",
            "--forecast-end",
            "2025-06-03",
            "--baseline-year",
            "2024",
            "--outdir",
            str(outdir),
        ],
        capture_output=True,
        text=True,
        cwd=repo_root,
    )

    assert result.returncode == 0, result.stderr

    expected_files = [
        "REPORT.md",
        "METHODOLOGY.md",
        "coverage_missing_registry.csv",
        "coverage_no_history.csv",
        "coverage_date_gaps.csv",
        "distribution_stats.csv",
        "distribution_outliers.csv",
        "distribution_baseline.csv",
        "structural_duplicates.csv",
        "structural_nulls.csv",
        "structural_negatives.csv",
        "structural_malformed.csv",
    ]
    for name in expected_files:
        assert (outdir / name).exists(), f"Missing output: {name}"

    report = (outdir / "REPORT.md").read_text()
    assert "NOT READY" in report
    assert "duplicates=" in report
    assert "negative_forecast=" in report
    assert "null_forecast_m3=" in report
    assert "no_history=" in report

    baseline = (outdir / "distribution_baseline.csv").read_text().splitlines()
    assert baseline[0] == "site_id,total_forecast_m3,total_actual_m3,ratio,flag"
    assert len(baseline) == 1

    outliers = (outdir / "distribution_outliers.csv").read_text().splitlines()
    assert outliers[0] == "site_id,date,delta_m3"
    assert len(outliers) == 1

    missing_registry = (outdir / "coverage_missing_registry.csv").read_text().splitlines()
    assert missing_registry[0] == "site_id"
    assert len(missing_registry) > 1


def test_duckdb_quality_wide(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[1]
    forecast_path = tmp_path / "forecast_2025-06-01_2025-06-03.csv"
    days = ";".join(str(day) for day in range(1, 4))
    forecast_path.write_text(f"Код КП;{days}\nsite_001;10,0;20,0;30,0\n")
    service_path = tmp_path / "service.csv"
    registry_path = tmp_path / "registry.csv"
    outdir = tmp_path / "out"
    service_path.write_text(SERVICE_FIXTURE)
    registry_path.write_text(REGISTRY_FIXTURE)
    result = subprocess.run(
        [
            sys.executable,
            "scripts/analyze_data_quality.py",
            "--forecast-path", str(forecast_path),
            "--forecast-format", "wide",
            "--service-path", str(service_path),
            "--registry-path", str(registry_path),
            "--forecast-start", "2025-06-01",
            "--forecast-end", "2025-06-03",
            "--baseline-year", "2024",
            "--outdir", str(outdir),
        ],
        capture_output=True,
        text=True,
        cwd=repo_root,
    )
    assert result.returncode == 0, result.stderr


def test_duckdb_quality_auto_detects_wide(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[1]
    forecast_path = tmp_path / "forecast.csv"
    days = ";".join(f"{day:02d}" for day in range(1, 4))
    forecast_path.write_text(
        "\ufeffОтчет по объему вывезенных контейнеров\n"
        "Период: 01.06.2025 - 03.06.2025\n"
        "\n"
        f"Код КП;{days}\n"
        "site_001;10,0;20,0;30,0\n",
        encoding="utf-8",
    )
    service_path = tmp_path / "service.csv"
    registry_path = tmp_path / "registry.csv"
    outdir = tmp_path / "out"
    service_path.write_text(SERVICE_FIXTURE)
    registry_path.write_text(REGISTRY_FIXTURE)
    result = subprocess.run(
        [
            sys.executable,
            "scripts/analyze_data_quality.py",
            "--forecast-path", str(forecast_path),
            "--forecast-format", "auto",
            "--service-path", str(service_path),
            "--registry-path", str(registry_path),
            "--forecast-start", "2025-06-01",
            "--forecast-end", "2025-06-03",
            "--baseline-year", "2024",
            "--outdir", str(outdir),
        ],
        capture_output=True,
        text=True,
        cwd=repo_root,
    )
    assert result.returncode == 0, result.stderr


def test_duckdb_quality_rejects_monthly_resets(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[1]
    forecast_path = tmp_path / "forecast.csv"
    service_path = tmp_path / "service.csv"
    registry_path = tmp_path / "registry.csv"
    outdir = tmp_path / "out"

    start = date(2025, 6, 15)
    days = 25
    reset_offset = 16
    rows = ["site_id,date,forecast_m3"]
    value = 10.0
    for offset in range(days):
        current = start + timedelta(days=offset)
        if offset == reset_offset:
            value = 5.0
        elif offset > 0:
            value += 10.0
        rows.append(f"site_001,{current.isoformat()},{value}")
    forecast_path.write_text("\n".join(rows))
    service_path.write_text(SERVICE_FIXTURE)
    registry_path.write_text(REGISTRY_FIXTURE)

    result = subprocess.run(
        [
            sys.executable,
            "scripts/analyze_data_quality.py",
            "--forecast-path", str(forecast_path),
            "--forecast-format", "long",
            "--service-path", str(service_path),
            "--registry-path", str(registry_path),
            "--forecast-start", start.isoformat(),
            "--forecast-end", (start + timedelta(days=days - 1)).isoformat(),
            "--baseline-year", "2024",
            "--outdir", str(outdir),
        ],
        capture_output=True,
        text=True,
        cwd=repo_root,
    )
    assert result.returncode != 0
    assert "no monthly resets" in result.stderr.lower()
