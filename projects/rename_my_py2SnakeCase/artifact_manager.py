import os
import sys
import time
import shutil
import logging
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Set
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

# Configure logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create handlers
stream_handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
stream_handler.setFormatter(formatter)
logger.addHandler(stream_handler)

class ArtifactHandler(FileSystemEventHandler):
    """Watches for new artifacts in Downloads folder and processes them."""

    def __init__(self, downloads_path: Path, projects_path: Path, extensions: Set[str] = None):
        self.downloads_path = downloads_path
        self.projects_path = projects_path
        self.extensions = extensions or {'.py', '.md', '.txt', '.json', '.html', '.css', '.js'}
        self._pending_files = set()
        self._last_event_time = {}
        self._retry_attempts = 3
        self._retry_delay = 1.0
        logger.info(f"Watching for artifacts in {downloads_path}")
        logger.info(f"Projects directory: {projects_path}")
        logger.info(f"Tracking extensions: {', '.join(self.extensions)}")

    def on_created(self, event):
        if not isinstance(event, FileCreatedEvent):
            return

        file_path = Path(event.src_path)

        # Debounce events for the same file
        current_time = time.time()
        if file_path in self._last_event_time:
            if current_time - self._last_event_time[file_path] < 1.0:
                return

        self._last_event_time[file_path] = current_time
        self._handle_file(file_path)

    def _should_process_file(self, file_path: Path) -> bool:
        return all([
            file_path.suffix in self.extensions,
            file_path.parent == self.downloads_path,
            file_path.name not in self._pending_files
        ])

    def _find_project_for_file(self, file_path: Path) -> Optional[Path]:
        """
        Find the appropriate project folder for a file based on content analysis.
        """
        try:
            # Read the first few lines of the file to look for path hints
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                first_lines = [f.readline() for _ in range(10)]

            # Look for path hints in comments or content
            for line in first_lines:
                if line.startswith('# /') or line.startswith('// /') or line.startswith('<!-- /'):
                    # Extract potential path
                    path_hint = line.split(' ', 1)[1].strip()
                    # Convert absolute path to relative project path
                    for project_dir in self.projects_path.iterdir():
                        if project_dir.is_dir() and project_dir.name in path_hint:
                            return project_dir

            # If no hints found in content, try intelligent matching based on file name
            file_stem = file_path.stem.lower()
            best_match = None
            best_score = 0

            for project_dir in self.projects_path.iterdir():
                if not project_dir.is_dir():
                    continue

                project_name = project_dir.name.lower()
                # Simple matching algorithm
                score = 0
                if file_stem in project_name or project_name in file_stem:
                    score += 5

                # Count common words
                file_words = set(file_stem.split('_'))
                project_words = set(project_name.split('_'))
                common_words = file_words.intersection(project_words)
                score += len(common_words) * 2

                if score > best_score:
                    best_score = score
                    best_match = project_dir

            # Return best match if score is significant
            if best_score >= 2:
                return best_match

            # Last resort: check for existing files with same name in projects
            for project_dir in self.projects_path.iterdir():
                if not project_dir.is_dir():
                    continue

                # Check recursively for files with the same name
                for root, _, files in os.walk(project_dir):
                    if file_path.name in files:
                        return project_dir

            return None

        except Exception as e:
            logger.error(f"Error finding project for {file_path}: {e}")
            return None

    def _handle_file(self, file_path: Path) -> None:
        if not self._should_process_file(file_path):
            return

        # Add to pending before attempting processing
        self._pending_files.add(file_path.name)

        try:
            for attempt in range(self._retry_attempts):
                try:
                    # Ensure file is fully written and not locked
                    time.sleep(self._retry_delay)

                    # Check if file still exists
                    if not file_path.exists():
                        logger.warning(f"File disappeared before processing: {file_path}")
                        return

                    # Try to open the file to ensure it's not locked
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as _:
                        pass

                    # Find target project folder
                    project_dir = self._find_project_for_file(file_path)

                    if project_dir:
                        # Process the file based on its content
                        target_path = self._determine_target_path(file_path, project_dir)

                        if target_path:
                            # Create parent directories if they don't exist
                            target_path.parent.mkdir(parents=True, exist_ok=True)

                            # Check if this is an update to an existing file
                            is_update = target_path.exists()

                            # Move or copy the file
                            shutil.copy2(file_path, target_path)
                            file_path.unlink()  # Remove from downloads after copying

                            logger.info(f"Moved {file_path.name} to {target_path}")

                            # If this is an update, commit the changes
                            if is_update:
                                self._commit_changes(target_path)

                            # Notify that the file has been processed
                            self._notify_update(target_path)
                    else:
                        logger.warning(f"Could not determine project for {file_path.name}")

                    return  # Success, exit the retry loop

                except (PermissionError, FileNotFoundError) as e:
                    if attempt == self._retry_attempts - 1:
                        raise  # Re-raise on last attempt
                    logger.debug(f"Retry {attempt + 1} failed: {str(e)}")
                    time.sleep(self._retry_delay)

        except Exception as e:
            logger.error(f"Failed to process {file_path.name}: {str(e)}")
        finally:
            self._pending_files.discard(file_path.name)
            if file_path in self._last_event_time:
                del self._last_event_time[file_path]

    def _determine_target_path(self, file_path: Path, project_dir: Path) -> Optional[Path]:
        """
        Determine the correct path for the file within the project.
        """
        try:
            # Check for explicit path in file content
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                first_line = f.readline().strip()

            if first_line.startswith('# /'):
                path_hint = first_line[2:].strip()
                # Convert absolute path to relative project path
                if project_dir.name in path_hint:
                    # Extract the relative path within the project
                    relative_path = path_hint.split(project_dir.name, 1)[1].lstrip('/')
                    return project_dir / relative_path

            # If no explicit path, check for existing file with same name
            for root, _, files in os.walk(project_dir):
                root_path = Path(root)
                if file_path.name in files:
                    return root_path / file_path.name

            # If still no match, place at project root
            return project_dir / file_path.name

        except Exception as e:
            logger.error(f"Error determining target path for {file_path}: {e}")
            return None

    def _commit_changes(self, file_path: Path) -> bool:
        """
        Commit changes to git repository.
        """
        try:
            # Find the git root directory
            git_root = self._find_git_root(file_path)
            if not git_root:
                logger.warning(f"No git repository found for {file_path}")
                return False

            # Get relative path for commit message
            rel_path = file_path.relative_to(git_root)

            # Create commit message
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
            commit_msg = f"Update {rel_path} - Automated commit ({timestamp})"

            # Run git commands
            cwd = str(git_root)
            subprocess.run(['git', 'add', str(rel_path)], cwd=cwd, check=True,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            result = subprocess.run(['git', 'commit', '-m', commit_msg], cwd=cwd, check=True,
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info(f"Committed changes to {rel_path}")
            return True

        except subprocess.CalledProcessError as e:
            logger.error(f"Git operation failed: {e}")
            return False
        except Exception as e:
            logger.error(f"Error committing changes: {e}")
            return False

    def _find_git_root(self, path: Path) -> Optional[Path]:
        """
        Find the root directory of the git repository containing the file.
        """
        current = path.parent
        while current != current.parent:  # Stop at filesystem root
            git_dir = current / '.git'
            if git_dir.exists() and git_dir.is_dir():
                return current
            current = current.parent
        return None

    def _notify_update(self, file_path: Path) -> None:
        """
        Display notification that file has been updated.
        """
        message = f"File updated: {file_path}"
        print("\n" + "=" * 80)
        print(f"🔄 {message}")
        print("=" * 80)

class ArtifactManager:
    def __init__(self, downloads_path: Path = None, projects_path: Path = None):
        self.downloads_path = downloads_path or Path.home() / 'Downloads'
        self.projects_path = projects_path or Path.home() / 'Documents'
        self.observer = None
        self.handler = None

    def start(self, extensions: Set[str] = None):
        if self.observer is not None:
            return

        self.handler = ArtifactHandler(self.downloads_path, self.projects_path, extensions)
        self.observer = Observer()
        self.observer.schedule(self.handler, str(self.downloads_path), recursive=False)
        self.observer.start()
        logger.info(f"Artifact manager started, watching {self.downloads_path}")

    def stop(self):
        if self.observer is not None:
            self.observer.stop()
            self.observer.join()
            self.observer = None
            self.handler = None
            logger.info("Artifact manager stopped")

def main():
    parser = argparse.ArgumentParser(description="Artifact Manager - Watches Downloads folder for artifacts and moves them to project folders")
    parser.add_argument('--downloads', help='Path to Downloads folder', default=str(Path.home() / 'Downloads'))
    parser.add_argument('--projects', help='Path to Projects directory', default=str(Path.home() / 'Documents'))
    parser.add_argument('--extensions', help='Comma-separated list of file extensions to watch (default: .py,.md,.txt,.json)',
                        default=".py,.md,.txt,.json,.html,.css,.js")
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    parser.add_argument('--process-file', metavar='FILE', help='Process a specific file (one-time operation)')

    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    downloads_path = Path(args.downloads).expanduser().resolve()
    projects_path = Path(args.projects).expanduser().resolve()
    extensions = set('.' + ext.strip('.') for ext in args.extensions.split(','))

    # One-time operation mode
    if args.process_file:
        file_path = Path(args.process_file).expanduser().resolve()
        if not file_path.exists():
            logger.error(f"File not found: {file_path}")
            return

        handler = ArtifactHandler(downloads_path, projects_path, extensions)
        handler._handle_file(file_path)
        return

    # Continuous watch mode
    manager = ArtifactManager(downloads_path, projects_path)
    manager.start(extensions)

    try:
        print(f"\n{'=' * 80}\n🔍 Artifact Manager running - watching for new files in {downloads_path}\n" +
              f"📁 Projects directory: {projects_path}\n" +
              f"🔄 Extensions: {', '.join(extensions)}\n" +
              f"Press Ctrl+C to stop\n{'=' * 80}\n")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        manager.stop()
        print("\nArtifact Manager stopped.")

if __name__ == "__main__":
    main()