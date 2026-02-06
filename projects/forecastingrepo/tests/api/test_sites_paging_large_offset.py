import pytest

fastapi = pytest.importorskip("fastapi")


def test_sites_large_offset_header_and_empty_page(client_with_tmp_env):
    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.5", "overflow_prob": "0.1", "pred_volume_m3": "12.3"},
            {"site_id": "S2", "date": "2024-08-03", "fill_pct": "0.8", "overflow_prob": "0.2", "pred_volume_m3": "15.0"},
        ],
        routes_rows=[],
        registry_map={"S1": "D-A"},
    )
    r = client.get("/api/sites", params={"date": "2024-08-03", "limit": 10, "offset": 9999})
    assert r.status_code == 200
    assert r.headers.get("X-Total-Count") == "2"
    assert r.json() == []

    rc = client.get("/api/sites", params={"date": "2024-08-03", "format": "csv", "limit": 10, "offset": 9999})
    assert rc.status_code == 200
    # header only when empty
    assert rc.text.splitlines()[0] == "site_id,district,date,fill_pct,overflow_prob,pred_volume_m3"
    assert len(rc.text.splitlines()) == 1

