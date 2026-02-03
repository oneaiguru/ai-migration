from .base import BaseTable
from rich.table import Table
from rich import box

class TagTable(BaseTable):
    def __init__(self, root_dir=None):
        super().__init__(root_dir)

    def add_header(self):
        self.table.add_column("S", width=1)
        self.table.add_column("Key", width=1)
        self.table.add_column("Tag", style="bright_yellow")
        self.table.add_column("Files", justify="right")

    def display_tags(self, tags, selected_tags, keyboard):
        if not tags:
            return
            
        self.create_table()
        for tag in sorted(tags):
            key = keyboard.get_key('tag', tag)
            if key:
                selected_mark = '✓' if tag in selected_tags else ' '
                files_count = "N/A"  # Placeholder for tag file count
                self.add_row(
                    selected_mark,
                    key,
                    tag,
                    files_count
                )
        self.render()

    def create_table(self):
        """Initialize a new table with headers"""
        self.table = Table(box=box.SIMPLE, show_header=True)
        self.add_header()  # Ensure this method is defined to add columns