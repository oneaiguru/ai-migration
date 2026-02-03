"""TaskFlow command line interface.

This CLI provides convenient commands for managing tasks, templates
and Git operations. It is designed as a lightweight front-end for the
service modules under ``src.services``.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import List

# Ensure repository root is on sys.path when executed directly
ROOT_DIR = Path(__file__).resolve().parent.parent

if str(ROOT_DIR) in sys.path:
    sys.path.remove(str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR))

try:
    from colorama import Fore, Style, init
except Exception:  # pragma: no cover - optional dependency
    class _Dummy:
        def __getattr__(self, name: str) -> str:
            return ""

    Fore = Style = _Dummy()

    def init(*_args: object, **_kwargs: object) -> None:  # type: ignore
        return

from config_manager import get_config
from git_utils import get_repo, sync_repository, pull_changes, push_changes
from src.services.task_service import TaskService, TaskStatus
from src.services.template_service import TemplateService


init(autoreset=True)


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def _task_service() -> TaskService:
    cfg = get_config()
    return TaskService(file_path=cfg.get("tasks_file"), repo_path=cfg.repo_path)


def _template_service() -> TemplateService:
    cfg = get_config()
    template_dir = str(Path(cfg.repo_path) / "templates")
    db_file = cfg.get("gallery_file")
    return TemplateService(template_dir=template_dir, db_file=db_file)


# ---------------------------------------------------------------------------
# Task commands
# ---------------------------------------------------------------------------

def task_create(args: argparse.Namespace) -> None:
    svc = _task_service()
    task = svc.create_task(args.task_id, args.title)
    print(Fore.GREEN + f"Created task {task.id} - {task.title}")


def task_list(args: argparse.Namespace) -> None:
    svc = _task_service()
    status = TaskStatus(args.status) if args.status else None
    tasks = svc.list_tasks(status=status, search=args.search)
    for t in tasks:
        t_status = TaskStatus(t.status) if isinstance(t.status, str) else t.status
        line = f"{t.id}: {t.title} [{t_status.value}]"
        color = (
            Fore.CYAN
            if t_status == TaskStatus.PENDING
            else (Fore.YELLOW if t_status == TaskStatus.IN_PROGRESS else Fore.GREEN)
        )
        print(color + line)


def task_status(args: argparse.Namespace) -> None:
    svc = _task_service()
    if args.set:
        svc.update_task(args.task_id, status=TaskStatus(args.set))
        print(Fore.YELLOW + f"Status for {args.task_id} set to {args.set}")
    else:
        task = svc.get_task(args.task_id)
        if not task:
            print(Fore.RED + f"Task {args.task_id} not found")
            return
        print(Fore.CYAN + f"{task.id}: {task.title} [{task.status.value}]")


# ---------------------------------------------------------------------------
# Template commands
# ---------------------------------------------------------------------------

def template_list(_args: argparse.Namespace) -> None:
    svc = _template_service()
    for tpl in svc.list_templates():
        print(Fore.CYAN + f"{tpl.name}: {tpl.display_name}")


def template_add(args: argparse.Namespace) -> None:
    svc = _template_service()
    with open(args.file, "r", encoding="utf-8") as f:
        content = f.read()
    svc.add_template(args.name, {"prompt": content})
    print(Fore.GREEN + f"Added template {args.name}")


def template_delete(args: argparse.Namespace) -> None:
    svc = _template_service()
    if svc.delete_template(args.name):
        print(Fore.YELLOW + f"Deleted template {args.name}")
    else:
        print(Fore.RED + f"Template {args.name} not found")


# ---------------------------------------------------------------------------
# Git commands
# ---------------------------------------------------------------------------

def git_sync(_args: argparse.Namespace) -> None:
    repo = get_repo(get_config().repo_path)
    print(Fore.CYAN + "Synchronizing repository...")
    sync_repository(repo)
    print(Fore.GREEN + "Sync complete")


def git_pull(_args: argparse.Namespace) -> None:
    repo = get_repo(get_config().repo_path)
    pull_changes(repo)
    print(Fore.GREEN + "Pulled latest changes")


def git_push(_args: argparse.Namespace) -> None:
    repo = get_repo(get_config().repo_path)
    push_changes(repo)
    print(Fore.GREEN + "Pushed changes")


# ---------------------------------------------------------------------------
# Config command
# ---------------------------------------------------------------------------

def config_show(_args: argparse.Namespace) -> None:
    cfg = get_config()
    print(json.dumps(cfg.get_all(), indent=2))


# ---------------------------------------------------------------------------
# Argument parser setup
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="TaskFlow CLI",
        epilog="Examples:\n  cli.py task create T1 'My first task'\n  cli.py template list",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command")

    # Task commands
    p_task = sub.add_parser("task", help="Manage tasks")
    task_sub = p_task.add_subparsers(dest="task_cmd")

    c = task_sub.add_parser("create", help="Create a new task")
    c.add_argument("task_id")
    c.add_argument("title")
    c.set_defaults(func=task_create)

    list_parser = task_sub.add_parser("list", help="List tasks")
    list_parser.add_argument("--status", choices=[s.value for s in TaskStatus])
    list_parser.add_argument("--search")
    list_parser.set_defaults(func=task_list)

    s = task_sub.add_parser("status", help="Show or update task status")
    s.add_argument("task_id")
    s.add_argument("--set", choices=[s.value for s in TaskStatus])
    s.set_defaults(func=task_status)

    # Template commands
    p_tpl = sub.add_parser("template", help="Manage templates")
    tpl_sub = p_tpl.add_subparsers(dest="tpl_cmd")

    tl = tpl_sub.add_parser("list", help="List templates")
    tl.set_defaults(func=template_list)

    ta = tpl_sub.add_parser("add", help="Add a template from file")
    ta.add_argument("name")
    ta.add_argument("file")
    ta.set_defaults(func=template_add)

    td = tpl_sub.add_parser("delete", help="Delete a template")
    td.add_argument("name")
    td.set_defaults(func=template_delete)

    # Git commands
    p_git = sub.add_parser("git", help="Git utilities")
    git_sub = p_git.add_subparsers(dest="git_cmd")

    gs = git_sub.add_parser("sync", help="Pull and push")
    gs.set_defaults(func=git_sync)

    gp = git_sub.add_parser("pull", help="Pull changes")
    gp.set_defaults(func=git_pull)

    gph = git_sub.add_parser("push", help="Push changes")
    gph.set_defaults(func=git_push)

    # Config commands
    p_cfg = sub.add_parser("config", help="Show configuration")
    cfg_sub = p_cfg.add_subparsers(dest="cfg_cmd")

    show = cfg_sub.add_parser("show", help="Display configuration")
    show.set_defaults(func=config_show)

    return parser


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def main(argv: List[str] | None = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)
    if hasattr(args, "func"):
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
