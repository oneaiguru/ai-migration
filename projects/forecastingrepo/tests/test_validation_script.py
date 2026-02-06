"""
Tests for TASK-29: Blind validation protocol.
"""
import subprocess
import sys
from pathlib import Path
import tempfile

import pandas as pd
import pytest


def test_validate_forecast_script():
    """Test that validation script runs without error."""
    # Create test forecast CSV
    forecast_csv = Path(tempfile.gettempdir()) / 'test_forecast.csv'
    forecast_csv.write_text(
        'site_id,date,pred_m3\n'
        '38105070,2025-06-01,123.45\n'
        '38105070,2025-06-02,128.92\n'
        '38105071,2025-06-01,450.00\n'
        '38105071,2025-06-02,460.00\n'
    )

    # Create test actuals CSV
    actuals_csv = Path(tempfile.gettempdir()) / 'test_actuals.csv'
    actuals_csv.write_text(
        'site_id,date,actual_m3\n'
        '38105070,2025-06-01,125.30\n'
        '38105070,2025-06-02,130.15\n'
        '38105071,2025-06-01,445.00\n'
        '38105071,2025-06-02,455.00\n'
    )

    output_csv = Path(tempfile.gettempdir()) / 'test_metrics.csv'

    # Run validation script (long format)
    result = subprocess.run(
        [
            sys.executable, 'scripts/validate_forecast.py',
            str(forecast_csv), str(actuals_csv), str(output_csv)
        ],
        capture_output=True,
        text=True,
        cwd='/Users/m/ai/projects/forecastingrepo',
    )

    assert result.returncode == 0, f"Script failed: {result.stderr}"
    assert output_csv.exists()

    metrics = pd.read_csv(output_csv)
    assert 'overall_wape' in metrics.columns
    assert 0 <= metrics['overall_wape'].iloc[0] <= 1


def test_validate_forecast_wide_auto():
    forecast_csv = Path(tempfile.gettempdir()) / 'forecast_2025-06-01_2025-06-30.csv'
    days = ";".join(str(day) for day in range(1, 31))
    forecast_csv.write_text(
        "Отчет по объему вывезенных контейнеров\n"
        "Период: 01.06.2025 - 30.06.2025\n"
        "\n"
        f"Код КП;{days}\n"
        "38105070;100,0;200,0\n"
    )
    actuals_csv = Path(tempfile.gettempdir()) / 'actuals_2025-06-01_2025-06-30.csv'
    actuals_csv.write_text(
        "Отчет по объему вывезенных контейнеров\n"
        "Период: 01.06.2025 - 30.06.2025\n"
        "\n"
        f"Код КП;{days}\n"
        "38105070;100,0;100,0\n"
    )
    output_csv = Path(tempfile.gettempdir()) / 'metrics_wide.csv'
    result = subprocess.run(
        [
            sys.executable, 'scripts/validate_forecast.py',
            str(forecast_csv), str(actuals_csv), str(output_csv)
        ],
        capture_output=True,
        text=True,
        cwd='/Users/m/ai/projects/forecastingrepo',
    )
    assert result.returncode == 0, result.stderr


def test_validate_forecast_wide_daily_series():
    forecast_csv = Path(tempfile.gettempdir()) / 'forecast_2025-06-01_2025-06-02.csv'
    forecast_csv.write_text(
        "Отчет по объему вывезенных контейнеров\n"
        "Период: 01.06.2025 - 02.06.2025\n"
        "\n"
        "Код КП;1;2\n"
        "38105070;10,0;20,0\n"
    )
    actuals_csv = Path(tempfile.gettempdir()) / 'actuals_2025-06-01_2025-06-02.csv'
    actuals_csv.write_text(
        "Отчет по объему вывезенных контейнеров\n"
        "Период: 01.06.2025 - 02.06.2025\n"
        "\n"
        "Код КП;1;2\n"
        "38105070;10,0;20,0\n"
    )
    output_csv = Path(tempfile.gettempdir()) / 'metrics_wide_daily.csv'
    result = subprocess.run(
        [
            sys.executable,
            'scripts/validate_forecast.py',
            str(forecast_csv),
            str(actuals_csv),
            str(output_csv),
            '--forecast-series',
            'daily',
        ],
        capture_output=True,
        text=True,
        cwd='/Users/m/ai/projects/forecastingrepo',
    )
    assert result.returncode == 0, result.stderr

    metrics = pd.read_csv(output_csv)
    assert metrics["overall_wape"].iloc[0] == 0.0
    assert abs(metrics["total_forecast_m3"].iloc[0] - 30.0) < 0.01
    assert abs(metrics["total_actual_m3"].iloc[0] - 30.0) < 0.01


