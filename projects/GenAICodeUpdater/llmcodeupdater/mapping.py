# llmcodeupdater/mapping.py
import os
from typing import List, Tuple, Dict, Optional
import logging
from pathlib import Path
import difflib
from termcolor import colored
from dataclasses import dataclass
import re

logger = logging.getLogger(__name__)

@dataclass
class FileUpdateInfo:
    """Information about file updates"""
    old_path: str
    new_path: str
    old_size: int
    new_size: int
    old_lines: int
    new_lines: int
    percent_change: float
    diff: str
    is_new_file: bool = False

def find_file(project_root: str, filename: str) -> Tuple[str, bool]:
    """
    Searches for a file within the project directory or determines where to create it.
    Matches by relative path if directory structure is provided; otherwise, searches by basename.
    
    Args:
        project_root (str): The root directory of the project
        filename (str): Name of the file to find (can include path)
        
    Returns:
        Tuple[str, bool]: (file path, whether file exists)
    """
    try:
        # Handle paths with directories (nested structure in filename)
        if '/' in filename or '\\' in filename:
            full_path = os.path.join(project_root, filename)
            return full_path, os.path.exists(full_path)
        
        # Special handling for __init__.py files - require exact path match
        if filename == '__init__.py':
            full_path = os.path.join(project_root, filename)
            return full_path, os.path.exists(full_path)

        # For other files, search by basename
        target_name = os.path.basename(filename)
        matches = []
        
        for root, _, files in os.walk(project_root):
            if target_name in files:
                matches.append(os.path.join(root, target_name))
                
        # If we found matches, return the first one as a default
        if matches:
            return matches[0], True
            
        # If no match found, prepare to create the file in project root or specified path
        return os.path.join(project_root, target_name), False

    except Exception as e:
        logger.error(f"Error searching for file '{filename}': {str(e)}")
        return os.path.join(project_root, filename), False

def preserve_content(old_content: str, new_content: str, file_type: str) -> str:
    """
    Preserve certain parts of the old content based on file type.
    For Markdown, this might include front matter or specific sections.
    
    Args:
        old_content (str): Original file content
        new_content (str): New file content
        file_type (str): Type of the file (e.g., 'markdown', 'python')
        
    Returns:
        str: Modified content with preserved sections if needed
    """
    if file_type == "python":
        # Preserve imports
        if re.search(r'^(?:import|from)\s+\w+', new_content, re.MULTILINE):
            return new_content
        import_lines = [line for line in old_content.splitlines() if re.match(r'^(?:import|from)\s+\w+', line)]
        if import_lines:
            preserved_imports = '\n'.join(import_lines)
            return f"{preserved_imports}\n\n{new_content}"
    elif file_type == "markdown":
        # Preserve YAML front matter if present
        front_matter_pattern = re.compile(r'^---\n(.*?)\n---\n', re.DOTALL)
        match = front_matter_pattern.match(old_content)
        if match:
            front_matter = match.group(0)
            return f"{front_matter}\n{new_content}"
    # Add more file types as needed
    return new_content

def get_change_color(percent: float, is_new: bool = False) -> str:
    """Get color based on percentage change or new file status."""
    if is_new:
        return 'cyan'
    if percent <= 70:
        return 'red'
    elif percent <= 80:
        return 'yellow'
    elif percent <= 90:
        return 'white'
    elif percent <= 110:
        return 'green'
    elif percent <= 120:
        return 'magenta'
    elif percent <= 140:
        return 'magenta'
    else:
        return 'blue'

def format_size_bar(percent: float, is_new: bool = False, width: int = 40) -> str:
    """Create a visual representation of size change or new file."""
    if is_new:
        bar = '+' * width
        return colored(f'[{bar}]', 'cyan')
        
    filled = int((min(percent, 200) / 200) * width)
    bar = '=' * filled + ' ' * (width - filled)
    color = get_change_color(percent)
    return colored(f'[{bar}]', color)

