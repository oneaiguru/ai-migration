#!/usr/bin/env python3
"""DuckDB-based data quality analysis for forecast validation readiness."""
from __future__ import annotations
import argparse
import csv
import hashlib
import subprocess
import tempfile
from datetime import date, datetime
from pathlib import Path
import sys
import duckdb

sys.path.insert(0, str(Path(__file__).parent.parent))

FORECAST_DEFAULT = Path("jury_blind_forecast/forecast_jun_dec_2025.csv")
SERVICE_DEFAULT = Path("data/sites_service.csv")
REGISTRY_DEFAULT = Path("data/sites_registry.csv")
FORECAST_START_DEFAULT = date(2025, 6, 1)
FORECAST_END_DEFAULT = date(2025, 12, 31)
BASELINE_YEAR = 2024
BLOCKER_THRESHOLDS = {"duplicates": 1, "null_site_id": 1, "null_date": 1, "null_forecast_m3": 1, "negative_forecast": 1}
INFO_THRESHOLDS = {"date_gaps_any": True, "malformed_ids_any": True, "missing_registry": True}
HEADER_SITE = "Код КП"


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Data quality analysis for forecast validation")
    p.add_argument("--outdir", default="reports/data_quality", help="Output directory")
    p.add_argument("--forecast-path", default=str(FORECAST_DEFAULT))
    p.add_argument("--forecast-format", choices=["auto", "long", "wide"], default="auto")
    p.add_argument("--service-path", default=str(SERVICE_DEFAULT))
    p.add_argument("--registry-path", default=str(REGISTRY_DEFAULT))
    p.add_argument("--forecast-start", default=str(FORECAST_START_DEFAULT))
    p.add_argument("--forecast-end", default=str(FORECAST_END_DEFAULT))
    p.add_argument("--baseline-year", type=int, default=BASELINE_YEAR)
    return p.parse_args()


