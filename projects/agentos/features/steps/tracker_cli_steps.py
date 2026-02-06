from __future__ import annotations

import io
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from behave import step, then, when

from tracker.cli import main
from tracker.storage import JsonlStore

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES = REPO_ROOT / "tests" / "fixtures"


def _run_tracker_command(
    context,
    argv: list[str],
    stdin_text: str = "",
) -> None:
    stdout, stderr = io.StringIO(), io.StringIO()
    exit_code = main(argv, stdin=io.StringIO(stdin_text), stdout=stdout, stderr=stderr)
    context.last_exit_code = exit_code
    context.last_stdout = stdout.getvalue()
    context.last_stderr = stderr.getvalue()
    assert exit_code == 0, context.last_stderr


@step("decision card tools are staged in sandbox")
def step_stage_decision_card_tools(context):
    tools_src = REPO_ROOT / "scripts" / "tools"
    tools_dst = context.sandbox_root / "scripts" / "tools"
    tools_dst.mkdir(parents=True, exist_ok=True)
    for name in ("append_evidence.sh", "decision_card.py"):
        shutil.copy2(tools_src / name, tools_dst / name)
    context.tools_dir = tools_dst


@step("decision card ledgers are initialized")
def step_init_decision_card_ledgers(context):
    ledgers_dir = context.sandbox_root / "docs" / "Ledgers"
    ledgers_dir.mkdir(parents=True, exist_ok=True)
    context.ledgers_dir = ledgers_dir

    acceptance = ledgers_dir / "Acceptance_Evidence.csv"
    if not acceptance.exists():
        acceptance.write_text(
            "window_id,capability_id,test_run_id,runner,result,artifacts_path,artifact_hash,notes\n",
            encoding="utf-8",
        )

    churn = ledgers_dir / "Churn_Ledger.csv"
    if not churn.exists():
        churn.write_text(
            "date,window,provider,methodology,commit_start,commit_end,files_changed,insertions,deletions,net,features,normalized_churn,notes\n",
            encoding="utf-8",
        )


@step('a dummy artifact "{relative_path}" exists with content "{content}"')
def step_create_dummy_artifact(context, relative_path: str, content: str):
    artifact_path = context.sandbox_root / relative_path
    artifact_path.parent.mkdir(parents=True, exist_ok=True)
    artifact_path.write_text(content, encoding="utf-8")
    context.last_artifact_path = artifact_path


@step(
    'a finalized window "{window_id}" exists with codex features "{features}" '
    'outcome "{outcome}"'
)
def step_finalize_window_record(context, window_id: str, features: str, outcome: str):
    store = JsonlStore(context.data_dir)
    store.append_window(
        {
            "window": window_id,
            "finalized_at": datetime.utcnow().isoformat(),
            "features": {"codex": int(features), "claude": 0, "glm": 0},
            "quality": 1.0,
            "quality_score": 1.0,
            "outcome": outcome,
            "providers": {
                "codex": {
                    "delta": {"fiveh_pct": 0, "weekly_pct": 0},
                    "errors": [],
                }
            },
        }
    )


@step('a churn ledger row exists for window "{window_id}" provider "{provider}"')
def step_append_churn_row(context, window_id: str, provider: str):
    ledgers_dir: Path = getattr(context, "ledgers_dir", context.data_dir)
    if ledgers_dir.is_dir():
        churn_path = ledgers_dir / "Churn_Ledger.csv"
    else:
        churn_path = ledgers_dir
    churn_path.parent.mkdir(parents=True, exist_ok=True)
    if not churn_path.exists():
        churn_path.write_text(
            "date,window,provider,methodology,commit_start,commit_end,files_changed,insertions,deletions,net,features,normalized_churn,notes\n",
            encoding="utf-8",
        )
    today = datetime.utcnow().strftime("%Y-%m-%d")
    row = ",".join(
        [
            today,
            window_id,
            provider,
            "bdd",
            "HEAD",
            "HEAD",
            "1",
            "1",
            "0",
            "1",
            "1",
            "1.00",
            "bdd-scenario",
        ]
    )
    with churn_path.open("a", encoding="utf-8") as fh:
        fh.write(row + "\n")


