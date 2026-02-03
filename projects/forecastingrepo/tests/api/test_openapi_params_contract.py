from fastapi.testclient import TestClient
from scripts.api_app import create_app


def test_openapi_params_for_new_endpoints():
    c = TestClient(create_app())
    r = c.get("/openapi.json")
    assert r.status_code == 200
    schema = r.json()
    # site forecast
    sp = schema.get("paths", {}).get("/api/sites/{site_id}/forecast", {})
    assert sp and "get" in sp
    sparams = sp["get"].get("parameters", [])
    # expect window/days/format
    names = {p.get("name") for p in sparams}
    assert {"site_id","window","days","format"}.issubset(names)
    # format pattern
    fmt = [p for p in sparams if p.get("name") == "format"][0]
    schema_obj = fmt.get("schema", {})
    pattern = schema_obj.get("pattern") or ""
    assert "json" in pattern and "csv" in pattern
    # route forecast
    rp = schema.get("paths", {}).get("/api/routes/{route_id}/forecast", {})
    assert rp and "get" in rp
    rparams = rp["get"].get("parameters", [])
    rnames = {p.get("name") for p in rparams}
    assert {"route_id","date","format","policy"}.issubset(rnames)

