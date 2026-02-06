from .input_handler import InputHandler
from enum import Enum
import string
from readchar import readkey

class KeyAction(Enum):
    EXIT = 'q'
    SAVE = 's'
    TAG_MODE = 't'
    HELP = 'h'
    TOGGLE_ALL = '='

class KeyboardManager:
    def __init__(self, input_handler: InputHandler = None):
        """Initializes the keyboard manager.

        Args:
            input_handler (InputHandler): An instance of InputHandler for reading input.
        """
        self.input_handler = input_handler or InputHandler()
        self.command_keys = {action.value for action in KeyAction}

        # Available keys in priority order - will be divided between tags, folders, files
        self.available_keys = [
            key for key in (
                list(string.digits) +  # 0-9
                list(string.ascii_lowercase) +  # a-z
                list(string.ascii_uppercase) +  # A-Z
                list("!@#$%^&*()")  # special chars
            )
            if key not in self.command_keys and key.lower() not in self.command_keys
        ]

        # Initialize empty mappings
        self.key_map = {}  # key -> (type, item)
        self.reverse_map = {}  # (type, item) -> key
        self.current_key_index = 0

        # Initialize tag_keys to avoid AttributeError
        self.tag_keys = {}
        self.folder_keys = {}
        self.file_keys = {}

    def reset_mappings(self):
        """Reset all key mappings"""
        self.key_map = {}
        self.reverse_map = {}
        self.current_key_index = 0
        self.tag_keys = {}
        self.folder_keys = {}
        self.file_keys = {}

    def allocate_keys(self, items, item_type):
        """Allocate next available keys to items of given type

        Args:
            items (iterable): Items to allocate keys for.
            item_type (str): Type of items ('tag', 'folder', 'file').

        Returns:
            dict: Mapping of items to their assigned keys.
        """
        allocated = {}
        for item in sorted(items):  # Sort for consistent allocation
            if self.current_key_index >= len(self.available_keys):
                break  # No more keys available

            key = self.available_keys[self.current_key_index]

            # Ensure that the key is not already mapped
            if key not in self.key_map:
                self.key_map[key] = (item_type, item)
                self.reverse_map[(item_type, item)] = key
                allocated[item] = key
                self.current_key_index += 1

        if item_type == 'tag':
            self.tag_keys.update(allocated)
        elif item_type == 'folder':
            self.folder_keys.update(allocated)
        elif item_type == 'file':
            self.file_keys.update(allocated)

        return allocated

    def get_action(self, key):
        """Get the action associated with a key

        Args:
            key (str): The key pressed by the user.

        Returns:
            tuple or None: A tuple (type, item) if key is mapped, else None.
        """
        if key == KeyAction.TOGGLE_ALL.value:
            return ('action', 'toggle_all')
        return self.key_map.get(key)

    def get_key(self, item_type, item):
        """Get the key assigned to an item

        Args:
            item_type (str): Type of the item ('tag', 'folder', 'file').
            item: The item for which to get the key.

        Returns:
            str or None: The key assigned to the item, or None if not assigned.
        """
        return self.reverse_map.get((item_type, item))

    def read_key(self):
        """Read a single keypress using the InputHandler."""
        if self.input_handler:
            return self.input_handler.read_key()
        return None

    def is_action_key(self, key):
        """Check if key is a special action key

        Args:
            key (str): The key to check.

        Returns:
            bool: True if key is a special action key, False otherwise.
        """
        return key in self.command_keys or key.lower() in self.command_keys

    def is_mapped_key(self, key):
        """Check if key is currently mapped to an item

        Args:
            key (str): The key to check.

        Returns:
            bool: True if key is mapped to an item, False otherwise.
        """
        return key in self.key_map

    def add_action(self, key, action):
        """Add a new action to the keyboard manager.

        Args:
            key (str): The key to associate with the action.
            action (tuple): A tuple representing the action, e.g., ('type', item).
        """
        self.command_keys.add(key)
        self.key_map[key] = action
        self.reverse_map[action] = key

    def _handle_selection(self, key):
        """Handle selection based on key press."""
        if key == KeyAction.TOGGLE_ALL.value:
            return ('toggle_all', None)
            
        action = self.get_action(key)
        if action:
            return action
        return None

    def handle_key_press(self):
        """Handle a key press event."""
        key = self.read_key()
        if key:
            # Check for toggle all action first
            if key == KeyAction.TOGGLE_ALL.value:
                return ('action', 'toggle_all')
            return self.get_action(key)
        return None