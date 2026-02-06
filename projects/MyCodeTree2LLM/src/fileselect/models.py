from pathlib import Path
import os
import sys

class Selection:
    """Handles selection state including partial selections"""
    def __init__(self):
        self.selected = set()
        self.partial = set()

    def add(self, item):
        self.selected.add(item)
        self.partial.discard(item)

    def remove(self, item):
        self.selected.discard(item)
        self.partial.discard(item)

    def set_partial(self, item):
        self.selected.discard(item)
        self.partial.add(item)

    def is_selected(self, item):
        return item in self.selected

    def is_partial(self, item):
        return item in self.partial

    def clear(self):
        """Clear all selections"""
        self.selected.clear()
        self.partial.clear()

    def select_all(self, items):
        """Select all items"""
        self.selected.update(items)
        self.partial.clear()