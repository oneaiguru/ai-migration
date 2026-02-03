# tests/base.py

import unittest
from pathlib import Path
import tempfile
import shutil

class BaseTestCase(unittest.TestCase):
    """Base test case with setup and teardown utilities"""

    def setUp(self):
        """Additional setup before each test"""
        self.base_dir = Path(tempfile.mkdtemp())
        self.input_dir = self.base_dir / "input"
        self.output_dir = self.base_dir / "output"
        self.transcript_dir = self.base_dir / "transcript"
        self.archive_dir = self.base_dir / "archive"
        self.remote_dir = self.base_dir / "remote"

        # Create test directories
        for directory in [self.input_dir, self.output_dir, self.transcript_dir,
                          self.archive_dir, self.remote_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        self.cleanup_test_files()

    def tearDown(self):
        """Cleanup after each test"""
        self.cleanup_test_files()
        shutil.rmtree(self.base_dir)

    def cleanup_test_files(self):
        """Clean up test files between tests"""
        for directory in [self.input_dir, self.output_dir, self.transcript_dir,
                          self.archive_dir, self.remote_dir]:
            for file in directory.glob("*"):
                if file.is_file():
                    file.unlink()

    def create_test_file(self, path, content="test content"):
        """Helper method to create test files"""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(content, str):
            path.write_text(content)
        else:
            with open(path, 'wb') as f:
                f.write(content)
        return path
