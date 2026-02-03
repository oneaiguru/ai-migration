import os
import pytest
from git import Repo

os.environ.setdefault("TELEGRAM_TOKEN", "dummy")

from git_utils import (
    GitOperationError,
    checkout_task_branch,
    commit_changes,
    get_repo,
)


def test_get_repo_initializes(tmp_path):
    repo_path = tmp_path / "repo"
    repo = get_repo(str(repo_path))
    assert (repo_path / ".git").exists()
    assert isinstance(repo, Repo)


def test_commit_requires_tracking_tag(tmp_path):
    repo = Repo.init(tmp_path)
    file_path = tmp_path / "file.txt"
    file_path.write_text("content")
    repo.git.add(str(file_path))
    with pytest.raises(GitOperationError):
        commit_changes(repo, "Initial commit")


def test_commit_success(tmp_path):
    repo = Repo.init(tmp_path)
    file_path = tmp_path / "file.txt"
    file_path.write_text("content")
    hash_sha = commit_changes(repo, "[PENDING-L4] add file", add_all=True)
    assert repo.head.commit.hexsha == hash_sha


def test_checkout_task_branch_created(tmp_path):
    repo = Repo.init(tmp_path)
    checkout_task_branch("123", create=True, repo=repo)
    assert repo.active_branch.name == "task/123"
