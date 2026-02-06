#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
CLI utility to manage AI project structure:
- create a project;
- create a reasoning branch;
- create a step (run) with template files.

Supports linking a new step to a parent (the --from-step option):
- automatically records the parent step in prompt.md;
- inserts the path to the parent's result_raw.md in the context section.
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Optional

# ---------- Templates ----------

PROJECT_TEMPLATE = """# Project: {project_title}

## Basic information

- Start date: {date}
- Directory: {project_dir}
- Status: draft

## Project goal

<describe the project goal here>

## Context

- ...

## Constraints and assumptions

- ...

## Success criteria

- [ ] Define criterion 1
- [ ] Define criterion 2

## Structure

- Plan: plan.md
- Step journal: journal.md
- Reasoning branches: branches/
"""

PLAN_TEMPLATE = """# Project plan

## Current status

- Active branch: A_main (default, if present)
- Status: draft

## Stages

1. Stage 1 - <description>
   - [ ] Task 1.1
   - [ ] Task 1.2

2. Stage 2 - <description>
   - [ ] Task 2.1
   - [ ] Task 2.2

## Done (brief)

- (fill in as steps are completed)
"""

JOURNAL_TEMPLATE = """# Step journal

> Each AI run = one entry.
> Record: date, branch, step, status, and a brief result.

---

"""

BRANCH_INFO_TEMPLATE = """# Branch: {branch_id}

## General information

- Identifier: {branch_id}
- Name: {branch_title}
- Creation date: {date}
- Status: active

## Parent branch

- Parent: {parent}
- Branching point (step): {from_step}

## Branch goal

<describe the branch goal here>

## Strategy

- <prompting/approach specifics in this branch>

## Step history (brief)

- <step_id> - ...
"""

PROMPT_TEMPLATE = """# Step prompt {step_id}

- Project: {project_title}
- Branch: {branch_id}
- Step: {step_id}
- Date/time: {datetime}
- Parent step: {parent_step}

## Step goal

Briefly describe what we want to get from the AI in this run.

## Used context

List the context files/sources:
- project.md
- plan.md
- journal.md
{parent_result_path_line}
- ...

## Prompt text (as sent to the AI)

```text
<insert the prompt text verbatim here>
```
"""

CONTEXT_TEMPLATE = """# Step context

You can store excerpts/notes here that you copy into the prompt
or that relate specifically to this step.
"""

RESULT_RAW_TEMPLATE = """# Raw AI result

Paste the model response here WITHOUT changes.
"""

EVALUATION_TEMPLATE = """# Step evaluation {step_id}

- Branch: {branch_id}
- Step: {step_id}
- Evaluation date/time: {datetime}
- AI response: result_raw.md
- Status: success | partial | fail

## What went well

- ...

## Issues

- ...

## Step conclusion

- ...

## Next actions

- [ ] Next step in this branch
- [ ] Create a new branch with a different prompting strategy
"""

# ---------- Helpers ----------

IDENTIFIER_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
PROJECT_TITLE_RE = re.compile(r"^# Project:\s*(.+)$")


@dataclass(frozen=True)
class RunConfig:
    dry_run: bool
    force: bool


def log_status(tag: str, message: str) -> None:
    print(f"[{tag}] {message}")


def error_exit(message: str, code: int = 1) -> None:
    """Print an error message and exit."""
    print(f"[ERR] {message}", file=sys.stderr)
    raise SystemExit(code)


def validate_identifier(label: str, value: str) -> str:
    """Ensure identifiers are safe for directory names."""
    if value is None:
        error_exit(f"{label} is required.")
    if value.strip() != value:
        error_exit(f"{label} must not include leading or trailing whitespace: {value!r}")
    if any(ch.isspace() for ch in value):
        error_exit(f"{label} must not include whitespace: {value!r}")
    if "/" in value or "\\" in value:
        error_exit(f"{label} must not include path separators: {value!r}")
    if value in {".", ".."}:
        error_exit(f"{label} must not be '.' or '..': {value!r}")
    if not IDENTIFIER_RE.match(value):
        error_exit(
            f"{label} must contain only letters, numbers, '.', '_' or '-': {value!r}"
        )
    return value


def parse_date(value: Optional[str]) -> str:
    """Validate YYYY-MM-DD format or return today's date."""
    if not value:
        return date.today().isoformat()
    try:
        return datetime.strptime(value, "%Y-%m-%d").date().isoformat()
    except ValueError:
        error_exit(f"Invalid --date {value!r}. Expected YYYY-MM-DD.")
    return value


