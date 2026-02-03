"""Tests for microservice packaging and health endpoint."""
import pytest
from fastapi.testclient import TestClient


def test_health_endpoint():
    """Test that health check endpoint responds correctly."""
    from scripts.api_app import app
    client = TestClient(app)

    response = client.get('/health')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'forecast-api'
    assert data['version'] == '1.0.0'
