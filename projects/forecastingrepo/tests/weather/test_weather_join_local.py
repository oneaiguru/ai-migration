from pathlib import Path
import json
import csv
import subprocess, sys

def test_weather_join_local_cli(tmp_path: Path, monkeypatch):
    stations = tmp_path / 'stations.csv'
    stations.write_text('''id,lat,lon
S1,0,0
''', encoding='utf-8')
    daily = tmp_path / 'daily.csv'
    daily.write_text('''date,station_id,tmean_c,precip_mm
2024-01-01,S1,0,0
''', encoding='utf-8')
    districts = tmp_path / 'districts.geojson'
    districts.write_text(json.dumps({'type':'FeatureCollection','features':[]}), encoding='utf-8')
    outdir = tmp_path / 'out'
    cmd = [sys.executable, 'scripts/weather_join_local.py',
           '--stations-csv', str(stations),
           '--daily-weather-csv', str(daily),
           '--district-geojson', str(districts),
           '--outdir', str(outdir)]
    res = subprocess.run(cmd, check=True)
    assert res.returncode == 0
    # Check outputs
    found = list((outdir).glob('weather_ab_*/'))
    assert found, 'no output folder created'
    report_dir = found[0]
    assert (report_dir / 'mapping_summary.md').exists()
    assert (report_dir / 'corr_tables_daily.csv').exists()
    # CSV has header
    rows = list(csv.reader((report_dir / 'corr_tables_daily.csv').open()))
    assert rows and rows[0] == ['district','lag','metric','value']
