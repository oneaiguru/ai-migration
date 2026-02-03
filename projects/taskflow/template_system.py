"""Enhanced template management system with categories and search."""

import json
import re
import os
from typing import Dict, List, Optional, Set, Any

DEFAULT_TEMPLATES_FILE = os.getenv("TEMPLATES_FILE", "templates.json")


class TemplateManager:
    """Manages templates with version control, categories, and search functionality."""

    def __init__(self, template_file: Optional[str] = None):
        """Initialize the template manager.

        Args:
            template_file: Path to the template file. If None, uses the configured path.
        """
        self.template_file = template_file or DEFAULT_TEMPLATES_FILE
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, Dict[str, Any]]:
        """Load templates from the template file."""
        try:
            with open(self.template_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def _save_templates(self) -> None:
        """Save templates to the template file."""
        os.makedirs(os.path.dirname(self.template_file), exist_ok=True)
        with open(self.template_file, "w", encoding="utf-8") as f:
            json.dump(self.templates, f, indent=2)

    def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get a template by ID."""
        return self.templates.get(template_id)

    def add_template(self, template_id: str, template_data: Dict[str, Any]) -> None:
        """Add or update a template."""
        required_fields = ["display_name", "description", "prompt", "version"]
        for field in required_fields:
            if field not in template_data:
                raise ValueError(f"Template is missing required field: {field}")

        if "categories" not in template_data:
            template_data["categories"] = []
        if "ai_level" not in template_data:
            template_data["ai_level"] = ""

        self.templates[template_id] = template_data
        self._save_templates()

    def delete_template(self, template_id: str) -> bool:
        """Delete a template."""
        if template_id in self.templates:
            del self.templates[template_id]
            self._save_templates()
            return True
        return False

    def list_templates(self) -> List[Dict[str, Any]]:
        """List all templates."""
        return [
            {"id": template_id, **template_data}
            for template_id, template_data in self.templates.items()
        ]

    def get_categories(self) -> Set[str]:
        """Get all unique categories."""
        categories: Set[str] = set()
        for template in self.templates.values():
            categories.update(template.get("categories", []))
        return categories

    def search_templates(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        ai_level: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Search templates by query, category, and/or AI level."""
        results = []
        for template_id, template in self.templates.items():
            if category and category not in template.get("categories", []):
                continue
            if ai_level and template.get("ai_level") != ai_level:
                continue
            if query:
                query_lower = query.lower()
                matches = any(
                    [
                        query_lower in template_id.lower(),
                        query_lower in template.get("display_name", "").lower(),
                        query_lower in template.get("description", "").lower(),
                        any(
                            query_lower in c.lower()
                            for c in template.get("categories", [])
                        ),
                    ]
                )
                if not matches:
                    continue
            results.append({"id": template_id, **template})
        return results

    def process_template(self, template_id: str, variables: Dict[str, str]) -> str:
        """Process a template by replacing variables."""
        template = self.get_template(template_id)
        if not template:
            raise ValueError(f"Template not found: {template_id}")

        prompt = template["prompt"]
        var_pattern = re.compile(r"\{\{([^}]+)\}\}")
        found_vars = var_pattern.findall(prompt)
        missing_vars = [var for var in found_vars if var not in variables]
        if missing_vars:
            raise ValueError(f"Missing variables: {', '.join(missing_vars)}")

        for var, value in variables.items():
            prompt = prompt.replace(f"{{{{{var}}}}}", value)
        return prompt

    def export_templates(self) -> Dict[str, Dict[str, Any]]:
        """Export all templates."""
        return self.templates.copy()

    def import_templates(self, templates: Dict[str, Dict[str, Any]]) -> int:
        """Import templates from a dictionary.

        Returns:
            The number of templates imported.
        """
        count = 0
        for template_id, template_data in templates.items():
            try:
                self.add_template(template_id, template_data)
                count += 1
            except ValueError:
                continue
        return count


__all__ = ["TemplateManager"]
