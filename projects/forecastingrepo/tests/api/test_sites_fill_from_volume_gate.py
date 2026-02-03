import pytest

fastapi = pytest.importorskip("fastapi")


@pytest.mark.spec_id("API-SITES-FILL-FROM-VOLUME-GATE")
def test_sites_fill_from_volume_gate_overrides_when_mass_missing(monkeypatch, client_with_tmp_env):
    # Gate ON
    monkeypatch.setenv("SITE_FILL_FROM_VOLUME", "1")

    # Build fixtures: one site with pred_volume_m3=0 and route volume 2.2 m3
    client, paths = client_with_tmp_env(
        sites_rows=[
            {"site_id": "SVol", "date": "2024-08-03", "fill_pct": "0.0", "overflow_prob": "0.0", "pred_volume_m3": "0"},
        ],
        routes_rows=[
            {"site_id": "SVol", "date": "2024-08-03", "policy": "strict", "visit": "1", "volume_m3": "2.2", "schedule": "AM"},
        ],
        registry_map={},
    )

    r = client.get("/api/sites", params={"date": "2024-08-03", "limit": 10})
    assert r.status_code == 200
    rows = r.json()
    sv = next(x for x in rows if x.get("site_id") == "SVol")
    # Default capacity is 1100 L → 2.2 m3 = 2200 L, clamp to 1.0
    assert pytest.approx(sv.get("fill_pct"), rel=1e-6) == 1.0


@pytest.mark.spec_id("API-SITES-FILL-FROM-VOLUME-GATE")
def test_sites_fill_from_volume_gate_off_keeps_original(monkeypatch, client_with_tmp_env):
    # Gate OFF
    monkeypatch.delenv("SITE_FILL_FROM_VOLUME", raising=False)

    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "SVol2", "date": "2024-08-03", "fill_pct": "0.0", "overflow_prob": "0.0", "pred_volume_m3": "0"},
        ],
        routes_rows=[
            {"site_id": "SVol2", "date": "2024-08-03", "policy": "strict", "visit": "1", "volume_m3": "2.2", "schedule": "AM"},
        ],
        registry_map={},
    )
    r = client.get("/api/sites", params={"date": "2024-08-03", "limit": 10})
    assert r.status_code == 200
    rows = r.json()
    sv = next(x for x in rows if x.get("site_id") == "SVol2")
    # When gate is off, original fill_pct (0.0) remains
    assert sv.get("fill_pct") == 0.0


@pytest.mark.spec_id("API-SITES-FILL-FROM-VOLUME-GATE")
def test_sites_fill_from_volume_gate_prefers_max_of_existing_and_volume(monkeypatch, client_with_tmp_env):
    # Gate ON
    monkeypatch.setenv("SITE_FILL_FROM_VOLUME", "1")
    # Existing fill_pct ~0.05; volume 0.33 m3 => 0.30 fill -> expect 0.30 used (max)
    client, _ = client_with_tmp_env(
        sites_rows=[
            {"site_id": "SMax", "date": "2024-08-03", "fill_pct": "0.05", "overflow_prob": "0.0", "pred_volume_m3": "5.0"},
        ],
        routes_rows=[
            {"site_id": "SMax", "date": "2024-08-03", "policy": "strict", "visit": "1", "volume_m3": "0.33", "schedule": "AM"},
        ],
        registry_map={},
    )
    r = client.get("/api/sites", params={"date": "2024-08-03", "limit": 10})
    assert r.status_code == 200
    rows = r.json()
    sm = next(x for x in rows if x.get("site_id") == "SMax")
    assert pytest.approx(sm.get("fill_pct"), rel=1e-6) == 0.3
