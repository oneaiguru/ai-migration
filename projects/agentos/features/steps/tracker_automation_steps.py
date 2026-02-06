from __future__ import annotations

import os
import subprocess
from pathlib import Path

from behave import when

REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURES = REPO_ROOT / "tests" / "fixtures"
SCRIPT_PATH = REPO_ROOT / "scripts" / "automation" / "codex_status.sh"
CLAUDE_SCRIPT_PATH = REPO_ROOT / "scripts" / "automation" / "claude_monitor.sh"


@when(
    'I run codex status automation with fixture "{fixture_name}" '
    'for window "{window_id}" phase "{phase}"'
)
def step_run_codex_automation(
    context,
    fixture_name: str,
    window_id: str,
    phase: str,
) -> None:
    if not SCRIPT_PATH.exists():
        raise AssertionError(f"automation script missing at {SCRIPT_PATH}")

    fixture_path = FIXTURES / fixture_name
    if not fixture_path.exists():
        raise FileNotFoundError(f"automation fixture not found: {fixture_path}")

    alias = {
        "before": "os",
        "after": "oe",
    }.get(phase)
    if not alias:
        raise AssertionError(f"unsupported phase for automation: {phase}")

    cmd = [
        "bash",
        str(SCRIPT_PATH),
        "--fixture",
        str(fixture_path),
        "--window",
        window_id,
        "--phase",
        phase,
        "--data-dir",
        str(context.data_dir),
        "--pipe-alias",
        alias,
        "--buffer-seconds",
        "0",
    ]

    env = os.environ.copy()
    env.setdefault("TRACKER_ALIAS_STATE_DIR", str(context.state_dir))

    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(REPO_ROOT),
        env=env,
        check=False,
    )
    context.last_exit_code = result.returncode
    context.last_stdout = result.stdout
    context.last_stderr = result.stderr
    if result.returncode != 0:
        raise AssertionError(result.stderr)


@when(
    'I run claude monitor automation with fixture "{fixture_name}" '
    'for window "{window_id}" notes "{notes}"'
)
def step_run_claude_automation(
    context,
    fixture_name: str,
    window_id: str,
    notes: str,
) -> None:
    if not CLAUDE_SCRIPT_PATH.exists():
        raise AssertionError(f"automation script missing at {CLAUDE_SCRIPT_PATH}")

    fixture_path = FIXTURES / fixture_name
    if not fixture_path.exists():
        raise FileNotFoundError(f"automation fixture not found: {fixture_path}")

    cmd = [
        "bash",
        str(CLAUDE_SCRIPT_PATH),
        "--fixture",
        str(fixture_path),
        "--window",
        window_id,
        "--data-dir",
        str(context.data_dir),
    ]
    if notes:
        cmd += ["--notes", notes]

    env = os.environ.copy()
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(REPO_ROOT),
        env=env,
        check=False,
    )
    context.last_exit_code = result.returncode
    context.last_stdout = result.stdout
    context.last_stderr = result.stderr
    if result.returncode != 0:
        raise AssertionError(result.stderr)
