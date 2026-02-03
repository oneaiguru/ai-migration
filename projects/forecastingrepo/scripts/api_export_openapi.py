#!/usr/bin/env python3
"""
Export the FastAPI OpenAPI schema to docs/api/openapi.json.
"""
from __future__ import annotations

import json
from pathlib import Path

from scripts.api_app import create_app


def main() -> None:
    app = create_app()
    schema = app.openapi()
    out = Path("docs/api/openapi.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(schema, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote", out)


if __name__ == "__main__":
    main()
