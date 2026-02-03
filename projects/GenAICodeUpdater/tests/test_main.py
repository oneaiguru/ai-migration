import pytest
from unittest.mock import patch, MagicMock
import os
import shutil
from llmcodeupdater import main

@pytest.mark.usefixtures("mock_logging")
class TestMainModule:
    @patch('llmcodeupdater.main.backup_files')
    @patch('llmcodeupdater.main.setup_cli_parser')
    @patch('llmcodeupdater.main.InputHandler')
    @patch('llmcodeupdater.main.TaskTracker')
    @patch('llmcodeupdater.main.ReportGenerator')
    @patch('llmcodeupdater.main.FileEncodingHandler')
    @patch('llmcodeupdater.main.parse_code_blocks_with_logging')
    @patch('llmcodeupdater.main.update_files')
    @patch('llmcodeupdater.main.IgnoreHandler')
    @patch('llmcodeupdater.config.get_centralized_path')
    def test_main_successful_execution(
        self, mock_get_centralized_path, mock_ignore_handler, 
        mock_update_files, mock_parse_blocks, mock_file_handler, 
        mock_report_gen, mock_task_tracker, mock_input_handler, 
        mock_parser, mock_backup_files
    ):
        # Set up mocks
        mock_args = MagicMock()
        mock_args.git_path = None
        mock_args.use_config = True
        mock_parser.return_value.parse_args.return_value = mock_args

        # Mock centralized backup path
        centralized_backup_path = '/Users/m/.llmcodeupdater/backups'
        mock_get_centralized_path.return_value = centralized_backup_path

        mock_input_handler.return_value.process_input.return_value = {
            'project_path': '/test/path',
            'llm_content': 'test content'
        }

        mock_ignore_handler.return_value.is_ignored.return_value = False

        mock_parse_blocks.return_value = [('test.py', 'content')]
        mock_update_files.return_value = {
            'files_updated': 1,
            'files_created': 0,
            'files_skipped': 0,
            'errors': {}
        }

        mock_file_handler.return_value.preprocess_files.return_value = {
            'success': [], 'failed': []
        }

        mock_backup_files.return_value = 1  # Simulate one file backed up

        with patch('os.makedirs'), \
             patch('os.path.exists', return_value=True), \
             patch('os.walk', return_value=[('/test/path', [], ['test.py'])]):

            main()

        # Assertions with centralized backup path
        mock_backup_files.assert_called_once_with(
            ['/test/path/test.py'],
            '/test/path',
            centralized_backup_path
        )