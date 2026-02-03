import unittest
from unittest.mock import patch, MagicMock, mock_open
from pathlib import Path
from llmcodeupdater.input_handler import InputHandler
import os
import json


class TestInputHandler(unittest.TestCase):
    def setUp(self):
        # Set up test directory
        self.temp_dir = os.path.join(os.path.dirname(__file__), 'test_temp')
        os.makedirs(self.temp_dir, exist_ok=True)
        
        # Set up test VS Code projects data
        self.vscode_projects = [
            {
                "name": "Project1",
                "path": "/path/to/project1",
                "enabled": True
            },
            {
                "name": "Project2",
                "path": "/path/to/project2",
                "enabled": False
            }
        ]
        
        self.handler = InputHandler()

    def tearDown(self):
        # Clean up test directory
        if os.path.exists(self.temp_dir):
            import shutil
            shutil.rmtree(self.temp_dir)

    def test_validate_path_valid(self):
        test_dir = os.path.join(self.temp_dir, 'valid_directory')
        os.makedirs(test_dir, exist_ok=True)
        path = self.handler.validate_path(test_dir)
        self.assertIsInstance(path, Path)

    # Removed obsolete tests:
    # - test_get_git_projects
    # - test_load_vscode_projects
    # - test_process_input_interactive_project_selection
    # - test_select_project_interactive
    # - test_select_project_interactive_empty
