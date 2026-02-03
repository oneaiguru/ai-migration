# Spec Sync
- ID scheme: CLI-001, DAILY-002, MONTHLY-003, REG-004, QA-005, WIN-006, ...
- Sources:
  - `specs/bdd/features/*` -> @ID tags
  - `specs/unit-md/*` -> "Spec-ID: XYZ" or (ID) in title line
  - `tests/**/test_*.py` -> `@pytest.mark.spec_id("XYZ")`
- Output: `spec_registry/spec_index.yml`
- CI gate: fail if any ID is orphaned (missing in docs or tests).
