import pytest
from src.fileselect.models import Selection

def test_selection_initial_state():
    """Test initial state of Selection object."""
    selection = Selection()
    assert len(selection.selected) == 0
    assert len(selection.partial) == 0

def test_selection_add():
    """Test adding items to selection."""
    selection = Selection()
    item = "/path/to/file"
    selection.add(item)
    assert item in selection.selected
    assert item not in selection.partial

def test_selection_remove():
    """Test removing items from selection."""
    selection = Selection()
    item = "/path/to/file"
    selection.add(item)
    selection.remove(item)
    assert item not in selection.selected
    assert item not in selection.partial

def test_selection_set_partial():
    """Test setting partial selection state."""
    selection = Selection()
    item = "/path/to/file"
    selection.set_partial(item)
    assert item not in selection.selected
    assert item in selection.partial

def test_selection_complex_transitions():
    """Test complex selection state transitions."""
    selection = Selection()
    item1 = "/path/to/file1"
    item2 = "/path/to/file2"
    
    # Add a fully selected item
    selection.add(item1)
    # Set another item as partially selected
    selection.set_partial(item2)
    
    # Remove partial selection
    selection.remove(item2)
    assert item2 not in selection.partial
    assert item2 not in selection.selected

def test_selection_multiple_items():
    """Test multiple items in different selection states."""
    selection = Selection()
    items = [f"/path/to/file{i}" for i in range(5)]
    
    # Mix of selections
    selection.add(items[0])
    selection.set_partial(items[1])
    selection.add(items[2])
    selection.set_partial(items[3])
    
    assert items[0] in selection.selected
    assert items[1] in selection.partial
    assert items[2] in selection.selected
    assert items[3] in selection.partial