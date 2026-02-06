"""
Tests for TASK-31: Metrics ingestion & tracking.
"""
from datetime import datetime
from pathlib import Path
import tempfile

import pandas as pd
import pytest


def test_metrics_tracker_ingestion():
    """Test metrics ingestion from CSV."""
    from src.sites.metrics_tracker import MetricsTracker

    with tempfile.TemporaryDirectory() as tmpdir:
        # Create test metrics CSV
        metrics_csv = Path(tmpdir) / 'test_metrics.csv'
        metrics_csv.write_text(
            'date_generated,overall_wape,total_forecast_m3,total_actual_m3,'
            'records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites\n'
            '2025-12-28T10:00:00,0.0823,123456.78,125000.00,5400,1000,45.2,72.8,95.0,38105070|38105071,site1|site2\n'
        )

        storage_path = Path(tmpdir) / 'test_metrics_history.parquet'
        tracker = MetricsTracker(storage_path)

        tracker.ingest_validation_csv(
            metrics_csv=metrics_csv,
            iteration=1,
            notes='baseline',
        )

        assert len(tracker.df) == 1
        assert tracker.df.iloc[0]['overall_wape'] == 0.0823
        assert tracker.df.iloc[0]['iteration'] == 1
        assert tracker.df.iloc[0]['notes'] == 'baseline'


def test_metrics_improvement():
    """Test improvement calculation between iterations."""
    from src.sites.metrics_tracker import MetricsTracker

    with tempfile.TemporaryDirectory() as tmpdir:
        storage_path = Path(tmpdir) / 'test_metrics_history.parquet'
        tracker = MetricsTracker(storage_path)

        # First iteration (baseline)
        metrics1 = Path(tmpdir) / 'metrics1.csv'
        metrics1.write_text(
            'date_generated,overall_wape,total_forecast_m3,total_actual_m3,'
            'records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites\n'
            '2025-12-28T10:00:00,0.10,100.0,110.0,1000,100,40.0,60.0,80.0,site1,site2\n'
        )
        tracker.ingest_validation_csv(metrics1, iteration=1, notes='baseline')

        # Second iteration (improved)
        metrics2 = Path(tmpdir) / 'metrics2.csv'
        metrics2.write_text(
            'date_generated,overall_wape,total_forecast_m3,total_actual_m3,'
            'records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites\n'
            '2025-12-28T11:00:00,0.05,105.0,110.0,1000,100,50.0,75.0,90.0,site1,site2\n'
        )
        tracker.ingest_validation_csv(metrics2, iteration=2, notes='improved')

        improvement = tracker.get_improvement()

        assert improvement['iterations'] == 2
        assert improvement['wape_improvement_pct'] == 50.0  # 0.10 -> 0.05 = 50% improvement
        assert improvement['within_20_improvement'] == 15.0  # 60 -> 75 = +15


def test_metrics_persistence():
    """Test that metrics are persisted to parquet."""
    from src.sites.metrics_tracker import MetricsTracker

    with tempfile.TemporaryDirectory() as tmpdir:
        storage_path = Path(tmpdir) / 'test_metrics_history.parquet'

        # First tracker instance
        tracker1 = MetricsTracker(storage_path)
        metrics_csv = Path(tmpdir) / 'metrics.csv'
        metrics_csv.write_text(
            'date_generated,overall_wape,total_forecast_m3,total_actual_m3,'
            'records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites\n'
            '2025-12-28T10:00:00,0.0823,100.0,110.0,1000,100,45.0,70.0,90.0,site1,site2\n'
        )
        tracker1.ingest_validation_csv(metrics_csv, iteration=1, notes='test')

        # New tracker instance should load persisted data
        tracker2 = MetricsTracker(storage_path)
        assert len(tracker2.df) == 1
        assert tracker2.df.iloc[0]['overall_wape'] == 0.0823


def test_metrics_get_history():
    """Test get_history returns summary DataFrame."""
    from src.sites.metrics_tracker import MetricsTracker

    with tempfile.TemporaryDirectory() as tmpdir:
        storage_path = Path(tmpdir) / 'test_metrics_history.parquet'
        tracker = MetricsTracker(storage_path)

        metrics_csv = Path(tmpdir) / 'metrics.csv'
        metrics_csv.write_text(
            'date_generated,overall_wape,total_forecast_m3,total_actual_m3,'
            'records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites\n'
            '2025-12-28T10:00:00,0.0823,100.0,110.0,1000,100,45.0,70.0,90.0,site1,site2\n'
        )
        tracker.ingest_validation_csv(metrics_csv, iteration=1, notes='test')

        history = tracker.get_history()
        assert 'iteration' in history.columns
        assert 'overall_wape' in history.columns
        assert 'within_20_pct' in history.columns
        assert len(history) == 1


def test_metrics_get_summary():
    """Test get_summary returns readable text."""
    from src.sites.metrics_tracker import MetricsTracker

    with tempfile.TemporaryDirectory() as tmpdir:
        storage_path = Path(tmpdir) / 'test_metrics_history.parquet'
        tracker = MetricsTracker(storage_path)

        # Insufficient data
        summary = tracker.get_summary()
        assert 'Insufficient data' in summary

        # Add two iterations
        for i in [1, 2]:
            metrics_csv = Path(tmpdir) / f'metrics{i}.csv'
            wape = 0.10 if i == 1 else 0.05
            metrics_csv.write_text(
                'date_generated,overall_wape,total_forecast_m3,total_actual_m3,'
                'records_evaluated,sites_evaluated,within_10_pct,within_20_pct,within_50_pct,worst_sites,best_sites\n'
                f'2025-12-28T{10+i}:00:00,{wape},100.0,110.0,1000,100,45.0,70.0,90.0,site1,site2\n'
            )
            tracker.ingest_validation_csv(metrics_csv, iteration=i)

        summary = tracker.get_summary()
        assert 'Iterations: 2' in summary
        assert 'WAPE improvement' in summary


def test_metrics_ingest_per_site_csv():
    """Test per-site CSV ingestion persists parquet."""
    from src.sites.metrics_tracker import MetricsTracker

    with tempfile.TemporaryDirectory() as tmpdir:
        storage_path = Path(tmpdir) / 'metrics_history.parquet'
        per_site_storage = Path(tmpdir) / 'metrics_history_per_site.parquet'
        tracker = MetricsTracker(storage_path, per_site_storage)

        per_site_csv = Path(tmpdir) / 'metrics_per_site.csv'
        per_site_csv.write_text(
            'site_id,site_wape\n'
            'S1,0.10\n'
            'S2,0.20\n'
        )
        tracker.ingest_per_site_csv(per_site_csv, iteration=1)

        assert per_site_storage.exists()
        per_site_df = pd.read_parquet(per_site_storage)
        assert 'site_id' in per_site_df.columns
        assert 'site_wape' in per_site_df.columns
        assert 'iteration' in per_site_df.columns
