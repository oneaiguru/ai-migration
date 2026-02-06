from __future__ import annotations

import re
from typing import Any

_TOKEN_USAGE_RE = re.compile(r"Token Usage:\s*\[[^\]]*\]\s*(?P<pct>[0-9.]+)%")
_TOKENS_RE = re.compile(r"Tokens:\s*(?P<used>[0-9,]+)\s*/\s*~?(?P<limit>[0-9,]+)")
_BURN_RATE_RE = re.compile(r"Burn Rate:\s*(?P<rate>[0-9.]+)")
_COST_RATE_RE = re.compile(r"Cost Rate:\s*\$(?P<cost>[0-9.]+)")
_MESSAGES_RE = re.compile(r"Sent Messages:\s*(?P<count>[0-9]+)")


def parse_claude_monitor_realtime(text: str) -> dict[str, Any]:
    """Parse claude-monitor realtime output into structured fields."""
    result: dict[str, Any] = {
        "token_usage_pct": None,
        "tokens_used": None,
        "token_limit": None,
        "burn_rate_per_min": None,
        "cost_rate_per_min": None,
        "message_count": None,
        "errors": [],
    }

    token_match = _TOKEN_USAGE_RE.search(text)
    if token_match:
        result["token_usage_pct"] = float(token_match.group("pct"))
    else:
        result["errors"].append("token-usage-missing")

    tokens_match = _TOKENS_RE.search(text)
    if tokens_match:
        result["tokens_used"] = _to_int(tokens_match.group("used"))
        result["token_limit"] = _to_int(tokens_match.group("limit"))
    else:
        result["errors"].append("token-count-missing")

    burn_match = _BURN_RATE_RE.search(text)
    if burn_match:
        result["burn_rate_per_min"] = float(burn_match.group("rate"))

    cost_match = _COST_RATE_RE.search(text)
    if cost_match:
        result["cost_rate_per_min"] = float(cost_match.group("cost"))

    messages_match = _MESSAGES_RE.search(text)
    if messages_match:
        result["message_count"] = int(messages_match.group("count"))

    if result["token_usage_pct"] is None:
        result["errors"].append("insufficient-data")

    result["errors"] = _dedupe(result["errors"])
    return result


def _to_int(value: str | None) -> int | None:
    if value is None:
        return None
    try:
        return int(value.replace(",", ""))
    except ValueError:
        return None


def _dedupe(items: list[str]) -> list[str]:
    seen: list[str] = []
    for item in items:
        if item not in seen:
            seen.append(item)
    return seen
