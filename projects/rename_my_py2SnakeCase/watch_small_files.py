# /Users/m/git/tools/rename_my_py2SnakeCase/watch_small_files.py

import os
import sys
import time
import shutil
import logging
import threading
from pathlib import Path
from typing import Optional, List
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent

class SmallFileHandler(FileSystemEventHandler):
    """Copies small files to selected project folder."""
    
    def __init__(self, downloads_path: Path, max_size_kb: int = 400):
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
        self.logger.addHandler(handler)
        
        self.downloads_path = downloads_path
        self.max_size_bytes = max_size_kb * 1024
        self.clients_base = Path.home() / 'git' / 'clients'
        self.target_folder = None
        self.enabled = False
        
        self._pending_files = set()
        self._last_event_time = {}
        
        # Start the interactive folder selection thread
        self.selection_thread = threading.Thread(target=self._folder_selection_loop, daemon=True)
        self.selection_thread.start()
        
    def on_created(self, event):
        if not isinstance(event, FileCreatedEvent):
            return
            
        if not self.enabled or not self.target_folder:
            return
            
        self._handle_file(Path(event.src_path))
    
    def _should_process_file(self, file_path: Path) -> bool:
        """Check if file should be processed."""
        if not file_path.is_file():
            return False
            
        # Check file size
        try:
            size = file_path.stat().st_size
            return size <= self.max_size_bytes
        except Exception:
            return False
    
    def _handle_file(self, file_path: Path) -> None:
        """Copy small file to target folder."""
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
                
            # Copy to target folder
            target_path = self.target_folder / file_path.name
            
            # Handle duplicates by adding number suffix
            if target_path.exists():
                base = target_path.stem
                suffix = target_path.suffix
                counter = 1
                while target_path.exists():
                    target_path = self.target_folder / f"{base}_{counter}{suffix}"
                    counter += 1
            
            shutil.copy2(file_path, target_path)
            self.logger.info(f'Copied {file_path.name} to {self.target_folder}')
            
        except Exception as e:
            self.logger.error(f'Failed to copy {file_path}: {e}')
        finally:
            self._pending_files.discard(file_path)
            if file_path in self._last_event_time:
                del self._last_event_time[file_path]
    
    def _get_subfolders(self) -> List[Path]:
        """Get all subfolders in clients directory."""
        if not self.clients_base.exists():
            return []
            
        folders = []
        for item in self.clients_base.iterdir():
            if item.is_dir():
                folders.append(item)
        
        # Sort by name
        folders.sort(key=lambda x: x.name)
        return folders
    
    def _display_menu(self) -> None:
        """Display the folder selection menu."""
        print("\n" + "="*50)
        print("Small File Copier - Select Target Folder")
        print("="*50)
        
        if self.enabled and self.target_folder:
            print(f"Currently active: {self.target_folder}")
            print(f"Watching for files ≤ {self.max_size_bytes // 1024} KB")
        else:
            print("Currently disabled")
        
        print("\nAvailable folders:")
        
        folders = self._get_subfolders()
        
        # Create shortcuts
        shortcuts = []
        for i in range(10):
            shortcuts.append(str(i))
        for i in range(26):
            shortcuts.append(chr(ord('a') + i))
        for i in range(26):
            shortcuts.append(chr(ord('A') + i))
        
        # Display folders with shortcuts
        for i, folder in enumerate(folders):
            if i < len(shortcuts):
                print(f"[{shortcuts[i]}] {folder.name}")
            else:
                print(f"[{i}] {folder.name}")
        
        print("\nOptions:")
        print("[c] Enter custom path")
        print("[q] Disable/quit")
        print("[r] Refresh")
        print("\nChoice: ", end='', flush=True)
    
    def _folder_selection_loop(self) -> None:
        """Interactive folder selection loop."""
        while True:
            try:
                self._display_menu()
                choice = input().strip()
                
                if choice.lower() == 'q':
                    self.enabled = False
                    self.target_folder = None
                    print("Small file copier disabled")
                
                elif choice.lower() == 'r':
                    continue
                
                elif choice.lower() == 'c':
                    print("Enter custom path: ", end='', flush=True)
                    custom_path = input().strip()
                    custom_path = Path(custom_path).expanduser().resolve()
                    
                    if custom_path.exists() and custom_path.is_dir():
                        self.target_folder = custom_path
                        self.enabled = True
                        print(f"Target set to: {custom_path}")
                    else:
                        print("Invalid path")
                
                else:
                    # Try to match shortcut
                    folders = self._get_subfolders()
                    shortcuts = []
                    for i in range(10):
                        shortcuts.append(str(i))
                    for i in range(26):
                        shortcuts.append(chr(ord('a') + i))
                    for i in range(26):
                        shortcuts.append(chr(ord('A') + i))
                    
                    folder_index = None
                    if choice in shortcuts:
                        folder_index = shortcuts.index(choice)
                    else:
                        try:
                            folder_index = int(choice)
                        except ValueError:
                            pass
                    
                    if folder_index is not None and 0 <= folder_index < len(folders):
                        self.target_folder = folders[folder_index]
                        self.enabled = True
                        print(f"Target set to: {self.target_folder}")
                    else:
                        print("Invalid choice")
                
                time.sleep(2)  # Brief pause before refreshing menu
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                self.logger.error(f"Error in selection loop: {e}")
                time.sleep(1)


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Watch Downloads for small files and copy to project folders')
    parser.add_argument('--max-size', type=int, default=400, help='Maximum file size in KB (default: 400)')
    parser.add_argument('--downloads', help='Downloads folder path (default: ~/Downloads)')
    args = parser.parse_args()
    
    downloads_path = Path(args.downloads).expanduser().resolve() if args.downloads else Path.home() / 'Downloads'
    
    handler = SmallFileHandler(downloads_path, args.max_size)
    observer = Observer()
    observer.schedule(handler, str(downloads_path), recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        handler.logger.info('Stopped watching for small files')
    
    observer.join()


if __name__ == "__main__":
    main()
