Feature: Extract export rows from quarterly reports into JSON

  As an individual entrepreneur preparing for an audit
  I want to extract the key export rows from my quarterly PVT reports into a JSON file
  So that I can reconcile those amounts with my bank statements without reopening Excel each time

  Background:
    Given a folder that contains quarterly Excel reports named "YYYY_QN.xlsx"
      And each report uses the PVT template with:
        | header row | 10   |
        | data row   | 11   |
        | export row | 17   |
      And on the main sheet:
        | D17 | contains the text "Экспорт" |
        | F17 | displays the export amount  |
      And the export amount in F17 is derived from the revenue cell F11

  Scenario: Export all quarterly reports into a single JSON file
    Given I have quarterly reports "2023_Q1.xlsx", "2023_Q3.xlsx" and "2024_Q4.xlsx" in a folder
    When I run "python metadata/export_quarter_reports.py --reports-root <reports-folder> --out <output-json>"
    Then a JSON file is created at "<output-json>"
      And the JSON contains one entry per report file
      And each entry records:
        | field                 | description                                              |
        | file                  | the original XLSX filename (e.g. 2023_Q3.xlsx)          |
        | sheet                 | the sheet where the PVT table was found (e.g. Лист1)    |
        | export.label_cell     | the address of the label cell (D17)                     |
        | export.label          | the text in the label cell ("Экспорт")                  |
        | export.amount_cell    | the address of the amount cell (F17)                    |
        | export.amount         | the numeric export amount for that quarter              |
        | source_row.index      | the row index of the source row (11)                    |
        | source_row.cells.A..H | the detailed cells with header, cell address, and value |
      And for each entry the value in "source_row.cells.F.value" is equal to "export.amount"

  Scenario: Handle quarters where export is zero
    Given I have a quarterly report "2024_Q2.xlsx" whose export amount is zero
    When I run the export_quarter_reports script on its folder
    Then the JSON entry for "2024_Q2.xlsx" includes:
      | export.amount | 0 |
      And the source row still includes all headers and values from row 11

