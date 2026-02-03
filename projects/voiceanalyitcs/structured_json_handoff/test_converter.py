import json
from pathlib import Path

BASE = Path(__file__).resolve().parent
OUTPUT = BASE / "output"
REFERENCE = BASE / "reference"


def load_output(name: str):
    path = OUTPUT / name
    assert path.exists(), f"Missing expected output file: {path}"
    return json.loads(path.read_text(encoding="utf-8"))


def assert_schema_common(data: dict, call_id: str):
    meta = data["call_metadata"]
    assert meta["call_id"] == call_id
    assert isinstance(meta.get("total_duration_ms"), int)
    assert meta.get("operator")

    utterances = data["utterances"]
    assert utterances, "Utterances must not be empty"
    for idx, u in enumerate(utterances):
        assert u["speaker"] in ("agent", "customer")
        assert u["start_ms"] < u["end_ms"]
        assert u["duration_ms"] == u["end_ms"] - u["start_ms"]
        if idx == 0:
            assert u["gap_from_previous_ms"] is None
        else:
            assert u["gap_from_previous_ms"] >= 0

    pre = data["pre_calculated"]
    assert pre["greeting_delay_ms"] == utterances[0]["start_ms"]
    assert pre["closing_delay_ms"] >= 0
    assert isinstance(pre["searches"], list)
    assert "echo_method_instances" in pre
    assert isinstance(pre["echo_method_instances"], list)
    assert "preprocessor_signals" in data


def assert_fact_searches(searches):
    assert searches, "Searches must not be empty"
    allowed = {
        "announced_at_ms",
        "ended_at_ms",
        "duration_sec",
        "thanks_given",
        "customer_interactive",
        "announcement_text",
    }
    for s in searches:
        assert set(s.keys()).issubset(allowed), f"Unexpected keys in search: {s.keys()}"
        for key in ("announced_at_ms", "ended_at_ms", "duration_sec", "thanks_given"):
            assert key in s
        assert "gap_from_previous_search_ms" not in s
        assert "is_micro" not in s
        assert "is_flag_window_9_1" not in s
        assert "is_violation_9_1" not in s


def assert_echo_instances(instances):
    assert instances, "echo_method_instances must not be empty"
    for inst in instances:
        for key in ("data_type", "timestamp_ms", "pattern", "operator_text", "customer_response"):
            assert key in inst, f"Missing {key} in echo instance: {inst}"
        assert inst["data_type"]
        assert inst["pattern"] in ("new_entry", "echo_with_confirmation", "reuse_existing")
        assert isinstance(inst["timestamp_ms"], (int, float))


def assert_preprocessor_signals(data: dict):
    sig = data["preprocessor_signals"]
    assert "_meta" in sig
    assert "call_context" in sig
    assert "extracted_data" in sig
    assert "checkpoint_signals" in sig

    cc = sig["call_context"]
    for key in ("call_type", "is_tire_call", "is_wheel_call", "has_repeat_customer"):
        assert key in cc

    cp = sig["checkpoint_signals"]
    for key in (
        "greeting",
        "city",
        "needs",
        "three_options",
        "advantages_used",
        "objection_handled",
        "reservation_offered",
        "closing",
        "upsell_offer",
        "order_status",
        "tire_service",
        "conditional_triggers",
    ):
        assert key in cp

    extracted = sig["extracted_data"]
    for key in ("order_numbers", "disk_diameter", "legal_entity_markers", "marketplace_platform"):
        assert key in extracted


def test_call_05_output():
    data = load_output("call_05_structured.json")
    assert_schema_common(data, "05")

    pre = data["pre_calculated"]
    # Greeting within 5s, closing delay small
    assert pre["greeting_delay_ms"] <= 5000
    assert pre["closing_delay_ms"] <= 5000

    searches = pre["searches"]
    assert_fact_searches(searches)
    # Allow long hold to be split into adjacent segments; merge segments with small gaps
    merged = []
    for s in sorted(searches, key=lambda x: x["announced_at_ms"]):
        if merged and s["announced_at_ms"] - merged[-1]["ended_at_ms"] <= 10000:
            merged[-1]["ended_at_ms"] = s["ended_at_ms"]
            merged[-1]["duration_sec"] += s["duration_sec"]
        else:
            merged.append(dict(s))
    assert any(55 <= s["duration_sec"] <= 75 for s in merged), "Expected long search (~60s) not found"
    assert sum(1 for s in merged if s["duration_sec"] > 90) == 0, "Should not duplicate long holds"
    assert_echo_instances(pre["echo_method_instances"])
    assert_preprocessor_signals(data)

    # BDD: long search window tolerance
    long = next(s for s in merged if 55 <= s["duration_sec"] <= 75)
    assert 181000 <= long["announced_at_ms"] <= 185000
    assert 243000 <= long["ended_at_ms"] <= 248000

def test_call_05_simplified_output():
    path = OUTPUT / "call_05_structured_input_min.json"
    assert path.exists(), "Simplified output for call_05 is missing"
    data = load_output("call_05_structured_input_min.json")
    assert_schema_common(data, "05")
    assert_fact_searches(data["pre_calculated"]["searches"])
    assert_echo_instances(data["pre_calculated"]["echo_method_instances"])
    assert_preprocessor_signals(data)


def test_call_05_signals_output():
    path = OUTPUT / "call_05_structured_input_signals.json"
    assert path.exists(), "Signals output for call_05 is missing"
    data = load_output("call_05_structured_input_signals.json")
    assert_schema_common(data, "05")
    assert_fact_searches(data["pre_calculated"]["searches"])
    assert_echo_instances(data["pre_calculated"]["echo_method_instances"])
    assert_preprocessor_signals(data)


def test_call_02_output_optional():
    path = OUTPUT / "call_02_structured.json"
    if not path.exists():
        return
    data = load_output("call_02_structured.json")
    assert_schema_common(data, "02")

    pre = data["pre_calculated"]
    assert pre["greeting_delay_ms"] <= 5000
    assert pre["closing_delay_ms"] <= 5000
    assert_fact_searches(pre["searches"])
    assert_echo_instances(pre["echo_method_instances"])
    assert_preprocessor_signals(data)
    long = max(pre["searches"], key=lambda s: s["duration_sec"])
    assert 8 <= long["duration_sec"] <= 120
