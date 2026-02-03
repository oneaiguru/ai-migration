#!/usr/bin/env python3
"""
Lightweight validation for structured_json_handoff outputs.

- Ensures all call_*_structured_input_signals.json files exist for 1..20
- Checks required top-level keys and preprocessor_signals structure
- Prints call_type distribution and any missing files/keys
"""

import json
from collections import Counter
from pathlib import Path

BASE = Path(__file__).resolve().parent
OUTPUT = BASE / "output"


def validate_file(path: Path):
    data = json.loads(path.read_text(encoding="utf-8"))
    errors = []

    # Required top-level keys
    for key in ("call_metadata", "utterances", "pre_calculated", "preprocessor_signals"):
        if key not in data:
            errors.append(f"missing key: {key}")

    ps = data.get("preprocessor_signals", {})
    ctx = ps.get("call_context", {})
    extracted = ps.get("extracted_data", {})
    meta = ps.get("_meta", {})

    if "call_type" not in ctx:
        errors.append("call_context.call_type missing")
    if "is_tire_call" not in ctx or "is_wheel_call" not in ctx:
        errors.append("call_context missing is_tire_call/is_wheel_call")
    if "order_numbers" not in extracted:
        errors.append("extracted_data.order_numbers missing")
    if "version" not in meta:
        errors.append("_meta.version missing")

    call_type = ctx.get("call_type")
    return errors, call_type


def main():
    missing = []
    call_types = Counter()
    validation_errors = []

    for i in range(1, 21):
        name = f"call_{i:02d}_structured_input_signals.json"
        path = OUTPUT / name
        if not path.exists():
            missing.append(name)
            continue
        errors, ct = validate_file(path)
        if errors:
            validation_errors.append((name, errors))
        if ct:
            call_types[ct] += 1

    if missing:
        print("Missing files:")
        for m in missing:
            print(f" - {m}")
    else:
        print("All 20 files present.")

    if validation_errors:
        print("\nValidation errors:")
        for name, errs in validation_errors:
            print(f"{name}:")
            for e in errs:
                print(f"  - {e}")
    else:
        print("No structural validation errors.")

    print("\nCall type distribution:")
    for ct, count in sorted(call_types.items()):
        print(f" - {ct}: {count}")


if __name__ == "__main__":
    main()
