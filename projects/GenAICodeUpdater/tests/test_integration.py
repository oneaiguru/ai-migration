import unittest
import tempfile
import os
import shutil
from llmcodeupdater.main import main
from unittest.mock import patch, MagicMock
from datetime import datetime

class TestIntegration(unittest.TestCase):
    def setUp(self):
        """Set up test environment."""
        self.project_dir = tempfile.mkdtemp()
        self.backup_dir = tempfile.mkdtemp()
        self.report_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.backup_dir, 'tasks.db')

        # Create report directory
        os.makedirs(self.report_dir, exist_ok=True)

        # Mock the CENTRALIZED_STORAGE environment variable
        env_patcher = patch.dict(os.environ, {"CENTRALIZED_STORAGE": self.backup_dir})
        env_patcher.start()
        self.addCleanup(env_patcher.stop)

        # Mock get_centralized_path with actual directory creation
        def mock_get_centralized_path(subdir):
            paths = {
                'backups': self.backup_dir,
                'reports': self.report_dir,
                'tasks.db': os.path.join(self.backup_dir, 'tasks.db')
            }
            path = paths[subdir]
            if subdir != 'tasks.db':
                os.makedirs(path, exist_ok=True)
            return path

        centralized_path_patcher = patch(
            'llmcodeupdater.main.get_centralized_path',
            side_effect=mock_get_centralized_path,
        )
        centralized_path_patcher.start()
        self.addCleanup(centralized_path_patcher.stop)

    def tearDown(self):
        """Clean up temporary directories."""
        shutil.rmtree(self.project_dir, ignore_errors=True)
        shutil.rmtree(self.backup_dir, ignore_errors=True)
        shutil.rmtree(self.report_dir, ignore_errors=True)

    def test_full_workflow(self):
        """Test the full workflow from input parsing to report generation."""
        # Mock command line arguments
        test_args = [
            '--content',
            '# test.py\ndef new_function():\n    print("New Function")\n'
        ]

        # Create a mock report generator that actually creates files
        class MockReportGenerator:
            def __init__(self, report_dir):
                self.report_dir = report_dir

            def generate_markdown_report(self, *args, **kwargs):
                report_path = os.path.join(self.report_dir, f'update_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.md')
                with open(report_path, 'w') as f:
                    f.write("# Test Report\n")
                return report_path

            def generate_json_report(self, *args, **kwargs):
                report_path = os.path.join(self.report_dir, f'update_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
                with open(report_path, 'w') as f:
                    f.write('{"test": "data"}')
                return report_path

        # Mock dependencies
        with patch('llmcodeupdater.input_handler.pyperclip.paste', return_value='# test.py\ndef new_function():\n    print("New Function")\n'), \
             patch('llmcodeupdater.main.setup_cli_parser') as mock_parser, \
             patch('llmcodeupdater.main.InputHandler') as mock_input_handler, \
             patch('llmcodeupdater.main.IgnoreHandler') as mock_ignore_handler, \
             patch('llmcodeupdater.main.FileEncodingHandler') as mock_file_handler, \
             patch('llmcodeupdater.main.TaskTracker') as mock_task_tracker, \
             patch('llmcodeupdater.main.ReportGenerator', return_value=MockReportGenerator(self.report_dir)), \
             patch('llmcodeupdater.main.update_files') as mock_update_files, \
             patch('llmcodeupdater.main.parse_code_blocks_with_logging') as mock_parse_blocks, \
             patch('llmcodeupdater.main.backup_files') as mock_backup_files:

            mock_parser.return_value.parse_args.return_value = MagicMock(
                git_path=None,
                use_config=True,
                content='# test.py\ndef new_function():\n    print("New Function")\n',
                content_file=None
            )
            mock_input_handler.return_value.process_input.return_value = {
                'project_path': self.project_dir,
                'llm_content': '# test.py\ndef new_function():\n    print("New Function")\n'
            }
            mock_ignore_handler.return_value.is_ignored.return_value = False
            mock_parse_blocks.return_value = [('test.py', 'def new_function():\n    print("New Function")\n')]
            mock_update_files.return_value = {
                'files_updated': 1,
                'files_created': 0,
                'files_skipped': 0,
                'errors': {}
            }
            mock_backup_files.return_value = 1

            # Run the main function
            main(argv=test_args)

            # Verify reports were generated
            markdown_reports = [f for f in os.listdir(self.report_dir) if f.endswith('.md')]
            json_reports = [f for f in os.listdir(self.report_dir) if f.endswith('.json')]

            self.assertTrue(len(markdown_reports) > 0, "No markdown reports generated")
            self.assertTrue(len(json_reports) > 0, "No JSON reports generated")

            # Check report content
            with open(os.path.join(self.report_dir, markdown_reports[0])) as f:
                self.assertIn("Test Report", f.read())