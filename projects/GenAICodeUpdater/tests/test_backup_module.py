import unittest
import os
import tempfile
import shutil
import pytest
from llmcodeupdater.backup import backup_files  # Ensure 'backup.py' is correctly named

from llmcodeupdater.mapping import update_files  # Update if necessary
from llmcodeupdater.reporting import ReportGenerator  # Ensure 'reporting.py' is correctly named

@pytest.mark.usefixtures("mock_logging")
class TestBackupModuleWithErrorHandling(unittest.TestCase):

    def setUp(self):
        self.project_root = tempfile.mkdtemp()
        self.backup_root = tempfile.mkdtemp()

        # Create some sample files
        os.makedirs(os.path.join(self.project_root, 'utils'), exist_ok=True)
        os.makedirs(os.path.join(self.project_root, 'bot'), exist_ok=True)
        
        with open(os.path.join(self.project_root, 'utils', 'redis_manager.py'), 'w') as f:
            f.write('# Original RedisManager code')
        with open(os.path.join(self.project_root, 'bot', 'telegram_bot.py'), 'w') as f:
            f.write('# Original TelegramBot code')
        
        self.file_paths = [
            os.path.join(self.project_root, 'utils', 'redis_manager.py'),
            os.path.join(self.project_root, 'bot', 'telegram_bot.py')
        ]

    def tearDown(self):
        shutil.rmtree(self.project_root)
        shutil.rmtree(self.backup_root)

    def test_backup_files_success(self):
        count = backup_files(self.file_paths, self.project_root, self.backup_root)
        self.assertEqual(count, 2)

        backup_dirs = os.listdir(self.backup_root)
        self.assertEqual(len(backup_dirs), 1)

        backup_timestamp = backup_dirs[0]
        for original_file in self.file_paths:
            relative_path = os.path.relpath(original_file, self.project_root)
            backup_file = os.path.join(self.backup_root, backup_timestamp, relative_path)
            self.assertTrue(os.path.isfile(backup_file))
            with open(original_file, 'r') as orig_f, open(backup_file, 'r') as backup_f:
                original_content = orig_f.read()
                backup_content = backup_f.read()
                self.assertIn('# Original', backup_content)

    def test_directory_structure_preserved(self):
        count = backup_files(self.file_paths, self.project_root, self.backup_root)
        self.assertEqual(count, 2)

        backup_dirs = os.listdir(self.backup_root)
        backup_timestamp = backup_dirs[0]
        
        expected_paths = [
            os.path.join(self.backup_root, backup_timestamp, 'utils', 'redis_manager.py'),
            os.path.join(self.backup_root, backup_timestamp, 'bot', 'telegram_bot.py')
        ]
        
        for backup_file in expected_paths:
            self.assertTrue(os.path.isfile(backup_file))

    def test_backup_integrity(self):
        count = backup_files(self.file_paths, self.project_root, self.backup_root)
        self.assertEqual(count, 2)

        backup_dirs = os.listdir(self.backup_root)
        backup_timestamp = backup_dirs[0]

        for original_file in self.file_paths:
            relative_path = os.path.relpath(original_file, self.project_root)
            backup_file = os.path.join(self.backup_root, backup_timestamp, relative_path)
            with open(original_file, 'r') as orig_f, open(backup_file, 'r') as backup_f:
                original_content = orig_f.read()
                backup_content = backup_f.read()
                self.assertEqual(original_content, backup_content)

    def test_handle_non_existent_files(self):
        non_existent_file = os.path.join(self.project_root, 'missing_file.py')
        self.file_paths.append(non_existent_file)

        count = backup_files(self.file_paths, self.project_root, self.backup_root)
        self.assertEqual(count, 2)

    def test_cleanup_on_failure(self):
        os.chmod(self.backup_root, 0o400)

        with self.assertRaises(PermissionError):
            backup_files(self.file_paths, self.project_root, self.backup_root)
        
        backup_dirs = os.listdir(self.backup_root)
        self.assertEqual(len(backup_dirs), 0)

    def test_backup_files_with_project_root(self):
        """Test backup_files with project_root and backup_root arguments."""
        with tempfile.TemporaryDirectory() as project_dir, tempfile.TemporaryDirectory() as backup_dir:
            # Create some test files
            test_file1 = os.path.join(project_dir, 'file1.txt')
            test_file2 = os.path.join(project_dir, 'subdir', 'file2.txt')
            os.makedirs(os.path.dirname(test_file2), exist_ok=True)
            
            with open(test_file1, 'w') as f:
                f.write('test content 1')
            with open(test_file2, 'w') as f:
                f.write('test content 2')

            # Perform backup
            files_to_backup = [test_file1, test_file2]
            backed_up_count = backup_files(files_to_backup, project_dir, backup_dir)

            # Verify backup
            self.assertEqual(backed_up_count, 2)
            backup_dirs = os.listdir(backup_dir)
            self.assertEqual(len(backup_dirs), 1)  # One timestamped directory

            backup_timestamp = backup_dirs[0]
            backup_files_list = os.listdir(os.path.join(backup_dir, backup_timestamp))
            self.assertIn('file1.txt', backup_files_list)
            self.assertIn('subdir', backup_files_list)

            # Verify nested file
            backup_subdir = os.path.join(backup_dir, backup_timestamp, 'subdir')
            self.assertTrue(os.path.isdir(backup_subdir))
            backup_file2 = os.path.join(backup_subdir, 'file2.txt')
            self.assertTrue(os.path.isfile(backup_file2))

            # Verify file contents
            with open(backup_file2, 'r') as f:
                self.assertEqual(f.read(), 'test content 2')

if __name__ == '__main__':
    unittest.main()
