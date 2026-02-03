import pytest
from src.fileselect.selectors.base import BaseSelector
from pathlib import Path

class MockSelection:
    def __init__(self):
        self.selected = set()

    def toggle(self, item):
        if item in self.selected:
            self.selected.remove(item)
        else:
            self.selected.add(item)

    def is_selected(self, item):
        return str(item) in self.selected  # Convert Path to string for comparison

    def get_selected(self):
        return self.selected

    def add_all(self, items):
        self.selected.update(str(item) for item in items)  # Convert Path to string

    def remove_all(self, items):
        self.selected.difference_update(str(item) for item in items)  # Convert Path to string

def test_base_selector_toggle_selection():
    selector = BaseSelector(root_dir=Path('/fake/dir'))
    selector.selection = MockSelection()
    selector.toggle_selection('file1.txt')
    assert 'file1.txt' in selector.selection.selected
    selector.toggle_selection('file1.txt')
    assert 'file1.txt' not in selector.selection.selected

def test_base_selector_toggle_folder_files():
    root_dir = Path('/fake/dir')
    folder = Path('/fake/dir/folder1')

    selector = BaseSelector(root_dir=root_dir)
    selector.selection = MockSelection()

    # Mock list_files to return Path objects
    file1 = folder / 'file1.txt'
    file2 = folder / 'file2.txt'
    selector.list_files = lambda: [file1, file2]

    # Initially no files selected
    selector.toggle_folder_files(folder)
    assert str(file1) in selector.selection.selected
    assert str(file2) in selector.selection.selected

    # Toggle again to deselect
    selector.toggle_folder_files(folder)
    assert str(file1) not in selector.selection.selected
    assert str(file2) not in selector.selection.selected

def test_base_selector_get_selection():
    selector = BaseSelector(root_dir=Path('/fake/dir'))
    selector.selection = MockSelection()
    selector.toggle_selection('file1.txt')
    selected = selector.get_selection()
    assert 'file1.txt' in selected