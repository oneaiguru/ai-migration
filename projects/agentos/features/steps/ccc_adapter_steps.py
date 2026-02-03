import json
import sys
import tempfile
from pathlib import Path
from typing import Dict, List, Tuple

from behave import given, then, when

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from agentos.integrations.ccc_client import CCCClient
from agentos.licensing.client import LicenseClient
from agentos.privacy.tier import Full, LocalOnly, Minimized


def _load_license(tier: str, tmpdir: Path) -> LicenseClient | None:
    if tier == "local":
        return None

    fixture_map = {
        "minimized": ROOT / "tests/fixtures/licenses/minimized_pack.json",
        "full": ROOT / "tests/fixtures/licenses/full_pack.json",
    }
    pack_path = fixture_map[tier]

    dummy_pubkey = "ZmFrZS1wdWJrZXk="

    def _noop_verify(kid: str, payload: Dict[str, object], signature: str) -> None:
        return None

    data = json.loads(pack_path.read_text(encoding="utf-8"))
    kid = data["license"]["kid"]

    # copy into tmpdir so the session run leaves artefacts near the other outputs
    local_pack = tmpdir / pack_path.name
    local_pack.write_text(pack_path.read_text(encoding="utf-8"), encoding="utf-8")

    return LicenseClient(
        pack_path=local_pack,
        pubkeys={kid: dummy_pubkey},
        verifier=_noop_verify,
        clock=lambda: 0,
    )


def _resolve_privacy(tier: str):
    return {
        "local": LocalOnly(),
        "minimized": Minimized(),
        "full": Full(),
    }[tier]


@given("a temporary working directory for CCC fixtures")
def step_tmpdir(context):
    context.tmpdir_obj = tempfile.TemporaryDirectory()
    context.tmpdir = Path(context.tmpdir_obj.name)


@given('a CCC client configured for "{tier}" privacy tier')
def step_client(context, tier: str):
    context.transport_calls: List[Tuple[str, Dict[str, object]]] = []

    def _transport(route: str, payload: Dict[str, object]) -> None:
        context.transport_calls.append((route, payload))

    license_client = _load_license(tier, context.tmpdir)

    privacy = _resolve_privacy(tier)
    context.client = CCCClient(
        base_url="https://example.invalid",
        api_key="behave",
        data_dir=context.tmpdir / "data",
        privacy=privacy,
        licensing=license_client,
        transport=_transport,
    )


@when("I record a sample session")
def step_record_session(context):
    client: CCCClient = context.client
    context.session_id = client.start_session(
        repo_id="behave-repo",
        branch="main",
        commit="deadbeef",
        license_id="behave-lic",
        metadata={"feature": "ccc_adapter"},
    )
    model = "glm/behave" if context.client._privacy.name != "local" else "anthropic/behave"
    privacy_name = context.client._privacy.name
    capacity_map = {"local": 0.5, "minimized": 0.25, "full": 0.75}

    client.log_event(
        model=model,
        subagent="executor",
        tokens_in=100,
        tokens_out=200,
        input_kind="text",
        latency_ms=1000,
        measurement={"cls": 1.2, "impf": 4.8, "churn_score": 0.1, "feature_delta": 1.0},
        value={"summary": "BDD sample", "links": []},
        attribution={model: 1.0},
        capacity_used=capacity_map[privacy_name],
    )
    context.summary = client.upload_minimized_metrics()
    client.end_session()


@then("no network uploads should be recorded")
def step_assert_no_upload(context):
    assert context.transport_calls == [], "expected no outbound payloads"


@then("the metrics summary should show features per capacity of 2.0")
def step_summary_local(context):
    assert context.summary["features_per_capacity"] == 2.0


@then("exactly one metrics upload should be recorded")
def step_metrics_upload(context):
    metrics_calls = [route for route, _ in context.transport_calls if route == "/v1/metrics"]
    assert len(metrics_calls) == 1, f"expected one metrics upload, got {len(metrics_calls)}"


@then("the minimized payload should contain only safe keys")
def step_safe_payload(context):
    payload = [payload for route, payload in context.transport_calls if route == "/v1/metrics"][0]
    assert set(payload).issubset(
        {
            "generated_at",
            "features_shipped",
            "features_per_capacity",
            "avg_cls",
            "avg_impf",
            "avg_churn_score",
            "capacity_used",
        }
    )
    assert context.summary["features_per_capacity"] == 4.0, "0.5 capacity => 0.5 feature => ratio 4.0"


@then("the client should upload redacted turn events")
def step_full_payload(context):
    event_payloads = [payload for route, payload in context.transport_calls if route == "/v1/events"]
    assert len(event_payloads) >= 2, "session start/turn/end should be present"
    turn_payloads = [payload for payload in event_payloads if payload.get("type") == "turn"]
    assert turn_payloads, "missing turn event"
    for payload in turn_payloads:
        assert "value" in payload
        assert set(payload["value"]) <= {"summary", "links"}


@then("the metrics summary should show features per capacity of 1.3333")
def step_summary_full(context):
    ratio = context.summary["features_per_capacity"]
    assert round(ratio, 4) == 1.3333
