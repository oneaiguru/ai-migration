#!/usr/bin/env python3
"""Convenience runner to execute fastwhisper from the repo root."""

import os
from pathlib import Path
import sys


def _ensure_repo_on_path() -> None:
    repo_root = Path(__file__).resolve().parent
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))


def main() -> None:
    project_root = Path(__file__).resolve().parent
    os.environ.setdefault("FASTWHISPER_ROOT", str(project_root))
    os.chdir(project_root)
    _ensure_repo_on_path()
    from fastwhisper.main import main as fastwhisper_main

    fastwhisper_main()


if __name__ == "__main__":
    main()
