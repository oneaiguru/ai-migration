#!/usr/bin/env python3
import argparse
import os
import shutil
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from lib import find_skill_dir  # noqa: E402


def resolve_codex_home() -> Path:
    return Path(os.environ.get("CODEX_HOME", Path.home() / ".codex"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Remove an installed skill from CODEX_HOME")
    parser.add_argument("name", help="Skill name (frontmatter name)")
    parser.add_argument("--codex-home", default=None)
    args = parser.parse_args()

    _ = find_skill_dir(args.name)
    codex_home = Path(args.codex_home) if args.codex_home else resolve_codex_home()
    dest_root = codex_home / "skills" / "custom"
    dest_skill = dest_root / args.name
    if not dest_skill.exists():
        raise SystemExit(f"{dest_skill} not found")
    shutil.rmtree(dest_skill)
    print(dest_skill)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
