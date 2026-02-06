import pytest
from git import Repo

from src.services.git_service import GitService


def test_service_initializes_repo(tmp_path):
    path = tmp_path / "repo"
    service = GitService(repo_path=str(path))
    assert (path / ".git").exists()
    assert isinstance(service.repo, Repo)


def test_task_branch_creation(tmp_path):
    service = GitService(repo_path=str(tmp_path))
    service.checkout_task_branch("42", create=True)
    assert service.repo.active_branch.name == "task/42"


def test_commit_and_push(tmp_path):
    repo_path = tmp_path / "repo"
    remote_path = tmp_path / "remote"
    Repo.init(remote_path, bare=True)
    service = GitService(repo_path=str(repo_path))
    service.repo.create_remote("origin", str(remote_path))
    (repo_path / "file.txt").write_text("data")
    service.commit("[PENDING-L4] add file")
    service.push()
    cloned = Repo.clone_from(str(remote_path), tmp_path / "clone")
    assert list(cloned.iter_commits())


def test_conflict_detection(tmp_path):
    repo_path = tmp_path / "repo"
    service = GitService(repo_path=str(repo_path))
    (repo_path / "file.txt").write_text("master")
    service.commit("[PENDING-L4] base")
    service.repo.git.checkout("-b", "feature")
    (repo_path / "file.txt").write_text("feature")
    service.commit("[PENDING-L4] feature change")
    service.repo.git.checkout("master")
    (repo_path / "file.txt").write_text("master change")
    service.commit("[PENDING-L4] master change")
    # Intentionally create a merge conflict
    try:
        service.repo.git.merge("feature")
    except Exception:
        pass
    assert service.has_conflicts() is True
    service.repo.git.merge("--abort")
