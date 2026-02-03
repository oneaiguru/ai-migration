import pytest
from src.fileselect.utils.keyboard import KeyboardManager, KeyAction
from unittest.mock import MagicMock

def test_keyboard_manager_initialization():
    km = KeyboardManager()
    assert isinstance(km.command_keys, set)
    assert 'q' in km.command_keys
    assert len(km.available_keys) > 0

def test_key_allocation_with_items():
    km = KeyboardManager()
    items = ['item1', 'item2', 'item3']
    allocated = km.allocate_keys(items, 'test')
    assert len(allocated) == len(items)
    assert all(isinstance(key, str) for key in allocated.values())

def test_key_allocation_overflow():
    km = KeyboardManager()
    # Create more items than available keys
    items = [f'item{i}' for i in range(1000)]
    allocated = km.allocate_keys(items, 'test')
    assert len(allocated) <= len(km.available_keys)

def test_command_key_protection():
    km = KeyboardManager()
    items = ['item1']
    allocated = km.allocate_keys(items, 'test')
    assert not any(key in km.command_keys for key in allocated.values())

def test_key_action_mapping():
    km = KeyboardManager()
    items = ['test_item']
    km.allocate_keys(items, 'test')
    key = km.get_key('test', 'test_item')
    action = km.get_action(key)
    assert action == ('test', 'test_item')

@pytest.mark.performance
def test_key_allocation_performance():
    km = KeyboardManager()
    large_item_set = [f'item{i}' for i in range(10000)]
    import time
    start_time = time.time()
    allocated = km.allocate_keys(large_item_set, 'test')
    end_time = time.time()
    assert (end_time - start_time) < 1.0  # Should complete within 1 second