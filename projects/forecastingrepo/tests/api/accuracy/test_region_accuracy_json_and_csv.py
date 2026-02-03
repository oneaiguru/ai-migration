from __future__ import annotations

import pytest


def test_region_accuracy_json_and_csv(accuracy_testbed):
    client = accuracy_testbed["make_client"]()

    resp = client.get("/api/accuracy/region?quarter=Q3_2024")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["quarter"] == "Q3_2024"
    assert "Q3_2024" in payload["available_quarters"]
    assert payload["site_count"] == 3
    assert payload["overall_wape"] == pytest.approx(0.15)
    assert payload["median_site_wape"] == pytest.approx(0.1)
    assert payload["distribution"][0]["bucket"] == "<=8%"

    csv_resp = client.get("/api/accuracy/region?quarter=Q3_2024&format=csv")
    assert csv_resp.status_code == 200
    assert csv_resp.headers["content-type"].startswith("text/csv")
    body = csv_resp.text.strip().splitlines()
    assert body[0].startswith("quarter,overall_wape,median_site_wape,site_count")
    assert "Q3_2024" in body[1]


def test_region_accuracy_defaults_to_latest_quarter(accuracy_testbed):
    client = accuracy_testbed["make_client"]()
    resp = client.get("/api/accuracy/region")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["quarter"] == "Q3_2024"  # newest fixture
