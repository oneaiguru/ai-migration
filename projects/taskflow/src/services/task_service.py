from __future__ import annotations

import json
from dataclasses import dataclass, asdict, field
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional

from git_utils import checkout_task_branch, GitOperationError, get_repo
from utils.logging_config import tasks_logger as logger


class TaskServiceError(Exception):
    """Exception raised for task service failures."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


class TaskStatus(str, Enum):
    """Valid task statuses."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


@dataclass
class Task:
    """Representation of a single task."""

    id: str
    title: str
    status: TaskStatus = TaskStatus.PENDING
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def update_status(self, status: TaskStatus) -> None:
        """Update the task status and timestamp."""
        self.status = status
        self.updated_at = datetime.utcnow().isoformat()


class TaskService:
    """Service layer for creating and managing tasks."""

    def __init__(
        self, file_path: str = "tasks.json", repo_path: Optional[str] = None
    ) -> None:
        self.file_path = Path(file_path)
        self.repo_path = repo_path
        self.tasks: Dict[str, Task] = {}
        self.load()

    # ------------------------------------------------------------------
    def load(self) -> None:
        """Load tasks from disk."""
        if not self.file_path.exists():
            logger.info("Task file not found, starting with an empty registry")
            return
        try:
            data = json.loads(self.file_path.read_text())
            self.tasks = {tid: Task(**entry) for tid, entry in data.items()}
        except Exception as exc:  # pylint: disable=broad-except
            logger.error("Failed to load tasks: %s", exc)
            self.tasks = {}

    # ------------------------------------------------------------------
    def save(self) -> None:
        """Persist tasks to disk."""
        try:
            self.file_path.write_text(
                json.dumps({tid: asdict(t) for tid, t in self.tasks.items()}, indent=2)
            )
        except Exception as exc:  # pylint: disable=broad-except
            logger.error("Failed to save tasks: %s", exc)

    # ------------------------------------------------------------------
    def create_task(self, task_id: str, title: str) -> Task:
        """Create a new task and associated Git branch."""
        if not task_id:
            raise TaskServiceError("VALIDATION_ID", "Task id is required")
        if not title:
            raise TaskServiceError("VALIDATION_TITLE", "Task title is required")
        if task_id in self.tasks:
            raise TaskServiceError("RESOURCE_EXISTS", f"Task {task_id} already exists")

        task = Task(id=task_id, title=title)
        self.tasks[task_id] = task
        self.save()

        # Create git branch for the task
        try:
            repo = get_repo(self.repo_path) if self.repo_path else None
            checkout_task_branch(task_id, create=True, repo=repo)
        except GitOperationError as exc:
            logger.error("Failed to create task branch for %s: %s", task_id, exc)
        return task

    # ------------------------------------------------------------------
    def update_task(
        self,
        task_id: str,
        *,
        title: Optional[str] = None,
        status: Optional[TaskStatus] = None,
    ) -> Task:
        """Update an existing task."""
        task = self.tasks.get(task_id)
        if not task:
            raise TaskServiceError("RESOURCE_NOT_FOUND", f"Task {task_id} not found")
        if title is not None:
            if not title:
                raise TaskServiceError("VALIDATION_TITLE", "Task title cannot be empty")
            task.title = title
        if status is not None:
            task.update_status(status)
        else:
            task.updated_at = datetime.utcnow().isoformat()
        self.save()
        return task

    # ------------------------------------------------------------------
    def delete_task(self, task_id: str) -> None:
        """Delete a task."""
        if task_id not in self.tasks:
            raise TaskServiceError("RESOURCE_NOT_FOUND", f"Task {task_id} not found")
        del self.tasks[task_id]
        self.save()

    # ------------------------------------------------------------------
    def get_task(self, task_id: str) -> Optional[Task]:
        """Return a task by ID."""
        return self.tasks.get(task_id)

    # ------------------------------------------------------------------
    def list_tasks(
        self,
        *,
        status: Optional[TaskStatus] = None,
        search: Optional[str] = None,
    ) -> List[Task]:
        """Return tasks optionally filtered by status and search term."""
        tasks = list(self.tasks.values())
        if status is not None:
            tasks = [t for t in tasks if t.status == status]
        if search:
            term = search.lower()
            tasks = [
                t for t in tasks if term in t.id.lower() or term in t.title.lower()
            ]
        return tasks


__all__ = ["Task", "TaskStatus", "TaskService", "TaskServiceError"]
