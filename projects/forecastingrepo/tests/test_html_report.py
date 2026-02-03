"""
Tests for TASK-41: Static HTML Report Generation

Test the HTML report generation with embedded data and interactive features.
"""
from datetime import date
from pathlib import Path
import tempfile


def test_html_report_generation():
    from scripts.generate_html_report import generate_html_report
    from src.sites.rolling_forecast import generate_rolling_forecast
    from src.sites.rolling_types import ForecastRequest
    import pandas as pd

    with tempfile.TemporaryDirectory() as tmpdir:
        cutoff_date = date(2025, 3, 15)
        horizon_days = 7
        top_sites = 50
        path = generate_html_report(
            cutoff_date=cutoff_date,
            horizon_days=horizon_days,
            output_path=Path(tmpdir) / 'test.html',
            top_sites=top_sites,
        )

        assert path.exists()
        content = path.read_text()
        assert '<!DOCTYPE html>' in content
        assert 'const D=' in content

        request = ForecastRequest(cutoff_date=cutoff_date, horizon_days=horizon_days)
        result = generate_rolling_forecast(request, use_cache=True)
        df = result.forecast_df.copy()
        if df.empty:
            return
        df['pred_m3'] = df['pred_volume_m3']
        df = df.sort_values(['site_id', 'date'])
        df['pred_delta_m3'] = df.groupby('site_id')['pred_m3'].diff().fillna(df['pred_m3'])
        site_totals = df.groupby('site_id')['pred_delta_m3'].sum()
        top_site_ids = site_totals.nlargest(top_sites).index
        expected_total = site_totals.loc[top_site_ids].sum()
        assert f">{expected_total:.0f}<" in content
