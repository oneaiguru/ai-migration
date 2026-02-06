"""Tests for the configuration manager."""

import os
import json
import tempfile
from pathlib import Path

import pytest
from config_manager import ConfigManager


def test_default_config():
    """Test that default configuration is loaded correctly."""
    config = ConfigManager()
    assert config.get("repo_path") == "."
    assert config.get("templates_file") == "templates/gallery.json"
    assert config.get("web_port") == 8000


def test_config_file_loading():
    """Test loading configuration from file."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump({"web_port": 9000, "debug": True}, f)

    try:
        config = ConfigManager(f.name)
        assert config.get("web_port") == 9000
        assert config.get("debug") is True
        # Default values should still be available
        assert config.get("repo_path") == "."
    finally:
        Path(f.name).unlink()


def test_environment_override():
    """Test that environment variables override defaults."""
    os.environ["TASKFLOW_REPO_PATH"] = "/custom/path"
    os.environ["WEB_PORT"] = "9999"

    config = ConfigManager()
    assert config.get("repo_path") == "/custom/path"
    assert config.get("web_port") == 9999

    # Clean up
    del os.environ["TASKFLOW_REPO_PATH"]
    del os.environ["WEB_PORT"]


def test_dictionary_access():
    """Test dictionary-style access."""
    config = ConfigManager()
    assert config["repo_path"] == "."
    assert "repo_path" in config
    assert "nonexistent_key" not in config

    with pytest.raises(KeyError):
        _ = config["nonexistent_key"]


def test_save_config():
    """Test saving configuration to file."""
    config = ConfigManager()
    config._config["custom_value"] = "test"

    with tempfile.TemporaryDirectory() as tmpdir:
        save_path = Path(tmpdir) / "test_config.json"
        config.save(save_path)

        # Load the saved config and verify
        with open(save_path, "r") as f:
            saved_data = json.load(f)

        assert saved_data["repo_path"] == "."
        assert saved_data["custom_value"] == "test"
