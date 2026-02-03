"""
Tests for metrics upload endpoint.

TASK-34: Metrics upload UI + API
"""
from fastapi.testclient import TestClient
import tempfile
from pathlib import Path
import pytest


def test_ingest_metrics_endpoint():
    """Test metrics upload endpoint."""
    from scripts.api_app import create_app
    app = create_app()
    client = TestClient(app)

    csv_content = """date_generated,overall_wape,total_forecast_m3,total_actual_m3,records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites
2025-12-28T10:00:00,0.0823,123456.78,125000.00,5400,100,45.2,72.8,95.0,38105070|38105071,38100001|38100002"""

    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write(csv_content)
        temp_path = Path(f.name)

    try:
        with open(temp_path, 'rb') as f:
            response = client.post(
                '/api/mytko/ingest_metrics',
                files={'metrics_file': ('metrics.csv', f, 'text/csv')},
                data={'iteration': '1', 'notes': 'Test'},
            )

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['iteration'] == 1
        assert 'wape' in data
        assert 'within_20_pct' in data
        assert 0 < data['wape'] < 1  # WAPE should be between 0 and 1
    finally:
        temp_path.unlink(missing_ok=True)


def test_ingest_metrics_missing_iteration():
    """Test missing iteration parameter."""
    from scripts.api_app import create_app
    app = create_app()
    client = TestClient(app)

    csv_content = """date_generated,overall_wape,total_forecast_m3,total_actual_m3,records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites
2025-12-28T10:00:00,0.0823,123456.78,125000.00,5400,100,45.2,72.8,95.0,38105070|38105071,38100001|38100002"""

    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write(csv_content)
        temp_path = Path(f.name)

    try:
        with open(temp_path, 'rb') as f:
            response = client.post(
                '/api/mytko/ingest_metrics',
                files={'metrics_file': ('metrics.csv', f, 'text/csv')},
                data={'notes': 'Test'},  # Missing iteration
            )

        # FastAPI returns 422 for missing required form field
        assert response.status_code in [400, 422]
    finally:
        temp_path.unlink(missing_ok=True)


def test_ingest_metrics_missing_file():
    """Test missing file parameter."""
    from scripts.api_app import create_app
    app = create_app()
    client = TestClient(app)

    response = client.post(
        '/api/mytko/ingest_metrics',
        data={'iteration': '1', 'notes': 'Test'},
    )

    # FastAPI returns 422 for missing required file field
    assert response.status_code in [400, 422]


def test_ingest_metrics_with_notes():
    """Test metrics upload with notes."""
    from scripts.api_app import create_app
    app = create_app()
    client = TestClient(app)

    csv_content = """date_generated,overall_wape,total_forecast_m3,total_actual_m3,records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites
2025-12-28T10:00:00,0.1234,111111.11,110000.00,5000,95,40.0,70.0,93.0,38105070,38100001"""

    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write(csv_content)
        temp_path = Path(f.name)

    try:
        with open(temp_path, 'rb') as f:
            response = client.post(
                '/api/mytko/ingest_metrics',
                files={'metrics_file': ('metrics.csv', f, 'text/csv')},
                data={'iteration': '2', 'notes': 'Improved baseline with holiday adjustments'},
            )

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['iteration'] == 2
    finally:
        temp_path.unlink(missing_ok=True)


def test_ingest_metrics_with_per_site_file():
    """Test metrics upload with per-site CSV."""
    from scripts.api_app import create_app
    import pandas as pd
    app = create_app()
    client = TestClient(app)

    csv_content = """date_generated,overall_wape,total_forecast_m3,total_actual_m3,records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites
2025-12-28T10:00:00,0.0823,123456.78,125000.00,5400,100,45.2,72.8,95.0,38105070|38105071,38100001|38100002"""
    per_site_content = "site_id,site_wape\n38105070,0.12\n38105071,0.18\n"
    per_site_path = Path('data/metrics_history_per_site.parquet')

    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write(csv_content)
        metrics_path = Path(f.name)

    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write(per_site_content)
        per_site_csv = Path(f.name)

    try:
        with open(metrics_path, 'rb') as metrics_f, open(per_site_csv, 'rb') as per_site_f:
            response = client.post(
                '/api/mytko/ingest_metrics',
                files={
                    'metrics_file': ('metrics.csv', metrics_f, 'text/csv'),
                    'per_site_file': ('metrics_per_site.csv', per_site_f, 'text/csv'),
                },
                data={'iteration': '3', 'notes': 'Per-site ingest'},
            )

        assert response.status_code == 200
        assert per_site_path.exists()
        per_site_df = pd.read_parquet(per_site_path)
        assert 'site_id' in per_site_df.columns
        assert 'site_wape' in per_site_df.columns
    finally:
        metrics_path.unlink(missing_ok=True)
        per_site_csv.unlink(missing_ok=True)
        per_site_path.unlink(missing_ok=True)
