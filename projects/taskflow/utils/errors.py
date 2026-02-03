from __future__ import annotations

import logging
from typing import Optional, Dict

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

__all__ = [
    "AppError",
    "ValidationError",
    "AuthenticationError",
    "NotFoundError",
    "GitOperationError",
    "TemplateError",
    "register_exception_handlers",
]

logger = logging.getLogger("errors")


class AppError(Exception):
    """Base class for application errors."""

    status_code: int = 500
    code: str = "APP_ERROR"

    def __init__(
        self,
        message: str,
        *,
        code: Optional[str] = None,
        status_code: Optional[int] = None,
        details: Optional[Dict[str, str]] = None,
    ) -> None:
        super().__init__(message)
        if code:
            self.code = code
        if status_code:
            self.status_code = status_code
        self.message = message
        self.details = details or {}


class ValidationError(AppError):
    status_code = 400
    code = "VALIDATION_ERROR"


class AuthenticationError(AppError):
    status_code = 401
    code = "AUTHENTICATION_ERROR"


class NotFoundError(AppError):
    status_code = 404
    code = "NOT_FOUND"


class GitOperationError(AppError):
    status_code = 500
    code = "GIT_ERROR"


class TemplateError(AppError):
    status_code = 400
    code = "TEMPLATE_ERROR"


def _format_error(exc: AppError) -> Dict[str, object]:
    return {"success": False, "data": None, "error": {"code": exc.code, "message": exc.message}}


def register_exception_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI app."""

    @app.exception_handler(AppError)
    async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
        logger.error("%s on %s: %s", exc.code, request.url.path, exc.message, exc_info=True)
        return JSONResponse(status_code=exc.status_code, content=_format_error(exc))

    @app.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled exception on %s", request.url.path)
        err = AppError("An unexpected error occurred", code="INTERNAL_SERVER_ERROR")
        return JSONResponse(status_code=500, content=_format_error(err))
