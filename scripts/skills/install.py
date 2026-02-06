#!/usr/bin/env python3
import argparse
import os
import shutil
import sys
from pathlib import Path
from zipfile import ZipFile

sys.path.append(str(Path(__file__).resolve().parent))

from lib import (  # noqa: E402
    find_skill_dir,
    load_registry,
    normalize_version,
    package_path,
)


def resolve_codex_home() -> Path:
    return Path(os.environ.get("CODEX_HOME", Path.home() / ".codex"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Install a packaged skill into CODEX_HOME")
    parser.add_argument("name", help="Skill name (frontmatter name)")
    parser.add_argument("--version", default=None)
    parser.add_argument("--codex-home", default=None)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    _ = find_skill_dir(args.name)
    registry = load_registry()
    entry = registry.get("skills", {}).get(args.name, {})
    version = args.version or entry.get("version")
    if not version:
        raise SystemExit("version missing; pass --version or update registry")
    version = normalize_version(version)

    package = package_path(args.name, version)
    if not package.exists():
        raise SystemExit(f"package not found: {package}")

    codex_home = Path(args.codex_home) if args.codex_home else resolve_codex_home()
    dest_root = codex_home / "skills" / "custom"
    dest_root.mkdir(parents=True, exist_ok=True)

    dest_skill = dest_root / args.name
    if dest_skill.exists():
        if not args.force:
            raise SystemExit(f"{dest_skill} exists (use --force to overwrite)")
        shutil.rmtree(dest_skill)

    with ZipFile(package, "r") as zf:
        zf.extractall(dest_root)

    print(dest_skill)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
