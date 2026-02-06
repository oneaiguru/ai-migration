from __future__ import annotations

import json
from pathlib import Path
from typing import Any, List, Optional

from ..meta import stamp_record


class JsonlStore:
    """Persist tracker data in newline-delimited JSON files."""

    def __init__(self, base_dir: Path | str) -> None:
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.snapshots_path = self.base_dir / "snapshots.jsonl"
        self.windows_path = self.base_dir / "windows.jsonl"
        self.glm_counts_path = self.base_dir / "glm_counts.jsonl"
        self.codex_ccusage_path = self.base_dir / "codex_ccusage.jsonl"
        self.claude_monitor_path = self.base_dir / "claude_monitor.jsonl"
        self.churn_path = self.base_dir / "churn.jsonl"
        self.anomalies_path = self.base_dir / "anomalies.jsonl"
        self.proxy_telemetry_path = self.base_dir / "proxy_telemetry.jsonl"

    def append_snapshot(self, record: dict[str, Any]) -> None:
        self._append(self.snapshots_path, record)

    def append_window(self, record: dict[str, Any]) -> None:
        self._append(self.windows_path, record)

    def append_glm_counts(self, record: dict[str, Any]) -> None:
        self._append(self.glm_counts_path, record)

    def append_codex_ccusage(self, record: dict[str, Any]) -> None:
        self._append(self.codex_ccusage_path, record)

    def append_claude_monitor(self, record: dict[str, Any]) -> None:
        self._append(self.claude_monitor_path, record)

    def append_churn(self, record: dict[str, Any]) -> None:
        self._append(self.churn_path, record)

    def append_anomaly(self, record: dict[str, Any]) -> None:
        """Record detected anomalies (e.g., negative deltas) append-only."""
        self._append(self.anomalies_path, record)

    def append_proxy_telemetry(self, record: dict[str, Any]) -> None:
        self._append(self.proxy_telemetry_path, record)

    def load_snapshots(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
        return self._load(self.snapshots_path, window_id)

    def load_windows(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
        return self._load(self.windows_path, window_id)

    def load_glm_counts(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
        return self._load(self.glm_counts_path, window_id)

    def load_codex_ccusage(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
        return self._load(self.codex_ccusage_path, window_id)

    def load_claude_monitor(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
        return self._load(self.claude_monitor_path, window_id)

    def load_churn(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
        return self._load(self.churn_path, window_id)

    def load_anomalies(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
        """Return recorded anomalies (optionally filtered by window)."""
        return self._load(self.anomalies_path, window_id)

    def load_proxy_telemetry(self, window_id: Optional[str] = None) -> List[dict[str, Any]]:
        return self._load(self.proxy_telemetry_path, window_id)

    def write_snapshots(self, records: List[dict[str, Any]]) -> None:
        self._write(self.snapshots_path, records)

    def _append(self, path: Path, record: dict[str, Any]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        stamped = stamp_record(record)
        with path.open("a", encoding="utf-8") as handle:
            json.dump(stamped, handle, ensure_ascii=False)
            handle.write("\n")

    def _load(self, path: Path, window_id: Optional[str]) -> List[dict[str, Any]]:
        if not path.exists():
            return []
        rows: List[dict[str, Any]] = []
        with path.open("r", encoding="utf-8") as handle:
            for line in handle:
                line = line.strip()
                if not line:
                    continue
                data = json.loads(line)
                if window_id and data.get("window") != window_id:
                    continue
                rows.append(data)
        rows.sort(
            key=lambda item: (
                item.get("captured_at") or item.get("finalized_at") or "",
                item.get("provider") or "",
            )
        )
        return rows

    def _write(self, path: Path, records: List[dict[str, Any]]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as handle:
            for record in records:
                stamped = stamp_record(record)
                json.dump(stamped, handle, ensure_ascii=False)
                handle.write("\n")
