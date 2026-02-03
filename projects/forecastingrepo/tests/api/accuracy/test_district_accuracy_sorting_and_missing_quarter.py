from __future__ import annotations

import shutil

import pytest


def test_district_accuracy_sorting_and_csv(accuracy_testbed):
    client = accuracy_testbed["make_client"]()
    resp = client.get("/api/accuracy/districts?quarter=Q3_2024")
    assert resp.status_code == 200
    payload = resp.json()
    names = [row["district"] for row in payload["rows"]]
    assert names[:2] == ["D1", "D2"]
    assert payload["rows"][0]["accuracy_pct"] >= payload["rows"][-1]["accuracy_pct"]

    csv_resp = client.get("/api/accuracy/districts?quarter=Q3_2024&format=csv")
    assert csv_resp.status_code == 200
    assert "district,accuracy_pct,median_wape" in csv_resp.text.splitlines()[0]


def test_district_accuracy_fallback_and_invalid_quarter(accuracy_testbed):
    root = accuracy_testbed["root"]
    shutil.rmtree(root / "site_backtest_Q3_2024")
    shutil.rmtree(root / "site_backtest_Q2_2024")

    client = accuracy_testbed["make_client"]()
    resp = client.get("/api/accuracy/districts?quarter=Q1_2024")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["rows"][0]["district"] == "Жигаловский район"

    bad = client.get("/api/accuracy/districts?quarter=Q9_2099")
    assert bad.status_code == 404
