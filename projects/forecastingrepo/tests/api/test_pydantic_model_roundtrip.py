import pytest

fastapi = pytest.importorskip("fastapi")


def test_site_forecast_model_roundtrip(client_with_tmp_env):
    from src.sites.schema import SiteForecastPoint, RouteStopForecast

    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.5", "overflow_prob": "0.1", "pred_volume_m3": "12.3", "last_service_dt": "2024-08-01"},
        ],
        routes_rows=[],
        registry_map=None,
    )
    r = client.get("/api/sites/S1/forecast?window=2024-08-01:2024-08-10")
    assert r.status_code == 200
    rows = r.json()
    for row in rows:
        m = SiteForecastPoint.parse_obj(row)
        assert m.date and (m.fill_pct is None or isinstance(m.fill_pct, float))

    # RouteStopForecast roundtrip: fabricate minimal record matching model fields
    sample = {
        "site_id": "S1",
        "address": "Main St",
        "volume_m3": 3.0,
        "schedule": "AM",
        "fill_pct": 0.5,
        "overflow_prob": 0.1,
        "pred_volume_m3": 12.0,
        "last_service_dt": "2024-08-01",
    }
    rm = RouteStopForecast.parse_obj(sample)
    assert rm.site_id == "S1" and rm.volume_m3 == pytest.approx(3.0)

