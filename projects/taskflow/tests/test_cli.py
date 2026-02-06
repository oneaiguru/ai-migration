import os
import subprocess
import sys
import json
from pathlib import Path


def run_cli(tmp_path, *args):
    env = os.environ.copy()
    env["TELEGRAM_TOKEN"] = "dummy"
    env["ALLOW_MISSING_TOKEN"] = "1"
    env["REPO_PATH"] = str(tmp_path)
    # Provide repository root on sys.path for the CLI
    root = Path(__file__).resolve().parents[1]
    env["PYTHONPATH"] = str(root / "src")
    cli_path = Path(__file__).resolve().parents[1] / "src" / "cli.py"
    result = subprocess.run(
        [sys.executable, str(cli_path), *args],
        cwd=tmp_path,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout


def run_cli_no_pythonpath(tmp_path, *args):
    env = os.environ.copy()
    env["TELEGRAM_TOKEN"] = "dummy"
    env["ALLOW_MISSING_TOKEN"] = "1"
    env["REPO_PATH"] = str(tmp_path)
    cli_path = Path(__file__).resolve().parents[1] / "src" / "cli.py"
    result = subprocess.run(
        [sys.executable, str(cli_path), *args],
        cwd=tmp_path,
        env=env,
        capture_output=True,
        text=True,
        check=True,
    )
    return result.stdout


def test_create_and_list(tmp_path):
    run_cli(tmp_path, "task", "create", "T01", "My Task")
    data = json.loads((tmp_path / "tasks.json").read_text())
    assert "T01" in data
    output = run_cli(tmp_path, "task", "list")
    assert "T01" in output


def test_status_update(tmp_path):
    run_cli(tmp_path, "task", "create", "T02", "Another")
    run_cli(tmp_path, "task", "status", "T02", "--set", "completed")
    data = json.loads((tmp_path / "tasks.json").read_text())
    assert data["T02"]["status"] == "completed"


def test_cli_import_without_pythonpath(tmp_path):
    run_cli_no_pythonpath(tmp_path, "task", "list")
