from pathlib import Path
from collections import defaultdict

from ..utils.keyboard import KeyboardManager

class FolderSelector:
    def __init__(self, folders, tags=None):
        self.folders = folders
        self.tags = tags if tags else []
        self.selected_folders = []
        self.keyboard = KeyboardManager()
        self.assign_keys()

    def assign_keys(self):
        """Assign keyboard mappings for tags and folders"""
        # Reset keyboard mappings
        self.keyboard = KeyboardManager()

        # Allocate keys for tags
        if self.tags:
            self.keyboard.tag_keys = {str(i+1): tag for i, tag in enumerate(self.tags)}

        # Allocate keys for folders
        if self.folders:
            start_idx = len(self.keyboard.tag_keys) + 1
            self.keyboard.folder_keys = {
                str(i+start_idx): folder
                for i, folder in enumerate(sorted(self.folders))
            }

    def select_folder(self, key):
        """Handle folder selection/deselection based on keyboard input"""
        if hasattr(self.keyboard, 'folder_keys') and key in self.keyboard.folder_keys:
            folder = self.keyboard.folder_keys[key]
            if folder in self.selected_folders:
                self.selected_folders.remove(folder)
            else:
                self.selected_folders.append(folder)

    def update_keyboard(self):
        """Update keyboard mappings"""
        self.assign_keys()

    def get_selected_folders(self):
        return self.selected_folders

    def list_folders(self):
        """Return the list of available folders."""
        return sorted(self.folders)

    def get_folder_files(self, folder):
        """Get all files in a specific folder."""
        if isinstance(folder, Path) and folder.exists():
            return list(folder.glob('*'))
        return []

    def is_folder_selected(self, folder):
        """Check if a folder is selected."""
        return folder in self.selected_folders

    def toggle_folder_selection(self, folder):
        """Toggle selection state of a folder."""
        if folder in self.selected_folders:
            self.selected_folders.remove(folder)
        else:
            self.selected_folders.append(folder)