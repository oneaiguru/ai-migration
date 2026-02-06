#!/usr/bin/env python3
import argparse
import os
import sys
from pathlib import Path
from typing import Dict

sys.path.append(str(Path(__file__).resolve().parent))

from lib import load_registry, read_frontmatter  # noqa: E402


def resolve_codex_home() -> Path:
    return Path(os.environ.get("CODEX_HOME", Path.home() / ".codex"))


def load_installed(codex_home: Path) -> Dict[str, str]:
    installed: Dict[str, str] = {}
    base = codex_home / "skills" / "custom"
    if not base.exists():
        return installed
    for entry in base.iterdir():
        skill_file = entry / "SKILL.md"
        if not skill_file.exists():
            continue
        name, _ = read_frontmatter(skill_file)
        installed[name] = str(entry)
    return installed


def main() -> int:
    parser = argparse.ArgumentParser(description="List skills from registry and installs")
    parser.add_argument("--codex-home", default=None)
    args = parser.parse_args()

    registry = load_registry()
    skills = registry.get("skills", {})
    codex_home = Path(args.codex_home) if args.codex_home else resolve_codex_home()
    installed = load_installed(codex_home)

    print("Registry:")
    if not skills:
        print("  (empty)")
    for name in sorted(skills.keys()):
        entry = skills[name]
        version = entry.get("version", "?")
        built = entry.get("built_at")
        status = "built" if built else "not built"
        print(f"  {name} v{version} ({status})")

    print("\nInstalled:")
    if not installed:
        print("  (none)")
    for name in sorted(installed.keys()):
        print(f"  {name} -> {installed[name]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
