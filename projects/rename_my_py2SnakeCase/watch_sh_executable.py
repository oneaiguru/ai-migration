# /Users/m/git/tools/rename_my_py2SnakeCase/watch_sh_executable.py

import os
import sys
import time
import stat
import logging
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent, FileModifiedEvent

class ShellScriptHandler(FileSystemEventHandler):
    """Makes shell scripts executable automatically."""
    
    def __init__(self, watch_paths=None):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
        self.logger.addHandler(handler)
        
        # Default watch paths if none provided
        self.watch_paths = watch_paths or [
            Path.home() / 'Downloads',
            Path.home() / 'git',
            Path.home() / 'Documents'
        ]
        
        self._pending_files = set()
        self._last_event_time = {}
        
    def on_created(self, event):
        if not isinstance(event, FileCreatedEvent):
            return
            
        self._handle_file(Path(event.src_path))
        
    def on_modified(self, event):
        if not isinstance(event, FileModifiedEvent):
            return
            
        self._handle_file(Path(event.src_path))
    
    def _should_process_file(self, file_path: Path) -> bool:
        """Check if file should be processed."""
        if file_path.suffix != '.sh':
            return False
            
        # Check if file is in one of our watch paths
        for watch_path in self.watch_paths:
            try:
                file_path.relative_to(watch_path)
                return True
            except ValueError:
                continue
        return False
    
    def _handle_file(self, file_path: Path) -> None:
        """Make shell script executable if needed."""
        if not self._should_process_file(file_path):
            return
            
        # Debounce events
        current_time = time.time()
        if file_path in self._last_event_time:
            if current_time - self._last_event_time[file_path] < 0.5:
                return
        self._last_event_time[file_path] = current_time
        
        # Check if already in pending
        if file_path in self._pending_files:
            return
            
        self._pending_files.add(file_path)
        
        try:
            # Wait a bit to ensure file is fully written
            time.sleep(0.5)
            
            if not file_path.exists():
                return
                
            # Check current permissions
            current_stat = file_path.stat()
            current_mode = current_stat.st_mode
            
            # Check if already executable
            if current_mode & stat.S_IXUSR:
                return
                
            # Make executable for owner
            new_mode = current_mode | stat.S_IXUSR
            file_path.chmod(new_mode)
            
            self.logger.info(f'Made executable: {file_path}')
            
        except Exception as e:
            self.logger.error(f'Failed to make {file_path} executable: {e}')
        finally:
            self._pending_files.discard(file_path)
            if file_path in self._last_event_time:
                del self._last_event_time[file_path]


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Watch for shell scripts and make them executable')
    parser.add_argument('--paths', nargs='+', help='Paths to watch (default: Downloads, git, Documents)')
    args = parser.parse_args()
    
    # Set up watch paths
    watch_paths = None
    if args.paths:
        watch_paths = [Path(p).expanduser().resolve() for p in args.paths]
    
    handler = ShellScriptHandler(watch_paths)
    observer = Observer()
    
    # Add observers for each watch path
    for path in handler.watch_paths:
        if path.exists():
            observer.schedule(handler, str(path), recursive=True)
            handler.logger.info(f'Watching {path} for shell scripts')
        else:
            handler.logger.warning(f'Path does not exist: {path}')
    
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        handler.logger.info('Stopped watching for shell scripts')
    
    observer.join()


if __name__ == "__main__":
    main()
