import unittest

from metadata.export_reconciliation_report import build_reconciliation_markdown


class ExportReconciliationReportTest(unittest.TestCase):
    def test_build_reconciliation_markdown_summary_and_details(self) -> None:
        entries = [
            {
                "quarter_id": "2023_Q1",
                "reported_amount": 100.0,
                "transactions_sum": 100.0,
                "difference": 0.0,
                "status": "match",
                "transactions": [
                    {
                        "txn_date": "2023-02-01",
                        "amount": 60.0,
                        "currency": "KGS",
                        "description": "Income A",
                        "statement_file": "renamed-statements/ACC_2023-01-01_2023-03-31.xlsx",
                        "row_index": 12,
                    },
                    {
                        "txn_date": "2023-03-15",
                        "amount": 40.0,
                        "currency": "KGS",
                        "description": "Income B",
                        "statement_file": "renamed-statements/ACC_2023-01-01_2023-03-31.xlsx",
                        "row_index": 13,
                    },
                ],
            },
            {
                "quarter_id": "2023_Q2",
                "reported_amount": 50.0,
                "transactions_sum": 0.0,
                "difference": -50.0,
                "status": "no_transactions",
                "transactions": [],
            },
        ]

        md = build_reconciliation_markdown(entries)

        # Summary table rows
        self.assertIn("| 2023_Q1 | 100.00 | 100.00 | 0.00 | match |", md)
        self.assertIn("| 2023_Q2 | 50.00 | 0.00 | -50.00 | no_transactions |", md)

        # Detail section only for non-matching quarter
        self.assertIn("## 2023_Q2 — no_transactions", md)
        self.assertIn("No matched transactions in this quarter window.", md)
        # Matched quarter should not have a section header
        self.assertNotIn("## 2023_Q1 — match", md)


if __name__ == "__main__":
    unittest.main()

