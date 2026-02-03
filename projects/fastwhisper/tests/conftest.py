import unittest
import os
import tempfile
import shutil
from pathlib import Path
import sys
from unittest.mock import patch, MagicMock
import pytest

# Add the project root to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def pytest_addoption(parser):
    parser.addoption(
        "--test-environment",
        action="store",
        default="basic",
        help="Specify test environment: basic or code_interpreter"
    )

class Environment:
    """Handles environment-specific configurations for testing"""
    def __init__(self, environment):
        self.environment = environment

class DependencyFactory:
    """Factory for creating environment-specific dependencies"""
    def __init__(self, environment="basic"):
        self.environment = environment
        self.use_mocks = environment in ["basic", "code_interpreter"]

    def get_transcription_model(self, text="Test transcription"):
        if self.use_mocks:
            mock_model = MagicMock()
            mock_model.transcribe.return_value = (
                [MagicMock(start=0.0, end=2.0, text=text)],
                {"language": "en"}
            )
            return mock_model
        # For real environment, import WhisperModel (note: requires dependencies)
        from fastwhisper.core.transcribe import WhisperModel
        return WhisperModel.get_instance()

@pytest.fixture
def test_environment(request):
    """Provides the current test environment"""
    return request.config.getoption("--test-environment")

@pytest.fixture
def env(test_environment):
    """Creates an Environment object based on the current test environment"""
    return Environment(test_environment)

@pytest.fixture
def factory(test_environment):
    """Provides a DependencyFactory for creating mock or real dependencies"""
    return DependencyFactory(test_environment)

@pytest.fixture(autouse=True)
def mock_faster_whisper(test_environment):
    """
    Dynamically configures the environment and mocks dependencies as needed
    """
    with patch.dict('os.environ', {'ENVIRONMENT': test_environment}):
        if test_environment in ["basic", "code_interpreter"]:
            with patch('fastwhisper.core.transcribe.WhisperModel') as MockWhisperModel:
                mock_model_instance = MagicMock()
                mock_model_instance.transcribe.return_value = (
                    [MagicMock(start=0.0, end=2.0, text="Mocked transcription")],
                    {"language": "en"}
                )
                MockWhisperModel.return_value = mock_model_instance
                yield MockWhisperModel
        else:
            yield None

class BaseTestCase(unittest.TestCase):
    """Base test case with setup and teardown utilities"""

    @pytest.fixture(autouse=True)
    def _setup_env(self, env):
        self.env = env

    def setUp(self):
        """Additional setup before each test"""
        self.base_dir = Path(tempfile.mkdtemp())
        self.input_dir = self.base_dir / "input"
        self.output_dir = self.base_dir / "output"
        self.transcript_dir = self.base_dir / "transcript"
        self.archive_dir = self.base_dir / "archive"
        self.remote_dir = self.base_dir / "remote"

        # Create test directories
        for directory in [self.input_dir, self.output_dir, self.transcript_dir,
                          self.archive_dir, self.remote_dir]:
            directory.mkdir(parents=True, exist_ok=True)

        self.cleanup_test_files()

    def tearDown(self):
        """Cleanup after each test"""
        self.cleanup_test_files()

    def cleanup_test_files(self):
        """Clean up test files between tests"""
        for directory in [self.input_dir, self.output_dir, self.transcript_dir,
                          self.archive_dir, self.remote_dir]:
            for file in directory.glob("*"):
                if file.is_file():
                    file.unlink()

    def create_test_file(self, path, content="test content"):
        """Helper method to create test files"""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(content, str):
            path.write_text(content)
        else:
            with open(path, 'wb') as f:
                f.write(content)
        return path
