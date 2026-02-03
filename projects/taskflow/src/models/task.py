from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional

from pydantic import BaseModel, validator


class TaskStatus(str, Enum):
    """Possible states for a task."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


@dataclass
class Task:
    """Internal representation of a task."""

    id: str
    title: str
    status: TaskStatus = TaskStatus.PENDING
    template: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def update_status(self, status: TaskStatus) -> None:
        self.status = status
        self.updated_at = datetime.utcnow().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Task":
        data = data.copy()
        if "status" in data and not isinstance(data["status"], TaskStatus):
            data["status"] = TaskStatus(data["status"])
        return cls(**data)


class TaskCreate(BaseModel):
    """Payload for creating a task via API."""

    id: str
    title: str
    template: Optional[str] = None

    @validator("id", "title")
    def not_empty(cls, value: str) -> str:  # type: ignore[override]
        if not value:
            raise ValueError("must not be empty")
        return value


class TaskUpdate(BaseModel):
    """Payload for updating an existing task via API."""

    title: Optional[str] = None
    status: Optional[TaskStatus] = None
    template: Optional[str] = None


class TaskRead(BaseModel):
    """Serialization model for returning tasks via API."""

    id: str
    title: str
    status: TaskStatus
    template: Optional[str] = None
    created_at: str
    updated_at: str

    @classmethod
    def from_task(cls, task: Task) -> "TaskRead":
        return cls(**task.to_dict())


# ---------------------------------------------------------------------------
# Database migration helpers
# ---------------------------------------------------------------------------
TASK_DB_VERSION = 1

def migrate_v0_to_v1(data: Dict[str, Any]) -> Dict[str, Any]:
    """Example migration adding the 'template' field."""

    for entry in data.values():
        entry.setdefault("template", None)
    return data


TASK_MIGRATIONS: Dict[int, callable] = {
    0: migrate_v0_to_v1,
}

__all__ = [
    "Task",
    "TaskStatus",
    "TaskCreate",
    "TaskUpdate",
    "TaskRead",
    "TASK_DB_VERSION",
    "TASK_MIGRATIONS",
]
