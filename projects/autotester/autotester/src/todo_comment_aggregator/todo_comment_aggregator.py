import re
from typing import List, Dict, Any

def detect_todo_fixme_comments(file_content: str) -> List[Dict[str, Any]]:
    """Detect TODO and FIXME comments in a file."""
    pattern = re.compile(r"(?<=#\s)(TODO|FIXME):\s*(.*)")
    comments: List[Dict[str, Any]] = []
    for line_num, line in enumerate(file_content.splitlines(), 1):
        match = pattern.search(line)
        if match:
            comments.append(
                {"type": match.group(1), "line": line_num, "content": match.group(2).strip()}
            )
    return comments


def generate_todo_markdown(comments_by_file: Dict[str, List[Dict[str, Any]]], output_path: str) -> None:
    """Generate a Markdown summary of TODO/FIXME comments grouped by file."""
    with open(output_path, 'w') as f:
        f.write("# TODO and FIXME Comments\n\n")
        for file_path, comments in comments_by_file.items():
            if not comments:
                continue
            f.write(f"## File: {file_path}\n\n")
            for comment in comments:
                f.write(f"- Line {comment['line']}: {comment['type']} - {comment['content']}\n")
            f.write("\n")
