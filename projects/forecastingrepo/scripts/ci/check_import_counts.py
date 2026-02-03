#!/usr/bin/env python3
"""
Advisory import-count checker for local project imports.

Counts intra-project imports per Python file and warns if the count
exceeds a configurable threshold (default MAX_LOCAL_IMPORTS=2).

Local imports =
  - absolute imports starting with known local roots (e.g., "src." or "scripts.")
  - relative imports (from . or from ..)

Exit code 0 by default. Set FAIL_ON_IMPORTS=1 to fail when any file
exceeds the threshold.
"""
from __future__ import annotations

import ast
import os
from pathlib import Path


LOCAL_ROOTS = os.environ.get("LOCAL_IMPORT_ROOTS", "src,scripts").split(",")
THRESH = int(os.environ.get("MAX_LOCAL_IMPORTS", "2"))
FAIL = os.environ.get("FAIL_ON_IMPORTS") == "1"


def is_local_module(name: str) -> bool:
    return any(name.startswith(r + ".") or name == r for r in LOCAL_ROOTS)


def count_local_imports(py_path: Path) -> int:
    try:
        tree = ast.parse(py_path.read_text(encoding="utf-8"))
    except Exception:
        return 0
    count = 0
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                if alias.name and is_local_module(alias.name):
                    count += 1
        elif isinstance(node, ast.ImportFrom):
            if node.level and node.level > 0:
                count += 1  # relative import within project
            elif node.module and is_local_module(node.module):
                count += 1
    return count


def list_python_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for base in (root / "src", root / "scripts"):
        if base.exists():
            for p in base.rglob("*.py"):
                files.append(p)
    return files


def main() -> int:
    root = Path(__file__).resolve().parents[2]
    offenders: list[tuple[str, int]] = []
    for f in list_python_files(root):
        # ignore dunders and tests
        if f.name == "__init__.py" or "/tests/" in str(f):
            continue
        c = count_local_imports(f)
        if c > THRESH:
            offenders.append((str(f.relative_to(root)), c))
    if not offenders:
        print(f"[imports] OK (<= {THRESH} local imports per module)")
        return 0
    print(f"[imports] Files exceeding local import threshold ({THRESH}):")
    for path, c in sorted(offenders, key=lambda x: -x[1]):
        print(f"  - {path}: {c}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    raise SystemExit(main())
