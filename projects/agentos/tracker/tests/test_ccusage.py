from __future__ import annotations

import io
import json
from pathlib import Path

from tracker.cli import main
from tracker.meta import SCHEMA_VERSION
from tracker import __version__
from tracker.estimators import compute_efficiency
from tracker.storage import JsonlStore
from tracker.sources import parse_ccusage_counts

FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"


def _run(argv: list[str], stdin_text: str = ""):
    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdin=io.StringIO(stdin_text), stdout=stdout, stderr=stderr)
    return exit_code, stdout.getvalue(), stderr.getvalue()


def test_parse_ccusage_counts_totals() -> None:
    raw = (FIXTURES / "glm/ccusage_sample.json").read_text(encoding="utf-8")
    result = parse_ccusage_counts(raw)
    assert result["prompts_used"] == 118
    assert result["blocks"][0]["window_id"] == "W0-02"
    assert result["errors"] == []


def test_parse_ccusage_counts_missing_blocks_flags_error() -> None:
    raw = (FIXTURES / "glm/ccusage_missing_blocks.json").read_text(encoding="utf-8")
    result = parse_ccusage_counts(raw)
    assert "no-blocks" in result["errors"]
    assert result["prompts_used"] == 0.0


def test_glm_ingest_and_preview(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    sample = (FIXTURES / "glm/ccusage_sample.json").read_text(encoding="utf-8")

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "ingest",
            "glm",
            "--window",
            "W0-CC",
            "--stdin",
        ],
        sample,
    )
    assert exit_code == 0, err
    assert "prompts=118" in out

    counts_file = data_dir / "glm_counts.jsonl"
    record = json.loads(counts_file.read_text(encoding="utf-8").strip())
    assert record["schema_version"] == SCHEMA_VERSION
    assert record["tool_version"] == __version__
    assert record["window"] == "W0-CC"
    assert record["prompts_used"] == 118
    assert record["parsed"]["errors"] == []

    store = JsonlStore(data_dir)
    store.append_window(
        {
            "window": "W0-CC",
            "finalized_at": "2025-11-05T00:00:00Z",
            "features": {"codex": 0, "claude": 0, "glm": 3},
            "quality": 1.0,
            "notes": "glm test",
            "providers": {},
        }
    )

    windows_entries = JsonlStore(data_dir).load_windows("W0-CC")
    assert windows_entries
    assert windows_entries[-1]["schema_version"] == SCHEMA_VERSION
    assert windows_entries[-1]["tool_version"] == __version__

    exit_code, preview_out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "preview",
            "--window",
            "W0-CC",
        ]
    )
    assert exit_code == 0, err
    assert "  - glm: features=3, capacity=118 prompts, efficiency=0.03" in preview_out


def test_estimator_uses_glm_counts() -> None:
    windows = [
        {
            "window": "W0-GLM",
            "features": {"codex": 0, "claude": 0, "glm": 2},
            "providers": {},
            "quality": 1.0,
            "notes": "",
        }
    ]
    glm_counts = [{"window": "W0-GLM", "prompts_used": 40}]
    reports = compute_efficiency(windows, glm_counts=glm_counts)
    glm_report = next(report for report in reports if report.provider == "glm")
    assert glm_report.total_capacity == 40
    assert glm_report.efficiency == 0.05
