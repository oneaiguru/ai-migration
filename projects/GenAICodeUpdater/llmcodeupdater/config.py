import os
import pathlib

# Use a directory in the user's home folder for centralized storage
DEFAULT_CENTRALIZED_STORAGE = os.path.join(str(pathlib.Path.home()), '.llmcodeupdater')

CENTRALIZED_STORAGE = os.getenv("CENTRALIZED_STORAGE", DEFAULT_CENTRALIZED_STORAGE)

def get_centralized_path(subdir: str) -> str:
    """
    Returns the path for a specific subdirectory in centralized storage.
    Args:
        subdir (str): Subdirectory name ('backups', 'reports', or 'tasks.db').
    Returns:
        str: Absolute path to the subdirectory or file.
    """
    os.makedirs(CENTRALIZED_STORAGE, exist_ok=True)

    path = os.path.join(CENTRALIZED_STORAGE, subdir)
    if subdir != 'tasks.db':
        os.makedirs(path, exist_ok=True)
    return path