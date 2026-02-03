from __future__ import annotations

import io
import json
import math
import tempfile
from pathlib import Path

from behave import given, step, then, when

from tracker.cli import main
from tracker.storage import JsonlStore

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES = REPO_ROOT / "tests" / "fixtures"


@given("a fresh tracker data directory")
def step_fresh_data_dir(context):
    tmp_dir = tempfile.TemporaryDirectory(prefix="tracker-bdd-")
    context._tmpdir = tmp_dir  # keep reference alive for cleanup
    root = Path(tmp_dir.name)
    context.sandbox_root = root
    context.data_dir = root / "data"
    context.data_dir.mkdir(parents=True, exist_ok=True)
    context.state_dir = context.data_dir / "state"
    context.last_stdout = ""
    context.last_stderr = ""
    context.last_exit_code = 0
    context.agent_state_dirs: dict[str, Path] = {}
    context.current_agent_id: str | None = None


@when('I run the alias command "{action} {provider}" with fixture "{fixture_path}"')
def step_run_alias_with_fixture(context, action: str, provider: str, fixture_path: str):
    payload = (FIXTURES / fixture_path).read_text(encoding="utf-8")
    agent_id = getattr(context, "current_agent_id", None)
    notes = f"AGENT_ID={agent_id}" if agent_id else None
    _run_alias(context, action, provider, payload, agent_id=agent_id, notes=notes)


@step('I run the alias command "{action} {provider}" with window "{window_id}" using fixture "{fixture_path}"')
def step_run_alias_with_fixture_window(
    context,
    action: str,
    provider: str,
    window_id: str,
    fixture_path: str,
):
    payload = (FIXTURES / fixture_path).read_text(encoding="utf-8")
    agent_id = getattr(context, "current_agent_id", None)
    notes = f"AGENT_ID={agent_id}" if agent_id else None
    _run_alias(
        context,
        action,
        provider,
        payload,
        window=window_id,
        agent_id=agent_id,
        notes=notes,
    )


@when('I run the alias command "{action} {provider}" with inline json:')
def step_run_alias_with_inline_json(context, action: str, provider: str):
    payload = context.text.strip()
    agent_id = getattr(context, "current_agent_id", None)
    notes = f"AGENT_ID={agent_id}" if agent_id else None
    _run_alias(context, action, provider, payload, agent_id=agent_id, notes=notes)


@then('tracker should have a "{provider}" "{phase}" snapshot for window "{window_id}"')
def step_assert_snapshot(context, provider: str, phase: str, window_id: str):
    store = JsonlStore(context.data_dir)
    snapshots = store.load_snapshots(window_id)
    assert any(
        snap.get("provider") == provider and snap.get("phase") == phase for snap in snapshots
    ), f"missing {provider}/{phase} snapshot for {window_id}"


@then('tracker should have no "{provider}" "{phase}" snapshot for window "{window_id}"')
def step_assert_no_snapshot(context, provider: str, phase: str, window_id: str):
    store = JsonlStore(context.data_dir)
    snapshots = store.load_snapshots(window_id)
    assert not any(
        snap.get("provider") == provider and snap.get("phase") == phase for snap in snapshots
    ), f"unexpected {provider}/{phase} snapshot for {window_id}"


@then('tracker should record glm prompts "{expected}" for window "{window_id}"')
def step_assert_glm_prompts(context, expected: str, window_id: str):
    store = JsonlStore(context.data_dir)
    counts = store.load_glm_counts(window_id)
    assert counts, f"no glm counts for {window_id}"
    expected_value = float(expected)
    actual = counts[-1].get("prompts_used")
    assert actual is not None and math.isclose(actual, expected_value, rel_tol=1e-6), (
        f"glm prompts mismatch for {window_id}: expected {expected_value}, got {actual}"
    )


@then(
    'tracker should record codex metrics for window "{window_id}" phase "{phase}" '
    'with 5h "{fiveh}" and weekly "{weekly}"'
)
def step_assert_codex_metrics(
    context,
    window_id: str,
    phase: str,
    fiveh: str,
    weekly: str,
):
    store = JsonlStore(context.data_dir)
    snapshots = [
        snap
        for snap in store.load_snapshots(window_id)
        if snap.get("provider") == "codex" and snap.get("phase") == phase
    ]
    assert snapshots, f"missing codex {phase} snapshot for {window_id}"
    latest = snapshots[-1]
    parsed = latest.get("parsed") or {}
    expected_fiveh = int(fiveh)
    expected_weekly = int(weekly)
    assert parsed.get("fiveh_pct") == expected_fiveh, (
        f"codex 5h pct mismatch: expected {expected_fiveh}, got {parsed.get('fiveh_pct')}"
    )
    assert parsed.get("weekly_pct") == expected_weekly, (
        f"codex weekly pct mismatch: expected {expected_weekly}, got {parsed.get('weekly_pct')}"
    )


