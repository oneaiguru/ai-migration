from __future__ import annotations

import io
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path
import csv

import pytest

from tracker import cli
from tracker.storage.jsonl import JsonlStore


def _run_git(args: list[str], cwd: Path, capture: bool = False) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=cwd,
        text=True,
        capture_output=True,
        check=True,
    )
    return result.stdout if capture else ""


def test_churn_cli_appends_json_and_ledger(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()
    _run_git(["init"], repo)
    _run_git(["config", "user.email", "tracker@example.com"], repo)
    _run_git(["config", "user.name", "Tracker Bot"], repo)

    source_file = repo / "app.py"
    source_file.write_text("print('hello')\n", encoding="utf-8")
    _run_git(["add", "app.py"], repo)
    _run_git(["commit", "-m", "baseline"], repo)
    commit_start = _run_git(["rev-parse", "HEAD"], repo, capture=True).strip()

    source_file.write_text(
        """print('hello')\nprint('world')\nprint('again')\n""",
        encoding="utf-8",
    )
    _run_git(["commit", "-am", "change"], repo)
    commit_end = _run_git(["rev-parse", "HEAD"], repo, capture=True).strip()

    data_dir = repo / "data"
    store = JsonlStore(data_dir)
    store.append_window(
        {
            "window": "W0-99",
            "providers": {},
            "features": {"codex": 2},
            "quality_score": 1.0,
            "quality": 1.0,
            "outcome": "pass",
            "notes": "test window",
            "finalized_at": datetime.now(timezone.utc).isoformat(),
            "commit_start": commit_start,
            "commit_end": commit_end,
            "methodology": "churn_cycle",
        }
    )

    ledger_path = repo / "docs" / "Ledgers" / "Churn_Ledger.csv"
    ledger_path.parent.mkdir(parents=True, exist_ok=True)

    stdout = io.StringIO()
    original_cwd = os.getcwd()
    os.chdir(repo)
    try:
        exit_code = cli.main(
            [
                "--data-dir",
                str(data_dir),
                "churn",
                "--window",
                "W0-99",
                "--ledger-path",
                str(ledger_path),
            ],
            stdout=stdout,
        )
    finally:
        os.chdir(original_cwd)
    assert exit_code == 0
    assert "churn W0-99" in stdout.getvalue()

    churn_records = store.load_churn("W0-99")
    assert len(churn_records) == 1
    churn_entry = churn_records[0]
    assert churn_entry["commit_start"] == commit_start
    assert churn_entry["commit_end"] == commit_end
    assert churn_entry["files_changed"] == 1
    assert churn_entry["insertions"] == 2
    assert churn_entry["deletions"] == 0
    assert churn_entry["features"] == 2
    assert pytest.approx(churn_entry["normalized_churn"], rel=1e-6) == 1.0

    with ledger_path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    assert rows
    last_row = rows[-1]
    assert last_row["window"] == "W0-99"
    assert last_row["provider"] == "codex"
    assert last_row["files_changed"] == "1"
    assert last_row["insertions"] == "2"
    assert last_row["deletions"] == "0"
    assert last_row["features"] == "2"
    assert last_row["normalized_churn"] == "1.00"


def test_churn_cli_skips_when_commit_missing(tmp_path: Path) -> None:
    repo = tmp_path / "repo"
    repo.mkdir()
    _run_git(["init"], repo)
    _run_git(["config", "user.email", "tracker@example.com"], repo)
    _run_git(["config", "user.name", "Tracker Bot"], repo)

    data_dir = repo / "data"
    store = JsonlStore(data_dir)
    store.append_window(
        {
            "window": "W0-MISS",
            "providers": {"codex": {"delta": {"weekly_pct": 0, "fiveh_pct": 0}}},
            "features": {"codex": 1},
            "quality_score": 1.0,
            "quality": 1.0,
            "outcome": "pass",
            "notes": "missing commit metadata",
            "finalized_at": datetime.now(timezone.utc).isoformat(),
        }
    )

    ledger_path = repo / "docs" / "Ledgers" / "Churn_Ledger.csv"
    ledger_path.parent.mkdir(parents=True, exist_ok=True)

    stdout = io.StringIO()
    original_cwd = os.getcwd()
    os.chdir(repo)
    try:
        exit_code = cli.main(
            [
                "--data-dir",
                str(data_dir),
                "churn",
                "--window",
                "W0-MISS",
                "--ledger-path",
                str(ledger_path),
            ],
            stdout=stdout,
        )
    finally:
        os.chdir(original_cwd)

    assert exit_code == 0
    out = stdout.getvalue()
    assert "warn: missing commit_start" in out
    assert "churn W0-MISS: skipped" in out

    churn_records = store.load_churn("W0-MISS")
    assert len(churn_records) == 1
    churn_entry = churn_records[0]
    assert churn_entry["commit_start"] == ""
    assert churn_entry["commit_end"] == ""
    assert churn_entry["files_changed"] == 0
    assert churn_entry["notes"].endswith("decision=missing-commit-range(commit_start)")

    with ledger_path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    assert rows
    last_row = rows[-1]
    assert last_row["window"] == "W0-MISS"
    assert last_row["notes"].endswith("decision=missing-commit-range(commit_start)")
