
import unittest
from unittest.mock import patch
from src.dependency_analysis.dependency_analysis import extract_imports_from_content, analyze_project_dependencies_from_content, visualize_dependencies

mock_files = {
    "module_a.py": "import module_b\nfrom module_c import ClassC",
    "module_b.py": "import module_c\nimport os",
    "module_c.py": "import module_d",
    "module_d.py": "import module_a",
    "standalone.py": "import math\nimport random"
}

class DependencyAnalyzerTests(unittest.TestCase):
    def test_extract_imports_from_content(self):
        expected_imports = {"module_b", "module_c"}
        imports = extract_imports_from_content(mock_files["module_a.py"])
        self.assertEqual(imports, expected_imports)

    @patch("matplotlib.pyplot.show")
    def test_visualize_dependencies(self, mock_show):
        dependencies = {
            "module_a": {"module_b", "module_c"},
            "module_b": {"module_c"},
            "module_c": {"module_d"},
            "module_d": {"module_a"}
        }
        try:
            visualize_dependencies(dependencies)
            success = True
        except Exception as e:
            print(f"Visualization failed with error: {e}")
            success = False
        self.assertTrue(success)

    def test_dependency_analysis_integration_from_content(self):
        expected_dependencies = {
            "module_a": {"module_b", "module_c"},
            "module_b": {"module_c"},
            "module_c": {"module_d"},
            "module_d": {"module_a"},
            "standalone": set()
        }
        dependencies = analyze_project_dependencies_from_content(mock_files)
        self.assertEqual(dependencies, expected_dependencies)

if __name__ == "__main__":
    unittest.main()
