from __future__ import annotations

import importlib.util
from datetime import datetime, timezone
from pathlib import Path

import pytest

from tracker.sources.proxy_telemetry import parse_proxy_telemetry_stream
from tracker.storage import JsonlStore


ROOT = Path(__file__).resolve().parents[2]
PROXY_COMPARE_PATH = ROOT / "scripts" / "tools" / "proxy_cost_compare.py"


def _load_proxy_cost_compare_module():
    spec = importlib.util.spec_from_file_location("proxy_cost_compare", PROXY_COMPARE_PATH)
    if spec is None or spec.loader is None:
        raise ImportError("could not load proxy_cost_compare module")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


proxy_cost_compare = _load_proxy_cost_compare_module()

FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"
TELEMETRY_TEXT = (FIXTURES / "proxy" / "telemetry_sample.jsonl").read_text(encoding="utf-8")


def test_proxy_cost_compare_from_file(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    telemetry_file = tmp_path / "telemetry.jsonl"
    telemetry_file.write_text(TELEMETRY_TEXT, encoding="utf-8")

    exit_code = proxy_cost_compare.main(["--file", str(telemetry_file), "--min", "3"])
    assert exit_code == 0

    captured = capsys.readouterr().out.strip().splitlines()
    assert captured[0] == "rid,baseline_tokens,glm_tokens,delta_glm_minus_base"
    rows = captured[1:-1]
    assert "R2,1000,1150,150" in rows
    assert "R3,600,750,150" in rows
    assert any(line.startswith("R4,875,890,15") for line in rows)
    totals_line = captured[-1]
    assert totals_line.startswith("# totals baseline=")
    assert "glm_share=" in totals_line


def test_proxy_cost_compare_from_tracker_data_dir(tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
    data_dir = tmp_path / "week0"
    store = JsonlStore(data_dir)
    parsed = parse_proxy_telemetry_stream(TELEMETRY_TEXT)
    store.append_proxy_telemetry(
        {
            "window": "W0-CHN",
            "provider": "proxy-telemetry",
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "notes": "test-ingest",
            "raw_text": TELEMETRY_TEXT,
            "parsed": parsed,
            "source": "ingest",
        }
    )

    exit_code = proxy_cost_compare.main(["--data-dir", str(data_dir), "--min", "3"])
    assert exit_code == 0

    captured = capsys.readouterr().out.strip().splitlines()
    assert captured[0] == "rid,baseline_tokens,glm_tokens,delta_glm_minus_base"
    rows = captured[1:-1]
    assert "R2,1000,1150,150" in rows
    assert "R3,600,750,150" in rows
    assert any(line.startswith("R4,875,890,15") for line in rows)
    totals_line = captured[-1]
    assert totals_line.startswith("# totals baseline=")
    assert "glm_share=" in totals_line
