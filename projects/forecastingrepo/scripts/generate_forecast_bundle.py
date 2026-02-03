#!/usr/bin/env python3
"""
Generate forecast bundle for sharing.

TASK-32: Create bundle with CSV, Excel, and summary JSON.

Usage:
    python generate_forecast_bundle.py --cutoff 2025-05-31 --horizon 30
"""
import sys
import json
from datetime import date, datetime
from pathlib import Path
import argparse

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.sites.rolling_forecast import generate_rolling_forecast
from src.sites.rolling_types import ForecastRequest


def generate_bundle(
    cutoff_date: date,
    horizon_days: int,
    output_dir: Path = Path('output/bundles'),
) -> Path:
    """
    Generate complete forecast bundle.

    Creates directory with:
    - forecast.csv (validation format)
    - forecast.xlsx (multi-sheet Excel)
    - summary.json (metadata)

    Returns path to bundle directory.
    """
    print(f"Generating forecast: cutoff={cutoff_date}, horizon={horizon_days}...")

    request = ForecastRequest(
        cutoff_date=cutoff_date,
        horizon_days=horizon_days,
    )

    result = generate_rolling_forecast(request, use_cache=True)

    # Create bundle directory
    bundle_name = f"forecast_{cutoff_date}_{horizon_days}d"
    bundle_dir = output_dir / bundle_name
    bundle_dir.mkdir(parents=True, exist_ok=True)

    df = result.forecast_df.copy()
    df['pred_m3'] = df['pred_volume_m3']
    df_sorted = df.sort_values(['site_id', 'date']).copy()
    df_sorted['pred_delta_m3'] = (
        df_sorted.groupby('site_id')['pred_m3'].diff().fillna(df_sorted['pred_m3'])
    )
    total_forecast_m3 = df_sorted['pred_delta_m3'].sum()

    # 1. CSV (validation format)
    csv_path = bundle_dir / "forecast.csv"
    df[['site_id', 'date', 'pred_m3']].sort_values(
        by=['site_id', 'date']
    ).to_csv(csv_path, index=False)
    print(f"  ✓ CSV: {csv_path}")

    # 2. Excel (multi-sheet)
    xlsx_path = bundle_dir / "forecast.xlsx"
    import pandas as pd
    with pd.ExcelWriter(xlsx_path, engine='openpyxl') as writer:
        # Summary sheet
        summary_df = pd.DataFrame([{
            'Cutoff Date': str(cutoff_date),
            'Horizon Days': horizon_days,
            'Site Count': result.site_count,
            'Total Forecast (m³)': total_forecast_m3,
            'Generated At': result.generated_at,
        }])
        summary_df.to_excel(writer, sheet_name='Summary', index=False)

        # Daily data sheet(s) - split if too large
        daily_data_df = df[['site_id', 'date', 'pred_m3', 'fill_pct', 'overflow_prob']]
        max_rows_per_sheet = 1000000  # Excel limit is 1,048,576 rows

        if len(daily_data_df) > max_rows_per_sheet:
            # Split into multiple sheets
            num_sheets = (len(daily_data_df) // max_rows_per_sheet) + 1
            for i in range(num_sheets):
                start_idx = i * max_rows_per_sheet
                end_idx = (i + 1) * max_rows_per_sheet
                sheet_data = daily_data_df.iloc[start_idx:end_idx]
                sheet_name = f'Daily Data {i+1}' if num_sheets > 1 else 'Daily Data'
                sheet_data.to_excel(writer, sheet_name=sheet_name, index=False)
        else:
            # Single sheet is sufficient
            daily_data_df.to_excel(writer, sheet_name='Daily Data', index=False)
    print(f"  ✓ Excel: {xlsx_path}")

    # 3. Summary JSON
    summary = {
        'cutoff_date': str(cutoff_date),
        'horizon_days': horizon_days,
        'site_count': result.site_count,
        'total_forecast_m3': round(total_forecast_m3, 2),
        'row_count': len(df),
        'generated_at': result.generated_at,
        'files': ['forecast.csv', 'forecast.xlsx', 'summary.json'],
    }
    json_path = bundle_dir / "summary.json"
    json_path.write_text(json.dumps(summary, indent=2))
    print(f"  ✓ JSON: {json_path}")

    print(f"\n✓ Bundle created: {bundle_dir}")
    return bundle_dir


def main():
    parser = argparse.ArgumentParser(description='Generate forecast bundle')
    parser.add_argument('--cutoff', type=lambda s: date.fromisoformat(s), default=date(2025, 5, 31))
    parser.add_argument('--horizon', type=int, default=30)
    parser.add_argument('--output', type=Path, default=Path('output/bundles'))

    args = parser.parse_args()

    generate_bundle(
        cutoff_date=args.cutoff,
        horizon_days=args.horizon,
        output_dir=args.output,
    )


if __name__ == '__main__':
    main()
