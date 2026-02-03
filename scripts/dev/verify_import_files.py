#!/usr/bin/env python3
"""
Compare tracked files between source tool/client repos and the monorepo import.

Defaults:
- source root: ~/git/tools
- dest ref: origin/main (use --dest-ref HEAD when running on an import branch)
- project path: projects/<name> unless overridden with --map src:dest

Differences (missing files in the monorepo or a missing dest tree) cause a
non-zero exit unless --allow-differences is set.

Examples:
  python scripts/dev/verify_import_files.py CodeInterpreterZip2LocalFolder autotester
  python scripts/dev/verify_import_files.py --dest-ref HEAD groq_whisperer
  python scripts/dev/verify_import_files.py --map whisper_infinity_bot:whisper-infinity-bot whisper_infinity_bot
"""
from __future__ import annotations

import argparse
import subprocess
from fnmatch import fnmatch
from pathlib import Path
from typing import List, Set, Tuple, Optional


IGNORE_PATTERNS = (
    ".DS_Store",
    ".gitignore",
    ".selectignore",
    ".treeignore",
    "*.egg-info/*",
    "build/*",
    "dist/*",
    "node_modules/*",
    "venv/*",
    ".venv/*",
    "output/*",
    "*.pyc",
)

# Built-in absolute source overrides for repos that live outside ~/git/tools
BUILTIN_SOURCE_OVERRIDES = {
    # RTNEO
    "forecast-ui": Path("/Users/m/git/clients/rtneo/forecast-ui"),
    "forecastingrepo": Path("/Users/m/git/clients/rtneo/forecastingrepo"),
    "mytko-forecast-demo": Path("/Users/m/git/clients/rtneo/ui/mytko-forecast-demo"),
    "rtneo-docs": Path("/Users/m/git/clients/rtneo/docs"),
    "rtneo-mock": Path("/Users/m/git/clients/rtneo/mock"),
    "rtneo-ui-docs": Path("/Users/m/git/clients/rtneo/ui/docs"),
    # GenAICodeUpdater (tools is canonical after removing clients copy)
    "GenAICodeUpdater": Path("/Users/m/git/tools/GenAICodeUpdater"),
    # ClaudeCodeProxy (lives under tools/ClaudeCodeProxy)
    "ClaudeCodeProxy": Path("/Users/m/git/tools/ClaudeCodeProxy"),
    # agentos (tools)
    "agentos": Path("/Users/m/git/tools/agentos"),
    # forecastingrepo already above
}

# Optional built-in dest overrides (default is the same as the repo name)
BUILTIN_DEST_OVERRIDES = {
    # currently none differ from the name, but keep structure for future cases
}


def should_ignore(path: str) -> bool:
    """Return True if a path should be excluded from comparison noise."""
    return any(fnmatch(path, pat) for pat in IGNORE_PATTERNS)


def run_cmd(cmd: List[str], cwd: Optional[Path] = None) -> Tuple[int, str]:
    """Run a command and return (exit_code, stdout)."""
    res = subprocess.run(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    return res.returncode, res.stdout


def list_source_files(source_repo: Path) -> Optional[Set[str]]:
    """Return tracked files in the source repo, or None if repo missing."""
    if not source_repo.exists():
        return None
    code, out = run_cmd(["git", "-C", str(source_repo), "ls-files"])
    if code != 0:
        return None
    return set(f for f in out.splitlines() if f and not should_ignore(f))


def list_dest_files(dest_ref: str, project_name: str) -> Set[str]:
    """
    Return tracked files for projects/<project_name> at dest_ref.
    Paths are trimmed to be relative to the project root.
    """
    code, out = run_cmd(
        [
            "git",
            "ls-tree",
            "-r",
            dest_ref,
            "--name-only",
            f"projects/{project_name}",
        ]
    )
    if code != 0:
        return set()
    prefix = f"projects/{project_name}/"
    files = set()
    for line in out.splitlines():
        if line.startswith(prefix):
            rel = line[len(prefix) :]
            if not should_ignore(rel):
                files.add(rel)
    return files


def format_examples(items: Set[str], limit: int = 5) -> str:
    """Format a small sample list for logging."""
    items_list = sorted(items)
    if not items_list:
        return ""
    sample = items_list[:limit]
    more = f" (+{len(items_list) - limit} more)" if len(items_list) > limit else ""
    return ", ".join(sample) + more


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify imported project files.")
    map_help = "Mapping of source:dest names (repeatable). Example: --map foo:bar"
    parser.add_argument(
        "repos",
        nargs="+",
        help="Project names (match folder names under projects/ and source base).",
    )
    parser.add_argument(
        "--source-base",
        default=str(Path.home() / "git" / "tools"),
        help="Path to the source tools root (default: ~/git/tools).",
    )
    parser.add_argument(
        "--dest-ref",
        default="origin/main",
        help="Git ref to compare against (default: origin/main).",
    )
    parser.add_argument(
        "--map",
        action="append",
        default=[],
        help=map_help,
    )
    parser.add_argument(
        "--allow-differences",
        action="store_true",
        help="Do not exit non-zero when differences are found.",
    )
    args = parser.parse_args()

    source_root = Path(args.source_base)
    dest_override = dict(BUILTIN_DEST_OVERRIDES)
    source_override = dict(BUILTIN_SOURCE_OVERRIDES)

    for item in args.map:
        if ":" not in item:
            parser.error(f"--map entries must be src:dest, got '{item}'")
        src, dest = item.split(":", 1)
        dest_override[src] = dest

    failures = 0

    for name in args.repos:
        dest_name = dest_override.get(name, name)
        source_repo = source_override.get(name, source_root / name)
        source_files = list_source_files(source_repo)
        dest_files = list_dest_files(args.dest_ref, dest_name)

        print(f"{name}:")
        if source_files is None:
            print(f"  source: MISSING (not found or not a git repo) [{source_repo}]")
            failures += 1
            continue

        source_count = len(source_files)
        dest_count = len(dest_files)
        dest_present = dest_count > 0

        print(f"  source files: {source_count}")
        print(f"  dest files:   {dest_count} ({'present' if dest_present else 'missing'})")

        missing = source_files - dest_files
        extra = dest_files - source_files

        if missing:
            failures += 1
            print(f"  MISSING in dest: {len(missing)} (e.g., {format_examples(missing)})")
        if extra:
            print(f"  EXTRA in dest:   {len(extra)} (e.g., {format_examples(extra)})")

        if not missing and not extra:
            print("  ✅ files match")

        print()

    if failures and not args.allow_differences:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
