from pathlib import Path

from ..utils.keyboard import KeyboardManager

class FileSelector:
    def __init__(self, files, tags=None, selected_folders=None):
        self.files = files
        self.tags = tags if tags else []
        self.selected_folders = selected_folders if selected_folders else []
        self.selected_files = []  # Initialize as empty list
        self.keyboard = KeyboardManager()
        self.assign_keys()

    def assign_keys(self):
        """Assign keyboard mappings for tags, folders, and files"""
        # Reset keyboard mappings
        self.keyboard = KeyboardManager()

        # Allocate keys for tags
        if self.tags:
            self.keyboard.tag_keys = {str(i+1): tag for i, tag in enumerate(self.tags)}

        # Allocate keys for files
        available_files = self.get_files()
        if available_files:
            start_idx = len(self.keyboard.tag_keys) + 1
            self.keyboard.file_keys = {
                str(i+start_idx): file
                for i, file in enumerate(available_files)
            }

    def get_files(self):
        """Get all available files including those in selected folders"""
        all_files = []
        # Add files from selected folders
        for folder in self.selected_folders:
            if folder.exists():
                all_files.extend(folder.glob('*'))
        # Add directly selected files
        all_files.extend(file for file in self.files if file.exists())
        return sorted(set(all_files))  # Remove duplicates and sort

    def select_file(self, key):
        """Handle file selection/deselection based on keyboard input"""
        if not hasattr(self.keyboard, 'file_keys'):
            return False

        if key in self.keyboard.file_keys:
            file = self.keyboard.file_keys[key]
            if file in self.selected_files:
                self.selected_files.remove(file)
            else:
                self.selected_files.append(file)
            return True
        return False

    def get_selected_files(self):
        """Return list of currently selected files"""
        return self.selected_files

    def list_files(self):
        """Return sorted list of all available files"""
        return sorted(self.get_files())

    def is_selected(self, file):
        """Check if a file is currently selected"""
        return file in self.selected_files

    def clear_selection(self):
        """Clear all selected files"""
        self.selected_files = []

    def select_multiple(self, files):
        """Select multiple files at once"""
        for file in files:
            if file not in self.selected_files:
                self.selected_files.append(file)

    def toggle_all_files(self):
        """Toggle selection of all files."""
        all_files = self.get_files()
        if len(self.selected_files) == len(all_files):
            self.clear_selection()
        else:
            self.select_multiple(all_files)