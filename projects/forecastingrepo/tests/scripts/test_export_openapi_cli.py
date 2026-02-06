import json
from pathlib import Path

from scripts.export_openapi import main as openapi_main


def test_export_openapi_write_and_check(tmp_path, monkeypatch):
    out = tmp_path / "openapi.json"
    # Write spec
    rc = openapi_main(["--output", str(out), "--write"])
    assert rc == 0 and out.exists()
    good = out.read_text(encoding="utf-8")

    # Check passes
    rc2 = openapi_main(["--output", str(out), "--check"])
    assert rc2 == 0

    # Corrupt file and ensure --check fails (returns 1)
    out.write_text("{}\n", encoding="utf-8")
    rc3 = openapi_main(["--output", str(out), "--check"])
    assert rc3 == 1