def read_project_title(project_path: Path) -> Optional[str]:
    """Read the project title from project.md if present."""
    project_file = project_path / "project.md"
    if not project_file.exists():
        return None
    try:
        with project_file.open("r", encoding="utf-8") as handle:
            first_line = handle.readline().strip()
    except OSError:
        return None
    match = PROJECT_TITLE_RE.match(first_line)
    if match:
        return match.group(1).strip()
    return None


def write_file_if_not_exists(path: Path, content: str, config: RunConfig) -> None:
    """Create a file with content if it does not exist yet."""
    if path.exists():
        if config.force:
            if config.dry_run:
                log_status("DRY", f"Would overwrite file: {path}")
                return
            path.write_text(content, encoding="utf-8")
            log_status("OVERWRITE", f"Overwrote file: {path}")
            return
        log_status("SKIP", f"File already exists: {path}")
        return

    if config.dry_run:
        log_status("DRY", f"Would create file: {path}")
        return

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    log_status("OK", f"Created file: {path}")


def ensure_dir(path: Path, config: RunConfig) -> None:
    """Create a directory if it does not exist."""
    if path.exists():
        if not path.is_dir():
            error_exit(f"Path exists but is not a directory: {path}")
        return

    if config.dry_run:
        log_status("DRY", f"Would create directory: {path}")
        return

    path.mkdir(parents=True, exist_ok=True)
    log_status("OK", f"Created directory: {path}")


# ---------- Commands ----------


def cmd_init_project(args: argparse.Namespace) -> None:
    project_path = Path(args.path)
    config = RunConfig(dry_run=args.dry_run, force=args.force)
    ensure_dir(project_path, config)

    project_title = args.title or project_path.resolve().name
    date_str = parse_date(args.date)
    project_dir_display = str(project_path.resolve())

    # Main project files
    write_file_if_not_exists(
        project_path / "project.md",
        PROJECT_TEMPLATE.format(
            project_title=project_title,
            date=date_str,
            project_dir=project_dir_display,
        ),
        config,
    )

    write_file_if_not_exists(
        project_path / "plan.md",
        PLAN_TEMPLATE,
        config,
    )

    write_file_if_not_exists(
        project_path / "journal.md",
        JOURNAL_TEMPLATE,
        config,
    )

    # Directory for branches
    ensure_dir(project_path / "branches", config)


def cmd_create_branch(args: argparse.Namespace) -> None:
    project_path = Path(args.project_path)
    branch_id = validate_identifier("branch_id", args.branch_id)
    config = RunConfig(dry_run=args.dry_run, force=args.force)

    branches_root = project_path / "branches"
    if not branches_root.is_dir():
        error_exit(
            f"In project {project_path} the 'branches' directory was not found. "
            "Run init-project first."
        )

    branch_dir = branches_root / branch_id
    if branch_dir.exists() and not config.force:
        error_exit(f"Branch {branch_id} already exists in {project_path}.")

    ensure_dir(branch_dir, config)
    ensure_dir(branch_dir / "runs", config)

    branch_title = args.title or branch_id
    parent = validate_identifier("parent", args.parent) if args.parent else "none"
    from_step = (
        validate_identifier("from_step", args.from_step) if args.from_step else "n/a"
    )
    date_str = date.today().isoformat()

    branch_info = BRANCH_INFO_TEMPLATE.format(
        branch_id=branch_id,
        branch_title=branch_title,
        parent=parent,
        from_step=from_step,
        date=date_str,
    )

    write_file_if_not_exists(
        branch_dir / "branch-info.md",
        branch_info,
        config,
    )


