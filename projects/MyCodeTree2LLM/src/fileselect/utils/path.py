from pathlib import Path
import os
import re

class PathHandler:
    def __init__(self, root_dir):
        if not root_dir.exists():  # Check if the directory exists
            raise ValueError("Directory does not exist")
        if not root_dir.is_dir():  # Check if the path is a directory
            raise ValueError("Path is not a directory")
        self.root_dir = Path(root_dir)  # Convert to Path object

    def get_relative_path(self, path):
        """Convert absolute path to relative path from root directory."""
        return Path(path).relative_to(self.root_dir)

    def get_absolute_path(self, path):
        """Convert relative path to absolute path from root directory."""
        return self.root_dir / path

    def list_files(self, pattern="*"):
        """
        List all files matching pattern recursively from root_dir.
        
        Args:
            pattern: glob pattern to match files against
            
        Returns:
            list of Path objects
        """
        return sorted(
            self.root_dir.rglob(pattern),
            key=lambda p: (p.parent.as_posix(), p.name)
        )

    def group_by_folders(self, files):
        """
        Group files by their parent folders.
        
        Args:
            files: list of Path objects
            
        Returns:
            dict: {folder_path: [file_paths]}
        """
        folders = {}
        for file in files:
            if file.is_file():
                parent = file.parent
                if parent not in folders:
                    folders[parent] = []
                folders[parent].append(file)
        return folders

    def is_hidden(self, path):
        """Check if a path is hidden (starts with .)"""
        return path.name.startswith('.')

    def filter_paths(self, paths, exclude_patterns=None, include_hidden=False):
        """
        Filter paths based on patterns and hidden status.
        
        Args:
            paths: list of Path objects
            exclude_patterns: list of glob patterns to exclude
            include_hidden: whether to include hidden files/folders
            
        Returns:
            filtered list of Path objects
        """
        if exclude_patterns is None:
            exclude_patterns = []
            
        def should_include(path):
            if not include_hidden and self.is_hidden(path):
                return False
            return not any(path.match(pattern) for pattern in exclude_patterns)
            
        return [p for p in paths if should_include(p)]

    def sort_paths(self, paths):
        """Sort paths hierarchically and alphanumerically, treating numeric prefixes correctly."""
        def sort_key(path):
            # Extract numeric parts for sorting
            parts = re.split(r'(\d+)', path.name)  # Split on digits
            return (path.parent.as_posix(), [int(part) if part.isdigit() else part for part in parts])

        return sorted(paths, key=sort_key)

    def group_and_sort_paths(self, paths):
        """Group paths by folder and sort within groups"""
        grouped = {}
        for path in self.sort_paths(paths):
            parent = path.parent
            if parent not in grouped:
                grouped[parent] = []
            grouped[parent].append(path)
        return {k: sorted(v, key=lambda p: p.name.lower()) 
                for k in sorted(grouped.keys()) 
                for v in [grouped[k]]}