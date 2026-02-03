"""Tests for TASK-32: Pre-generated bundles CLI."""
from datetime import date
from pathlib import Path
import tempfile
import json


def test_generate_bundle():
    """Test bundle generation creates all files."""
    from scripts.generate_forecast_bundle import generate_bundle

    with tempfile.TemporaryDirectory() as tmpdir:
        bundle_dir = generate_bundle(
            cutoff_date=date(2025, 3, 15),
            horizon_days=7,
            output_dir=Path(tmpdir),
        )

        assert bundle_dir.exists()
        assert (bundle_dir / 'forecast.csv').exists()
        assert (bundle_dir / 'forecast.xlsx').exists()
        assert (bundle_dir / 'summary.json').exists()

        # Verify summary content
        summary = json.loads((bundle_dir / 'summary.json').read_text())
        assert summary['horizon_days'] == 7
        assert summary['site_count'] > 0


def test_generate_bundle_csv_format():
    """Test CSV contains correct columns."""
    from scripts.generate_forecast_bundle import generate_bundle
    import pandas as pd

    with tempfile.TemporaryDirectory() as tmpdir:
        bundle_dir = generate_bundle(
            cutoff_date=date(2025, 3, 15),
            horizon_days=7,
            output_dir=Path(tmpdir),
        )

        csv_path = bundle_dir / 'forecast.csv'
        df = pd.read_csv(csv_path)

        assert 'site_id' in df.columns
        assert 'date' in df.columns
        assert 'pred_m3' in df.columns


def test_generate_bundle_excel_sheets():
    """Test Excel has correct sheets."""
    from scripts.generate_forecast_bundle import generate_bundle
    import pandas as pd

    with tempfile.TemporaryDirectory() as tmpdir:
        bundle_dir = generate_bundle(
            cutoff_date=date(2025, 3, 15),
            horizon_days=30,
            output_dir=Path(tmpdir),
        )

        xlsx_path = bundle_dir / 'forecast.xlsx'
        xls = pd.ExcelFile(xlsx_path)

        assert 'Summary' in xls.sheet_names
        assert 'Daily Data' in xls.sheet_names


def test_generate_bundle_summary_metadata():
    """Test summary JSON contains all required metadata."""
    from scripts.generate_forecast_bundle import generate_bundle
    import pandas as pd

    with tempfile.TemporaryDirectory() as tmpdir:
        bundle_dir = generate_bundle(
            cutoff_date=date(2025, 5, 15),
            horizon_days=90,
            output_dir=Path(tmpdir),
        )

        summary_path = bundle_dir / 'summary.json'
        summary = json.loads(summary_path.read_text())

        assert summary['cutoff_date'] == '2025-05-15'
        assert summary['horizon_days'] == 90
        assert 'site_count' in summary
        assert 'total_forecast_m3' in summary
        assert 'row_count' in summary
        assert 'generated_at' in summary
        assert 'files' in summary
        assert summary['files'] == ['forecast.csv', 'forecast.xlsx', 'summary.json']

        forecast_df = pd.read_csv(bundle_dir / 'forecast.csv')
        forecast_df = forecast_df.sort_values(['site_id', 'date'])
        forecast_df['pred_delta_m3'] = (
            forecast_df.groupby('site_id')['pred_m3'].diff().fillna(forecast_df['pred_m3'])
        )
        expected_total = round(forecast_df['pred_delta_m3'].sum(), 2)
        assert summary['total_forecast_m3'] == expected_total
