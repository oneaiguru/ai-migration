from pathlib import Path
from ..utils.keyboard import KeyboardManager

class TagSelector:
    def __init__(self, tags, folders=None, files=None):
        self.tags = tags
        self.folders = folders if folders else []
        self.files = files if files else []
        self.selected_tags = []
        self.keyboard = KeyboardManager()
        self.assign_keys()

    def assign_keys(self):
        """Allocate keys for tags using the KeyboardManager."""
        # Allocate keys with sorted unique tags to ensure consistent ordering
        unique_sorted_tags = sorted(set(self.tags))
        self.keyboard.allocate_keys(unique_sorted_tags, 'tag')

    def select_tag(self, key):
        """Toggle the selection state of a tag based on the pressed key."""
        action = self.keyboard.get_action(key)
        if action and action[0] == 'tag':
            tag = action[1]
            if tag in self.selected_tags:
                self.selected_tags.remove(tag)
            else:
                self.selected_tags.append(tag)
            self.assign_keys()  # Reallocate keys if necessary

    def get_selected_tags(self):
        """Return the list of currently selected tags."""
        return self.selected_tags

    def list_tags(self):
        """Return a sorted list of all tags."""
        return sorted(self.tags)