from .base import BaseTable
from rich.style import Style
import os

class FolderTable(BaseTable):
    def __init__(self, root_dir=None):
        super().__init__(root_dir)

    def add_header(self):
        self.table.add_column("S", width=2)  # Increased width for partial selection
        self.table.add_column("Key", width=3)
        self.table.add_column("Folder", style="bright_blue")
        self.table.add_column("Files", justify="right")
        self.table.add_column("Size", justify="right", style="dim")

    def display_folders(self, folders, selected_folders, keyboard):
        if not folders:
            return

        self.create_table()
        folder_colors = self._get_folder_colors()

        for folder in sorted(folders):
            key = keyboard.get_key('folder', folder)
            if key:
                if folder == self.root_dir:
                    relative_folder = "."
                    color = "bright_blue"
                else:
                    color = folder_colors[hash(str(folder)) % len(folder_colors)]
                    relative_folder = os.path.relpath(folder, self.root_dir)

                # Get selection state
                if folder in selected_folders.selected:
                    selected_mark = '✓'
                elif folder in selected_folders.partial:
                    selected_mark = '◐'
                else:
                    selected_mark = ' '

                try:
                    files = list(folder.glob('*'))
                    total_size = sum(f.stat().st_size for f in files if f.is_file())
                except Exception:
                    files = []
                    total_size = 0

                self.add_row(
                    selected_mark,
                    key,
                    f"[{color}]{relative_folder}[/{color}]",
                    str(len(files)),
                    self._format_size(total_size)
                )
        self.render()