def test_validate_forecast_metrics_correct():
    """Test that metrics are calculated correctly."""
    # Create test data where we know the expected WAPE
    forecast_csv = Path(tempfile.gettempdir()) / 'test_forecast2.csv'
    forecast_csv.write_text(
        'site_id,date,pred_m3\n'
        'site1,2025-06-01,100.0\n'
        'site1,2025-06-02,300.0\n'
    )

    actuals_csv = Path(tempfile.gettempdir()) / 'test_actuals2.csv'
    actuals_csv.write_text(
        'site_id,date,actual_m3\n'
        'site1,2025-06-01,100.0\n'
        'site1,2025-06-02,200.0\n'
    )

    output_csv = Path(tempfile.gettempdir()) / 'test_metrics2.csv'

    subprocess.run(
        [
            sys.executable, 'scripts/validate_forecast.py',
            str(forecast_csv), str(actuals_csv), str(output_csv)
        ],
        capture_output=True,
        text=True,
        cwd='/Users/m/ai/projects/forecastingrepo',
    )

    metrics = pd.read_csv(output_csv)
    # Perfect predictions should have WAPE = 0
    assert metrics['overall_wape'].iloc[0] == 0.0
    assert metrics['within_10_pct'].iloc[0] == 100.0
    assert metrics['within_20_pct'].iloc[0] == 100.0


def test_validate_forecast_no_actual_disclosure():
    """Test that output contains only aggregated metrics, not per-row actuals."""
    # Use unique values that won't appear as substrings in aggregates
    forecast_csv = Path(tempfile.gettempdir()) / 'test_forecast3.csv'
    forecast_csv.write_text(
        'site_id,date,pred_m3\n'
        'site1,2025-06-01,100.0\n'
        'site1,2025-06-02,200.0\n'
        'site2,2025-06-01,80.0\n'
    )

    actuals_csv = Path(tempfile.gettempdir()) / 'test_actuals3.csv'
    actuals_csv.write_text(
        'site_id,date,actual_m3\n'
        'site1,2025-06-01,123.45\n'
        'site1,2025-06-02,234.56\n'
        'site2,2025-06-01,87.99\n'
    )

    output_csv = Path(tempfile.gettempdir()) / 'test_metrics3.csv'

    subprocess.run(
        [
            sys.executable, 'scripts/validate_forecast.py',
            str(forecast_csv), str(actuals_csv), str(output_csv)
        ],
        capture_output=True,
        text=True,
        cwd='/Users/m/ai/projects/forecastingrepo',
    )

    # Read the raw file content
    content = output_csv.read_text()

    # Individual per-row actuals should NOT appear
    assert '123.45' not in content
    assert '234.56' not in content
    assert '87.99' not in content

    # But aggregated total IS disclosed - this is OK per protocol
    metrics = pd.read_csv(output_csv)
    assert 'total_actual_m3' in metrics.columns
    # Total is 123.45 + 234.56 + 87.99 = 446.0
    assert abs(metrics['total_actual_m3'].iloc[0] - 446.0) < 0.01


def test_validate_forecast_per_site_output():
    """Test that per-site WAPE file is created."""
    forecast_csv = Path(tempfile.gettempdir()) / 'test_forecast4.csv'
    forecast_csv.write_text(
        'site_id,date,pred_m3\n'
        'site1,2025-06-01,100.0\n'
        'site2,2025-06-01,200.0\n'
    )

    actuals_csv = Path(tempfile.gettempdir()) / 'test_actuals4.csv'
    actuals_csv.write_text(
        'site_id,date,actual_m3\n'
        'site1,2025-06-01,110.0\n'
        'site2,2025-06-01,180.0\n'
    )

    output_csv = Path(tempfile.gettempdir()) / 'test_metrics4.csv'

    subprocess.run(
        [
            sys.executable, 'scripts/validate_forecast.py',
            str(forecast_csv), str(actuals_csv), str(output_csv)
        ],
        capture_output=True,
        text=True,
        cwd='/Users/m/ai/projects/forecastingrepo',
    )

    # Check per-site file exists
    per_site_path = output_csv.with_name('test_metrics4_per_site.csv')
    assert per_site_path.exists()

    per_site = pd.read_csv(per_site_path)
    assert 'site_id' in per_site.columns
    assert 'site_wape' in per_site.columns
    assert len(per_site) == 2
