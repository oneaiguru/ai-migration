import pytest
from unittest.mock import patch, MagicMock
from rich.console import Console
from rich.table import Table
from rich.style import Style
from src.fileselect.displays.base import BaseTable
from src.fileselect.displays.files import FileTable
from src.fileselect.displays.folders import FolderTable
from src.fileselect.displays.tags import TagTable
from src.fileselect.models import Selection
from src.fileselect.utils.keyboard import KeyboardManager

@pytest.fixture
def mock_table(mocker):
    # Create a robust mock that tracks add_column and add_row calls
    table = mocker.MagicMock(spec=Table)
    table.add_column = mocker.MagicMock()
    table.add_row = mocker.MagicMock()
    return table

@pytest.fixture
def mock_console(mocker, mock_table):
    console = mocker.MagicMock(spec=Console)
    console.print = mocker.MagicMock()
    # Patch 'Table' in 'src.fileselect.displays.base' where it's instantiated
    mocker.patch('src.fileselect.displays.base.Table', return_value=mock_table)
    return console

@pytest.fixture
def file_table(tmp_path, mock_console, mock_table):
    display = FileTable(tmp_path)
    display.console = mock_console
    return display

@pytest.fixture
def sample_files(tmp_path):
    files = []
    for i in range(3):
        file_path = tmp_path / f"test{i}.txt"
        file_path.touch()
        with open(file_path, 'w') as f:
            f.write(f"test content {i}")
        files.append(file_path)
    return files

def test_file_display(file_table, sample_files, mock_table):
    """Test that files are displayed correctly with all columns"""
    # Setup
    keyboard = KeyboardManager()
    keyboard.allocate_keys(sample_files, 'file')

    # Act
    file_table.display_files(sample_files, set(), keyboard)

    # Assert correct columns were added
    expected_columns = [
        ('S', {'width': 1}),
        ('Key', {'width': 1}),
        ('File', {'style': 'cyan'}),
        ('Size', {'justify': 'right', 'style': 'dim'}),
        ('Type', {'style': 'yellow'})
    ]

    column_calls = mock_table.add_column.call_args_list
    assert len(column_calls) >= len(expected_columns), "Not all expected columns were added."

    for (expected_name, expected_kwargs), call in zip(expected_columns, column_calls):
        args, kwargs = call
        assert args[0] == expected_name, f"Expected column name '{expected_name}', got '{args[0]}'"
        for key, value in expected_kwargs.items():
            assert kwargs.get(key) == value, f"Expected {key}='{value}' for column '{expected_name}', got '{kwargs.get(key)}'"

    # Assert rows were added for each file
    assert mock_table.add_row.call_count == len(sample_files), f"Expected {len(sample_files)} rows, got {mock_table.add_row.call_count}"

def test_selection_display(file_table, sample_files, mock_table):
    """Test that selected files are properly marked"""
    # Setup
    keyboard = KeyboardManager()
    keyboard.allocate_keys(sample_files, 'file')
    selected_file = sample_files[0]

    # Act
    file_table.display_files(sample_files, {selected_file}, keyboard)

    # Assert selected files are marked with '✓'
    row_calls = mock_table.add_row.call_args_list
    selected_file_found = False
    for call in row_calls:
        args, _ = call
        if args[0] == '✓':  # First column should be selection marker
            relative_path = file_table.get_relative_path(selected_file)
            # Check if this row corresponds to our selected file
            file_col = args[2]  # File path column
            if str(relative_path) in file_col:
                selected_file_found = True
                break

    assert selected_file_found, f"Selected file {selected_file} should be marked with ✓"

def test_folder_color_consistency(file_table, tmp_path, mock_console, keyboard_manager):
    """Test that folders maintain consistent colors across displays"""
    # Setup: Create folders and files
    folder1 = tmp_path / "folder1"
    folder2 = tmp_path / "folder2"
    folder1.mkdir()
    folder2.mkdir()
    (folder1 / "file1.txt").touch()
    (folder2 / "file2.txt").touch()

    # Assign keys
    keyboard_manager.allocate_keys({folder1, folder2}, 'folder')

    # Capture initial colors
    file_table.folder_color_map = {}
    file_table.display_files([folder1 / "file1.txt", folder2 / "file2.txt"], set(), keyboard_manager)
    first_colors = list(file_table.folder_color_map.values())

    # Capture colors after second display
    file_table.display_files([folder1 / "file1.txt", folder2 / "file2.txt"], set(), keyboard_manager)
    second_colors = list(file_table.folder_color_map.values())

    assert first_colors == second_colors, "Folder colors are inconsistent across displays"

def test_toggle_all_hotkey_in_file_display(file_table, sample_files, mocker):
    """Test that the '=' hotkey toggles all file selections in display"""
    # Setup
    keyboard = KeyboardManager()
    keyboard.allocate_keys(sample_files, 'file')

    # Mock toggle_all_files method
    toggle_all_mock = mocker.patch.object(file_table, 'toggle_all_files')

    # Simulate pressing '='
    action = keyboard.get_action('=')
    if action == ('action', 'toggle_all'):
        file_table.toggle_all_files()

    toggle_all_mock.assert_called_once()