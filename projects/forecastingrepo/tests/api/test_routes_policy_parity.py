import csv
import pytest

fastapi = pytest.importorskip("fastapi")


def test_routes_policy_shape_parity(client_with_tmp_env):
    # Build client with a strict file, then add showcase file with same shape
    client, paths = client_with_tmp_env(
        sites_rows=[
            {"site_id": "S1", "date": "2024-08-03", "fill_pct": "0.55", "overflow_prob": "0.15", "pred_volume_m3": "11.0"},
        ],
        routes_rows=[
            {"site_id": "S1", "date": "2024-08-03", "policy": "strict", "visit": "1", "volume_m3": "3.0", "schedule": "AM"},
        ],
        registry_map=None,
    )
    routes_dir = paths["routes_dir"]
    show = routes_dir / "recommendations_showcase_2024-08-03.csv"
    with show.open("w", newline="", encoding="utf-8") as f:
        import csv as _csv
        w = _csv.DictWriter(f, fieldnames=["site_id","date","policy","visit","volume_m3","schedule"])
        w.writeheader()
        w.writerow({"site_id":"S1","date":"2024-08-03","policy":"showcase","visit":"1","volume_m3":"3.0","schedule":"AM"})

    r_strict = client.get("/api/routes", params={"date":"2024-08-03","policy":"strict"})
    r_show = client.get("/api/routes", params={"date":"2024-08-03","policy":"showcase"})
    assert r_strict.status_code == 200 and r_show.status_code == 200
    # Shapes identical
    js = r_strict.json()
    js2 = r_show.json()
    if js and js2:
        assert set(js[0].keys()) == set(js2[0].keys())

    # CSV headers parity
    c1 = client.get("/api/routes", params={"date":"2024-08-03","policy":"strict","format":"csv"})
    c2 = client.get("/api/routes", params={"date":"2024-08-03","policy":"showcase","format":"csv"})
    assert c1.text.splitlines()[0] == c2.text.splitlines()[0] == (
        "site_id,date,policy,visit,volume_m3,schedule,fill_pct,overflow_prob,last_service_dt"
    )

