from pathlib import Path
import runpy

import pytest


@pytest.mark.spec_id("SITE-ING-001")
def test_ingest_sites_xlsx_sheet_autodetect(tmp_path):
    from openpyxl import Workbook

    wb = Workbook()
    ws1 = wb.active
    ws1.title = "Empty"
    # Empty sheet
    ws2 = wb.create_sheet(title="Data")
    ws2.append(["Площадка", "Дата", "Объем, м3", "Опорожнение", "Район"])
    ws2.append(["S10", "2024-08-15", 2.5, "Да", "D9"])

    xlsx = tmp_path / "sites_ru.xlsx"
    wb.save(xlsx)

    outdir = tmp_path / "out"
    argv = [
        "ingest_sites.py",
        "--inputs",
        str(xlsx),
        "--outdir",
        str(outdir),
    ]

    import sys
    old_argv = sys.argv[:]
    try:
        sys.argv = argv
        runpy.run_path("scripts/ingest_sites.py", run_name="__main__")
    finally:
        sys.argv = old_argv

    svc = outdir / "sites_service.csv"
    assert svc.exists()
    # Volume preserved
    txt = svc.read_text(encoding="utf-8")
    assert ",2.5" in txt
