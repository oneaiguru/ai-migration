"""Pytest configuration for TaskFlow.ai tests."""

import os
import tempfile
import subprocess
from pathlib import Path

import pytest
from git import Repo

# Ensure required environment variables for config initialization
os.environ.setdefault("TELEGRAM_TOKEN", "test-token")


@pytest.fixture
def temp_repo():
    """Create a temporary Git repository for testing."""
    with tempfile.TemporaryDirectory() as tempdir:
        # Initialize repo
        repo = Repo.init(tempdir)

        # Create basic files and commit them
        readme = Path(tempdir) / "README.md"
        readme.write_text("# Test Repository")

        repo.git.add(str(readme))
        repo.config_writer().set_value("user", "name", "Test User").release()
        repo.config_writer().set_value("user", "email", "test@example.com").release()
        repo.git.commit("-m", "Initial commit")

        # Set up basic folder structure
        for folder in [
            "core/ai-docs",
            "core/specs/tasks",
            "core/.claude/tasks",
            "outputs",
        ]:
            os.makedirs(Path(tempdir) / folder, exist_ok=True)

        yield repo, tempdir


@pytest.fixture
def mock_telegram_bot(monkeypatch):
    """Mock Telegram bot for testing."""

    class MockBot:
        def __init__(self):
            self.sent_messages = []
            self.user_data = {}

        def send_message(self, chat_id, text, **kwargs):
            self.sent_messages.append((chat_id, text, kwargs))
            return {"message_id": 123}

        def reply_to(self, message, text, **kwargs):
            self.sent_messages.append((message.chat.id, text, kwargs))
            return {"message_id": 123}

    mock_bot = MockBot()
    monkeypatch.setattr("telebot.TeleBot", lambda *args, **kwargs: mock_bot)
    return mock_bot


@pytest.fixture
def mock_subprocess(monkeypatch):
    """Mock subprocess calls for testing."""

    class MockCompletedProcess:
        def __init__(self, returncode: int = 0, stdout: str = "", stderr: str = ""):
            self.returncode = returncode
            self.stdout = stdout
            self.stderr = stderr

    def mock_run(*args, **kwargs):
        # Default successful response
        return MockCompletedProcess(returncode=0, stdout="Success output", stderr="")

    monkeypatch.setattr(subprocess, "run", mock_run)
    return mock_run


@pytest.fixture
def mock_config():
    """Provide a test configuration."""
    from config_manager import ConfigManager

    config = ConfigManager.reload()
    # Override with test values
    config.repo_path = "."
    config.templates_file = "tests/data/test_templates.json"
    config.telegram_token = "test_token"
    config.chat_id = "123456789"
    config.claude_check_interval = 1

    return config
