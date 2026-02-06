#!/usr/bin/env python3
"""
Export forecast for blind validation.

TASK-30: Generate forecasts for blind validation by Jury.

Usage:
    python export_validation_forecast.py [--cutoff 2025-05-31] [--horizon 215] [--output forecast.csv]

Example:
    # Export with defaults (May 31 cutoff, 215-day horizon for June-Dec 2025)
    python export_validation_forecast.py

    # Custom cutoff and horizon
    python export_validation_forecast.py --cutoff 2025-04-15 --horizon 107

    # Custom output file
    python export_validation_forecast.py --output my_forecast.csv
"""
import sys
from datetime import date
from pathlib import Path
import argparse

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.sites.export_validation import export_forecast_for_validation


def main():
    parser = argparse.ArgumentParser(
        description='Export forecast for blind validation'
    )
    parser.add_argument(
        '--cutoff',
        type=lambda s: date.fromisoformat(s),
        default=date(2025, 5, 31),
        help='Cutoff date (default: 2025-05-31)',
    )
    parser.add_argument(
        '--horizon',
        type=int,
        default=215,
        help='Horizon days (default: 215 for May 31 -> Dec 31)',
    )
    parser.add_argument(
        '--output',
        type=Path,
        default=Path('forecast_for_validation.csv'),
        help='Output file path',
    )
    parser.add_argument(
        '--format',
        choices=['wide', 'long'],
        default='wide',
        help='Output format (default: wide)',
    )
    parser.add_argument(
        '--include-metadata',
        action='store_true',
        help='Include title/period rows in wide output',
    )

    args = parser.parse_args()

    export_forecast_for_validation(
        cutoff_date=args.cutoff,
        horizon_days=args.horizon,
        output_path=args.output,
        output_format=args.format,
        include_metadata=args.include_metadata,
    )


if __name__ == '__main__':
    main()
