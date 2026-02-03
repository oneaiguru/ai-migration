#!/usr/bin/env python3

import os
import sys
import fnmatch
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
import readchar
import pyperclip
import argparse
from rich.style import Style
from collections import defaultdict
import json
from pathlib import Path
from src.fileselect.utils.input_handler import InputHandler
from src.fileselect.utils.keyboard import KeyboardManager, KeyAction

class TagManager:
    def __init__(self, root_dir):
        self.root_dir = root_dir
        self.tags_file = os.path.join(root_dir, '.file_tags.json')
        self.tags = self._load_tags()

    def _load_tags(self):
        """Load tags from the tags file."""
        if os.path.exists(self.tags_file):
            try:
                with open(self.tags_file, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return {}
        return {}

    def _save_tags(self):
        """Save tags to the tags file."""
        with open(self.tags_file, 'w') as f:
            json.dump(self.tags, f, indent=2)

    def save_selection(self, tag_name, selected_files):
        """Save a set of selected files under a tag name."""
        # Convert absolute paths to relative
        relative_paths = [os.path.relpath(f, self.root_dir) for f in selected_files]
        self.tags[tag_name] = relative_paths
        self._save_tags()

    def get_selection(self, tag_name):
        """Get the set of files associated with a tag name."""
        if tag_name not in self.tags:
            return None
        # Convert relative paths back to absolute
        return [os.path.join(self.root_dir, f) for f in self.tags[tag_name]]

    def delete_tag(self, tag_name):
        """Delete a tag."""
        if tag_name in self.tags:
            del self.tags[tag_name]
            self._save_tags()
            return True
        return False

    def list_tags(self):
        """Return a dictionary of all existing tag names with their file counts."""
        return {tag: len(files) for tag, files in self.tags.items()}

def get_tag_command():
    """Get tag command from user input."""
    console = Console()
    console.print("\n[yellow]Tag Commands:[/yellow]")
    console.print("  [cyan]:s <tag>[/cyan] - Save current selection as <tag>")
    console.print("  [cyan]:l <tag>[/cyan] - Load selection from <tag>")
    console.print("  [cyan]:d <tag>[/cyan] - Delete <tag>")
    console.print("  [cyan]:t[/cyan] - List all tags")
    console.print("  [cyan]:q[/cyan] - Return to file selection")

    cmd = Prompt.ask("\nEnter command").strip()
    return cmd

def handle_tag_commands(cmd, tag_manager, selected, files):
    """Handle tag-related commands."""
    if not cmd:
        return selected

    parts = cmd.split(maxsplit=1)
    command = parts[0]
    tag_name = parts[1] if len(parts) > 1 else None

    if command == ':s' and tag_name:
        # Save current selection
        selected_files = [files[idx] for idx in selected]
        tag_manager.save_selection(tag_name, selected_files)
        print(f"\nSelection saved as '{tag_name}'")

    elif command == ':l' and tag_name:
        # Load selection
        tagged_files = tag_manager.get_selection(tag_name)
        if tagged_files is None:
            print(f"\nTag '{tag_name}' not found")
        else:
            # Convert loaded files back to indices
            selected = {idx for idx, f in enumerate(files) if f in tagged_files}
            print(f"\nLoaded selection from '{tag_name}'")

    elif command == ':d' and tag_name:
        # Delete tag
        if tag_manager.delete_tag(tag_name):
            print(f"\nDeleted tag '{tag_name}'")
        else:
            print(f"\nTag '{tag_name}' not found")

    elif command == ':t':
        # List all tags
        tags = tag_manager.list_tags()
        if tags:
            console = Console()
            table = Table(show_header=True, header_style="bold magenta")
            table.add_column("Tag", style="cyan")
            table.add_column("Files", justify="right")

            for tag, count in sorted(tags.items()):
                table.add_row(tag, str(count))

            console.print("\nSaved Tags:")
            console.print(table)
        else:
            print("\nNo saved tags")

    return selected

def load_ignore_patterns(ignore_files):
    """Load ignore patterns from a list of files."""
    patterns = []
    for ignore_file in ignore_files:
        if os.path.exists(ignore_file):
            with open(ignore_file, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#'):
                        patterns.append(line)
    return patterns

def is_ignored(path, patterns, root_dir):
    """Check if the path matches any of the ignore patterns."""
    relative_path = os.path.relpath(path, root_dir)
    path_parts = relative_path.split(os.sep)

    for pattern in patterns:
        if pattern.endswith('/'):
            # Directory pattern
            dir_pattern = pattern.rstrip('/')
            if dir_pattern in path_parts:
                return True
        else:
            # File pattern with possible wildcards
            if fnmatch.fnmatch(os.path.basename(path), pattern):
                return True
    return False

def list_files(root_dir, ignore_files):
    """List files in root_dir, ignoring patterns from specified ignore files."""
    ignore_patterns = load_ignore_patterns(ignore_files)

    files = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filter directories in-place
        dirnames[:] = [d for d in dirnames if not is_ignored(os.path.join(dirpath, d), ignore_patterns, root_dir)]

        # Filter and add files
        for file in filenames:
            file_abs_path = os.path.join(dirpath, file)
            if not is_ignored(file_abs_path, ignore_patterns, root_dir):
                files.append(file_abs_path)
    return files

def get_file_color(file_path):
    """Determine the color for the file path based on its type."""
    if os.path.isdir(file_path):
        return "blue"
    elif file_path.endswith('.py'):
        return "white"
    else:
        # Generate a shade of grey based on the file extension
        ext = os.path.splitext(file_path)[1]
        hash_value = hash(ext) % 200  # Using modulo to limit the range
        return f"rgb({hash_value},{hash_value},{hash_value})"

def get_folder_colors():
    """Return a list of 16 distinct, readable colors for use on a black background."""
    return [
        "bright_red", "bright_green", "bright_yellow", "bright_blue",
        "bright_magenta", "bright_cyan", "bright_white", "orange1",
        "deep_sky_blue1", "spring_green1", "gold1", "deep_pink1",
        "light_sea_green", "purple", "khaki1", "medium_violet_red"
    ]

def get_folder_structure(files):
    """Organize files by folder and determine folder priorities."""
    folders = defaultdict(list)
    folder_priorities = {}

    for file in files:
        folder = os.path.dirname(file)
        folders[folder].append(file)

        # Check if folder contains only __init__.py
        has_only_init = all(os.path.basename(f) == '__init__.py' for f in folders[folder])
        folder_priorities[folder] = 0 if has_only_init else 1

    # Sort folders by priority (non-init folders first) and then alphabetically
    sorted_folders = sorted(folders.keys(),
                          key=lambda x: (-folder_priorities[x], x.lower()))

    return folders, sorted_folders

def assign_keys(num_files, key_sequence, folders):
    """Assign unique keys from a predefined sequence to folders and files."""
    folder_keys = {}
    file_keys = {}
    current_key = 0

    # First assign keys to folders
    for folder in folders:
        if current_key < len(key_sequence):
            folder_keys[folder] = key_sequence[current_key]
            current_key += 1

    # Then assign remaining keys to files
    if num_files > (len(key_sequence) - len(folder_keys)):
        print(f"Too many files! Showing only the first {len(key_sequence) - len(folder_keys)} files.")
        return folder_keys, {idx: key_sequence[idx + len(folder_keys)]
                           for idx in range(len(key_sequence) - len(folder_keys))}, True

    file_keys = {idx: key_sequence[idx + len(folder_keys)] for idx in range(num_files)}
    return folder_keys, file_keys, False

def get_relative_path(path, root_dir):
    """Convert absolute path to relative path from root directory."""
    return os.path.relpath(path, root_dir)

def display_files(files, selected, file_key_mapping, folder_key_mapping, folders, sorted_folders, root_dir):
    """Display folders and files with their assigned keys and selection status."""
    console = Console()
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("S", width=1)
    table.add_column("Key", width=1)
    table.add_column("Path", style="cyan")
    table.add_column("Extension", style="yellow")

    folder_colors = get_folder_colors()

    # First display folders
    for i, folder in enumerate(sorted_folders):
        folder_key = folder_key_mapping.get(folder, '?')
        folder_color = folder_colors[i % len(folder_colors)]
        relative_folder = get_relative_path(folder, root_dir)

        # Check if all files in folder are selected
        folder_files = folders[folder]
        folder_files_indices = [idx for idx, f in enumerate(files) if os.path.dirname(f) == folder]
        all_selected = all(idx in selected for idx in folder_files_indices)
        some_selected = any(idx in selected for idx in folder_files_indices)

        if all_selected:
            selected_mark = '[bright_white]✔[/bright_white]'
        elif some_selected:
            selected_mark = '[bright_white]◐[/bright_white]'
        else:
            selected_mark = ''

        table.add_row(
            selected_mark,
            folder_key,
            f"[{folder_color}]{relative_folder}[/{folder_color}]",
            "[DIR]"
        )

    # Then display all files
    for idx, file in enumerate(files):
        if idx in file_key_mapping:
            key = file_key_mapping[idx]
            selected_mark = '[bright_white]✔[/bright_white]' if idx in selected else ''

            relative_path = get_relative_path(file, root_dir)
            filename = os.path.basename(file)
            name, ext = os.path.splitext(filename)

            table.add_row(
                selected_mark,
                key,
                f"  {name}",
                ext
            )

    console.clear()
    console.print(table)

def concatenate_selected_files(selected, files, root_dir):
    """Concatenate content of selected files and tree.txt into a single output file and copy to clipboard."""
    output_content = ""
    output_file = os.path.join(root_dir, 'concatenated_output.txt')

    with open(output_file, 'w') as outfile:
        # Include tree.txt if it exists
        tree_file = os.path.join(root_dir, 'tree.txt')
        if os.path.exists(tree_file):
            with open(tree_file, 'r') as tf:
                tree_content = tf.read()
                rel_tree_path = get_relative_path(tree_file, root_dir)
                output_content += f"# {rel_tree_path}\n{tree_content}\n"
                outfile.write(f"# {rel_tree_path}\n{tree_content}\n")
        else:
            print(f"Warning: tree.txt does not exist and will not be included.")

        # Append selected files
        for idx in selected:
            file_path = files[idx]
            rel_path = get_relative_path(file_path, root_dir)
            try:
                with open(file_path, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                    output_content += f"# {rel_path}\n{content}\n"
                    outfile.write(f"# {rel_path}\n{content}\n")
            except FileNotFoundError:
                print(f"Warning: Could not find file {rel_path}. Skipping.")
            except UnicodeDecodeError:
                print(f"Warning: Could not decode file {rel_path}. Skipping.")
            except Exception as e:
                print(f"Warning: Could not read file {rel_path}. Error: {e}. Skipping.")

    # Copy the concatenated content to the clipboard
    try:
        pyperclip.copy(output_content)
        rel_output_path = get_relative_path(output_file, root_dir)
        print(f"Files concatenated into {rel_output_path} and copied to clipboard.")
    except pyperclip.PyperclipException:
        print(f"Files concatenated into {rel_output_path}. Failed to copy to clipboard.")

def get_key_mappings(folder_keys, file_keys):
    """Get reverse mappings for both folder and file keys."""
    folder_to_key = {v: k for k, v in folder_keys.items()}
    file_to_key = {v: k for k, v in file_keys.items()}
    return folder_to_key, file_to_key

def toggle_folder_files(folder, folders, selected, files):
    """Toggle all files in a folder."""
    folder_files_indices = [idx for idx, f in enumerate(files) if os.path.dirname(f) == folder]
    all_selected = all(idx in selected for idx in folder_files_indices)

    if all_selected:
        # Deselect all files in folder
        for idx in folder_files_indices:
            selected.discard(idx)
    else:
        # Select all files in folder
        for idx in folder_files_indices:
            selected.add(idx)

def interactive_file_selection(files, file_key_mapping, folder_key_mapping, root_dir):
    """Modified interactive selection to include tag support."""
    selected = set()
    folders, sorted_folders = get_folder_structure(files)
    folder_to_key, file_to_key = get_key_mappings(folder_key_mapping, file_key_mapping)
    tag_manager = TagManager(root_dir)

    # Initialize KeyboardManager with InputHandler
    input_handler = InputHandler()
    keyboard_manager = KeyboardManager(input_handler=input_handler)

    while True:
        display_files(files, selected, file_key_mapping, folder_key_mapping, folders, sorted_folders, root_dir)
        key = keyboard_manager.read_key()

        if key is None:
            continue  # Skip if no key was read (non-interactive mode)

        if key == '\n':  # Save and exit on Enter key
            break
        elif key == ':':  # Enter tag command mode
            cmd = get_tag_command()
            if cmd == ':q':
                continue
            selected = handle_tag_commands(cmd, tag_manager, selected, files)
        elif key in folder_to_key:
            # Toggle folder selection
            folder = folder_to_key[key]
            toggle_folder_files(folder, folders, selected, files)
        elif key in file_to_key:
            # Toggle individual file selection
            idx = file_to_key[key]
            if idx in selected:
                selected.remove(idx)
            else:
                selected.add(idx)

    return selected

def main():
    parser = argparse.ArgumentParser(description="Select files from a directory.")
    parser.add_argument("directory", help="The directory to select files from.")
    args = parser.parse_args()

    root_dir = args.directory
    if not os.path.isdir(root_dir):
        print(f"Error: {root_dir} is not a directory.")
        sys.exit(1)

    gitignore = os.path.join(root_dir, '.gitignore')
    selectignore = os.path.join(root_dir, '.selectignore')
    ignore_files = [gitignore, selectignore]

    files = list_files(root_dir, ignore_files)
    if not files:
        print("No files to select.")
        sys.exit(0)

    # Modified key sequence to start with numbers
    key_sequence = list("234567890aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStT!@#$%^&*()")

    folders, sorted_folders = get_folder_structure(files)
    folder_key_mapping, file_key_mapping, paging_required = assign_keys(len(files), key_sequence, sorted_folders)

    if paging_required:
        print("Paging required due to too many files. Consider refining your ignore patterns.")

    selected = interactive_file_selection(files, file_key_mapping, folder_key_mapping, root_dir)

    print("\nSelected Files:")
    for idx in selected:
        print(f"- {files[idx]}")

    concatenate_selected_files(selected, files, root_dir)

if __name__ == "__main__":
    main()