@when(
    'I append acceptance evidence for window "{window_id}" capability "{cap}" '
    'runner "{runner}" result "{result}" using artifact "{relative_path}"'
)
def step_append_acceptance_evidence(
    context,
    window_id: str,
    cap: str,
    runner: str,
    result: str,
    relative_path: str,
):
    if not hasattr(context, "tools_dir"):
        raise AssertionError("call 'decision card tools are staged in sandbox' first")
    artifact_path = context.sandbox_root / relative_path
    cmd = [
        "bash",
        str(context.tools_dir / "append_evidence.sh"),
        "--window",
        window_id,
        "--capability",
        cap,
        "--runner",
        runner,
        "--result",
        result,
        "--artifacts",
        str(artifact_path),
        "--test-run-id",
        "TR-BDD",
    ]
    proc = subprocess.run(
        cmd,
        cwd=context.sandbox_root,
        check=False,
        capture_output=True,
        text=True,
    )
    context.last_exit_code = proc.returncode
    context.last_stdout = proc.stdout
    context.last_stderr = proc.stderr
    assert proc.returncode == 0, proc.stderr


@when('I run decision card for window "{window_id}" in sandbox')
def step_run_decision_card(context, window_id: str):
    if not hasattr(context, "tools_dir"):
        raise AssertionError("call 'decision card tools are staged in sandbox' first")
    cmd = [
        sys.executable,
        str(context.tools_dir / "decision_card.py"),
        "--data-dir",
        str(context.data_dir),
        "--window",
        window_id,
    ]
    proc = subprocess.run(
        cmd,
        cwd=context.sandbox_root,
        check=False,
        capture_output=True,
        text=True,
    )
    context.last_exit_code = proc.returncode
    context.last_stdout = proc.stdout
    context.last_stderr = proc.stderr
    assert proc.returncode == 0, proc.stderr

@when(
    'I ingest tracker snapshot for "{provider}" phase "{phase}" window "{window_id}" '
    'using fixture "{fixture_path}"'
)
def step_ingest_snapshot(context, provider: str, phase: str, window_id: str, fixture_path: str):
    payload = (FIXTURES / fixture_path).read_text(encoding="utf-8")
    argv = [
        "--data-dir",
        str(context.data_dir),
        "ingest",
        provider,
        "--window",
        window_id,
        "--phase",
        phase,
        "--stdin",
    ]
    _run_tracker_command(context, argv, payload)


@when(
    'I run tracker override for "{provider}" phase "{phase}" window "{window_id}" '
    'with weekly "{weekly}" fiveh "{fiveh}" notes "{notes}"'
)
def step_run_override(
    context,
    provider: str,
    phase: str,
    window_id: str,
    weekly: str,
    fiveh: str,
    notes: str,
):
    argv = [
        "--data-dir",
        str(context.data_dir),
        "override",
        provider,
        "--window",
        window_id,
        "--phase",
        phase,
        "--weekly-pct",
        weekly,
        "--fiveh-pct",
        fiveh,
    ]
    if notes:
        argv += ["--notes", notes]
    _run_tracker_command(context, argv)


@when(
    'I run tracker complete for window "{window_id}" with codex "{codex}" claude "{claude}" '
    'quality "{quality}" outcome "{outcome}" notes "{notes}"'
)
def step_run_complete(
    context,
    window_id: str,
    codex: str,
    claude: str,
    quality: str,
    outcome: str,
    notes: str,
):
    argv = [
        "--data-dir",
        str(context.data_dir),
        "complete",
        "--window",
        window_id,
        "--codex-features",
        codex,
        "--claude-features",
        claude,
        "--quality",
        quality,
    ]
    if outcome:
        argv += ["--outcome", outcome]
    if notes:
        argv += ["--notes", notes]
    _run_tracker_command(context, argv)


