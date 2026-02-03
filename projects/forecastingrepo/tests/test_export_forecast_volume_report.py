import subprocess
import sys
from pathlib import Path


def test_export_forecast_volume_report_infers_period(tmp_path: Path) -> None:
    repo_root = Path(__file__).resolve().parents[1]
    input_path = tmp_path / "forecast.csv"
    output_path = tmp_path / "wide.csv"
    input_path.write_text(
        "site_id,date,forecast_m3\n"
        "site_001,2025-06-01,10.0\n"
        "site_001,2025-06-02,20.0\n"
        "site_001,2025-06-03,30.0\n"
    )

    result = subprocess.run(
        [
            sys.executable,
            "scripts/export_forecast_volume_report.py",
            "--input", str(input_path),
            "--output", str(output_path),
        ],
        capture_output=True,
        text=True,
        cwd=repo_root,
    )

    assert result.returncode == 0, result.stderr
    header = output_path.read_text(encoding="utf-8").splitlines()[0].split(";")
    assert header[0] == "Код КП"
    assert header[1:] == ["1", "2", "3"]
