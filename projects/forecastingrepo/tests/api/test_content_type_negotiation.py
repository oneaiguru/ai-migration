import pytest

fastapi = pytest.importorskip("fastapi")


def test_format_csv_sets_content_type_csv(client_with_tmp_env):
    client, _ = client_with_tmp_env(routes_rows=[], registry_map={})
    r = client.get("/api/sites", params={"format": "csv"})
    assert r.status_code == 200
    assert r.headers.get("content-type", "").startswith("text/csv")


def test_accept_header_text_csv_without_format_returns_json(client_with_tmp_env):
    client, _ = client_with_tmp_env(routes_rows=[], registry_map={})
    r = client.get("/api/sites", headers={"Accept": "text/csv"})
    assert r.status_code == 200
    # Current behavior: query param controls format; Accept header alone returns JSON
    assert r.headers.get("content-type", "").startswith("application/json")

