#!/usr/bin/env python3
"""Command line interface for working with TaskFlow tasks."""

import argparse
import os
import datetime
import logging
from pathlib import Path
import sys

# Ensure the repository root is on the Python path when this script is executed
# directly. This allows modules such as ``path_utils`` to be imported without
# requiring the user to modify ``PYTHONPATH`` manually.
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

try:
    from path_utils import repo_path, REPO_ROOT
except ModuleNotFoundError:  # pragma: no cover - fallback for direct execution
    sys.path.insert(0, str(ROOT_DIR))
    from path_utils import repo_path, REPO_ROOT

from git import Repo

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

# Determine repository path. ``repo_path`` will fall back to this directory
# when the ``REPO_PATH`` environment variable is not set.
REPO_PATH = os.getenv("REPO_PATH", str(REPO_ROOT))


def _ensure_git_user(repo: Repo) -> None:
    """Ensure the repository has user identity configured."""
    reader = repo.config_reader()
    try:
        reader.get_value("user", "name")
        reader.get_value("user", "email")
        return
    except Exception:  # pylint: disable=broad-exception-caught
        pass

    with repo.config_writer() as cw:
        cw.set_value("user", "name", os.getenv("GIT_USER_NAME", "TaskFlow Bot"))
        cw.set_value(
            "user", "email", os.getenv("GIT_USER_EMAIL", "taskflow@example.com")
        )


def get_repo():
    """Return a GitPython Repo object, initializing if needed."""
    try:
        repo = Repo(REPO_PATH)
    except Exception:  # pylint: disable=broad-exception-caught
        logger.info("Initializing new git repository")
        repo = Repo.init(REPO_PATH)
        _ensure_git_user(repo)
        if not repo.head.is_valid():
            repo.git.commit("--allow-empty", "-m", "initial commit")
        return repo

    _ensure_git_user(repo)
    return repo


def ensure_branch(repo, branch_name):
    """Ensure the branch exists and return it."""
    if branch_name in repo.heads:
        return repo.heads[branch_name]
    return repo.create_head(branch_name)


def create_task(args):
    repo = get_repo()
    task_id = args.task_id
    title = args.title
    date_str = datetime.datetime.now().strftime("%Y-%m-%d")

    tasks_dir = repo_path("core", "specs", "tasks")
    os.makedirs(tasks_dir, exist_ok=True)
    template_path = repo_path("core", "specs", "templates", "task-template.md")
    spec_path = repo_path("core", "specs", "tasks", f"{task_id}.md")

    if template_path.exists():
        with open(template_path) as f:
            content = f.read()
        content = content.replace("[Task Title]", title)
        content = content.replace("[TASK-ID]", task_id)
        content = content.replace("[YYYY-MM-DD]", date_str)
    else:
        content = f"""# Task Specification: {title}

## Metadata
- **Task ID**: {task_id}
- **Created**: {date_str}
- **Priority**: Medium
- **Estimated Effort**: Medium
- **Dependencies**: None

## Objective
[Describe the task objective here]
"""

    with open(spec_path, "w") as f:
        f.write(content)
    logger.info(f"Created task specification: {spec_path}")

    claude_tasks = repo_path("core", ".claude", "tasks")
    os.makedirs(claude_tasks, exist_ok=True)
    context_path = claude_tasks / f"{task_id}.md"
    context_content = f"""# Task: {title}
ID: {task_id}
Created: {date_str}

## Requirements
[See {spec_path} for detailed requirements]

## Context
- Refer to core/ai-docs/architecture/README.md for system architecture
- Refer to core/ai-docs/patterns/error-handling.md for error handling patterns
"""
    with open(context_path, "w") as f:
        f.write(context_content)
    logger.info(f"Created task context: {context_path}")

    branch = f"task/{task_id}"
    ensure_branch(repo, branch)
    repo.git.checkout(branch)
    repo.index.add([str(spec_path), str(context_path)])
    repo.index.commit(f"[PENDING-L4] Prepare task {task_id}: {title}")
    logger.info(f"Created branch {branch} and committed task files")


