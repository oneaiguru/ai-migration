import unittest
import tempfile
import os
from pathlib import Path
from typing import Dict, Optional
from feedback.feedback_collector import FeedbackCollector
import unittest
import importlib.util
import types
class TestExecution(unittest.TestCase):
    '''Tests for executing test cases and handling various outcomes.'''

    @classmethod
    def setUpClass(cls):
        cls.test_dir = tempfile.TemporaryDirectory()
        
        cls.test_file_1 = os.path.join(cls.test_dir.name, "test_passing.py")
        with open(cls.test_file_1, 'w') as f:
            f.write("""
import unittest

class PassingTest(unittest.TestCase):
    def test_passing_method(self):
        pass
            """)

        cls.test_file_2 = os.path.join(cls.test_dir.name, "test_failing.py")
        with open(cls.test_file_2, 'w') as f:
            f.write("""
import unittest

class FailingTest(unittest.TestCase):
    def test_failing_method(self):
        self.assertEqual(1, 0, "Intentional failure")
            """)

        cls.test_file_3 = os.path.join(cls.test_dir.name, "test_skipped.py")
        with open(cls.test_file_3, 'w') as f:
            f.write("""
import unittest

class SkippedTest(unittest.TestCase):
    @unittest.skip("skip reason")
    def test_skipped_method(self):
        pass
            """)

    @classmethod
    def tearDownClass(cls):
        cls.test_dir.cleanup()

    def test_successful_test_run(self):
        results = run_tests(self.test_file_1)
        self.assertEqual(results['passed'], 1)
        self.assertEqual(results['failed'], 0)
        self.assertEqual(results['skipped'], 0)

    def test_failing_test_run(self):
        results = run_tests(self.test_file_2)
        self.assertEqual(results['passed'], 0)
        self.assertEqual(results['failed'], 1)
        self.assertEqual(results['skipped'], 0)

    def test_skipped_test_run(self):
        results = run_tests(self.test_file_3)
        self.assertEqual(results['passed'], 0)
        self.assertEqual(results['failed'], 0)
        self.assertEqual(results['skipped'], 1)

def collect_user_feedback(feedback_collector: FeedbackCollector) -> None:
    """
    Collect user feedback about test execution and reporting.
    
    Args:
        feedback_collector: Instance of FeedbackCollector to store feedback
    """
    print("\nTest Execution Feedback:")
    print("-" * 50)
    
    # Get feedback on comprehensiveness and clarity
    while True:
        response = input("Were the test results comprehensive and clear? (yes/no): ").lower()
        if response in ['yes', 'no']:
            break
        print("Please enter 'yes' or 'no'")
    
    # Get improvement suggestions
    suggestions = input("Any suggestions for improving the test reporting? (press Enter to skip): ")
    
    # Store feedback
    feedback_collector.collect_feedback(
        component="Automated Test Runner",
        file_name="Test Execution Report",
        feedback_type="Success" if response == "yes" else "Improvement Suggestion",
        comments=suggestions if suggestions else None
    )

def run_tests(file_path: str, feedback_collector: Optional[FeedbackCollector] = None) -> dict:
    """
    Run unittest tests from the specified file and collect user feedback.
    """
    results = {'passed': 0, 'failed': 0, 'skipped': 0}

    # Dynamically load the test module
    spec = importlib.util.spec_from_file_location("dynamic_test_module", file_path)
    if spec and spec.loader:
        module = importlib.util.module_from_spec(spec)
        try:
            spec.loader.exec_module(module)
        except Exception as e:
            results['failed'] += 1
            return results

        # Discover and run tests in the loaded module
        suite = unittest.defaultTestLoader.loadTestsFromModule(module)
        test_result = unittest.TestResult()
        suite.run(test_result)

        results['passed'] = test_result.testsRun - len(test_result.failures) - len(test_result.errors) - len(test_result.skipped)
        results['failed'] = len(test_result.failures) + len(test_result.errors)
        results['skipped'] = len(test_result.skipped)

    # Collect feedback if collector is provided and tests have completed
    if feedback_collector is not None:
        collect_user_feedback(feedback_collector)

    return results

def main():
    """Main entry point for test execution with feedback collection."""
    # Initialize feedback collector
    output_dir = Path("feedback_data")
    feedback_collector = FeedbackCollector(output_dir)
    
    # Run tests with feedback collection
    test_files = [
        "test_passing.py",
        "test_failing.py",
        "test_skipped.py"
    ]
    
    all_results = {}
    for test_file in test_files:
        results = run_tests(test_file, feedback_collector)
        all_results[test_file] = results
    
    return all_results

if __name__ == "__main__":
    main()
