import unittest
import io
import sys
from autotester.src.code_quality_checker.reporters.console_reporter import ConsoleReporter
from autotester.src.code_quality_checker.checks import PEP8Checker

class TestConsoleReporter(unittest.TestCase):
    def setUp(self):
        self.reporter = ConsoleReporter()
        self.checker = PEP8Checker(max_line_length=80)

    def test_report_no_errors(self):
        results = self.checker.check_files(['tests/compliant.py'])
        captured_output = io.StringIO()
        sys.stdout = captured_output
        self.reporter.report(results)
        sys.stdout = sys.__stdout__
        output = captured_output.getvalue()
        self.assertIn("PEP8 errors: 0", output)
