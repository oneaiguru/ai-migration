import csv
import runpy
from pathlib import Path

import pytest


@pytest.mark.spec_id("SITE-ING-001")
def test_ingest_sites_duplicate_keys_error(tmp_path):
    src = tmp_path / "dupe.csv"
    with src.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Площадка", "Дата", "Объем, м3"])
        w.writerow(["S1", "2024-07-01", "10"])  # duplicate key
        w.writerow(["S1", "2024-07-01", "5"])   # duplicate key

    outdir = tmp_path / "out"
    argv = [
        "ingest_sites.py",
        "--inputs",
        str(src),
        "--outdir",
        str(outdir),
    ]

    import sys
    old_argv = sys.argv[:]
    try:
        sys.argv = argv
        with pytest.raises(ValueError):
            runpy.run_path("scripts/ingest_sites.py", run_name="__main__")
    finally:
        sys.argv = old_argv


@pytest.mark.spec_id("SITE-ING-001")
def test_ingest_sites_orphan_service_error(tmp_path):
    # Service-only file (no registry columns) for S9
    svc_only = tmp_path / "svc.csv"
    with svc_only.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Площадка", "Дата", "Объем, м3"])  # service-only
        w.writerow(["S9", "2024-07-03", "10"])  # orphan

    # Registry file for a different site (S1)
    reg = tmp_path / "reg.csv"
    with reg.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Площадка", "Широта", "Долгота", "Объем, л"])  # registry markers
        w.writerow(["S1", 55.7, 37.6, 1100])

    outdir = tmp_path / "out"
    argv = [
        "ingest_sites.py",
        "--inputs",
        str(svc_only), str(reg),
        "--outdir",
        str(outdir),
    ]

    import sys
    old_argv = sys.argv[:]
    try:
        sys.argv = argv
        with pytest.raises(ValueError):
            runpy.run_path("scripts/ingest_sites.py", run_name="__main__")
    finally:
        sys.argv = old_argv
