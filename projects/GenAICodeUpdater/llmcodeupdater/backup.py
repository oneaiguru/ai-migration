import os
import shutil
from datetime import datetime
import logging
from typing import List

logger = logging.getLogger(__name__)

def backup_files(files: List[str], project_root: str, backup_root: str) -> int:
    """
    Create backups of the specified files.

    Args:
        files (List[str]): List of file paths to backup
        project_root (str): Root directory of the project
        backup_root (str): Root directory for backups

    Returns:
        int: Number of files successfully backed up
    """
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_count = 0

    if not files:
        logger.warning("No files provided for backup")
        return 0

    try:
        # Create backup directory with timestamp
        backup_dir = os.path.join(backup_root, timestamp)
        os.makedirs(backup_dir, exist_ok=True)
    except Exception as e:
        logger.error(f"Failed to create backup directory: {str(e)}")
        raise

    for file_path in files:
        try:
            if not os.path.exists(file_path):
                logger.warning(f"File not found for backup: {file_path}")
                continue

            # Create relative path structure in backup directory
            rel_path = os.path.relpath(file_path, project_root)
            backup_file_path = os.path.join(backup_dir, rel_path)

            # Create necessary subdirectories
            os.makedirs(os.path.dirname(backup_file_path), exist_ok=True)

            # Copy the file
            shutil.copy2(file_path, backup_file_path)
            backup_count += 1
            logger.info(f"Backed up: {rel_path}")

        except Exception as e:
            logger.error(f"Failed to backup file {file_path}: {str(e)}")
            continue

    return backup_count