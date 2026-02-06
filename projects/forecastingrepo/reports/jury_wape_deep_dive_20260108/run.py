import argparse
import csv
from pathlib import Path
from typing import Optional, Tuple

import numpy as np
import pandas as pd

EXPECTED_JUN_OCT_TOTAL = 3_227_211.74632277
NUM_JUN_OCT_DAYS = 153


def parse_float(value: str) -> float:
    if value is None:
        return 0.0
    value = value.strip()
    if not value:
        return 0.0
    try:
        return float(value.replace(',', '.'))
    except ValueError:
        return 0.0


def load_jury_metrics(excel_path: Path) -> Tuple[pd.DataFrame, Optional[dict]]:
    df = pd.read_excel(excel_path, sheet_name='Оценка качества')
    total_metrics = None
    total_row = df[
        df['ID площадки'].astype(str).str.contains('ИТОГО', na=False)
    ]
    if not total_row.empty:
        total_metrics = {
            'MAE': pd.to_numeric(total_row.iloc[0]['MAE'], errors='coerce'),
            'RMSE': pd.to_numeric(total_row.iloc[0]['RMSE'], errors='coerce'),
            'WAPE': pd.to_numeric(total_row.iloc[0]['WAPE'], errors='coerce'),
            'days': pd.to_numeric(total_row.iloc[0]['Кол-во дней'], errors='coerce'),
        }
    df['id_num'] = pd.to_numeric(df['ID площадки'], errors='coerce')
    df = df[df['id_num'].notna()].copy()
    df['site_id'] = df['id_num'].astype(int).astype(str)
    for col in ['MAE', 'RMSE', 'WAPE', 'Кол-во дней']:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    return df, total_metrics


def compute_forecast_totals(csv_path: Path) -> tuple[pd.DataFrame, float, int]:
    totals = {}
    total_sum = 0.0
    row_count = 0
    with open(csv_path, newline='') as f:
        reader = csv.reader(f, delimiter=';')
        header = next(reader)
        expected_cols = 1 + NUM_JUN_OCT_DAYS
        if len(header) < expected_cols:
            raise ValueError(
                f"Expected at least {expected_cols} columns but got {len(header)}"
            )
        for row in reader:
            if not row:
                continue
            site_id = row[0].strip()
            row_total = 0.0
            end_idx = min(expected_cols, len(row))
            for value in row[1:end_idx]:
                row_total += parse_float(value)
            totals[site_id] = row_total
            total_sum += row_total
            row_count += 1
    totals_df = pd.DataFrame(
        {'site_id': list(totals.keys()), 'forecast_total': list(totals.values())}
    )
    return totals_df, total_sum, row_count


def load_district_mapping(mapping_path: Path) -> pd.DataFrame:
    mapping = pd.read_csv(mapping_path, sep=';', header=5)
    mapping = mapping[['Район', 'Участок', 'Лот', 'Код КП']].copy()
    mapping['site_id'] = mapping['Код КП'].astype(str)
    mapping = mapping.dropna(subset=['site_id'])
    mapping = mapping.drop_duplicates(subset=['site_id'])
    return mapping


