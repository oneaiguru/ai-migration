"""Utility for processing task templates.

This module loads templates from the `specs/templates` directory
and replaces variables marked with either `{{variable}}` or
`[VARIABLE]` style placeholders. It can return output as markdown or
plain text and provides helper functions for validation and listing
available templates.
"""

from __future__ import annotations

import os
import re
from typing import Dict, Iterable, List

from path_utils import repo_path

# Default directory for templates relative to the repository root
DEFAULT_TEMPLATE_DIR = str(repo_path("core", "specs", "templates"))


class TemplateNotFoundError(FileNotFoundError):
    """Raised when the requested template does not exist."""


class MissingTemplateVariableError(ValueError):
    """Raised when required variables are missing while processing a template."""


def _read_template_file(path: str) -> str:
    if not os.path.isfile(path):
        raise TemplateNotFoundError(f"Template not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def list_templates(directory: str = DEFAULT_TEMPLATE_DIR) -> List[str]:
    """Return a list of available template filenames without extension."""
    if not os.path.isdir(directory):
        return []
    entries = []
    for name in os.listdir(directory):
        if name.endswith((".md", ".txt")):
            entries.append(os.path.splitext(name)[0])
    return sorted(entries)


def load_template(template_name: str, directory: str = DEFAULT_TEMPLATE_DIR) -> str:
    """Load the raw contents of a template by name."""
    path = os.path.join(directory, f"{template_name}.md")
    if not os.path.isfile(path):
        path = os.path.join(directory, f"{template_name}.txt")
    return _read_template_file(path)


def _find_variables(template: str) -> Iterable[str]:
    """Yield variable names used in the template."""
    curly = re.findall(r"\{\{([^}]+)\}\}", template)
    bracket = re.findall(r"\[([A-Za-z0-9_-]+)\]", template)
    for var in curly + bracket:
        yield var


def validate_template(template: str) -> bool:
    """Basic validation to ensure a template contains at least one placeholder."""
    return any(_find_variables(template))


def _replace_variables(template: str, variables: Dict[str, str]) -> str:
    missing = []

    def replace(match: re.Match) -> str:
        var = match.group(1)
        if var in variables:
            return variables[var]
        missing.append(var)
        return f"[MISSING:{var}]"

    # Replace {{var}} style
    template = re.sub(r"\{\{([^}]+)\}\}", replace, template)
    # Replace [VAR] style
    template = re.sub(r"\[([A-Za-z0-9_-]+)\]", replace, template)

    if missing:
        raise MissingTemplateVariableError(
            f"Missing variables: {', '.join(sorted(set(missing)))}"
        )
    return template


def _strip_markdown(text: str) -> str:
    """Very small helper to remove basic markdown syntax for plain text output."""
    # remove code fences
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    # remove headers and formatting symbols
    text = re.sub(r"^[#>*\-]+", "", text, flags=re.MULTILINE)
    text = text.replace("**", "").replace("__", "")
    return text


def process_template(
    template_name: str,
    variables: Dict[str, str],
    output_format: str = "markdown",
    directory: str = DEFAULT_TEMPLATE_DIR,
) -> str:
    """Load and process a template with provided variables.

    Parameters
    ----------
    template_name: str
        Base filename of the template without extension.
    variables: Dict[str, str]
        Mapping of variable names to values used for substitution.
    output_format: str
        Either ``"markdown"`` (default) or ``"text"``.
    directory: str
        Directory containing template files.

    Returns
    -------
    str
        The processed template string.
    """
    raw = load_template(template_name, directory)
    if not validate_template(raw):
        raise ValueError(f"Template '{template_name}' does not contain placeholders")

    processed = _replace_variables(raw, variables)

    if output_format == "text":
        processed = _strip_markdown(processed)
    elif output_format != "markdown":
        raise ValueError("output_format must be 'markdown' or 'text'")
    return processed


__all__ = [
    "TemplateNotFoundError",
    "MissingTemplateVariableError",
    "list_templates",
    "load_template",
    "validate_template",
    "process_template",
]
