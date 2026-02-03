# coding: utf-8
"""Task tracker module for managing simple task states.

This module defines classes for tracking tasks with unique IDs and metadata.
It persists task data to a JSON file and can load existing data on
initialization. The module is independent of the rest of the repository.
"""

from __future__ import annotations

from utils.logging_config import tasks_logger as logger
from dataclasses import dataclass, asdict, field
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional

from src.database import JSONDatabase


@dataclass
class Task:
    """Representation of a single task."""

    id: str
    title: str
    status: str = "pending"
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def update_status(self, status: str) -> None:
        """Update the task status and timestamp."""
        self.status = status
        self.updated_at = datetime.utcnow().isoformat()


class TaskTracker:
    """Track and persist tasks in a JSON file."""

    def __init__(self, file_path: str = "tasks.json") -> None:
        self.file_path = Path(file_path)
        self.db = JSONDatabase(self.file_path, default={})
        self.tasks: Dict[str, Task] = {}
        self.load()

    # ------------------------------------------------------------------
    def load(self) -> None:
        """Load tasks from the JSON file, if it exists."""
        data = self.db.read()
        if not data:
            logger.info("Task file not found, starting with an empty registry")
        self.tasks = {tid: Task(**entry) for tid, entry in data.items()}

    # ------------------------------------------------------------------
    def save(self) -> None:
        """Persist tasks to disk."""
        try:
            self.db.write({tid: asdict(t) for tid, t in self.tasks.items()})
        except Exception as exc:  # pragma: no cover - defensive
            logger.error("Failed to save tasks: %s", exc)

    # ------------------------------------------------------------------
    def add_task(self, task_id: str, title: str, status: str = "pending") -> Task:
        """Add a new task to the tracker."""
        if task_id in self.tasks:
            logger.warning("Task %s already exists and will be overwritten", task_id)
        task = Task(id=task_id, title=title, status=status)
        self.tasks[task_id] = task
        self.save()
        return task

    # ------------------------------------------------------------------
    def update_task(
        self, task_id: str, *, title: Optional[str] = None, status: Optional[str] = None
    ) -> Optional[Task]:
        """Update fields on an existing task.

        Returns the updated task or ``None`` if it does not exist.
        """
        task = self.tasks.get(task_id)
        if not task:
            logger.error("Task %s not found", task_id)
            return None
        if title is not None:
            task.title = title
        if status is not None:
            task.update_status(status)
        else:
            # bump timestamp if only title changed
            task.updated_at = datetime.utcnow().isoformat()
        self.save()
        return task

    # ------------------------------------------------------------------
    def get_task(self, task_id: str) -> Optional[Task]:
        """Return a task by ID."""
        return self.tasks.get(task_id)

    # ------------------------------------------------------------------
    def all_tasks(self) -> Dict[str, Task]:
        """Return a dictionary of all tasks."""
        return dict(self.tasks)
