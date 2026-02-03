"""Simple configuration management for TaskFlow."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Optional

from dotenv import load_dotenv

# Load variables from a .env file if present
load_dotenv()


@dataclass
class Config:
    """Application configuration loaded from environment variables."""

    web_host: str = field(default_factory=lambda: os.getenv("WEB_HOST", "0.0.0.0"))
    web_port: int = field(default_factory=lambda: int(os.getenv("WEB_PORT", "8000")))
    web_user: str = field(default_factory=lambda: os.getenv("WEB_USER", "admin"))
    web_password: str = field(default_factory=lambda: os.getenv("WEB_PASSWORD", "password"))
    tasks_file: str = field(default_factory=lambda: os.getenv("TASKS_FILE", "tasks.json"))
    templates_dir: str = field(default_factory=lambda: os.getenv("TEMPLATES_DIR", "templates"))
    log_level: str = field(default_factory=lambda: os.getenv("LOG_LEVEL", "INFO"))

    def __post_init__(self) -> None:
        missing = []
        if not self.web_user:
            missing.append("WEB_USER")
        if not self.web_password:
            missing.append("WEB_PASSWORD")
        if missing:
            raise EnvironmentError(
                f"Missing required environment variables: {', '.join(missing)}"
            )
        if os.path.isdir(self.tasks_file):
            raise ValueError("TASKS_FILE must be a file path, not a directory")


# Global configuration instance
config = Config()


def get_config() -> Config:
    """Return the global configuration instance."""
    return config


__all__ = ["Config", "config", "get_config"]
