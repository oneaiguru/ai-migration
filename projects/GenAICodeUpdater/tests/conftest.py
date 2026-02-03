# tests/conftest.py

import pytest
from unittest.mock import patch, MagicMock
import tempfile
import os
import shutil
import logging

@pytest.fixture(scope='function')
def mock_project_config():
    """Mock project configuration and related files"""
    with tempfile.TemporaryDirectory() as temp_dir:
        config = {
            'current_project': 'test_project',
            'projects_json_path': os.path.join(temp_dir, 'projects.json'),
            'project_root': temp_dir
        }
        
        # Create mock projects.json
        with open(config['projects_json_path'], 'w') as f:
            f.write('{"test_project": {"path": "' + temp_dir.replace('\\', '\\\\') + '"}}')
            
        with patch('llmcodeupdater.input_handler.InputHandler.load_config') as mock_config:
            mock_config.return_value = config
            yield config
        
        # Cleanup
        if os.path.exists(config['projects_json_path']):
            os.remove(config['projects_json_path'])

@pytest.fixture(scope='function')
def mock_filesystem():
    """Create temporary directory structure for testing"""
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create necessary subdirectories
        os.makedirs(os.path.join(temp_dir, 'backups'), exist_ok=True)
        os.makedirs(os.path.join(temp_dir, 'reports'), exist_ok=True)
        
        yield temp_dir
        
        # Cleanup
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

@pytest.fixture(scope='function')
def mock_clipboard_content():
    """Mock clipboard content with valid code blocks"""
    valid_content = """
# test.py
def hello():

    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    
# another.py
def goodbye():
    print("Goodbye!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
    print("Hello, World!")
"""
    with patch('pyperclip.paste', return_value=valid_content):
        yield valid_content

@pytest.fixture(scope='function')
def mock_invalid_clipboard_content():
    """Mock clipboard content with invalid format"""
    invalid_content = "This is not a valid code block format"
    with patch('pyperclip.paste', return_value=invalid_content):
        yield invalid_content

@pytest.fixture(autouse=True)
def mock_logging():
    """Mock logging to prevent actual log file creation and set logging level to DEBUG"""
    with patch('llmcodeupdater.logger.setup_logger') as mock_logger:
        mock_logger.return_value = MagicMock()
        yield mock_logger
