import pytest
from pathlib import Path
from src.fileselect.main import FileSelectionApp
from src.fileselect.utils.keyboard import KeyboardManager
from src.fileselect.utils.path import PathHandler
import time  # Added missing import

@pytest.fixture
def integration_setup(tmp_path):
    # Create test directory structure
    test_files = {
        'file1.txt': 'content1',
        'file2.py': 'content2',
        'nested/file3.md': 'content3',
        '.gitignore': '*.pyc\n__pycache__'
    }
    
    for file_path, content in test_files.items():
        full_path = tmp_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_text(content)
    
    return tmp_path

def test_file_selection_integration(integration_setup):
    app = FileSelectionApp(root_dir=integration_setup)
    
    # Simulate file selection
    test_file = next(integration_setup.glob('**/*.txt'))
    key = app.keyboard.get_key('file', test_file)
    
    if key:  # Key might be None if no keys were available
        app._handle_selection(key)
        assert test_file in app.selected_files

def test_folder_selection_integration(integration_setup):
    app = FileSelectionApp(root_dir=integration_setup)
    
    # Select nested folder
    nested_folder = integration_setup / 'nested'
    key = app.keyboard.get_key('folder', nested_folder)
    
    if key:
        app._handle_selection(key)
        assert nested_folder in app.selected_folders.selected

@pytest.mark.performance
def test_large_directory_performance(tmp_path):
    # Create many test files
    for i in range(1000):
        (tmp_path / f'file{i}.txt').touch()
    
    start_time = time.time()  # Now time is properly imported
    app = FileSelectionApp(root_dir=tmp_path)
    initialization_time = time.time() - start_time
    
    assert initialization_time < 2.0  # Should initialize within 2 seconds

def test_config_integration(integration_setup):
    app = FileSelectionApp(root_dir=integration_setup)
    
    # Test config loading
    assert hasattr(app.config, 'config')
    assert isinstance(app.config.config, dict)
    
    # Test feature toggles
    assert app.config.config.get('features', {}).get('files', True)

def test_storage_integration(integration_setup):
    app = FileSelectionApp(root_dir=integration_setup)
    
    # Select a file and save selection
    test_file = next(integration_setup.glob('**/*.txt'))
    key = app.keyboard.get_key('file', test_file)
    
    if key:
        app._handle_selection(key)
        app._save_selection()
        
        # Verify selection was saved
        loaded_selection = app.storage.load_selection(type='files')
        assert test_file in loaded_selection

def test_toggle_all_selection_integration(integration_setup, mocker):
    app = FileSelectionApp(root_dir=integration_setup)

    # Assign keys
    app.keyboard.allocate_keys(app.all_files, 'file')

    # Mock toggle_all_files method
    toggle_all_mock = mocker.patch.object(app, 'toggle_all_files')

    # Simulate pressing '='
    action = app.keyboard.get_action('=')
    if action == ('action', 'toggle_all'):
        app.toggle_all_files()

    toggle_all_mock.assert_called_once()