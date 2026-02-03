from fastapi.testclient import TestClient
from scripts.api_app import create_app


def test_openapi_includes_new_endpoints_and_components():
    app = create_app()
    c = TestClient(app)
    r = c.get("/openapi.json")
    assert r.status_code == 200
    schema = r.json()
    paths = schema.get("paths", {})
    assert "/api/sites/{site_id}/forecast" in paths
    assert "/api/routes/{route_id}/forecast" in paths
    comps = (schema.get("components", {}) or {}).get("schemas", {})
    assert "SiteForecastPoint" in comps
    assert "RouteStopForecast" in comps

