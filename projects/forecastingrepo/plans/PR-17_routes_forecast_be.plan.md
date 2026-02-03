# Plan — PR‑17 Routes Forecast Endpoint (BE)

## Metadata
- Task: Add read‑only `GET /api/routes/{route_id}/forecast?date=YYYY-MM-DD[&format=json|csv]`
- Discovery: docs/Tasks/PR-17_routes_forecast_ui.md:1, docs/Tasks/BE_SCOUT_PR18_PR17.md:1
- Related: reviews/DEMO_FREEZE.md:1, docs/System/Review_Pack.md:1

## Desired End State
- New path returns per‑stop forecast for the given route and date; JSON or CSV via `?format=csv`.
- OpenAPI includes the new path/components; unit + Behave smokes green; curls documented.

### Key Discoveries
- scripts/api_app.py:1 — existing routes; add a forecast variant `/api/routes/{route_id}/forecast`.
- src/sites/schema.py:1 — add `RouteStopForecast` model.
- Data source: join route‑day recommendations with site/day forecast slice for date.

## What We’re NOT Doing
- No policy changes; no scheduling transforms; no persistence; demo‑slice only.

## Implementation Approach
- Create `src/sites/api_routes_forecast.py` router to encapsulate endpoint; include from `scripts/api_app.py`.
- Serve CSV using `csv.DictWriter` with headers matching UI expectations.

## Phase 0: Preconditions
- Determinism env; BASE from reviews/DEMO_FREEZE.md:1.

## Phase 1: Models — RouteStopForecast
### Changes Required
1. File: `src/sites/schema.py:1`
   - Add Pydantic model `RouteStopForecast`.

```commands
*** Begin Patch
*** Update File: src/sites/schema.py
@@
from typing import Optional
try:
    from pydantic import BaseModel
except Exception:
    BaseModel = object  # type: ignore

class RouteStopForecast(BaseModel):
    site_id: str
    address: Optional[str] = None
    volume_m3: Optional[float] = None
    schedule: Optional[str] = None
    fill_pct: Optional[float] = None
    overflow_prob: Optional[float] = None
    pred_volume_m3: Optional[float] = None
    last_service_dt: Optional[str] = None
*** End Patch
```

## Phase 2: Route — Self‑contained router module
### Changes Required
1. File: `src/sites/api_routes_forecast.py` (new)

```commands
*** Begin Patch
*** Add File: src/sites/api_routes_forecast.py
from __future__ import annotations
from fastapi import APIRouter, Query, HTTPException, Response
from typing import List, Optional
from datetime import datetime
import csv, io

from .schema import RouteStopForecast

router = APIRouter()

def _validate_date(date_s: str) -> str:
    try:
        datetime.strptime(date_s, "%Y-%m-%d")
        return date_s
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid date: {e}")

def _load_route_forecast_demo(route_id: str, date_s: str) -> List[RouteStopForecast]:
    # Minimal demo loader: return empty list; executor wires to existing route/stops + site/day forecast joins
    return []

@router.get("/api/routes/{route_id}/forecast")
def get_route_forecast(
    route_id: str,
    date: str,
    format: Optional[str] = Query(None, pattern="^(json|csv)$"),
):
    date_s = _validate_date(date)
    data = _load_route_forecast_demo(route_id, date_s)
    if (format or "json").lower() == "csv":
        buf = io.StringIO()
        fieldnames = [
            "site_id","address","volume_m3","schedule",
            "fill_pct","overflow_prob","pred_volume_m3","last_service_dt",
        ]
        writer = csv.DictWriter(buf, fieldnames=fieldnames)
        writer.writeheader()
        for p in data:
            writer.writerow({
                "site_id": p.site_id,
                "address": p.address,
                "volume_m3": p.volume_m3,
                "schedule": p.schedule,
                "fill_pct": p.fill_pct,
                "overflow_prob": p.overflow_prob,
                "pred_volume_m3": p.pred_volume_m3,
                "last_service_dt": p.last_service_dt,
            })
        return Response(content=buf.getvalue(), media_type="text/csv")
    # JSON array
    return [p.dict() if hasattr(p, "dict") else p for p in data]
*** End Patch
```

