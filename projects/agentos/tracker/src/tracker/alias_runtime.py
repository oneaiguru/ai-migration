from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from .storage import JsonlStore


class AliasError(Exception):
    """Raised when alias processing cannot proceed."""


@dataclass
class AliasState:
    provider: str
    current_window: str | None
    last_phase: str | None
    baseline_prompts: float | None
    state_path: Path

    def save(self) -> None:
        payload = {
            "provider": self.provider,
            "current_window": self.current_window,
            "last_phase": self.last_phase,
            "baseline_prompts": self.baseline_prompts,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        self.state_path.parent.mkdir(parents=True, exist_ok=True)
        self.state_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    @classmethod
    def load(
        cls,
        provider: str,
        store: JsonlStore,
        state_path: Path,
        *,
        refresh: bool = False,
    ) -> "AliasState":
        if state_path.exists() and not refresh:
            try:
                payload = json.loads(state_path.read_text(encoding="utf-8"))
                return cls(
                    provider=provider,
                    current_window=payload.get("current_window"),
                    last_phase=payload.get("last_phase"),
                    baseline_prompts=_coerce_float(payload.get("baseline_prompts")),
                    state_path=state_path,
                )
            except json.JSONDecodeError:
                # Fall back to inference if the state file is corrupt.
                pass

        inferred = _infer_state(provider, store)
        return cls(
            provider=provider,
            current_window=inferred["current_window"],
            last_phase=inferred["last_phase"],
            baseline_prompts=inferred["baseline_prompts"],
            state_path=state_path,
        )


class AliasProcessor:
    """Encapsulates alias window resolution and storage behaviour."""

    def __init__(
        self,
        *,
        provider: str,
        store: JsonlStore,
        parser: Callable[[str], dict[str, Any]],
        state_dir: Path,
        window_override: str | None = None,
        source_label: str = "alias",
    ) -> None:
        self.provider = provider
        self.store = store
        self.parser = parser
        self.state_dir = state_dir
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.window_override = window_override
        self.source_label = source_label or "alias"
        self.state_path = state_dir / f"{provider}.json"
        self.state = AliasState.load(provider, store, self.state_path)

    def start(self, raw_text: str, notes: str) -> str:
        window = self._resolve_window_for_start()
        parsed = self.parser(raw_text)

        if self.provider == "glm":
            baseline = _coerce_float(parsed.get("prompts_used"))
            if baseline is None:
                raise AliasError("glm alias start requires prompts_used field in payload")
            self.state.current_window = window
            self.state.last_phase = "before"
            self.state.baseline_prompts = baseline
            self.state.save()
            return (
                f"stored glm baseline for {window} "
                f"(prompts={_format_number(baseline)})"
            )

        self._append_snapshot(window, "before", raw_text, parsed, notes or "alias:start")
        self.state.current_window = window
        self.state.last_phase = "before"
        self.state.baseline_prompts = None
        self.state.save()
        return f"stored {self.provider} before snapshot for {window} (awaiting end)"

    def end(self, raw_text: str, notes: str) -> str:
        window = self._resolve_window_for_end()
        parsed = self.parser(raw_text)

        if self.provider == "glm":
            total = _coerce_float(parsed.get("prompts_used"))
            if total is None:
                raise AliasError("glm alias end requires prompts_used field in payload")
            baseline = self.state.baseline_prompts
            if baseline is None:
                raise AliasError(
                    "glm alias end missing baseline; run zs before ze or provide --window"
                )
            delta = max(total - baseline, 0.0)
            self._append_glm(window, raw_text, parsed, delta, notes or "alias:end")
            self.state.current_window = window
            self.state.last_phase = "after"
            self.state.baseline_prompts = total
            self.state.save()
            return (
                f"stored glm delta for {window} "
                f"(baseline={_format_number(baseline)}, prompts={_format_number(delta)})"
            )

        self._ensure_before_exists(window)
        self._append_snapshot(window, "after", raw_text, parsed, notes or "alias:end")
        self.state.current_window = window
        self.state.last_phase = "after"
        self.state.baseline_prompts = None
        self.state.save()
        return f"stored {self.provider} after snapshot for {window} (ready to finalize)"

    def cross(self, raw_text: str, notes: str) -> str:
        current = self._resolve_window_for_end()
        next_window = _increment_window(current)
        parsed = self.parser(raw_text)

        if self.provider == "glm":
            total = _coerce_float(parsed.get("prompts_used"))
            if total is None:
                raise AliasError("glm alias cross requires prompts_used field in payload")
            baseline = self.state.baseline_prompts
            if baseline is None:
                raise AliasError(
                    "glm alias cross missing baseline; run zs before zx or provide --window"
                )
            delta = max(total - baseline, 0.0)
            self._append_glm(current, raw_text, parsed, delta, notes or "alias:cross-end")
            # Seed next baseline with same snapshot (continuation).
            self.state.current_window = next_window
            self.state.last_phase = "before"
            self.state.baseline_prompts = total
            self.state.save()
            return (
                f"stored glm delta for {current} and seeded baseline for {next_window} "
                f"(delta={_format_number(delta)})"
            )

        self._ensure_before_exists(current)
        self._append_snapshot(current, "after", raw_text, parsed, notes or "alias:cross-end")
        self._append_snapshot(next_window, "before", raw_text, parsed, notes or "alias:cross-start")
        self.state.current_window = next_window
        self.state.last_phase = "before"
        self.state.baseline_prompts = None
        self.state.save()
        return (
            f"stored {self.provider} after snapshot for {current} and seeded "
            f"before snapshot for {next_window}"
        )

    def delete(
        self,
        *,
        index: int = 1,
        phase: str | None = None,
        window: str | None = None,
    ) -> str:
        if index <= 0:
            raise AliasError("index must be >= 1")

        snapshots = self.store.load_snapshots()
        matches = [
            snap
            for snap in snapshots
            if snap.get("provider") == self.provider
            and (phase is None or snap.get("phase") == phase)
            and (window is None or snap.get("window") == window)
        ]
        if not matches:
            raise AliasError("no matching snapshots to delete")
        if len(matches) < index:
            raise AliasError(
                f"only {len(matches)} matching snapshot(s); cannot delete index {index}"
            )

        target = matches[-index]
        key = (
            target.get("window"),
            target.get("provider"),
            target.get("phase"),
            target.get("captured_at"),
            target.get("raw_text"),
        )
        remaining = []
        removed = False
        for snap in snapshots:
            snap_key = (
                snap.get("window"),
                snap.get("provider"),
                snap.get("phase"),
                snap.get("captured_at"),
                snap.get("raw_text"),
            )
            if not removed and snap_key == key:
                removed = True
                continue
            remaining.append(snap)

        if not removed:
            raise AliasError("failed to locate snapshot for deletion")

        self.store.write_snapshots(remaining)
        # Recompute state after mutation.
        self.state = AliasState.load(
            self.provider,
            self.store,
            self.state_path,
            refresh=True,
        )
        self.state.save()

        window_id = target.get("window") or "unknown"
        phase_label = target.get("phase") or "n/a"
        captured = target.get("captured_at") or "unknown"
        return (
            f"removed {self.provider} {phase_label} snapshot for {window_id} "
            f"(captured_at={captured})"
        )

    # Internal helpers -------------------------------------------------

    def _resolve_window_for_start(self) -> str:
        if self.window_override:
            return self.window_override

        window = self.state.current_window
        if not window:
            window = "W0-01"
        if self.state.last_phase == "after":
            window = _increment_window(window)
        return window

    def _resolve_window_for_end(self) -> str:
        if self.window_override:
            return self.window_override

        window = self.state.current_window
        if window:
            return window
        # If we have no state, infer from store.
        inferred = _infer_state(self.provider, self.store)
        window = inferred["current_window"] or "W0-01"
        if inferred.get("last_phase") == "after":
            window = _increment_window(window)
        return window

    def _append_snapshot(
        self,
        window: str,
        phase: str,
        raw_text: str,
        parsed: dict[str, Any],
        notes: str,
    ) -> None:
        record = {
            "window": window,
            "provider": self.provider,
            "phase": phase,
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "notes": notes,
            "raw_text": raw_text.rstrip(),
            "parsed": parsed,
            "source": self.source_label,
        }
        self.store.append_snapshot(record)

    def _append_glm(
        self,
        window: str,
        raw_text: str,
        parsed: dict[str, Any],
        prompts_used: float,
        notes: str,
    ) -> None:
        record = {
            "window": window,
            "provider": self.provider,
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "notes": notes,
            "raw_text": raw_text.rstrip(),
            "parsed": parsed,
            "source": self.source_label,
            "prompts_used": prompts_used,
        }
        self.store.append_glm_counts(record)

    def _ensure_before_exists(self, window: str) -> None:
        if self.provider == "glm":
            return
        snapshots = self.store.load_snapshots(window)
        for snap in snapshots:
            if snap.get("provider") == self.provider and snap.get("phase") == "before":
                return
        raise AliasError(
            f"no BEFORE snapshot found for {self.provider} in {window}; run start first"
        )


def _infer_state(provider: str, store: JsonlStore) -> dict[str, Any]:
    if provider == "glm":
        rows = store.load_glm_counts()
        if not rows:
            return {"current_window": "W0-01", "last_phase": None, "baseline_prompts": None}
        last = rows[-1]
        window = str(last.get("window") or "W0-01")
        next_window = _increment_window(window)
        return {
            "current_window": next_window,
            "last_phase": None,
            "baseline_prompts": None,
        }

    snapshots = [
        snap
        for snap in store.load_snapshots()
        if snap.get("provider") == provider and snap.get("phase") in {"before", "after"}
    ]
    if not snapshots:
        return {"current_window": "W0-01", "last_phase": None, "baseline_prompts": None}

    last = snapshots[-1]
    window = str(last.get("window") or "W0-01")
    phase = last.get("phase")
    if phase == "after":
        return {"current_window": _increment_window(window), "last_phase": None, "baseline_prompts": None}
    return {"current_window": window, "last_phase": phase, "baseline_prompts": None}


def _increment_window(window_id: str) -> str:
    match = re.search(r"(\d+)$", window_id)
    if not match:
        return f"{window_id}-1"
    number = match.group(1)
    prefix = window_id[: match.start(1)]
    width = len(number)
    next_number = str(int(number) + 1).zfill(width)
    return f"{prefix}{next_number}"


def _coerce_float(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (float, int)) and not isinstance(value, bool):
        return float(value)
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _format_number(value: float) -> str:
    if math.isclose(value, round(value), abs_tol=1e-6):
        return str(int(round(value)))
    return f"{value:.2f}"
