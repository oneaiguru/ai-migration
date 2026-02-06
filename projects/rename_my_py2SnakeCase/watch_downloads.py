import sys
import time
import logging
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent, FileMovedEvent

class PythonFileRenameHandler(FileSystemEventHandler):
    """Handles Python file creation events and renames files from kebab-case to snake_case."""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
        self.logger.addHandler(handler)
        self._pending_renames = set()
        self._last_event_time = {}
        self._retry_attempts = 3
        self._retry_delay = 0.5

    def on_created(self, event):
        if not isinstance(event, FileCreatedEvent):
            return

        file_path = Path(event.src_path)

        # Debounce events for the same file
        current_time = time.time()
        if file_path in self._last_event_time:
            if current_time - self._last_event_time[file_path] < 0.5:
                return

        self._last_event_time[file_path] = current_time
        self._handle_file(file_path)

    def _should_process_file(self, file_path: Path) -> bool:
        # Only process Python files that contain hyphens in their name
        # and aren't already being processed
        return all([
            file_path.suffix == '.py',  # Check if it's a Python file
            '-' in file_path.stem,      # Make sure we only rename files with hyphens in the name (not the extension)
            file_path.name not in self._pending_renames
        ])

    def _handle_file(self, file_path: Path) -> None:
        if not self._should_process_file(file_path):
            return

        new_name = file_path.stem.replace('-', '_') + '.py'
        new_path = file_path.parent / new_name

        # Add to pending before attempting rename
        self._pending_renames.add(new_name)

        try:
            for attempt in range(self._retry_attempts):
                try:
                    # Ensure file is fully written and not locked
                    time.sleep(self._retry_delay)

                    # Check if file still exists (wasn't already renamed)
                    if not file_path.exists():
                        return

                    if new_path.exists():
                        self.logger.warning(f'Target path already exists: {new_path}')
                        return

                    # Try to open the file to ensure it's not locked
                    with open(file_path, 'r') as _:
                        pass

                    # Perform the rename
                    file_path.rename(new_path)
                    self.logger.info(f'Renamed {file_path.name} to {new_name}')
                    return  # Success, exit the retry loop

                except (PermissionError, FileNotFoundError) as e:
                    if attempt == self._retry_attempts - 1:
                        raise  # Re-raise on last attempt
                    self.logger.debug(f'Retry {attempt + 1} failed: {str(e)}')
                    time.sleep(self._retry_delay)

        except Exception as e:
            self.logger.error(f'Failed to rename {file_path.name}: {str(e)}')
        finally:
            self._pending_renames.discard(new_name)
            if file_path in self._last_event_time:
                del self._last_event_time[file_path]

class WatchdogScript:
    def __init__(self, name: str, directory: Path, handler_class):
        self.name = name
        self.directory = directory
        self.handler_class = handler_class
        self.observer = None
        self.handler = None

    def start(self):
        if self.observer is not None:
            return

        self.handler = self.handler_class()
        self.observer = Observer()
        self.observer.schedule(self.handler, str(self.directory), recursive=False)
        self.observer.start()

    def stop(self):
        if self.observer is not None:
            self.observer.stop()
            self.observer.join()
            self.observer = None
            self.handler = None

def create_watchdog(name: str, directory: Path, handler_class) -> WatchdogScript:
    return WatchdogScript(name, directory, handler_class)

if __name__ == "__main__":
    downloads_path = Path.home() / 'Downloads'
    script = create_watchdog("rename_py_files", downloads_path, PythonFileRenameHandler)
    script.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        script.stop()