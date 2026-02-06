from __future__ import annotations

import io
import json
from pathlib import Path

from tracker.cli import main
from tracker.meta import SCHEMA_VERSION
from tracker import __version__

FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"


def _run(argv: list[str], stdin_text: str = ""):
    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdin=io.StringIO(stdin_text), stdout=stdout, stderr=stderr)
    return exit_code, stdout.getvalue(), stderr.getvalue()


def test_ingest_and_complete_flow(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    codex_before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
    codex_after = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")
    claude_before = (FIXTURES / "claude/usage_wide_90_1_0.txt").read_text(encoding="utf-8")
    claude_after = (FIXTURES / "claude/usage_narrow_90_1_0.txt").read_text(encoding="utf-8")

    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "ingest",
                "codex",
                "--window",
                "W0-01",
                "--phase",
                "before",
                "--stdin",
            ],
            codex_before,
        )[0]
        == 0
    )
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "ingest",
                "codex",
                "--window",
                "W0-01",
                "--phase",
                "after",
                "--stdin",
            ],
            codex_after,
        )[0]
        == 0
    )
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "ingest",
                "claude",
                "--window",
                "W0-01",
                "--phase",
                "before",
                "--stdin",
            ],
            claude_before,
        )[0]
        == 0
    )
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "ingest",
                "claude",
                "--window",
                "W0-01",
                "--phase",
                "after",
                "--stdin",
            ],
            claude_after,
        )[0]
        == 0
    )

    exit_code, _, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "complete",
            "--window",
            "W0-01",
            "--codex-features",
            "3",
            "--claude-features",
            "3",
            "--quality",
            "1.0",
            "--notes",
            "pytest",
        ]
    )
    assert exit_code == 0, err

    windows_file = data_dir / "windows.jsonl"
    record = json.loads(windows_file.read_text(encoding="utf-8").strip())
    assert record["schema_version"] == SCHEMA_VERSION
    assert record["tool_version"] == __version__
    assert record["quality_score"] == 1.0
    assert record["quality"] == 1.0
    assert record["outcome"] == "unknown"
    codex_delta = record["providers"]["codex"]["delta"]
    assert codex_delta["weekly_pct"] == 18
    assert codex_delta["fiveh_pct"] == 1

    exit_code, out, err = _run([
        "--data-dir",
        str(data_dir),
        "preview",
        "--window",
        "W0-01",
    ])
    assert exit_code == 0, err
    assert "Windows: W0-01" in out
    assert "Providers:" in out
    assert "  - codex: features=3, capacity=18 pp, efficiency=0.17, ci=n/a, n=1, power=n/a" in out
    assert "  - claude: features=3, capacity=0 pp, efficiency=n/a, ci=n/a, n=0, power=n/a" in out
    assert "Outcome: quality=1.0, outcome=unknown" in out
    assert "Snapshots:" in out
    assert "source=ingest" in out
    assert "notes=n/a" in out


def test_override_records_snapshot(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    exit_code, _, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "override",
            "codex",
            "--window",
            "W0-OVR",
            "--phase",
            "before",
            "--weekly-pct",
            "82",
            "--fiveh-pct",
            "1",
            "--notes",
            "manual",
        ]
    )
    assert exit_code == 0, err
    snapshots_file = data_dir / "snapshots.jsonl"
    record = json.loads(snapshots_file.read_text(encoding="utf-8").strip())
    assert record["schema_version"] == SCHEMA_VERSION
    assert record["tool_version"] == __version__
    assert record["parsed"]["weekly_pct"] == 82
    assert record["parsed"]["errors"] == ["manual-override"]


