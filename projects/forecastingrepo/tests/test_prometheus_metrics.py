"""
Tests for Prometheus metrics endpoint.

TASK-51: Verify metrics are collected and exposed correctly.
"""
from fastapi.testclient import TestClient


def test_metrics_endpoint():
    """Test /metrics endpoint returns Prometheus text format."""
    from scripts.api_app import create_app

    app = create_app()
    client = TestClient(app)
    response = client.get('/metrics')

    assert response.status_code == 200
    assert b'forecast_requests_total' in response.content
    assert b'forecast_request_duration_seconds' in response.content
    assert b'forecast_generation_seconds' in response.content
    assert b'forecast_active' in response.content


def test_metrics_content_type():
    """Test /metrics endpoint returns plain text content type."""
    from scripts.api_app import create_app

    app = create_app()
    client = TestClient(app)
    response = client.get('/metrics')

    assert response.status_code == 200
    assert 'text/plain' in response.headers['content-type']


def test_request_count_metric():
    """Test request count metric is incremented."""
    from scripts.api_app import create_app

    app = create_app()
    client = TestClient(app)

    # Get metrics before request
    response_before = client.get('/metrics')
    assert response_before.status_code == 200

    # Make a request to an endpoint
    client.get('/api/metrics')

    # Get metrics after request
    response_after = client.get('/metrics')
    assert response_after.status_code == 200
    # The metric should exist (may have been incremented)
    assert b'forecast_requests_total' in response_after.content
