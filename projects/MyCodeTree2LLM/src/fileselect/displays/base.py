from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich import box

class BaseDisplay:
    def __init__(self, root_dir):
        self.root_dir = Path(root_dir)
        self.console = Console()

    def create_table(self, title):
        """Create a base table with standard styling"""
        table = Table(
            title=title,
            box=box.SIMPLE,
            show_header=True,
            header_style="bold white",
            title_style="bold blue"
        )
        return table

    def get_relative_path(self, path):
        """Convert absolute path to relative path from root"""
        return path.relative_to(self.root_dir)

    def _get_folder_colors(self):
        """Return a list of distinct colors for folders"""
        return [
            "bright_red", "bright_green", "bright_yellow", "bright_blue",
            "bright_magenta", "bright_cyan", "bright_white", "orange1",
            "deep_sky_blue1", "spring_green1", "gold1", "deep_pink1",
            "light_sea_green", "purple", "khaki1", "medium_violet_red"
        ]

class BaseTable(BaseDisplay):
    def __init__(self, root_dir=None):
        super().__init__(root_dir)
        self.table = None

    def create_table(self):
        """Initialize a new table with headers"""
        self.table = Table(box=box.SIMPLE, show_header=True)
        self.add_header()

    def add_header(self):
        """Abstract method to be implemented by subclasses"""
        raise NotImplementedError("Subclasses must implement add_header()")

    def add_row(self, *args):
        """Add a row to the table"""
        if not self.table:
            self.create_table()
        self.table.add_row(*args)

    def render(self):
        """Render the table to console"""
        if self.table and hasattr(self.table, 'rows') and len(self.table.rows) > 0:
            self.console.print(self.table)
            print()  # Add newline after table

    def _format_size(self, size):
        """Format file size in human-readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024:
                return f"{size:.1f}{unit}"
            size /= 1024
        return f"{size:.1f}PB"