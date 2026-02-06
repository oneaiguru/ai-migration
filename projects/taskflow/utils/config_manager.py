"""Centralized configuration management for TaskFlow.ai.

This module implements a unified approach to configuration management
to resolve conflicts between different components and provide a
consistent interface for accessing configuration values.
"""

import os
import json
import logging
from pathlib import Path
from typing import Any, Dict, Optional, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class ConfigManager:
    """Manages configuration across the application with cascading precedence:
    1. Environment variables
    2. Configuration files
    3. Default values
    """

    CONFIG_FILENAME = "taskflow_config.json"
    DEFAULT_CONFIG = {
        "repo_path": ".",
        "templates_file": "templates/gallery.json",
        "telegram_token": None,
        "telegram_chat_id": None,
        "authorized_users": "",
        "check_interval": 10,
        "web_host": "0.0.0.0",
        "web_port": 8000,
        "web_user": "admin",
        "web_password": "password",
        "tasks_file": "tasks.json",
        "gallery_file": "templates/gallery.json",
        "debug": False,
    }

    def __init__(self, config_path: Optional[str] = None):
        """Initialize configuration manager.

        Args:
            config_path: Optional path to configuration file.
                If not provided, searches in current directory and user home.
        """
        self._config = self.DEFAULT_CONFIG.copy()
        self._load_config_file(config_path)
        self._override_from_env()
        self._validate()

    # ------------------------------------------------------------------
    # Attribute helper methods
    # ------------------------------------------------------------------
    def __getattr__(self, name: str) -> Any:
        if "_config" in self.__dict__ and name in self._config:
            return self._config.get(name)
        raise AttributeError(name)

    def __setattr__(self, name: str, value: Any) -> None:
        if name.startswith("_") or "_config" not in self.__dict__:
            super().__setattr__(name, value)
        elif name in self.DEFAULT_CONFIG:
            self._config[name] = value
        else:
            super().__setattr__(name, value)

    def _load_config_file(self, config_path: Optional[str] = None) -> None:
        """Load configuration from file."""
        paths_to_check = []

        # If specific path provided, check it first
        if config_path:
            paths_to_check.append(Path(config_path))

        # Add default search paths
        paths_to_check.extend(
            [
                Path.cwd() / self.CONFIG_FILENAME,
                Path.home() / ".taskflow" / self.CONFIG_FILENAME,
            ]
        )

        # Try each path
        for path in paths_to_check:
            if path.exists():
                try:
                    with open(path, "r") as f:
                        file_config = json.load(f)
                        self._config.update(file_config)
                        logger.info(f"Loaded configuration from {path}")
                        return
                except (json.JSONDecodeError, IOError) as e:
                    logger.warning(f"Failed to load config from {path}: {e}")

        logger.info(
            "No configuration file found, using defaults and environment variables"
        )

    def _override_from_env(self) -> None:
        """Override configuration with environment variables."""
        env_mapping = {
            "TASKFLOW_REPO_PATH": "repo_path",
            "REPO_PATH": "repo_path",
            "TASKFLOW_TEMPLATES_FILE": "templates_file",
            "TEMPLATES_FILE": "templates_file",
            "TELEGRAM_TOKEN": "telegram_token",
            "TELEGRAM_CHAT_ID": "telegram_chat_id",
            "CHAT_ID": "telegram_chat_id",
            "AUTHORIZED_USERS": "authorized_users",
            "CLAUDE_CHECK_INTERVAL": "check_interval",
            "WEB_HOST": "web_host",
            "WEB_PORT": "web_port",
            "WEB_USER": "web_user",
            "WEB_PASSWORD": "web_password",
            "TASKS_FILE": "tasks_file",
            "GALLERY_FILE": "gallery_file",
            "DEBUG": "debug",
        }

        for env_var, config_key in env_mapping.items():
            if env_var in os.environ:
                value = os.environ[env_var]

                # Convert to appropriate type
                if config_key in self._config and isinstance(
                    self._config[config_key], bool
                ):
                    value = value.lower() in ("true", "1", "yes")
                elif config_key in self._config and isinstance(
                    self._config[config_key], int
                ):
                    try:
                        value = int(value)
                    except ValueError:
                        logger.warning(
                            f"Invalid value for {env_var}: {value}. Must be an integer."
                        )
                        continue

                self._config[config_key] = value
                logger.debug(
                    f"Configuration {config_key} set from environment variable {env_var}"
                )

    def _validate(self) -> None:
        """Validate essential configuration options."""
        missing = []

        if not self._config.get("telegram_token"):
            if os.getenv("ALLOW_MISSING_TOKEN", "").lower() in {"1", "true", "yes"}:
                print("Warning: TELEGRAM_TOKEN not set. Using dummy token for tests.")
                self._config["telegram_token"] = "dummy"
            else:
                missing.append("TELEGRAM_TOKEN")

        if missing:
            raise EnvironmentError(
                f"Missing required environment variables: {', '.join(missing)}"
            )

        repo_path = self._config.get("repo_path", ".")
        if not os.path.isdir(repo_path):
            print(
                (
                    f"Warning: Repository path {repo_path} does not exist. "
                    "Proceeding anyway."
                )
            )

        tasks_file = self._config.get("tasks_file", "tasks.json")
        if os.path.isdir(tasks_file):
            print(
                (
                    f"Warning: TASKS_FILE {tasks_file} is a directory. "
                    "Using tasks.json instead."
                )
            )
            self._config["tasks_file"] = "tasks.json"

    def validate(self) -> None:
        """Public wrapper to validate configuration."""
        self._validate()

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value."""
        return self._config.get(key, default)

    def __getitem__(self, key: str) -> Any:
        """Dictionary-style access to configuration."""
        return self._config[key]

    def __contains__(self, key: str) -> bool:
        """Check if configuration key exists."""
        return key in self._config

    def get_all(self) -> Dict[str, Any]:
        """Get all configuration values."""
        return self._config.copy()

    def save(self, path: Optional[str] = None) -> None:
        """Save current configuration to file."""
        save_path = Path(path) if path else Path.cwd() / self.CONFIG_FILENAME

        # Create directory if it doesn't exist
        save_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            with open(save_path, "w") as f:
                json.dump(self._config, f, indent=2)
            logger.info(f"Saved configuration to {save_path}")
        except IOError as e:
            logger.error(f"Failed to save configuration to {save_path}: {e}")
            raise

    # Convenience attribute-style accessors

    @property
    def telegram_token(self) -> Optional[str]:
        return self._config.get("telegram_token")

    @property
    def authorized_users_list(self) -> List[str]:
        raw = self._config.get("authorized_users", "")
        return [u for u in str(raw).split(",") if u]

    @property
    def repo_path(self) -> str:
        return self._config.get("repo_path", ".")

    @property
    def templates_file(self) -> str:
        return self._config.get("templates_file", "templates.json")

    @property
    def telegram_chat_id(self) -> Optional[str]:
        return self._config.get("telegram_chat_id")

    @property
    def check_interval(self) -> int:
        return int(self._config.get("check_interval", 0))

    @property
    def tasks_file(self) -> str:
        return self._config.get("tasks_file", "tasks.json")

    @property
    def gallery_file(self) -> str:
        return self._config.get("gallery_file", "templates/gallery.json")

    @property
    def web_host(self) -> str:
        return self._config.get("web_host", "0.0.0.0")

    @property
    def web_port(self) -> int:
        return int(self._config.get("web_port", 8000))

    @property
    def web_user(self) -> str:
        return self._config.get("web_user", "admin")

    @property
    def web_password(self) -> str:
        return self._config.get("web_password", "password")

    @property
    def debug(self) -> bool:
        return bool(self._config.get("debug", False))


# Global instance
config = ConfigManager()
