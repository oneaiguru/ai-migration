from __future__ import annotations

from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, validator


@dataclass
class Template:
    """Internal representation of a prompt template."""

    name: str
    prompt: str
    display_name: str = ""
    description: str = ""
    categories: List[str] = field(default_factory=list)
    version: str = "1.0"
    ai_level: str = ""
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Template":
        return cls(**data)


class TemplateCreate(BaseModel):
    """Payload for creating a template via API."""

    name: str
    prompt: str
    display_name: Optional[str] = None
    description: Optional[str] = None
    categories: List[str] = []
    version: str = "1.0"
    ai_level: Optional[str] = None

    @validator("name", "prompt")
    def not_empty(cls, value: str) -> str:  # type: ignore[override]
        if not value:
            raise ValueError("must not be empty")
        return value


class TemplateRead(BaseModel):
    """Serialization model for returning templates via API."""

    name: str
    prompt: str
    display_name: str
    description: str
    categories: List[str]
    version: str
    ai_level: str
    created_at: str
    updated_at: str

    @classmethod
    def from_template(cls, template: Template) -> "TemplateRead":
        return cls(**template.to_dict())


# ---------------------------------------------------------------------------
# Database migration helpers
# ---------------------------------------------------------------------------
TEMPLATE_DB_VERSION = 1


def migrate_v0_to_v1(data: Dict[str, Any]) -> Dict[str, Any]:
    """Initial migration adding timestamps to templates."""

    for entry in data.values():
        entry.setdefault("created_at", datetime.utcnow().isoformat())
        entry.setdefault("updated_at", datetime.utcnow().isoformat())
    return data


TEMPLATE_MIGRATIONS: Dict[int, callable] = {
    0: migrate_v0_to_v1,
}

__all__ = [
    "Template",
    "TemplateCreate",
    "TemplateRead",
    "TEMPLATE_DB_VERSION",
    "TEMPLATE_MIGRATIONS",
]