def percentile(series: pd.Series, q: float) -> float:
    return float(np.percentile(series.to_numpy(), q))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--outdir', required=True)
    args = parser.parse_args()

    report_dir = Path(args.outdir)
    report_dir.mkdir(parents=True, exist_ok=True)

    excel_path = Path(
        '/Users/m/Downloads/Telegram Desktop/Оценка качества прогноза.xlsx'
    )
    forecast_path = Path(
        'projects/forecastingrepo/sent/forecast_jun_dec_2025_jury_format_daily.csv'
    )
    mapping_path = Path(
        'projects/forecastingrepo/data/raw/jury_volumes/derived/'
        'jury_volumes_2025-01-01_to_2025-05-31_all_sites.csv'
    )

    metrics_df, total_metrics = load_jury_metrics(excel_path)
    metrics_count = len(metrics_df)
    duplicate_sites = int(metrics_df['site_id'].duplicated().sum())

    wape_series = metrics_df['WAPE'].dropna()
    wape_stats = {
        'mean': float(wape_series.mean()),
        'median': float(wape_series.median()),
        'p75': percentile(wape_series, 75),
        'p90': percentile(wape_series, 90),
        'p95': percentile(wape_series, 95),
        'p99': percentile(wape_series, 99),
        'max': float(wape_series.max()),
    }
    wape_counts = {
        'eq_0': int((wape_series == 0).sum()),
        'gt_10': int((wape_series > 10).sum()),
        'gt_100': int((wape_series > 100).sum()),
        'gt_1000': int((wape_series > 1000).sum()),
    }

    days_corr = float(
        metrics_df[['WAPE', 'Кол-во дней']].dropna().corr().iloc[0, 1]
    )

    totals_df, totals_sum, totals_rows = compute_forecast_totals(forecast_path)

    joined = metrics_df.merge(totals_df, on='site_id', how='left', indicator=True)
    join_both = int((joined['_merge'] == 'both').sum())
    missing_in_forecast = joined.loc[joined['_merge'] == 'left_only', 'site_id']
    missing_in_forecast_list = missing_in_forecast.astype(str).tolist()
    missing_in_excel = sorted(
        set(totals_df['site_id']) - set(metrics_df['site_id'])
    )

    analysis_df = joined[joined['_merge'] == 'both'].copy()
    analysis_df = analysis_df.dropna(subset=['WAPE', 'forecast_total'])

    n_sites = len(analysis_df)
    rank = analysis_df['forecast_total'].rank(method='first')
    analysis_df['decile'] = ((rank - 1) / n_sites * 10).astype(int) + 1

    def p90(series: pd.Series) -> float:
        return percentile(series, 90)

    volume_bins = (
        analysis_df.groupby('decile')
        .agg(
            n_sites=('site_id', 'size'),
            mean_forecast_total=('forecast_total', 'mean'),
            median_WAPE=('WAPE', 'median'),
            p90_WAPE=('WAPE', p90),
        )
        .reset_index()
        .sort_values('decile')
    )
    volume_bins_indexed = volume_bins.set_index('decile')
    low_decile = volume_bins_indexed.loc[1]
    high_decile = volume_bins_indexed.loc[10]

    log_total = np.log10(analysis_df['forecast_total'] + 1)
    wape_clip = analysis_df['WAPE'].clip(upper=50)
    corr = float(np.corrcoef(log_total, wape_clip)[0, 1])

    total_volume = analysis_df['forecast_total'].sum()
    weighted_wape = float(
        (analysis_df['WAPE'] * analysis_df['forecast_total']).sum() / total_volume
    )

    sorted_df = analysis_df.sort_values('forecast_total', ascending=False)
    cum_volume = sorted_df['forecast_total'].cumsum()
    cutoff = 0.8 * total_volume
    top_mask = cum_volume <= cutoff
    if not top_mask.any():
        top_mask.iloc[0] = True
    top80_df = sorted_df[top_mask]

    top80_median = float(top80_df['WAPE'].median())
    top80_p90 = percentile(top80_df['WAPE'], 90)

    volume_shares = {}
    for threshold in (1, 5, 10):
        share = (
            analysis_df.loc[analysis_df['WAPE'] > threshold, 'forecast_total'].sum()
            / total_volume
        )
        volume_shares[threshold] = float(share)

    days_bins = pd.cut(
        metrics_df['Кол-во дней'],
        bins=[0, 30, 60, 90, 120, 153],
        labels=['1-30', '31-60', '61-90', '91-120', '121-153'],
        include_lowest=True,
    )
    days_summary = (
        metrics_df.assign(days_bin=days_bins)
        .groupby('days_bin')
        .agg(
            n_sites=('site_id', 'size'),
            median_WAPE=('WAPE', 'median'),
            p90_WAPE=('WAPE', p90),
        )
        .reset_index()
    )

    mapping_df = load_district_mapping(mapping_path)
    analysis_df = analysis_df.merge(
        mapping_df[['site_id', 'Район', 'Участок', 'Лот']],
        on='site_id',
        how='left',
    )

    district_stats = (
        analysis_df.dropna(subset=['Район'])
        .groupby('Район')
        .apply(
            lambda group: pd.Series(
                {
                    'n_sites': len(group),
                    'weighted_wape': float(
                        (group['WAPE'] * group['forecast_total']).sum()
                        / group['forecast_total'].sum()
                    )
                    if group['forecast_total'].sum() > 0
                    else np.nan,
                    'share_bad_sites': float((group['WAPE'] > 5).mean()),
                    'total_volume': float(group['forecast_total'].sum()),
                    'median_wape': float(group['WAPE'].median()),
                    'p90_wape': percentile(group['WAPE'], 90),
                }
            )
        )
        .reset_index()
    )

    top_weighted = district_stats.sort_values(
        'weighted_wape', ascending=False
    ).head(10)
    top_bad_share = district_stats.sort_values(
        'share_bad_sites', ascending=False
    ).head(10)

    worst_sites = (
        analysis_df.sort_values('WAPE', ascending=False)
        .head(200)
        .loc[
            :,
            ['site_id', 'WAPE', 'MAE', 'Кол-во дней', 'forecast_total', 'Район'],
        ]
        .rename(
            columns={
                'Кол-во дней': 'days',
                'Район': 'district',
            }
        )
    )
    best_sites = (
        analysis_df.sort_values('WAPE', ascending=True)
        .head(200)
        .loc[
            :,
            ['site_id', 'WAPE', 'MAE', 'Кол-во дней', 'forecast_total', 'Район'],
        ]
        .rename(
            columns={
                'Кол-во дней': 'days',
                'Район': 'district',
            }
        )
    )

    volume_bins.to_csv(report_dir / 'metrics_by_volume_bin.csv', index=False)
    days_summary.to_csv(report_dir / 'metrics_by_days_bin.csv', index=False)
    worst_sites.to_csv(report_dir / 'worst_sites.csv', index=False)
    best_sites.to_csv(report_dir / 'best_sites.csv', index=False)
    district_stats.rename(columns={'Район': 'district'}).to_csv(
        report_dir / 'district_summary.csv', index=False
    )

    summary_lines = [
        '# Jury WAPE Deep Dive Summary',
        '',
        '## Key checks',
        f'- Excel parsed sites: {metrics_count:,} (duplicates: {duplicate_sites})',
        f'- Forecast rows (daily wide): {totals_rows:,}',
        (
            f"- Jun–Oct forecast total: {totals_sum:,.6f} "
            f"(expected {EXPECTED_JUN_OCT_TOTAL:,.6f}, diff "
            f"{totals_sum - EXPECTED_JUN_OCT_TOTAL:,.6f})"
        ),
        f'- Joined rows: {join_both:,} ({join_both / metrics_count:.2%} of Excel)',
    ]
    if missing_in_forecast_list:
        summary_lines.append(
            '- Missing in forecast (first 20 IDs): '
            + ', '.join(missing_in_forecast_list[:20])
        )
    if missing_in_excel:
        summary_lines.append(
            '- Missing in Excel (first 20 IDs): '
            + ', '.join(missing_in_excel[:20])
        )
    if total_metrics and pd.notna(total_metrics.get('WAPE')):
        summary_lines.append(
            f"- Jury total row WAPE: {total_metrics['WAPE']:.4f} "
            f"({total_metrics['WAPE'] * 100:.1f}%)"
        )

    summary_lines += [
        '',
        '## WAPE distribution (per-site)',
        (
            f"- mean {wape_stats['mean']:.4f}; median {wape_stats['median']:.4f}; "
            f"p75 {wape_stats['p75']:.4f}; p90 {wape_stats['p90']:.4f}; "
            f"p95 {wape_stats['p95']:.4f}; p99 {wape_stats['p99']:.4f}; "
            f"max {wape_stats['max']:.4f}"
        ),
        (
            f"- WAPE==0: {wape_counts['eq_0']:,}; "
            f">10: {wape_counts['gt_10']:,}; "
            f">100: {wape_counts['gt_100']:,}; "
            f">1000: {wape_counts['gt_1000']:,}"
        ),
        '- WAPE values are ratios; multiply by 100 to interpret as percent.',
        '',
        '## Why “~4% overall” vs 127.8% WAPE',
        (
            'A small overall % usually reflects net bias on total sum '
            '(sum forecast vs sum actual). WAPE is sum of absolute errors '
            'over sum actual and does not cancel, so it can be large even if '
            'totals match.'
        ),
        (
            'If actuals are spiky (service days) and the forecast is smooth, '
            'day-level absolute errors are large while totals can still align.'
        ),
        '',
        '## Small-site dominance checks',
        (
            'Per-site WAPE can look bad because many sites have tiny volume; '
            'small denominators inflate WAPE, while aggregate bias can remain small '
            'due to cancellation across sites.'
        ),
        (
            'Volume deciles show WAPE falling with size: '
            f"decile 1 median {low_decile['median_WAPE']:.4f} vs decile 10 median "
            f"{high_decile['median_WAPE']:.4f} (see metrics_by_volume_bin.csv)."
        ),
        (
            f"- Correlation log10(forecast_total+1) vs WAPE (clipped to 50): "
            f"{corr:.4f}"
        ),
        (
            f"- WAPE micro proxy (forecast-weighted): {weighted_wape:.4f}"
        ),
        (
            f"- Top 80% volume WAPE: median {top80_median:.4f}, p90 {top80_p90:.4f}"
        ),
        (
            'Volume share from sites with high WAPE: '
            f">1: {volume_shares[1]:.2%}, >5: {volume_shares[5]:.2%}, "
            f">10: {volume_shares[10]:.2%}"
        ),
        '',
        '## Service-day pattern check (limited by inputs)',
        (
            f"- Correlation WAPE vs days available: {days_corr:.4f} (weak). "
            'Most sites have 121–153 days, so sparse coverage alone does not '
            'explain high WAPE.'
        ),
        (
            'To confirm service-day spikes vs smooth forecasts, we need '
            'per-site sum_actual, sum_forecast, sum_abs_error, days, and ideally '
            'count_nonzero_actual_days (no raw daily table).'
        ),
        (
            'If the business goal is totals, consider weekly/monthly evaluation, '
            'or infer pickup intervals and allocate volume to service days.'
        ),
        '',
        '## District highlights',
        'Top districts by weighted WAPE (forecast-weighted):',
    ]

    for _, row in top_weighted.iterrows():
        summary_lines.append(
            f"- {row['Район']}: weighted WAPE {row['weighted_wape']:.4f}, "
            f"volume {row['total_volume']:.1f}"
        )

    summary_lines.append('Top districts by share of bad sites (WAPE>5):')
    for _, row in top_bad_share.iterrows():
        summary_lines.append(
            f"- {row['Район']}: bad-site share {row['share_bad_sites']:.2%}, "
            f"n={int(row['n_sites'])}"
        )

    summary_lines.append('')
    summary_lines.append(
        'See metrics_by_volume_bin.csv, metrics_by_days_bin.csv, '
        'best_sites.csv, worst_sites.csv, and district_summary.csv for detail.'
    )

    (report_dir / 'SUMMARY.md').write_text('\n'.join(summary_lines), encoding='utf-8')

    repro_lines = [
        '# Repro',
        '',
        'Run from repo root:',
        f'```bash\npython {report_dir}/run.py --outdir {report_dir}\n```',
    ]
    (report_dir / 'REPRO.md').write_text('\n'.join(repro_lines), encoding='utf-8')


if __name__ == '__main__':
    main()
