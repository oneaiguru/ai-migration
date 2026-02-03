from __future__ import annotations

import io
import json
from pathlib import Path

import pytest

from tracker.cli import main
from tracker.meta import SCHEMA_VERSION
from tracker import __version__
from tracker.storage import JsonlStore

FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"


def _run(argv: list[str], stdin_text: str = "") -> tuple[int, str, str]:
    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdin=io.StringIO(stdin_text), stdout=stdout, stderr=stderr)
    return exit_code, stdout.getvalue(), stderr.getvalue()


def _load_state(state_file: Path) -> dict[str, object]:
    if not state_file.exists():
        return {}
    return json.loads(state_file.read_text(encoding="utf-8"))


def test_alias_start_and_end_records_snapshots(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    state_dir = data_dir / "state"
    codex_before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
    codex_after = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "start",
            "codex",
            "--stdin",
            "--state-dir",
            str(state_dir),
        ],
        codex_before,
    )
    assert exit_code == 0, err
    assert "stored codex before snapshot" in out

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "end",
            "codex",
            "--stdin",
            "--state-dir",
            str(state_dir),
        ],
        codex_after,
    )
    assert exit_code == 0, err
    assert "stored codex after snapshot" in out

    store = JsonlStore(data_dir)
    snapshots = [snap for snap in store.load_snapshots("W0-01") if snap.get("provider") == "codex"]
    phases = {snap.get("phase") for snap in snapshots}
    assert phases == {"before", "after"}
    for snap in snapshots:
        assert snap["schema_version"] == SCHEMA_VERSION
        assert snap["tool_version"] == __version__

    state = _load_state(state_dir / "codex.json")
    assert state.get("current_window") == "W0-01"
    assert state.get("last_phase") == "after"


def test_alias_end_handles_multi_pane_status(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    state_dir = data_dir / "state"
    codex_before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
    codex_multi = (FIXTURES / "codex/live_cases/W0-20_after_multi_status.txt").read_text(
        encoding="utf-8"
    )

    # Seed start snapshot.
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "start",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
            ],
            codex_before,
        )[0]
        == 0
    )

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "end",
            "codex",
            "--stdin",
            "--state-dir",
            str(state_dir),
        ],
        codex_multi,
    )
    assert exit_code == 0, err
    assert "stored codex after snapshot" in out

    store = JsonlStore(data_dir)
    snapshots = [
        snap
        for snap in store.load_snapshots("W0-01")
        if snap.get("provider") == "codex" and snap.get("phase") == "after"
    ]
    assert snapshots
    parsed = snapshots[-1].get("parsed") or {}
    assert parsed.get("fiveh_pct") == 0
    assert parsed.get("weekly_pct") == 10
    assert "multi-pane-trimmed" in (parsed.get("errors") or [])


def test_alias_cross_seeds_next_window(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    state_dir = data_dir / "state"
    codex_before = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")

    # Start window W0-01.
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "start",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
            ],
            codex_before,
        )[0]
        == 0
    )

    # Cross should capture after for W0-01 and before for W0-02.
    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "cross",
            "codex",
            "--stdin",
            "--state-dir",
            str(state_dir),
        ],
        codex_before,
    )
    assert exit_code == 0, err
    assert "seeded before snapshot for W0-02" in out

    store = JsonlStore(data_dir)
    snaps_w0_01 = [
        snap
        for snap in store.load_snapshots("W0-01")
        if snap.get("provider") == "codex" and snap.get("phase") == "after"
    ]
    assert snaps_w0_01, "expected after snapshot for W0-01"

    snaps_w0_02 = [
        snap
        for snap in store.load_snapshots("W0-02")
        if snap.get("provider") == "codex" and snap.get("phase") == "before"
    ]
    assert snaps_w0_02, "expected seeded before snapshot for W0-02"

    state = _load_state(state_dir / "codex.json")
    assert state.get("current_window") == "W0-02"
    assert state.get("last_phase") == "before"


def test_alias_end_without_before_errors(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    codex_after = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")

    exit_code, _, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "end",
            "codex",
            "--stdin",
        ],
        codex_after,
    )
    assert exit_code == 1
    assert "no BEFORE snapshot" in err


def test_alias_glm_baseline_and_delta(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    state_dir = data_dir / "state"
    glm_start = json.dumps(
        {
            "account": "glm",
            "generated_at": "2025-11-05T10:00:00Z",
            "blocks": [
                {
                    "window_id": "W0-01",
                    "provider": "glm-4.6",
                    "prompts_used": 10,
                }
            ],
        }
    )
    glm_end = json.dumps(
        {
            "account": "glm",
            "generated_at": "2025-11-05T15:00:00Z",
            "blocks": [
                {
                    "window_id": "W0-01",
                    "provider": "glm-4.6",
                    "prompts_used": 25,
                }
            ],
        }
    )

    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "start",
                "glm",
                "--stdin",
                "--state-dir",
                str(state_dir),
            ],
            glm_start,
        )[0]
        == 0
    )

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "end",
            "glm",
            "--stdin",
            "--state-dir",
            str(state_dir),
        ],
        glm_end,
    )
    assert exit_code == 0, err
    assert "stored glm delta" in out

    store = JsonlStore(data_dir)
    counts = store.load_glm_counts("W0-01")
    assert counts and pytest.approx(counts[-1]["prompts_used"]) == 15.0

    state = _load_state(state_dir / "glm.json")
    assert state.get("last_phase") == "after"
    assert pytest.approx(state.get("baseline_prompts")) == 25.0


