import csv
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

import pytest

import scripts.ingest_and_forecast as ing


def test_parse_shared_strings_missing_file(tmp_path: Path):
    # Zip without sharedStrings.xml should yield empty list
    zpath = tmp_path / "min.zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("xl/worksheets/sheet2.xml", b"<worksheet xmlns=\"http://schemas.openxmlformats.org/spreadsheetml/2006/main\"></worksheet>")
    with zipfile.ZipFile(zpath) as z:
        ss = ing.parse_shared_strings(z)
        assert ss == []


def test_read_cell_value_inline_str():
    # Build a minimal cell with inlineStr
    NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    c = ET.Element(f"{{{NS['m']}}}c", attrib={"t": "inlineStr"})
    is_el = ET.SubElement(c, f"{{{NS['m']}}}is")
    t_el = ET.SubElement(is_el, f"{{{NS['m']}}}t")
    t_el.text = "hello"
    assert ing.read_cell_value(c, []) == "hello"


def test_load_csv_error_branches(tmp_path: Path):
    # daily CSV with one invalid row
    daily = tmp_path / "d.csv"
    with daily.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["date","district","actual_m3"])
        w.writerow(["2024-12-31","D1","abc"])  # invalid
        w.writerow(["2024-12-31","D2","1.0"])   # valid
    rows = ing.load_daily_csv(str(daily))
    assert len(rows) == 1 and rows[0][1] == "D2"

    # monthly CSV with one invalid row
    monthly = tmp_path / "m.csv"
    with monthly.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["year_month","district","actual_m3"])
        w.writerow(["2024-12","D1","oops"])  # invalid
        w.writerow(["2024-12","D2","2.5"])   # valid
    mrows = ing.load_monthly_csv(str(monthly))
    assert len(mrows) == 1 and mrows[0][1] == "D2"


def test_run_phase0_forecast_error_methods_scopes_and_no_districts(tmp_path: Path, monkeypatch):
    # Wrong methods -> exit(1)
    args = type("Args", (), {
        "methods": "daily=x,monthly=y",
        "scopes": "region,districts",
        "train_until": "2024-12-31",
        "daily_csv": str(tmp_path/"d.csv"),
        "monthly_csv": str(tmp_path/"m.csv"),
        "outdir": str(tmp_path/"deliveries"),
        "daily_window": ["2025-01-01:2025-01-05"],
        "monthly_window": ["2025-01:2025-01"],
    })
    with pytest.raises(SystemExit):
        ing.run_phase0_forecast(args)

    # Wrong scopes -> exit(1)
    args2 = type("Args", (), dict(vars(args)))
    setattr(args2, "methods", "daily=weekday_mean,monthly=last3m_mean")
    setattr(args2, "scopes", "foo")
    with pytest.raises(SystemExit):
        ing.run_phase0_forecast(args2)

    # No districts after cutoff -> exit(1)
    # Build CSVs where all dates/months are > cutoff
    daily = tmp_path / "d.csv"
    with daily.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["date","district","actual_m3"])
        w.writerow(["2025-01-01","D1","1"])  # after cutoff
    monthly = tmp_path / "m.csv"
    with monthly.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["year_month","district","actual_m3"])
        w.writerow(["2025-01","D1","1"])  # after cutoff YM
    args3 = type("Args", (), dict(vars(args2)))
    setattr(args3, "daily_csv", str(daily))
    setattr(args3, "monthly_csv", str(monthly))
    with pytest.raises(SystemExit):
        ing.run_phase0_forecast(args3)


def test_forecast_daily_naive_raises_on_empty():
    with pytest.raises(RuntimeError):
        ing.forecast_daily_naive({})


def test_get_git_commit_fallback(monkeypatch):
    monkeypatch.setattr(ing.subprocess, "check_output", lambda *a, **k: (_ for _ in ()).throw(Exception("x")))
    assert ing.get_git_commit() is None


def test_even_allocation_path(tmp_path: Path):
    # Build an xlsx with header + one row having total_tonnes>0 but all day weights empty
    NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    # Period: full September (30 days) to match 30 numeric headers
    period = "<row r=\"1\"><c r=\"A1\" t=\"s\"><v>2</v></c></row>"
    # Header row with 'Район' (A2), 'Вес, тонн' (B2), and 30 days C2..AF2 (1..30)
    day_cells = []
    # Columns C(3) to AF(32) are 30 positions
    def _col_letters(idx):
        letters = []
        while idx > 0:
            idx, rem = divmod(idx - 1, 26)
            letters.append(chr(rem + ord("A")))
        return "".join(reversed(letters))
    for i in range(30):
        col = _col_letters(3 + i)
        day_cells.append(f"<c r=\"{col}2\"><v>{i+1}</v></c>")
    header = (
        f"<row r=\"2\">"
        f"<c r=\"A2\" t=\"s\"><v>0</v></c>"
        f"<c r=\"B2\" t=\"s\"><v>1</v></c>"
        + "".join(day_cells) +
        f"</row>"
    )
    # Data row (row 3): district name as shared string index 3; total 100; empty day cells (no <v>) for 30 days
    empty_day_cells = []
    for i in range(30):
        col = _col_letters(3 + i)
        empty_day_cells.append(f"<c r=\"{col}3\"></c>")
    data = (
        f"<row r=\"3\">"
        f"<c r=\"A3\" t=\"s\"><v>3</v></c>"
        f"<c r=\"B3\"><v>100</v></c>"
        + "".join(empty_day_cells) +
        f"</row>"
    )
    ws = f"<worksheet xmlns=\"{NS}\"><sheetData>{period}{header}{data}</sheetData></worksheet>".encode("utf-8")
    # shared strings: ["Район","Вес, тонн","Период: 01.09.2024 - 30.09.2024","D1"]
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
    # 30 days of Sept, total 100 split evenly => 100/30 each
    vals = sorted(v for (_, _), v in out.items())
    assert len(vals) == 30 and all(abs(v - (100.0/30.0)) < 1e-9 for v in vals)
