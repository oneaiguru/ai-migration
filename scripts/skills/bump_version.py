#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from lib import (  # noqa: E402
    bump_semver,
    load_registry,
    now_iso,
    save_registry,
)


def main() -> int:
    parser = argparse.ArgumentParser(description="Bump skill version in registry")
    parser.add_argument("name", help="Skill name (frontmatter name)")
    parser.add_argument("--part", default="patch", choices=["major", "minor", "patch"])
    args = parser.parse_args()

    registry = load_registry()
    skills = registry.get("skills", {})
    if args.name not in skills:
        raise SystemExit(f"Skill '{args.name}' not in registry")
    entry = skills[args.name]
    current = entry.get("version")
    if not current:
        raise SystemExit(f"Skill '{args.name}' missing version")

    next_version = bump_semver(current, args.part)
    entry["version"] = next_version
    entry["updated_at"] = now_iso()
    entry["package"] = None
    entry["checksum_sha256"] = None
    entry["built_at"] = None
    skills[args.name] = entry
    save_registry(registry)
    print(next_version)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
