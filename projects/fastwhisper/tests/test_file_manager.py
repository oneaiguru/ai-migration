from pathlib import Path
import pytest
from datetime import datetime, timedelta
from tests.conftest import BaseTestCase
import os
import shutil
from unittest.mock import patch

class TestFileManager(BaseTestCase):
    def setUp(self):
        super().setUp()
        from fastwhisper.core.file_manager import FileManager
        self.file_manager = FileManager(is_code_interpreter=False)

    def test_timestamp_extraction(self):
        """Test timestamp extraction from filenames"""
        # Create test files with timestamps
        test_file = self.create_test_file(
            self.input_dir / "20240101-120000_test.mp3",
            b"test content"
        )

        timestamp = self.file_manager.extract_timestamp(str(test_file))
        self.assertEqual(timestamp.year, 2024)
        self.assertEqual(timestamp.month, 1)
        self.assertEqual(timestamp.day, 1)
        self.assertEqual(timestamp.hour, 12)
        self.assertEqual(timestamp.minute, 0)

    @patch('fastwhisper.core.file_manager.FileManager.extract_timestamp')
    def test_archive_files(self, mock_extract_timestamp):
        """Test archiving of files"""
        # Create test files
        old_file = self.create_test_file(
            self.input_dir / "20230101-120000_old.mp3",
            b"old content"
        )
        new_file = self.create_test_file(
            self.input_dir / "20240101-120000_new.mp3",
            b"new content"
        )

        # Mock extract_timestamp to return an old date for old_file and a recent date for new_file
        def side_effect(file_path):
            if "old.mp3" in file_path:
                return datetime(2023, 1, 1, 12, 0, 0)
            elif "new.mp3" in file_path:
                return datetime.now() - timedelta(days=1)
            return datetime.now()

        mock_extract_timestamp.side_effect = side_effect

        # Create archive directories
        archive_dir = self.output_dir
        (archive_dir / "daily").mkdir(parents=True, exist_ok=True)
        (archive_dir / "2023").mkdir(parents=True, exist_ok=True)

        # Test archiving
        self.file_manager.archive_files(str(self.input_dir), str(archive_dir))

        # Verify files were moved correctly
        old_archived = archive_dir / "2023" / old_file.name
        new_archived = archive_dir / "daily" / new_file.name

        self.assertFalse(old_file.exists(), "Old file should be moved")
        self.assertFalse(new_file.exists(), "New file should be moved")
        self.assertTrue(old_archived.exists(), "Old file should exist in archive")
        self.assertTrue(new_archived.exists(), "New file should exist in daily archive")

    def test_handle_pretranscribed_moves_audio_and_transcripts(self):
        """Ensure pre-transcribed audio and transcripts leave input/ so main won't reprocess them."""
        audio = self.create_test_file(self.input_dir / "sample.mp3", b"audio")
        transcript_txt = self.create_test_file(self.input_dir / "sample.txt", "text")
        transcript_vtt = self.create_test_file(self.input_dir / "sample.vtt", "vtt")

        self.file_manager.handle_pretranscribed_files(
            str(self.input_dir),
            str(self.transcript_dir),
            str(self.archive_dir)
        )

        # Audio and transcripts should move to transcript_dir and disappear from input_dir
        for name in ("sample.mp3", "sample.txt", "sample.vtt"):
            self.assertFalse((self.input_dir / name).exists(), f"{name} should be moved out of input/")
            self.assertTrue((self.transcript_dir / name).exists(), f"{name} should be in transcript/")
