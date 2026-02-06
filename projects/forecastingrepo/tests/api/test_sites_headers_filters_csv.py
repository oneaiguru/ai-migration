import csv
import pytest

fastapi = pytest.importorskip("fastapi")


@pytest.mark.spec_id("API-SITES-HEADERS-CSV-JSON")
def test_sites_headers_and_paging_json(client_with_tmp_env):
    # Two rows for the same date; one mapped, one unmapped
    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.5", "overflow_prob": "0.1", "pred_volume_m3": "12.3"},
            {"site_id": "S2", "date": "2024-08-03", "fill_pct": "0.8", "overflow_prob": "0.2", "pred_volume_m3": "15.0"},
        ],
        routes_rows=[],
        registry_map={"S1": "D-A"},
    )
    r = client.get("/api/sites", params={"date": "2024-08-03", "limit": 2, "offset": 0})
    assert r.status_code == 200
    assert r.headers.get("X-Total-Count") == "2"
    assert r.headers.get("X-Unmapped-Sites") == "1"  # S2 unmapped
    payload = r.json()
    assert isinstance(payload, list) and len(payload) == 2
    row = payload[0]
    assert {"site_id","district","date","fill_pct","overflow_prob","pred_volume_m3"}.issubset(row.keys())


@pytest.mark.spec_id("API-SITES-CSV-HEADER")
def test_sites_csv_headers_and_count_header(client_with_tmp_env):
    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.5", "overflow_prob": "0.1", "pred_volume_m3": "12.3"},
            {"site_id": "S2", "date": "2024-08-03", "fill_pct": "0.8", "overflow_prob": "0.2", "pred_volume_m3": "15.0"},
        ],
        routes_rows=[],
        registry_map={"S1": "D-A"},
    )
    r = client.get("/api/sites", params={"date": "2024-08-03", "limit": 2, "format": "csv"})
    assert r.status_code == 200
    # CSV header exactness
    head = r.text.splitlines()[0]
    assert head == "site_id,district,date,fill_pct,overflow_prob,pred_volume_m3"
    # includes total count header
    assert r.headers.get("X-Total-Count") == "2"


@pytest.mark.spec_id("API-SITES-FILTERS")
def test_sites_filters_date_and_district(client_with_tmp_env):
    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.5", "overflow_prob": "0.1", "pred_volume_m3": "12.3"},
            {"site_id": "S2", "date": "2024-08-03", "fill_pct": "0.8", "overflow_prob": "0.2", "pred_volume_m3": "15.0"},
            {"site_id": "S1", "date": "2024-08-04", "fill_pct": "0.6", "overflow_prob": "0.1", "pred_volume_m3": "12.9"},
        ],
        routes_rows=[],
        registry_map={"S1": "D-A"},
    )
    r = client.get("/api/sites", params={"date": "2024-08-03", "district": "D-A", "limit": 10})
    assert r.status_code == 200
    payload = r.json()
    assert all(p.get("site_id") == "S1" for p in payload)
    assert all(p.get("district") == "D-A" for p in payload)
    # total count reflects filter
    assert r.headers.get("X-Total-Count") == str(len(payload))

