
import os
from typing import List

def select_python_files(
    directory: str,
    exclude_patterns: List[str] = ['.git', '__pycache__', 'venv'],
    include_extensions: List[str] = ['.py']
) -> List[str]:
    python_files = []
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in exclude_patterns]
        for file in files:
            if any(file.endswith(ext) for ext in include_extensions):
                python_files.append(os.path.join(root, file))
    return python_files
