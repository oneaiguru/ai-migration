"""Unified configuration manager entry point.

This module provides a thin wrapper around :mod:`utils.config_manager`
so that the rest of the code base can simply import ``get_config``
and ``ConfigManager`` from here. It maintains a cached instance to
mirror the previous behaviour of this module.
"""

from __future__ import annotations

from typing import Optional

try:
    from utils.config_manager import ConfigManager as _BaseConfigManager
except ModuleNotFoundError:  # pragma: no cover - fallback for missing path
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from utils.config_manager import ConfigManager as _BaseConfigManager



class ConfigManager(_BaseConfigManager):
    """Singleton access to :class:`utils.config_manager.ConfigManager`."""

    _instance: Optional["ConfigManager"] = None

    @classmethod
    def get_config(cls) -> "ConfigManager":
        """Return a cached configuration instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reload(cls) -> "ConfigManager":
        """Reload configuration from environment and files."""
        cls._instance = cls()
        return cls._instance


def get_config() -> ConfigManager:
    """Convenience wrapper to retrieve the cached configuration."""
    return ConfigManager.get_config()
