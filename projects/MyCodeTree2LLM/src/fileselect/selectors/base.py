from pathlib import Path

class BaseSelector:
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.selection = None
        self.key_mapping = None

    def handle_input(self, key):
        # Skip command keys
        if key in {'q', 's', 't', 'h'}:
            return False
            
        item = self.key_mapping.get_item(key)
        if item:
            if isinstance(item, Path) and item.is_dir():
                self.toggle_folder_files(item)
            else:
                self.toggle_selection(item)
            return True
        return False

    def toggle_selection(self, item):
        if self.selection:
            self.selection.toggle(item)

    def toggle_folder_files(self, folder):
        files = self.get_folder_files(folder)
        if not files:
            return
            
        all_selected = all(self.selection.is_selected(f) for f in files)
        
        if all_selected:
            self.selection.remove_all(files)
        else:
            self.selection.add_all(files)

    def get_folder_files(self, folder):
        return [f for f in self.list_files() if f.parent == folder]
        
    def get_selection(self):
        return self.selection.get_selected() if self.selection else []