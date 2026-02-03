# TASK-37: OpenAPI Export

**Complexity**: Easy | **Model**: Haiku OK | **Est**: 15min

## Goal
Export OpenAPI spec from FastAPI app for documentation.

## Code Changes

### 1. File: scripts/export_openapi.py (NEW)

```python
#!/usr/bin/env python3
"""
Export OpenAPI spec from FastAPI app.

Usage:
    python scripts/export_openapi.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.api_app import app


def main():
    openapi = app.openapi()

    # Ensure docs dir exists
    docs_dir = Path('docs/api')
    docs_dir.mkdir(parents=True, exist_ok=True)

    # Write openapi.json
    output_path = docs_dir / 'openapi.json'
    output_path.write_text(json.dumps(openapi, indent=2))
    print(f"✓ Exported OpenAPI spec to {output_path}")


if __name__ == '__main__':
    main()
```

## Tests

```python
# tests/test_openapi_export.py

import json
from pathlib import Path

def test_openapi_export():
    from scripts.export_openapi import main
    import tempfile
    import os

    orig_dir = os.getcwd()
    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            os.chdir(tmpdir)
            Path('docs/api').mkdir(parents=True, exist_ok=True)

            main()

            assert Path('docs/api/openapi.json').exists()
            spec = json.loads(Path('docs/api/openapi.json').read_text())
            assert 'openapi' in spec
            assert 'paths' in spec
    finally:
        os.chdir(orig_dir)
```

## Acceptance Criteria
- [ ] Script runs without errors
- [ ] openapi.json created with valid JSON
- [ ] Spec includes all endpoints from api_app.py
- [ ] Can import openapi spec into documentation tools

---

## On Completion

1. Run: `python scripts/export_openapi.py`
2. Verify docs/api/openapi.json exists
3. Run tests: `pytest tests/test_openapi_export.py -v`
4. Update `/Users/m/ai/progress.md`: Change TASK-37 from 🔴 TODO to 🟢 DONE
5. Commit: "Implement TASK-37: OpenAPI export"
