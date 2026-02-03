import csv
import pytest

fastapi = pytest.importorskip("fastapi")


@pytest.mark.spec_id("API-SITES-FILL-FROM-VOLUME-GATE-CSV")
def test_sites_fill_from_volume_gate_affects_csv_output(monkeypatch, client_with_tmp_env):
    monkeypatch.setenv("SITE_FILL_FROM_VOLUME", "1")
    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "SVolC", "date": "2024-08-03", "fill_pct": "0.0", "overflow_prob": "0.0", "pred_volume_m3": "0"},
        ],
        routes_rows=[
            {"site_id": "SVolC", "date": "2024-08-03", "policy": "strict", "visit": "1", "volume_m3": "1.1", "schedule": "AM"},
        ],
        registry_map={},
    )
    r = client.get("/api/sites", params={"date": "2024-08-03", "format": "csv", "limit": 10})
    assert r.status_code == 200
    assert r.headers.get("X-Total-Count") == "1"
    lines = r.text.splitlines()
    assert lines[0] == "site_id,district,date,fill_pct,overflow_prob,pred_volume_m3"
    row = next(csv.DictReader(lines))
    assert pytest.approx(float(row["fill_pct"])) == 1.0


@pytest.mark.spec_id("API-SITES-FILL-FROM-VOLUME-GATE-CSV")
def test_sites_fill_from_volume_gate_no_routes_file_no_change(monkeypatch, client_with_tmp_env):
    monkeypatch.setenv("SITE_FILL_FROM_VOLUME", "1")
    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "SNoRoute", "date": "2024-08-03", "fill_pct": "0.2", "overflow_prob": "0.0", "pred_volume_m3": "0"},
        ],
        routes_rows=[],
        registry_map={},
    )
    r = client.get("/api/sites", params={"date": "2024-08-03", "format": "csv", "limit": 10})
    assert r.status_code == 200
    row = next(csv.DictReader(r.text.splitlines()))
    # Without a routes file, override doesn't run; value stays as provided
    assert pytest.approx(float(row["fill_pct"])) == 0.2

