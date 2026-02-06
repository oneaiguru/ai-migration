from __future__ import annotations

from typing import Any, Dict

from . import __version__

# Schema version applied to all JSONL records written by the tracker.
SCHEMA_VERSION = "1.0.0"

def stamp_record(
    record: Dict[str, Any],
    *,
    schema_version: str = SCHEMA_VERSION,
    tool_version: str | None = None,
) -> Dict[str, Any]:
    """Return a copy of *record* with schema/tool metadata attached."""
    stamped = dict(record)
    stamped.setdefault("schema_version", schema_version)
    stamped.setdefault("tool_version", tool_version or __version__)
    return stamped
