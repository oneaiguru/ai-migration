from __future__ import annotations

import io
from pathlib import Path

from tracker.cli import main
from tracker.meta import SCHEMA_VERSION
from tracker import __version__
from tracker.sources import (
    parse_codex_ccusage,
    parse_codex_ccusage_daily,
    parse_codex_ccusage_sessions,
    parse_codex_ccusage_weekly,
)
from tracker.storage import JsonlStore

FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"


def _load(name: str) -> str:
    return (FIXTURES / name).read_text(encoding="utf-8")


def _run(argv: list[str], stdin_text: str = "") -> tuple[int, str, str]:
    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdin=io.StringIO(stdin_text), stdout=stdout, stderr=stderr)
    return exit_code, stdout.getvalue(), stderr.getvalue()


def test_parse_codex_ccusage_sessions_summary() -> None:
    result = parse_codex_ccusage_sessions(_load("ccusage/codex_sessions_sample.json"))
    assert result["scope"] == "session"
    assert result["session_count"] > 0
    assert result["total_tokens"] > 0
    assert result["cost_usd"] > 0
    assert result["latest_session"] is not None
    assert result["errors"] == []


def test_parse_codex_ccusage_daily_summary() -> None:
    result = parse_codex_ccusage_daily(_load("ccusage/codex_daily_sample.json"))
    assert result["scope"] == "daily"
    assert result["reset_at"] == "2025-10-20T21:11:00Z"
    assert result["total_tokens"] == 777777
    assert result["days"][1]["total_tokens"] == 123456
    assert result["days"][1]["percent_used"] == 12.5
    assert result["errors"] == []


def test_parse_codex_ccusage_weekly_summary() -> None:
    result = parse_codex_ccusage_weekly(_load("ccusage/codex_weekly_sample.json"))
    assert result["scope"] == "weekly"
    assert result["weekly"]["percent_used"] == 9.2
    assert result["weekly"]["tokens_used"] == 987654321
    assert result["total_tokens"] == 987654321
    assert result["errors"] == []


def test_parse_codex_ccusage_invalid_json() -> None:
    result = parse_codex_ccusage("not json", scope="daily")
    assert "invalid-json" in result["errors"]


def test_ingest_codex_ccusage_session(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    payload = _load("ccusage/codex_sessions_sample.json")

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "ingest",
            "codex-ccusage",
            "--window",
            "W0-CC",
            "--stdin",
            "--scope",
            "session",
        ],
        payload,
    )
    assert exit_code == 0, err
    assert "stored codex ccusage session summary" in out

    store = JsonlStore(data_dir)
    records = store.load_codex_ccusage("W0-CC")
    assert records, "expected codex ccusage record"
    record = records[-1]
    assert record["schema_version"] == SCHEMA_VERSION
    assert record["tool_version"] == __version__
    parsed = record.get("parsed") or {}
    assert parsed.get("session_count", 0) > 0
    assert parsed.get("total_tokens", 0) > 0
    assert parsed.get("scope") == "session"


def test_ingest_codex_ccusage_daily(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    payload = _load("ccusage/codex_daily_sample.json")

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "ingest",
            "codex-ccusage",
            "--window",
            "W0-DAILY",
            "--stdin",
            "--scope",
            "daily",
        ],
        payload,
    )
    assert exit_code == 0, err
    assert "stored codex ccusage daily summary" in out

    store = JsonlStore(data_dir)
    records = store.load_codex_ccusage("W0-DAILY")
    record = records[-1]
    assert record["schema_version"] == SCHEMA_VERSION
    assert record["tool_version"] == __version__
    parsed = record.get("parsed") or {}
    assert parsed.get("scope") == "daily"
    days = parsed.get("days") or []
    assert any(day.get("date") == "2025-10-19" for day in days)


def test_ingest_codex_ccusage_weekly(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    payload = _load("ccusage/codex_weekly_sample.json")

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "ingest",
            "codex-ccusage",
            "--window",
            "W0-WEEKLY",
            "--stdin",
            "--scope",
            "weekly",
        ],
        payload,
    )
    assert exit_code == 0, err
    assert "stored codex ccusage weekly summary" in out

    store = JsonlStore(data_dir)
    records = store.load_codex_ccusage("W0-WEEKLY")
    record = records[-1]
    assert record["schema_version"] == SCHEMA_VERSION
    assert record["tool_version"] == __version__
    parsed = record.get("parsed") or {}
    weekly = parsed.get("weekly") or {}
    assert weekly.get("percent_used") == 9.2
    assert parsed.get("scope") == "weekly"
