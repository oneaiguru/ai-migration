"""Privacy tier strategies governing telemetry upload behaviour."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable

__all__ = [
    "PrivacyStrategy",
    "LocalOnly",
    "Minimized",
    "Full",
]


@dataclass(frozen=True)
class PrivacyStrategy:
    """Base strategy describing network permissions for telemetry uploads."""

    name: str

    def allow_event_upload(self) -> bool:
        return False

    def allow_summary_upload(self) -> bool:
        return False

    def prepare_event_payload(self, event: Dict) -> Dict:
        """Transform outbound event data before upload.

        Subclasses may redact or remove sensitive fields. The default behaviour
        simply returns the input event which keeps local workflows untouched.
        """

        return event

    def prepare_summary_payload(self, summary: Dict) -> Dict:
        """Limit summary payloads to the fields guaranteed safe for upload."""

        return summary


class LocalOnly(PrivacyStrategy):
    def __init__(self) -> None:
        super().__init__(name="local")


class Minimized(PrivacyStrategy):
    SAFE_SUMMARY_FIELDS: Iterable[str] = (
        "generated_at",
        "features_shipped",
        "features_per_capacity",
        "avg_cls",
        "avg_impf",
        "avg_churn_score",
        "capacity_used",
    )

    def __init__(self) -> None:
        super().__init__(name="minimized")

    def allow_summary_upload(self) -> bool:  # type: ignore[override]
        return True

    def prepare_summary_payload(self, summary: Dict) -> Dict:  # type: ignore[override]
        return {key: summary.get(key) for key in self.SAFE_SUMMARY_FIELDS if key in summary}


class Full(PrivacyStrategy):
    def __init__(self) -> None:
        super().__init__(name="full")

    def allow_event_upload(self) -> bool:  # type: ignore[override]
        return True

    def allow_summary_upload(self) -> bool:  # type: ignore[override]
        return True

    def prepare_event_payload(self, event: Dict) -> Dict:  # type: ignore[override]
        sanitized = dict(event)
        value = sanitized.get("value")
        if isinstance(value, dict):
            # Retain summary pointer only; redact human text before upload.
            sanitized["value"] = {"summary": value.get("summary", ""), "links": value.get("links", [])}
        return sanitized
