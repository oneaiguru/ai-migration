#!/usr/bin/env python3
"""Simple automated setup for TaskFlow.ai."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path


def check_requirements() -> bool:
    """Ensure Python and Git are available."""
    python_ok = sys.version_info >= (3, 8)
    git_ok = shutil.which("git") is not None

    if python_ok:
        print("Python found")
    else:
        print("Python 3.8+ required")

    if git_ok:
        print("Git found")
    else:
        print("Git is missing")

    return python_ok and git_ok


def install_dependencies() -> bool:
    """Install Python packages from requirements.txt."""
    req_file = Path("requirements.txt")
    if not req_file.exists():
        print("No requirements.txt found; skipping dependency install")
        return True

    print("Installing Python dependencies...")
    cmd = [sys.executable, "-m", "pip", "install", "-r", str(req_file)]
    result = subprocess.run(cmd)
    success = result.returncode == 0
    if success:
        print("Dependencies installed")
    else:
        print("Failed to install dependencies")
    return success


def init_config() -> None:
    """Create .env from example if needed."""
    src = Path(".env.example")
    dest = Path(".env")
    if src.exists() and not dest.exists():
        dest.write_text(src.read_text())
        print("Created .env from example")
    else:
        print(".env already exists or no example found")


def setup_database_and_dirs() -> None:
    """Create initial folders and database file."""
    dirs = [
        "core/ai-docs/architecture",
        "core/ai-docs/patterns",
        "core/specs/templates",
        "core/.claude",
    ]
    for d in dirs:
        Path(d).mkdir(parents=True, exist_ok=True)

    db_path = Path(os.getenv("DB_PATH", "taskflow.db"))
    if not db_path.exists():
        db_path.touch()
        print(f"Created database {db_path}")
    else:
        print(f"Database {db_path} already exists")


def create_templates() -> None:
    """Copy example templates if missing."""
    src = Path("core/specs/templates/task-template.example.md")
    dest = Path("core/specs/templates/task-template.md")
    if src.exists() and not dest.exists():
        shutil.copy(src, dest)
        print("Created task template")
    else:
        print("Task template already exists")


def init_git() -> None:
    """Initialize git repository if not present."""
    if not Path(".git").exists():
        subprocess.run(["git", "init"], check=False)
        print("Initialized git repository")
    else:
        print("Git repository already initialized")


def main() -> None:
    if not check_requirements():
        print("Missing requirements. Setup aborted.")
        sys.exit(1)

    if not install_dependencies():
        sys.exit(1)

    init_config()
    setup_database_and_dirs()
    create_templates()
    init_git()

    print("Setup complete.")


if __name__ == "__main__":
    main()
