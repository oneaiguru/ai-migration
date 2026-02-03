import pytest
from pathlib import Path
from src.fileselect.selectors.folders import FolderSelector

def test_folder_selector_initialization(test_dir):
    """Test basic initialization of FolderSelector"""
    folders = [d for d in test_dir.iterdir() if d.is_dir()]
    selector = FolderSelector(folders)
    assert selector.folders == folders
    assert selector.selected_folders == []
    assert selector.tags == []
    assert hasattr(selector.keyboard, 'tag_keys')
    assert hasattr(selector.keyboard, 'folder_keys')

def test_folder_selection(test_dir):
    """Test folder selection and deselection"""
    folders = sorted([d for d in test_dir.iterdir() if d.is_dir()])
    selector = FolderSelector(folders)
    
    # Force key allocation for testing
    selector.assign_keys()
    selector.keyboard.allocate_keys(folders, 'folder')
    
    if selector.keyboard.folder_keys:
        first_folder_key = next(iter(selector.keyboard.folder_keys.keys()))
        
        # Select first folder
        selector.select_folder(first_folder_key)
        assert len(selector.selected_folders) == 1
        
        # Test deselection
        selector.select_folder(first_folder_key)
        assert len(selector.selected_folders) == 0

def test_folder_selector_get_folder_files(test_dir):
    """Test getting files from selected folders"""
    folders = [d for d in test_dir.iterdir() if d.is_dir()]
    selector = FolderSelector(folders)
    
    # Create test file in first folder
    if folders:
        test_folder = folders[0]
        test_file = test_folder / 'test.txt'
        test_file.touch()
        
        files = selector.get_folder_files(test_folder)
        assert len(files) > 0
        assert test_file in files

def test_folder_selector_is_selected(test_dir):
    """Test checking folder selection state"""
    folders = [d for d in test_dir.iterdir() if d.is_dir()]
    selector = FolderSelector(folders)
    
    if folders:
        test_folder = folders[0]
        
        # Initially no folders selected
        assert not selector.is_folder_selected(test_folder)
        
        # Select folder
        selector.toggle_folder_selection(test_folder)
        assert selector.is_folder_selected(test_folder)

def test_folder_selector_update_keyboard(test_dir):
    """Test keyboard mapping updates"""
    folders = [d for d in test_dir.iterdir() if d.is_dir()]
    selector = FolderSelector(folders)
    
    initial_keyboard = selector.keyboard
    selector.update_keyboard()
    
    # Should have new keyboard instance with necessary attributes
    assert hasattr(selector.keyboard, 'folder_keys')
    assert hasattr(selector.keyboard, 'tag_keys')