def test_preview_prints_window_notes(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    # Minimal codex before/after to allow finalize
    before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
    after = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")
    assert _run([
        "--data-dir", str(data_dir), "ingest", "codex", "--window", "W0-NOTES", "--phase", "before", "--stdin"
    ], before)[0] == 0
    assert _run([
        "--data-dir", str(data_dir), "ingest", "codex", "--window", "W0-NOTES", "--phase", "after", "--stdin"
    ], after)[0] == 0

    # Finalize with a notes string
    exit_code, _, err = _run([
        "--data-dir", str(data_dir), "complete", "--window", "W0-NOTES", "--codex-features", "1", "--quality", "1.0", "--notes", "preview-notes"
    ])
    assert exit_code == 0, err

    # Preview should include Notes: preview-notes
    exit_code, out, err = _run(["--data-dir", str(data_dir), "preview", "--window", "W0-NOTES"])
    assert exit_code == 0, err
    assert "Outcome: quality=1.0, outcome=unknown" in out
    assert "Notes: preview-notes" in out


def test_preview_always_prints_anomalies_line(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    # Minimal finalize to trigger preview
    before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
    after = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")
    assert _run([
        "--data-dir", str(data_dir), "ingest", "codex", "--window", "W0-A", "--phase", "before", "--stdin"
    ], before)[0] == 0
    assert _run([
        "--data-dir", str(data_dir), "ingest", "codex", "--window", "W0-A", "--phase", "after", "--stdin"
    ], after)[0] == 0
    assert _run([
        "--data-dir", str(data_dir), "complete", "--window", "W0-A", "--codex-features", "1"
    ])[0] == 0

    exit_code, out, err = _run(["--data-dir", str(data_dir), "preview", "--window", "W0-A"])
    assert exit_code == 0, err
    assert "Anomalies: 0 (see anomalies.jsonl)" in out


def test_preview_includes_subagent_proxy_block(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
    after = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")
    telemetry = (FIXTURES / "proxy/telemetry_sample.jsonl").read_text(encoding="utf-8")

    # Minimal window finalize so preview renders the provider block.
    assert _run([
        "--data-dir", str(data_dir), "ingest", "codex", "--window", "W0-CHN", "--phase", "before", "--stdin"
    ], before)[0] == 0
    assert _run([
        "--data-dir", str(data_dir), "ingest", "codex", "--window", "W0-CHN", "--phase", "after", "--stdin"
    ], after)[0] == 0
    assert _run([
        "--data-dir", str(data_dir), "complete", "--window", "W0-CHN", "--codex-features", "1", "--quality", "1.0"
    ])[0] == 0

    exit_code, _, err = _run([
        "--data-dir",
        str(data_dir),
        "ingest",
        "proxy-telemetry",
        "--window",
        "W0-CHN",
        "--stdin",
    ], telemetry)
    assert exit_code == 0, err

    exit_code, out, err = _run([
        "--data-dir",
        str(data_dir),
        "preview",
        "--window",
        "W0-CHN",
    ])
    assert exit_code == 0, err
    assert "Subagent Proxy:" in out
    assert "events=8" in out
    assert "routed=50%" in out
    assert "errors=12.5%" in out


def test_window_audit_reports_duplicates(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
    after = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")

    window = "W0-AUD"
    assert _run([
        "--data-dir",
        str(data_dir),
        "ingest",
        "codex",
        "--window",
        window,
        "--phase",
        "before",
        "--stdin",
    ], before)[0] == 0
    assert _run([
        "--data-dir",
        str(data_dir),
        "ingest",
        "codex",
        "--window",
        window,
        "--phase",
        "after",
        "--stdin",
    ], after)[0] == 0
    # First finalize
    assert _run([
        "--data-dir",
        str(data_dir),
        "complete",
        "--window",
        window,
        "--codex-features",
        "1",
        "--quality",
        "1.0",
    ])[0] == 0
    # Append duplicate after snapshot and finalize again to simulate corrections
    assert _run([
        "--data-dir",
        str(data_dir),
        "ingest",
        "codex",
        "--window",
        window,
        "--phase",
        "after",
        "--stdin",
    ], after)[0] == 0
    assert _run([
        "--data-dir",
        str(data_dir),
        "complete",
        "--window",
        window,
        "--codex-features",
        "1",
        "--quality",
        "1.0",
        "--notes",
        "audit-second-pass",
    ])[0] == 0

    exit_code, out, err = _run([
        "--data-dir",
        str(data_dir),
        "window-audit",
        "--window",
        window,
    ])
    assert exit_code == 0, err
    assert f"Window Audit: {window}" in out
    assert "duplicates=" in out
    assert "Finalize rows" in out


def test_window_audit_json_format(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
    after = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")
    window = "W0-AUDJSON"

    assert _run([
        "--data-dir",
        str(data_dir),
        "ingest",
        "codex",
        "--window",
        window,
        "--phase",
        "before",
        "--stdin",
    ], before)[0] == 0
    assert _run([
        "--data-dir",
        str(data_dir),
        "ingest",
        "codex",
        "--window",
        window,
        "--phase",
        "after",
        "--stdin",
    ], after)[0] == 0
    assert _run([
        "--data-dir",
        str(data_dir),
        "complete",
        "--window",
        window,
        "--codex-features",
        "1",
        "--quality",
        "1.0",
    ])[0] == 0

    exit_code, out, err = _run([
        "--data-dir",
        str(data_dir),
        "window-audit",
        "--window",
        window,
        "--format",
        "json",
    ])
    assert exit_code == 0, err
    payload = json.loads(out)
    assert payload["window"] == window
    assert payload["finalize"]["entries"] == 1
    assert payload["anomalies"]["count"] == 0
    assert payload["churn"]["count"] == 0
    assert payload["snapshots"]

