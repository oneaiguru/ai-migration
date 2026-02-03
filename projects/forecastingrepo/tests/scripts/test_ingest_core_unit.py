import zipfile
from pathlib import Path
from datetime import date

import scripts.ingest_and_forecast as ing


NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"


def _mk_shared_strings(strings):
    parts = [f"<sst xmlns=\"{NS}\" count=\"{len(strings)}\" uniqueCount=\"{len(strings)}\">"]
    for s in strings:
        parts.append(f"<si><t>{s}</t></si>")
    parts.append("</sst>")
    return "".join(parts).encode("utf-8")


def _col_letters(idx: int) -> str:
    letters = []
    while idx > 0:
        idx, rem = divmod(idx - 1, 26)
        letters.append(chr(rem + ord("A")))
    return "".join(reversed(letters))


def _build_minimal_sheet(days=30):
    rows = []
    rows.append("<row r=\"1\"><c r=\"A1\" t=\"s\"><v>2</v></c></row>")
    day_cells = []
    for i in range(days):
        col = _col_letters(3 + i)
        day_cells.append(f"<c r=\"{col}2\"><v>{i+1}</v></c>")
    rows.append(
        f"<row r=\"2\"><c r=\"A2\" t=\"s\"><v>0</v></c><c r=\"B2\" t=\"s\"><v>1</v></c>{''.join(day_cells)}</row>"
    )
    data_cells = []
    for i in range(days):
        col = _col_letters(3 + i)
        data_cells.append(f"<c r=\"{col}3\"><v>1</v></c>")
    rows.append(
        f"<row r=\"3\"><c r=\"A3\" t=\"s\"><v>3</v></c><c r=\"B3\"><v>100</v></c>{''.join(data_cells)}</row>"
    )
    ws = f"<worksheet xmlns=\"{NS}\"><sheetData>{''.join(rows)}</sheetData></worksheet>".encode("utf-8")
    ss = _mk_shared_strings(["Район","Вес, тонн","Период: 01.09.2024 - 30.09.2024","D1"])
    return ws, ss


def test_core_parsers_and_allocations(tmp_path: Path):
    ws, ss = _build_minimal_sheet(days=30)
    xlsx = tmp_path / "m.xlsx"
    with zipfile.ZipFile(xlsx, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("xl/worksheets/sheet2.xml", ws)
        z.writestr("xl/sharedStrings.xml", ss)
    with zipfile.ZipFile(xlsx) as z:
        d1, d2 = ing.detect_period(z)
        assert (d1, d2) == (date(2024,9,1), date(2024,9,30))
    with zipfile.ZipFile(xlsx) as z:
        mapping = ing.parse_rows_to_daily(z, date(2024,9,1), date(2024,9,30))
    assert len(mapping) == 30
