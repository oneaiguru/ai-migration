from __future__ import annotations

"""Service layer providing reliable Git operations."""

from pathlib import Path
from typing import Optional

from git import Repo

from git_utils import (
    GitOperationError,
    checkout_task_branch,
    commit_changes,
    get_repo,
    merge_branch,
    repository_has_conflicts,
    pull_changes,
    push_changes,
    sync_repository,
)


class GitServiceError(Exception):
    """Exception raised for Git service errors."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class GitService:
    """High level service for Git integration."""

    def __init__(self, repo_path: Optional[str] = None) -> None:
        self.repo_path = Path(repo_path) if repo_path else None
        self.repo = self._ensure_repo()

    # ------------------------------------------------------------------
    def _ensure_repo(self) -> Repo:
        """Return repository instance, initializing if necessary."""
        try:
            return get_repo(str(self.repo_path) if self.repo_path else None)
        except GitOperationError as exc:  # propagate as service error
            raise GitServiceError(exc.code, exc.message) from exc

    # ------------------------------------------------------------------
    def checkout_task_branch(self, task_id: str, create: bool = False) -> Repo:
        """Checkout or create branch for given task."""
        try:
            return checkout_task_branch(task_id, create=create, repo=self.repo)
        except GitOperationError as exc:
            raise GitServiceError(exc.code, exc.message) from exc

    # ------------------------------------------------------------------
    def commit(self, message: str, add_all: bool = True) -> str:
        """Commit staged changes."""
        try:
            return commit_changes(self.repo, message, add_all)
        except GitOperationError as exc:
            raise GitServiceError(exc.code, exc.message) from exc

    # ------------------------------------------------------------------
    def push(self, remote: str = "origin", branch: Optional[str] = None) -> None:
        try:
            push_changes(self.repo, remote, branch)
        except GitOperationError as exc:
            raise GitServiceError(exc.code, exc.message) from exc

    # ------------------------------------------------------------------
    def pull(self, remote: str = "origin", branch: Optional[str] = None) -> None:
        try:
            pull_changes(self.repo, remote, branch)
        except GitOperationError as exc:
            raise GitServiceError(exc.code, exc.message) from exc

    # ------------------------------------------------------------------
    def sync(self, remote: str = "origin", branch: Optional[str] = None) -> None:
        try:
            sync_repository(self.repo, remote, branch)
        except GitOperationError as exc:
            raise GitServiceError(exc.code, exc.message) from exc

    # ------------------------------------------------------------------
    def merge(self, branch: str, strategy: str = "theirs") -> None:
        try:
            merge_branch(self.repo, branch, strategy=strategy)
        except GitOperationError as exc:
            raise GitServiceError(exc.code, exc.message) from exc

    # ------------------------------------------------------------------
    def has_conflicts(self) -> bool:
        """Return ``True`` if repository has unresolved merge conflicts."""

        # Delegate to the shared utility which contains more robust logic for
        # detecting merge conflicts across different Git versions.
        return repository_has_conflicts(self.repo)

    # ------------------------------------------------------------------
    def resolve_conflicts(self, strategy: str = "ours") -> None:
        """Attempt to resolve merge conflicts using a checkout strategy."""
        if not self.has_conflicts():
            return
        for path in self.repo.index.unmerged_blobs().keys():
            self.repo.git.checkout(f"--{strategy}", path)
        self.repo.git.add(all=True)


__all__ = ["GitService", "GitServiceError"]