def get_git_commit() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent,
        )
        return result.stdout.strip()[:8] if result.returncode == 0 else "unknown"
    except Exception:
        return "unknown"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    try:
        with path.open("rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                h.update(chunk)
        return h.hexdigest()[:16]
    except FileNotFoundError:
        return "FILE_NOT_FOUND"


def sql_quote(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def pct(part: float, total: float) -> float:
    return (part / total * 100.0) if total else 0.0


def write_csv(con: duckdb.DuckDBPyConnection, sql: str, out_path: Path) -> int:
    count = con.execute(f"SELECT COUNT(*) FROM ({sql}) AS subq").fetchone()[0] or 0
    query = sql if count else f"SELECT * FROM ({sql}) AS subq LIMIT 0"
    con.execute(f"COPY ({query}) TO {sql_quote(str(out_path))} (HEADER, DELIMITER ',')")
    return int(count)


def has_wide_header(path: Path) -> bool:
    with path.open("r", encoding="utf-8") as fh:
        reader = csv.reader(fh, delimiter=";")
        for row in reader:
            if not row or not any(cell.strip() for cell in row):
                continue
            first = row[0].strip().lstrip("\ufeff").strip('"')
            if first == HEADER_SITE:
                return True
    return False


def main() -> int:
    args = parse_args()
    outdir = Path(args.outdir); outdir.mkdir(parents=True, exist_ok=True)
    forecast_source_path = Path(args.forecast_path)
    forecast_path = forecast_source_path
    service_path = Path(args.service_path); registry_path = Path(args.registry_path)
    forecast_start = date.fromisoformat(args.forecast_start); forecast_end = date.fromisoformat(args.forecast_end)
    baseline_year = args.baseline_year; expected_days = (forecast_end - forecast_start).days + 1
    temp_path: Path | None = None
    try:
        if args.forecast_format in {"auto", "wide"}:
            is_wide = args.forecast_format == "wide" or has_wide_header(forecast_path)
            if is_wide:
                from src.sites.wide_report import read_wide_report
                df = read_wide_report(forecast_path, forecast_start, forecast_end, "forecast_m3")
                tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".csv")
                tmp.close()
                df.to_csv(tmp.name, index=False)
                temp_path = Path(tmp.name)
                forecast_path = temp_path
        con = duckdb.connect()

        con.execute(
            f"CREATE TEMP TABLE forecast_raw AS SELECT site_id::VARCHAR AS site_id, CAST(date AS DATE) AS date, forecast_m3::DOUBLE AS forecast_m3 "
            f"FROM read_csv({sql_quote(str(forecast_path))}, columns={{'site_id': 'VARCHAR', 'date': 'DATE', 'forecast_m3': 'DOUBLE'}}, header=true, dateformat='%Y-%m-%d') "
            f"WHERE date BETWEEN {sql_quote(forecast_start.isoformat())} AND {sql_quote(forecast_end.isoformat())}"
        )
        delta_stats_sql = (
            "SELECT COUNT(*) AS total, "
            "MIN(delta_m3) AS min_delta "
            "FROM ("
            "SELECT forecast_m3, prev, forecast_m3 - prev AS delta_m3 "
            "FROM ("
            "SELECT forecast_m3, LAG(forecast_m3) OVER (PARTITION BY site_id ORDER BY date) AS prev "
            "FROM forecast_raw"
            ")"
            ") "
            "WHERE prev IS NOT NULL AND forecast_m3 >= 0 AND prev >= 0"
        )
        total, min_delta = con.execute(delta_stats_sql).fetchone()
        total = int(total or 0)
        min_delta = float(min_delta) if min_delta is not None else 0.0
        if total and min_delta < -1e-9:
            raise RuntimeError(
                "forecast_m3 appears non-cumulative (negative deltas detected); "
                "no monthly resets; must be cumulative across entire window."
            )
        con.execute("CREATE TEMP TABLE forecast AS SELECT * FROM forecast_raw")
        con.execute(
            f"CREATE TEMP TABLE service AS SELECT site_id::VARCHAR AS site_id, CAST(service_dt AS DATE) AS service_dt, collect_volume_m3::DOUBLE AS collect_volume_m3, volume_m3::DOUBLE AS volume_m3, source::VARCHAR AS source "
            f"FROM read_csv({sql_quote(str(service_path))}, columns={{'site_id': 'VARCHAR', 'service_dt': 'DATE', 'collect_volume_m3': 'DOUBLE', 'volume_m3': 'DOUBLE', 'source': 'VARCHAR'}}, header=true, dateformat='%Y-%m-%d')"
        )
        con.execute(
            f"CREATE TEMP TABLE registry AS SELECT site_id::VARCHAR AS site_id, district::VARCHAR AS district, address::VARCHAR AS address, source::VARCHAR AS source "
            f"FROM read_csv({sql_quote(str(registry_path))}, columns={{'site_id': 'VARCHAR', 'district': 'VARCHAR', 'address': 'VARCHAR', 'source': 'VARCHAR'}}, header=true)"
        )

        forecast_sites_sql = "SELECT DISTINCT site_id FROM forecast WHERE site_id IS NOT NULL AND TRIM(site_id) <> ''"
        coverage_registry_sql = "SELECT COUNT(DISTINCT f.site_id) as forecast_sites, COUNT(DISTINCT r.site_id) as in_registry, COUNT(DISTINCT f.site_id) - COUNT(DISTINCT r.site_id) as missing_registry FROM (" + forecast_sites_sql + ") f LEFT JOIN (SELECT DISTINCT site_id FROM registry) r USING (site_id)"
        coverage_history_sql = "SELECT COUNT(DISTINCT f.site_id) as forecast_sites, COUNT(DISTINCT s.site_id) as has_any_history, COUNT(DISTINCT f.site_id) - COUNT(DISTINCT s.site_id) as no_history FROM (" + forecast_sites_sql + ") f LEFT JOIN (SELECT DISTINCT site_id FROM service) s USING (site_id)"
        coverage_date_gaps_sql = f"WITH expected AS (SELECT site_id, d.date as date FROM ({forecast_sites_sql}) sites CROSS JOIN generate_series({sql_quote(forecast_start.isoformat())}::DATE, {sql_quote(forecast_end.isoformat())}::DATE, INTERVAL '1 day') as d(date)), actual AS (SELECT DISTINCT site_id, date FROM forecast), gaps AS (SELECT e.site_id, e.date FROM expected e LEFT JOIN actual a USING (site_id, date) WHERE a.site_id IS NULL) SELECT site_id, COUNT(*) as missing_dates, {expected_days} as expected_dates FROM gaps GROUP BY site_id ORDER BY missing_dates DESC"

        forecast_sites, in_registry, missing_registry = con.execute(coverage_registry_sql).fetchone()
        _, has_any_history, no_history = con.execute(coverage_history_sql).fetchone()
        forecast_sites, in_registry, missing_registry, has_any_history, no_history = [int(x or 0) for x in (forecast_sites, in_registry, missing_registry, has_any_history, no_history)]

        coverage_missing_registry_sql = "SELECT f.site_id FROM (" + forecast_sites_sql + ") f LEFT JOIN (SELECT DISTINCT site_id FROM registry) r USING (site_id) WHERE r.site_id IS NULL ORDER BY f.site_id"
        coverage_no_history_sql = "SELECT f.site_id FROM (" + forecast_sites_sql + ") f LEFT JOIN (SELECT DISTINCT site_id FROM service) s USING (site_id) WHERE s.site_id IS NULL ORDER BY f.site_id"
        coverage_missing_registry_count = write_csv(con, coverage_missing_registry_sql, outdir / "coverage_missing_registry.csv")
        coverage_date_gaps_count = write_csv(con, coverage_date_gaps_sql, outdir / "coverage_date_gaps.csv")
        coverage_no_history_count = write_csv(con, coverage_no_history_sql, outdir / "coverage_no_history.csv")

        con.execute("CREATE TEMP VIEW deltas AS SELECT site_id, date, forecast_m3, forecast_m3 - LAG(forecast_m3, 1, 0) OVER (PARTITION BY site_id ORDER BY date) as delta_m3 FROM forecast")
        stats_sql = "SELECT COUNT(*) as count, AVG(delta_m3) as mean, MEDIAN(delta_m3) as median, STDDEV(delta_m3) as std, MIN(delta_m3) as min, MAX(delta_m3) as max, PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY delta_m3) as p25, PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY delta_m3) as p75, PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY delta_m3) as p95 FROM deltas WHERE delta_m3 IS NOT NULL"
        stats_count = write_csv(con, stats_sql, outdir / "distribution_stats.csv")
        stats_row = con.execute(stats_sql).fetchone()
        delta_count = int(stats_row[0] or 0); mean = float(stats_row[1] or 0.0); median = float(stats_row[2] or 0.0)
        std = float(stats_row[3] or 0.0); min_val = float(stats_row[4] or 0.0); max_val = float(stats_row[5] or 0.0)

        outlier_threshold = mean + 3 * std
        outliers_all_sql = f"SELECT site_id, date, delta_m3 FROM deltas WHERE delta_m3 IS NOT NULL AND delta_m3 > {outlier_threshold} ORDER BY delta_m3 DESC"
        outliers_count = int(con.execute(f"SELECT COUNT(*) FROM ({outliers_all_sql}) AS subq").fetchone()[0] or 0)
        outliers_file_count = write_csv(con, f"{outliers_all_sql} LIMIT 100", outdir / "distribution_outliers.csv")

        baseline_start = date(baseline_year, 6, 1); baseline_end = date(baseline_year, 12, 31)
        baseline_sites_sql = f"SELECT COUNT(DISTINCT f.site_id) FROM ({forecast_sites_sql}) f JOIN service s USING (site_id) WHERE s.service_dt BETWEEN {sql_quote(baseline_start.isoformat())} AND {sql_quote(baseline_end.isoformat())}"
        baseline_sites_count = int(con.execute(baseline_sites_sql).fetchone()[0] or 0)
        baseline_sql = f"WITH forecast_totals AS (SELECT site_id, MAX(forecast_m3) as total_forecast_m3 FROM forecast GROUP BY site_id), baseline_totals AS (SELECT site_id, SUM(collect_volume_m3) as total_actual_m3 FROM service WHERE service_dt BETWEEN {sql_quote(baseline_start.isoformat())} AND {sql_quote(baseline_end.isoformat())} GROUP BY site_id) SELECT f.site_id, f.total_forecast_m3, b.total_actual_m3, f.total_forecast_m3 / NULLIF(b.total_actual_m3, 0) as ratio, CASE WHEN f.total_forecast_m3 / NULLIF(b.total_actual_m3, 0) > 5.0 THEN 'EXTREME_HIGH' WHEN f.total_forecast_m3 / NULLIF(b.total_actual_m3, 0) < 0.2 THEN 'EXTREME_LOW' ELSE 'NORMAL' END as flag FROM forecast_totals f LEFT JOIN baseline_totals b USING (site_id) WHERE f.total_forecast_m3 / NULLIF(b.total_actual_m3, 0) > 5.0 OR f.total_forecast_m3 / NULLIF(b.total_actual_m3, 0) < 0.2"
        baseline_count = write_csv(con, baseline_sql, outdir / "distribution_baseline.csv")

        duplicates_sql = "SELECT site_id, date, COUNT(*) as occurrences FROM forecast GROUP BY site_id, date HAVING COUNT(*) > 1"
        nulls_sql = "SELECT site_id, date, forecast_m3 FROM forecast WHERE site_id IS NULL OR date IS NULL OR forecast_m3 IS NULL"
        negatives_sql = "SELECT site_id, date, forecast_m3 FROM forecast WHERE forecast_m3 < 0"
        malformed_sql = "SELECT DISTINCT site_id, CASE WHEN site_id IS NULL OR TRIM(site_id) = '' THEN 'EMPTY_OR_NULL' WHEN regexp_matches(site_id, '[\\x00-\\x1F]') THEN 'CONTROL_CHAR' WHEN length(site_id) - length(replace(site_id, '\"', '')) > 4 THEN 'EXCESSIVE_QUOTES' ELSE 'UNKNOWN' END as issue FROM forecast WHERE site_id IS NULL OR TRIM(site_id) = '' OR regexp_matches(site_id, '[\\x00-\\x1F]') OR length(site_id) - length(replace(site_id, '\"', '')) > 4"
        duplicates_count = write_csv(con, duplicates_sql, outdir / "structural_duplicates.csv")
        nulls_count = write_csv(con, nulls_sql, outdir / "structural_nulls.csv")
        negative_count = write_csv(con, negatives_sql, outdir / "structural_negatives.csv")
        malformed_count = write_csv(con, malformed_sql, outdir / "structural_malformed.csv")
        null_site_id_count = int(con.execute("SELECT COUNT(*) FROM forecast WHERE site_id IS NULL").fetchone()[0] or 0)
        null_date_count = int(con.execute("SELECT COUNT(*) FROM forecast WHERE date IS NULL").fetchone()[0] or 0)
        null_forecast_m3_count = int(con.execute("SELECT COUNT(*) FROM forecast WHERE forecast_m3 IS NULL").fetchone()[0] or 0)

        registry_pct = pct(in_registry, forecast_sites); history_pct = pct(has_any_history, forecast_sites); date_gaps_count = coverage_date_gaps_count
        date_pct = pct(forecast_sites - date_gaps_count, forecast_sites); no_history_pct = pct(no_history, forecast_sites)
        baseline_extreme_pct = pct(baseline_count, baseline_sites_count); outliers_pct = pct(outliers_count, delta_count)

        blockers = [b for b in [f"duplicates={duplicates_count}" if duplicates_count >= BLOCKER_THRESHOLDS["duplicates"] else None, f"null_site_id={null_site_id_count}" if null_site_id_count >= BLOCKER_THRESHOLDS["null_site_id"] else None, f"null_date={null_date_count}" if null_date_count >= BLOCKER_THRESHOLDS["null_date"] else None, f"null_forecast_m3={null_forecast_m3_count}" if null_forecast_m3_count >= BLOCKER_THRESHOLDS["null_forecast_m3"] else None, f"negative_forecast={negative_count}" if negative_count >= BLOCKER_THRESHOLDS["negative_forecast"] else None] if b]
        warnings = [w for w in [f"no_history={no_history} ({no_history_pct:.1f}%)" if no_history > 0 else None, f"baseline_extreme={baseline_count} ({baseline_extreme_pct:.1f}%)" if baseline_count > 0 else None, f"outliers_3sigma={outliers_count} ({outliers_pct:.1f}%)" if outliers_count > 0 else None] if w]
        info = [i for i in [f"missing_registry={missing_registry}" if INFO_THRESHOLDS["missing_registry"] and missing_registry > 0 else None, f"date_gaps_any={date_gaps_count}" if INFO_THRESHOLDS["date_gaps_any"] and date_gaps_count > 0 else None, f"malformed_ids_any={malformed_count}" if INFO_THRESHOLDS["malformed_ids_any"] and malformed_count > 0 else None] if i]

        if blockers:
            verdict = "🔴 NOT READY"; verdict_desc = "Critical issues must be resolved"
        elif warnings:
            verdict = "🟡 PROCEED WITH CAUTION"; verdict_desc = f"{len(warnings)} warning(s) found"
        else:
            verdict = "🟢 READY"; verdict_desc = "Data quality acceptable for validation"

        generated = datetime.now().isoformat(); commit = get_git_commit()
        blocker_list = ", ".join(blockers) if blockers else "None"; warning_list = ", ".join(warnings) if warnings else "None"; info_list = ", ".join(info) if info else "None"
        registry_status = "🔵 INFO" if missing_registry > 0 else "✅ OK"; history_status = "🟡 WARNING" if no_history > 0 else "✅ OK"; date_status = "🔵 INFO" if date_gaps_count > 0 else "✅ OK"
        dup_sev = "🔴 BLOCKER" if duplicates_count > 0 else "✅ OK"; null_sev = "🔴 BLOCKER" if nulls_count > 0 else "✅ OK"; neg_sev = "🔴 BLOCKER" if negative_count > 0 else "✅ OK"; malformed_sev = "🔵 INFO" if malformed_count > 0 else "✅ OK"

        report = f"# Data Quality Analysis Report\n\n**Generated:** {generated}\n**Git Commit:** {commit}\n**Forecast Window:** {forecast_start} to {forecast_end}\n\n## Verdict: {verdict}\n{verdict_desc}\n\n| Severity | Count | Issues |\n|----------|-------|--------|\n| 🔴 BLOCKER | {len(blockers)} | {blocker_list} |\n| 🟡 WARNING | {len(warnings)} | {warning_list} |\n| 🔵 INFO | {len(info)} | {info_list} |\n\n---\n\n## 1. Coverage Analysis\n\n| Metric | Value | Status |\n|--------|-------|--------|\n| Forecast Sites | {forecast_sites:,} | - |\n| Registry Overlap | {registry_pct:.1f}% | {registry_status} |\n| Has Service History | {history_pct:.1f}% | {history_status} |\n| Date Completeness | {date_pct:.1f}% | {date_status} |\n\n**Sites Missing Registry:** {missing_registry} → See `coverage_missing_registry.csv`\n**Sites with No History:** {no_history} → See `coverage_no_history.csv`\n**Sites with Date Gaps:** {date_gaps_count} → See `coverage_date_gaps.csv`\n\n---\n\n## 2. Distribution Analysis\n\n| Statistic | Value |\n|-----------|-------|\n| Mean (daily delta) | {mean:.2f} m³ |\n| Median | {median:.2f} m³ |\n| Std Dev | {std:.2f} m³ |\n| Range | {min_val:.2f} - {max_val:.2f} m³ |\n\n**3-Sigma Outliers:** {outliers_count} ({outliers_pct:.1f}%) → See `distribution_outliers.csv`\n**Baseline Deviations:** {baseline_count} sites ({baseline_extreme_pct:.1f}% of baseline sites) → See `distribution_baseline.csv`\n\n---\n\n## 3. Structural Integrity\n\n| Check | Count | Severity |\n|-------|-------|----------|\n| Duplicates | {duplicates_count} | {dup_sev} |\n| Null Values | {nulls_count} | {null_sev} |\n| Negative Values | {negative_count} | {neg_sev} |\n| Malformed IDs | {malformed_count} | {malformed_sev} |\n\n---\n\n## Output Files\n\n| File | Rows | Description |\n|------|------|-------------|\n| coverage_missing_registry.csv | {coverage_missing_registry_count} | Sites missing from registry |\n| coverage_no_history.csv | {coverage_no_history_count} | Sites with no service history |\n| coverage_date_gaps.csv | {coverage_date_gaps_count} | Sites missing forecast dates |\n| distribution_stats.csv | {stats_count} | Summary statistics |\n| distribution_outliers.csv | {outliers_file_count} | 3-sigma outliers (top 100) |\n| distribution_baseline.csv | {baseline_count} | Extreme baseline deviations |\n| structural_duplicates.csv | {duplicates_count} | Duplicate rows |\n| structural_nulls.csv | {nulls_count} | Rows with null values |\n| structural_negatives.csv | {negative_count} | Negative forecast values |\n| structural_malformed.csv | {malformed_count} | Malformed site IDs |\n\n---\n"
        (outdir / "REPORT.md").write_text(report)

        methodology = f"# Methodology Log\n\n**Generated:** {generated}\n**Git Commit:** {commit}\n\n## Parameters\n- Forecast window: {forecast_start} to {forecast_end}\n- Expected days: {expected_days}\n- Baseline window: {baseline_year}-06-01 to {baseline_year}-12-31\n\n## Data Sources\n- Forecast: `{forecast_source_path}` (sha256: {sha256_file(forecast_source_path)})\n- Service history: `{service_path}` (sha256: {sha256_file(service_path)})\n- Registry: `{registry_path}` (sha256: {sha256_file(registry_path)})\n\n## Command to Reproduce\n```bash\npython scripts/analyze_data_quality.py \\\n  --forecast-path {forecast_source_path} \\\n  --service-path {service_path} \\\n  --registry-path {registry_path} \\\n  --forecast-start {forecast_start} \\\n  --forecast-end {forecast_end} \\\n  --baseline-year {baseline_year} \\\n  --outdir {outdir}\n```\n\n## Analysis Methodology\n- Coverage: registry overlap, any-history coverage, and date completeness over the fixed window.\n- Distribution: cumulative-to-delta conversion, summary stats, 3-sigma outliers, and baseline comparison.\n- Structural: duplicate (site_id, date), nulls, negative values, malformed IDs.\n"
        (outdir / "METHODOLOGY.md").write_text(methodology)
        return 0
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)


if __name__ == "__main__":
    raise SystemExit(main())
