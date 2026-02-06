import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
CLI = PROJECT_ROOT / "ai_flow.py"


def run_cli(*args, cwd=None):
    cmd = [sys.executable, str(CLI), *args]
    result = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, (
        f"Command failed: {' '.join(cmd)}\n"
        f"stdout:\n{result.stdout}\n"
        f"stderr:\n{result.stderr}\n"
    )
    return result


def test_init_project_creates_base_files(tmp_path):
    project_dir = tmp_path / "demo-project"
    run_cli("init-project", str(project_dir), "--title", "Demo")

    assert (project_dir / "project.md").is_file()
    assert (project_dir / "plan.md").is_file()
    assert (project_dir / "journal.md").is_file()
    assert (project_dir / "branches").is_dir()


def test_create_branch_creates_branch(tmp_path):
    project_dir = tmp_path / "demo-project"
    run_cli("init-project", str(project_dir), "--title", "Demo")
    run_cli("create-branch", str(project_dir), "A_main", "--title", "Main")

    branch_dir = project_dir / "branches" / "A_main"
    assert (branch_dir / "branch-info.md").is_file()
    assert (branch_dir / "runs").is_dir()


def test_new_step_creates_templates(tmp_path):
    project_dir = tmp_path / "demo-project"
    run_cli("init-project", str(project_dir), "--title", "Demo")
    run_cli("create-branch", str(project_dir), "A_main")
    run_cli("new-step", str(project_dir), "A_main", "A_001")

    step_dir = project_dir / "branches" / "A_main" / "runs" / "A_001"
    assert (step_dir / "prompt.md").is_file()
    assert (step_dir / "context.md").is_file()
    assert (step_dir / "result_raw.md").is_file()
    assert (step_dir / "evaluation.md").is_file()


def test_from_step_populates_parent_reference(tmp_path):
    project_dir = tmp_path / "demo-project"
    run_cli("init-project", str(project_dir), "--title", "Demo")
    run_cli("create-branch", str(project_dir), "A_main")
    run_cli("new-step", str(project_dir), "A_main", "A_001")
    run_cli("new-step", str(project_dir), "A_main", "A_002", "--from-step", "A_001")

    prompt_path = (
        project_dir
        / "branches"
        / "A_main"
        / "runs"
        / "A_002"
        / "prompt.md"
    )
    prompt_text = prompt_path.read_text(encoding="utf-8")
    assert "Parent step: A_main/A_001" in prompt_text
    assert "- branches/A_main/runs/A_001/result_raw.md" in prompt_text


def test_dry_run_does_not_create_files(tmp_path):
    project_dir = tmp_path / "demo-project"
    run_cli("init-project", str(project_dir), "--dry-run")
    assert not project_dir.exists()


def test_force_overwrites_template_files(tmp_path):
    project_dir = tmp_path / "demo-project"
    run_cli("init-project", str(project_dir), "--title", "Original")

    project_file = project_dir / "project.md"
    project_file.write_text("CHANGED", encoding="utf-8")

    run_cli("init-project", str(project_dir), "--title", "Reset", "--force")
    refreshed = project_file.read_text(encoding="utf-8")
    assert "# Project: Reset" in refreshed
