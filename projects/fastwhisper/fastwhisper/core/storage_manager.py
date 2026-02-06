import os
import shutil
import logging
import time
from pathlib import Path
from typing import List

logger = logging.getLogger(__name__)

class StorageManager:
    def __init__(self, local_folder: str, remote_folder: str, max_retries: int = 3, retry_delay: int = 60):
        """
        Initialize the StorageManager with local and remote folders, retries, and delays.
        """
        self.is_code_interpreter = os.getenv('ENVIRONMENT') == 'code_interpreter'
        self.local_folder = Path(local_folder)
        self.remote_folder = Path(remote_folder)
        self.temp_folder = self.local_folder / "temp"
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.sync_queue: List[str] = []
        self.virtual_fs = {} if self.is_code_interpreter else None

        # Create temp folder if not in code interpreter
        if not self.is_code_interpreter:
            os.makedirs(self.temp_folder, exist_ok=True)

    def add_to_sync_queue(self, file_path: str) -> None:
        """
        Add a file to the sync queue.
        """
        if file_path not in self.sync_queue:
            self.sync_queue.append(file_path)

    def cleanup_local_files(self) -> None:
        """
        Clean up local files after ensuring they exist in remote storage.
        """
        if self.is_code_interpreter:
            local_files = [k for k in self.virtual_fs.keys() if k.startswith(str(self.local_folder))]
            for local_path in local_files:
                remote_path = str(self.remote_folder / Path(local_path).relative_to(self.local_folder))
                if remote_path in self.virtual_fs:
                    del self.virtual_fs[local_path]
            return

        for root, _, files in os.walk(self.local_folder):
            root_path = Path(root)
            for file in files:
                local_file = root_path / file
                relative_path = local_file.relative_to(self.local_folder)
                remote_file = self.remote_folder / relative_path

                if remote_file.exists():
                    try:
                        local_file.unlink()
                    except Exception as e:
                        logger.error(f"Error removing {local_file}: {e}")

    def _safe_relative_to(self, src_path: Path, base_path: Path) -> Path:
        """
        Safely calculate a relative path. If not possible, fall back to using just the filename.
        """
        try:
            return src_path.relative_to(base_path)
        except ValueError:
            logger.warning(f"Path {src_path} is not within base {base_path}. Using filename instead.")
            return Path(src_path.name)

    def sync_files(self) -> None:
        """
        Synchronize files to remote storage with retry mechanism.
        """
        for file_path in self.sync_queue[:]:  # Work on a copy of the list
            # Attempt initial sync plus up to max_retries additional attempts
            for attempt in range(self.max_retries + 1):
                try:
                    src_path = Path(file_path)

                    if self.is_code_interpreter:
                        # Handle virtual filesystem sync
                        relative_path = self._safe_relative_to(src_path, self.local_folder)
                        dst_path = self.remote_folder / relative_path
                        self.virtual_fs[str(dst_path)] = self.virtual_fs.get(str(src_path), "")
                    else:
                        # Handle real filesystem sync
                        relative_path = self._safe_relative_to(src_path, self.local_folder)
                        dst_path = self.remote_folder / relative_path
                        dst_path.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copy2(src_path, dst_path)
                        # Ensure destination exists even if copy2 is mocked
                        if not dst_path.exists():
                            with open(src_path, "rb") as src, open(dst_path, "wb") as dst:
                                dst.write(src.read())

                    self.sync_queue.remove(file_path)
                    logger.info(f"Successfully synced {file_path} to {dst_path}")
                    break
                except Exception as e:
                    if attempt == self.max_retries:
                        total_attempts = attempt + 1  # initial attempt + retries
                        logger.error(f"Failed to sync {file_path} after {total_attempts} attempts: {e}")
                    else:
                        retry_number = attempt + 1
                        logger.warning(
                            f"Retrying sync for {file_path} "
                            f"({retry_number}/{self.max_retries}) due to error: {e}"
                        )
                        if not self.is_code_interpreter and self.retry_delay > 0:
                            time.sleep(self.retry_delay)

    def write_temp_file(self, file_name: str, content: str) -> str:
        """
        Write a temporary file with given content in the temp folder.
        """
        if self.is_code_interpreter:
            file_path = str(self.temp_folder / file_name)
            self.virtual_fs[file_path] = content
            return file_path

        temp_file_path = self.temp_folder / file_name
        temp_file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(temp_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return str(temp_file_path)

    def read_temp_file(self, file_name: str) -> str:
        """
        Read the content of a temporary file.
        """
        if self.is_code_interpreter:
            file_path = str(self.temp_folder / file_name)
            return self.virtual_fs.get(file_path, "")

        temp_file_path = self.temp_folder / file_name
        if not temp_file_path.exists():
            raise FileNotFoundError(f"Temporary file {temp_file_path} not found")
        with open(temp_file_path, 'r', encoding='utf-8') as f:
            return f.read()

    def clear_temp_folder(self) -> None:
        """
        Clear all temporary files.
        """
        if self.is_code_interpreter:
            temp_files = [k for k in self.virtual_fs.keys() if k.startswith(str(self.temp_folder))]
            for temp_file in temp_files:
                del self.virtual_fs[temp_file]
            return

        for root, _, files in os.walk(self.temp_folder):
            for file in files:
                os.remove(Path(root) / file)
        if self.temp_folder.exists():
            os.rmdir(self.temp_folder)
    def finalize_temp_file(self, temp_path: str, final_path: str) -> None:
        """
        Move a temp file to its final destination.
        Handles both virtual and real filesystems with enhanced error handling.
        """
        try:
            if self.is_code_interpreter:
                # Virtual filesystem: move content from temp_path to final_path
                if temp_path in self.virtual_fs:
                    self.virtual_fs[final_path] = self.virtual_fs.pop(temp_path)
                    logger.info(f"Virtual file moved from {temp_path} to {final_path}")
                else:
                    logger.warning(f"Temporary virtual file {temp_path} does not exist.")
            else:
                # Real filesystem: move the physical file
                temp_path = Path(temp_path)
                final_path = Path(final_path)
                
                if not temp_path.exists():
                    logger.error(f"Temporary file {temp_path} does not exist. Cannot finalize.")
                    raise FileNotFoundError(f"Temporary file {temp_path} not found.")
                
                # Ensure the parent directory of final_path exists
                final_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Rename (move) the temp file to the final path
                temp_path.rename(final_path)
                logger.info(f"File moved from {temp_path} to {final_path}")
        except Exception as e:
            logger.error(f"Failed to finalize file {temp_path} to {final_path}: {e}")
            raise
