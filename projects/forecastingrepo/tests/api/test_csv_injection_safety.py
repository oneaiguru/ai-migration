import csv
import pytest

fastapi = pytest.importorskip("fastapi")


@pytest.mark.spec_id("API-CSV-INJECTION")
def test_csv_injection_values_preserved_and_quoted_where_needed(client_with_tmp_env):
    # Embed values that could be interpreted by spreadsheets; ensure they round-trip via CSV parser
    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.1", "overflow_prob": "0.2", "pred_volume_m3": "1.0"},
        ],
        routes_rows=[
            {"site_id": "S1", "date": "2024-08-03", "policy": "strict", "visit": "1", "volume_m3": "3.0", "schedule": "=@HYPERLINK(\"http://x\",\"click\")"},
            {"site_id": "S1", "date": "2024-08-03", "policy": "strict", "visit": "2", "volume_m3": "3.0", "schedule": "+5-3"},
            {"site_id": "S1", "date": "2024-08-03", "policy": "strict", "visit": "3", "volume_m3": "3.0", "schedule": "@cmd|/C calc"},
            {"site_id": "S1", "date": "2024-08-03", "policy": "strict", "visit": "4", "volume_m3": "3.0", "schedule": "Тест, с запятой"},
        ],
        registry_map=None,
    )
    r = client.get("/api/routes", params={"date": "2024-08-03", "policy": "strict", "format": "csv"})
    assert r.status_code == 200
    lines = r.text.splitlines()
    # Parse and ensure exact field values preserved
    rows = list(csv.DictReader(lines))
    got = [row["schedule"] for row in rows]
    assert "=@HYPERLINK(\"http://x\",\"click\")" in got
    assert "+5-3" in got
    assert "@cmd|/C calc" in got
    assert "Тест, с запятой" in got

