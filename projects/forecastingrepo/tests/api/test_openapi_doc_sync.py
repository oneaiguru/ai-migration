import pytest

fastapi = pytest.importorskip("fastapi")


def test_openapi_doc_in_sync_with_export(tmp_path, monkeypatch):
    # Compare app.openapi() to saved docs/api/openapi.json
    from scripts.export_openapi import generate_spec
    from pathlib import Path

    spec_generated = generate_spec()
    doc_path = Path("docs/api/openapi.json")
    assert doc_path.exists(), "OpenAPI file missing; run exporter first"
    spec_saved = doc_path.read_text(encoding="utf-8")
    assert spec_generated == spec_saved

