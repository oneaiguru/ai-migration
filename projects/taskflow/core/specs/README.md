# Specifications Folder

The `core/specs` directory holds all work specifications and planning documents used by TaskFlow.ai. These specifications define what needs to be built so that AI agents can implement tasks reliably.

## Types of Specifications

- **Task specifications** – Detailed descriptions of small units of work. Each task gets its own Markdown file in `core/specs/tasks/`.
- **Feature specifications** – Higher level requirements for new functionality. These may reference multiple tasks.
- **Template specifications** – Reusable document templates that help you create new task or feature specs consistently.

Additional documents such as planning notes can also live here as needed.

## Guidelines for Effective Specifications

1. **Provide clear objectives.** Explain what the task or feature should accomplish.
2. **List functional and technical requirements.** Break down behavior, interfaces, and any constraints.
3. **Include acceptance criteria and test cases.** AI agents rely on these to verify completion.
4. **Reference existing documentation.** Link to relevant files in `core/ai-docs` or elsewhere for context.
5. **Specify AI agent level.** Indicate whether the work is intended for L4 (Claude Code) or L5 (Codex) implementation.

Use concise language and bullet points so automated tools can parse the information easily.

## Using Templates

Templates under `core/specs/templates/` provide a starting point for new specs. Copy the appropriate template and fill in each section. For example, to create a task specification:

```bash
mkdir -p core/specs/tasks
cp core/specs/templates/task-template.md core/specs/tasks/<task-id>.md
```

Edit the new file to add objectives, requirements, and other details. Consistent structure makes it easier for bots and humans to understand the work.

## From Specification to Implementation

Prepared specs are used by the mobile/desktop workflow described in the architecture overview. After writing a spec, commit it to Git and synchronize across devices. When executing a task, the scripts in `tools/` load the spec and combine it with context from `.claude/` so an AI agent can produce the implementation.

Well written specifications are therefore the link between planning and automated code generation.
