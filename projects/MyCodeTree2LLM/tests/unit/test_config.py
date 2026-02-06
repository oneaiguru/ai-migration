# tests/test_config.py

import pytest
from pytest_bdd import given, when, then, scenarios
from src.fileselect.config import ProjectConfig
from pathlib import Path
import json
from unittest.mock import MagicMock, patch

@pytest.fixture
def project_config(tmp_path):
    return ProjectConfig(project_path=tmp_path)

def test_default_configuration(project_config):
    """Test that the default configuration is loaded correctly."""
    assert project_config.config['features']['files'] is True
    assert project_config.config['features']['folders'] is True
    assert project_config.config['features']['tags'] is True
    assert project_config.config['key_mappings']['tags'] == '123456789'
    assert project_config.config['key_mappings']['folders'] == 'abcdefghijklmnopqrstuvwxyz'
    assert project_config.config['key_mappings']['files'] == '0!@#$%^&*()'

def test_custom_configuration(project_config, tmp_path):
    """Test loading a custom configuration."""
    custom_config = {
        'features': {
            'files': False,
            'folders': False,
            'tags': False
        },
        'key_mappings': {
            'tags': 'xyz',
            'folders': '123',
            'files': 'abc'
        }
    }
    config_path = tmp_path / '.fileselect' / 'config.json'
    config_path.parent.mkdir(parents=True, exist_ok=True)
    with open(config_path, 'w') as f:
        json.dump(custom_config, f)

    # Reload configuration
    project_config = ProjectConfig(project_path=tmp_path)

    assert project_config.config['features']['files'] is False
    assert project_config.config['features']['folders'] is False
    assert project_config.config['features']['tags'] is False
    assert project_config.config['key_mappings']['tags'] == 'xyz'
    assert project_config.config['key_mappings']['folders'] == '123'
    assert project_config.config['key_mappings']['files'] == 'abc'

def test_toggle_feature(project_config):
    """Test toggling a feature in the configuration."""
    original_state = project_config.config['features']['files']
    project_config.toggle_feature('files')
    assert project_config.config['features']['files'] == (not original_state)

def test_save_configuration(project_config, tmp_path):
    """Test saving the configuration to a file."""
    project_config.toggle_feature('files')
    project_config.save_config()
    config_path = tmp_path / '.fileselect' / 'config.json'
    assert config_path.exists()
    with open(config_path) as f:
        saved_config = json.load(f)
    assert saved_config['features']['files'] == project_config.config['features']['files']

def test_malformed_configuration(tmp_path, caplog):
    """Test handling of malformed JSON in configuration."""
    config_path = tmp_path / '.fileselect' / 'config.json'
    config_path.parent.mkdir(parents=True, exist_ok=True)
    with open(config_path, 'w') as f:
        f.write("{ invalid json }")

    project_config = ProjectConfig(project_path=tmp_path)
    assert project_config.config['features']['files'] is True  # Fallback to default
    assert "Error loading configuration" in caplog.text

@pytest.fixture
def custom_config(tmp_path):
    """Create a custom configuration file."""
    custom_config = {
        'features': {
            'files': False,
            'folders': False,
            'tags': False
        },
        'key_mappings': {
            'tags': 'xyz',
            'folders': '123',
            'files': 'abc'
        }
    }
    config_path = tmp_path / '.fileselect' / 'config.json'
    config_path.parent.mkdir(parents=True, exist_ok=True)
    with open(config_path, 'w') as f:
        json.dump(custom_config, f)
    return config_path

def test_tag_selector_initialization(tmp_path, mocker):
    """Test initialization of TagSelector with updated KeyboardManager."""
    from src.fileselect.selectors.tags import TagSelector
    tags = ['urgent', 'review', 'completed']

    # Mock KeyboardManager and its allocate_keys method
    keyboard_manager = MagicMock()
    keyboard_manager.allocate_keys = MagicMock()
    mocker.patch('src.fileselect.selectors.tags.KeyboardManager', return_value=keyboard_manager)

    selector = TagSelector(tags=tags)

    # Ensure allocate_keys was called with sorted unique tags and 'tag'
    expected_tags = sorted(set(tags))
    keyboard_manager.allocate_keys.assert_called_once_with(expected_tags, 'tag')
    assert selector.tags == tags
    assert selector.selected_tags == []

