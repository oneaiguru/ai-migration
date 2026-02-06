# User story — export quarter reports to JSON for bank-statement cross-check

## Story

As an individual entrepreneur preparing for an audit,  
I want to extract the key export rows from my quarterly PVT reports into a small JSON file,  
so that I can cross-check those amounts against the underlying bank statements without opening Excel each time.

## Context

- The final quarterly reports live in a separate folder, usually:
  - `/Users/m/Documents/accounting/reports/final 2023-2024`
- File naming convention in that folder:
  - `YYYY_QN.xlsx` (for example: `2023_Q1.xlsx`, `2023_Q2.xlsx`, …, `2024_Q4.xlsx`)
- Each workbook uses the same template:
  - Main sheet: `Лист1`
  - Header row for the tax table: row 10 (`A10`..`H10`)
  - Data row that feeds the export amount: row 11 (`A11`..`H11`)
  - Label `Экспорт` is stored at `D17`
  - The export amount shown to PVT is at `F17`
  - In the current templates `F17` is derived from `F11` (the “Выручка” cell)

The audit cross-check focuses only on a few quarters where `Экспорт` is non-zero (e.g. 2023 Q1, 2023 Q3, 2024 Q4), but the tool should work for any `YYYY_QN.xlsx` file in the folder.

## Desired behaviour

- I run a small script from the `accounting-operations` repo, pointing it at the folder with quarterly reports.
- The script reads each `YYYY_QN.xlsx` workbook in that folder (no modifications, read-only).
- For each workbook, it finds:
  - The sheet that contains the PVT table (prefer `Лист1`, otherwise use the first sheet).
  - The `Экспорт` cell:
    - Label at `D17`
    - Amount shown to PVT at `F17`
  - The source row that feeds that export amount:
    - Data row index: 11 (under the header row at 10)
    - Cells `A11`..`H11`, together with their header text from row 10.
- The script builds a JSON structure that, for each quarter, contains:
  - The filename (`2023_Q3.xlsx`)
  - The sheet name (`Лист1`)
  - The export label and amount:
    - Cell for the label (`D17`) and the text (`Экспорт`)
    - Cell for the amount (`F17`) and the numeric value (taken from the revenue cell `F11`)
  - The full source row:
    - For each column A..H:
      - Cell address (e.g. `D11`)
      - Header (e.g. `Вид деятельности`)
      - Value, normalized for JSON:
        - Dates as ISO strings (e.g. `2023-10-01`)
        - Numbers as numeric types
        - Text as strings (including newlines)

The output JSON will live inside this repo (for example `metadata/exports_2023_2024.json`) and can be opened in any editor or fed into other tools that will help match these export amounts to the detailed bank-statement rows.

## Usage (happy path)

1. From `/Users/m/ai/projects/accounting-operations`, I run:
   ```bash
   python metadata/export_quarter_reports.py \\
     --reports-root \\
       \"/Users/m/Documents/accounting/reports/final 2023-2024\" \\
     --out metadata/exports_2023_2024.json
   ```
2. The script:
   - Lists all `.xlsx` files in the given `--reports-root` directory.
   - For each file, extracts the export amount and its source row as described above.
   - Writes a single JSON array to `metadata/exports_2023_2024.json`.
3. I open `metadata/exports_2023_2024.json` and see, for each quarter:
   - The export amount that appears in the Excel report.
   - The detailed row (dates, activity, customer, amount, etc.) that produced that number.
4. Using that JSON, I then go to the bank statements and locate the precise incoming payments that should sum up to the export amount for that quarter.

## Constraints

- The script must never modify Excel files, only read them.
- It should not depend on LibreOffice or `recalc.py` — it only reads values that are already saved in the workbooks.
- It must tolerate the absence of a sheet named `Лист1` by falling back to the first sheet.
- It should be robust for quarters where `Экспорт` is zero (still produce an entry with amount `0`).

