# L5 Agents – Codex

L5 agents rely on OpenAI Codex for rapid code generation and small iterations.
This level works well on mobile devices where you may not have a full
development environment.

## Typical Workflow

1. Create a task specification:
   ```bash
   tools/prepare-task.sh "Title" <task-id>
   ```
2. Open `core/.claude/current/prompt.md` and paste it into Codex.
3. Review the output and apply the patch to your repository.

Example commit:

```bash
git add src/myfile.js
git commit -m "[AI-L5] [TASK-42] Add logging middleware"
```

Use L5 agents to scaffold code and write unit tests before handing larger or
more complex work to the L4 agent.
