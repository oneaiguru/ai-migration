from .base import BaseTable
from rich.style import Style
from pathlib import Path
import os
import hashlib

class FileTable(BaseTable):
    def __init__(self, root_dir=None):
        super().__init__(root_dir)
        self.folder_colors = self._get_folder_colors()
        self.folder_color_map = {}

    def add_header(self):
        self.table.add_column("S", width=1)
        self.table.add_column("Key", width=1)
        self.table.add_column("File", style="cyan")
        self.table.add_column("Size", justify="right", style="dim")
        self.table.add_column("Type", style="yellow")

    def _get_folder_color(self, folder):
        """Get consistent color for a folder using cache"""
        if folder not in self.folder_color_map:
            folder_hash = hashlib.md5(str(folder).encode()).hexdigest()
            color_idx = int(folder_hash, 16) % len(self.folder_colors)
            self.folder_color_map[folder] = self.folder_colors[color_idx]
        return self.folder_color_map[folder]

    def display_files(self, files, selected_files, keyboard):
        if not files:
            return

        self.create_table()
        for file in sorted(files):
            key = keyboard.get_key('file', file)
            if key:
                selected_mark = '✓' if file in selected_files else ' '

                relative_path = os.path.relpath(file, self.root_dir)
                filename = os.path.basename(file)
                name, ext = os.path.splitext(filename)

                # Get color based on parent folder
                folder_color = self._get_folder_color(file.parent)

                self.add_row(
                    selected_mark,
                    key,
                    f"[{folder_color}]{relative_path}[/{folder_color}]",
                    self._format_size(os.path.getsize(file)),
                    ext[1:].upper() if ext else ''
                )
        self.render()

    def toggle_all_files(self):
        """Toggle selection of all files."""
        # This method should interact with FileSelectionApp to toggle all file selections
        # Since FileTable doesn't have direct access to the selection state,
        # this method can emit an event or call a callback provided by FileSelectionApp
        # For simplicity, we'll assume that FileSelectionApp handles this
        pass  # Implementation depends on the event handling system