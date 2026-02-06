from tests.conftest import BaseTestCase
from fastwhisper.core.storage_manager import StorageManager
from unittest.mock import patch
from pathlib import Path

class TestStorageManager(BaseTestCase):
    def setUp(self):
        super().setUp()
        # Reduce retry settings for faster local testing
        self.storage_manager = StorageManager(
            str(self.input_dir),
            str(self.remote_dir),
            max_retries=1,  # Reduced from 3
            retry_delay=0   # Immediate retry, no sleep
        )

    def test_cleanup_local_files(self):
        """Test cleanup of local files"""
        # Create test files
        test_file = self.create_test_file(self.input_dir / "test.txt")
        remote_file = self.create_test_file(self.remote_dir / "test.txt")

        # Run cleanup
        self.storage_manager.cleanup_local_files()

        # Verify cleanup
        self.assertFalse(test_file.exists())
        self.assertTrue(remote_file.exists())

    def test_sync_queue_operations(self):
        """Test sync queue functionality"""
        # Add files to sync queue
        test_files = [
            self.create_test_file(self.input_dir / "file1.txt", "content1"),
            self.create_test_file(self.input_dir / "file2.txt", "content2")
        ]

        for file in test_files:
            self.storage_manager.add_to_sync_queue(str(file))

        self.assertEqual(len(self.storage_manager.sync_queue), 2)

        # Test sync operation
        self.storage_manager.sync_files()

        # Verify files were synced
        for file in test_files:
            remote_path = self.remote_dir / file.name
            self.assertTrue(remote_path.exists())
            self.assertEqual(remote_path.read_text(), file.read_text())

    def test_minimal_retry_mechanism(self):
        """Simplified retry test with minimal overhead"""
        test_file = self.create_test_file(self.input_dir / "retry_test.txt", "test content")

        # Simulate a single failure followed by success
        with patch('shutil.copy2', side_effect=[
            IOError("First attempt fails"),
            None  # Subsequent call succeeds
        ]) as mock_copy:
            self.storage_manager.add_to_sync_queue(str(test_file))
            self.storage_manager.sync_files()

            # Verify the file was synced
            remote_path = self.remote_dir / test_file.name
            self.assertTrue(remote_path.exists())
            self.assertEqual(remote_path.read_text(), "test content")

            # Verify only two copy attempts were made
            self.assertEqual(mock_copy.call_count, 2)