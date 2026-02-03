import pytest
from unittest.mock import patch
from pathlib import Path
from src.fileselect.main import FileSelectionApp
from src.fileselect.models import Selection

@pytest.fixture
def mock_console_print(mocker):
    """
    Fixture to mock the rich.console.Console.print method globally.
    This ensures that all print calls within the display classes are intercepted.
    """
    return mocker.patch('rich.console.Console.print')

@pytest.fixture
def integration_app(tmp_path, mock_console_print, mocker):
    """
    Fixture to set up the FileSelectionApp with a temporary directory and mocked keyboard.
    """
    # Create test files and folders
    (tmp_path / "file1.txt").touch()
    (tmp_path / "file2.py").touch()
    folder = tmp_path / "folder1"
    folder.mkdir()
    (folder / "file3.txt").touch()

    app = FileSelectionApp(root_dir=tmp_path)

    # Mock the read_key method to control keyboard input
    # Use a generator that yields '1', 'h', 'q', 'y' as needed
    keys = iter(['1', 'h', 'q', 'y'])
    app.keyboard.read_key = mocker.Mock(side_effect=lambda: next(keys, 'y'))
    return app

def test_viewing_available_folders(integration_app):
    """
    Ensure that the root folder '.' and other folders are available.
    """
    assert len(integration_app.all_folders) == 2, f"Expected 2 folders ('.' and 'folder1'), got {len(integration_app.all_folders)}"

def test_root_folder_selection(integration_app, mocker):
    """
    Test that selecting the root folder '.' selects all root files.
    """
    # Assign keys to folders
    keyboard = integration_app.keyboard
    keyboard.allocate_keys(integration_app.all_folders, 'folder')

    # Find the key for the root folder '.'
    root_key = None
    for folder, key in keyboard.folder_keys.items():
        if folder == integration_app.root_dir:
            root_key = key
            break

    assert root_key is not None, "Root folder '.' key not found"

    # Simulate pressing the root folder key
    with patch.object(integration_app, 'toggle_all_files') as mock_toggle_all:
        integration_app._handle_selection(root_key)
        mock_toggle_all.assert_not_called()  # Should not call toggle_all_files

    # Instead, root folder selection should add all root files
    selected_files_after = len(integration_app.selected_files)

    # Assuming root has 2 files: file1.txt and file2.py
    assert selected_files_after == 2, "Selecting root folder did not select all root files"

def test_toggle_all_selection(integration_app, mocker):
    """
    Test that pressing '=' toggles all selections correctly.
    """
    # Mock toggle_all_files method
    toggle_all_mock = mocker.patch.object(integration_app, 'toggle_all_files')

    # Simulate pressing '='
    keyboard = integration_app.keyboard
    keyboard.add_action('=', ('action', 'toggle_all'))

    integration_app._handle_selection('=')

    toggle_all_mock.assert_called_once()

def test_display_state_after_selection(integration_app, mock_console_print):
    """
    Test that the display state reflects the current selections.
    """
    # Select a file manually
    test_file = integration_app.root_dir / "file1.txt"
    integration_app.selected_files.add(test_file)

    # Display the current state
    integration_app._display_current_state()

    # Assert that Console.print was called to render the tables
    mock_console_print.assert_called()