import pytest

fastapi = pytest.importorskip("fastapi")
from fastapi.testclient import TestClient  # type: ignore


@pytest.mark.spec_id("API-001")
def test_metrics_endpoint_smoke():
    from scripts.api_app import create_app
    app = create_app()
    c = TestClient(app)
    r = c.get("/api/metrics")
    assert r.status_code in (200, 404)
    if r.status_code == 200:
        data = r.json()
        assert "region_wape" in data and "district_wape" in data
        assert "demo_default_date" in data


@pytest.mark.spec_id("API-002")
def test_sites_and_routes_smoke():
    from scripts.api_app import create_app
    app = create_app()
    c = TestClient(app)
    rs = c.get("/api/sites")
    assert rs.status_code == 200
    sites = rs.json()
    assert isinstance(sites, list)
    if sites:
        row = sites[0]
        assert {"site_id", "district", "date", "fill_pct", "overflow_prob", "pred_volume_m3"}.issubset(row.keys())
    assert "X-Total-Count" in rs.headers
    assert "X-Unmapped-Sites" in rs.headers
    rr = c.get("/api/routes", params={"date": "2025-11-04", "policy": "strict"})
    assert rr.status_code == 200
    routes = rr.json()
    assert isinstance(routes, list)
    if routes:
        row = routes[0]
        assert {"site_id", "date", "policy", "visit", "fill_pct", "overflow_prob", "volume_m3", "schedule", "last_service_dt"}.issubset(row.keys())


@pytest.mark.spec_id("API-003")
def test_openapi_schema_includes_routes_component():
    from scripts.api_app import create_app

    app = create_app()
    c = TestClient(app)
    resp = c.get("/openapi.json")
    assert resp.status_code == 200
    schema = resp.json()
    assert "/api/routes" in schema.get("paths", {})
