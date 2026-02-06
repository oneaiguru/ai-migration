from rich import box
from rich.table import Table
from rich.console import Console
import hashlib

class BaseTable:
    def __init__(self):
        self.console = Console()

    def create_table(self, title: str = "") -> Table:
        """Create a table with an optional title"""
        return Table(title=title, box=box.SIMPLE)

class FileAndFolderDisplay(BaseTable):
    def __init__(self, root_dir):
        super().__init__()
        self.root_dir = root_dir
        self.folder_colors = self._get_folder_colors()
        self.folder_color_map = {}

    def _get_folder_colors(self):
        """Define folder colors"""
        return ["red", "green", "blue", "yellow", "magenta", "cyan", "bright_red", "bright_green", 
                "bright_blue", "bright_yellow", "bright_magenta", "bright_cyan"]

    def _get_folder_color(self, folder):
        """Get consistent color for a folder using cache"""
        if folder not in self.folder_color_map:
            folder_hash = hashlib.md5(str(folder.name).encode()).hexdigest()
            color_idx = int(folder_hash, 16) % len(self.folder_colors)
            self.folder_color_map[folder] = self.folder_colors[color_idx]
        return self.folder_color_map[folder]

    def _get_file_color(self, file_path):
        """Determine color based on file type and parent folder"""
        if file_path.is_dir():
            return self._get_folder_color(file_path)
            
        # Use parent folder's color with reduced intensity for files
        parent_color = self._get_folder_color(file_path.parent)
        return f"dim {parent_color}"

    def display_files_and_folders(self, files, folders, selected_files, selected_folders, keyboard):
        """Display files and folders in a single table with selection status"""
        self.table = self.create_table(title="Files and Folders")
        self.table.add_column("Key", style="bright_yellow", justify="center")
        self.table.add_column("Type", style="cyan", justify="center")
        self.table.add_column("Path", style="white")
        self.table.add_column("Status", justify="center")

        for folder in folders:
            key = keyboard.get_key('folder', folder) or "N/A"
            folder_color = self._get_folder_color(folder)
            rel_path = self.get_relative_path(folder)
            status = ""
            if folder in selected_folders.selected:
                status = "[green]✓[/green]"
            elif folder in selected_folders.partial:
                status = "[yellow]◐[/yellow]"
            self.table.add_row(
                key,
                "📁",
                f"[{folder_color}]{rel_path}[/{folder_color}]",
                status
            )

        for file in files:
            key = keyboard.get_key('file', file) or "N/A"
            file_color = self._get_file_color(file)
            rel_path = self.get_relative_path(file)
            status = "[green]✓[/green]" if file in selected_files else ""
            self.table.add_row(
                key,
                "📄",
                f"[{file_color}]{rel_path}[/{file_color}]",
                status
            )

        self.console.print(self.table)

    def get_relative_path(self, path):
        """Get path relative to root directory"""
        try:
            return path.relative_to(self.root_dir)
        except ValueError:
            return path