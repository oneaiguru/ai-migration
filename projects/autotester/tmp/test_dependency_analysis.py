import unittest
from unittest.mock import patch
from dependency_analysis import extract_imports_from_content, get_full_import_path

class ExtractImportsTests(unittest.TestCase):
    def test_extract_standard_import(self):
        content = "import os\nimport sys"
        current_path = "/project/module_a.py"  # Example path for testing
        imports = extract_imports_from_content(content, current_path)
        self.assertIn("os", imports)
        self.assertIn("sys", imports)

    def test_extract_from_import(self):
        content = "from module_b import ClassB"
        current_path = "/project/module_a.py"
        imports = extract_imports_from_content(content, current_path)
        self.assertIn("module_b", imports)

    def test_extract_aliased_import(self):
        content = "import module_c as mc"
        current_path = "/project/module_a.py"
        imports = extract_imports_from_content(content, current_path)
        self.assertIn("module_c", imports)

    def test_extract_single_level_relative_import(self):
        content = "from .module_b import ClassB"
        current_path = "/project/package/module_a.py"
        imports = extract_imports_from_content(content, current_path)
        self.assertIn("package.module_b", imports)

    def test_extract_multi_level_relative_import(self):
        content = "from ..module_d import ClassD"
        current_path = "/project/package/subpackage/module_a.py"
        imports = extract_imports_from_content(content, current_path)
        self.assertIn("package.module_d", imports)

    def test_extract_dynamic_import(self):
        content = "import importlib\nmodule = importlib.import_module('module_e')"
        current_path = "/project/module_a.py"
        imports = extract_imports_from_content(content, current_path)
        self.assertIn("importlib", imports)
        self.assertIn("module_e", imports)

    def test_extract_conditional_import(self):
        content = """
        if some_condition:
            import module_f
        """
        current_path = "/project/module_a.py"
        imports = extract_imports_from_content(content, current_path)
        self.assertIn("module_f", imports)
