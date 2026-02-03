import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from agentos.tools import backfill_ccp


def _write_usage_line(path: Path) -> None:
    record = {
        "ts": 1761268000.5,
        "rid": "RID1",
        "lane": "anthropic",
        "model": "claude-haiku-4.5",
        "input_tokens": 120,
        "output_tokens": 200,
        "latency_ms": 150,
        "rolling_used_tokens": 0,
        "reroute_mode": "hybrid",
        "reroute_decision": "fallback",
        "preferred_attempt": 1,
        "warn_pct_auto": 0.72,
        "warn_pct_confidence": 0.35,
        "gap_seconds_p50": 12,
        "gap_seconds_p95": 48,
        "gap_samples": 14,
    }
    path.write_text(json.dumps(record), encoding="utf-8")


def test_usage_snapshot_ingest(tmp_path: Path):
    ccp_root = tmp_path / "ccp"
    archive_dir = ccp_root / "logs" / "archive"
    archive_dir.mkdir(parents=True)
    results_dir = ccp_root / "results"
    results_dir.mkdir(parents=True)

    usage_log = archive_dir / "usage-test.jsonl"
    _write_usage_line(usage_log)

    # Empty metrics file to satisfy source list
    (results_dir / "METRICS_stub.json").write_text(json.dumps({"total": 0}), encoding="utf-8")

    fixture_path = Path("tests/fixtures/ccc/ccc_usage_r35_full.json").resolve()
    summary_path = tmp_path / "summary.json"

    summary = backfill_ccp.run_backfill(
        ccp_root,
        summary_path,
        usage_snapshot=fixture_path,
    )

    assert summary_path.exists(), "summary file should be written"

    model_health = summary.get("model_health")
    assert model_health, "model_health block should be present"
    assert set(model_health.keys()) == {"claude-haiku-4.5", "claude-3.5-sonnet"}

    haiku_health = model_health["claude-haiku-4.5"]
    assert haiku_health["warn_pct_auto"] == pytest.approx(0.72)
    assert haiku_health["gap_seconds_p95"] == 48
    assert "speeds" in haiku_health

    # Ensure decision envelope validated by checking backfill didn't raise and summary includes turns from log
    assert summary["turns"] >= 1
