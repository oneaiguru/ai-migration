"""Metrics rollups for AgentOS unified telemetry."""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

from agentos.schemas import validate

SUMMARY_FILENAME = "metrics_summary.json"

__all__ = [
    "SUMMARY_FILENAME",
    "load_jsonl",
    "load_events",
    "compute_summary",
    "write_summary",
]


def load_jsonl(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        return []
    records: List[Dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            records.append(json.loads(line))
    return records


def load_events(event_path: Path) -> List[Dict[str, Any]]:
    return load_jsonl(event_path)


def _collect_measurements(events: Iterable[Dict[str, Any]]) -> Tuple[List[float], List[float], List[float], float, float]:
    cls_values: List[float] = []
    impf_values: List[float] = []
    churn_values: List[float] = []
    feature_sum = 0.0
    capacity_sum = 0.0
    for event in events:
        measurement = event.get("measurement")
        if measurement:
            if measurement.get("cls") is not None:
                cls_values.append(float(measurement["cls"]))
            if measurement.get("impf") is not None:
                impf_values.append(float(measurement["impf"]))
            if measurement.get("churn_score") is not None:
                churn_values.append(float(measurement["churn_score"]))
            if measurement.get("feature_delta") is not None:
                feature_sum += float(measurement["feature_delta"])
        turn = event.get("turn")
        if turn and turn.get("capacity_used") is not None:
            capacity_sum += float(turn["capacity_used"])
    return cls_values, impf_values, churn_values, feature_sum, capacity_sum


def compute_summary(
    events: Iterable[Dict[str, Any]],
    *,
    model_health: Dict[str, Dict[str, Any]] | None = None,
) -> Dict[str, Any]:
    events = list(events)
    session_ids = {evt.get("session", {}).get("session_id") for evt in events if evt.get("type") == "session"}
    turns = [evt for evt in events if evt.get("type") == "turn"]

    cls_values, impf_values, churn_values, feature_sum, capacity_sum = _collect_measurements(turns)

    def _average(values: List[float]) -> float | None:
        return sum(values) / len(values) if values else None

    model_value: Dict[str, float] = defaultdict(float)
    for event in turns:
        turn = event.get("turn", {})
        for model, contribution in (turn.get("attribution") or {}).items():
            model_value[model] += float(contribution)

    summary: Dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "sessions": len({sid for sid in session_ids if sid}),
        "turns": len(turns),
        "features_shipped": feature_sum,
        "capacity_used": capacity_sum,
        "features_per_capacity": (feature_sum / capacity_sum) if capacity_sum else None,
        "avg_cls": _average(cls_values),
        "avg_impf": _average(impf_values),
        "avg_churn_score": _average(churn_values),
        "model_value": dict(model_value),
    }

    if model_health:
        summary["model_health"] = model_health

    return summary


def write_summary(summary: Dict[str, Any], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(summary, handle, indent=2, sort_keys=True)
        handle.write("\n")


def validate_event_payload(event: Dict[str, Any]) -> None:
    event_type = event.get("type")
    if event_type == "session":
        validate("session", event.get("session", {}))
    elif event_type == "turn":
        validate("turn", event.get("turn", {}))
        if "measurement" in event:
            validate("measurement", event["measurement"])
        if "feature" in event:
            validate("feature", event["feature"])
        if "cost" in event:
            validate("cost", event["cost"])
        if "value" in event:
            validate("value", event["value"])
        if "decision" in event:
            validate("decision", event["decision"])
    elif event_type == "session_end":
        # no payload schema validation; keep minimal
        pass
    else:
        raise ValueError(f"Unsupported event type '{event_type}'")


__all__.append("validate_event_payload")