@when(
    'I run tracker complete with commits for window "{window_id}" '
    'codex "{codex}" claude "{claude}" quality "{quality}" outcome "{outcome}" '
    'notes "{notes}" commit-start "{commit_start}" commit-end "{commit_end}"'
)
def step_run_complete_with_commits(
    context,
    window_id: str,
    codex: str,
    claude: str,
    quality: str,
    outcome: str,
    notes: str,
    commit_start: str,
    commit_end: str,
):
    argv = [
        "--data-dir",
        str(context.data_dir),
        "complete",
        "--window",
        window_id,
        "--codex-features",
        codex,
        "--claude-features",
        claude,
        "--quality",
        quality,
        "--commit-start",
        commit_start,
        "--commit-end",
        commit_end,
    ]
    if outcome:
        argv += ["--outcome", outcome]
    if notes:
        argv += ["--notes", notes]
    _run_tracker_command(context, argv)


@when('I run tracker preview for window "{window_id}"')
def step_run_preview(context, window_id: str):
    argv = [
        "--data-dir",
        str(context.data_dir),
        "preview",
        "--window",
        window_id,
    ]
    _run_tracker_command(context, argv)


@when('I ingest tracker glm counts for window "{window_id}" using fixture "{fixture_path}"')
def step_ingest_glm(context, window_id: str, fixture_path: str):
    payload = (FIXTURES / fixture_path).read_text(encoding="utf-8")
    argv = [
        "--data-dir",
        str(context.data_dir),
        "ingest",
        "glm",
        "--window",
        window_id,
        "--stdin",
    ]
    _run_tracker_command(context, argv, payload)


@when('I ingest tracker codex ccusage for window "{window_id}" using fixture "{fixture_path}"')
def step_ingest_codex_ccusage(context, window_id: str, fixture_path: str):
    payload = (FIXTURES / fixture_path).read_text(encoding="utf-8")
    argv = [
        "--data-dir",
        str(context.data_dir),
        "ingest",
        "codex-ccusage",
        "--window",
        window_id,
        "--stdin",
    ]
    _run_tracker_command(context, argv, payload)


@when('I ingest tracker claude monitor for window "{window_id}" using fixture "{fixture_path}"')
def step_ingest_claude_monitor(context, window_id: str, fixture_path: str):
    payload = (FIXTURES / fixture_path).read_text(encoding="utf-8")
    argv = [
        "--data-dir",
        str(context.data_dir),
        "ingest",
        "claude-monitor",
        "--window",
        window_id,
        "--stdin",
    ]
    _run_tracker_command(context, argv, payload)


@when('I run tracker churn for window "{window_id}" with provider "{provider}"')
def step_run_churn(context, window_id: str, provider: str):
    ledger_base: Path = getattr(context, "ledgers_dir", context.data_dir)
    ledger_path = ledger_base / "Churn_Ledger.csv" if ledger_base.is_dir() else ledger_base
    ledger_path.parent.mkdir(parents=True, exist_ok=True)
    argv = [
        "--data-dir",
        str(context.data_dir),
        "churn",
        "--window",
        window_id,
        "--provider",
        provider,
        "--ledger-path",
        str(ledger_path),
    ]
    _run_tracker_command(context, argv)


@then('the last tracker stdout should contain "{phrase}"')
def step_assert_tracker_stdout(context, phrase: str):
    assert phrase in context.last_stdout, f"stdout missing '{phrase}': {context.last_stdout!r}"


@then('the last command stdout should contain "{phrase}"')
def step_assert_command_stdout(context, phrase: str):
    assert phrase in context.last_stdout, f"stdout missing '{phrase}': {context.last_stdout!r}"


@then('tracker should record window "{window_id}" codex delta weekly "{weekly}" fiveh "{fiveh}"')
def step_assert_window_delta(context, window_id: str, weekly: str, fiveh: str):
    store = JsonlStore(context.data_dir)
    windows = store.load_windows(window_id)
    assert windows, f"no windows recorded for {window_id}"
    latest = windows[-1]
    codex = latest.get("providers", {}).get("codex", {})
    delta = codex.get("delta") or {}
    assert str(delta.get("weekly_pct")) == weekly, (
        f"codex weekly delta mismatch: expected {weekly}, got {delta.get('weekly_pct')}"
    )
    assert str(delta.get("fiveh_pct")) == fiveh, (
        f"codex 5h delta mismatch: expected {fiveh}, got {delta.get('fiveh_pct')}"
    )


