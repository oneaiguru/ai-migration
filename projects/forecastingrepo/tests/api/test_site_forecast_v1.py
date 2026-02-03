import csv

from fastapi.testclient import TestClient
from scripts.api_app import create_app


def _client():
    return TestClient(create_app())


def test_site_forecast_empty_ok():
    c = _client()
    r = c.get("/api/sites/S001/forecast?window=2024-08-01:2024-08-07")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_site_forecast_bad_window():
    c = _client()
    r = c.get("/api/sites/S001/forecast?window=bad:date")
    assert r.status_code == 400


def test_site_forecast_csv_header():
    c = _client()
    r = c.get("/api/sites/S001/forecast?days=7&format=csv")
    assert r.status_code == 200
    head = r.text.splitlines()[0]
    assert head == "date,pred_volume_m3,fill_pct,overflow_prob,last_service_dt"


def test_site_forecast_days_default_window_includes_demo_end():
    c = _client()
    # No window; rely on days + default end (2024-08-03 in demo)
    r = c.get("/api/sites/S1/forecast?days=7")
    assert r.status_code == 200
    payload = r.json()
    assert isinstance(payload, list)
    # Expect at least one item for S1 within the demo CSV window
    assert len(payload) >= 1
    row = payload[0]
    for k in ("date", "fill_pct", "overflow_prob"):
        assert k in row


def test_site_forecast_default_end_uses_latest_file(client_with_tmp_env):
    client, paths = client_with_tmp_env()
    later_path = paths["sites_dir"] / "daily_fill_2024-08-11_to_2024-08-20.csv"
    with later_path.open("w", newline="", encoding="utf-8") as f:
        fieldnames = ["site_id", "date", "fill_pct", "overflow_prob", "pred_volume_m3", "last_service_dt"]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerow({
            "site_id": "S1",
            "date": "2024-08-20",
            "fill_pct": "0.9",
            "overflow_prob": "0.05",
            "pred_volume_m3": "9.1",
            "last_service_dt": "2024-08-19",
        })

    r = client.get("/api/sites/S1/forecast?days=1")
    assert r.status_code == 200
    rows = r.json()
    assert rows
    assert rows[-1].get("date") == "2024-08-20"


def test_site_forecast_csv_has_rows_when_data_exists():
    c = _client()
    r = c.get("/api/sites/S1/forecast?window=2024-08-01:2024-08-07&format=csv")
    assert r.status_code == 200
    lines = r.text.splitlines()
    assert len(lines) > 1  # header + >=1 data row for S1 in demo slice


def test_site_forecast_invalid_format_falls_back_to_json():
    c = _client()
    r = c.get("/api/sites/S1/forecast?days=7&format=tsv")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_site_forecast_unknown_site_returns_empty_json_and_csv():
    c = _client()
    rj = c.get("/api/sites/UNKNOWN/forecast?window=2024-08-01:2024-08-07")
    assert rj.status_code == 200
    assert rj.json() == []
    rc = c.get("/api/sites/UNKNOWN/forecast?window=2024-08-01:2024-08-07&format=csv")
    assert rc.status_code == 200
    assert rc.text.splitlines()[0] == "date,pred_volume_m3,fill_pct,overflow_prob,last_service_dt"
    assert len(rc.text.splitlines()) == 1  # header only


def test_site_forecast_returns_empty_when_no_files(monkeypatch):
    # Force both primary and fallback globbing to return no files
    import pathlib, glob as pyglob
    from src.sites import api_site_forecast as mod

    monkeypatch.setattr(pathlib.Path, "glob", lambda self, pattern: [])
    monkeypatch.setattr(pyglob, "glob", lambda pattern, recursive=True: [])

    c = _client()
    r = c.get("/api/sites/S1/forecast?days=7")
    assert r.status_code == 200
    assert r.json() == []
