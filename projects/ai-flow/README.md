# AI Flow

AI Flow is a small CLI that scaffolds a repeatable folder structure for AI work: a project, its reasoning branches, and step/run folders with Markdown templates.

## Concepts

- Project: a top-level folder with `project.md`, `plan.md`, and `journal.md`.
- Branch: a reasoning path under `branches/<branch_id>/` with `branch-info.md`.
- Step: a run under `branches/<branch_id>/runs/<step_id>/` with prompt, context, result, and evaluation files.

## Folder layout (example)

```
ai/2025-12-01_my-project/
  project.md
  plan.md
  journal.md
  branches/
    A_main/
      branch-info.md
      runs/
        A_001/
          prompt.md
          context.md
          result_raw.md
          evaluation.md
```

## Quickstart

From the repo root:

```
python projects/ai-flow/ai_flow.py init-project ai/2025-12-01_my-project --title "My project"
python projects/ai-flow/ai_flow.py create-branch ai/2025-12-01_my-project A_main --title "Main branch"
python projects/ai-flow/ai_flow.py new-step ai/2025-12-01_my-project A_main A_001
```

## Linking a step to a parent

If you want a step to reference a parent step's result:

```
python projects/ai-flow/ai_flow.py new-step ai/2025-12-01_my-project A_main A_002 --from-step A_001
```

This populates the parent step in `prompt.md` and inserts a reference to the parent's `result_raw.md` in the context section.

## CLI behavior notes

- The project title used in new steps is read from the first line of `project.md` (`# Project: ...`).
- `--dry-run` prints actions without creating files or directories.
- `--force` overwrites existing template files but does not delete directories.

## Package usage (optional)

From `projects/ai-flow/`:

```
python ai_flow.py --help
```

If you want an editable install:

```
python -m pip install -e projects/ai-flow
ai-flow --help
```

## Customizing templates

Edit the template strings in `projects/ai-flow/src/ai_flow/cli.py` to match your workflow.

## Testing

From `projects/ai-flow/`:

```
python -m pytest
```

## Manual E2E checklist

1. Run `init-project` to scaffold a new project directory.
2. Run `create-branch` to add a branch and verify `branch-info.md` and `runs/` are created.
3. Run `new-step` (with and without `--from-step`) and confirm prompt context references are correct.
4. Re-run commands with `--dry-run` and ensure no files are created.
5. Re-run `init-project --force` and confirm template files are overwritten.