def create_diff(old_content: str, new_content: str, is_new: bool = False) -> str:
    """Create a colored diff between old and new content."""
    if is_new:
        # For new files, show all content as added
        return colored(new_content, 'cyan')
        
    diff = difflib.unified_diff(
        old_content.splitlines(keepends=True),
        new_content.splitlines(keepends=True),
        lineterm=''
    )
    
    result = []
    for line in diff:
        if line.startswith('+') and not line.startswith('+++'):
            result.append(colored(line, 'green'))
        elif line.startswith('-') and not line.startswith('---'):
            result.append(colored(line, 'red'))
        elif line.startswith('^'):
            result.append(colored(line, 'blue'))
        else:
            result.append(line)
            
    return ''.join(result)

def update_files(mapped_updates: List[Tuple[str, str]], project_root: str) -> Dict:
    """
    Updates existing files and creates new ones with their corresponding code blocks.
    
    Args:
        mapped_updates (List[Tuple[str, str]]): List of tuples containing filenames 
            and their updated code content
        project_root (str): Root directory of the project
        
    Returns:
        Dict: Statistics and detailed information about the update process
    """
    files_updated = 0
    files_created = 0
    files_skipped = 0
    errors = {}
    processed_files = set()
    update_details = []
    updated_files = []
    created_files = []
    skipped_files = []

    for filename, code_block in mapped_updates:
        try:
            # Search for the file or get creation path
            file_path, exists = find_file(project_root, filename)
            
            # Skip if this file has already been processed
            if file_path in processed_files:
                logger.warning(f"Duplicate update attempt for '{file_path}'. Using first occurrence only.")
                files_skipped += 1
                skipped_files.append(filename)
                continue
            
            # Create directory structure if needed
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            if exists:
                # Update existing file
                with open(file_path, 'r', encoding='utf-8') as f:
                    old_content = f.read()
                # Detect file type based on extension
                file_type = Path(file_path).suffix.lower().lstrip('.')
                new_content = preserve_content(old_content, code_block, file_type)
                old_size = len(old_content.encode('utf-8'))
                old_lines = len(old_content.splitlines())
            else:
                # New file
                old_content = ""
                new_content = code_block
                file_type = Path(file_path).suffix.lower().lstrip('.')
                old_size = 0
                old_lines = 0
                
            # Calculate metrics
            new_size = len(new_content.encode('utf-8'))
            new_lines = len(new_content.splitlines())
            percent_change = (new_size / old_size * 100) if old_size > 0 else 100
            
            # Create diff
            diff_content = create_diff(old_content, new_content, not exists)
            
            # Store update info
            update_info = FileUpdateInfo(
                old_path=file_path,
                new_path=file_path,
                old_size=old_size,
                new_size=new_size,
                old_lines=old_lines,
                new_lines=new_lines,
                percent_change=percent_change,
                diff=diff_content,
                is_new_file=not exists
            )
            update_details.append(update_info)
            
            # Write content
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
                
            if exists:
                files_updated += 1
                updated_files.append(filename)
            else:
                files_created += 1
                created_files.append(filename)
            processed_files.add(file_path)
            
            # Log detailed update information
            print(f"\nFile: {file_path} {'(NEW)' if not exists else ''}")
            print(f"Lines: {old_lines} -> {new_lines}")
            print(f"Size: {old_size/1024:.1f}KB -> {new_size/1024:.1f}KB")
            if exists:
                print(f"Change: {percent_change:.1f}%")
            print(format_size_bar(percent_change, not exists))
            print("\nDiff:")
            print(diff_content)

        except Exception as e:
            error_msg = f"Error processing '{filename}': {str(e)}"
            logger.error(error_msg)
            errors[filename] = str(e)
            files_skipped += 1
            skipped_files.append(filename)

    # Log summary
    logger.info(f"Update complete: {files_updated} files updated, {files_created} files created, {files_skipped} files skipped")
    if errors:
        logger.error(f"Errors encountered: {len(errors)} files")

    return {
        'files_updated': files_updated,
        'files_created': files_created,
        'files_skipped': files_skipped,
        'errors': errors,
        'update_details': update_details,
        'updated_files': updated_files,
        'created_files': created_files,
        'skipped_files': skipped_files,
    }