def cmd_new_step(args: argparse.Namespace) -> None:
    project_path = Path(args.project_path)
    branch_id = validate_identifier("branch_id", args.branch_id)
    step_id = validate_identifier("step_id", args.step_id)
    config = RunConfig(dry_run=args.dry_run, force=args.force)

    branch_dir = project_path / "branches" / branch_id
    if not branch_dir.is_dir():
        error_exit(
            f"Branch {branch_id} not found in project {project_path}. "
            "Create it with create-branch first."
        )

    step_dir = branch_dir / "runs" / step_id
    if step_dir.exists() and not config.force:
        error_exit(f"Step {step_id} already exists in branch {branch_id}.")

    dt_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    project_title = read_project_title(project_path) or project_path.resolve().name

    # Parent step handling
    if getattr(args, "from_step", None):
        from_step = validate_identifier("from_step", args.from_step)
        parent_dir = branch_dir / "runs" / from_step
        if not parent_dir.is_dir():
            error_exit(
                f"Parent step {from_step} not found in branch {branch_id}. "
                "Create it first or adjust --from-step."
            )
        parent_step = f"{branch_id}/{from_step}"
        parent_result_rel = Path("branches") / branch_id / "runs" / from_step / "result_raw.md"
        parent_result_path_line = f"- {parent_result_rel.as_posix()}"
    else:
        parent_step = "<none, step starts from scratch>"
        parent_result_path_line = (
            "# - (if needed, add the path to the parent's result_raw.md)"
        )

    ensure_dir(step_dir, config)

    prompt_content = PROMPT_TEMPLATE.format(
        project_title=project_title,
        branch_id=branch_id,
        step_id=step_id,
        datetime=dt_str,
        parent_step=parent_step,
        parent_result_path_line=parent_result_path_line,
    )

    evaluation_content = EVALUATION_TEMPLATE.format(
        branch_id=branch_id,
        step_id=step_id,
        datetime=dt_str,
    )

    # Create step files
    write_file_if_not_exists(step_dir / "prompt.md", prompt_content, config)
    write_file_if_not_exists(step_dir / "context.md", CONTEXT_TEMPLATE, config)
    write_file_if_not_exists(step_dir / "result_raw.md", RESULT_RAW_TEMPLATE, config)
    write_file_if_not_exists(step_dir / "evaluation.md", evaluation_content, config)


# ---------- Args ----------


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Utility to manage AI project structure (projects, branches, steps)."
    )

    common_parser = argparse.ArgumentParser(add_help=False)
    common_parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned actions without writing files.",
    )
    common_parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing template files.",
    )

    subparsers = parser.add_subparsers(
        title="commands",
        dest="command",
        help="available actions",
    )

    # init-project
    p_init = subparsers.add_parser(
        "init-project",
        help="Create a new project (directory + base files).",
        parents=[common_parser],
    )
    p_init.add_argument(
        "path",
        help=(
            "Project directory path (for example: ai/2025-12-01_my-project)."
        ),
    )
    p_init.add_argument(
        "--title",
        help="Human-readable project title (defaults to directory name).",
    )
    p_init.add_argument(
        "--date",
        help="Project start date in YYYY-MM-DD format (defaults to today).",
    )
    p_init.set_defaults(func=cmd_init_project)

    # create-branch
    p_branch = subparsers.add_parser(
        "create-branch",
        help="Create a new reasoning branch in a project.",
        parents=[common_parser],
    )
    p_branch.add_argument(
        "project_path",
        help="Project directory (for example: ai/2025-12-01_my-project).",
    )
    p_branch.add_argument(
        "branch_id",
        help="Branch identifier (for example: A_main, B_alt-from-A_002).",
    )
    p_branch.add_argument(
        "--title",
        help="Human-readable branch title (defaults to branch_id).",
    )
    p_branch.add_argument(
        "--parent",
        help="Parent branch (if any).",
    )
    p_branch.add_argument(
        "--from-step",
        dest="from_step",
        help="ID of the step to branch from (for example: A_002).",
    )
    p_branch.set_defaults(func=cmd_create_branch)

    # new-step
    p_step = subparsers.add_parser(
        "new-step",
        help="Create template files for a new step (run) in a branch.",
        parents=[common_parser],
    )
    p_step.add_argument(
        "project_path",
        help="Project directory (for example: ai/2025-12-01_my-project).",
    )
    p_step.add_argument(
        "branch_id",
        help="Branch identifier (for example: A_main).",
    )
    p_step.add_argument(
        "step_id",
        help="Step identifier (for example: A_001).",
    )
    p_step.add_argument(
        "--from-step",
        dest="from_step",
        help=(
            "ID of the parent step in the same branch (for example: A_002). "
            "Used to auto-fill fields in prompt.md."
        ),
    )
    p_step.set_defaults(func=cmd_new_step)

    return parser


def main() -> None:
    parser = build_arg_parser()
    args = parser.parse_args()

    if not hasattr(args, "func"):
        parser.print_help()
        sys.exit(1)

    args.func(args)


if __name__ == "__main__":
    main()
