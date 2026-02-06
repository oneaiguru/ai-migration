from __future__ import annotations

import re
from typing import Any

_ANSI_RE = re.compile(r"\x1b\[[0-9;?]*[ -/]*[@-~]")
_STATUS_BLOCK_RE = re.compile(
    r"(?:^|\n)/status(?P<block>.*?)(?=(?:\n/status)|\Z)",
    re.DOTALL,
)
_BAR_RE = re.compile(
    r"""
    (?P<label>5h\s*limit|Weekly\s*limit)
    \s*:\s*\[[^\]]*\]\s*
    (?P<value>\d+)%
    \s*u\s*s\s*e\s*d
    (?:.*?\(\s*resets?\s*(?P<reset>[^)]+)\))?
    """,
    re.IGNORECASE | re.DOTALL | re.VERBOSE,
)


def _strip_ansi(text: str) -> str:
    return _ANSI_RE.sub("", text)


def _dedupe(errors: list[str]) -> list[str]:
    seen: list[str] = []
    for err in errors:
        if err not in seen:
            seen.append(err)
    return seen


def parse_codex_status(text: str) -> dict[str, Any]:
    """Parse Codex CLI `/status` output into structured fields."""
    sanitized = _strip_ansi(text)
    status_blocks = [match.group("block") for match in _STATUS_BLOCK_RE.finditer(sanitized)]
    multi_pane = len(status_blocks) > 1
    target = status_blocks[-1] if status_blocks else sanitized
    result: dict[str, Any] = {
        "fiveh_pct": None,
        "fiveh_resets": None,
        "weekly_pct": None,
        "weekly_resets": None,
        "errors": [],
    }

    for match in _BAR_RE.finditer(target):
        label = (match.group("label") or "").lower()
        pct = int(match.group("value"))
        reset = (match.group("reset") or "").strip() or None
        if "5h" in label:
            result["fiveh_pct"] = pct
            result["fiveh_resets"] = reset
        elif "weekly" in label:
            result["weekly_pct"] = pct
            result["weekly_resets"] = reset

    if result["fiveh_pct"] is None and result["weekly_pct"] is None:
        result["errors"].append("insufficient-data")
    if multi_pane:
        result["errors"].append("multi-pane-trimmed")

    result["errors"] = _dedupe(result["errors"])
    return result
