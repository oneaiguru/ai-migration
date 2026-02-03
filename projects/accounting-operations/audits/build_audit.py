#!/usr/bin/env python3
from pathlib import Path
import os
import shutil
import sys

try:  # Prefer stdlib tomllib (Python 3.11+) with fallback to tomli
    import tomllib as toml
except ImportError:  # pragma: no cover - fallback for <3.11 environments
    import tomli as toml

ROOT = Path(os.environ.get("DATA_ROOT", Path(__file__).resolve().parents[1])).resolve()
sys.path.insert(0, str(ROOT))

from generate_reports import load_statements_data, load_accounts_data  # noqa: E402


def copy_audit(audit, root: Path):
    years = set(audit.get("years", []))
    dest = root / audit["dest"]
    dest.mkdir(parents=True, exist_ok=True)

    load_accounts_data(Path(__file__).resolve().parents[1] / "config" / "accounts.toml")
    stmts = load_statements_data(root / "metadata" / "statements.toml", root)
    copied = 0
    for s in stmts:
        if s.end.year in years:
            src = s.dest or s.path
            src_path = root / src
            target_dir = dest / "renamed-statements"
            target_dir.mkdir(parents=True, exist_ok=True)
            target = target_dir / src_path.name
            shutil.copy2(src_path, target)
            copied += 1
    readme = audit.get("readme")
    if readme:
        src_readme = root / readme
        if src_readme.exists():
            shutil.copy2(src_readme, dest / "README.md")
    print(f"Audit {audit.get('name')} -> {dest}, files copied: {copied}")


def main():
    cfg = toml.loads((ROOT / "config" / "audit_config.toml").read_text())
    for audit in cfg.get("audit", []):
        copy_audit(audit, ROOT)


if __name__ == "__main__":
    main()