def test_alias_delete_latest_snapshot(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    state_dir = data_dir / "state"
    before_text = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")
    after_text = (FIXTURES / "codex/wide_status_82_1.txt").read_text(encoding="utf-8")

    # Record before/after snapshots.
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "start",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
            ],
            before_text,
        )[0]
        == 0
    )
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "end",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
            ],
            after_text,
        )[0]
        == 0
    )

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "delete",
            "codex",
            "--state-dir",
            str(state_dir),
            "--phase",
            "after",
        ]
    )
    assert exit_code == 0, err
    assert "removed codex after snapshot" in out

    store = JsonlStore(data_dir)
    remaining = [
        snap
        for snap in store.load_snapshots()
        if snap.get("provider") == "codex" and snap.get("phase") == "after"
    ]
    assert not remaining

    state = _load_state(state_dir / "codex.json")
    assert state.get("last_phase") == "before"


def test_alias_delete_second_latest_snapshot(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    state_dir = data_dir / "state"
    pane = (FIXTURES / "codex/alt_reset_64_0.txt").read_text(encoding="utf-8")

    # Create before snapshot for W0-01 and W0-02 via cross.
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "start",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
            ],
            pane,
        )[0]
        == 0
    )
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "cross",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
            ],
            pane,
        )[0]
        == 0
    )

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "delete",
            "codex",
            "--state-dir",
            str(state_dir),
            "--phase",
            "before",
            "--index",
            "2",
        ]
    )
    assert exit_code == 0, err
    assert "removed codex before snapshot" in out

    store = JsonlStore(data_dir)
    windows = {
        snap.get("window")
        for snap in store.load_snapshots()
        if snap.get("provider") == "codex" and snap.get("phase") == "before"
    }
    # Expect only the latest window (W0-02) to remain.
    assert windows == {"W0-02"}


def test_alias_delete_index_too_large_errors(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"

    exit_code, _, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "delete",
            "codex",
            "--index",
            "2",
        ]
    )
    assert exit_code == 1
    assert "no matching snapshots" in err or "cannot delete index" in err


def test_alias_real_world_cleanup(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    state_dir = data_dir / "state"
    before_w0_19 = (FIXTURES / "codex/live_cases/W0-19_before_correct.txt").read_text(encoding="utf-8")
    after_w0_19 = (FIXTURES / "codex/live_cases/W0-19_after_12pct.txt").read_text(encoding="utf-8")
    before_w0_20 = (FIXTURES / "codex/live_cases/W0-20_start_0pct.txt").read_text(encoding="utf-8")

    # Record correct W0-19 window.
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "start",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
                "--window",
                "W0-19",
            ],
            before_w0_19,
        )[0]
        == 0
    )
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "end",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
                "--window",
                "W0-19",
            ],
            after_w0_19,
        )[0]
        == 0
    )

    # Mistaken W0-20 start.
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "start",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
                "--window",
                "W0-20",
            ],
            before_w0_20,
        )[0]
        == 0
    )

    exit_code, out, err = _run(
        [
            "--data-dir",
            str(data_dir),
            "alias",
            "delete",
            "codex",
            "--state-dir",
            str(state_dir),
            "--phase",
            "before",
            "--window",
            "W0-20",
        ]
    )
    assert exit_code == 0, err
    assert "removed codex before snapshot" in out

    # Re-ingest the corrected start pane.
    assert (
        _run(
            [
                "--data-dir",
                str(data_dir),
                "alias",
                "start",
                "codex",
                "--stdin",
                "--state-dir",
                str(state_dir),
                "--window",
                "W0-20",
            ],
            before_w0_20,
        )[0]
        == 0
    )

    store = JsonlStore(data_dir)
    snapshots = store.load_snapshots()
    assert any(
        snap.get("window") == "W0-19" and snap.get("phase") == "before" for snap in snapshots
    )
    assert any(
        snap.get("window") == "W0-19" and snap.get("phase") == "after" for snap in snapshots
    )
    assert any(
        snap.get("window") == "W0-20" and snap.get("phase") == "before" for snap in snapshots
    )
    assert not any(
        snap.get("window") == "W0-20" and snap.get("phase") == "after" for snap in snapshots
    )

    state = _load_state(state_dir / "codex.json")
    assert state.get("current_window") == "W0-20"
    assert state.get("last_phase") == "before"
