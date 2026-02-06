import csv
import pytest

fastapi = pytest.importorskip("fastapi")


def _client_with_join_data(client_with_tmp_env):
    # Sites S1 (with metrics) and S2 (with metrics) on 2024-08-03
    sites_rows = [
        {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.55", "overflow_prob": "0.15", "pred_volume_m3": "11.0", "last_service_dt": "2024-08-01"},
        {"site_id": "S2", "date": "2024-08-03", "fill_pct": "", "overflow_prob": "", "pred_volume_m3": "10.0"},
    ]
    # Routes include S1 (should join) and S3 (no join → nulls)
    routes_rows = [
        {"site_id": "S1", "date": "2024-08-03", "policy": "strict", "visit": "1", "volume_m3": "3.0", "schedule": "=SUM(1,2)"},
        {"site_id": "S3", "date": "2024-08-03", "policy": "strict", "visit": "0", "volume_m3": "", "schedule": "Смена–утро"},
    ]
    return client_with_tmp_env(sites_rows=sites_rows, routes_rows=routes_rows, registry_map=None)


@pytest.mark.spec_id("API-ROUTES-JOIN")
def test_routes_join_semantics_json(client_with_tmp_env):
    client, _ = _client_with_join_data(client_with_tmp_env)
    r = client.get("/api/routes", params={"date": "2024-08-03", "policy": "strict"})
    assert r.status_code == 200
    rows = r.json()
    assert isinstance(rows, list) and len(rows) >= 2
    # Find S1 row (joined)
    s1 = next(x for x in rows if x.get("site_id") == "S1")
    assert s1.get("fill_pct") == pytest.approx(0.55)
    assert s1.get("overflow_prob") == pytest.approx(0.15)
    assert s1.get("last_service_dt") == "2024-08-01"
    # Find S3 row (no join → nulls)
    s3 = next(x for x in rows if x.get("site_id") == "S3")
    assert s3.get("fill_pct") is None
    assert s3.get("overflow_prob") is None
    assert s3.get("last_service_dt") is None


@pytest.mark.spec_id("API-ROUTES-CSV-HEADER")
def test_routes_collection_csv_header_exact_and_utf8_and_formulas(client_with_tmp_env):
    client, _ = _client_with_join_data(client_with_tmp_env)
    r = client.get("/api/routes", params={"date": "2024-08-03", "policy": "strict", "format": "csv"})
    assert r.status_code == 200
    lines = r.text.splitlines()
    assert lines[0] == "site_id,date,policy,visit,volume_m3,schedule,fill_pct,overflow_prob,last_service_dt"
    # Parse with csv to ensure fields are preserved
    reader = csv.DictReader(lines)
    rows = list(reader)
    # schedule preserves formula-like and UTF-8 strings
    scheds = [row.get("schedule") for row in rows]
    assert "=SUM(1,2)" in scheds
    assert "Смена–утро" in scheds

