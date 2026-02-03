import csv
import runpy
from pathlib import Path

import pytest


@pytest.mark.spec_id("SITE-ING-001")
def test_ingest_sites_csv_alias_and_outputs(tmp_path, monkeypatch):
    """
    Create a tiny CSV with Russian headers and run the ingest script.
    Verify tidy outputs exist and contain expected columns and conversions.
    """
    src = tmp_path / "sites_ru.csv"
    with src.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow([
            "Площадка", "Дата", "Район", "Объем, м3", "Опорожнение",
            "Широта", "Долгота", "Объем, л", "Количество контейнеров", "Тип контейнера",
        ])
        w.writerow(["S1", "2024-07-01", "D1", "5.0", "Да", 55.75, 37.62, 1100, 2, "mixed"])
        w.writerow(["S2", "2024-07-02", "D2", "12.0", "Нет", 55.71, 37.60, 1100, 1, "mixed"])

    outdir = tmp_path / "out"
    argv = [
        "ingest_sites.py",
        "--inputs",
        str(src),
        "--outdir",
        str(outdir),
    ]

    # Run in-process so coverage accrues to scripts/ingest_sites.py
    import sys
    old_argv = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/ingest_sites.py", run_name="__main__")
    finally:
        sys.argv = old_argv

    reg = outdir / "sites_registry.csv"
    svc = outdir / "sites_service.csv"
    assert reg.exists() and svc.exists()

    # Basic schema checks
    reg_txt = reg.read_text(encoding="utf-8")
    svc_txt = svc.read_text(encoding="utf-8")
    assert "site_id" in reg_txt.splitlines()[0]
    assert "service_dt" in svc_txt.splitlines()[0]

    # Volume check: collect_volume_m3 carried through
    assert ",5.0," in svc_txt or ",5.0\n" in svc_txt


@pytest.mark.spec_id("SITE-ING-001")
def test_ingest_decimal_comma_and_ru_date(tmp_path):
    src = tmp_path / "ru_decimal_date.csv"
    with src.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Площадка", "Дата", "Объем, м3"])  # dd.mm.yyyy, decimal comma
        w.writerow(["S3", "01.08.2024", "1,2"])  # -> 1.2 m3

    # Also provide a minimal registry with lat to avoid orphan error
    reg = tmp_path / "registry.csv"
    with reg.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Площадка", "Широта"])  # registry indicator
        w.writerow(["S3", 55.7])

    outdir = tmp_path / "out"
    import sys, runpy
    argv = [
        "ingest_sites.py",
        "--inputs",
        str(src), str(reg),
        "--outdir",
        str(outdir),
    ]
    old_argv = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/ingest_sites.py", run_name="__main__")
    finally:
        sys.argv = old_argv

    svc = (outdir / "sites_service.csv").read_text(encoding="utf-8")
    assert "2024-08-01" in svc  # dd.mm.yyyy parsed
    assert ",1.2," in svc or ",1.2\n" in svc  # decimal comma parsed
