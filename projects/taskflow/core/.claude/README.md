# .claude Directory

This folder stores reusable prompts and command files used when interacting with AI models such as OpenAI Codex or Anthropic Claude.  It forms part of TaskFlow.ai's three folder structure:

1. `ai-docs/` – persistent reference documentation
2. `specs/`   – task specifications and plans
3. `.claude/` – prompts and command sequences

Commands saved here help initialize context, run implementations and automate workflow steps.  Keeping them under version control allows you to reuse and refine them over time.

## Organization

Typical sub‑directories include:

- `templates/` – reusable command templates containing placeholders
- `tasks/`     – task‑specific context or prompts prepared by scripts
- `current/`   – files generated for the task currently being executed

You are free to add additional folders (e.g. `workflows/` for multi‑step sequences) as needed.

Command files themselves fall into a few common categories:

1. **Context commands** – prime the model with architecture docs or task specs.
2. **Implementation commands** – request that a model implement a feature or fix.
3. **Review commands** – ask the model to analyse code or generate feedback.
4. **Utility commands** – any helper instructions you reuse frequently.

Use clear file names such as `context-prime.md` or `implement-feature.md` so it is obvious what each command does.

## Writing Effective Commands

- **Keep prompts concise.** Provide just enough information for the model to act.
- **Specify output expectations.** If you need a code diff or a list, say so.
- **Reference docs.** Link to files in `ai-docs/` or `specs/` for background.
- **Separate instructions from context.** A short instruction section followed by a context section is easier for models to parse.
- **Iterate.** Treat command files as code—review and improve them with each use.

## Templates and Placeholders

Placeholders allow you to reuse a command for multiple tasks.  Use `{{placeholder}}` syntax (or another style of your choice) and replace these tokens before sending the prompt to the model.  For example:

```md
# Task Implementation Request
Implement feature `{{featureName}}` as described in `specs/tasks/{{taskId}}.md`.
```

Scripts such as `tools/prepare-task.sh` or your own automation can perform the substitution.

## Optimizing for Different Models

Different AI systems respond better to slightly different prompt styles:

- **Claude** – prefers well‑structured Markdown with short sections. Limit the number of code blocks and keep them small when possible.
- **Codex**  – focus on precise instructions and include full code context if needed. Place code fences around snippets to improve accuracy.
- **Other models** – experiment and document what works best. Saving variations in this folder lets you maintain model‑specific commands.

When optimising a command, keep previous versions so you can compare results.  Consider creating subfolders like `claude/` or `codex/` if commands diverge significantly.

---

Use this README as a reference when adding new command files.  Well organised and clearly written prompts will make TaskFlow.ai far more effective.
