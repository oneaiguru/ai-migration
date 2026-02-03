"""Utility functions for Git operations in TaskFlow.ai.

This module centralizes common Git actions used across the
TaskFlow.ai project. Functions rely on GitPython and implement
basic error handling following the project's guidelines.
"""

import os
from pathlib import Path
from typing import Optional

from utils.logging_config import git_logger as logger
from utils import GitOperationError

from git import Repo, GitCommandError, InvalidGitRepositoryError, NoSuchPathError
from config_manager import get_config

config = get_config()


def get_repo(repo_path: Optional[str] = None) -> Repo:
    """Return a :class:`git.Repo` instance.

    If no path is provided the ``REPO_PATH`` environment variable is used,
    defaulting to the current directory. If a repository is not found at the
    given location, an attempt to initialize one will be made.

    Parameters
    ----------
    repo_path: Optional[str]
        Path to the git repository.

    Returns
    -------
    Repo
        GitPython repository object.

    Raises
    ------
    GitOperationError
        If the repository cannot be opened or initialized.
    """
    path = repo_path or config.repo_path
    try:
        return Repo(path)
    except (InvalidGitRepositoryError, NoSuchPathError) as exc:
        logger.warning("Repository not found at %s. Attempting to initialize.", path)
        try:
            return Repo.init(path)
        except Exception as e:  # pylint: disable=broad-exception-caught
            raise GitOperationError(
                "Failed to initialize Git repository at {path}",
                code="SYSTEM_REPO_INIT_FAILED",
                details={"error": str(e)},
            ) from e
    except Exception as e:  # pylint: disable=broad-exception-caught
        raise GitOperationError(
            f"Could not open Git repository at {path}",
            code="SYSTEM_REPO_OPEN_FAILED",
            details={"error": str(e)},
        ) from e


def checkout_task_branch(
    task_id: str, create: bool = False, repo: Optional[Repo] = None
) -> Repo:
    """Checkout a task branch named ``task/<task_id>``.

    Parameters
    ----------
    task_id: str
        Identifier of the task.
    create: bool
        Create the branch if it does not exist.
    repo: Optional[Repo]
        Repository instance. If ``None`` the repository is obtained via
        :func:`get_repo`.

    Returns
    -------
    Repo
        The repository with the desired branch checked out.

    Raises
    ------
    GitOperationError
        If the branch cannot be checked out.
    """
    repository = repo or get_repo()
    branch_name = f"task/{task_id}"
    try:
        if branch_name in repository.heads:
            repository.git.checkout(branch_name)
        else:
            if create:
                repository.git.checkout("-b", branch_name)
            else:
                raise GitOperationError(
                    f"Branch {branch_name} does not exist",
                    code="RESOURCE_BRANCH_NOT_FOUND",
                )
    except GitCommandError as e:
        raise GitOperationError(
            f"Failed to checkout {branch_name}",
            code="GIT_CHECKOUT_FAILED",
            details={"error": str(e)},
        ) from e
    return repository


def commit_changes(repo: Repo, message: str, add_all: bool = True) -> str:
    """Commit changes to the repository.

    The commit message must contain either ``[PENDING-L4]`` or ``[AI-L4]``
    to comply with TaskFlow.ai task tracking.

    Parameters
    ----------
    repo: Repo
        Repository in which to commit.
    message: str
        Commit message.
    add_all: bool
        If ``True`` all changed files are staged before committing.

    Returns
    -------
    str
        The SHA of the created commit.

    Raises
    ------
    GitOperationError
        If there are no changes to commit or the commit fails.
    """
    if "[PENDING-L4]" not in message and "[AI-L4]" not in message:
        raise GitOperationError(
            "Commit message missing task tracking tag",
            code="VALIDATION_COMMIT_FORMAT",
            details={"message": message},
        )

    try:
        if add_all:
            repo.git.add(all=True)
        if not repo.is_dirty():
            raise GitOperationError(
                "No changes to commit",
                code="VALIDATION_NO_CHANGES",
            )
        commit = repo.index.commit(message)
        return commit.hexsha
    except GitCommandError as e:
        raise GitOperationError(
            "Failed to commit changes",
            code="GIT_COMMIT_FAILED",
            details={"error": str(e)},
        ) from e


def push_changes(
    repo: Repo, remote: str = "origin", branch: Optional[str] = None
) -> None:
    """Push changes to the specified remote."""
    branch = branch or repo.active_branch.name
    try:
        repo.remote(remote).push(branch)
    except GitCommandError as e:
        raise GitOperationError(
            f"Failed to push to {remote}/{branch}",
            code="GIT_PUSH_FAILED",
            details={"error": str(e)},
        ) from e


def pull_changes(
    repo: Repo, remote: str = "origin", branch: Optional[str] = None
) -> None:
    """Pull changes from the specified remote."""
    branch = branch or repo.active_branch.name
    try:
        repo.remote(remote).pull(branch)
    except GitCommandError as e:
        raise GitOperationError(
            f"Failed to pull from {remote}/{branch}",
            code="GIT_PULL_FAILED",
            details={"error": str(e)},
        ) from e


def sync_repository(
    repo: Repo, remote: str = "origin", branch: Optional[str] = None
) -> None:
    """Synchronize local changes with the remote."""
    pull_changes(repo, remote, branch)
    push_changes(repo, remote, branch)


def merge_branch(repo: Repo, branch: str, strategy: str = "theirs") -> None:
    """Merge ``branch`` into the current branch using a simple strategy.

    If a merge conflict occurs, the merge is retried with the given strategy
    (``theirs`` or ``ours``). If the conflict cannot be resolved automatically
    a :class:`GitOperationError` is raised.
    """
    try:
        repo.git.merge(branch)
    except GitCommandError as e:
        if "CONFLICT" not in str(e):
            raise GitOperationError(
                f"Failed to merge {branch}",
                code="GIT_MERGE_FAILED",
                details={"error": str(e)},
            ) from e
        logger.warning("Merge conflict detected, attempting automatic resolution")
        try:
            repo.git.merge("--abort")
        except GitCommandError:
            pass
        try:
            repo.git.merge(branch, X=strategy)
        except GitCommandError as e2:
            repo.git.merge("--abort")
            raise GitOperationError(
                f"Automatic merge of {branch} failed",
                code="GIT_MERGE_CONFLICT",
                details={"error": str(e2)},
            ) from e2


def repository_has_conflicts(repo: Repo) -> bool:
    """Return ``True`` if the repository has unresolved merge conflicts."""
    # ``unmerged_blobs`` is the most reliable indicator but can occasionally
    # return an empty mapping immediately after a failed merge on some Git
    # versions.  Fallback to checking ``git ls-files -u`` and ``MERGE_HEAD`` if
    # needed.

    if repo.index.unmerged_blobs():
        return True

    try:
        if repo.git.execute(["git", "ls-files", "-u"]).strip():
            return True
    except GitCommandError:
        pass

    merge_head = Path(repo.git_dir) / "MERGE_HEAD"
    if merge_head.exists():
        return True

    try:
        status = repo.git.status("--porcelain")
    except GitCommandError:
        return False
    for line in status.splitlines():
        if line.startswith("UU ") or line[1:2] == "U":
            return True
    return False
