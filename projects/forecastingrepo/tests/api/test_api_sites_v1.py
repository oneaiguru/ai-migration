import csv
import glob
from pathlib import Path

import pytest
from fastapi.testclient import TestClient  # type: ignore

fastapi = pytest.importorskip("fastapi")


def _latest_sites_csv() -> Path | None:
    files = sorted(glob.glob("reports/sites_demo/daily_fill_*.csv"))
    return Path(files[-1]) if files else None


@pytest.mark.spec_id("API-SITES-001")
def test_sites_list_with_date_and_pagination():
    from scripts.api_app import create_app

    csvp = _latest_sites_csv()
    app = create_app()
    c = TestClient(app)

    date = None
    if csvp and csvp.exists():
        with csvp.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                date = rec.get("date")
                if date:
                    break

    params = {"limit": 5}
    if date:
        params["date"] = date
    res = c.get("/api/sites", params=params)
    assert res.status_code == 200
    # pagination header present
    assert "X-Total-Count" in res.headers
    assert "X-Unmapped-Sites" in res.headers
    # JSON array
    payload = res.json()
    assert isinstance(payload, list)
    if payload:
        row = payload[0]
        assert {"site_id", "district", "date", "fill_pct", "overflow_prob", "pred_volume_m3"}.issubset(row.keys())


@pytest.mark.spec_id("API-SITES-002")
def test_site_trajectory_known_site_or_404():
    from scripts.api_app import create_app

    csvp = _latest_sites_csv()
    site_id = None
    first = last = None
    if csvp and csvp.exists():
        dates = []
        with csvp.open(newline="", encoding="utf-8") as f:
            r = csv.DictReader(f)
            for rec in r:
                if not site_id:
                    site_id = rec.get("site_id")
                dates.append(rec.get("date"))
        dates = [d for d in dates if d]
        if dates:
            first, last = min(dates), max(dates)

    app = create_app()
    c = TestClient(app)

    if site_id and first and last:
        res = c.get(f"/api/site/{site_id}/trajectory", params={"start": first, "end": last})
        assert res.status_code == 200
        traj = res.json()
        assert isinstance(traj, list)
        if traj:
            point = traj[0]
            assert {"site_id", "date", "fill_pct", "overflow_prob", "pred_volume_m3"}.issubset(point.keys())
    else:
        res = c.get("/api/site/UNKNOWN/trajectory", params={"start": "2024-01-01", "end": "2024-01-07"})
        assert res.status_code in (404, 200)
