#!/usr/bin/env python3
"""Mobile-desktop synchronization helper."""

from __future__ import annotations

import argparse
import logging
from datetime import datetime
from pathlib import Path
from typing import List

from git import Repo

from src.services.git_service import GitService, GitServiceError
from path_utils import repo_path

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

# Directories containing task files
TASK_DIRS = [
    repo_path("core", "specs", "tasks"),
    repo_path("core", ".claude", "tasks"),
    repo_path("outputs"),
]

LAST_SYNC_FILE = repo_path("sync.log")


def _changed_task_files(repo: Repo) -> List[Path]:
    """Return a list of changed files within ``TASK_DIRS``."""
    changed: List[Path] = []
    workdir = Path(repo.working_tree_dir)
    for item in repo.index.diff(None):
        path = workdir / item.a_path
        if any(path.is_relative_to(d) for d in TASK_DIRS):
            changed.append(path)
    for fname in repo.untracked_files:
        path = workdir / fname
        if any(path.is_relative_to(d) for d in TASK_DIRS):
            changed.append(path)
    return changed


def commit_task_changes(service: GitService) -> bool:
    """Commit task file changes using the required commit tag."""
    repo = service.repo
    files = _changed_task_files(repo)
    if not files:
        logger.info("No task changes detected")
        return False
    for path in files:
        repo.git.add(str(path))
    try:
        service.commit("[PENDING-L4] auto sync")
        logger.info("Committed %d file(s)", len(files))
        return True
    except GitServiceError as exc:
        logger.error("Commit failed: %s", exc.message)
        return False


def push_pull(
    service: GitService, remote: str = "origin", branch: str | None = None
) -> None:
    """Pull then push with basic conflict handling."""
    try:
        service.pull(remote, branch)
    except GitServiceError as exc:
        logger.error("Pull failed: %s", exc.message)
        return
    try:
        service.push(remote, branch)
        logger.info("Push successful")
    except GitServiceError as exc:
        logger.error("Push failed: %s", exc.message)


def show_status(service: GitService) -> None:
    repo = service.repo
    changed = _changed_task_files(repo)
    ahead = (
        sum(
            1
            for _ in repo.iter_commits(
                f"{repo.remotes.origin.refs[repo.active_branch.name].name}..{repo.active_branch.name}"
            )
        )
        if repo.remotes.origin.refs
        else 0
    )
    behind = (
        sum(
            1
            for _ in repo.iter_commits(
                f"{repo.active_branch.name}..{repo.remotes.origin.refs[repo.active_branch.name].name}"
            )
        )
        if repo.remotes.origin.refs
        else 0
    )
    logger.info("Branch: %s", repo.active_branch)
    logger.info("Ahead %s / Behind %s", ahead, behind)
    last = "never"
    if LAST_SYNC_FILE.exists():
        last = LAST_SYNC_FILE.read_text().strip().splitlines()[-1]
    logger.info("Last sync: %s", last)
    if changed:
        logger.info("Uncommitted task files:")
        for c in changed:
            logger.info("  %s", c.relative_to(repo.working_tree_dir))
    else:
        logger.info("No uncommitted task files")


def main() -> int:
    parser = argparse.ArgumentParser(description="TaskFlow Git synchronization")
    sub = parser.add_subparsers(dest="command")
    sub.add_parser("sync", help="Commit task changes and push/pull")
    sub.add_parser("status", help="Show synchronization status")
    args = parser.parse_args()

    service = GitService()

    if args.command == "sync":
        committed = commit_task_changes(service)
        push_pull(service)
        if committed:
            LAST_SYNC_FILE.write_text(f"{datetime.utcnow().isoformat()}\n", encoding="utf-8")

    elif args.command == "status":
        show_status(service)
    else:
        parser.print_help()
    return 0


if __name__ == "__main__":  # pragma: no cover - manual tool
    raise SystemExit(main())
