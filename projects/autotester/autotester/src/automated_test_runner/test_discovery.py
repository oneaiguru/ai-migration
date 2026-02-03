
import unittest
import tempfile
import os

class TestDiscovery(unittest.TestCase):
    '''Tests for discovering test files and test cases.'''

    @classmethod
    def setUpClass(cls):
        cls.test_dir = tempfile.TemporaryDirectory()
        cls.test_files = [
            "test_valid_1.py", "valid_test.py", "test_ignore.txt", 
            "non_test_script.py", "test_hidden.py", ".test_hidden.py"
        ]
        
        cls.nested_dir = os.path.join(cls.test_dir.name, "nested")
        os.makedirs(cls.nested_dir, exist_ok=True)
        
        for file in cls.test_files:
            with open(os.path.join(cls.test_dir.name, file), 'w') as f:
                f.write("# Test file content")
        
        cls.nested_test_file = "nested/test_nested.py"
        with open(os.path.join(cls.nested_dir, "test_nested.py"), 'w') as f:
            f.write("# Nested test file content")

    @classmethod
    def tearDownClass(cls):
        cls.test_dir.cleanup()

    def test_discovery_valid_test_files(self):
        valid_test_files = [
            "test_valid_1.py", "valid_test.py", "nested/test_nested.py", "test_hidden.py"
        ]
        discovered_files = discover_test_files(self.test_dir.name)
        self.assertCountEqual(discovered_files, valid_test_files)

    def test_discovery_non_test_files_ignored(self):
        ignored_files = ["test_ignore.txt", "non_test_script.py"]
        discovered_files = discover_test_files(self.test_dir.name)
        for ignored_file in ignored_files:
            self.assertNotIn(ignored_file, discovered_files)

    def test_discovery_in_nested_directories(self):
        discovered_files = discover_test_files(self.test_dir.name)
        self.assertIn(self.nested_test_file, discovered_files)

    def test_no_test_files(self):
        empty_dir = tempfile.TemporaryDirectory()
        discovered_files = discover_test_files(empty_dir.name)
        self.assertEqual(discovered_files, [])
        empty_dir.cleanup()

    def test_hidden_files_handling(self):
        discovered_files = discover_test_files(self.test_dir.name)
        self.assertNotIn(".test_hidden.py", discovered_files)

def discover_test_files(directory: str) -> list:
    test_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if (file.startswith("test_") or file.endswith("_test.py")) and file.endswith(".py") and not file.startswith("."):
                relative_path = os.path.relpath(os.path.join(root, file), directory)
                test_files.append(relative_path)
    return test_files
