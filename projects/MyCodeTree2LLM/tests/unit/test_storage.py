import pytest
import os
from pathlib import Path
from src.fileselect.storage import SelectionStorage

def test_storage_initialization(tmp_path):
    """Test SelectionStorage initialization creates required directories."""
    storage = SelectionStorage(tmp_path)
    assert (tmp_path / '.fileselect').exists()
    assert (tmp_path / '.fileselect').is_dir()

def test_save_and_load_selection(tmp_path):
    """Test saving and loading file selections."""
    storage = SelectionStorage(tmp_path)

    test_files = [tmp_path / 'test1.txt', tmp_path / 'test2.txt']
    for file in test_files:
        file.touch()

    storage.save_selection(test_files)
    loaded = storage.load_selection()
    assert set(str(f) for f in loaded) == set(str(f) for f in test_files)

def test_storage_invalid_json(tmp_path):
    """Test handling of invalid JSON in storage files."""
    storage = SelectionStorage(tmp_path)
    storage_path = storage._get_storage_path('files')

    # Write invalid JSON
    with open(storage_path, 'w') as f:
        f.write('{ invalid json }')

    loaded = storage.load_selection('files')
    assert loaded == []

def test_storage_permission_error(tmp_path, monkeypatch):
    """Test error handling when permission is denied."""
    storage = SelectionStorage(tmp_path)

    # Make storage directory read-only
    os.chmod(storage.storage_dir, 0o444)

    test_file = tmp_path / 'test.txt'
    storage.save_selection([test_file])  # Should not raise exception

    loaded = storage.load_selection()
    assert loaded == []

    # Restore permissions for cleanup
    os.chmod(storage.storage_dir, 0o755)

def test_save_and_load_tag(tmp_path):
    """Test saving and loading tagged selections."""
    storage = SelectionStorage(tmp_path)

    test_files = [tmp_path / 'test1.txt', tmp_path / 'test2.txt']
    for file in test_files:
        file.touch()

    storage.save_tag('important', test_files)
    loaded = storage.load_tag('important')
    assert set(str(f) for f in loaded) == set(str(f) for f in test_files)

def test_list_tags(tmp_path):
    """Test listing available tags."""
    storage = SelectionStorage(tmp_path)

    test_file = tmp_path / 'test.txt'
    test_file.touch()

    storage.save_tag('tag1', [test_file])
    storage.save_tag('tag2', [test_file])

    tags = storage.list_tags()
    assert tags == {'tag1', 'tag2'}

def test_toggle_all_files_in_storage(tmp_path, mocker):
    """Test toggling all files selection via storage."""
    storage = SelectionStorage(tmp_path)
    test_files = [tmp_path / f'test{i}.txt' for i in range(5)]
    for file in test_files:
        file.touch()

    # Simulate saving all files
    storage.save_selection(test_files)
    loaded = storage.load_selection()
    assert set(str(f) for f in loaded) == set(str(f) for f in test_files)

    # Simulate deselecting all files
    storage.save_selection([])
    loaded = storage.load_selection()
    assert loaded == []