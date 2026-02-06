"""CCC API client wrapper with local logging + metrics rollups."""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, Optional
from urllib import request

from agentos.licensing.client import LicenseClient, LicenseError
from agentos.metrics.rollup import (
    SUMMARY_FILENAME,
    compute_summary,
    load_events,
    validate_event_payload,
    write_summary,
)
from agentos.privacy.tier import PrivacyStrategy

Transport = Callable[[str, Dict[str, Any]], None]


class CCCClient:
    def __init__(
        self,
        *,
        base_url: str,
        api_key: str,
        data_dir: Path,
        privacy: PrivacyStrategy,
        licensing: Optional[LicenseClient] = None,
        transport: Optional[Transport] = None,
        tier_entitlements: Optional[Dict[str, str]] = None,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._privacy = privacy
        self._licensing = licensing
        self._transport = transport or self._http_post
        self._tier_entitlements = tier_entitlements or {
            "minimized": "telemetry_minimized",
            "full": "telemetry_full",
        }

        self._data_dir = Path(data_dir)
        self._data_dir.mkdir(parents=True, exist_ok=True)
        self._windows_path = self._data_dir / "windows.jsonl"
        self._glm_counts_path = self._data_dir / "glm_counts.jsonl"
        self._summary_path = self._data_dir / SUMMARY_FILENAME

        self._session_id: Optional[str] = None
        self._license_payload: Optional[Dict[str, Any]] = None

    # ------------------------------------------------------------------
    # Session lifecycle
    # ------------------------------------------------------------------
    def start_session(
        self,
        *,
        repo_id: str,
        branch: str,
        commit: str,
        license_id: str,
        metadata: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
    ) -> str:
        if self._session_id is not None:
            raise RuntimeError("Session already active")

        self.license_handshake()

        session_id = session_id or str(uuid.uuid4())
        session_event = {
            "type": "session",
            "session": {
                "session_id": session_id,
                "repo_id": repo_id,
                "branch": branch,
                "commit": commit,
                "license_id": license_id,
                "privacy_tier": self._privacy.name,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "metadata": metadata or {},
            },
        }
        validate_event_payload(session_event)
        self._append_event(session_event)
        self._maybe_upload_event(session_event)

        self._session_id = session_id
        return session_id

    def log_event(
        self,
        *,
        model: str,
        subagent: str,
        tokens_in: int,
        tokens_out: int,
        input_kind: str,
        latency_ms: float,
        measurement: Optional[Dict[str, Any]] = None,
        feature: Optional[Dict[str, Any]] = None,
        cost: Optional[Dict[str, Any]] = None,
        value: Optional[Dict[str, Any]] = None,
        attribution: Optional[Dict[str, float]] = None,
        capacity_used: Optional[float] = None,
        decision: Optional[Dict[str, Any]] = None,
    ) -> None:
        if self._session_id is None:
            raise RuntimeError("Session not started")

        turn_payload = {
            "turn_id": str(uuid.uuid4()),
            "session_id": self._session_id,
            "model": model,
            "subagent": subagent,
            "tokens_in": int(tokens_in),
            "tokens_out": int(tokens_out),
            "input_kind": input_kind,
            "latency_ms": float(latency_ms),
            "attribution": attribution or {},
            "capacity_used": capacity_used,
        }
        event: Dict[str, Any] = {"type": "turn", "turn": turn_payload}
        if measurement:
            event["measurement"] = measurement
        if feature:
            event["feature"] = feature
        if cost:
            event["cost"] = cost
        if value:
            event["value"] = value
        if decision:
            event["decision"] = decision

        validate_event_payload(event)
        self._append_event(event)
        self._maybe_upload_event(event)
        self.refresh_metrics_summary()

    def end_session(self, notes: Optional[str] = None) -> None:
        if self._session_id is None:
            return

        event = {
            "type": "session_end",
            "session_id": self._session_id,
            "ended_at": datetime.now(timezone.utc).isoformat(),
            "notes": notes or "",
        }
        self._append_event(event)
        self._maybe_upload_event(event)
        self._session_id = None

    # ------------------------------------------------------------------
    # Metrics / telemetry
    # ------------------------------------------------------------------
    def refresh_metrics_summary(self) -> Dict[str, Any]:
        events = load_events(self._windows_path)
        summary = compute_summary(events)
        write_summary(summary, self._summary_path)
        return summary

    def upload_minimized_metrics(self, summary: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        summary = summary or self.refresh_metrics_summary()
        if not self._privacy.allow_summary_upload():
            return summary
        payload = self._privacy.prepare_summary_payload(summary)
        if payload:
            self._transport("/v1/metrics", payload)
        return summary

    # ------------------------------------------------------------------
    # Licensing
    # ------------------------------------------------------------------
    def license_handshake(self) -> Optional[Dict[str, Any]]:
        if not self._licensing:
            return None
        if self._license_payload is not None:
            return self._license_payload

        pack = self._licensing.load_pack()
        payload = self._licensing.validate_pack(pack)

        required = self._tier_entitlements.get(self._privacy.name)
        if required and not self._licensing.check_entitlement(required):
            raise LicenseError(f"License missing entitlement '{required}' for {self._privacy.name} tier")

        self._license_payload = payload
        return payload

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _append_event(self, event: Dict[str, Any]) -> None:
        self._windows_path.parent.mkdir(parents=True, exist_ok=True)
        with self._windows_path.open("a", encoding="utf-8") as handle:
            json.dump(event, handle, separators=(",", ":"))
            handle.write("\n")

        if event.get("type") == "turn":
            turn = event["turn"]
            if str(turn.get("model", "")).lower().startswith("glm"):
                glm_record = {
                    "session_id": turn["session_id"],
                    "turn_id": turn["turn_id"],
                    "model": turn["model"],
                    "tokens_in": turn["tokens_in"],
                    "tokens_out": turn["tokens_out"],
                }
                with self._glm_counts_path.open("a", encoding="utf-8") as glm_handle:
                    json.dump(glm_record, glm_handle, separators=(",", ":"))
                    glm_handle.write("\n")

    def _maybe_upload_event(self, event: Dict[str, Any]) -> None:
        if not self._privacy.allow_event_upload():
            return
        payload = self._privacy.prepare_event_payload(event)
        self._transport("/v1/events", payload)

    def _http_post(self, route: str, payload: Dict[str, Any]) -> None:
        url = f"{self._base_url}{route}"
        data = json.dumps(payload).encode("utf-8")
        req = request.Request(
            url,
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self._api_key}",
            },
            method="POST",
        )
        with request.urlopen(req, timeout=10) as response:  # pragma: no cover - network path
            response.read()


__all__ = ["CCCClient"]
