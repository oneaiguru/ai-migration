import os
import time
import unittest
import tempfile
import subprocess
from pathlib import Path
from threading import Thread
from watchdog.observers import Observer
from watch_voice_notes import VoiceNoteConversionHandler, create_voice_note_watchdog

class TestVoiceNoteConversionHandler(unittest.TestCase):
    def setUp(self):
        # Create temporary directory
        self.temp_dir = tempfile.mkdtemp()
        self.downloads_path = Path(self.temp_dir)

        # Create test directories
        self.archive_path = self.downloads_path / 'voice_notes_archive'
        self.backup_path = self.downloads_path / 'voice_notes_backup'

        # Check if ffmpeg is available before running tests
        try:
            subprocess.run(['ffmpeg', '-version'],
                          capture_output=True, timeout=5)
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.skipTest("ffmpeg not available for testing")

        # Configure watchdog
        self.watchdog = create_voice_note_watchdog("test_voice", self.downloads_path)
        self.watchdog.start()
        time.sleep(1)  # Wait for observer to start

    def tearDown(self):
        # Stop watchdog
        if self.watchdog:
            self.watchdog.stop()
            time.sleep(0.5)

        # Clean up temporary directory
        try:
            import shutil
            shutil.rmtree(self.temp_dir)
        except Exception as e:
            print(f"Cleanup error: {e}")

    def create_test_audio_file(self, filename: str) -> Path:
        """Create a test audio file using ffmpeg."""
        test_file = self.downloads_path / filename

        # Generate a 1-second sine wave audio file
        cmd = [
            'ffmpeg',
            '-f', 'lavfi',
            '-i', 'sine=frequency=440:duration=1',
            '-y',  # Overwrite
            str(test_file)
        ]

        try:
            subprocess.run(cmd, capture_output=True, timeout=10)
            return test_file
        except Exception as e:
            self.fail(f"Could not create test audio file: {e}")

    def test_converts_voice_memo(self):
        """Test that voice memo files are converted to MP3."""
        test_file = self.create_test_audio_file('recording_20231201.m4a')

        # Wait for conversion
        max_wait = 15
        start_time = time.time()

        while time.time() - start_time < max_wait:
            if len(list(self.archive_path.glob('*.mp3'))) > 0:
                break
            time.sleep(0.5)

        # Check results
        mp3_files = list(self.archive_path.glob('*.mp3'))
        self.assertTrue(len(mp3_files) > 0, "No MP3 file was created")

        # Check that original was moved to backup
        backup_files = list(self.backup_path.glob('recording_20231201.m4a'))
        self.assertTrue(len(backup_files) > 0, "Original file was not backed up")

    def test_ignores_non_voice_files(self):
        """Test that non-voice files are ignored."""
        test_file = self.create_test_audio_file('music_song.m4a')

        # Wait a bit
        time.sleep(3)

        # Should not be converted (doesn't match voice note patterns)
        mp3_files = list(self.archive_path.glob('*.mp3'))
        self.assertEqual(len(mp3_files), 0, "Non-voice file was incorrectly processed")

        # Original should still exist
        self.assertTrue(test_file.exists(), "Non-voice file was incorrectly moved")

    def test_ignores_non_audio_files(self):
        """Test that non-audio files are ignored."""
        test_file = self.downloads_path / 'document.txt'
        with open(test_file, 'w') as f:
            f.write('This is a text file')

        time.sleep(2)

        # Should be ignored
        mp3_files = list(self.archive_path.glob('*.mp3'))
        self.assertEqual(len(mp3_files), 0, "Text file was incorrectly processed")
        self.assertTrue(test_file.exists(), "Text file was incorrectly moved")

    def test_handles_multiple_voice_notes(self):
        """Test handling multiple voice notes."""
        files = [
            'voice_memo_1.m4a',
            'recording_123.caf',
            'new_recording.aac'
        ]

        for filename in files:
            self.create_test_audio_file(filename)

        # Wait for all conversions
        max_wait = 20
        start_time = time.time()

        while time.time() - start_time < max_wait:
            mp3_files = list(self.archive_path.glob('*.mp3'))
            if len(mp3_files) >= len(files):
                break
            time.sleep(0.5)

        mp3_files = list(self.archive_path.glob('*.mp3'))
        self.assertEqual(len(mp3_files), len(files),
                        f"Expected {len(files)} MP3 files, got {len(mp3_files)}")

if __name__ == '__main__':
    unittest.main()