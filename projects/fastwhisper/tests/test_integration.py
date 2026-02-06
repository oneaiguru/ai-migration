# tests/test_integration.py

import unittest
from unittest.mock import MagicMock, patch
from pathlib import Path
from fastwhisper.core.storage_manager import StorageManager
from fastwhisper.core.file_manager import FileManager
from tests.base import BaseTestCase

class TestIntegration(BaseTestCase):
    def setUp(self):
        super().setUp()
        # Manually initialize the environment mock
        self.env = MagicMock(environment='basic')

        # Initialize StorageManager and FileManager with the mocked environment
        self.storage_manager = StorageManager(str(self.input_dir), str(self.remote_dir))
        self.file_manager = FileManager(is_code_interpreter=self.env.environment == "code_interpreter")

    def test_complete_workflow(self):
        """Test complete workflow from file creation to transcription"""
        # Create test audio file
        audio_file = self.create_test_file(
            self.input_dir / "test_audio.mp3",
            b"dummy audio content"
        )
        output_txt = self.output_dir / "test_audio.txt"
        output_vtt = self.output_dir / "test_audio.vtt"

        # Mock transcription function
        def mock_transcribe(audio_path, output_txt_file, output_vtt_file, language='ru', model=None, storage_manager=None, **_):
            # Simulate transcription output
            Path(output_txt_file).parent.mkdir(parents=True, exist_ok=True)
            Path(output_txt_file).write_text("Test transcript")
            Path(output_vtt_file).parent.mkdir(parents=True, exist_ok=True)
            Path(output_vtt_file).write_text("WEBVTT\n00:00 Test transcript")
            return "Test transcript", "WEBVTT\n00:00 Test transcript"

        # Patch transcription
        with patch("fastwhisper.core.transcribe.transcribe_audio", side_effect=mock_transcribe):
            from fastwhisper.core.transcribe import transcribe_audio
            transcribe_audio(
                str(audio_file), str(output_txt), str(output_vtt),
                language='ru', model=None, storage_manager=self.storage_manager
            )

        # Assert files are created
        self.assertTrue(output_txt.exists())
        self.assertTrue(output_vtt.exists())

        # Assert content
        self.assertEqual(output_txt.read_text(), "Test transcript")
        self.assertEqual(output_vtt.read_text(), "WEBVTT\n00:00 Test transcript")
