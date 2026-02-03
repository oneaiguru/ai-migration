from __future__ import annotations

from pathlib import Path

from tracker.sources import parse_claude_usage, parse_codex_status

FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"


def _load(name: str) -> str:
    return (FIXTURES / name).read_text(encoding="utf-8")


def test_parse_codex_wide_snapshot() -> None:
    result = parse_codex_status(_load("codex/wide_status_82_1.txt"))
    assert result["fiveh_pct"] == 1
    assert result["weekly_pct"] == 82
    assert result["errors"] == []


def test_parse_codex_too_narrow_flags_error() -> None:
    result = parse_codex_status(_load("codex/too_narrow_missing_numbers.txt"))
    assert "insufficient-data" in result["errors"]


def test_parse_codex_multi_pane_prefers_latest_block() -> None:
    result = parse_codex_status(_load("codex/live_cases/W0-20_after_multi_status.txt"))
    assert result["fiveh_pct"] == 0
    assert result["weekly_pct"] == 10
    assert "multi-pane-trimmed" in result["errors"]


def test_parse_claude_usage_sections() -> None:
    result = parse_claude_usage(_load("claude/usage_wide_weekly_only.txt"))
    assert result["session_pct"] == 1
    assert result["all_models_pct"] == 90
    assert result.get("opus_pct") is None
    assert result["errors"] == []


def test_parse_claude_usage_not_loaded() -> None:
    result = parse_claude_usage(_load("claude/usage_failed_to_load.txt"))
    assert "usage-not-loaded" in result["errors"]
