"""API module wrappers for backward compatibility."""

from .tasks import create_tasks_router, TaskCreate, TaskUpdate, RateLimiter
from .templates import create_templates_router

__all__ = [
    "create_tasks_router",
    "TaskCreate",
    "TaskUpdate",
    "RateLimiter",
    "create_templates_router",
]
