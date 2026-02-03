# Agent Overview

TaskFlow.ai leverages two AI agent levels to implement and refine code.

* **L4 (Claude Code)** – runs on a desktop with full execution and testing abilities.
* **L5 (Codex)** – uses OpenAI Codex for lightweight generation and review.

These practices apply to all agents:

- Understand the repository layout: `ai-docs/`, `specs/`, and `.claude/`.
- Keep commit messages concise and reference the relevant task.
- Store prompts in `.claude/commands/` and templates in `.claude/templates/`.
- Load environment variables from `.env` using `python-dotenv` when scripting.

See the documents below for guidance specific to each agent level.
