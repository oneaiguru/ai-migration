import os
from unittest.mock import patch, MagicMock, mock_open
from tests.conftest import BaseTestCase
from fastwhisper.core.transcribe import transcribe_audio
from fastwhisper.core.storage_manager import StorageManager
import pytest
import numpy as np
import torch

class TestTranscribe(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.mock_audio = np.zeros(16000, dtype=np.float32)  # 1 second of silence
        self.patcher_decode = patch('faster_whisper.audio.decode_audio', return_value=self.mock_audio)
        self.mock_decode = self.patcher_decode.start()

        # Mock soundfile.info to return an object with a 'duration' attribute
        self.patcher_soundfile = patch('soundfile.info')
        self.mock_soundfile_info = self.patcher_soundfile.start()
        mock_audio_info = MagicMock()
        mock_audio_info.duration = 2.0  # Set desired duration
        self.mock_soundfile_info.return_value = mock_audio_info

        # Create a mock StorageManager for testing
        self.mock_storage_manager = MagicMock(spec=StorageManager)
        self.mock_storage_manager.write_temp_file.side_effect = lambda filename, content: f"/tmp/{filename}"
        self.mock_storage_manager.finalize_temp_file.side_effect = lambda temp_path, final_path: None

    def tearDown(self):
        super().tearDown()
        self.patcher_decode.stop()
        self.patcher_soundfile.stop()

    @patch('fastwhisper.core.transcribe.WhisperModel')
    def test_basic_transcription(self, MockWhisperModel):
        """Test basic transcription functionality"""
        # Setup
        test_audio = self.input_dir / "test.mp3"
        output_txt = self.output_dir / "test.txt"
        output_vtt = self.output_dir / "test.vtt"

        # Create mock model and segments
        mock_segment = MagicMock()
        mock_segment.start = 0.0
        mock_segment.end = 2.0
        mock_segment.text = "Test transcription"

        mock_model = MockWhisperModel.return_value
        mock_model.transcribe.return_value = ([mock_segment], {"language": "en"})

        # Execute transcription
        transcribe_audio(
            str(test_audio),
            str(output_txt),
            str(output_vtt),
            language='en',
            model=mock_model,
            storage_manager=self.mock_storage_manager
        )

        # Verify storage manager method calls
        self.mock_storage_manager.write_temp_file.assert_called()
        self.mock_storage_manager.finalize_temp_file.assert_called()
        self.mock_storage_manager.sync_files.assert_called_once()

    @patch('fastwhisper.core.transcribe.WhisperModel')
    def test_transcription_retry(self, MockWhisperModel):
        """Test transcription retry mechanism"""
        # Setup
        test_audio = self.input_dir / "test.mp3"
        output_txt = self.output_dir / "test.txt"
        output_vtt = self.output_dir / "test.vtt"

        # Create mock model and simulate retries
        mock_segment = MagicMock()
        mock_segment.start = 0.0
        mock_segment.end = 2.0
        mock_segment.text = "Success after retries"

        mock_model = MockWhisperModel.return_value
        mock_model.transcribe.side_effect = [
            Exception("First failure"),
            Exception("Second failure"),
            ([mock_segment], {"language": "en"})
        ]

        # Execute transcription
        transcribe_audio(
            str(test_audio),
            str(output_txt),
            str(output_vtt),
            language='en',
            model=mock_model,
            storage_manager=self.mock_storage_manager
        )

        # Verify results
        self.assertEqual(mock_model.transcribe.call_count, 3)
        self.mock_storage_manager.write_temp_file.assert_called()
        self.mock_storage_manager.finalize_temp_file.assert_called()
        self.mock_storage_manager.sync_files.assert_called_once()