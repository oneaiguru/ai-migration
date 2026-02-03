from __future__ import annotations

import io
from pathlib import Path

from tracker.cli import main
from tracker.meta import SCHEMA_VERSION
from tracker import __version__
from tracker.sources import parse_claude_monitor_realtime
from tracker.storage import JsonlStore

FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"


def _load(name: str) -> str:
    return (FIXTURES / name).read_text(encoding="utf-8")


def _run(argv: list[str], stdin_text: str = "") -> tuple[int, str, str]:
    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdin=io.StringIO(stdin_text), stdout=stdout, stderr=stderr)
    return exit_code, stdout.getvalue(), stderr.getvalue()


def test_parse_claude_monitor_realtime() -> None:
    result = parse_claude_monitor_realtime(_load("claude_monitor/realtime_sample.txt"))
    assert result["token_usage_pct"] == 0.0
    assert result["tokens_used"] == 0
    assert result["token_limit"] == 153378
    assert result["errors"] == []


def test_ingest_claude_monitor_snapshot(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    payload = _load("claude_monitor/realtime_sample.txt")

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "ingest",
            "claude-monitor",
            "--window",
            "W0-CM",
            "--stdin",
        ],
        payload,
    )
    assert exit_code == 0, err
    assert "stored claude monitor summary" in out

    store = JsonlStore(data_dir)
    records = store.load_claude_monitor("W0-CM")
    assert records, "expected claude monitor record"
    record = records[-1]
    assert record["schema_version"] == SCHEMA_VERSION
    assert record["tool_version"] == __version__
    parsed = record.get("parsed") or {}
    assert parsed.get("token_usage_pct") == 0.0
    assert parsed.get("token_limit") == 153378
