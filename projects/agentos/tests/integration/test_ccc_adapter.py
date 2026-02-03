import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

import pytest

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from agentos.integrations.ccc_client import CCCClient
from agentos.licensing.client import LicenseClient, LicenseError
from agentos.privacy.tier import Full, LocalOnly, Minimized


class DummyVerifier:
    def __init__(self) -> None:
        self.calls: List[Tuple[str, Dict[str, object], str]] = []

    def __call__(self, kid: str, payload: Dict[str, object], signature: str) -> None:
        self.calls.append((kid, payload, signature))
        if signature != "valid-sig":
            raise LicenseError("Invalid signature")


def _write_license_pack(path: Path, *, kid: str, features: List[str]) -> Path:
    pack = {
        "license": {
            "schema": "ccp.license.v1",
            "kid": kid,
            "plan": "pro",
            "features": features,
            "exp": 32503680000,  # year 3000
        },
        "signature": "valid-sig",
    }
    path.write_text(json.dumps(pack), encoding="utf-8")
    return path


def _make_license(tmp_path: Path, *, features: List[str]) -> Tuple[LicenseClient, DummyVerifier]:
    verifier = DummyVerifier()
    kid = "test-key"
    pack_path = _write_license_pack(tmp_path / "license.json", kid=kid, features=features)
    license_client = LicenseClient(
        pack_path,
        pubkeys={kid: "ZmFrZS1wdWJrZXk="},
        verifier=verifier,
        clock=lambda: 0,
    )
    return license_client, verifier


def _read_jsonl(path: Path) -> List[Dict[str, object]]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def test_local_only_session_produces_local_logs_only(tmp_path: Path) -> None:
    license_client, verifier = _make_license(tmp_path, features=["telemetry_minimized", "telemetry_full"])
    calls: List[Tuple[str, Dict[str, object]]] = []

    def transport(route: str, payload: Dict[str, object]) -> None:
        calls.append((route, payload))

    client = CCCClient(
        base_url="https://example.invalid",
        api_key="dev",
        data_dir=tmp_path / "data",
        privacy=LocalOnly(),
        licensing=license_client,
        transport=transport,
    )

    session_id = client.start_session(
        repo_id="repo",
        branch="main",
        commit="deadbeef",
        license_id="lic-1",
        metadata={"window": "W0-01"},
    )
    assert verifier.calls, "License handshake should validate the pack"

    client.log_event(
        model="anthropic/claude-3",
        subagent="planner",
        tokens_in=100,
        tokens_out=200,
        input_kind="text",
        latency_ms=1200,
        measurement={"cls": 1.2, "impf": 4.5, "churn_score": 0.1, "feature_delta": 1},
        feature={"feature_id": "feat-1", "spec_ref": "docs/specs/feat1.md", "status": "implemented"},
        cost={"provider": "anthropic", "estimated_usd": 1.23},
        value={"summary": "Passed", "links": ["https://example"]},
        attribution={"claude-3": 1.0},
        capacity_used=0.5,
    )
    client.end_session()

    events = _read_jsonl(tmp_path / "data" / "windows.jsonl")
    assert len(events) == 3
    assert all(event for event in events)
    assert not calls, "Local tier must never contact the network"
    summary = json.loads((tmp_path / "data" / "metrics_summary.json").read_text())
    assert summary["features_shipped"] == 1.0
    assert summary["features_per_capacity"] == pytest.approx(2.0)
    assert summary["avg_cls"] == pytest.approx(1.2)
    assert summary["avg_impf"] == pytest.approx(4.5)


def test_minimized_tier_uploads_summary_without_content(tmp_path: Path) -> None:
    license_client, _ = _make_license(tmp_path, features=["telemetry_minimized"])
    calls: List[Tuple[str, Dict[str, object]]] = []

    def transport(route: str, payload: Dict[str, object]) -> None:
        calls.append((route, payload))

    client = CCCClient(
        base_url="https://example.invalid",
        api_key="dev",
        data_dir=tmp_path / "data",
        privacy=Minimized(),
        licensing=license_client,
        transport=transport,
    )

    client.start_session(
        repo_id="repo",
        branch="main",
        commit="deadbeef",
        license_id="lic-1",
    )
    client.log_event(
        model="glm/123",
        subagent="executor",
        tokens_in=50,
        tokens_out=75,
        input_kind="text",
        latency_ms=800,
        measurement={"cls": 0.8, "impf": 2.0, "churn_score": 0.05, "feature_delta": 0.5},
        attribution={"glm": 1.0},
        capacity_used=0.25,
    )
    summary = client.upload_minimized_metrics()

    assert summary["avg_cls"] == pytest.approx(0.8)
    assert calls == [
        ("/v1/metrics", {
            "generated_at": summary["generated_at"],
            "features_shipped": pytest.approx(0.5),
            "features_per_capacity": pytest.approx(2.0),
            "avg_cls": pytest.approx(0.8),
            "avg_impf": pytest.approx(2.0),
            "avg_churn_score": pytest.approx(0.05),
            "capacity_used": pytest.approx(0.25),
        })
    ]

    # Ensure only safe keys travelled across the wire.
    sent_payload = calls[0][1]
    assert set(sent_payload).issubset({
        "generated_at",
        "features_shipped",
        "features_per_capacity",
        "avg_cls",
        "avg_impf",
        "avg_churn_score",
        "capacity_used",
    })
    events = _read_jsonl(tmp_path / "data" / "glm_counts.jsonl")
    assert events and events[0]["model"].startswith("glm")


def test_full_tier_uploads_events_after_license_check(tmp_path: Path) -> None:
    license_client, verifier = _make_license(tmp_path, features=["telemetry_full", "telemetry_minimized"])
    calls: List[Tuple[str, Dict[str, object]]] = []

    def transport(route: str, payload: Dict[str, object]) -> None:
        calls.append((route, payload))

    client = CCCClient(
        base_url="https://example.invalid",
        api_key="dev",
        data_dir=tmp_path / "data",
        privacy=Full(),
        licensing=license_client,
        transport=transport,
    )

    client.start_session(repo_id="repo", branch="main", commit="deadbeef", license_id="lic-1")
    assert verifier.calls

    client.log_event(
        model="anthropic/claude-3",
        subagent="planner",
        tokens_in=120,
        tokens_out=210,
        input_kind="text",
        latency_ms=1500,
        measurement={"cls": 1.1, "impf": 5.0, "churn_score": 0.2, "feature_delta": 1},
        value={"summary": "Shipped", "links": []},
        attribution={"claude-3": 1.0},
        capacity_used=0.75,
    )
    summary = client.upload_minimized_metrics()
    client.end_session()

    # Expect uploads for: session start, turn, summary, session end.
    routes = [route for route, _ in calls]
    assert routes.count("/v1/events") == 3
    assert "/v1/metrics" in routes
    # Ensure value payload redaction happened for network payloads.
    event_payloads = [payload for route, payload in calls if route == "/v1/events"]
    for payload in event_payloads:
        if payload.get("type") == "turn":
            assert "value" in payload
            assert set(payload["value"]) <= {"summary", "links"}
    assert summary["features_per_capacity"] == pytest.approx(1 / 0.75)