@then('tracker should note codex errors for window "{window_id}" phase "{phase}" containing "{expected}"')
def step_assert_codex_errors(
    context,
    window_id: str,
    phase: str,
    expected: str,
):
    store = JsonlStore(context.data_dir)
    snapshots = [
        snap
        for snap in store.load_snapshots(window_id)
        if snap.get("provider") == "codex" and snap.get("phase") == phase
    ]
    assert snapshots, f"missing codex {phase} snapshot for {window_id}"
    parsed = snapshots[-1].get("parsed") or {}
    errors = parsed.get("errors") or []
    assert expected in errors, f"expected error '{expected}' not found in {errors}"


@then('the last alias stdout should contain "{phrase}"')
def step_assert_stdout_contains(context, phrase: str):
    assert phrase in context.last_stdout, f"stdout missing phrase '{phrase}': {context.last_stdout!r}"


def _run_alias(
    context,
    action: str,
    provider: str,
    payload: str,
    *,
    window: str | None = None,
    agent_id: str | None = None,
    notes: str | None = None,
) -> None:
    state_dir = context.state_dir
    if agent_id:
        state_dir = state_dir / agent_id
        context.agent_state_dirs[agent_id] = state_dir

    argv = [
        "--data-dir",
        str(context.data_dir),
        "alias",
        action,
        provider,
        "--stdin",
        "--state-dir",
        str(state_dir),
    ]
    if window:
        argv += ["--window", window]
    if notes:
        argv += ["--notes", notes]
    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdin=io.StringIO(payload), stdout=stdout, stderr=stderr)
    context.last_exit_code = exit_code
    context.last_stdout = stdout.getvalue()
    context.last_stderr = stderr.getvalue()
    assert exit_code == 0, context.last_stderr


@step('I set alias agent "{agent_id}"')
def step_set_alias_agent(context, agent_id: str):
    context.current_agent_id = agent_id


@when('I run the alias delete command "{provider}" with options:')
def step_run_alias_delete(context, provider: str):
    options = {row['option']: row['value'] for row in context.table}
    argv = [
        "--data-dir",
        str(context.data_dir),
        "alias",
        "delete",
        provider,
        "--state-dir",
        str(context.state_dir),
    ]
    if "phase" in options:
        argv += ["--phase", options["phase"]]
    if "index" in options:
        argv += ["--index", options["index"]]
    if "window" in options:
        argv += ["--window", options["window"]]

    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdout=stdout, stderr=stderr)
    context.last_exit_code = exit_code
    context.last_stdout = stdout.getvalue()
    context.last_stderr = stderr.getvalue()
    assert exit_code == 0, context.last_stderr


@then(
    'tracker snapshot notes for "{provider}" "{phase}" window "{window_id}" '
    'should contain "{expected}"'
)
def step_assert_snapshot_notes(
    context,
    provider: str,
    phase: str,
    window_id: str,
    expected: str,
):
    store = JsonlStore(context.data_dir)
    snapshots = [
        snap
        for snap in store.load_snapshots(window_id)
        if snap.get("provider") == provider and snap.get("phase") == phase
    ]
    assert snapshots, f"missing {provider}/{phase} snapshot for {window_id}"
    assert any(
        expected in (snap.get("notes") or "") for snap in snapshots
    ), f"notes do not contain '{expected}' in {[snap.get('notes') for snap in snapshots]}"


@then(
    'alias state for agent "{agent_id}" provider "{provider}" '
    'should have window "{window_id}" and phase "{phase}"'
)
def step_assert_agent_state(
    context,
    agent_id: str,
    provider: str,
    window_id: str,
    phase: str,
):
    state_dir = context.state_dir / agent_id
    state_path = state_dir / f"{provider}.json"
    assert state_path.exists(), f"missing state file {state_path}"
    state = json.loads(state_path.read_text(encoding="utf-8"))
    assert state.get("current_window") == window_id, (
        f"expected current_window {window_id}, got {state.get('current_window')}"
    )
    assert state.get("last_phase") == phase, (
        f"expected last_phase {phase}, got {state.get('last_phase')}"
    )


@then("the alias state directories should be unique per agent")
def step_assert_unique_state_dirs(context):
    paths = list(context.agent_state_dirs.values())
    assert paths, "no agent state directories recorded"
    resolved = [p.resolve() for p in paths]
    assert len(resolved) == len(set(resolved)), "agent state directories are not unique"
    for path in paths:
        assert path.exists(), f"state directory {path} missing"
