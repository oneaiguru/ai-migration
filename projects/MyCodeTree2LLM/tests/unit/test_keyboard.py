import pytest
from src.fileselect.utils.keyboard import KeyboardManager, KeyAction

def test_keyboard_manager_initialization():
    km = KeyboardManager()
    assert isinstance(km.command_keys, set)
    assert KeyAction.EXIT.value in km.command_keys
    assert km.current_key_index == 0

def test_key_allocation():
    km = KeyboardManager()
    items = ['item1', 'item2']
    allocated = km.allocate_keys(items, 'test')
    assert len(allocated) == len(items)
    assert all(isinstance(key, str) for key in allocated.values())

def test_action_retrieval():
    km = KeyboardManager()
    items = ['item1']
    km.allocate_keys(items, 'test')
    key = km.available_keys[0]
    assert km.get_action(key) == ('test', 'item1')

def test_command_key_protection():
    km = KeyboardManager()
    items = ['item1']
    allocated = km.allocate_keys(items, 'test')
    assert not any(key in km.command_keys for key in allocated.values())