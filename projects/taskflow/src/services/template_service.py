from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Any

from path_utils import repo_path
from utils.logging_config import templates_logger as logger

DEFAULT_TEMPLATE_DIR = str(repo_path("core", "specs", "templates"))
DEFAULT_DB_FILE = str(repo_path("templates", "gallery.json"))


class TemplateNotFoundError(FileNotFoundError):
    """Raised when a requested template is not available."""


class MissingTemplateVariableError(ValueError):
    """Raised when variables required for rendering are missing."""


_VAR_PATTERN_CURLY = re.compile(r"\{\{([^}]+)\}\}")
_VAR_PATTERN_BRACKET = re.compile(r"\[([A-Za-z0-9_-]+)\]")


@dataclass
class Template:
    """Representation of a template."""

    name: str
    prompt: str
    display_name: str = ""
    description: str = ""
    categories: List[str] = field(default_factory=list)
    version: str = "1.0"
    ai_level: str = ""
    source: str = "db"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "display_name": self.display_name or self.name,
            "description": self.description,
            "prompt": self.prompt,
            "version": self.version,
            "categories": self.categories,
            "ai_level": self.ai_level,
        }


class TemplateService:
    """Service layer for managing templates from files and a database."""

    def __init__(
        self,
        template_dir: str = DEFAULT_TEMPLATE_DIR,
        db_file: str = DEFAULT_DB_FILE,
    ) -> None:
        self.template_dir = template_dir
        self.db_file = db_file
        self.db_templates: Dict[str, Template] = {}
        self.file_templates: Dict[str, Template] = {}
        self._load_db()
        self._load_file_templates()

    # ------------------------------------------------------------------
    def _load_db(self) -> None:
        try:
            with open(self.db_file, "r", encoding="utf-8") as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = {}
        for name, info in data.items():
            self.db_templates[name] = Template(
                name=name,
                prompt=info.get("prompt", ""),
                display_name=info.get("display_name", name),
                description=info.get("description", ""),
                version=info.get("version", "1.0"),
                categories=info.get("categories", []),
                ai_level=info.get("ai_level", ""),
                source="db",
            )

    # ------------------------------------------------------------------
    def _save_db(self) -> None:
        os.makedirs(os.path.dirname(self.db_file), exist_ok=True)
        data = {name: tpl.to_dict() for name, tpl in self.db_templates.items()}
        with open(self.db_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    # ------------------------------------------------------------------
    def _load_file_templates(self) -> None:
        directory = Path(self.template_dir)
        if not directory.is_dir():
            return
        for entry in directory.iterdir():
            if entry.suffix.lower() not in {".md", ".txt"}:
                continue
            name = entry.stem
            with entry.open("r", encoding="utf-8") as f:
                content = f.read()
            self.file_templates[name] = Template(
                name=name,
                prompt=content,
                display_name=name,
                source="file",
            )

    # ------------------------------------------------------------------
    def list_templates(self, source: Optional[str] = None) -> List[Template]:
        templates: List[Template] = []
        if source in (None, "db"):
            templates.extend(self.db_templates.values())
        if source in (None, "file"):
            templates.extend(self.file_templates.values())
        return sorted(templates, key=lambda t: t.name)

    # ------------------------------------------------------------------
    def get_template(self, name: str) -> Optional[Template]:
        if name in self.db_templates:
            return self.db_templates[name]
        return self.file_templates.get(name)

    # ------------------------------------------------------------------
    def add_template(self, name: str, info: Dict[str, Any]) -> None:
        if "prompt" not in info:
            raise ValueError("Template data must include a 'prompt'")
        self.db_templates[name] = Template(
            name=name,
            prompt=info.get("prompt", ""),
            display_name=info.get("display_name", name),
            description=info.get("description", ""),
            version=info.get("version", "1.0"),
            categories=info.get("categories", []),
            ai_level=info.get("ai_level", ""),
            source="db",
        )
        self._save_db()

    # ------------------------------------------------------------------
    def delete_template(self, name: str) -> bool:
        if name in self.db_templates:
            del self.db_templates[name]
            self._save_db()
            return True
        return False

    # ------------------------------------------------------------------
    def get_categories(self) -> List[str]:
        cats = set()
        for tpl in self.db_templates.values():
            cats.update(tpl.categories)
        return sorted(cats)

    # ------------------------------------------------------------------
    def search_templates(
        self,
        *,
        query: Optional[str] = None,
        category: Optional[str] = None,
    ) -> List[Template]:
        results = self.list_templates()
        if query:
            q = query.lower()
            results = [
                t
                for t in results
                if q in t.name.lower()
                or q in t.display_name.lower()
                or q in t.description.lower()
            ]
        if category:
            results = [t for t in results if category in t.categories]
        return sorted(results, key=lambda t: t.name)

    # ------------------------------------------------------------------
    def export_templates(self) -> Dict[str, Dict[str, Any]]:
        return {name: tpl.to_dict() for name, tpl in self.db_templates.items()}

    # ------------------------------------------------------------------
    def import_templates(self, templates: Dict[str, Dict[str, Any]]) -> int:
        count = 0
        for name, info in templates.items():
            if "prompt" not in info:
                continue
            self.add_template(name, info)
            count += 1
        return count

    # ------------------------------------------------------------------
    @staticmethod
    def extract_variables(template: str) -> List[str]:
        return _VAR_PATTERN_CURLY.findall(template) + _VAR_PATTERN_BRACKET.findall(
            template
        )

    # ------------------------------------------------------------------
    @staticmethod
    def validate_template(template: str) -> bool:
        return bool(TemplateService.extract_variables(template))

    # ------------------------------------------------------------------
    @staticmethod
    def _replace_variables(template: str, variables: Dict[str, str]) -> str:
        missing: List[str] = []

        def repl(match: re.Match) -> str:
            var = match.group(1)
            if var in variables:
                return str(variables[var])
            missing.append(var)
            return f"[MISSING:{var}]"

        template = _VAR_PATTERN_CURLY.sub(repl, template)
        template = _VAR_PATTERN_BRACKET.sub(repl, template)
        if missing:
            raise MissingTemplateVariableError(
                f"Missing variables: {', '.join(sorted(set(missing)))}"
            )
        return template

    # ------------------------------------------------------------------
    def render_template(self, name: str, variables: Dict[str, str]) -> str:
        tpl = self.get_template(name)
        if not tpl:
            raise TemplateNotFoundError(f"Template not found: {name}")
        if not self.validate_template(tpl.prompt):
            raise ValueError(f"Template '{name}' is not valid")
        return self._replace_variables(tpl.prompt, variables)


__all__ = [
    "Template",
    "TemplateService",
    "TemplateNotFoundError",
    "MissingTemplateVariableError",
]
