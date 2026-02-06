import zipfile
from pathlib import Path

import pytest

import scripts.ingest_and_forecast as ing


def test_parse_header_row_not_found(tmp_path: Path):
    NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    ws = f"<worksheet xmlns=\"{NS}\"><sheetData>" \
         f"<row r=\"1\"><c r=\"A1\" t=\"s\"><v>0</v></c></row>" \
         f"<row r=\"2\"><c r=\"A2\" t=\"s\"><v>1</v></c></row>" \
         f"</sheetData></worksheet>".encode("utf-8")
    ss = f"<sst xmlns=\"{NS}\" count=\"2\" uniqueCount=\"2\">" \
         f"<si><t>Foo</t></si><si><t>Bar</t></si></sst>".encode("utf-8")
    zpath = tmp_path / "bad.xlsx"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("xl/worksheets/sheet2.xml", ws)
        z.writestr("xl/sharedStrings.xml", ss)
    with zipfile.ZipFile(zpath) as z:
        with pytest.raises(RuntimeError):
            ing.parse_header_row(z)


def test_to_float_branches():
    assert ing.to_float(None) is None
    assert ing.to_float("abc") is None
    assert ing.to_float("1,5") == 1.5

def test_shared_strings_runs(tmp_path: Path):
    # Cover <si><r><t> run-concatenation branch in parse_shared_strings
    NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    sst = (
        f"<sst xmlns=\"{NS}\" count=\"1\" uniqueCount=\"1\">"
        f"<si><r><t>Hello</t></r><r><t>World</t></r></si>"
        f"</sst>"
    ).encode("utf-8")
    zpath = tmp_path / "ss.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("xl/sharedStrings.xml", sst)
    with zipfile.ZipFile(zpath) as z:
        out = ing.parse_shared_strings(z)
    assert out and out[0] == "HelloWorld"

def test_even_allocation_path(tmp_path: Path):
    # Even allocation branch with 30-day header
    NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    period = "<row r=\"1\"><c r=\"A1\" t=\"s\"><v>2</v></c></row>"
    # Build header with 30 numeric day columns C..AF
    def _col_letters(idx):
        letters = []
        while idx > 0:
            idx, rem = divmod(idx - 1, 26)
            letters.append(chr(rem + ord("A")))
        return "".join(reversed(letters))
    day_cells = []
    for i in range(30):
        col = _col_letters(3 + i)
        day_cells.append(f"<c r=\"{col}2\"><v>{i+1}</v></c>")
    header = f"<row r=\"2\"><c r=\"A2\" t=\"s\"><v>0</v></c><c r=\"B2\" t=\"s\"><v>1</v></c>{''.join(day_cells)}</row>"
    # Data row with empty day cells across 30 days
    empty = []
    for i in range(30):
        col = _col_letters(3 + i)
        empty.append(f"<c r=\"{col}3\"></c>")
    data = f"<row r=\"3\"><c r=\"A3\" t=\"s\"><v>3</v></c><c r=\"B3\"><v>100</v></c>{''.join(empty)}</row>"
    ws = f"<worksheet xmlns=\"{NS}\"><sheetData>{period}{header}{data}</sheetData></worksheet>".encode("utf-8")
    sst = (
        f"<sst xmlns=\"{NS}\" count=\"4\" uniqueCount=\"4\">"
        f"<si><t>Район</t></si>"
        f"<si><t>Вес, тонн</t></si>"
        f"<si><t>Период: 01.09.2024 - 30.09.2024</t></si>"
        f"<si><t>D1</t></si>"
        f"</sst>"
    ).encode("utf-8")
    zpath = tmp_path / "even.xlsx"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("xl/worksheets/sheet2.xml", ws)
        z.writestr("xl/sharedStrings.xml", sst)
    with zipfile.ZipFile(zpath) as z:
        pf, pt = ing.detect_period(z)
        out = ing.parse_rows_to_daily(z, pf, pt)
    vals = sorted(v for (_, _), v in out.items())
    assert len(vals) == 30 and all(abs(v - (100.0/30.0)) < 1e-9 for v in vals)
