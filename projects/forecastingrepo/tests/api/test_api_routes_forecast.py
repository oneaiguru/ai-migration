from fastapi.testclient import TestClient
from scripts.api_app import create_app


def _client():
    return TestClient(create_app())


def test_route_forecast_empty_ok():
    c = _client()
    r = c.get("/api/routes/462/forecast?date=2024-08-03")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_route_forecast_csv_header():
    c = _client()
    r = c.get("/api/routes/462/forecast?date=2024-08-03&format=csv")
    assert r.status_code == 200
    head = r.text.splitlines()[0]
    assert head == "site_id,address,volume_m3,schedule,fill_pct,overflow_prob,pred_volume_m3,last_service_dt"


def test_route_forecast_bad_date():
    c = _client()
    r = c.get("/api/routes/462/forecast?date=bad")
    assert r.status_code == 400


def test_route_forecast_supports_showcase_policy():
    c = _client()
    r = c.get("/api/routes/462/forecast?date=2024-08-03&policy=showcase")
    assert r.status_code == 200
    assert r.json() == []  # demo does not partition by route_id


def test_route_forecast_csv_header_only_when_empty():
    c = _client()
    r = c.get("/api/routes/462/forecast?date=2024-08-03&format=csv")
    assert r.status_code == 200
    # For demo, no rows → only header
    lines = r.text.splitlines()
    assert len(lines) == 1


def test_route_forecast_invalid_format_falls_back_to_json():
    c = _client()
    r = c.get("/api/routes/462/forecast?date=2024-08-03&format=tsv")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_route_forecast_nonexistent_date_early_return():
    c = _client()
    r = c.get("/api/routes/462/forecast?date=2100-01-01")
    assert r.status_code == 200
    assert r.json() == []
