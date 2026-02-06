"""
Metrics ingestion and tracking for validation feedback.

TASK-31: Track validation metrics across algorithm iterations.
"""
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
import json

import pandas as pd


class MetricsTracker:
    """Track validation metrics across algorithm iterations."""

    def __init__(
        self,
        storage_path: Path = Path('data/metrics_history.parquet'),
        per_site_storage_path: Path = Path('data/metrics_history_per_site.parquet'),
    ):
        """
        Initialize metrics tracker.

        Args:
            storage_path: Path to parquet file for persistent storage
        """
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.per_site_storage_path = Path(per_site_storage_path)
        self.per_site_storage_path.parent.mkdir(parents=True, exist_ok=True)

        if self.storage_path.exists():
            self.df = pd.read_parquet(self.storage_path)
        else:
            self.df = pd.DataFrame()

    def ingest_validation_csv(
        self,
        metrics_csv: Path,
        iteration: int,
        algorithm_params: Optional[Dict[str, Any]] = None,
        notes: str = '',
    ) -> None:
        """
        Ingest metrics CSV from Jury's validation script.

        Args:
            metrics_csv: Path to metrics.csv from TASK-29
            iteration: Version number (1, 2, 3, ...)
            algorithm_params: Dict of algorithm settings used
            notes: Free-text notes about this iteration
        """
        print(f"Ingesting metrics from {metrics_csv}...")

        # Read Jury's metrics
        jury_metrics = pd.read_csv(metrics_csv)

        if len(jury_metrics) != 1:
            raise ValueError(f"Expected 1 row, got {len(jury_metrics)}")

        row = jury_metrics.iloc[0].to_dict()

        # Build our record
        record = {
            'timestamp': datetime.now().isoformat(),
            'generated_at': str(row.get('date_generated', '')),
            'iteration': iteration,
            'algorithm_params': json.dumps(algorithm_params or {}),
            'overall_wape': float(row.get('overall_wape', 0)),
            'total_forecast_m3': float(row.get('total_forecast_m3', 0)),
            'total_actual_m3': float(row.get('total_actual_m3', 0)),
            'records_evaluated': int(row.get('records_evaluated', 0)),
            'sites_evaluated': int(row.get('sites_evaluated', 0)),
            'within_10_pct': float(row.get('within_10_pct', 0)),
            'within_20_pct': float(row.get('within_20_pct', 0)),
            'within_50_pct': float(row.get('within_50_pct', 0)),
            'worst_sites': str(row.get('worst_sites', '')),
            'best_sites': str(row.get('best_sites', '')),
            'notes': notes,
        }

        # Append to history
        self.df = pd.concat(
            [self.df, pd.DataFrame([record])],
            ignore_index=True,
        )

        # Save
        self.save()

        print(f"Ingested: WAPE={record['overall_wape']:.4f}, "
              f"sites={record['sites_evaluated']}, "
              f"within_20%={record['within_20_pct']:.1f}%")

    def save(self) -> None:
        """Save metrics to storage."""
        self.df.to_parquet(self.storage_path, index=False)

    def ingest_per_site_csv(
        self,
        per_site_csv: Path,
        iteration: int | None = None,
    ) -> None:
        """
        Ingest per-site metrics CSV and persist latest snapshot.

        Args:
            per_site_csv: Path to per-site metrics CSV from validate_forecast.py
            iteration: Optional iteration number to tag the snapshot
        """
        per_site_df = pd.read_csv(per_site_csv)
        if "site_id" not in per_site_df.columns or "site_wape" not in per_site_df.columns:
            raise ValueError("Per-site CSV must include site_id and site_wape columns")
        if iteration is not None:
            per_site_df["iteration"] = iteration
        per_site_df.to_parquet(self.per_site_storage_path, index=False)

    def get_improvement(self) -> Dict[str, float]:
        """
        Compare latest vs initial results.

        Returns:
            Dict with improvement metrics, or empty dict if insufficient data
        """
        if len(self.df) < 2:
            return {}

        initial = self.df.iloc[0]
        latest = self.df.iloc[-1]

        initial_wape = float(initial['overall_wape'])
        latest_wape = float(latest['overall_wape'])

        wape_improvement = (
            (initial_wape - latest_wape) / initial_wape * 100
            if initial_wape > 0 else 0.0
        )

        return {
            'wape_improvement_pct': wape_improvement,
            'within_20_improvement': (
                float(latest['within_20_pct']) - float(initial['within_20_pct'])
            ),
            'records_evaluated': int(latest['records_evaluated']),
            'iterations': len(self.df),
        }

    def get_summary(self) -> str:
        """Get readable summary of improvements."""
        improvement = self.get_improvement()

        if not improvement:
            return "Insufficient data for improvement analysis"

        return (
            f"Improvement Summary:\n"
            f"  Iterations: {improvement['iterations']}\n"
            f"  WAPE improvement: {improvement['wape_improvement_pct']:.1f}%\n"
            f"  Within 20% improvement: +{improvement['within_20_improvement']:.1f}%\n"
            f"  Records evaluated: {improvement['records_evaluated']:,}"
        )

    def get_history(self) -> pd.DataFrame:
        """Get full history with key columns."""
        if self.df.empty:
            return pd.DataFrame(
                columns=['timestamp', 'iteration', 'overall_wape', 'within_20_pct', 'notes']
            )
        return self.df[
            ['timestamp', 'iteration', 'overall_wape', 'within_20_pct', 'notes']
        ].copy()

    def get_latest_site_metrics(self, per_site_path: Path | None = None) -> pd.DataFrame:
        """
        Load per-site metrics from the latest validation run.

        Args:
            per_site_path: Optional path to per-site metrics CSV

        Returns:
            DataFrame with columns: site_id, site_wape, completeness (if available)
        """
        if per_site_path and per_site_path.exists():
            return pd.read_csv(per_site_path)
        if self.per_site_storage_path.exists():
            return pd.read_parquet(self.per_site_storage_path)
        return pd.DataFrame(columns=['site_id', 'site_wape'])
