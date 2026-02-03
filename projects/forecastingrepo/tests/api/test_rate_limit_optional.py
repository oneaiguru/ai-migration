import pytest


slowapi = pytest.importorskip("slowapi")


@pytest.mark.spec_id("API-RATE-LIMIT-OPTIONAL")
def test_rate_limit_middleware_present_when_slowapi_installed():
    from scripts.api_app import create_app
    from fastapi.testclient import TestClient

    app = create_app()
    # Middleware/limiter attached
    assert getattr(app.state, "limiter", None) is not None
    c = TestClient(app)
    # Sanity: requests succeed; per-route quotas are not configured in demo
    for _ in range(10):
        r = c.get("/api/metrics")
        assert r.status_code in (200, 404)

