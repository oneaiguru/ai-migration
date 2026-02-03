#!/usr/bin/env python3
"""
Evaluation-only CLI: join local weather files to districts and emit A/B report.
No pipeline changes; writes under reports/weather_ab/.
"""
import argparse
import csv
import os
from datetime import datetime

def ensure_dir(p):
    os.makedirs(p, exist_ok=True)

def parse_args():
    p = argparse.ArgumentParser(description='Local weather A/B report (evaluation-only)')
    p.add_argument('--stations-csv', required=True)
    p.add_argument('--daily-weather-csv', required=True)
    p.add_argument('--district-geojson', required=True)
    p.add_argument('--outdir', required=True)
    return p.parse_args()

def main(argv=None):
    args = parse_args()
    ts = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    outdir = os.path.join(args.outdir, f'weather_ab_{ts}')
    ensure_dir(outdir)
    # Minimal outputs: mapping summary + dummy corr table schema
    with open(os.path.join(outdir, 'mapping_summary.md'), 'w', encoding='utf-8') as f:
        f.write('# Weather A/B Mapping Summary\n\n')
        f.write('- stations: {}\n'.format(os.path.basename(args.stations_csv)))
        f.write('- daily: {}\n'.format(os.path.basename(args.daily_weather_csv)))
        f.write('- districts: {}\n'.format(os.path.basename(args.district_geojson)))
    with open(os.path.join(outdir, 'corr_tables_daily.csv'), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['district','lag','metric','value'])
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
