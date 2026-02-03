# tests/test_main.py

from unittest.mock import patch, MagicMock
from fastwhisper.main import get_project_root, main
from tests.base import BaseTestCase
from pathlib import Path
import os
import run_fastwhisper

class TestMain(BaseTestCase):
    def setUp(self):
        """Set up test environment with all necessary mocks"""
        super().setUp()
        # Create patches
        self.patches = [
            patch('fastwhisper.main.WhisperModel'),  # Mock the WhisperModel import
            patch('fastwhisper.core.transcribe.WhisperModel'),  # Mock in transcribe.py
            patch('faster_whisper.WhisperModel'),  # Mock the actual WhisperModel
            patch('torch.cuda.is_available', return_value=False),  # Prevent CUDA checks
        ]
        # Start all patches
        for p in self.patches:
            p.start()

    def tearDown(self):
        """Clean up all patches"""
        super().tearDown()
        # Stop all patches
        for p in self.patches:
            p.stop()

    def run_in_env(self, env_type, test_func):
        """Helper to run tests in specific environment"""
        with patch.dict('os.environ', {'ENVIRONMENT': env_type}):
            test_func()

    def _test_main_flow_impl(self):
        """Implementation of main flow test used by multiple cases."""
        with patch('sys.argv', ['main.py', '--language', 'ru']):
            with patch('fastwhisper.main.get_project_root') as mock_get_project_root, \
                 patch('fastwhisper.main.StorageManager') as mock_storage_manager, \
                 patch('fastwhisper.main.transcribe_audio') as mock_transcribe, \
                 patch('fastwhisper.main.FileManager') as mock_file_manager, \
                 patch('fastwhisper.main.os.listdir') as mock_listdir, \
                 patch('fastwhisper.main.os.path.getmtime', return_value=0):

                mock_get_project_root.return_value = self.base_dir
                mock_listdir.return_value = ['test.mp3']
                mock_storage_instance = MagicMock()
                mock_storage_manager.return_value = mock_storage_instance
                mock_file_manager_instance = MagicMock()
                mock_file_manager.return_value = mock_file_manager_instance

                def mock_transcribe_impl(audio_path, output_txt_file, output_vtt_file, language='ru', model=None, storage_manager=None, **_):
                    Path(output_txt_file).parent.mkdir(parents=True, exist_ok=True)
                    Path(output_vtt_file).parent.mkdir(parents=True, exist_ok=True)
                    Path(output_txt_file).write_text("Mocked Transcription")
                    Path(output_vtt_file).write_text("WEBVTT\n00:00 Test transcription")
                    return "Mocked Transcription", "WEBVTT Transcription"

                mock_transcribe.side_effect = mock_transcribe_impl

                main()

                mock_file_manager_instance.handle_pretranscribed_files.assert_called_once()
                mock_transcribe.assert_called_once()
                mock_storage_instance.cleanup_local_files.assert_called_once()
    def test_main_flow_basic(self):
        """Test main flow in basic environment"""
        self.run_in_env('basic', self._test_main_flow_impl)

    def test_main_flow_full(self):
        """Test main flow in full environment"""
        self.run_in_env('full', self._test_main_flow_impl)

    def test_main_flow(self):
        """Test main flow with complete mocking"""
        with patch('sys.argv', ['main.py', '--language', 'ru']):
            with patch('fastwhisper.main.get_project_root') as mock_get_project_root, \
                 patch('fastwhisper.main.StorageManager') as mock_storage_manager, \
                 patch('fastwhisper.main.transcribe_audio') as mock_transcribe, \
                 patch('fastwhisper.main.FileManager') as mock_file_manager, \
                 patch('fastwhisper.main.os.listdir') as mock_listdir, \
                 patch('fastwhisper.main.os.path.getmtime', return_value=0):

                # Setup
                mock_get_project_root.return_value = self.base_dir
                mock_listdir.return_value = ['test.mp3']

                # Mock instances
                mock_storage_instance = MagicMock()
                mock_storage_manager.return_value = mock_storage_instance
                mock_file_manager_instance = MagicMock()
                mock_file_manager.return_value = mock_file_manager_instance

                # Simple mock return value for transcribe
                mock_transcribe.return_value = ("Mocked Transcription", "Mocked VTT Content")

                # Execute
                main()

                # Verify
                mock_file_manager_instance.handle_pretranscribed_files.assert_called_once()
                mock_transcribe.assert_called_once()
                mock_storage_instance.cleanup_local_files.assert_called_once()

    def test_get_project_root_code_interpreter(self):
        """Test project root path in code interpreter mode"""
        with patch('fastwhisper.main.os.getenv', return_value='code_interpreter'):
            result = get_project_root()
            self.assertEqual(str(result), '/mnt/data')

    def test_get_project_root_default(self):
        """Test default project root path"""
        with patch.dict('os.environ', {'ENVIRONMENT': 'local'}, clear=False):
            result = get_project_root()
            self.assertEqual(result, Path.cwd())


class TestRunner(BaseTestCase):
    def test_runner_sets_fastwhisper_root_and_cwd(self):
        original_cwd = Path.cwd()
        try:
            with patch.dict('os.environ', {}, clear=True):
                seen = {}

                def fake_main():
                    seen["cwd"] = Path.cwd()
                    seen["root"] = os.environ.get("FASTWHISPER_ROOT")

                with patch('fastwhisper.main.main', side_effect=fake_main):
                    run_fastwhisper.main()

            project_root = Path(run_fastwhisper.__file__).resolve().parent
            self.assertEqual(seen["cwd"], project_root)
            self.assertEqual(seen["root"], str(project_root))
        finally:
            os.chdir(original_cwd)
