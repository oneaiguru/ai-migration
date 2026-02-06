"""Schema helpers for AgentOS unified telemetry events."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Iterable

__all__ = [
    "SchemaValidationError",
    "load_schema",
    "validate",
]

SCHEMA_DIR = Path(__file__).resolve().parent / "v1"


class SchemaValidationError(ValueError):
    """Raised when payloads fail the minimal JSON schema checks."""


def load_schema(name: str) -> Dict[str, Any]:
    """Load a schema JSON document from ``schemas/v1``.

    Parameters
    ----------
    name:
        Base filename without extension (e.g. ``"session"``).
    """

    path = SCHEMA_DIR / f"{name}.json"
    if not path.exists():
        raise FileNotFoundError(f"Unknown schema '{name}' at {path}")
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


_TYPE_MAP = {
    "string": str,
    "number": (int, float),
    "integer": int,
    "boolean": bool,
    "object": dict,
    "array": list,
    "null": type(None),
}


def _validate_type(expected: Any, value: Any, pointer: str) -> None:
    if isinstance(expected, list):
        # Any of the provided types is acceptable.
        if not any(isinstance(value, _TYPE_MAP.get(kind, ())) for kind in expected):
            readable = ", ".join(expected)
            raise SchemaValidationError(f"{pointer}: expected one of [{readable}], got {type(value).__name__}")
        return

    py_types = _TYPE_MAP.get(expected)
    if py_types is None:
        raise SchemaValidationError(f"{pointer}: unsupported schema type '{expected}'")
    if expected == "number" and isinstance(value, bool):
        # bool is a subclass of int, guard against accidental truthy values.
        raise SchemaValidationError(f"{pointer}: expected number, got bool")
    if expected == "integer" and isinstance(value, bool):
        raise SchemaValidationError(f"{pointer}: expected integer, got bool")
    if not isinstance(value, py_types):
        raise SchemaValidationError(f"{pointer}: expected {expected}, got {type(value).__name__}")


def _validate(schema: Dict[str, Any], data: Any, pointer: str = "$") -> None:
    schema_type = schema.get("type")
    if schema_type:
        _validate_type(schema_type, data, pointer)

    if schema_type == "object":
        required: Iterable[str] = schema.get("required", [])
        for key in required:
            if key not in data:
                raise SchemaValidationError(f"{pointer}: missing required property '{key}'")

        properties: Dict[str, Any] = schema.get("properties", {})
        additional_allowed = schema.get("additionalProperties", True)
        for key, value in data.items():
            sub_pointer = f"{pointer}.{key}"
            if key in properties:
                _validate(properties[key], value, sub_pointer)
            elif not additional_allowed:
                raise SchemaValidationError(f"{sub_pointer}: additional properties are not permitted")

    elif schema_type == "array":
        item_schema = schema.get("items")
        if item_schema:
            for index, item in enumerate(data):
                _validate(item_schema, item, f"{pointer}[{index}]")

    if "enum" in schema:
        if data not in schema["enum"]:
            raise SchemaValidationError(f"{pointer}: value '{data}' not in enum {schema['enum']}")

    if "minimum" in schema and isinstance(data, (int, float)):
        minimum = schema["minimum"]
        if data < minimum:
            raise SchemaValidationError(f"{pointer}: value {data} below minimum {minimum}")

    if "maximum" in schema and isinstance(data, (int, float)):
        maximum = schema["maximum"]
        if data > maximum:
            raise SchemaValidationError(f"{pointer}: value {data} above maximum {maximum}")


def validate(name: str, data: Any) -> None:
    """Validate ``data`` using the named schema.

    Only a small subset of JSON Schema is implemented to keep dependencies
    lightweight. The helper raises :class:`SchemaValidationError` on failure.
    """

    schema = load_schema(name)
    _validate(schema, data)
