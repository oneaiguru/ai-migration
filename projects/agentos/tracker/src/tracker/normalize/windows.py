from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple

PROVIDER_FIELDS: dict[str, tuple[str, ...]] = {
    "codex": ("fiveh_pct", "weekly_pct"),
    "claude": ("session_pct", "all_models_pct"),
}


def group_snapshots_by_provider(snapshots: List[dict[str, Any]]) -> dict[str, dict[str, dict[str, Any]]]:
    grouped: dict[str, dict[str, dict[str, Any]]] = {}
    for snap in snapshots:
        provider = snap.get("provider")
        phase = snap.get("phase")
        if not provider or not phase:
            continue
        by_phase = grouped.setdefault(provider, {})
        current = by_phase.get(phase)
        if current is None or (snap.get("captured_at") or "") > (current.get("captured_at") or ""):
            by_phase[phase] = snap
    return grouped


def _delta(before: Any, after: Any) -> Any:
    if before is None or after is None:
        return None
    if after >= before:
        return after - before
    # Handle reset: wrap remaining percentage.
    return (100 - before) + after


def _collect_notes(*snapshots: dict[str, Any]) -> list[str]:
    notes: list[str] = []
    for snap in snapshots:
        note = snap.get("notes")
        if note:
            notes.append(note)
    return notes


def _summarize_provider(provider: str, before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    fields = PROVIDER_FIELDS.get(provider, ())
    delta = {field: _delta(before["parsed"].get(field), after["parsed"].get(field)) for field in fields}
    errors_before = before["parsed"].get("errors", [])
    errors_after = after["parsed"].get("errors", [])
    errors: list[str] = []
    for err in [*errors_before, *errors_after]:
        if err not in errors:
            errors.append(err)
    return {
        "before": before["parsed"],
        "after": after["parsed"],
        "delta": delta,
        "captured_at": {
            "before": before.get("captured_at"),
            "after": after.get("captured_at"),
        },
        "notes": _collect_notes(before, after),
        "errors": errors,
    }


def build_window_summary(
    window_id: str,
    snapshots: List[dict[str, Any]],
    features: Dict[str, int],
    quality_score: float,
    outcome: str,
    notes: str,
) -> Tuple[dict[str, Any], list[str]]:
    grouped = group_snapshots_by_provider(snapshots)
    providers: dict[str, Any] = {}
    missing: list[str] = []
    for provider, phases in grouped.items():
        before = phases.get("before")
        after = phases.get("after")
        if not before or not after:
            missing.append(provider)
            continue
        providers[provider] = _summarize_provider(provider, before, after)
    record = {
        "window": window_id,
        "finalized_at": datetime.now(timezone.utc).isoformat(),
        "features": features,
        "quality_score": quality_score,
        "quality": quality_score,
        "outcome": outcome,
        "notes": notes,
        "providers": providers,
    }
    return record, missing