@then(
    'tracker snapshot source for "{provider}" phase "{phase}" window "{window_id}" should be "{source}"'
)
def step_assert_snapshot_source(
    context,
    provider: str,
    phase: str,
    window_id: str,
    source: str,
):
    store = JsonlStore(context.data_dir)
    snapshots = [
        snap
        for snap in store.load_snapshots(window_id)
        if snap.get("provider") == provider and snap.get("phase") == phase
    ]
    assert snapshots, f"missing snapshot for {provider}/{phase} {window_id}"
    assert snapshots[-1].get("source") == source, (
        f"expected source {source}, got {snapshots[-1].get('source')}"
    )


@then(
    'tracker snapshot errors for "{provider}" phase "{phase}" window "{window_id}" '
    'should contain "{expected}"'
)
def step_assert_snapshot_errors(
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
    assert snapshots, f"missing snapshot for {provider}/{phase} {window_id}"
    errors = snapshots[-1].get("parsed", {}).get("errors") or []
    assert expected in errors, f"expected {expected} in errors {errors}"


@then('tracker glm entry for window "{window_id}" should include provider "{provider}"')
def step_assert_glm_provider(context, window_id: str, provider: str):
    store = JsonlStore(context.data_dir)
    rows = store.load_glm_counts(window_id)
    assert rows, f"missing glm counts for {window_id}"
    parsed = rows[-1].get("parsed") or {}
    blocks = parsed.get("blocks") or []
    providers = {block.get("provider") for block in blocks if isinstance(block, dict)}
    assert provider in providers, f"expected provider {provider} in {providers}"


@then('tracker codex ccusage record for window "{window_id}" should have session count "{expected}"')
def step_assert_codex_ccusage_sessions(context, window_id: str, expected: str):
    store = JsonlStore(context.data_dir)
    records = store.load_codex_ccusage(window_id)
    assert records, f"missing codex ccusage record for {window_id}"
    parsed = records[-1].get("parsed") or {}
    assert str(parsed.get("session_count")) == expected, (
        f"expected session count {expected}, got {parsed.get('session_count')}"
    )


@then('tracker codex ccusage total tokens for window "{window_id}" should be "{expected}"')
def step_assert_codex_ccusage_tokens(context, window_id: str, expected: str):
    store = JsonlStore(context.data_dir)
    records = store.load_codex_ccusage(window_id)
    assert records, f"missing codex ccusage record for {window_id}"
    parsed = records[-1].get("parsed") or {}
    assert str(int(parsed.get("total_tokens", 0))) == expected, (
        f"expected total tokens {expected}, got {parsed.get('total_tokens')}"
    )


@then('tracker claude monitor record for window "{window_id}" should have token usage "{expected}"')
def step_assert_claude_monitor_usage(context, window_id: str, expected: str):
    store = JsonlStore(context.data_dir)
    records = store.load_claude_monitor(window_id)
    assert records, f"missing claude monitor record for {window_id}"
    parsed = records[-1].get("parsed") or {}
    assert f"{parsed.get('token_usage_pct'):.1f}" == expected, (
        f"expected token usage {expected}, got {parsed.get('token_usage_pct')}"
    )


@then('tracker claude monitor token limit for window "{window_id}" should be "{expected}"')
def step_assert_claude_monitor_limit(context, window_id: str, expected: str):
    store = JsonlStore(context.data_dir)
    records = store.load_claude_monitor(window_id)
    assert records, f"missing claude monitor record for {window_id}"
    parsed = records[-1].get("parsed") or {}
    assert str(parsed.get("token_limit")) == expected, (
        f"expected token limit {expected}, got {parsed.get('token_limit')}"
    )
