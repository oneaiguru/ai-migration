import os
from pathlib import Path

# Path to the repository root (location of this file)
REPO_ROOT = Path(__file__).resolve().parent


def repo_path(*parts: str) -> Path:
    """Return an absolute path within the repository.

    If the ``REPO_PATH`` environment variable is set, it is used as the base
    directory instead of the repository root. This allows tests to run in
    isolated temporary directories.
    """
    base = Path(os.getenv("REPO_PATH", REPO_ROOT))
    return base.joinpath(*parts)
