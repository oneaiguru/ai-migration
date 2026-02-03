import pytest
from pathlib import Path
from src.fileselect.selectors.files import FileSelector
from src.fileselect.utils.keyboard import KeyboardManager

def test_file_selector_initialization(test_dir):
    """Test basic initialization of FileSelector"""
    files = list(test_dir.glob('*.txt'))
    selector = FileSelector(files)
    assert len(selector.files) == len(files)
    assert selector.selected_files == []
    assert selector.tags == []
    assert selector.selected_folders == []
    assert hasattr(selector.keyboard, 'tag_keys')
    assert hasattr(selector.keyboard, 'file_keys')

def test_file_selection(test_dir):
    """Test file selection and deselection"""
    files = list(test_dir.glob('*.txt'))
    selector = FileSelector(files)

    # Force key allocation for testing
    selector.assign_keys()
    selector.keyboard.allocate_keys(files, 'file')

    # Get the first assigned key for testing
    if selector.keyboard.file_keys:
        first_file_key = next(iter(selector.keyboard.file_keys.keys()))

        # Test selection
        selector.select_file(first_file_key)
        assert len(selector.selected_files) == 1

        # Test deselection
        selector.select_file(first_file_key)
        assert len(selector.selected_files) == 0

def test_file_selector_with_folders(test_dir):
    """Test FileSelector with selected folders"""
    nested = test_dir / "nested"
    nested.mkdir(exist_ok=True)
    (nested / "test.txt").touch()

    files = list(test_dir.glob('*.txt'))
    selector = FileSelector(files, selected_folders=[nested])

    # Should include both direct files and files from selected folders
    all_files = selector.get_files()
    assert len(all_files) > 0
    assert any(f.parent == nested for f in all_files)

def test_file_selector_list_files(test_dir):
    """Test listing available files"""
    files = sorted(list(test_dir.glob('*.txt')))
    selector = FileSelector(files)

    listed_files = selector.list_files()
    assert len(listed_files) == len(files)
    assert all(isinstance(f, Path) for f in listed_files)

def test_toggle_all_hotkey_in_files_selector(test_dir, mocker):
    """Test that the '=' hotkey toggles all file selections"""
    files = list(test_dir.glob('*.txt'))
    selector = FileSelector(files)

    # Assign keys
    selector.assign_keys()
    selector.keyboard.allocate_keys(files, 'file')

    # Mock toggle_all functionality
    toggle_all_mock = mocker.patch.object(selector, 'toggle_all_files')

    # Simulate pressing '='
    action = selector.keyboard.get_action('=')
    if action == ('action', 'toggle_all'):
        selector.toggle_all_files()

    toggle_all_mock.assert_called_once()