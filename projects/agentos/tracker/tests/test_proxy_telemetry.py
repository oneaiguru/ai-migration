from __future__ import annotations

from pathlib import Path

import pytest

from tracker.sources.proxy_telemetry import parse_proxy_telemetry_stream


FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"
SAMPLE = (FIXTURES / "proxy" / "telemetry_sample.jsonl").read_text(encoding="utf-8").strip()


def test_parse_proxy_telemetry_basic():
    parsed = parse_proxy_telemetry_stream(SAMPLE)
    assert parsed["total"] == 8
    # 4 of 8 routed to GLM (50%)
    assert round(parsed["routed_to_glm_pct"], 1) == 50.0
    # p50 of sorted latencies should be around 320 ms
    assert round(parsed["latency_p50_ms"]) == 320
    # p95 interpolated near the max (~537 ms)
    assert 530 <= parsed["latency_p95_ms"] <= 545
    # one error in 8 events ≈ 12.5%
    assert round(parsed["error_rate_pct"], 1) == 12.5


def test_parse_proxy_telemetry_tolerates_garbage():
    bad = "bad json line\n" + SAMPLE + "\n{"  # trailing partial
    parsed = parse_proxy_telemetry_stream(bad)
    assert parsed["total"] == 8
    assert round(parsed["routed_to_glm_pct"], 0) == 50.0


def test_parse_proxy_telemetry_no_events():
    parsed = parse_proxy_telemetry_stream("")
    assert parsed["total"] == 0
    assert "no-events" in parsed.get("errors", [])


def test_proxy_telemetry_status_whitelist(tmp_path: Path) -> None:
    sample = """
{"ts":"2025-10-20T00:00:00Z","rid":"R1","lane":"baseline","model":"anthropic/haiku","status":"OK","latency_ms":200,"input_tokens":10,"output_tokens":5}
{"ts":"2025-10-20T00:00:05Z","rid":"R1","lane":"glm","model":"z.ai/glm-4.6","status":"routed","latency_ms":210,"input_tokens":12,"output_tokens":6}
{"ts":"2025-10-20T00:00:10Z","rid":"R2","lane":"glm","model":"z.ai/glm-4.6","status":"cached","latency_ms":220,"input_tokens":8,"output_tokens":4}
{"ts":"2025-10-20T00:00:15Z","rid":"R2","lane":"baseline","model":"anthropic/haiku","status":"error","latency_ms":230,"input_tokens":9,"output_tokens":5}
""".strip()
    parsed = parse_proxy_telemetry_stream(sample)
    assert parsed["total"] == 4
    # only the explicit "error" status should be counted as an error
    assert parsed["error_rate_pct"] == pytest.approx(25.0)


def test_proxy_telemetry_invalid_latency_flagged():
    sample = """
{"ts":"2025-10-20T00:00:00Z","rid":"R1","lane":"baseline","model":"anthropic/haiku","status":"ok","latency_ms":"slow","input_tokens":10,"output_tokens":5}
""".strip()
    parsed = parse_proxy_telemetry_stream(sample)
    assert parsed["latency_p50_ms"] is None
    assert "latency:invalid" in parsed["errors"]
