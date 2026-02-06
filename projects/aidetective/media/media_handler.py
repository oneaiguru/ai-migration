import os
import logging
from pathlib import Path
import re
from typing import Optional, Tuple
from PIL import Image
import aiofiles
import aiohttp
import asyncio
from functools import partial

from config.settings import get_settings
from utils.exceptions import MediaError

logger = logging.getLogger(__name__)

def _resolve_media_dir() -> Path:
    """Resolve media directory without requiring full Settings on import."""
    # Prefer explicit env var to avoid forcing TELEGRAM_TOKEN during tests
    media_dir = os.getenv("MEDIA_DIR")
    if media_dir:
        return Path(media_dir)

    try:
        return Path(get_settings().MEDIA_DIR)
    except Exception:
        # Fallback for environments without full settings (e.g., tests)
        return Path("media")

class MediaHandler:
    """Handler for media files (images, audio, video)"""

    def __init__(self):
        """Initialize media handler with base directory from settings"""
        self.media_dir = _resolve_media_dir()
        self._settings = None  # Lazy settings to avoid forcing TELEGRAM_TOKEN at import
        self._ensure_directories()

    def _ensure_directories(self):
        """Ensure all required directories exist"""
        for dir_name in ['evidence', 'characters', 'locations']:
            dir_path = self.media_dir / dir_name
            dir_path.mkdir(parents=True, exist_ok=True)

    def _validate_filename(self, filename: str) -> bool:
        """Validate filename to prevent path traversal

        Args:
            filename: Filename to validate

        Returns:
            True if filename is valid, False otherwise
        """
        # Check for path traversal attempts
        normalized = os.path.normpath(filename)
        if '/' in normalized or '\\' in normalized or '..' in normalized:
            return False

        # Only allow alphanumeric characters, underscore, hyphen, and period
        if not re.match(r'^[\w\-. ]+$', filename):
            return False

        return True

    async def save_file(self, file_path: str, directory: str, filename: str) -> str:
        """Save a file to the specified directory

        Args:
            file_path: Source file path
            directory: Target directory (evidence, characters, locations)
            filename: Target filename

        Returns:
            Path to the saved file

        Raises:
            MediaError: If file cannot be saved
        """
        try:
            # Validate directory
            if directory not in ['evidence', 'characters', 'locations']:
                raise MediaError(f"Invalid directory: {directory}")

            # Validate filename to prevent path traversal
            if not self._validate_filename(filename):
                raise MediaError(f"Invalid filename: {filename}")

            # Create destination path
            dest_dir = self.media_dir / directory
            dest_path = dest_dir / filename

            # Check if source file exists (using asyncio to avoid blocking)
            file_exists = await self._file_exists(file_path)
            if not file_exists:
                raise MediaError(f"Source file not found: {file_path}")

            # Copy file
            async with aiofiles.open(file_path, 'rb') as src_file:
                content = await src_file.read()

                async with aiofiles.open(dest_path, 'wb') as dest_file:
                    await dest_file.write(content)

            return str(dest_path)
        except MediaError:
            # Re-raise specific media errors
            raise
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            raise MediaError(f"Failed to save file: {e}")

    async def get_evidence_image_path(self, filename: str) -> Optional[str]:
        """Get full path for evidence image file

        Args:
            filename: Evidence image filename

        Returns:
            Full path to the image file or None if not found
        """
        # Validate filename to prevent path traversal
        if not self._validate_filename(filename):
            logger.warning(f"Invalid filename requested: {filename}")
            return None

        file_path = self.media_dir / 'evidence' / filename
        exists = await self._file_exists(str(file_path))
        return str(file_path) if exists else None

    async def get_character_image_path(self, filename: str) -> Optional[str]:
        """Get full path for character image file

        Args:
            filename: Character image filename

        Returns:
            Full path to the image file or None if not found
        """
        # Validate filename to prevent path traversal
        if not self._validate_filename(filename):
            logger.warning(f"Invalid filename requested: {filename}")
            return None

        file_path = self.media_dir / 'characters' / filename
        exists = await self._file_exists(str(file_path))
        return str(file_path) if exists else None

    async def get_location_image_path(self, filename: str) -> Optional[str]:
        """Get full path for location image file

        Args:
            filename: Location image filename

        Returns:
            Full path to the image file or None if not found
        """
        # Validate filename to prevent path traversal
        if not self._validate_filename(filename):
            logger.warning(f"Invalid filename requested: {filename}")
            return None

        file_path = self.media_dir / 'locations' / filename
        exists = await self._file_exists(str(file_path))
        return str(file_path) if exists else None

    async def image_exists(self, category: str, filename: str) -> bool:
        """Check if image exists in the specified category

        Args:
            category: Image category (evidence, characters, locations)
            filename: Image filename

        Returns:
            True if image exists, False otherwise

        Raises:
            MediaError: If category is invalid
        """
        if category not in ['evidence', 'characters', 'locations']:
            raise MediaError(f"Invalid category: {category}")

        # Validate filename to prevent path traversal
        if not self._validate_filename(filename):
            logger.warning(f"Invalid filename requested: {filename}")
            return False

        file_path = self.media_dir / category / filename
        return await self._file_exists(str(file_path))

    async def download_image(self, url: str, directory: str, filename: str) -> Optional[str]:
        """Download an image from a URL and save it

        Args:
            url: Image URL
            directory: Target directory (evidence, characters, locations)
            filename: Target filename

        Returns:
            Path to the saved image or None if download failed

        Raises:
            MediaError: If image cannot be downloaded or saved
        """
        try:
            # Validate directory
            if directory not in ['evidence', 'characters', 'locations']:
                raise MediaError(f"Invalid directory: {directory}")

            # Validate filename to prevent path traversal
            if not self._validate_filename(filename):
                raise MediaError(f"Invalid filename: {filename}")

            # Create destination path
            dest_dir = self.media_dir / directory
            dest_path = dest_dir / filename

            # Validate URL
            if not url.startswith(('http://', 'https://')):
                raise MediaError(f"Invalid URL: {url}")

            # Download image
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=30) as response:
                    if response.status != 200:
                        raise MediaError(f"Failed to download image: HTTP {response.status}")

                    # Check content type
                    content_type = response.headers.get('Content-Type', '')
                    if not content_type.startswith('image/'):
                        raise MediaError(f"URL does not point to an image: {content_type}")

                    # Check file size to prevent DoS
                    content_length = int(response.headers.get('Content-Length', '0'))
                    max_size_mb = self._get_max_evidence_size_mb()
                    if content_length > max_size_mb * 1024 * 1024:
                        raise MediaError(f"Image is too large: {content_length} bytes (max: {max_size_mb}MB)")

                    # Save image
                    content = await response.read()
                    async with aiofiles.open(dest_path, 'wb') as f:
                        await f.write(content)

            # Optimize image
            await self._optimize_image(str(dest_path))

            return str(dest_path)
        except MediaError:
            # Re-raise specific media errors
            raise
        except asyncio.TimeoutError:
            logger.error(f"Timeout downloading image: {url}")
            raise MediaError(f"Timeout downloading image: Request took too long")
        except Exception as e:
            logger.error(f"Error downloading image: {e}")
            raise MediaError(f"Failed to download image: {e}")

    async def _file_exists(self, file_path: str) -> bool:
        """Check if a file exists asynchronously

        Args:
            file_path: Path to the file

        Returns:
            True if file exists, False otherwise
        """
        return await asyncio.to_thread(os.path.exists, file_path)

    async def _optimize_image(self, image_path: str, max_size: Tuple[int, int] = (800, 800)) -> None:
        """Optimize an image by resizing and compressing it

        Args:
            image_path: Path to the image
            max_size: Maximum image dimensions (width, height)

        Raises:
            MediaError: If image cannot be optimized
        """
        try:
            # Use asyncio.to_thread to run PIL operations in a separate thread
            # to avoid blocking the event loop
            await asyncio.to_thread(self._optimize_image_sync, image_path, max_size)
        except Exception as e:
            logger.error(f"Error optimizing image: {e}")
            raise MediaError(f"Failed to optimize image: {e}")

    def _optimize_image_sync(self, image_path: str, max_size: Tuple[int, int] = (800, 800)) -> None:
        """Synchronous version of image optimization (run in a thread)

        Args:
            image_path: Path to the image
            max_size: Maximum image dimensions (width, height)
        """
        with Image.open(image_path) as img:
            # Check if image needs resizing
            if img.width > max_size[0] or img.height > max_size[1]:
                # Calculate new size while preserving aspect ratio
                img.thumbnail(max_size)

            # Save optimized image
            img.save(image_path, optimize=True, quality=85)

    def _get_max_evidence_size_mb(self) -> float:
        """Return max evidence size from settings or env with safe fallback."""
        try:
            if self._settings is None:
                self._settings = get_settings()
            return float(getattr(self._settings, "MAX_EVIDENCE_SIZE_MB", 2.0))
        except Exception:
            return float(os.getenv("MAX_EVIDENCE_SIZE_MB", "2.0"))
