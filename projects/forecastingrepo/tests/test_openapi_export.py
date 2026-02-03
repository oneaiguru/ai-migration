import json
from pathlib import Path
import tempfile
import os


def test_openapi_export():
    """Test that the OpenAPI export script generates a valid spec."""
    from scripts.export_openapi import main

    orig_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            Path('docs/api').mkdir(parents=True, exist_ok=True)

            # Run the export (with default args pointing to our temp dir)
            main(["--output", "docs/api/openapi.json", "--write"])

            # Verify file exists
            assert Path('docs/api/openapi.json').exists()

            # Verify it contains valid JSON
            spec = json.loads(Path('docs/api/openapi.json').read_text())
            assert 'openapi' in spec
            assert 'paths' in spec
            assert 'components' in spec
            assert isinstance(spec['paths'], dict)
            assert isinstance(spec['components'], dict)

    finally:
        os.chdir(orig_dir)


def test_openapi_spec_has_endpoints():
    """Test that the OpenAPI spec includes endpoints from api_app."""
    spec_path = Path('docs/api/openapi.json')
    assert spec_path.exists(), "OpenAPI spec not found at docs/api/openapi.json"

    spec = json.loads(spec_path.read_text())
    paths = spec.get('paths', {})

    # Verify key endpoints are present
    assert '/api/mytko/rolling_forecast' in paths, "Missing rolling_forecast endpoint"
    assert '/api/mytko/districts' in paths, "Missing districts endpoint"
    assert '/api/mytko/rolling_forecast/by_district' in paths, "Missing by_district endpoint"


def test_openapi_spec_has_schemas():
    """Test that the OpenAPI spec includes required schemas."""
    spec_path = Path('docs/api/openapi.json')
    spec = json.loads(spec_path.read_text())
    schemas = spec.get('components', {}).get('schemas', {})

    # Verify key schemas are present
    assert len(schemas) > 0, "No schemas defined in OpenAPI spec"


def test_openapi_export_idempotent():
    """Test that running export_openapi.py multiple times produces the same output."""
    from scripts.export_openapi import main

    orig_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            Path('docs/api').mkdir(parents=True, exist_ok=True)

            # Run once
            main(["--output", "docs/api/openapi.json", "--write"])
            spec1 = Path('docs/api/openapi.json').read_text()

            # Run again
            main(["--output", "docs/api/openapi.json", "--write"])
            spec2 = Path('docs/api/openapi.json').read_text()

            # Should be identical
            assert spec1 == spec2, "OpenAPI spec is not idempotent"

    finally:
        os.chdir(orig_dir)
