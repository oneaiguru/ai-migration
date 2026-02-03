import os
import zipfile
from pathlib import Path

import pytest


NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"


def _ss_xml(strings):
    # Build a minimal sharedStrings.xml
    parts = [f"<sst xmlns=\"{NS}\" count=\"{len(strings)}\" uniqueCount=\"{len(strings)}\">"]
    for s in strings:
        parts.append(f"<si><t>{s}</t></si>")
    parts.append("</sst>")
    return "".join(parts).encode("utf-8")


def _cell_a1(col, row):
    # col as letters, row as int
    return f"{col}{row}"


def _col_letters(idx):
    # 1-based to letters
    letters = []
    while idx > 0:
        idx, rem = divmod(idx - 1, 26)
        letters.append(chr(rem + ord("A")))
    return "".join(reversed(letters))


def _sheet_with_header_and_rows(district_name: str, period: tuple[str, str], days: int = 30) -> bytes:
    # Build a minimal worksheet XML with a header row and one data row
    # Header includes Russian labels and day-of-month numeric headers (1..days)
    # Data row includes district, total tonnes, and day weights
    rows_xml = []
    # Row 1: Period text in a couple of cells (as shared strings)
    rows_xml.append(
        f"<row r=\"1\"><c r=\"A1\" t=\"s\"><v>0</v></c><c r=\"B1\" t=\"s\"><v>1</v></c></row>"
    )
    # Row 2: Header
    # Put 'Район' in A2, 'Вес, тонн' in B2, then numeric 1..days starting at C2
    header_cells = [
        "<c r=\"A2\" t=\"s\"><v>2</v></c>",  # Район
        "<c r=\"B2\" t=\"s\"><v>3</v></c>",  # Вес, тонн
    ]
    for i in range(days):
        col = _col_letters(3 + i)  # C..
        header_cells.append(f"<c r=\"{col}2\"><v>{i+1}</v></c>")
    rows_xml.append(f"<row r=\"2\">{''.join(header_cells)}</row>")
    # Row 3: Data row for the district
    data_cells = [
        "<c r=\"A3\" t=\"s\"><v>4</v></c>",  # district shared string
        "<c r=\"B3\"><v>100</v></c>",  # total tonnes
    ]
    # Put simple weights: 1 for all days
    for i in range(days):
        col = _col_letters(3 + i)
        data_cells.append(f"<c r=\"{col}3\"><v>1</v></c>")
    rows_xml.append(f"<row r=\"3\">{''.join(data_cells)}</row>")

    # Wrap with worksheet root and dimension
    ws = (
        f"<worksheet xmlns=\"{NS}\">"
        f"<sheetData>{''.join(rows_xml)}</sheetData>"
        f"</worksheet>"
    )
    # Insert the period strings into shared strings list
    period_text = f"Период: {period[0]} - {period[1]}"
    # shared strings: [period label parts, header labels, district]
    # We split period across two cells just to exercise string concat logic if needed
    sstrings = ["Период:", f"{period[0]} - {period[1]}", "Район", "Вес, тонн", district_name]
    ss = _ss_xml(sstrings)
    return ws.encode("utf-8"), ss


@pytest.mark.spec_id("ING-001")
def test_ingest_minimal_xlsx_end_to_end(tmp_path: Path, monkeypatch):
    # Build a minimal xlsx (zip) with only the files the parser reads
    xlsx_path = tmp_path / "minimal.xlsx"
    ws_xml, ss_xml = _sheet_with_header_and_rows(
        district_name="D1",
        period=("01.09.2024", "30.09.2024"),
        days=30,
    )
    with zipfile.ZipFile(xlsx_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("xl/worksheets/sheet2.xml", ws_xml)
        z.writestr("xl/sharedStrings.xml", ss_xml)

    # Run the ingest subcommand
    env = os.environ.copy()
    env["PYTHONHASHSEED"] = "0"
    cwd = tmp_path
    # Ensure we run from repo root so scripts path resolves
    repo_root = Path.cwd()
    script = str(repo_root / "scripts" / "ingest_and_forecast.py")
    cmd = [
        "python",
        script,
        "ingest",
        str(xlsx_path),
    ]
    # Run with cwd=tmp_path so outputs are written to temp directory (not repo)
    res = __import__("subprocess").run(cmd, capture_output=True, text=True, env=env, cwd=str(tmp_path))
    assert res.returncode == 0, res.stderr or res.stdout

    # Validate outputs created by ingest path
    daily = tmp_path / "data" / "daily_waste_by_district.csv"
    monthly = tmp_path / "data" / "monthly_waste_by_district.csv"
    region = tmp_path / "data" / "monthly_waste_region.csv"
    assert daily.exists() and monthly.exists() and region.exists()

    # Clean up created files to avoid polluting the tree for other tests
    # Clean up tmp outputs
    try:
        (tmp_path / "forecasts" / "daily_forecast_30d.csv").unlink(missing_ok=True)
        (tmp_path / "forecasts" / "monthly_forecast_3m.csv").unlink(missing_ok=True)
        daily.unlink(missing_ok=True)
        monthly.unlink(missing_ok=True)
        region.unlink(missing_ok=True)
    except Exception:
        pass
