import os
import json
import pytest
from pathlib import Path
from src.fileselect.storage import SelectionStorage

def test_storage_invalid_json(tmp_path):
    """Test handling of invalid JSON in storage files."""
    storage = SelectionStorage(tmp_path)
    storage_path = storage._get_storage_path('files')
    
    # Write invalid JSON
    with open(storage_path, 'w') as f:
        f.write('{ invalid json }')
    
    # Attempt to load should not raise an exception
    loaded = storage.load_selection('files')
    assert loaded == []

def test_storage_permission_error(tmp_path, monkeypatch):
    """Test error handling when permission is denied."""
    storage = SelectionStorage(tmp_path)
    storage_path = storage._get_storage_path('files')
    
    # Make storage directory read-only
    os.chmod(storage.storage_dir, 0o444)
    
    try:
        # Attempt to save should handle permission errors gracefully
        storage.save_selection([tmp_path / 'test.txt'])
    except PermissionError:
        pytest.fail("Save method should handle permission errors")
    finally:
        # Restore permissions
        os.chmod(storage.storage_dir, 0o755)

def test_storage_concurrent_tag_operations(tmp_path):
    """Simulate concurrent tag operations."""
    storage1 = SelectionStorage(tmp_path)
    storage2 = SelectionStorage(tmp_path)
    
    test_files = [tmp_path / f'test{i}.txt' for i in range(3)]
    for file in test_files:
        file.touch()
    
    # Simulate concurrent tag saves
    storage1.save_tag('project1', test_files[:2])
    storage2.save_tag('project2', test_files[1:])
    
    project1_tags = storage1.load_tag('project1')
    project2_tags = storage2.load_tag('project2')
    
    assert len(project1_tags) == 2
    assert len(project2_tags) == 2