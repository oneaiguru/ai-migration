# Plan — PR‑18 Site Forecast API (BE)

## Metadata
- Task: Add read‑only `GET /api/sites/{site_id}/forecast`
- Discovery: docs/Tasks/PR-18_site_forecast_be.md:1, docs/Tasks/BE_SCOUT_PR18_PR17.md:1
- Related SOP/Runbooks: docs/SOP/review-process.md:1, reviews/DEMO_FREEZE.md:1, docs/System/Review_Pack.md:1, docs/adr/DECISIONS_INDEX.md:1

## Desired End State
- New API path returns an array of daily forecast points for a site for a given window or default last 7 days from `metrics.demo_default_date`.
- OpenAPI includes the new path + typed component; unit + Behave smokes green; curls captured in review notes.

### Key Discoveries
- scripts/api_app.py:1 — FastAPI app with existing read‑only routes; add a new router include or inline route.
- src/sites/schema.py:1 — central models; add `SiteForecastPoint`.
- scripts/export_openapi.py:1 — exports spec; if it imports the FastAPI app, new routes auto‑appear (else extend allowlist).
- tests/api/* — patterns for API testing with TestClient.
- specs/bdd/features/api_*_smoke.feature:1 — smoke structure to reuse.

## What We’re NOT Doing
- No baseline/forecast behavior changes; no DB; demo slice only; no changes to existing endpoints’ shapes.

## Implementation Approach
- Create a self‑contained router module for the endpoint to minimize invasive edits, then include it from `scripts/api_app.py`.
- Support JSON and CSV (`?format=csv`).
- Parse window via `window=YYYY-MM-DD:YYYY-MM-DD` or `days=int` (default 7 from metrics).
- Load demo data by reusing the same site/day forecast CSV the `/api/sites` logic uses; return `200 []` if no rows.

## Phase 0: Preconditions
- Determinism: `PYTHONHASHSEED=0 TZ=UTC LC_ALL=C.UTF-8 MPLBACKEND=Agg`.
- Confirm BASE for curls in reviews/DEMO_FREEZE.md:1.

## Phase 1: Models — SiteForecastPoint
### Changes Required
1. File: `src/sites/schema.py:1`
   - Add Pydantic model `SiteForecastPoint`.
   - If imports missing: `from typing import Optional`, `from pydantic import BaseModel`.

```commands
*** Begin Patch
*** Update File: src/sites/schema.py
@@
from typing import Optional
try:
    from pydantic import BaseModel
except Exception:  # fallback if pydantic already imported elsewhere
    BaseModel = object  # type: ignore

class SiteForecastPoint(BaseModel):
    date: str
    pred_volume_m3: Optional[float] = None
    fill_pct: Optional[float] = None
    overflow_prob: Optional[float] = None
    last_service_dt: Optional[str] = None
*** End Patch
```

## Phase 2: Route — Self‑contained router module (recommended)
### Changes Required
1. File: `src/sites/api_site_forecast.py` (new)
   - Define `APIRouter` with `GET /api/sites/{site_id}/forecast`.
   - Return JSON array of `SiteForecastPoint` or CSV (`?format=csv`).
   - Implement simple window parsing; delegate data loading to a small helper that reads demo CSV slice.

```commands
*** Begin Patch
*** Add File: src/sites/api_site_forecast.py
from __future__ import annotations
from fastapi import APIRouter, Query, HTTPException, Response
from typing import List, Optional
from datetime import datetime, timedelta
import csv, io

from .schema import SiteForecastPoint

router = APIRouter()

def _parse_window(window: Optional[str], days: Optional[int], default_end: str) -> tuple[str, str]:
    if window:
        try:
            start_s, end_s = window.split(":", 1)
            datetime.strptime(start_s, "%Y-%m-%d")
            datetime.strptime(end_s, "%Y-%m-%d")
            return start_s, end_s
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"invalid window: {e}")
    d_end = datetime.strptime(default_end, "%Y-%m-%d")
    d_days = int(days or 7)
    d_start = d_end - timedelta(days=d_days - 1)
    return d_start.strftime("%Y-%m-%d"), d_end.strftime("%Y-%m-%d")

def _load_site_forecast_demo(site_id: str, start_s: str, end_s: str) -> List[SiteForecastPoint]:
    # Minimal demo loader: return empty list; executor may wire to existing CSV used by /api/sites
    # Replace with integration to your forecast slice for the selected window.
    return []

@router.get("/api/sites/{site_id}/forecast", response_model=List[SiteForecastPoint])
def get_site_forecast(
    site_id: str,
    window: Optional[str] = None,
    days: Optional[int] = 7,
    format: Optional[str] = Query(None, pattern="^(json|csv)$"),
):
    # Import here to avoid circular imports
    try:
        from scripts.api_app import get_demo_default_date  # type: ignore
        default_end = get_demo_default_date()
    except Exception:
        default_end = "2024-08-03"
    start_s, end_s = _parse_window(window, days, default_end)
    data = _load_site_forecast_demo(site_id, start_s, end_s)
    if (format or "json").lower() == "csv":
        buf = io.StringIO()
        writer = csv.DictWriter(buf, fieldnames=["date","pred_volume_m3","fill_pct","overflow_prob","last_service_dt"])
        writer.writeheader()
        for p in data:
            writer.writerow({
                "date": p.date,
                "pred_volume_m3": p.pred_volume_m3,
                "fill_pct": p.fill_pct,
                "overflow_prob": p.overflow_prob,
                "last_service_dt": p.last_service_dt,
            })
        return Response(content=buf.getvalue(), media_type="text/csv")
    return data
*** End Patch
```

2. File: `scripts/api_app.py:1`
   - Include the new router (choose one that fits your file: app vs router pattern).

```commands
# Option A (FastAPI app instance present):
apply_patch << 'PATCH'
*** Begin Patch
*** Update File: scripts/api_app.py
@@
 from fastapi import FastAPI
@@
 from src.sites.api_site_forecast import router as site_forecast_router
@@
 app = FastAPI()
@@
 app.include_router(site_forecast_router)
*** End Patch
PATCH

# Option B (top-level APIRouter pattern):
apply_patch << 'PATCH'
*** Begin Patch
*** Update File: scripts/api_app.py
@@
 from fastapi import APIRouter
@@
 from src.sites.api_site_forecast import router as site_forecast_router
@@
 router = APIRouter()
@@
 router.include_router(site_forecast_router)
*** End Patch
PATCH
```

## Phase 3: OpenAPI export
### Changes Required
1. File: `scripts/export_openapi.py:1`
   - If the exporter constructs the FastAPI app and dumps `app.openapi()`, no change is needed. If it whitelists paths/components, add the new path and `SiteForecastPoint`.

```commands
python scripts/export_openapi.py --write
python scripts/export_openapi.py --check
```

## Phase 4: Unit Tests
### Changes Required
1. File: `tests/api/test_site_forecast_v1.py` (new)

```commands
*** Begin Patch
*** Add File: tests/api/test_site_forecast_v1.py
from fastapi.testclient import TestClient
from scripts.api_app import app

client = TestClient(app)

def test_site_forecast_empty_ok():
    r = client.get("/api/sites/S001/forecast?window=2024-08-01:2024-08-07")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_site_forecast_bad_window():
    r = client.get("/api/sites/S001/forecast?window=bad:date")
    assert r.status_code == 400

def test_site_forecast_csv_header():
    r = client.get("/api/sites/S001/forecast?days=7&format=csv")
    assert r.status_code == 200
    head = r.text.splitlines()[0]
    assert "date" in head and "fill_pct" in head and "overflow_prob" in head
*** End Patch
```

## Phase 5: Behave Smoke
### Changes Required
1. File: `specs/bdd/features/site_forecast_smoke.feature` (new)

```commands
*** Begin Patch
*** Add File: specs/bdd/features/site_forecast_smoke.feature
@smoke
Feature: Site forecast API
  Scenario: Get site forecast slice
    When I GET "/api/sites/S001/forecast?window=2024-08-01:2024-08-07"
    Then the response code is 200
    And the response is a JSON array
*** End Patch
```

## Phase 6: Docs & CURLs
### Changes Required
1. File: `reviews/DEMO_FREEZE.md:1` — append a curl block for the new path.
2. File: `reviews/NOTES/api.md:1` — paste example outputs.

```commands
echo '\n# Site forecast (new)\nBASE="<BASE>"\ncurl -fsS "$BASE/api/sites/S001/forecast?window=2024-08-01:2024-08-07" | jq ".[0]"' >> reviews/DEMO_FREEZE.md
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
  src/sites/schema.py src/sites/api_site_forecast.py \
  scripts/api_app.py scripts/export_openapi.py \
  tests/api/test_site_forecast_v1.py \
  specs/bdd/features/site_forecast_smoke.feature
```

## Handoff
- Update: `docs/SESSION_HANDOFF.md:1` with commands run, outputs, next step (PR‑17).
- Package (canonical): `reviews/20251105/4_followup/outbound/backend_api_pack_YYYYMMDD.zip` (or optional flat mirror under `reviews/ATTACH_REVIEWERS/backend_api/`).

