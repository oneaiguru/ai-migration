import pytest

fastapi = pytest.importorskip("fastapi")


@pytest.mark.spec_id("API-SEC-HEADERS")
def test_security_headers_present():
    from scripts.api_app import create_app
    from fastapi.testclient import TestClient

    app = create_app()
    c = TestClient(app)
    r = c.get("/api/metrics")
    assert r.headers.get("X-Content-Type-Options") == "nosniff"
    assert r.headers.get("X-Frame-Options") == "DENY"
    assert r.headers.get("Referrer-Policy") == "no-referrer"


@pytest.mark.spec_id("API-CORS-PREFLIGHT")
def test_cors_preflight_honors_env(monkeypatch):
    import os
    monkeypatch.setenv("API_CORS_ORIGIN", "https://example.com")
    from scripts.api_app import create_app
    from fastapi.testclient import TestClient

    app = create_app()
    c = TestClient(app)
    headers = {
        "Origin": "https://example.com",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type",
    }
    r = c.options("/api/sites", headers=headers)
    # Access-Control-Allow-Origin must reflect the configured origin
    assert r.headers.get("access-control-allow-origin") == "https://example.com"

