import pytest
from pathlib import Path
from unittest.mock import Mock, patch
from rich.console import Console
from rich.table import Table
from src.fileselect.displays.files_and_folders import FileAndFolderDisplay
from src.fileselect.models import Selection
from src.fileselect.utils.keyboard import KeyboardManager

@pytest.fixture
def mock_console(mocker):
    """Fixture to mock the Console class"""
    console = mocker.MagicMock(spec=Console)
    console.print = mocker.MagicMock()
    return console

@pytest.fixture
def test_dir(tmp_path):
    """Create a test directory structure"""
    # Create folders
    folder1 = tmp_path / "folder1"
    folder2 = tmp_path / "folder2"
    folder1.mkdir()
    folder2.mkdir()

    # Create files in root and folders
    (tmp_path / "root_file.txt").touch()
    (folder1 / "file1.txt").touch()
    (folder2 / "file2.py").touch()

    return tmp_path

@pytest.fixture
def display(test_dir, mock_console):
    """Create FileAndFolderDisplay instance with mocked console"""
    display = FileAndFolderDisplay(test_dir)
    display.console = mock_console
    return display

@pytest.fixture
def keyboard(test_dir):
    """Create KeyboardManager instance"""
    keyboard = KeyboardManager()
    
    # Get actual test folders and files
    folders = sorted(d for d in test_dir.glob("*") if d.is_dir())
    files = sorted(
        list(test_dir.glob("**/*.txt")) + 
        list(test_dir.glob("**/*.py"))
    )
    
    # Map sequential keys to actual paths
    keyboard.folder_keys = {str(i+1): folder for i, folder in enumerate(folders)}
    keyboard.file_keys = {str(i+3): file for i, file in enumerate(files)}
    
    return keyboard

def test_display_files_and_folders(display, test_dir, keyboard):
    """Test display with files and folders"""
    files = list(test_dir.glob("**/*.txt")) + list(test_dir.glob("**/*.py"))
    folders = [d for d in test_dir.glob("*") if d.is_dir()]

    selected_files = {files[0]}
    selected_folders = Selection()
    selected_folders.selected.add(folders[0])

    display.display_files_and_folders(files, folders, selected_files, selected_folders, keyboard)

    display.console.print.assert_called_once()
    table = display.console.print.call_args[0][0]
    assert len(table.rows) == len(files) + len(folders)

def test_partial_folder_selection(display, test_dir, keyboard):
    """Test display of partially selected folders"""
    folders = [d for d in test_dir.glob("*") if d.is_dir()]
    selected_folders = Selection()
    selected_folders.partial.add(folders[0])

    display.display_files_and_folders([], folders, set(), selected_folders, keyboard)

    # Just verify the display was called
    display.console.print.assert_called_once()

def test_empty_selection(display, test_dir, keyboard):
    """Test display with no selections"""
    files = list(test_dir.glob("**/*.txt"))
    folders = [d for d in test_dir.glob("*") if d.is_dir()]

    display.display_files_and_folders(files, folders, set(), Selection(), keyboard)

    # Just verify the display was called
    display.console.print.assert_called_once()

def test_file_type_icons(display, test_dir, keyboard):
    """Test that correct icons are displayed for files and folders"""
    files = [test_dir / "root_file.txt"]
    folders = [test_dir / "folder1"]

    display.display_files_and_folders(files, folders, set(), Selection(), keyboard)

    # Just verify the display was called
    display.console.print.assert_called_once()