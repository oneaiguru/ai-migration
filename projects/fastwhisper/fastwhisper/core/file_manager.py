import os
import re
from datetime import datetime
import shutil
from pathlib import Path
from typing import Optional

class FileManager:
    """Handles file operations with environment-aware behavior"""

    def __init__(self, is_code_interpreter: bool = False):
        self.is_code_interpreter = is_code_interpreter
        self.virtual_fs = {} if is_code_interpreter else None

    def file_exists(self, path: str) -> bool:
        """Check if a file exists in either real or virtual filesystem"""
        if self.is_code_interpreter:
            return path in self.virtual_fs
        return os.path.exists(path)

    def write_file(self, path: str, content: str) -> None:
        """Write content to a file in either real or virtual filesystem"""
        if self.is_code_interpreter:
            self.virtual_fs[path] = content
        else:
            with open(path, 'w') as f:
                f.write(content)

    def read_file(self, path: str) -> Optional[str]:
        """Read content from a file in either real or virtual filesystem"""
        if self.is_code_interpreter:
            return self.virtual_fs.get(path)
        if os.path.exists(path):
            with open(path, 'r') as f:
                return f.read()
        return None

    def move_file(self, src: str, dst: str) -> None:
        """Move a file in either real or virtual filesystem"""
        dst_dir = os.path.dirname(dst)
        if dst_dir:
            os.makedirs(dst_dir, exist_ok=True)

        if self.is_code_interpreter:
            # Move real files so main() sees progress under /mnt/data and mirror the virtual FS.
            if os.path.exists(src):
                shutil.move(src, dst)
            if src in self.virtual_fs:
                self.virtual_fs[dst] = self.virtual_fs.pop(src)
            return

        shutil.move(src, dst)

    def list_files(self, directory: str) -> list:
        """List files in a directory in either real or virtual filesystem"""
        if self.is_code_interpreter:
            return [k for k in self.virtual_fs.keys() if k.startswith(directory)]
        return os.listdir(directory) if os.path.exists(directory) else []

    def extract_timestamp(self, file_path: str) -> datetime:
        """Extract timestamp from filename or get file modification time"""
        filename = os.path.basename(file_path)

        # Define multiple regex patterns to match different timestamp formats
        timestamp_patterns = [
            (r'.*(\d{8}-\d{6})', '%Y%m%d-%H%M%S'),
            (r'.*_(\d{4}_\d{2}_\d{2})', '%Y_%m_%d')
        ]

        for pattern, date_format in timestamp_patterns:
            match = re.search(pattern, filename)
            if match:
                try:
                    return datetime.strptime(match.group(1), date_format)
                except ValueError:
                    continue

        # Fall back to file modification time
        if self.is_code_interpreter:
            return datetime.now()
        return datetime.fromtimestamp(os.path.getmtime(file_path))

    def archive_files(self, source_dir: str, archive_dir: str) -> None:
        """Archive files based on their age"""
        now = datetime.now()
        source_path = Path(source_dir)
        archive_path = Path(archive_dir)

        for file in source_path.glob('*'):
            if file.is_file():
                timestamp = self.extract_timestamp(str(file))
                age = now - timestamp

                if age.days <= 7:
                    target_dir = archive_path / "daily"
                else:
                    target_dir = archive_path / str(timestamp.year)

                target_dir.mkdir(parents=True, exist_ok=True)
                target_file = target_dir / file.name

                if self.is_code_interpreter:
                    self.move_file(str(file), str(target_file))
                else:
                    shutil.move(str(file), str(target_file))

    def handle_pretranscribed_files(self, input_dir: str, transcript_dir: str, archive_dir: str) -> None:
        """
        Move any pre-transcribed files from input directory to transcript directory and archive them.
        Also handles audio files that already have corresponding transcripts.
        """
        # Check for existing transcripts in input directory
        transcript_extensions = {'.txt', '.vtt'}
        audio_extensions = {'.mp3', '.wav', '.m4a'}

        # First, move transcript files (and their audio) out of input/
        for filename in os.listdir(input_dir):
            if Path(filename).suffix in transcript_extensions:
                base_name = Path(filename).stem

                # Check if a corresponding audio file exists
                for ext in audio_extensions:
                    audio_filename = f"{base_name}{ext}"
                    audio_path = os.path.join(input_dir, audio_filename)

                    if os.path.exists(audio_path):
                        # Move transcript file to transcript directory
                        src_transcript = os.path.join(input_dir, filename)
                        dst_transcript = os.path.join(transcript_dir, filename)
                        self.move_file(src_transcript, dst_transcript)

                        # Also move the matching audio so main() won't re-queue it
                        dst_audio = os.path.join(transcript_dir, audio_filename)
                        self.move_file(audio_path, dst_audio)

        # Move pre-transcribed audio files to transcript directory
        for filename in os.listdir(input_dir):
            file_path = os.path.join(input_dir, filename)

            # Only process audio files
            if any(filename.endswith(ext) for ext in audio_extensions):
                transcript_txt = os.path.join(transcript_dir, f"{Path(filename).stem}.txt")
                transcript_vtt = os.path.join(transcript_dir, f"{Path(filename).stem}.vtt")

                # If transcript files exist, move audio file to transcript directory
                if os.path.exists(transcript_txt) or os.path.exists(transcript_vtt):
                    dst_path = os.path.join(transcript_dir, filename)
                    self.move_file(file_path, dst_path)

        # Optional: Archive files in the transcript directory after processing has run.
        # Leave transcripts in place so main() can detect already-processed audio.
        # Call archive_paths explicitly from the main flow if archiving is desired post-run.
