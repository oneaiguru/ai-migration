"""Simple gallery and search utilities for task templates.

`TemplateGallery` creates an empty gallery JSON file when initialized with a
non‑existent ``gallery_file`` path.
"""
from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from path_utils import repo_path

# Default gallery location relative to repository root
DEFAULT_GALLERY_FILE = str(repo_path("templates", "gallery.json"))


@dataclass
class Template:
    """Representation of a single template entry."""

    name: str
    display_name: str
    description: str
    prompt: str
    version: str = "1.0"
    categories: List[str] = field(default_factory=list)
    ai_level: str = ""

    def to_dict(self) -> Dict[str, object]:
        """Return a JSON serializable representation of the template."""
        return {
            "display_name": self.display_name,
            "description": self.description,
            "prompt": self.prompt,
            "version": self.version,
            "categories": self.categories,
            "ai_level": self.ai_level,
        }

    def preview(self, length: int = 60) -> str:
        """Return a short preview of the template prompt."""
        lines = self.prompt.strip().splitlines()
        if not lines:
            return ""
        snippet = lines[0]
        if len(snippet) > length:
            snippet = snippet[: length - 3] + "..."
        return snippet


class TemplateGallery:
    """Load and search task templates."""

    def __init__(self, gallery_file: str = DEFAULT_GALLERY_FILE) -> None:
        if not os.path.isfile(gallery_file):
            os.makedirs(os.path.dirname(gallery_file) or ".", exist_ok=True)
            with open(gallery_file, "w", encoding="utf-8") as f:
                json.dump({}, f)
        self.gallery_file = gallery_file
        self.templates: Dict[str, Template] = {}
        self._load()

    # ------------------------------------------------------------------
    def _write(self) -> None:
        """Persist templates back to the gallery file."""
        data = {name: tpl.to_dict() for name, tpl in self.templates.items()}
        with open(self.gallery_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    # ------------------------------------------------------------------
    def _load(self) -> None:
        """Load templates from the gallery file."""

        with open(self.gallery_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        for name, info in data.items():
            self.templates[name] = Template(
                name=name,
                display_name=info.get("display_name", name),
                description=info.get("description", ""),
                prompt=info.get("prompt", ""),
                version=info.get("version", "1.0"),
                categories=info.get("categories", []),
                ai_level=info.get("ai_level", ""),
            )

    # ------------------------------------------------------------------
    def list(self) -> List[Template]:
        """Return all templates sorted by name."""
        return sorted(self.templates.values(), key=lambda t: t.name)

    # ------------------------------------------------------------------
    def add(self, template: Template) -> None:
        """Add or update a template."""
        self.templates[template.name] = template
        self._write()

    # ------------------------------------------------------------------
    def import_from_dict(self, data: Dict[str, Dict[str, object]]) -> None:
        """Import templates from a dictionary mapping names to info."""
        for name, info in data.items():
            self.templates[name] = Template(
                name=name,
                display_name=info.get("display_name", name),
                description=info.get("description", ""),
                prompt=info.get("prompt", ""),
                version=info.get("version", "1.0"),
                categories=info.get("categories", []),
                ai_level=info.get("ai_level", ""),
            )
        self._write()

    # ------------------------------------------------------------------
    def export_to_dict(self) -> Dict[str, Dict[str, object]]:
        """Return the gallery as a dictionary for exporting."""
        return {name: tpl.to_dict() for name, tpl in self.templates.items()}

    # ------------------------------------------------------------------
    def get(self, name: str) -> Optional[Template]:
        """Return a template by name."""
        return self.templates.get(name)

    # ------------------------------------------------------------------
    def search(
        self,
        *,
        text: Optional[str] = None,
        category: Optional[str] = None,
        ai_level: Optional[str] = None,
    ) -> List[Template]:
        """Search templates by text, category or AI level."""
        results = self.templates.values()
        if text:
            text_lower = text.lower()
            results = [
                t
                for t in results
                if text_lower in t.name.lower() or text_lower in t.description.lower()
            ]
        if category:
            results = [t for t in results if category in t.categories]
        if ai_level:
            results = [t for t in results if t.ai_level == ai_level]
        return sorted(results, key=lambda t: t.name)


__all__ = ["Template", "TemplateGallery"]
