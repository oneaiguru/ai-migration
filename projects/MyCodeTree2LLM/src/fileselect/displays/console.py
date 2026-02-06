from rich.console import Console
from rich.prompt import Prompt
import readchar
import os

from ..selectors.tags import TagSelector
from ..selectors.folders import FolderSelector
from ..selectors.files import FileSelector

def clear_screen():
    """Clear the terminal screen."""
    # For Windows
    if os.name == 'nt':
        os.system('cls')
    # For Unix/Linux/MacOS
    else:
        os.system('clear')

def display_help():
    """Display help information."""
    help_text = """
    File Selection Tool Help
    -----------------------
    Navigation:
    - Use number keys to toggle selections
    - 't': Enter tag mode
    - 'q': Quit without saving
    - 's': Save and quit
    - 'h': Show this help
    
    In tag mode:
    - Use number keys to toggle tags
    - ':q': Exit tag mode
    """
    print(help_text)
    input("Press Enter to continue...")