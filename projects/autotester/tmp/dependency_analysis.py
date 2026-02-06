import os
import ast
from typing import Set

def get_full_import_path(module: str, current_path: str, level: int) -> str:
    """
    Constructs the full import path for a relative import, returning a module path without root directories.
    - `module`: the relative import module name (e.g., 'module_b' or 'package.module_d')
    - `current_path`: the path of the current file from which the import is called.
    - `level`: the level of the relative import (1 for single dot, 2 for two dots, etc.).
    """
    # Move up by 'level' directories from the current path and remove base directory references
    base_path = os.path.dirname(current_path)
    for _ in range(level - 1):  # Go up one directory per level
        base_path = os.path.dirname(base_path)
    
    # Join remaining path with the module, forming a relative package path
    package_path = os.path.relpath(base_path, "/project").replace("/", ".")
    return f"{package_path}.{module}" if module else package_path

def extract_imports_from_content(file_content: str, current_path: str) -> Set[str]:
    """
    Extracts imports from Python file content, handling both standard and relative imports, 
    and attempts to capture dynamic imports within conditional structures and 'importlib' calls.
    """
    imports = set()
    try:
        tree = ast.parse(file_content)
        for node in ast.walk(tree):
            # Handle standard imports
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.add(alias.name)
            # Handle 'from ... import ...' and relative imports
            elif isinstance(node, ast.ImportFrom):
                if node.level > 0:
                    # Resolve relative imports by tracking the module path
                    full_import_path = get_full_import_path(node.module, current_path, node.level)
                    imports.add(full_import_path)
                elif node.module:
                    # Standard 'from module import ...'
                    imports.add(node.module)
            # Attempt to detect conditional imports
            elif isinstance(node, ast.If):
                for child in node.body:
                    if isinstance(child, ast.Import):
                        for alias in child.names:
                            imports.add(alias.name)
                    elif isinstance(child, ast.ImportFrom) and child.module:
                        imports.add(child.module)
            # Detect dynamic imports using 'importlib.import_module' calls
            elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "import_module":
                if node.func.value.id == "importlib" and isinstance(node.args[0], ast.Str):
                    imports.add(node.args[0].s)

    except SyntaxError:
        pass  # Skip files with syntax errors
    return imports
