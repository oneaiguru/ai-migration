#!/usr/bin/env python3
"""
Review registry tool (advisory by default).

Modes
------
1) Check (default):
   - Reads reviews/REVIEWED_FILES.yml and compares stored blob hashes
     against the current working tree.
   - If FAIL_ON_MISMATCH=1, exits non‑zero when an approved file's hash
     differs and status isn't flipped to needs-re-review.

2) Update (--update <files...>):
   - Computes short blob hashes for the given files and writes/updates
     entries in the registry with status=approved and today's date if
     an entry doesn't exist. Existing entries have their "hash" field
     updated to the current value.
"""
from __future__ import annotations

import os
import subprocess
from pathlib import Path
from datetime import date
import argparse

import yaml


def git_hash(path: Path) -> str | None:
    if not path.exists() or not path.is_file():
        return None
    try:
        out = subprocess.check_output(["git", "hash-object", str(path)], text=True)
        return out.strip()[:7]
    except Exception:
        return None


def load_registry(reg: Path) -> list[dict]:
    if not reg.exists():
        return []
    return yaml.safe_load(reg.read_text(encoding="utf-8")) or []


def write_registry(reg: Path, data: list[dict]) -> None:
    reg.parent.mkdir(parents=True, exist_ok=True)
    reg.write_text(yaml.safe_dump(data, sort_keys=False, allow_unicode=True), encoding="utf-8")


def update_entries(reg: Path, files: list[str]) -> int:
    root = Path(__file__).resolve().parents[2]
    data = load_registry(reg)
    by_path = {entry.get("path"): entry for entry in data}
    today = date.today().isoformat()
    updated = 0
    for f in files:
        p = str((root / f).resolve())
        rel = str(Path(p).relative_to(root)) if p.startswith(str(root)) else f
        h = git_hash(Path(p))
        if not h:
            print(f"[review-registry] Skip (not found or not a file): {rel}")
            continue
        if rel in by_path:
            if by_path[rel].get("hash") != h:
                by_path[rel]["hash"] = h
                by_path[rel].setdefault("approved_at", today)
                updated += 1
        else:
            data.append(
                {
                    "path": rel,
                    "status": "approved",
                    "reviewers": [],
                    "approved_at": today,
                    "hash": h,
                    "notes": "(auto-update)",
                }
            )
            updated += 1
    if updated:
        write_registry(reg, data)
    print(f"[review-registry] Updated {updated} entr{'y' if updated==1 else 'ies'}.")
    return 0


def check_entries(reg: Path) -> int:
    root = Path(__file__).resolve().parents[2]
    if not reg.exists():
        print("[review-registry] No registry found; skipping.")
        return 0
    data = load_registry(reg)
    mismatches: list[tuple[str, str, str]] = []
    for entry in data:
        path = root / (entry.get("path", ""))
        status = (entry.get("status") or "").strip()
        recorded = (entry.get("hash") or "").strip()
        current = git_hash(path) or "n/a"
        if status == "approved" and recorded and recorded != "TBD" and recorded != current:
            mismatches.append((str(path), recorded, current))
    if not mismatches:
        print("[review-registry] OK (no mismatches or no recorded hashes).")
        return 0
    print("[review-registry] Mismatches detected:")
    for p, old, cur in mismatches:
        print(f"  - {p}: {old} -> {cur}")
    if os.environ.get("FAIL_ON_MISMATCH") == "1":
        return 2
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Review registry tool")
    parser.add_argument(
        "--update",
        nargs="*",
        help="Update registry hashes for the given files (paths relative to repo root)",
    )
    args = parser.parse_args()
    registry_path = Path(__file__).resolve().parents[2] / "reviews" / "REVIEWED_FILES.yml"
    if args.update is not None:
        raise SystemExit(update_entries(registry_path, args.update))
    raise SystemExit(check_entries(registry_path))
