# test_watch_downloads.py
import os
import time
import unittest
import tempfile
from pathlib import Path
from threading import Thread
from watchdog.observers import Observer
from watch_downloads import PythonFileRenameHandler, create_watchdog

class TestPythonFileRenameHandler(unittest.TestCase):
    def setUp(self):
        # Create temporary directory
        self.temp_dir = tempfile.mkdtemp()
        self.downloads_path = Path(self.temp_dir)
        
        # Configure logging to avoid ResourceWarning
        self.watchdog = create_watchdog("test", self.downloads_path, PythonFileRenameHandler)
        self.watchdog.start()
        # Wait for observer to be fully started
        time.sleep(1)

    def tearDown(self):
        # Ensure watchdog is properly stopped
        if self.watchdog:
            self.watchdog.stop()
            time.sleep(0.5)  # Give time for cleanup
            
        # Clean up temporary directory
        try:
            for root, dirs, files in os.walk(self.temp_dir, topdown=False):
                for name in files:
                    os.remove(os.path.join(root, name))
                for name in dirs:
                    os.rmdir(os.path.join(root, name))
            os.rmdir(self.temp_dir)
        except Exception as e:
            print(f"Cleanup error: {e}")

    def test_renames_python_file_with_hyphen(self):
        test_file = self.downloads_path / 'test-file.py'
        with open(test_file, 'w') as f:
            f.write('# Test content')
        
        # Wait for file operation to complete
        max_wait = 10
        start_time = time.time()
        expected_file = self.downloads_path / 'test_file.py'
        
        while time.time() - start_time < max_wait:
            if expected_file.exists():
                break
            time.sleep(0.5)
            
        self.assertTrue(expected_file.exists(), "File was not renamed within the expected timeframe")
        self.assertFalse(test_file.exists(), "Original file still exists")
        with open(expected_file) as f:
            self.assertEqual(f.read(), '# Test content')

    def test_ignores_non_python_files(self):
        test_file = self.downloads_path / 'test-file.txt'
        with open(test_file, 'w') as f:
            f.write('Test content')
        time.sleep(1)

        self.assertTrue(test_file.exists())
        self.assertFalse((self.downloads_path / 'test_file.txt').exists())

    def test_ignores_python_files_without_hyphens(self):
        test_file = self.downloads_path / 'test_file.py'
        with open(test_file, 'w') as f:
            f.write('# Test content')
        time.sleep(1)

        self.assertTrue(test_file.exists())

    def test_ignores_files_in_subdirectories(self):
        subdir = self.downloads_path / 'subdir'
        subdir.mkdir(exist_ok=True)
        
        test_file = subdir / 'test-file.py'
        with open(test_file, 'w') as f:
            f.write('# Test content')
        time.sleep(1)

        self.assertTrue(test_file.exists())
        self.assertFalse((subdir / 'test_file.py').exists())

    def test_handles_multiple_hyphens(self):
        test_file = self.downloads_path / 'test-file-with-hyphens.py'
        with open(test_file, 'w') as f:
            f.write('# Test content')
            
        # Wait for file operation to complete
        max_wait = 10
        start_time = time.time()
        expected_file = self.downloads_path / 'test_file_with_hyphens.py'
        
        while time.time() - start_time < max_wait:
            if expected_file.exists():
                break
            time.sleep(0.5)
            
        self.assertTrue(expected_file.exists(), "File was not renamed within the expected timeframe")
        self.assertFalse(test_file.exists(), "Original file still exists")
        with open(expected_file) as f:
            self.assertEqual(f.read(), '# Test content')

if __name__ == '__main__':
    unittest.main()