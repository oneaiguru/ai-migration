"""Application wide logging utilities."""

from __future__ import annotations

import logging
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path

__all__ = [
    "setup_logging",
    "web_logger",
    "tasks_logger",
    "templates_logger",
    "git_logger",
]

LOG_FILE = "taskflow.log"

# Predefined loggers for core components
web_logger = logging.getLogger("web")
tasks_logger = logging.getLogger("tasks")
templates_logger = logging.getLogger("templates")
git_logger = logging.getLogger("git")


def _create_handlers(log_file: str) -> list[logging.Handler]:
    """Return configured console and file handlers."""
    fmt = "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
    formatter = logging.Formatter(fmt)

    console = logging.StreamHandler()
    console.setFormatter(formatter)

    Path(log_file).parent.mkdir(parents=True, exist_ok=True)
    file_handler = TimedRotatingFileHandler(
        log_file, when="D", interval=1, backupCount=7
    )
    file_handler.setFormatter(formatter)

    return [console, file_handler]


def setup_logging(level: int = logging.INFO, log_file: str = LOG_FILE) -> None:
    """Configure root logger and component loggers."""
    root = logging.getLogger()
    root.handlers.clear()
    root.setLevel(level)

    for handler in _create_handlers(log_file):
        root.addHandler(handler)

    # Ensure component loggers use provided level
    for logger in (web_logger, tasks_logger, templates_logger, git_logger):
        logger.setLevel(level)
