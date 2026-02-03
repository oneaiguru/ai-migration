import unittest
from pathlib import Path
from autotester.src.documentation_tool.documentation_tool import (
    extract_module_docstring,
    extract_class_and_method_docstrings,
    generate_markdown,
)

class TestDocumentationTool(unittest.TestCase):
    def setUp(self):
        self.test_file = Path(__file__).parent / "test_sample.py"
        with open(self.test_file, "w") as f:
            f.write('''"""Module docstring."""\n\nclass TestClass:\n    """Class docstring."""\n    def test_method(self):\n        """Method docstring."""\n        pass''')
        
        self.output_dir = Path(__file__).parent / "output"
        self.output_dir.mkdir(exist_ok=True)

    def tearDown(self):
        if self.test_file.exists():
            self.test_file.unlink()
        if self.output_dir.exists():
            for file in self.output_dir.iterdir():
                file.unlink()
            self.output_dir.rmdir()

    def test_extract_module_docstring(self):
        result = extract_module_docstring(self.test_file)
        self.assertEqual(result, "Module docstring.")

    def test_extract_class_and_method_docstrings(self):
        result = extract_class_and_method_docstrings(self.test_file)
        self.assertIsNotNone(result)
        self.assertEqual(result["class"]["name"], "TestClass")
        self.assertEqual(result["class"]["docstring"], "Class docstring.")
        self.assertEqual(len(result["methods"]), 1)
        self.assertEqual(result["methods"][0]["name"], "test_method")
        self.assertEqual(result["methods"][0]["docstring"], "Method docstring.")

    def test_generate_markdown(self):
        parsed_data = {
            "module_docstring": "Module docstring.",
            "class": {"name": "TestClass", "docstring": "Class docstring."},
            "methods": [{"name": "test_method", "docstring": "Method docstring."}]
        }
        output_file, success = generate_markdown(parsed_data, self.output_dir, self.test_file)
        
        self.assertTrue(success)
        self.assertTrue(output_file.exists())
        content = output_file.read_text()
        self.assertIn("# test_sample", content)
        self.assertIn("Module docstring.", content)
        self.assertIn("## Class: TestClass", content)
        self.assertIn("Class docstring.", content)
        self.assertIn("### Method: test_method", content)
        self.assertIn("Method docstring.", content)