def test_tag_selection(tmp_path, mocker):
    """Test selecting and deselecting tags with updated KeyboardManager."""
    from src.fileselect.selectors.tags import TagSelector
    tags = ['urgent', 'review', 'completed']

    # Mock KeyboardManager and its allocate_keys method
    keyboard_manager = MagicMock()
    keyboard_manager.allocate_keys = MagicMock()
    mocker.patch('src.fileselect.selectors.tags.KeyboardManager', return_value=keyboard_manager)

    selector = TagSelector(tags=tags)

    # Define a side effect function for get_action
    def get_action_side_effect(key):
        mapping = {
            '1': ('tag', 'urgent'),
            '2': ('tag', 'review'),
            '3': ('tag', 'completed')
        }
        return mapping.get(key, None)

    # Assign the side effect to get_action
    selector.keyboard.get_action = MagicMock(side_effect=get_action_side_effect)

    # Select 'urgent' using key '1'
    selector.select_tag('1')
    assert 'urgent' in selector.selected_tags

    # Deselect 'urgent' using key '1'
    selector.select_tag('1')
    assert 'urgent' not in selector.selected_tags

def test_tag_loading_and_listing(tmp_path, mocker):
    """Test listing and loading tags with updated KeyboardManager."""
    from src.fileselect.selectors.tags import TagSelector
    tags = ['urgent', 'review', 'completed']

    # Mock KeyboardManager and its allocate_keys method
    keyboard_manager = MagicMock()
    keyboard_manager.allocate_keys = MagicMock()
    mocker.patch('src.fileselect.selectors.tags.KeyboardManager', return_value=keyboard_manager)

    selector = TagSelector(tags=tags)

    # Initially no tags selected
    assert selector.get_selected_tags() == []

    # Define a side effect function for get_action
    def get_action_side_effect(key):
        mapping = {
            '1': ('tag', 'urgent'),
            '2': ('tag', 'review'),
            '3': ('tag', 'completed')
        }
        return mapping.get(key, None)

    # Assign the side effect to get_action
    selector.keyboard.get_action = MagicMock(side_effect=get_action_side_effect)

    # Select 'review' using key '2'
    selector.select_tag('2')
    assert 'review' in selector.selected_tags

    # List tags
    listed_tags = selector.list_tags()
    assert listed_tags == sorted(tags)

def test_tag_selector_with_empty_tags():
    """Test TagSelector behavior with no tags."""
    from src.fileselect.selectors.tags import TagSelector
    selector = TagSelector(tags=[])
    assert selector.tags == []
    assert selector.selected_tags == []

    # Assign keys (should allocate none)
    selector.keyboard.allocate_keys = MagicMock(return_value={})
    allocated = selector.keyboard.allocate_keys([], 'tag')
    assert allocated == {}

def test_tag_selector_edge_cases(mocker):
    """Test TagSelector with duplicate tags and special characters."""
    from src.fileselect.selectors.tags import TagSelector
    tags = ['urgent', 'urgent', 'review!', '@completed']

    # Mock KeyboardManager and its allocate_keys method
    keyboard_manager = MagicMock()
    keyboard_manager.allocate_keys = MagicMock()
    mocker.patch('src.fileselect.selectors.tags.KeyboardManager', return_value=keyboard_manager)

    selector = TagSelector(tags=tags)

    # Allocate should handle unique tags
    unique_tags = sorted(set(tags))
    keyboard_manager.allocate_keys.assert_called_once_with(unique_tags, 'tag')
    assert selector.tags == tags
    assert len(selector.keyboard.allocate_keys.mock_calls) == 1

    # Define a side effect function for get_action
    def get_action_side_effect(key):
        mapping = {
            '1': ('tag', '@completed'),
            '2': ('tag', 'review!'),
            '3': ('tag', 'urgent')
        }
        return mapping.get(key, None)

    # Assign the side effect to get_action
    selector.keyboard.get_action = MagicMock(side_effect=get_action_side_effect)

    # Select and verify
    selector.select_tag('1')  # Select '@completed'
    selector.select_tag('2')  # Select 'review!'
    selector.select_tag('3')  # Select 'urgent'
    assert '@completed' in selector.selected_tags
    assert 'review!' in selector.selected_tags
    assert 'urgent' in selector.selected_tags
    assert len(selector.selected_tags) == 3

    # Deselect 'urgent' using key '3'
    selector.select_tag('3')
    assert 'urgent' not in selector.selected_tags
