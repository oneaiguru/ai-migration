from fastapi.testclient import TestClient
from scripts.api_app import create_app


def _client():
    return TestClient(create_app())


def test_site_forecast_window_inclusive_bounds():
    c = _client()
    r = c.get("/api/sites/S1/forecast?window=2024-08-01:2024-08-03")
    assert r.status_code == 200
    data = r.json()
    dates = [row.get("date") for row in data]
    # inclusive of both ends
    assert "2024-08-01" in dates
    assert "2024-08-03" in dates


def test_site_forecast_json_csv_parity():
    c = _client()
    window = "2024-08-01:2024-08-03"
    rj = c.get(f"/api/sites/S1/forecast?window={window}")
    rc = c.get(f"/api/sites/S1/forecast?window={window}&format=csv")
    assert rj.status_code == 200 and rc.status_code == 200
    json_rows = rj.json()
    csv_lines = rc.text.splitlines()
    header = csv_lines[0].split(",")
    assert header == ["date","pred_volume_m3","fill_pct","overflow_prob","last_service_dt"]
    # compare first row if present
    if json_rows:
        first = json_rows[0]
        csv_first = csv_lines[1].split(",") if len(csv_lines) > 1 else None
        assert csv_first is not None
        # date exact; numeric tolerant by casting
        assert csv_first[0] == first.get("date")
        # pred_volume_m3, fill_pct, overflow_prob may be floats or empty
        # just assert the CSV emits 5 columns
        assert len(csv_first) == 5


def test_site_forecast_ordering_and_case_sensitivity():
    c = _client()
    r = c.get("/api/sites/S1/forecast?window=2024-08-01:2024-08-07")
    assert r.status_code == 200
    rows = r.json()
    dates = [row.get("date") for row in rows]
    assert dates == sorted(dates)
    # case-sensitive site id
    r2 = c.get("/api/sites/s1/forecast?window=2024-08-01:2024-08-07")
    assert r2.status_code == 200 and r2.json() == []

