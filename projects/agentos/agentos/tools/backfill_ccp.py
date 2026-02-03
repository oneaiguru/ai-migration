"""Backfill AgentOS metrics from ClaudeCodeProxy logs/results."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from json import JSONDecodeError
from typing import Dict, Iterable, List, Optional

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from agentos.metrics import rollup


_DECODER = json.JSONDecoder()


def _parse_line(line: str) -> List[Dict[str, object]]:
    line = line.strip()
    if not line:
        return []
    payloads: List[Dict[str, object]] = []
    buffer = line
    while buffer:
        if buffer.startswith("{}"):
            buffer = buffer[2:].lstrip()
            continue
        try:
            obj, offset = _DECODER.raw_decode(buffer)
        except JSONDecodeError as exc:
            raise JSONDecodeError(f"Unable to parse usage log fragment: {buffer[:40]}", buffer, exc.pos) from exc
        payloads.append(obj)
        buffer = buffer[offset:].lstrip()
    return payloads


DECISION_KEYS = {
    "reroute_mode",
    "reroute_decision",
    "preferred_attempt",
    "warn_pct_auto",
    "warn_pct_confidence",
    "gap_seconds_p50",
    "gap_seconds_p95",
    "gap_samples",
}


def _collect_usage_events(usage_dir: Path) -> List[Dict[str, object]]:
    events: List[Dict[str, object]] = []
    seen_sessions: set[str] = set()

    for path in sorted(usage_dir.glob("usage*.jsonl")):
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                for record in _parse_line(line):
                    session_id = str(record.get("rid") or path.stem)
                    if session_id not in seen_sessions:
                        session_event = {
                            "type": "session",
                            "session": {
                                "session_id": session_id,
                                "repo_id": "ccp-import",
                                "branch": record.get("lane", "main"),
                                "commit": "import",
                                "license_id": "backfill",
                                "privacy_tier": "minimized",
                                "created_at": datetime.fromtimestamp(record.get("ts", 0), tz=timezone.utc).isoformat(),
                                "metadata": {"source": str(path)},
                            },
                        }
                        rollup.validate_event_payload(session_event)
                        events.append(session_event)
                        seen_sessions.add(session_id)

                    decision: Dict[str, object] = {}
                    for key in DECISION_KEYS:
                        if key in record and record.get(key) is not None:
                            decision[key] = record[key]

                    turn_event = {
                        "type": "turn",
                        "turn": {
                            "turn_id": f"{session_id}-{len(events)}",
                            "session_id": session_id,
                            "model": str(record.get("model", "unknown")),
                            "subagent": str(record.get("lane", "unknown")),
                            "tokens_in": int(record.get("input_tokens", 0) or 0),
                            "tokens_out": int(record.get("output_tokens", 0) or 0),
                            "input_kind": "text",
                            "latency_ms": float(record.get("latency_ms", 0) or 0.0),
                            "attribution": {str(record.get("model", "unknown")): 1.0},
                            "capacity_used": float(record.get("rolling_used_tokens", 0) or 0.0),
                        },
                        "measurement": {"cls": 0.0, "impf": 0.0, "churn_score": 0.0, "feature_delta": 0.0},
                    }
                    if decision:
                        turn_event["decision"] = decision
                    rollup.validate_event_payload(turn_event)
                    events.append(turn_event)
    return events


def _collect_metrics(results_dir: Path) -> Dict[str, object]:
    aggregate = {
        "features_shipped": 0.0,
        "sources": [],
    }
    for path in sorted(results_dir.glob("METRICS*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        aggregate["features_shipped"] += float(data.get("total", 0) or 0)
        aggregate["sources"].append(str(path))
    return aggregate


def _load_usage_snapshot(snapshot_path: Optional[Path]) -> Dict[str, Dict[str, object]]:
    if not snapshot_path:
        return {}
    if not snapshot_path.exists():
        raise FileNotFoundError(f"Usage snapshot not found at {snapshot_path}")
    data = json.loads(snapshot_path.read_text(encoding="utf-8"))
    models: Dict[str, Dict[str, object]] = {}
    for model, model_data in (data.get("models") or {}).items():
        model_entry: Dict[str, object] = {}
        for key in DECISION_KEYS:
            if key in model_data:
                model_entry[key] = model_data[key]
        if "speeds" in model_data:
            model_entry["speeds"] = model_data["speeds"]
        if "reqs" in model_data:
            model_entry["reqs"] = model_data["reqs"]
        if model_entry:
            models[model] = model_entry
    return models


def run_backfill(
    ccp_root: Path,
    output_path: Path,
    *,
    usage_snapshot: Optional[Path] = None,
) -> Dict[str, object]:
    usage_dir = ccp_root / "logs" / "archive"
    results_dir = ccp_root / "results"

    events = _collect_usage_events(usage_dir)
    model_health = _load_usage_snapshot(usage_snapshot)
    summary = rollup.compute_summary(events, model_health=model_health)

    metrics = _collect_metrics(results_dir)
    if metrics["features_shipped"]:
        summary["features_shipped"] = metrics["features_shipped"]
        capacity = summary.get("capacity_used") or 0
        summary["features_per_capacity"] = (
            metrics["features_shipped"] / capacity if capacity else None
        )
    summary["sources"] = metrics["sources"]

    rollup.write_summary(summary, output_path)
    return summary


def main(argv: Iterable[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ccp-root", type=Path, required=True, help="Path to ClaudeCodeProxy repository")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Destination file for metrics summary (defaults to <cwd>/metrics_summary.json)",
    )
    parser.add_argument(
        "--usage-json",
        type=Path,
        help="Optional path to a /v1/usage snapshot JSON (includes model health fields)",
    )
    args = parser.parse_args(list(argv) if argv is not None else None)

    output_path = args.output or Path(rollup.SUMMARY_FILENAME)
    usage_snapshot = None
    if args.usage_json:
        usage_snapshot = args.usage_json
        if not usage_snapshot.is_absolute():
            usage_snapshot = args.ccp_root / usage_snapshot

    summary = run_backfill(args.ccp_root, output_path, usage_snapshot=usage_snapshot)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
