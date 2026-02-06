import pytest

fastapi = pytest.importorskip("fastapi")


def test_sites_empty_csv_header_only(client_with_tmp_env):
    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.5", "overflow_prob": "0.1", "pred_volume_m3": "12.3"},
        ],
        routes_rows=[],
        registry_map={"S1": "D-A"},
    )
    r = client.get("/api/sites", params={"date": "1999-01-01", "format": "csv"})
    assert r.status_code == 200
    lines = r.text.splitlines()
    assert lines[0] == "site_id,district,date,fill_pct,overflow_prob,pred_volume_m3"
    assert len(lines) == 1

