#!/usr/bin/env python3
import json
import os
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple


REPO_ROOT = Path(__file__).resolve().parents[2]
SKILLS_DIR = REPO_ROOT / "skills"
SKILLS_SRC_DIR = SKILLS_DIR / "src"
PACKAGES_DIR = SKILLS_DIR / "packages"
REGISTRY_PATH = SKILLS_DIR / "registry.json"


@dataclass(frozen=True)
class SkillMeta:
    name: str
    description: str
    dir_path: Path


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def read_frontmatter(skill_file: Path) -> Tuple[str, str]:
    lines = skill_file.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0].strip() != "---":
        raise ValueError(f"{skill_file} missing frontmatter")
    end_idx = None
    for idx in range(1, len(lines)):
        if lines[idx].strip() == "---":
            end_idx = idx
            break
    if end_idx is None:
        raise ValueError(f"{skill_file} frontmatter not closed")
    fm_lines = lines[1:end_idx]
    name = None
    description = None
    for line in fm_lines:
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if key == "name":
            name = value
        elif key == "description":
            description = value
    if name is None:
        raise ValueError(f"{skill_file} missing name in frontmatter")
    if description is None:
        description = ""
    description = strip_quotes(description)
    return name, description


def strip_quotes(value: str) -> str:
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ("\"", "'"):
        return value[1:-1]
    return value


def iter_skill_dirs() -> Iterable[Path]:
    roots = [SKILLS_SRC_DIR, SKILLS_DIR]
    seen = set()
    for root in roots:
        if not root.exists():
            continue
        for entry in root.iterdir():
            if not entry.is_dir():
                continue
            if entry.name in ("packages", "src"):
                continue
            skill_file = entry / "SKILL.md"
            if not skill_file.exists():
                continue
            if entry.resolve() in seen:
                continue
            seen.add(entry.resolve())
            yield entry


def load_skills() -> List[SkillMeta]:
    skills = []
    for skill_dir in iter_skill_dirs():
        name, description = read_frontmatter(skill_dir / "SKILL.md")
        skills.append(SkillMeta(name=name, description=description, dir_path=skill_dir))
    return skills


def find_skill_dir(skill_name: str) -> SkillMeta:
    for skill in load_skills():
        if skill.name == skill_name:
            return skill
    raise FileNotFoundError(f"Skill '{skill_name}' not found under {SKILLS_DIR}")


def load_registry() -> Dict[str, object]:
    if not REGISTRY_PATH.exists():
        return {"schema_version": 1, "skills": {}}
    return json.loads(REGISTRY_PATH.read_text(encoding="utf-8"))


def save_registry(data: Dict[str, object]) -> None:
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    REGISTRY_PATH.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def compute_checksum(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(8192), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize_version(version: str) -> str:
    if not re.match(r"^\d+\.\d+\.\d+$", version):
        raise ValueError("version must be semver: X.Y.Z")
    return version


def bump_semver(version: str, part: str) -> str:
    major, minor, patch = [int(v) for v in normalize_version(version).split(".")]
    if part == "major":
        major += 1
        minor = 0
        patch = 0
    elif part == "minor":
        minor += 1
        patch = 0
    elif part == "patch":
        patch += 1
    else:
        raise ValueError("part must be major, minor, or patch")
    return f"{major}.{minor}.{patch}"


def package_path(skill_name: str, version: str) -> Path:
    filename = f"{skill_name}_v{version}.skill"
    return PACKAGES_DIR / filename
