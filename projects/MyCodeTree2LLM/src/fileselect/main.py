#!/usr/bin/env python3

from pathlib import Path
import argparse
import sys
import os
import fnmatch
import pyperclip
from .models import Selection
from .config import ProjectConfig
from .storage import SelectionStorage
from .displays.console import clear_screen, display_help
from .utils.keyboard import KeyboardManager, KeyAction
from .utils.path import PathHandler
from .utils.input_handler import InputHandler
import re

def parse_args():
    parser = argparse.ArgumentParser(description='File Selection Tool')
    parser.add_argument('--project', '-p', type=str,
                       default=os.path.expanduser('~/git/personal/lubot/'),
                       help='Project root directory')
    parser.add_argument('--pattern', type=str, default='*',
                       help='File pattern to match')
    return parser.parse_args()
class FileSelectionApp:
    def __init__(self, root_dir=None, pattern=None, input_handler: InputHandler = None):
        self.root_dir = Path(root_dir or os.getcwd())
        self.pattern = pattern or "*"

        # Core components
        self.config = ProjectConfig(self.root_dir)
        self.storage = SelectionStorage(self.root_dir)
        self.path_handler = PathHandler(self.root_dir)
        self.keyboard = KeyboardManager(input_handler=input_handler)

        # Selection state
        self.selected_tags = set()
        self.selected_folders = Selection()
        self.selected_files = set()

        # Load ignore patterns
        self.ignore_patterns = self._load_ignore_patterns()

        # Initialize components
        self._init_components()

        # Add a newline between different folders for better organization
        self.current_folder = None  # New attribute to track the current folder
        # Add a new action for toggling all selections
        self.keyboard.add_action(KeyAction.TOGGLE_ALL.value, ('action', 'toggle_all'))

        # Restore previous selections
        self.restored_files = self.storage.load_selection(type='files')
        self.restored_folders = self.storage.load_selection(type='folders')
        self.restored_tags = self.storage.load_selection(type='tags')

        # Automatically select restored items if they still exist
        if self.restored_files:
            self.selected_files = set(f for f in self.restored_files if f in self.all_files)

        if self.restored_folders:
            self.selected_folders = Selection()
            for folder in self.restored_folders:
                if folder in self.all_folders:
                    self.selected_folders.add(folder)

        if self.restored_tags:
            self.selected_tags = set(self.restored_tags) & self.all_tags
    def _sort_files(self, files):
        """Sort files by folder path and then by filename, with special handling for numeric filenames."""
        def sort_key(file_path):
            # Extract the numeric part from the filename if it starts with a number
            match = re.match(r'(\d+)', file_path.name)
            numeric_part = int(match.group(1)) if match else float('inf')  # Use inf for non-numeric names
            return (str(file_path.parent), numeric_part, str(file_path.name))

        return sorted(files, key=lambda f: (f.parent, f.name))

    def _concatenate_selected_files(self):
        """Concatenate content of selected files and copy to clipboard in a consistent order."""
        output_content = ""
        output_file = getattr(self, 'output_file', self.root_dir / 'concatenated_output.txt')

        # Sort files by folder path and then by filename
        sorted_files = self._sort_files(self.selected_files)

        # Include tree.txt if it exists, always at the beginning
        tree_file = getattr(self, 'tree_file', self.root_dir / 'tree.txt')
        if tree_file.exists():
            with open(tree_file, 'r') as tf:
                tree_content = tf.read()
                rel_tree_path = "tree.txt"  # Use generic name since it's temporary
                output_content += f"# {rel_tree_path}\n{tree_content}\n"

        # Group files by folder for organized output
        for file_path in sorted_files:
            try:
                rel_path = file_path.relative_to(self.root_dir)

                # Add a newline between different folders for better organization
                if self.current_folder != file_path.parent:
                    if self.current_folder is not None:
                        output_content += "\n"
                    self.current_folder = file_path.parent

                with open(file_path, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                    output_content += f"# {rel_path}\n{content}\n"
            except (FileNotFoundError, UnicodeDecodeError, Exception) as e:
                print(f"Warning: Could not read file {rel_path}. Error: {e}. Skipping.")

        # Save to temporary file
        with open(output_file, 'w') as outfile:
            outfile.write(output_content)

        # Copy to clipboard
        try:
            pyperclip.copy(output_content)
            print("Content copied to clipboard.")
        except pyperclip.PyperclipException:
            print("Failed to copy to clipboard. Content saved to temporary file.")

    def _load_ignore_patterns(self):
        """Load patterns from .gitignore and .selectignore files"""
        patterns = {
            'dir': set(),   # Directory patterns
            'file': set(),  # File patterns
        }

        # Default ignore patterns
        default_patterns = {
            'dir': {'.git', '__pycache__', '.pytest_cache', 'node_modules', '.venv', 'venv'},
            'file': {'*.pyc', '*.pyo', '*.pyd', '*.so', '*.dylib', '*.dll', '*.class'}
        }
        patterns['dir'].update(default_patterns['dir'])
        patterns['file'].update(default_patterns['file'])

        ignore_files = [
            self.root_dir / '.gitignore',
            self.root_dir / '.selectignore'
        ]

        for ignore_file in ignore_files:
            if ignore_file.exists():
                with open(ignore_file, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#'):
                            # Handle negation patterns (patterns starting with !)
                            if line.startswith('!'):
                                continue  # Skip negation patterns for now

                            # Handle directory-specific patterns
                            if line.endswith('/'):
                                patterns['dir'].add(line.rstrip('/'))
                            else:
                                # Convert glob patterns to regex patterns
                                patterns['file'].add(line)

                                # If pattern contains '/', add directory part to dir patterns
                                if '/' in line:
                                    dir_part = os.path.dirname(line)
                                    if dir_part:
                                        patterns['dir'].add(dir_part)

        return patterns

    def _is_ignored(self, path):
        """Check if a path should be ignored based on loaded patterns"""
        path = Path(path)
        rel_path = path.relative_to(self.root_dir)
        path_str = str(rel_path)

        # Check if any parent directory matches directory patterns
        for parent in rel_path.parents:
            if str(parent) in self.ignore_patterns['dir']:
                return True

        # Check file patterns
        for pattern in self.ignore_patterns['file']:
            if fnmatch.fnmatch(path_str, pattern):
                return True

        return False

    def _init_components(self):
        """Initialize active components based on configuration"""
        # Get all available files
        self.all_files = set(self._get_all_files())

        # Get all available folders (including root directory)
        self.all_folders = {f.parent for f in self.all_files}.union({self.root_dir})

        # Load all existing tags from storage
        self.all_tags = self.storage.list_tags()

        # Reset keyboard mappings
        self.keyboard.reset_mappings()

        # Allocate keys based on configuration
        if self.config.config.get('features', {}).get('tags', True):
            self.keyboard.allocate_keys(sorted(self.all_tags), 'tag')

        if self.config.config.get('features', {}).get('folders', True):
            self.keyboard.allocate_keys(sorted(self.all_folders), 'folder')

        if self.config.config.get('features', {}).get('files', True):
            self.keyboard.allocate_keys(sorted(self.all_files), 'file')

    def _get_all_files(self):
        """Get all files recursively excluding ignored patterns"""
        files = []

        for path in self.root_dir.rglob(self.pattern):
            if path.is_file():
                # Skip if path matches any ignore pattern
                if self._is_ignored(path):
                    continue

                # Skip hidden files unless explicitly included
                if path.name.startswith('.') and not any(
                    fnmatch.fnmatch(path.name, pattern)
                    for pattern in self.ignore_patterns['file']
                ):
                    continue

                files.append(path)

        return files

    def _get_files_in_folder(self, folder):
        """Get all files from a specified folder"""
        return {f for f in self.all_files if f.parent == folder}

    def _handle_selection(self, key):
        """Handle selection/deselection based on key press"""
        if key in {KeyAction.EXIT.value, KeyAction.SAVE.value, KeyAction.TAG_MODE.value, KeyAction.HELP.value}:
            return False

        action = self.keyboard.get_action(key)
        if not action:
            return False

        item_type, item = action

        if item_type == 'tag':
            if item in self.selected_tags:
                self.selected_tags.remove(item)
            else:
                self.selected_tags.add(item)

        elif item_type == 'folder':
            folder_files = self._get_files_in_folder(item)
            # Toggle folder selection state
            if item in self.selected_folders.selected:
                # Deselect folder and all its files
                self.selected_folders.remove(item)
                self.selected_files.difference_update(folder_files)
            else:
                # Select folder and all its files
                self.selected_folders.add(item)
                self.selected_files.update(folder_files)

        elif item_type == 'file':
            if item in self.selected_files:
                self.selected_files.remove(item)
                # Update folder selection state
                parent = item.parent
                folder_files = self._get_files_in_folder(parent)
                if parent in self.selected_folders.selected:
                    if not any(f in self.selected_files for f in folder_files):
                        self.selected_folders.remove(parent)
                    else:
                        self.selected_folders.set_partial(parent)
            else:
                self.selected_files.add(item)
                # Update folder selection state
                parent = item.parent
                folder_files = self._get_files_in_folder(parent)
                if all(f in self.selected_files for f in folder_files):
                    self.selected_folders.add(parent)
                else:
                    self.selected_folders.set_partial(parent)
        elif key == KeyAction.TOGGLE_ALL.value:
            return self.toggle_all_files()  # Updated method name
        return True

    def toggle_all_files(self):
        """Handle toggling all selections"""
        # Check if anything is selected
        has_selections = (
            len(self.selected_tags) > 0 or
            len(self.selected_folders.selected) > 0 or
            len(self.selected_files) > 0
        )

        if has_selections:
            # Clear all selections
            self.selected_tags.clear()
            self.selected_folders.clear()
            self.selected_files.clear()
        else:
            # Select everything
            self.selected_tags.update(self.all_tags)
            self.selected_folders.select_all(self.all_folders)
            self.selected_files.update(self.all_files)

        return True

    def _display_current_state(self):
        """Display current selection state"""
        clear_screen()

        # Display tags if enabled
        if self.config.config.get('features', {}).get('tags', True):
            from .displays.tags import TagTable
            tag_table = TagTable(self.root_dir)
            tag_table.display_tags(
                self.all_tags,
                self.selected_tags,
                self.keyboard
            )

        # Display folders if enabled
        if self.config.config.get('features', {}).get('folders', True):
            from .displays.folders import FolderTable
            folder_table = FolderTable(self.root_dir)
            folder_table.display_folders(
                self.all_folders,
                self.selected_folders,
                self.keyboard
            )

        # Display files if enabled
        if self.config.config.get('features', {}).get('files', True):
            from .displays.files import FileTable
            file_table = FileTable(self.root_dir)
            file_table.display_files(
                self.all_files,
                self.selected_files,
                self.keyboard
            )

        print()  # Add spacing between tables

    def run(self):
        """Main application loop"""
        try:
            while True:
                self._display_current_state()
                key = self.keyboard.read_key()

                if key is None:
                    continue  # Skip if no key was read (non-interactive mode)

                if key == KeyAction.EXIT.value:
                    if self._confirm_exit():
                        break
                elif key == KeyAction.SAVE.value:
                    self._save_selection()
                    self._concatenate_selected_files()
                    break
                elif key == KeyAction.HELP.value:
                    display_help()
                else:
                    self._handle_selection(key)

        except KeyboardInterrupt:
            print("\nOperation cancelled.")
            sys.exit(1)

    def _confirm_exit(self):
        """Confirm before exiting without saving"""
        clear_screen()
        print("Are you sure you want to exit without saving? (q/any key)")
        response = self.keyboard.read_key()
        return response and response.lower() == 'q'

    def _save_selection(self):
        """Save current selection state with consistent ordering."""
        # Sort files before saving
        sorted_files = self._sort_files(self.selected_files)
        sorted_folders = sorted(self.selected_folders.selected, key=lambda p: str(p))
        sorted_tags = sorted(self.selected_tags)

        self.storage.save_selection(sorted_files, type='files')
        self.storage.save_selection(sorted_folders, type='folders')
        if sorted_tags:
            self.storage.save_selection(sorted_tags, type='tags')

        print("Selection saved.")

def main():
    args = parse_args()
    app = FileSelectionApp(args.project, args.pattern)
    app.run()

if __name__ == '__main__':
    main()
