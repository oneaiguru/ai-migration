from pathlib import Path

import pytest

from src.services.task_service import TaskService, TaskStatus, TaskServiceError


@pytest.fixture
def service(temp_repo):
    repo, path = temp_repo
    tasks_file = Path(path) / "tasks.json"
    svc = TaskService(file_path=str(tasks_file), repo_path=path)
    return svc, repo


def test_create_and_retrieve(service):
    svc, repo = service
    task = svc.create_task("T1", "Test task")
    assert task.id == "T1"
    assert repo.active_branch.name == "task/T1"
    retrieved = svc.get_task("T1")
    assert retrieved is not None
    assert retrieved.title == "Test task"


def test_update_and_delete(service):
    svc, _repo = service
    svc.create_task("T2", "Another task")
    svc.update_task("T2", status=TaskStatus.IN_PROGRESS, title="Updated")
    updated = svc.get_task("T2")
    assert updated.status == TaskStatus.IN_PROGRESS
    assert updated.title == "Updated"
    svc.delete_task("T2")
    assert svc.get_task("T2") is None


def test_search_and_filter(service):
    svc, _repo = service
    svc.create_task("A01", "Alpha")
    svc.create_task("B02", "Beta")
    svc.update_task("A01", status=TaskStatus.COMPLETED)
    all_tasks = svc.list_tasks()
    assert len(all_tasks) == 2
    completed = svc.list_tasks(status=TaskStatus.COMPLETED)
    assert len(completed) == 1
    search = svc.list_tasks(search="beta")
    assert len(search) == 1
    assert search[0].id == "B02"


def test_validation(service):
    svc, _repo = service
    with pytest.raises(TaskServiceError):
        svc.create_task("", "no id")
    svc.create_task("X01", "Title")
    with pytest.raises(TaskServiceError):
        svc.create_task("X01", "dupe")
