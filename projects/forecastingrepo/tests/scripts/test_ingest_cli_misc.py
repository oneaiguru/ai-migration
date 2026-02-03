import subprocess
import sys


def test_ingest_missing_file_fails():
    res = subprocess.run([sys.executable, "scripts/ingest_and_forecast.py", "ingest", "/no/such.xlsx"], capture_output=True, text=True)
    assert res.returncode != 0
    assert "File(s) not found" in (res.stdout + res.stderr)


def test_cli_help_ok():
    res = subprocess.run([sys.executable, "scripts/ingest_and_forecast.py", "--help"], capture_output=True, text=True)
    assert res.returncode == 0
    assert "Phase-0" in res.stdout or "forecast" in res.stdout

