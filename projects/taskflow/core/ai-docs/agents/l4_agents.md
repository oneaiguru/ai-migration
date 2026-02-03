# L4 Agents – Claude Code

L4 agents use Claude Code to execute tasks that require a desktop environment.
They run tests and apply changes locally before committing them back to the repo.

## Typical Workflow

1. Prepare the task context:
   ```bash
   tools/execute-task.sh <task-id>
   ```
2. Copy `core/.claude/current/prompt.md` into Claude Code and run the task.
3. Apply the resulting patch and commit your changes.

Example commit:

```bash
git commit -m "[AI-L4] [TASK-123] Implement data validator"
```

The preparation script automatically includes architecture docs and error
handling patterns so the agent follows established conventions.
