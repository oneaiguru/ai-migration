#!/usr/bin/env python3
"""
Ingest validation metrics from Jury.

TASK-31: Track metrics across algorithm iterations.

Usage:
    python ingest_validation_metrics.py metrics.csv --iteration 1 --notes "baseline"

Example:
    # Ingest baseline metrics
    python ingest_validation_metrics.py metrics.csv --iteration 1 --notes "baseline"

    # With algorithm params
    python ingest_validation_metrics.py metrics.csv --iteration 2 \
      --params '{"window_days": 84, "holiday_multiplier": 1.2}' \
      --notes "increased holiday effect"
"""
import sys
from pathlib import Path
import argparse
import json

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.sites.metrics_tracker import MetricsTracker


def main():
    parser = argparse.ArgumentParser(description='Ingest validation metrics')
    parser.add_argument('metrics_csv', type=Path, help='Metrics CSV from Jury')
    parser.add_argument('--iteration', type=int, required=True, help='Iteration number')
    parser.add_argument('--params', type=str, help='Algorithm params as JSON')
    parser.add_argument('--notes', type=str, default='', help='Notes about this iteration')
    parser.add_argument(
        '--storage',
        type=Path,
        default=Path('data/metrics_history.parquet'),
        help='Storage path',
    )

    args = parser.parse_args()

    # Parse params if provided
    params = None
    if args.params:
        params = json.loads(args.params)

    tracker = MetricsTracker(args.storage)
    tracker.ingest_validation_csv(
        metrics_csv=args.metrics_csv,
        iteration=args.iteration,
        algorithm_params=params,
        notes=args.notes,
    )

    print("\n" + tracker.get_summary())
    print("\nHistory:")
    print(tracker.get_history().to_string(index=False))


if __name__ == '__main__':
    main()
