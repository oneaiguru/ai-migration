from __future__ import annotations

import shutil


def test_site_accuracy_paging_and_search(accuracy_testbed):
    client = accuracy_testbed["make_client"]()

    resp = client.get("/api/accuracy/sites?quarter=Q3_2024&limit=2&offset=0")
    assert resp.status_code == 200
    assert resp.headers["x-total-count"] == "3"
    payload = resp.json()
    assert payload["total_sites"] == 3
    assert payload["limit"] == 2
    assert payload["offset"] == 0
    assert len(payload["items"]) == 2
    assert payload["items"][0]["site_id"] == "S100"

    resp2 = client.get("/api/accuracy/sites?quarter=Q3_2024&limit=5&offset=2")
    assert resp2.status_code == 200
    assert len(resp2.json()["items"]) == 1

    resp3 = client.get("/api/accuracy/sites?quarter=Q3_2024&search=S2")
    assert resp3.status_code == 200
    data = resp3.json()
    assert data["total_sites"] == 1
    assert data["items"][0]["site_id"] == "S200"

    csv_resp = client.get("/api/accuracy/sites?quarter=Q3_2024&format=csv&limit=2")
    assert csv_resp.status_code == 200
    body = csv_resp.text.splitlines()
    assert body[0].startswith("site_id,year_month")
    assert "S100" in body[1]


def test_site_accuracy_fallback_when_reports_missing(accuracy_testbed):
    root = accuracy_testbed["root"]
    shutil.rmtree(root / "site_backtest_Q3_2024")
    shutil.rmtree(root / "site_backtest_Q2_2024")

    client = accuracy_testbed["make_client"]()
    resp = client.get("/api/accuracy/sites?quarter=Q1_2024")
    assert resp.status_code == 200
    data = resp.json()
    assert data["items"]
    assert data["quarter"] == "Q1_2024"
