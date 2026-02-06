# src/fileselect/utils/input_handler.py

import sys
from readchar import readkey

class InputHandler:
    """Handles keyboard input, abstracting the underlying input mechanism."""
    
    def read_key(self) -> str:
        """Reads a single key from the keyboard.

        Returns:
            str: The key pressed by the user, or None if input is unavailable.
        """
        try:
            return readkey()
        except OSError:
            return None  # Return None when input cannot be read
