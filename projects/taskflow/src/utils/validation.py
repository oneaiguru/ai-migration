import re
from typing import List, Optional


def validate_task_id(task_id: str) -> List[str]:
    """Validate task ID format. Returns list of errors."""
    errors = []
    if not task_id:
        errors.append("Task ID is required")
    elif not re.match(r'^[a-zA-Z0-9_-]+$', task_id):
        errors.append("Task ID can only contain letters, numbers, hyphens, and underscores")
    elif len(task_id) < 3:
        errors.append("Task ID must be at least 3 characters long")
    elif len(task_id) > 50:
        errors.append("Task ID must be less than 50 characters")
    return errors


def validate_task_title(title: str) -> List[str]:
    """Validate task title. Returns list of errors."""
    errors = []
    if not title:
        errors.append("Task title is required")
    elif len(title.strip()) < 3:
        errors.append("Task title must be at least 3 characters long")
    elif len(title) > 200:
        errors.append("Task title must be less than 200 characters")
    return errors


def validate_template_name(name: str) -> List[str]:
    """Validate template name. Returns list of errors."""
    errors = []
    if not name:
        errors.append("Template name is required")
    elif not re.match(r'^[a-zA-Z0-9_-]+$', name):
        errors.append("Template name can only contain letters, numbers, hyphens, and underscores")
    return errors
