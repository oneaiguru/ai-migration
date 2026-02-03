"""Thread-safe JSON file persistence with backups and migrations."""

from __future__ import annotations

import json
import logging
import os
import shutil
from datetime import datetime
from pathlib import Path
from threading import RLock
from typing import Any, Callable, Dict, Optional

logger = logging.getLogger(__name__)

Validator = Callable[[Dict[str, Any]], Dict[str, Any]]
Migration = Callable[[Dict[str, Any]], Dict[str, Any]]


class JSONDatabase:
    """Simple JSON file database with automatic backups and migrations."""

    def __init__(
        self,
        path: str | Path,
        *,
        default: Optional[Dict[str, Any]] = None,
        version: int = 1,
        migrations: Optional[Dict[int, Migration]] = None,
        validator: Optional[Validator] = None,
    ) -> None:
        self.path = Path(path)
        self.default = default or {}
        self.version = version
        self.migrations = migrations or {}
        self.validator = validator
        self._lock = RLock()
        self._data: Dict[str, Any] = {}
        self.load()

    # ------------------------------------------------------------------
    def load(self) -> None:
        """Load JSON data from disk, applying migrations and validation."""
        with self._lock:
            if not self.path.exists():
                self._data = self.default.copy()
                return
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    raw = json.load(f)
            except Exception as exc:  # pragma: no cover - defensive
                logger.exception("Failed to read %s: %s", self.path, exc)
                self._backup_corrupt()
                self._data = self.default.copy()
                return

            if isinstance(raw, dict) and "_version" in raw and "data" in raw:
                data_version = int(raw.get("_version", 1))
                data = raw.get("data", {})
            else:
                data_version = 1
                data = raw

            try:
                data = self._apply_migrations(data, data_version)
                if self.validator:
                    data = self.validator(data)
                self._data = data
            except Exception as exc:  # pragma: no cover - defensive
                logger.exception("Error during migration/validation: %s", exc)
                self._data = self.default.copy()

    # ------------------------------------------------------------------
    def _apply_migrations(
        self, data: Dict[str, Any], current_version: int
    ) -> Dict[str, Any]:
        while current_version < self.version:
            migration = self.migrations.get(current_version)
            if not migration:
                logger.warning("Missing migration for version %s", current_version)
                break
            try:
                data = migration(data)
            except Exception as exc:  # pragma: no cover - defensive
                logger.exception("Migration from %s failed: %s", current_version, exc)
                break
            current_version += 1
        return data

    # ------------------------------------------------------------------
    def _backup_corrupt(self) -> None:
        ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        backup = self.path.with_name(f"{self.path.name}.corrupt.{ts}")
        try:
            shutil.move(self.path, backup)
        except Exception:  # pragma: no cover - best effort
            logger.error("Failed to backup corrupt file %s", self.path)

    # ------------------------------------------------------------------
    def save(self) -> None:
        """Save data to disk with automatic backup."""
        with self._lock:
            os.makedirs(self.path.parent, exist_ok=True)
            tmp = self.path.with_suffix(self.path.suffix + ".tmp")
            try:
                if self.path.exists():
                    backup = self.path.with_suffix(self.path.suffix + ".bak")
                    shutil.copy2(self.path, backup)
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump(
                        {"_version": self.version, "data": self._data}, f, indent=2
                    )
                os.replace(tmp, self.path)
            except Exception as exc:  # pragma: no cover - defensive
                logger.exception("Failed to write %s: %s", self.path, exc)
                if tmp.exists():
                    tmp.unlink()

    # ------------------------------------------------------------------
    def read(self) -> Dict[str, Any]:
        """Return a copy of the stored data."""
        with self._lock:
            return json.loads(json.dumps(self._data))

    # ------------------------------------------------------------------
    def write(self, data: Dict[str, Any]) -> None:
        """Replace data and persist it."""
        with self._lock:
            if self.validator:
                data = self.validator(data)
            self._data = data
            self.save()

    # ------------------------------------------------------------------
    def update(self, func: Callable[[Dict[str, Any]], Dict[str, Any]]) -> None:
        """Atomically update data using a callback function."""
        with self._lock:
            new_data = func(self.read())
            if self.validator:
                new_data = self.validator(new_data)
            self._data = new_data
            self.save()


__all__ = ["JSONDatabase"]
