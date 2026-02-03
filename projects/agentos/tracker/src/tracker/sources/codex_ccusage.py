from __future__ import annotations

import json
from typing import Any, Dict, List


def parse_codex_ccusage(text: str, *, scope: str = "session") -> dict[str, Any]:
    """Parse ccusage Codex JSON for the requested scope."""

    normalized = (scope or "session").lower()
    if normalized == "daily":
        parsed = parse_codex_ccusage_daily(text)
    elif normalized == "weekly":
        parsed = parse_codex_ccusage_weekly(text)
    else:
        parsed = parse_codex_ccusage_sessions(text)
    parsed["scope"] = normalized
    parsed["errors"] = _dedupe(parsed.get("errors") or [])
    return parsed


def parse_codex_ccusage_sessions(text: str) -> dict[str, Any]:
    """Parse ccusage Codex session JSON into aggregated metrics."""
    result: dict[str, Any] = {
        "scope": "session",
        "session_count": 0,
        "total_tokens": 0,
        "cost_usd": 0.0,
        "latest_session": None,
        "sessions": [],
        "errors": [],
    }

    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        result["errors"].append("invalid-json")
        return result

    sessions = payload.get("sessions")
    if not isinstance(sessions, list):
        result["errors"].append("invalid-sessions")
        return result

    parsed_sessions: List[Dict[str, Any]] = []
    latest_session: Dict[str, Any] | None = None
    latest_activity = ""

    total_tokens_accum = 0
    cost_accum = 0.0

    for session in sessions:
        if not isinstance(session, dict):
            continue
        session_id = session.get("sessionId")
        total_tokens = _to_int(session.get("totalTokens"))
        cost_usd = _to_float(session.get("costUSD")) or 0.0
        last_activity = str(session.get("lastActivity") or "")

        parsed_sessions.append(
            {
                "session_id": session_id,
                "total_tokens": total_tokens,
                "cost_usd": cost_usd,
                "last_activity": last_activity,
            }
        )

        if total_tokens is not None:
            total_tokens_accum += total_tokens
        cost_accum += cost_usd

        if last_activity and last_activity >= latest_activity:
            latest_activity = last_activity
            latest_session = {
                "session_id": session_id,
                "total_tokens": total_tokens,
                "cost_usd": cost_usd,
                "last_activity": last_activity,
            }

    if not parsed_sessions:
        result["errors"].append("no-sessions")

    totals = payload.get("totals")
    totals_tokens = _to_int(_safe_get(totals, "totalTokens"))
    totals_cost = _to_float(_safe_get(totals, "costUSD"))

    if totals_tokens is not None:
        total_tokens_accum = totals_tokens
    if totals_cost is not None:
        cost_accum = totals_cost

    result.update(
        {
            "session_count": len(parsed_sessions),
            "total_tokens": total_tokens_accum,
            "cost_usd": cost_accum,
            "latest_session": latest_session,
            "sessions": parsed_sessions,
        }
    )

    result["errors"] = _dedupe(result["errors"])
    return result


def parse_codex_ccusage_daily(text: str) -> dict[str, Any]:
    """Parse daily ccusage summary output."""
    result: dict[str, Any] = {
        "scope": "daily",
        "generated_at": None,
        "reset_at": None,
        "days": [],
        "total_tokens": 0,
        "cost_usd": 0.0,
        "errors": [],
    }
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        result["errors"].append("invalid-json")
        return result

    result["generated_at"] = payload.get("generated_at") or payload.get("generatedAt")
    result["reset_at"] = payload.get("resetAt") or payload.get("reset_at")

    days_payload = payload.get("days")
    if not isinstance(days_payload, list):
        alt_days = payload.get("daily")
        if isinstance(alt_days, list):
            days_payload = alt_days
        else:
            result["errors"].append("invalid-days")
            days_payload = []

    parsed_days: List[Dict[str, Any]] = []
    total_tokens_accum = 0
    cost_accum = 0.0

    for day in days_payload:
        if not isinstance(day, dict):
            continue
        date = str(day.get("date") or "")
        tokens_value = _to_int(day.get("totalTokens") or day.get("tokens"))
        percent_value = _to_float(day.get("percentUsed") or day.get("percent"))
        cost_value = _to_float(day.get("costUSD") or day.get("cost"))

        if tokens_value is not None:
            total_tokens_accum += tokens_value
        if cost_value is not None:
            cost_accum += cost_value

        parsed_days.append(
            {
                "date": date,
                "total_tokens": tokens_value,
                "percent_used": percent_value,
                "cost_usd": cost_value,
            }
        )

    if not parsed_days:
        result["errors"].append("no-days")

    totals = payload.get("totals")
    totals_tokens = _to_int(_safe_get(totals, "totalTokens"))
    totals_cost = _to_float(_safe_get(totals, "costUSD"))

    result["days"] = parsed_days
    result["total_tokens"] = totals_tokens if totals_tokens is not None else total_tokens_accum
    result["cost_usd"] = totals_cost if totals_cost is not None else cost_accum
    result["errors"] = _dedupe(result["errors"])
    return result


def parse_codex_ccusage_weekly(text: str) -> dict[str, Any]:
    """Parse weekly ccusage summary output."""
    result: dict[str, Any] = {
        "scope": "weekly",
        "generated_at": None,
        "reset_at": None,
        "weekly": {},
        "total_tokens": 0,
        "errors": [],
    }
    try:
        payload = json.loads(text)
    except json.JSONDecodeError:
        result["errors"].append("invalid-json")
        return result

    result["generated_at"] = payload.get("generated_at") or payload.get("generatedAt")
    result["reset_at"] = payload.get("resetAt") or payload.get("reset_at")

    current_week = payload.get("currentWeek") or payload.get("week")
    if isinstance(current_week, dict):
        percent_used = _to_float(current_week.get("percentUsed") or current_week.get("percent"))
        tokens_used = _to_int(current_week.get("tokensUsed") or current_week.get("totalTokens"))
        tokens_remaining = _to_int(current_week.get("tokensRemaining"))
        cost_usd = _to_float(current_week.get("costUSD") or current_week.get("cost"))
        week_info = {
            "start_date": current_week.get("startDate") or current_week.get("start"),
            "end_date": current_week.get("endDate") or current_week.get("end"),
            "percent_used": percent_used,
            "tokens_used": tokens_used,
            "tokens_remaining": tokens_remaining,
            "cost_usd": cost_usd,
        }
        result["weekly"] = week_info
        if tokens_used is not None:
            result["total_tokens"] = tokens_used
    else:
        result["errors"].append("invalid-week")

    result["errors"] = _dedupe(result["errors"])
    return result


def _safe_get(mapping: Any, key: str) -> Any:
    if isinstance(mapping, dict):
        return mapping.get(key)
    return None


def _to_float(value: Any) -> float | None:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _to_int(value: Any) -> int | None:
    try:
        if value is None:
            return None
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _dedupe(items: List[str]) -> List[str]:
    seen: List[str] = []
    for item in items:
        if item not in seen:
            seen.append(item)
    return seen
