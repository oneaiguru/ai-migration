# TASK-40: Integration Tests

**Complexity**: Medium | **Model**: Haiku OK | **Est**: 40min

## Goal
Test UNTESTED integration flows (not covered by test_rolling_forecast.py).

## Focus Areas
1. Bundle generation (TASK-32)
2. Metrics ingestion flow (TASK-34)
3. Full API pipeline

## Code Changes

### 1. File: tests/test_integration.py (NEW)

```python
"""
Integration tests for new features.

TASK-40: Focus on flows NOT covered by test_rolling_forecast.py.
"""
from datetime import date
from pathlib import Path
import tempfile
import json

import pytest
from fastapi.testclient import TestClient


class TestBundleGeneration:
    """Test TASK-32 bundle generation."""

    def test_bundle_creates_all_files(self):
        """Bundle contains CSV, Excel, JSON."""
        from scripts.generate_forecast_bundle import generate_bundle

        with tempfile.TemporaryDirectory() as tmpdir:
            bundle_dir = generate_bundle(
                cutoff_date=date(2025, 3, 15),
                horizon_days=7,
                output_dir=Path(tmpdir),
            )

            assert (bundle_dir / 'forecast.csv').exists()
            assert (bundle_dir / 'forecast.xlsx').exists()
            assert (bundle_dir / 'summary.json').exists()

    def test_bundle_csv_format(self):
        """CSV has correct columns."""
        import pandas as pd
        from scripts.generate_forecast_bundle import generate_bundle

        with tempfile.TemporaryDirectory() as tmpdir:
            bundle_dir = generate_bundle(
                cutoff_date=date(2025, 3, 15),
                horizon_days=7,
                output_dir=Path(tmpdir),
            )

            df = pd.read_csv(bundle_dir / 'forecast.csv')
            assert list(df.columns) == ['site_id', 'date', 'pred_m3']

    def test_bundle_summary_json(self):
        """JSON has required metadata."""
        from scripts.generate_forecast_bundle import generate_bundle

        with tempfile.TemporaryDirectory() as tmpdir:
            bundle_dir = generate_bundle(
                cutoff_date=date(2025, 3, 15),
                horizon_days=7,
                output_dir=Path(tmpdir),
            )

            summary = json.loads((bundle_dir / 'summary.json').read_text())
            assert 'cutoff_date' in summary
            assert 'horizon_days' in summary
            assert 'site_count' in summary
            assert summary['horizon_days'] == 7


class TestMetricsFlow:
    """Test TASK-34 metrics upload → TASK-35 history API."""

    def test_metrics_upload_to_history(self):
        """Test end-to-end: upload metrics → fetch history."""
        from scripts.api_app import app
        from fastapi.testclient import TestClient
        import tempfile

        client = TestClient(app)

        csv_content = """date_generated,overall_wape,total_forecast_m3,total_actual_m3,records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites
2025-12-28T10:00:00,0.0823,123456.78,125000.00,5400,100,45.2,72.8,95.0,38105070|38105071,38100001|38100002"""

        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write(csv_content)
            temp_path = f.name

        try:
            # Upload metrics
            with open(temp_path, 'rb') as f:
                upload_response = client.post(
                    '/api/mytko/ingest_metrics',
                    files={'metrics_file': ('metrics.csv', f, 'text/csv')},
                    data={'iteration': '1', 'notes': 'Test iteration'},
                )

            assert upload_response.status_code == 200

            # Fetch history
            history_response = client.get('/api/mytko/metrics_history')
            assert history_response.status_code == 200
            data = history_response.json()
            assert 'rows' in data
        finally:
            import os
            os.unlink(temp_path)

    def test_districts_endpoint(self):
        """Test /api/mytko/districts returns list."""
        from scripts.api_app import app
        client = TestClient(app)

        response = client.get('/api/mytko/districts')
        assert response.status_code == 200
        data = response.json()
        assert 'districts' in data
        assert isinstance(data['districts'], list)
```

## Acceptance Criteria
- [ ] Bundle tests pass
- [ ] Metrics flow tests pass
- [ ] API integration tests pass
- [ ] No overlap with test_rolling_forecast.py

---

## On Completion

1. Run: `pytest tests/test_integration.py -v`
2. Update `/Users/m/ai/progress.md`: Change TASK-40 from 🔴 TODO to 🟢 DONE
3. Commit: "Implement TASK-40: Integration tests"
