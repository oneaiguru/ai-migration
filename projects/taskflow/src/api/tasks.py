from __future__ import annotations

from config import config
from task_tracker import TaskTracker
from .tasks_api import create_tasks_router

# Default TaskTracker using configuration
_tracker = TaskTracker(config.tasks_file)

# Router with built-in HTTP Basic auth using config credentials
router = create_tasks_router(
    _tracker,
    username=config.web_user,
    password=config.web_password,
)

__all__ = ["router"]
