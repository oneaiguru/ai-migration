import sys
import time
import logging
import subprocess
import shutil
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

class VoiceNoteConversionHandler(FileSystemEventHandler):
    """Handles voice note file creation events and converts them to 22kHz mono MP3s."""

    def __init__(self, downloads_path: Path = None):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
        self.logger.addHandler(handler)

        self.downloads_path = downloads_path or Path.home() / 'Downloads'
        self.archive_path = self.downloads_path / 'voice_notes_archive'
        self.backup_path = self.downloads_path / 'voice_notes_backup'

        # Create directories if they don't exist
        self.archive_path.mkdir(exist_ok=True)
        self.backup_path.mkdir(exist_ok=True)

        self._pending_conversions = set()
        self._last_event_time = {}
        self._retry_attempts = 3
        self._retry_delay = 1.0

        # Voice note file extensions
        self._voice_extensions = {'.m4a', '.caf', '.aac', '.wav', '.aiff'}

        # Check if ffmpeg is available
        self._check_ffmpeg()

    def _check_ffmpeg(self):
        """Check if ffmpeg is available in the system."""
        try:
            result = subprocess.run(['ffmpeg', '-version'],
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                self.logger.info("ffmpeg is available for audio conversion")
            else:
                self.logger.error("ffmpeg is not working properly")
                sys.exit(1)
        except (subprocess.TimeoutExpired, FileNotFoundError):
            self.logger.error("ffmpeg is not installed. Please install ffmpeg to use this watchdog.")
            self.logger.error("Install with: brew install ffmpeg (on macOS)")
            sys.exit(1)

    def on_created(self, event):
        if not isinstance(event, FileCreatedEvent):
            return

        file_path = Path(event.src_path)

        # Debounce events for the same file
        current_time = time.time()
        if file_path in self._last_event_time:
            if current_time - self._last_event_time[file_path] < 2.0:
                return

        self._last_event_time[file_path] = current_time
        self._handle_file(file_path)

    def _should_process_file(self, file_path: Path) -> bool:
        """Check if the file should be processed for conversion."""
        return all([
            file_path.suffix.lower() in self._voice_extensions,
            file_path.name not in self._pending_conversions,
            file_path.exists(),
            file_path.stat().st_size > 1024,  # At least 1KB
            not file_path.name.startswith('.')  # Not a hidden file
        ])

    def _is_voice_note(self, file_path: Path) -> bool:
        """Determine if the file is likely a voice note based on name patterns."""
        name_lower = file_path.name.lower()

        # Common voice note patterns
        voice_patterns = [
            'recording',
            'voice',
            'memo',
            'note',
            'audio_recording',
            'new_recording',
            'voice_memo'
        ]

        # Check if filename contains voice note indicators
        for pattern in voice_patterns:
            if pattern in name_lower:
                return True

        # Check if it's from Voice Memos app (typically have timestamps)
        if name_lower.startswith('recording') and any(char.isdigit() for char in name_lower):
            return True

        # If it's a small audio file in Downloads, likely a voice note
        if file_path.stat().st_size < 50 * 1024 * 1024:  # Less than 50MB
            return True

        return False

    def _generate_archive_name(self, original_path: Path) -> str:
        """Generate a consistent name for the archived voice note."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        # Try to extract date from filename if it exists
        name = original_path.stem

        # Clean up the name
        clean_name = name.replace(' ', '_').replace('-', '_')
        clean_name = ''.join(c for c in clean_name if c.isalnum() or c == '_')

        if not clean_name or clean_name.startswith('_'):
            clean_name = f"voice_note_{timestamp}"
        else:
            clean_name = f"{clean_name}_{timestamp}"

        return f"{clean_name}.mp3"

    def _convert_to_mp3(self, input_path: Path, output_path: Path) -> bool:
        """Convert audio file to 22kHz mono MP3."""
        try:
            cmd = [
                'ffmpeg',
                '-i', str(input_path),
                '-ar', '22050',  # 22kHz sample rate
                '-ac', '1',      # Mono
                '-b:a', '64k',   # 64kbps bitrate for voice
                '-y',            # Overwrite output file
                str(output_path)
            ]

            self.logger.info(f"Converting {input_path.name} to MP3...")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

            if result.returncode == 0:
                self.logger.info(f"Successfully converted to {output_path.name}")
                return True
            else:
                self.logger.error(f"ffmpeg conversion failed: {result.stderr}")
                return False

        except subprocess.TimeoutExpired:
            self.logger.error(f"Conversion timeout for {input_path.name}")
            return False
        except Exception as e:
            self.logger.error(f"Conversion error for {input_path.name}: {str(e)}")
            return False

    def _handle_file(self, file_path: Path) -> None:
        """Handle a voice note file for conversion."""
        if not self._should_process_file(file_path):
            return

        if not self._is_voice_note(file_path):
            self.logger.debug(f"Skipping {file_path.name} - doesn't appear to be a voice note")
            return

        # Add to pending conversions
        self._pending_conversions.add(file_path.name)

        try:
            for attempt in range(self._retry_attempts):
                try:
                    # Wait for file to be fully written
                    time.sleep(self._retry_delay)

                    # Check if file still exists
                    if not file_path.exists():
                        self.logger.warning(f"File {file_path.name} no longer exists")
                        return

                    # Try to access the file to ensure it's not locked
                    file_size = file_path.stat().st_size
                    if file_size == 0:
                        self.logger.warning(f"File {file_path.name} is empty, skipping")
                        return

                    # Generate output path
                    archive_name = self._generate_archive_name(file_path)
                    output_path = self.archive_path / archive_name
                    backup_path = self.backup_path / file_path.name

                    # Convert to MP3
                    if self._convert_to_mp3(file_path, output_path):
                        # Move original to backup
                        try:
                            shutil.move(str(file_path), str(backup_path))
                            self.logger.info(f"Moved original {file_path.name} to backup folder")
                            self.logger.info(f"Voice note archived as {archive_name}")
                        except Exception as e:
                            self.logger.warning(f"Could not move original file to backup: {str(e)}")
                    else:
                        self.logger.error(f"Failed to convert {file_path.name}")

                    return  # Success, exit retry loop

                except (PermissionError, FileNotFoundError) as e:
                    if attempt == self._retry_attempts - 1:
                        raise
                    self.logger.debug(f"Retry {attempt + 1} failed for {file_path.name}: {str(e)}")
                    time.sleep(self._retry_delay * (attempt + 1))

        except Exception as e:
            self.logger.error(f'Failed to process voice note {file_path.name}: {str(e)}')
        finally:
            self._pending_conversions.discard(file_path.name)
            if file_path in self._last_event_time:
                del self._last_event_time[file_path]

class VoiceNoteWatchdogScript:
    def __init__(self, name: str, directory: Path, handler_class):
        self.name = name
        self.directory = directory
        self.handler_class = handler_class
        self.observer = None
        self.handler = None

    def start(self):
        if self.observer is not None:
            return

        self.handler = self.handler_class(self.directory)
        self.observer = Observer()
        self.observer.schedule(self.handler, str(self.directory), recursive=False)
        self.observer.start()

    def stop(self):
        if self.observer is not None:
            self.observer.stop()
            self.observer.join()
            self.observer = None
            self.handler = None

def create_voice_note_watchdog(name: str, directory: Path) -> VoiceNoteWatchdogScript:
    return VoiceNoteWatchdogScript(name, directory, VoiceNoteConversionHandler)

if __name__ == "__main__":
    # Default to Downloads folder, but can be changed for iCloud sync
    watch_path = Path.home() / 'Downloads'

    # For iCloud sync, you could use something like:
    # watch_path = Path.home() / 'Library' / 'Mobile Documents' / 'com~apple~CloudDocs' / 'Downloads'

    script = create_voice_note_watchdog("voice_note_converter", watch_path)
    script.start()

    print(f"Watching for voice notes in: {watch_path}")
    print("Press Ctrl+C to stop...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping voice note watchdog...")
        script.stop()