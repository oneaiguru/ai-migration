"""
Tests for TASK-30: Forecast export for validation.
"""
import subprocess
import sys
from datetime import date, timedelta
from pathlib import Path
import tempfile

import pandas as pd
import pytest


def test_export_forecast_for_validation():
    """Test forecast export creates correct CSV format."""
    from src.sites.export_validation import export_forecast_for_validation

    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = Path(tmpdir) / 'test_forecast.csv'

        result = export_forecast_for_validation(
            cutoff_date=date(2025, 5, 31),
            horizon_days=7,
            output_path=output_path,
        )

        assert result.exists()
        content = result.read_text(encoding="utf-8")
        assert content.splitlines()[0].startswith("Код КП;")


def test_export_forecast_wide_empty_does_not_crash(monkeypatch):
    from src.sites import export_validation
    from src.sites.rolling_types import ForecastResult

    cutoff = date(2025, 5, 31)
    horizon = 7
    start = cutoff + timedelta(days=1)
    end = start + timedelta(days=horizon - 1)
    empty_df = pd.DataFrame(
        columns=["site_id", "date", "fill_pct", "pred_volume_m3", "overflow_prob"]
    )
    result = ForecastResult(
        cutoff_date=cutoff,
        start_date=start,
        end_date=end,
        site_count=0,
        forecast_df=empty_df,
        generated_at="2025-01-01T00:00:00",
        cached=False,
    )

    def fake_generate_rolling_forecast(request, use_cache=True):
        return result

    monkeypatch.setattr(export_validation, "generate_rolling_forecast", fake_generate_rolling_forecast)

    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = Path(tmpdir) / 'test_forecast.csv'
        export_validation.export_forecast_for_validation(
            cutoff_date=cutoff,
            horizon_days=horizon,
            output_path=output_path,
            output_format="wide",
        )
        content = output_path.read_text(encoding="utf-8").splitlines()
        assert len(content) == 1
        header = content[0].split(";")
        assert header[0] == "Код КП"
        assert len(header) == horizon + 1
        assert header[1] == str(start.day)
        assert header[-1] == str(end.day)


def test_export_forecast_sorted():
    """Test that output is sorted by site_id, then date."""
    from src.sites.export_validation import export_forecast_for_validation

    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = Path(tmpdir) / 'test_forecast.csv'

        export_forecast_for_validation(
            cutoff_date=date(2025, 5, 31),
            horizon_days=7,
            output_path=output_path,
            output_format="long",
        )

        df = pd.read_csv(output_path)
        df_sorted = df.sort_values(by=['site_id', 'date']).reset_index(drop=True)
        pd.testing.assert_frame_equal(df.reset_index(drop=True), df_sorted)


def test_export_forecast_custom_cutoff():
    """Test export with custom cutoff date."""
    from src.sites.export_validation import export_forecast_for_validation

    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = Path(tmpdir) / 'test_forecast.csv'

        result = export_forecast_for_validation(
            cutoff_date=date(2025, 4, 15),
            horizon_days=30,
            output_path=output_path,
            output_format="long",
        )

        assert result.exists()
        df = pd.read_csv(result)
        assert len(df) > 0

        # Verify dates start after cutoff
        df['date'] = pd.to_datetime(df['date'])
        assert df['date'].min() > pd.Timestamp('2025-04-15')


def test_export_forecast_cli_script():
    """Test CLI script runs without error."""
    with tempfile.TemporaryDirectory() as tmpdir:
        output_path = Path(tmpdir) / 'cli_forecast.csv'

        result = subprocess.run(
            [
                sys.executable, 'scripts/export_validation_forecast.py',
                '--cutoff', '2025-05-31',
                '--horizon', '7',
                '--output', str(output_path),
                '--format', 'long',
            ],
            capture_output=True,
            text=True,
            cwd='/Users/m/ai/projects/forecastingrepo',
        )

        assert result.returncode == 0, f"Script failed: {result.stderr}"
        assert output_path.exists()

        df = pd.read_csv(output_path)
        assert len(df) > 0
        assert set(df.columns) == {'site_id', 'date', 'pred_m3'}
