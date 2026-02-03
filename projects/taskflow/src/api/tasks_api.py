from __future__ import annotations

import time
from dataclasses import asdict
from typing import Dict, Optional, Any, List

from fastapi import APIRouter, Depends, Request, status, Query
from typing import get_type_hints
from src.utils.validation import validate_task_id, validate_task_title
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import JSONResponse
from utils import AuthenticationError, NotFoundError, ValidationError
from pydantic import BaseModel, validator

from task_tracker import TaskTracker


class RateLimiter:
    """Simple in-memory rate limiter."""

    def __init__(self, limit: int = 100, window: int = 60) -> None:
        self.limit = limit
        self.window = window
        self.history: Dict[str, list[float]] = {}

    def __call__(self, request: Request) -> None:  # pragma: no cover - fastapi dep
        host = request.client.host if request.client else "anon"
        now = time.time()
        window_start = now - self.window
        timestamps = [t for t in self.history.get(host, []) if t > window_start]
        if len(timestamps) >= self.limit:
            raise ValidationError("Too many requests", status_code=429)
        timestamps.append(now)
        self.history[host] = timestamps


# Ensure annotations are evaluated for FastAPI dependency analysis
RateLimiter.__call__.__annotations__ = get_type_hints(
    RateLimiter.__call__, RateLimiter.__call__.__globals__, None
)


def success_response(data: Any, *, status_code: int = 200) -> JSONResponse:
    """Return standardized success response."""
    return JSONResponse(
        status_code=status_code,
        content={"success": True, "data": data, "error": None},
    )


class TaskCreate(BaseModel):
    """Payload for creating tasks."""

    id: str
    title: str

    @validator("id", "title")
    def not_empty(cls, value: str) -> str:  # noqa: N805
        value = value.strip()
        if not value:
            raise ValueError("must not be empty")
        return value


class TaskUpdate(BaseModel):
    """Payload for updating tasks."""

    title: Optional[str] = None
    status: Optional[str] = None

    @validator("title")
    def not_blank(cls, value: Optional[str]) -> Optional[str]:  # noqa: N805
        if value is not None:
            value = value.strip()
            if not value:
                raise ValueError("must not be empty")
        return value


def create_tasks_router(
    tracker: TaskTracker,
    username: Optional[str] = None,
    password: Optional[str] = None,
    auth_dependency: Optional[callable] = None,
) -> APIRouter:
    """Return an APIRouter with task CRUD endpoints."""

    router = APIRouter(prefix="/api/tasks", tags=["tasks"])
    security = HTTPBasic()
    limiter = RateLimiter()

    if auth_dependency is not None:
        authenticate = auth_dependency
    else:

        def authenticate(credentials: HTTPBasicCredentials = Depends(security)) -> str:
            if credentials.username != username or credentials.password != password:
                raise AuthenticationError("Invalid credentials")
            return credentials.username

    @router.get("/", dependencies=[Depends(authenticate), Depends(limiter)])
    async def list_tasks(
        status: Optional[str] = Query(None),
        search: Optional[str] = Query(None),
        sort: str = Query("date", pattern="^(date|priority)$"),
        page: int = Query(1, ge=1),
        page_size: int = Query(10, ge=1, le=100),
    ) -> JSONResponse:
        items = list(tracker.all_tasks().values())
        if status:
            items = [t for t in items if t.status == status]
        if search:
            term = search.lower()
            items = [
                t
                for t in items
                if term in t.title.lower() or term in t.id.lower()
            ]
        if sort == "date":
            items.sort(key=lambda t: getattr(t, "created_at", ""))
        else:
            items.sort(key=lambda t: getattr(t, "priority", 0))
        total = len(items)
        start = (page - 1) * page_size
        end = start + page_size
        tasks = [asdict(t) for t in items[start:end]]
        return success_response(
            {
                "tasks": tasks,
                "total": total,
                "page": page,
                "page_size": page_size,
            }
        )

    @router.post(
        "/", status_code=201, dependencies=[Depends(authenticate), Depends(limiter)]
    )
    async def create_task(payload: TaskCreate) -> JSONResponse:
        errors = validate_task_id(payload.id) + validate_task_title(payload.title)
        if errors:
            raise ValidationError("; ".join(errors))
        if tracker.get_task(payload.id):
            raise ValidationError("Task already exists", status_code=409)
        task = tracker.add_task(payload.id, payload.title)
        return success_response(asdict(task), status_code=201)

    @router.get("/{task_id}", dependencies=[Depends(authenticate), Depends(limiter)])
    async def get_task(task_id: str) -> JSONResponse:
        task = tracker.get_task(task_id)
        if not task:
            raise NotFoundError("Task not found")
        return success_response(asdict(task))

    @router.put("/{task_id}", dependencies=[Depends(authenticate), Depends(limiter)])
    async def update_task(task_id: str, payload: TaskUpdate) -> JSONResponse:
        if payload.title is not None:
            errors = validate_task_title(payload.title)
            if errors:
                raise ValidationError("; ".join(errors))
        updated = tracker.update_task(
            task_id, title=payload.title, status=payload.status
        )
        if updated is None:
            raise NotFoundError("Task not found")
        return success_response(asdict(updated))

    @router.delete(
        "/{task_id}",
        dependencies=[Depends(authenticate), Depends(limiter)],
    )
    async def delete_task(task_id: str) -> JSONResponse:
        if tracker.get_task(task_id) is None:
            raise NotFoundError("Task not found")
        tracker.tasks.pop(task_id, None)
        tracker.save()
        return success_response({"deleted": task_id})

    return router


__all__ = ["create_tasks_router", "TaskCreate", "TaskUpdate", "RateLimiter"]