2. File: `scripts/api_app.py:1`
   - Include the new router.

```commands
# App instance pattern
apply_patch << 'PATCH'
*** Begin Patch
*** Update File: scripts/api_app.py
@@
 from fastapi import FastAPI
@@
 from src.sites.api_routes_forecast import router as routes_forecast_router
@@
 app = FastAPI()
@@
 app.include_router(routes_forecast_router)
*** End Patch
PATCH

# Top-level APIRouter pattern
apply_patch << 'PATCH'
*** Begin Patch
*** Update File: scripts/api_app.py
@@
 from fastapi import APIRouter
@@
 from src.sites.api_routes_forecast import router as routes_forecast_router
@@
 router = APIRouter()
@@
 router.include_router(routes_forecast_router)
*** End Patch
PATCH
```

## Phase 3: OpenAPI export
### Changes Required
1. File: `scripts/export_openapi.py:1` — ensure path/components surfaced if exporter is not auto‑discovery.

```commands
python scripts/export_openapi.py --write
python scripts/export_openapi.py --check
```

## Phase 4: Unit Tests
### Changes Required
1. File: `tests/api/test_api_routes_forecast.py` (new)

```commands
*** Begin Patch
*** Add File: tests/api/test_api_routes_forecast.py
from fastapi.testclient import TestClient
from scripts.api_app import app

client = TestClient(app)

def test_route_forecast_empty_ok():
    r = client.get("/api/routes/462/forecast?date=2024-08-03")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_route_forecast_csv_header():
    r = client.get("/api/routes/462/forecast?date=2024-08-03&format=csv")
    assert r.status_code == 200
    head = r.text.splitlines()[0]
    for k in ("site_id","fill_pct","overflow_prob"):
        assert k in head

def test_route_forecast_bad_date():
    r = client.get("/api/routes/462/forecast?date=bad")
    assert r.status_code == 400
*** End Patch
```

## Phase 5: Behave Smoke
### Changes Required
1. File: `specs/bdd/features/api_routes_forecast_smoke.feature` (new)

```commands
*** Begin Patch
*** Add File: specs/bdd/features/api_routes_forecast_smoke.feature
@smoke
Feature: Routes forecast API
  Scenario: Route forecast JSON
    When I GET "/api/routes/462/forecast?date=2024-08-03"
    Then the response code is 200
    And the response is a JSON array
*** End Patch
```

## Phase 6: Docs & CURLs
### Changes Required
1. File: `reviews/DEMO_FREEZE.md:1` — append two curls (JSON + CSV).
2. File: `reviews/NOTES/api.md:1` — paste outputs.

```commands
echo '\n# Route forecast (new)\nBASE="<BASE>"\ncurl -fsS "$BASE/api/routes/462/forecast?date=2024-08-03" | jq ".[0]"\ncurl -fsS "$BASE/api/routes/462/forecast?date=2024-08-03&format=csv" | head -n1' >> reviews/DEMO_FREEZE.md
```

## Tests & Validation
```commands
python scripts/export_openapi.py --write
pytest -q
behave --tags @smoke --no-capture --format progress
python scripts/export_openapi.py --check
```

## Rollback
```commands
git restore --source=HEAD --worktree --staged \
  src/sites/schema.py src/sites/api_routes_forecast.py \
  scripts/api_app.py scripts/export_openapi.py \
  tests/api/test_api_routes_forecast.py \
  specs/bdd/features/api_routes_forecast_smoke.feature
```

## Handoff
- Update: `docs/SESSION_HANDOFF.md:1` (what landed, curls captured)
- Package (canonical): `reviews/20251105/4_followup/outbound/backend_api_pack_YYYYMMDD.zip` (optional flat mirror under `reviews/ATTACH_REVIEWERS/backend_api/`).

