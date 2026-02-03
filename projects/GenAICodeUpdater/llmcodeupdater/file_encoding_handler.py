import os
import chardet
from typing import Dict, Tuple, Optional
import logging
from pathlib import Path


class FileEncodingHandler:
    """Handles file encoding detection and conversion for code updates."""

    def __init__(self, logger: Optional[logging.Logger] = None, confidence_threshold: float = 0.75):
        """
        Initialize the handler with a logger and confidence threshold.
        
        Args:
            logger: Logger instance for logging.
            confidence_threshold: Minimum confidence for detected encoding.
        """
        self.logger = logger or logging.getLogger(__name__)
        self.confidence_threshold = confidence_threshold
        # Common encodings to try if detection fails - put latin1 first
        self.fallback_encodings = [
            'latin1',  # Prioritize Latin-1
            'utf-8',
            'cp1252',
            'iso-8859-1',
            'ascii',
            'utf-16',
            'utf-32'
        ]

    def detect_file_encoding(self, file_path: str, sample_size: int = 10000) -> Tuple[str, float]:
        """
        Detect the encoding of a file using chardet.

        Args:
            file_path: Path to the file.
            sample_size: Number of bytes to sample for detection.

        Returns:
            Tuple[str, float]: Detected encoding and confidence score.
        """
        with open(file_path, 'rb') as f:
            raw_data = f.read(sample_size)
            result = chardet.detect(raw_data)
            return result['encoding'], result['confidence']

    def validate_utf8(self, file_path: str) -> bool:
        """
        Check if a file is valid UTF-8.

        Args:
            file_path: Path to the file.

        Returns:
            bool: True if the file is valid UTF-8.
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                f.read()
            return True
        except UnicodeDecodeError:
            return False

    def convert_to_utf8(self, file_path: str, backup_dir: Optional[str] = None, base_dir: Optional[str] = None) -> Dict[str, any]:
        """
        Convert a file to UTF-8 encoding.

        Args:
            file_path: Path to the file.
            backup_dir: Directory to store backup files.
            base_dir: Optional base directory to preserve relative paths in backups.

        Returns:
            Dict containing operation results.
        """
        result = {
            'success': False,
            'original_encoding': None,
            'confidence': 0,
            'backup_path': None,
            'error': None
        }

        try:
            # Create backup if directory specified
            if backup_dir:
                backup_root = Path(backup_dir)
                # Preserve relative structure when base_dir is provided to avoid name collisions
                if base_dir:
                    try:
                        rel_path = Path(os.path.relpath(file_path, base_dir))
                    except ValueError:
                        rel_path = Path(Path(file_path).name)
                else:
                    rel_path = Path(Path(file_path).name)
                backup_path = (backup_root / rel_path).with_suffix(f"{rel_path.suffix}.bak")
                backup_path.parent.mkdir(parents=True, exist_ok=True)
                with open(file_path, 'rb') as src, open(backup_path, 'wb') as dst:
                    dst.write(src.read())
                result['backup_path'] = backup_path
                self.logger.info(f"Backup created at {backup_path}")

            # Read the file in binary mode
            with open(file_path, 'rb') as f:
                raw_data = f.read()
            self.logger.debug(f"Read {len(raw_data)} bytes from {file_path}")

            # Detect encoding
            encoding, confidence = self.detect_file_encoding(file_path)
            result['original_encoding'] = encoding
            result['confidence'] = confidence
            self.logger.info(f"Detected encoding: {encoding} with confidence {confidence}")

            # Use fallback encodings if confidence is below the threshold
            content = None
            if encoding and confidence >= self.confidence_threshold:
                try:
                    content = raw_data.decode(encoding)
                    self.logger.info(f"Successfully decoded with encoding: {encoding}")
                except UnicodeDecodeError as e:
                    self.logger.warning(f"Failed to decode with encoding {encoding}: {e}")
                    content = None

            if content is None:
                for enc in self.fallback_encodings:
                    try:
                        content = raw_data.decode(enc)
                        encoding = enc
                        self.logger.info(f"Successfully decoded with fallback encoding: {enc}")
                        break
                    except UnicodeDecodeError:
                        self.logger.warning(f"Failed to decode with fallback encoding: {enc}")
                        continue

            if content is None:
                raise UnicodeError("Unable to decode file with any known encoding")

            # Write content back in UTF-8
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            self.logger.info(f"Successfully converted {file_path} to UTF-8 encoding.")

            result['success'] = True

        except Exception as e:
            result['error'] = str(e)
            self.logger.error(f"Error converting {file_path}: {str(e)}")

            # Restore from backup if conversion failed
            if backup_dir and result.get('backup_path'):
                try:
                    with open(result['backup_path'], 'rb') as src, open(file_path, 'wb') as dst:
                        dst.write(src.read())
                    self.logger.info(f"Restored {file_path} from backup.")
                except Exception as restore_error:
                    self.logger.error(f"Error restoring backup for {file_path}: {str(restore_error)}")

        return result

    def process_directory(
        self,
        directory: str,
        backup_dir: Optional[str] = None,
        file_extensions: tuple = ('.py',),
        ignore_handler: Optional[object] = None,
    ) -> Dict[str, list]:
        """
        Process all files in a directory, converting them to UTF-8.

        Args:
            directory: Directory to process.
            backup_dir: Directory to store backups.
            file_extensions: Tuple of file extensions to process.

        Returns:
            Dict containing lists of successful and failed files.
        """
        results = {
            'successful': [],
            'failed': [],
            'skipped': []
        }

        for root, dirs, files in os.walk(directory, topdown=True):
            rel_root = os.path.relpath(root, directory)
            if ignore_handler:
                # Prune ignored directories early to avoid descending into them
                dirs[:] = [
                    d for d in dirs
                    if not ignore_handler.is_ignored(
                        os.path.join(rel_root, d) if rel_root != '.' else d
                    )
                ]
                if ignore_handler.is_ignored(rel_root if rel_root != '.' else ''):
                    continue

            for file in files:
                if not file.endswith(file_extensions):
                    continue

                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, directory)
                if ignore_handler and ignore_handler.is_ignored(rel_path):
                    continue

                # Skip if already valid UTF-8
                if self.validate_utf8(file_path):
                    results['skipped'].append(file_path)
                    continue

                result = self.convert_to_utf8(file_path, backup_dir, base_dir=directory)
                if result['success']:
                    results['successful'].append({
                        'path': file_path,
                        'original_encoding': result['original_encoding'],
                        'confidence': result['confidence']
                    })
                else:
                    results['failed'].append({
                        'path': file_path,
                        'error': result['error']
                    })

        return results

    def preprocess_files(self, directory: str, backup_dir: Optional[str] = None, ignore_handler: Optional[object] = None) -> Dict[str, list]:
        """
        Process all files in a directory, converting them to UTF-8.

        Args:
            directory: Directory to process.
            backup_dir: Optional directory to store backups.
            ignore_handler: Optional ignore handler to skip files/dirs.

        Returns:
            Dict containing lists of successful and failed files.
        """
        return self.process_directory(
            directory=directory,
            backup_dir=backup_dir,
            file_extensions=('.py',),
            ignore_handler=ignore_handler,
        )
