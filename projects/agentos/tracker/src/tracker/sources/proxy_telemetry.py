from __future__ import annotations

import json
import math
from typing import Any, Iterable

_STATUS_WHITELIST = {"ok", "success", "200", "routed", "cached"}


def parse_proxy_telemetry_stream(text: str) -> dict[str, Any]:
    """
    Parse newline-delimited JSON proxy telemetry and return a summary.

    Expected event fields per line:
      ts, rid, lane, model, status, input_tokens, output_tokens, reason, latency_ms
    """
    events: list[dict[str, Any]] = []
    errors: list[str] = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            evt = json.loads(line)
            if isinstance(evt, dict):
                events.append(evt)
        except Exception as exc:  # pragma: no cover - tolerant ingest
            errors.append(f"json-parse:{exc}")

    total = len(events)
    if total == 0:
        return {
            "total": 0,
            "routed_to_glm_pct": 0.0,
            "latency_p50_ms": None,
            "latency_p95_ms": None,
            "error_rate_pct": 0.0,
            "errors": ["no-events"],
        }

    def is_glm(evt: dict[str, Any]) -> bool:
        model = str(evt.get("model") or "").lower()
        lane = str(evt.get("lane") or "").lower()
        return ("glm" in model) or ("glm" in lane) or ("z." in model)

    routed = sum(1 for e in events if is_glm(e))
    routed_pct = (100.0 * routed / total) if total else 0.0

    latencies: list[float] = []
    for event in events:
        latency_value = event.get("latency_ms")
        numeric = _to_float(latency_value)
        if numeric is not None:
            latencies.append(numeric)
        elif latency_value not in (None, ""):
            errors.append("latency:invalid")
    latencies.sort()
    p50 = _percentile(latencies, 50.0) if latencies else None
    p95 = _percentile(latencies, 95.0) if latencies else None

    def is_error(evt: dict[str, Any]) -> bool:
        status = _normalize_status(evt.get("status"))
        reason = _normalize_status(evt.get("reason"))
        if status in _STATUS_WHITELIST or reason in _STATUS_WHITELIST:
            return False
        if not status:
            return False
        if "error" in status or "fail" in status:
            return True
        if status.isdigit():
            return status not in {"200"}
        return status not in _STATUS_WHITELIST

    errors_count = sum(1 for e in events if is_error(e))
    error_rate = (100.0 * errors_count / total) if total else 0.0

    unique_errors: list[str] = []
    for entry in errors:
        if entry not in unique_errors:
            unique_errors.append(entry)

    return {
        "total": total,
        "routed_to_glm_pct": routed_pct,
        "latency_p50_ms": p50,
        "latency_p95_ms": p95,
        "error_rate_pct": error_rate,
        "errors": unique_errors,
    }


def _percentile(data: Iterable[float], pct: float) -> float | None:
    seq = list(data)
    n = len(seq)
    if n == 0:
        return None
    k = (pct / 100.0) * (n - 1)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return float(seq[int(k)])
    d0 = seq[f] * (c - k)
    d1 = seq[c] * (k - f)
    return float(d0 + d1)


def _to_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _normalize_status(value: Any) -> str:
    return str(value or "").strip().lower()
