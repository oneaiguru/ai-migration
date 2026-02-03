#!/usr/bin/env python3
"""Export or validate the FastAPI OpenAPI specification."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.api_app import create_app

DEFAULT_SPEC_PATH = Path('docs/api/openapi.json')


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Export the FastAPI OpenAPI schema")
    parser.add_argument(
        "--output",
        default=str(DEFAULT_SPEC_PATH),
        help="Destination path for the OpenAPI document (default: docs/api/openapi.json)",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Do not write; exit with 1 if the generated spec differs from --output",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Explicitly write the spec to --output (default behaviour)",
    )
    return parser


def generate_spec() -> str:
    app = create_app()
    schema = app.openapi()
    return json.dumps(schema, indent=2, sort_keys=True) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    output_path = Path(args.output)
    spec_text = generate_spec()

    if args.check:
        if not output_path.exists():
            parser.error(f"Spec file {output_path} does not exist; run without --check first")
        current = output_path.read_text(encoding="utf-8")
        if current != spec_text:
            sys.stderr.write("OpenAPI spec is out of date; run python scripts/export_openapi.py --write\n")
            return 1
        return 0

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(spec_text, encoding="utf-8")
    if args.write:
        # keep default behaviour but stay silent if --write not passed
        print(f"Wrote OpenAPI spec to {output_path}")
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
