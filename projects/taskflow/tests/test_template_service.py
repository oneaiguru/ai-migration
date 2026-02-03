import json

import pytest

from src.services.template_service import (
    TemplateService,
    TemplateNotFoundError,
    MissingTemplateVariableError,
)


@pytest.fixture
def sample_files(tmp_path):
    # create two file templates
    d = tmp_path / "files"
    d.mkdir()
    (d / "hello.md").write_text("Hello {{name}}")
    (d / "bye.txt").write_text("Goodbye [NAME]")
    return str(d)


@pytest.fixture
def sample_db(tmp_path):
    data = {
        "number": {
            "display_name": "Number",
            "description": "",
            "prompt": "Number {{n}}",
            "categories": ["math"],
        }
    }
    path = tmp_path / "db.json"
    path.write_text(json.dumps(data))
    return str(path)


def test_load_sources(sample_files, sample_db):
    service = TemplateService(template_dir=sample_files, db_file=sample_db)
    names = [t.name for t in service.list_templates()]
    assert set(names) == {"hello", "bye", "number"}


def test_validation_and_extraction(sample_files):
    service = TemplateService(template_dir=sample_files, db_file="/nonexistent.json")
    tpl = service.get_template("hello")
    assert service.validate_template(tpl.prompt) is True
    assert service.extract_variables(tpl.prompt) == ["name"]


def test_rendering_errors(sample_files, sample_db):
    service = TemplateService(template_dir=sample_files, db_file=sample_db)
    assert service.render_template("number", {"n": "5"}) == "Number 5"
    with pytest.raises(MissingTemplateVariableError):
        service.render_template("number", {})
    with pytest.raises(TemplateNotFoundError):
        service.render_template("missing", {})


def test_search_and_categories(sample_db):
    service = TemplateService(template_dir="/tmp/none", db_file=sample_db)
    assert service.get_categories() == ["math"]
    results = service.search_templates(query="num")
    assert len(results) == 1 and results[0].name == "number"


def test_import_export(tmp_path, sample_db):
    service1 = TemplateService(template_dir="/tmp/none", db_file=sample_db)
    exported = service1.export_templates()
    new_file = tmp_path / "new.json"
    service2 = TemplateService(template_dir="/tmp/none", db_file=str(new_file))
    count = service2.import_templates(exported)
    assert count == 1
    assert service2.get_template("number") is not None
