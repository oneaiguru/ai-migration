from __future__ import annotations

import pytest


def test_mytko_adapter_uses_route_volume(client_with_tmp_env):
    client, _ = client_with_tmp_env()
    resp = client.get(
        "/api/mytko/forecast",
        params={"site_id": "S1", "start_date": "2024-08-03", "end_date": "2024-08-03", "vehicle_volume": 12},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    point = data[0]
    assert point["vehicleVolume"] == 12
    assert point["overallVolume"] == pytest.approx(3.5)
    assert point["isFact"] is False
    assert point["isEmpty"] is False


def test_mytko_adapter_fallback_to_mass_when_route_volume_missing(client_with_tmp_env):
    client, _ = client_with_tmp_env()
    resp = client.get("/api/mytko/forecast", params={"site_id": "S2", "start_date": "2024-08-03", "end_date": "2024-08-03"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    point = data[0]
    # pred_volume_m3=15 → fallback to 15 m3
    assert point["overallVolume"] == pytest.approx(15.0)


def test_mytko_adapter_404_when_no_rows(client_with_tmp_env):
    client, _ = client_with_tmp_env()
    resp = client.get("/api/mytko/forecast", params={"site_id": "UNKNOWN", "start_date": "2024-08-03", "end_date": "2024-08-03"})
    assert resp.status_code == 404


def test_mytko_site_accuracy_returns_slice(accuracy_testbed):
    client = accuracy_testbed["make_client"]()
    resp = client.get(
        "/api/mytko/site_accuracy",
        params={"site_id": "S100", "start_date": "2024-08-01", "end_date": "2024-08-07"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["site_id"] == "S100"
    assert data["days"] == 7
    assert data["actual_m3"] == pytest.approx(100.0)
    assert data["forecast_m3"] == pytest.approx(110.0)
    assert data["wape"] == pytest.approx(0.1)


def test_mytko_site_accuracy_returns_zeroes_when_missing(accuracy_testbed):
    client = accuracy_testbed["make_client"]()
    resp = client.get(
        "/api/mytko/site_accuracy",
        params={"site_id": "UNKNOWN", "start_date": "2024-08-01", "end_date": "2024-08-07"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["site_id"] == "UNKNOWN"
    assert data["wape"] is None
    assert data["actual_m3"] == pytest.approx(0.0)
    assert data["forecast_m3"] == pytest.approx(0.0)


def test_mytko_site_accuracy_falls_back_to_site_rows_when_month_empty(accuracy_testbed):
    client = accuracy_testbed["make_client"]()
    resp = client.get(
        "/api/mytko/site_accuracy",
        params={"site_id": "S100", "start_date": "2024-09-01", "end_date": "2024-09-07"},
    )
    assert resp.status_code == 200
    data = resp.json()
    # Even though September has no explicit row in the fixture, we still surface the latest site totals.
    assert data["actual_m3"] == pytest.approx(100.0)
    assert data["forecast_m3"] == pytest.approx(110.0)
    assert data["wape"] == pytest.approx(0.1)