def list_tasks(_args):
    tasks_dir = repo_path("core", "specs", "tasks")
    if not tasks_dir.is_dir():
        print("No tasks found.")
        return

    files = [f.name for f in tasks_dir.iterdir() if f.suffix == ".md"]
    if not files:
        print("No tasks found.")
        return

    for fname in sorted(files):
        task_id = fname[:-3]
        title = ""
        with open(tasks_dir / fname) as f:
            first = f.readline().strip()
        if first.startswith("# Task Specification:"):
            title = first.replace("# Task Specification:", "").strip()
        print(f"{task_id} - {title}")


def execute_task(args):
    repo = get_repo()
    task_id = args.task_id
    branch = f"task/{task_id}"
    if branch not in repo.heads:
        print(f"Branch {branch} does not exist")
        return

    repo.git.checkout(branch)
    spec_file = repo_path("core", "specs", "tasks", f"{task_id}.md")
    if not spec_file.is_file():
        print(f"Task specification not found: {spec_file}")
        return

    outputs_dir = repo_path("outputs", task_id)
    os.makedirs(outputs_dir, exist_ok=True)

    title = ""
    with open(spec_file) as f:
        first = f.readline().strip()
    if first.startswith("# Task Specification:"):
        title = first.replace("# Task Specification:", "").strip()

    context_dir = repo_path("core", ".claude", "current")
    os.makedirs(context_dir, exist_ok=True)
    context_file = context_dir / "context.md"
    with open(context_file, "w") as f:
        f.write(f"# Task Context: {title}\n\n")
        f.write("## Task Specification\n")
        with open(spec_file) as sf:
            f.write(sf.read())
        f.write("\n\n## Additional Context\n")
        task_context_file = repo_path("core", ".claude", "tasks", f"{task_id}.md")
        if task_context_file.is_file():
            with open(task_context_file) as tc:
                f.write(tc.read())
        else:
            f.write("No additional context provided.\n")
        arch = repo_path("core", "ai-docs", "architecture", "README.md")
        if arch.is_file():
            with open(arch) as af:
                f.write("\n## Architecture Overview\n")
                f.write(af.read())
        pattern = repo_path("core", "ai-docs", "patterns", "error-handling.md")
        if pattern.is_file():
            with open(pattern) as pf:
                f.write("\n## Error Handling Pattern\n")
                f.write(pf.read())

    prompt_file = context_dir / "prompt.md"
    with open(prompt_file, "w") as f:
        f.write("# Task Implementation Request\n\n")
        f.write(
            "Please help implement the task described below, based on the provided context and specifications.\n\n"
        )
        f.write("## Task Information\n")
        f.write(f"- **Task ID**: {task_id}\n")
        f.write(f"- **Task Title**: {title}\n\n")
        f.write("## Instructions\n")
        f.write("1. Review the task specification and context carefully\n")
        f.write(
            "2. Implement the required functionality according to the specifications\n"
        )
        f.write("3. Follow any error handling patterns and architectural guidelines\n")
        f.write("4. Provide clear documentation for your implementation\n")
        f.write("5. Include any necessary tests\n\n")
        f.write("## Context\n")
        with open(context_file) as cf:
            f.write(cf.read())

    print(f"Prepared context in {context_file}")
    print(f"Prepared prompt in {prompt_file}")


def main():
    parser = argparse.ArgumentParser(description="TaskFlow CLI")
    sub = parser.add_subparsers(dest="command")

    create_p = sub.add_parser("create", help="Create a new task")
    create_p.add_argument("title")
    create_p.add_argument("task_id")
    create_p.set_defaults(func=create_task)

    list_p = sub.add_parser("list", help="List existing tasks")
    list_p.set_defaults(func=list_tasks)

    exec_p = sub.add_parser("execute", help="Prepare a task for execution")
    exec_p.add_argument("task_id")
    exec_p.set_defaults(func=execute_task)

    args = parser.parse_args()
    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
