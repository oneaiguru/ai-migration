"""Tests for the template management system."""

import json
import tempfile
from pathlib import Path

import pytest
from template_system import TemplateManager


@pytest.fixture
def sample_templates():
    """Sample templates for testing."""
    return {
        "react-component": {
            "version": "1.0",
            "display_name": "React Component",
            "description": "Implement a React functional component",
            "categories": ["frontend", "component"],
            "ai_level": "L5",
            "prompt": "Create a React component named {{componentName}} with props {{props}}",
        },
        "api-endpoint": {
            "version": "1.2",
            "display_name": "API Endpoint",
            "description": "Implement a REST API endpoint",
            "categories": ["backend", "api"],
            "ai_level": "L4",
            "prompt": "Create an API endpoint for {{resource}} with method {{method}}",
        },
    }


@pytest.fixture
def template_file(sample_templates):
    """Create a temporary template file for testing."""
    with tempfile.NamedTemporaryFile(mode="w+", suffix=".json", delete=False) as f:
        json.dump(sample_templates, f)
    try:
        yield f.name
    finally:
        Path(f.name).unlink()


def test_load_templates(template_file, sample_templates):
    """Test loading templates from a file."""
    manager = TemplateManager(template_file)
    assert manager.templates == sample_templates


def test_get_template(template_file, sample_templates):
    """Test getting a specific template."""
    manager = TemplateManager(template_file)
    template = manager.get_template("react-component")
    assert template == sample_templates["react-component"]

    assert manager.get_template("nonexistent") is None


def test_add_template(template_file):
    """Test adding a new template."""
    manager = TemplateManager(template_file)

    new_template = {
        "version": "1.0",
        "display_name": "New Template",
        "description": "Description",
        "prompt": "Prompt content",
    }
    manager.add_template("new-template", new_template)

    assert "new-template" in manager.templates
    assert manager.templates["new-template"]["display_name"] == "New Template"
    assert manager.templates["new-template"]["categories"] == []
    assert manager.templates["new-template"]["ai_level"] == ""

    with pytest.raises(ValueError):
        manager.add_template("invalid", {"version": "1.0"})


def test_delete_template(template_file):
    """Test deleting a template."""
    manager = TemplateManager(template_file)

    assert manager.delete_template("react-component") is True
    assert "react-component" not in manager.templates

    assert manager.delete_template("nonexistent") is False


def test_list_templates(template_file):
    """Test listing all templates."""
    manager = TemplateManager(template_file)
    templates = manager.list_templates()
    assert len(templates) == 2
    assert any(t["id"] == "react-component" for t in templates)
    assert any(t["id"] == "api-endpoint" for t in templates)


def test_get_categories(template_file):
    """Test getting all categories."""
    manager = TemplateManager(template_file)
    categories = manager.get_categories()
    assert categories == {"frontend", "component", "backend", "api"}


def test_search_templates(template_file):
    """Test searching templates."""
    manager = TemplateManager(template_file)

    results = manager.search_templates(query="React")
    assert len(results) == 1
    assert results[0]["id"] == "react-component"

    results = manager.search_templates(category="api")
    assert len(results) == 1
    assert results[0]["id"] == "api-endpoint"

    results = manager.search_templates(ai_level="L4")
    assert len(results) == 1
    assert results[0]["id"] == "api-endpoint"

    results = manager.search_templates(query="API", category="backend")
    assert len(results) == 1
    assert results[0]["id"] == "api-endpoint"

    results = manager.search_templates(query="nonexistent")
    assert len(results) == 0


def test_process_template(template_file):
    """Test processing a template with variables."""
    manager = TemplateManager(template_file)

    result = manager.process_template(
        "react-component", {"componentName": "Button", "props": "{ label, onClick }"}
    )
    assert (
        result == "Create a React component named Button with props { label, onClick }"
    )

    with pytest.raises(ValueError):
        manager.process_template("react-component", {"componentName": "Button"})

    with pytest.raises(ValueError):
        manager.process_template("nonexistent", {})


def test_export_import_templates(template_file, sample_templates):
    """Test exporting and importing templates."""
    manager1 = TemplateManager(template_file)
    exported = manager1.export_templates()

    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
        new_file = f.name
    try:
        manager2 = TemplateManager(new_file)
        count = manager2.import_templates(exported)
        assert count == 2
        assert manager2.templates == sample_templates
    finally:
        Path(new_file).unlink()
