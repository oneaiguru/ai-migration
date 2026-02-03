# Architectural Decision Record — ADR-0005: API Contracts & OpenAPI v1

**Status:** Accepted (2025-11-05)
**Owners:** Backend Platform

## Context
Reviewers need a stable, documented API contract for `/api/*` endpoints. Current FastAPI handlers return untyped dicts/lists and CI does not validate an OpenAPI document.

## Decision
- Annotate FastAPI routes with Pydantic response models reflecting JSON/CSV payloads.
- Export OpenAPI schema via `docs/api/openapi.json` using a versioned script (`scripts/export_openapi.py`).
- Enforce schema freshness in CI (`python scripts/export_openapi.py --check`) along with smoke Behave scenarios.

## Consequences
- Reviewers and downstream clients can inspect contracts without reading code.
- API changes become diffable via OpenAPI; mismatches trip CI early.
- Provides groundwork for future SDK or docs automation.

## References
- `scripts/api_app.py`
- `docs/api/openapi.json`
- Coordinator decision memo (2025-11-05)
