import os
import unittest
from pathlib import Path
from tests.conftest import BaseTestCase
from fastwhisper.core.file_manager import FileManager
from fastwhisper.core.storage_manager import StorageManager
from unittest.mock import patch

class TestEnvironmentSpecific(BaseTestCase):
    def test_code_interpreter_mode(self):
        """Test behavior in code interpreter environment"""
        with patch.dict('os.environ', {'ENVIRONMENT': 'code_interpreter'}):
            file_manager = FileManager(is_code_interpreter=True)

            # Test virtual filesystem
            test_path = "/mnt/data/test.txt"
            file_manager.write_file(test_path, "test content")
            self.assertTrue(file_manager.file_exists(test_path))
            self.assertEqual(file_manager.read_file(test_path), "test content")

    def test_real_filesystem_mode(self):
        """Test behavior with real filesystem"""
        with patch.dict('os.environ', {'ENVIRONMENT': 'local'}):
            file_manager = FileManager(is_code_interpreter=False)

            # Test real filesystem operations
            test_file = self.create_test_file(self.input_dir / "real_fs_test.txt")
            self.assertTrue(file_manager.file_exists(str(test_file)))
            self.assertEqual(file_manager.read_file(str(test_file)), "test content")