from __future__ import annotations

import os
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional

from dotenv import load_dotenv

from template_gallery import DEFAULT_GALLERY_FILE

load_dotenv()


class Mode(str, Enum):
    """Execution modes for the application."""

    DEVELOPMENT = "development"
    PRODUCTION = "production"


@dataclass
class AppConfig:
    """Centralized application configuration."""

    repo_path: str = field(default_factory=lambda: os.getenv("REPO_PATH", "."))
    templates_file: str = field(
        default_factory=lambda: os.getenv("TEMPLATES_FILE", "templates.json")
    )
    telegram_token: Optional[str] = field(
        default_factory=lambda: os.getenv("TELEGRAM_TOKEN")
    )
    telegram_chat_id: Optional[str] = field(
        default_factory=lambda: os.getenv("TELEGRAM_CHAT_ID") or os.getenv("CHAT_ID")
    )
    authorized_users: str = field(
        default_factory=lambda: os.getenv("AUTHORIZED_USERS", "")
    )
    claude_check_interval: int = field(
        default_factory=lambda: int(os.getenv("CLAUDE_CHECK_INTERVAL", "10"))
    )
    web_host: str = field(default_factory=lambda: os.getenv("WEB_HOST", "0.0.0.0"))
    web_port: int = field(default_factory=lambda: int(os.getenv("WEB_PORT", "8000")))
    web_user: str = field(default_factory=lambda: os.getenv("WEB_USER", "admin"))
    web_password: str = field(
        default_factory=lambda: os.getenv("WEB_PASSWORD", "password")
    )
    tasks_file: str = field(
        default_factory=lambda: os.getenv("TASKS_FILE", "tasks.json")
    )
    gallery_file: str = field(
        default_factory=lambda: os.getenv("GALLERY_FILE", DEFAULT_GALLERY_FILE)
    )
    db_path: str = field(default_factory=lambda: os.getenv("DB_PATH", "taskflow.db"))
    api_key: Optional[str] = field(default_factory=lambda: os.getenv("API_KEY"))
    mode: Mode = field(
        default_factory=lambda: Mode(os.getenv("ENV", "development").lower())
    )

    def __post_init__(self) -> None:
        missing = []
        if not self.telegram_token:
            if os.getenv("ALLOW_MISSING_TOKEN", "").lower() in {"1", "true", "yes"}:
                self.telegram_token = "dummy"
            else:
                missing.append("TELEGRAM_TOKEN")
        if self.mode == Mode.PRODUCTION and not self.api_key:
            missing.append("API_KEY")
        if missing:
            raise EnvironmentError(
                f"Missing required environment variables: {', '.join(missing)}"
            )
        if not os.path.isdir(self.repo_path):
            self.repo_path = "."
        if os.path.isdir(self.tasks_file):
            self.tasks_file = "tasks.json"

    @property
    def authorized_users_list(self) -> List[str]:
        """Return authorized users as a list."""
        return [u for u in self.authorized_users.split(",") if u]


_config: Optional[AppConfig] = None


def get_config() -> AppConfig:
    """Return a configuration instance using current environment."""
    return AppConfig()


class Config:
    """Simpler configuration for web_server and CLI."""

    def __init__(self) -> None:
        self.web_host = os.getenv("WEB_HOST", "0.0.0.0")
        self.web_port = int(os.getenv("WEB_PORT", "8000"))
        self.web_user = os.getenv("WEB_USER", "admin")
        self.web_password = os.getenv("WEB_PASSWORD", "password")
        self.tasks_file = os.getenv("TASKS_FILE", "tasks.json")
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.repo_path = os.getenv("REPO_PATH", ".")

    def validate(self) -> None:
        """Validate configuration values."""
        if not self.web_user or not self.web_password:
            raise ValueError("WEB_USER and WEB_PASSWORD must be set")


# Global config instance for legacy modules
config = Config()


__all__ = ["AppConfig", "get_config", "Mode", "Config", "config"]
