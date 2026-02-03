import unittest
import tempfile
import os
from radon.complexity import cc_visit
from radon.metrics import h_visit
from radon.raw import analyze
from autotester.src.code_quality_checker.checks import PEP8Checker

class TestPEP8Checker(unittest.TestCase):
    def setUp(self):
        self.checker = PEP8Checker()
        self.test_dir = tempfile.mkdtemp()
        
    def tearDown(self):
        if os.path.exists(self.test_dir):
            for root, dirs, files in os.walk(self.test_dir, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    os.rmdir(os.path.join(root, name))
            os.rmdir(self.test_dir)

    def test_line_length_violation(self):
        test_file = os.path.join(self.test_dir, 'test.py')
        with open(test_file, 'w') as f:
            f.write("x = 'This line is too long for testing purposes and should trigger a PEP8 violation because it exceeds 79 characters'\n")
        
        results = self.checker.check_files([test_file])
        self.assertTrue(results.pep8_errors > 0)

    def test_valid_file(self):
        test_file = os.path.join(self.test_dir, 'test.py')
        with open(test_file, 'w') as f:
            f.write("x = 'This is a valid line'\n")
        
        results = self.checker.check_files([test_file])
        self.assertFalse(results.has_issues)

    def test_high_complexity(self):
        test_file = os.path.join(self.test_dir, 'complex.py')
        complex_code = '''
def complex_function(x):
    if x > 0:
        if x < 10:
            return "small positive"
        elif x < 100:
            return "medium positive"
        else:
            return "large positive"
    elif x < 0:
        if x > -10:
            return "small negative"
        elif x > -100:
            return "medium negative"
        else:
            return "large negative"
    return "zero"
'''
        with open(test_file, 'w') as f:
            f.write(complex_code)

        results = self.checker.check_files([test_file])
        self.assertTrue(len(results.complexity_issues) > 0)
        self.assertIn("complex_function", results.complexity_issues[0])

    def test_high_halstead_volume(self):
        test_file = os.path.join(self.test_dir, 'halstead_test.py')
        # Creating a more complex function to trigger Halstead volume threshold
        test_code = '''
def complex_calculation(a, b, c, d, e, f):
    result = (a + b) * (c - d) / (e ** f)
    if result > 0:
        return result * (a + b + c + d +
'''
        with open(test_file, 'w') as f:
            f.write(test_code)

        results = self.checker.check_files([test_file])
        self.assertTrue(len(results.halstead_issues) > 0)
        self.assertIn("Halstead volume is too high, consider simplifying the code", results.halstead_issues[0])

    def test_code_maintainability(self):
        test_file = os.path.join(self.test_dir, 'maintainability.py')
        test_code = '''
def process_data(data):
    """Process input data and return results."""
    results = []
    for item in data:
        if item.is_valid():
            results.append(item.process())
    return results
'''
        with open(test_file, 'w') as f:
            f.write(test_code)

        # Analyze raw metrics
        with open(test_file, 'r') as f:
            code = f.read()
            metrics = analyze(code)
            
        # Check various maintainability indicators
        self.assertLess(metrics.loc, 20, "Too many lines of code")
        self.assertLess(metrics.lloc, 10, "Too many logical lines of code")

if __name__ == '__main__':
    unittest.main()
