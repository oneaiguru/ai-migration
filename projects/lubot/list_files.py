#!/usr/bin/env python3

import os
import sys
import fnmatch
from colorama import init
from termcolor import colored
from rich.console import Console
from rich.tree import Tree

# Initialize colorama
init()

def load_ignore_patterns(ignore_file):
    """Load ignore patterns from a file."""
    patterns = []
    if os.path.exists(ignore_file):
        with open(ignore_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    patterns.append(line)
    return patterns

def is_ignored(path, patterns):
    """Check if the path matches any of the ignore patterns."""
    for pattern in patterns:
        if fnmatch.fnmatch(path, pattern):
            return True
    return False

def list_files(root_dir):
    """List files in root_dir, ignoring patterns from .gitignore and .treeignore."""
    gitignore = os.path.join(root_dir, '.gitignore')
    treeignore = os.path.join(root_dir, '.treeignore')
    ignore_patterns = load_ignore_patterns(gitignore) + load_ignore_patterns(treeignore)

    tree = Tree(f"[bold blue]{root_dir}[/bold blue]")
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Compute relative path
        rel_path = os.path.relpath(dirpath, root_dir)
        if rel_path == ".":
            current_tree = tree
        else:
            # Navigate the tree to the current directory
            parts = rel_path.split(os.sep)
            current_tree = tree
            for part in parts:
                current_tree = current_tree.add(part)
        
        # Filter directories
        dirnames[:] = [d for d in dirnames if not is_ignored(os.path.join(rel_path, d), ignore_patterns)]
        
        # Filter and add files
        for file in filenames:
            file_rel_path = os.path.join(rel_path, file)
            if not is_ignored(file_rel_path, ignore_patterns):
                # Apply color based on file type
                if file.endswith('.py'):
                    color = 'green'
                elif file.endswith('.md'):
                    color = 'cyan'
                elif file.endswith('.ini'):
                    color = 'yellow'
                else:
                    color = 'white'
                current_tree.add(colored(file, color))
    
    console = Console()
    console.print(tree)

def main():
    if len(sys.argv) != 2:
        print("Usage: python list_files.py <directory>")
        sys.exit(1)
    
    root_dir = sys.argv[1]
    if not os.path.isdir(root_dir):
        print(f"Error: {root_dir} is not a directory.")
        sys.exit(1)
    
    list_files(root_dir)

if __name__ == "__main__":
    main()
