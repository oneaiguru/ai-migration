from __future__ import annotations

import io
import json
from pathlib import Path

from tracker.cli import main
from tracker.storage import JsonlStore

FIXTURES = Path(__file__).resolve().parents[2] / "tests" / "fixtures"


def _run_alias(
    data_dir: Path,
    state_dir: Path,
    action: str,
    provider: str,
    payload: str,
) -> str:
    argv = [
        "--data-dir",
        str(data_dir),
        "alias",
        action,
        provider,
        "--stdin",
        "--state-dir",
        str(state_dir),
        "--notes",
        f"AGENT_ID={state_dir.name}",
    ]
    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdin=io.StringIO(payload), stdout=stdout, stderr=stderr)
    assert exit_code == 0, stderr.getvalue()
    return stdout.getvalue()


def test_alias_state_is_isolated_per_agent(tmp_path: Path) -> None:
    data_dir = tmp_path / "week0"
    state_root = data_dir / "state"
    payload = (FIXTURES / "codex" / "alt_reset_64_0.txt").read_text(encoding="utf-8")

    out_main = _run_alias(data_dir, state_root / "main", "start", "codex", payload)
    out_sub = _run_alias(data_dir, state_root / "sub1", "start", "codex", payload)

    assert "stored codex before snapshot" in out_main
    assert "stored codex before snapshot" in out_sub

    store = JsonlStore(data_dir)
    snapshots = [
        snap
        for snap in store.load_snapshots("W0-01")
        if snap.get("provider") == "codex" and snap.get("phase") == "before"
    ]
    assert len(snapshots) == 2
    notes = {snap.get("notes") for snap in snapshots}
    assert "AGENT_ID=main" in notes
    assert "AGENT_ID=sub1" in notes

    state_main_path = state_root / "main" / "codex.json"
    state_sub_path = state_root / "sub1" / "codex.json"
    assert state_main_path.exists()
    assert state_sub_path.exists()

    state_main = json.loads(state_main_path.read_text(encoding="utf-8"))
    state_sub = json.loads(state_sub_path.read_text(encoding="utf-8"))

    assert state_main["current_window"] == "W0-01"
    assert state_sub["current_window"] == "W0-01"
    assert state_main["last_phase"] == "before"
    assert state_sub["last_phase"] == "before"

    assert state_main_path.parent.resolve() != state_sub_path.parent.resolve()
