import json
from pathlib import Path

import pytest

from scripts import usage_ingest


FIXTURES_DIR = Path(__file__).resolve().parents[1] / "fixtures"


def _read_fixture(relative: str) -> str:
    path = FIXTURES_DIR / relative
    return path.read_text(encoding="utf-8")


def test_parse_codex_status_wide_status_82_1() -> None:
    text = _read_fixture("codex/wide_status_82_1.txt")

    result = usage_ingest.parse_codex_status(text)

    assert result["fiveh_pct"] == 1
    assert result["fiveh_resets"] == "13:01"
    assert result["week_all_pct"] == 82
    assert result["week_all_resets"] == "21:29 on 19 Oct"


def test_parse_claude_status_usage_wide_90_1_0() -> None:
    text = _read_fixture("claude/usage_wide_90_1_0.txt")

    result = usage_ingest.parse_claude_status(text)

    assert result["session_pct"] == 1
    assert result["session_resets"] == "8:59pm (Asia/Irkutsk)"
    assert result["week_all_pct"] == 90
    assert result["week_all_resets"] == "Oct 20, 1:59am (Asia/Irkutsk)"

