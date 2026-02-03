import pytest
from src.fileselect.utils.keyboard import KeyboardManager, KeyAction
from unittest.mock import patch, MagicMock
from io import StringIO

def test_keyboard_initialization():
    """Test basic initialization of KeyboardManager"""
    km = KeyboardManager()
    assert isinstance(km.command_keys, set)
    assert 'q' in km.command_keys
    assert 's' in km.command_keys
    assert 't' in km.command_keys
    assert 'h' in km.command_keys
    assert '=' in km.command_keys
    assert isinstance(km.available_keys, list)
    assert isinstance(km.key_map, dict)
    assert isinstance(km.reverse_map, dict)
    assert km.current_key_index == 0

def test_key_allocation():
    """Test key allocation for items"""
    km = KeyboardManager()
    items = ['item1', 'item2', 'item3']
    allocated = km.allocate_keys(items, 'test')

    assert len(allocated) == len(items)
    assert all(isinstance(key, str) for key in allocated.values())
    assert len(set(allocated.values())) == len(items)  # All keys should be unique

def test_action_retrieval():
    """Test retrieving actions for allocated keys"""
    km = KeyboardManager()
    items = ['item1', 'item2']
    km.allocate_keys(items, 'test')

    # Get first allocated key
    key = list(km.key_map.keys())[0]
    action = km.get_action(key)

    assert isinstance(action, tuple)
    assert action[0] == 'test'
    assert action[1] in items

def test_command_key_protection():
    """Test that command keys are protected from allocation"""
    km = KeyboardManager()
    items = ['item1', 'item2']
    allocated = km.allocate_keys(items, 'test')

    assert not any(key in km.command_keys for key in allocated.values())

def test_toggle_all_hotkey():
    """Test that pressing '=' toggles all file selections"""
    km = KeyboardManager()
    items = ['file1', 'file2', 'file3']
    km.allocate_keys(items, 'file')

    action = km.get_action('=')
    assert action == ('action', 'toggle_all')

def test_toggle_all_action_execution():
    """Test executing the toggle all action"""
    km = KeyboardManager()
    items = ['file1', 'file2', 'file3']
    km.allocate_keys(items, 'file')

    # Simulate pressing '='
    action = km.get_action('=')
    assert action == ('action', 'toggle_all')

    # Handle the action
    result = km._handle_selection('=')
    assert result == ('toggle_all', None)

def test_keyboard_manager_read_key():
    """Test keyboard manager with mocked input handler"""
    # Create a mock input handler
    mock_input_handler = MagicMock()
    mock_input_handler.read_key.side_effect = ['a', 'b', 'c']
    
    # Create keyboard manager with mock input handler
    manager = KeyboardManager(input_handler=mock_input_handler)
    
    # Test key reading
    assert manager.read_key() == 'a'
    assert manager.read_key() == 'b'
    assert manager.read_key() == 'c'

def test_toggle_all_hotkey():
    """Test that toggle all hotkey works correctly"""
    # Create mock input handler
    mock_input_handler = MagicMock()
    mock_input_handler.read_key.return_value = '='
    
    # Create keyboard manager with mock input handler
    manager = KeyboardManager(input_handler=mock_input_handler)
    
    # Test handle_key_press
    result = manager.handle_key_press()
    assert result == ('action', 'toggle_all')
    
    # Test direct action retrieval
    action = manager.get_action('=')
    assert action == ('action', 'toggle_all')
    
    # Test selection handling
    result = manager._handle_selection('=')
    assert result == ('toggle_all', None)