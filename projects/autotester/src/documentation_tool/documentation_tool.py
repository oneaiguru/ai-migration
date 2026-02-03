"""Compatibility shim for documentation tool imports in tests."""

import importlib.util
from pathlib import Path

_impl_path = Path(__file__).resolve().parents[2] / "autotester" / "src" / "documentation_tool" / "documentation_tool.py"
_spec = importlib.util.spec_from_file_location("autotester_doc_tool_impl", _impl_path)
_module = importlib.util.module_from_spec(_spec)
assert _spec and _spec.loader
_spec.loader.exec_module(_module)  # type: ignore

extract_module_docstring = _module.extract_module_docstring
extract_class_and_method_docstrings = _module.extract_class_and_method_docstrings
generate_markdown = _module.generate_markdown

__all__ = [
    "extract_module_docstring",
    "extract_class_and_method_docstrings",
    "generate_markdown",
]
