#!/usr/bin/env python3
import argparse
import os
import sys
from pathlib import Path
from typing import Dict
from zipfile import ZipFile, ZIP_DEFLATED

sys.path.append(str(Path(__file__).resolve().parent))

from lib import (  # noqa: E402
    REPO_ROOT,
    SkillMeta,
    compute_checksum,
    find_skill_dir,
    load_registry,
    normalize_version,
    now_iso,
    package_path,
    save_registry,
)


def zip_skill(skill: SkillMeta, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    base_dir = skill.dir_path.parent
    with ZipFile(out_path, "w", ZIP_DEFLATED) as zf:
        for dirpath, _, filenames in os.walk(skill.dir_path):
            for filename in filenames:
                file_path = Path(dirpath) / filename
                rel = file_path.relative_to(base_dir)
                zf.write(file_path, rel.as_posix())


def main() -> int:
    parser = argparse.ArgumentParser(description="Package a skill into .skill")
    parser.add_argument("name", help="Skill name (frontmatter name)")
    parser.add_argument("--version", default=None, help="Override registry version")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    skill = find_skill_dir(args.name)
    registry: Dict[str, object] = load_registry()
    skills = registry.setdefault("skills", {})

    entry = skills.get(skill.name, {})
    version = args.version or entry.get("version")
    if not version:
        raise SystemExit("version missing; add to registry or pass --version")
    version = normalize_version(version)

    out_path = package_path(skill.name, version)
    if out_path.exists() and not args.force:
        raise SystemExit(f"{out_path} exists (use --force to overwrite)")

    zip_skill(skill, out_path)
    checksum = compute_checksum(out_path)

    entry.update(
        {
            "description": skill.description,
            "source_dir": str(skill.dir_path.relative_to(REPO_ROOT)),
            "version": version,
            "package": str(out_path.relative_to(REPO_ROOT)),
            "checksum_sha256": checksum,
            "built_at": now_iso(),
            "updated_at": now_iso(),
        }
    )
    skills[skill.name] = entry
    save_registry(registry)
    print(out_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
