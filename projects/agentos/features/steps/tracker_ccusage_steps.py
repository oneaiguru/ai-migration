from __future__ import annotations

import io
from pathlib import Path

from behave import then, when

from tracker.cli import main
from tracker.storage import JsonlStore

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES = REPO_ROOT / "tests" / "fixtures"


def _load_fixture(name: str) -> str:
    path = FIXTURES / name
    if not path.exists():
        raise FileNotFoundError(f"fixture not found: {path}")
    return path.read_text(encoding="utf-8")


def _run_tracker(
    context,
    argv: list[str],
    stdin_text: str,
) -> None:
    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdin=io.StringIO(stdin_text), stdout=stdout, stderr=stderr)
    context.last_exit_code = exit_code
    context.last_stdout = stdout.getvalue()
    context.last_stderr = stderr.getvalue()
    assert exit_code == 0, context.last_stderr


def _latest_ccusage_record(context, window_id: str) -> dict:
    store = JsonlStore(context.data_dir)
    records = store.load_codex_ccusage(window_id)
    assert records, f"no codex ccusage records for window {window_id}"
    return records[-1]


@when(
    'I ingest tracker codex ccusage scope "{scope}" for window "{window_id}" '
    'using fixture "{fixture_path}"'
)
def step_ingest_ccusage(
    context,
    scope: str,
    window_id: str,
    fixture_path: str,
) -> None:
    payload = _load_fixture(fixture_path)
    argv = [
        "--data-dir",
        str(context.data_dir),
        "ingest",
        "codex-ccusage",
        "--window",
        window_id,
        "--stdin",
        "--scope",
        scope,
    ]
    _run_tracker(context, argv, payload)


@then('tracker codex ccusage record for window "{window_id}" should have scope "{scope}"')
def step_assert_ccusage_scope(context, window_id: str, scope: str) -> None:
    record = _latest_ccusage_record(context, window_id)
    parsed = record.get("parsed") or {}
    assert parsed.get("scope") == scope, (
        f"expected scope {scope}, got {parsed.get('scope')}"
    )

@then(
    'tracker codex ccusage latest session id for window "{window_id}" '
    'should be "{session_id}"'
)
def step_assert_latest_session(context, window_id: str, session_id: str) -> None:
    record = _latest_ccusage_record(context, window_id)
    parsed = record.get("parsed") or {}
    latest = (parsed.get("latest_session") or {}).get("session_id")
    assert latest == session_id, (
        f"expected latest session {session_id}, got {latest}"
    )


@then(
    'tracker codex ccusage daily total tokens for window "{window_id}" date "{date}" '
    'should be "{tokens}"'
)
def step_assert_daily_tokens(
    context,
    window_id: str,
    date: str,
    tokens: str,
) -> None:
    record = _latest_ccusage_record(context, window_id)
    parsed = record.get("parsed") or {}
    days = parsed.get("days") or []
    day = next((row for row in days if row.get("date") == date), None)
    assert day, f"missing daily entry for {date}"
    actual = day.get("total_tokens")
    assert str(actual) == tokens, f"expected {tokens} tokens for {date}, got {actual}"


@then(
    'tracker codex ccusage daily percent used for window "{window_id}" date "{date}" '
    'should be "{percent}"'
)
def step_assert_daily_percent(
    context,
    window_id: str,
    date: str,
    percent: str,
) -> None:
    record = _latest_ccusage_record(context, window_id)
    parsed = record.get("parsed") or {}
    days = parsed.get("days") or []
    day = next((row for row in days if row.get("date") == date), None)
    assert day, f"missing daily entry for {date}"
    actual = day.get("percent_used")
    assert str(actual) == percent, f"expected {percent}% for {date}, got {actual}"


@then('tracker codex ccusage reset at for window "{window_id}" should be "{reset_at}"')
def step_assert_reset_at(context, window_id: str, reset_at: str) -> None:
    record = _latest_ccusage_record(context, window_id)
    parsed = record.get("parsed") or {}
    actual = parsed.get("reset_at")
    assert actual == reset_at, f"expected reset_at {reset_at}, got {actual}"


@then('tracker codex ccusage weekly percent used for window "{window_id}" should be "{percent}"')
def step_assert_weekly_percent(context, window_id: str, percent: str) -> None:
    record = _latest_ccusage_record(context, window_id)
    parsed = record.get("parsed") or {}
    weekly = parsed.get("weekly") or {}
    actual = weekly.get("percent_used")
    assert str(actual) == percent, f"expected weekly percent {percent}, got {actual}"


@then('tracker codex ccusage weekly total tokens for window "{window_id}" should be "{tokens}"')
def step_assert_weekly_tokens(context, window_id: str, tokens: str) -> None:
    record = _latest_ccusage_record(context, window_id)
    parsed = record.get("parsed") or {}
    weekly = parsed.get("weekly") or {}
    actual = weekly.get("tokens_used")
    assert str(actual) == tokens, f"expected weekly tokens {tokens}, got {actual}"


@then('tracker codex ccusage record for window "{window_id}" should list error "{error_code}"')
def step_assert_ccusage_error(context, window_id: str, error_code: str) -> None:
    record = _latest_ccusage_record(context, window_id)
    parsed = record.get("parsed") or {}
    errors = parsed.get("errors") or []
    assert error_code in errors, f"expected error {error_code} in {errors}"
