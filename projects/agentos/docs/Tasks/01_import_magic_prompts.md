# TODO 01 – Import Magic Prompt References

The repo still relies on external copies of the CE magic prompt materials. When ready, collect the canonical versions from the replica workspace and store them under `docs/System/` (or an appropriate archive). Sources to pull:

- `PROGRESS.md` variants (e.g. `/Users/m/Documents/replica/PROGRESS.md`, `/Users/m/Documents/replica/orchestrator/src/work/phase-2-automation/PROGRESS.md`, etc.).
- `CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md` (multiple locations such as `/Users/m/Documents/replica/orchestrator/wfm-top/imports/code/CE_MAGIC_PROMPTS/SIMPLE-INSTRUCTIONS.md`).
- `CE_MAGIC_PROMPTS/EXECUTE-WITH-MAGIC-PROMPT.md` (same directory structure as above).

Suggested steps for the next agent:
1. Confirm the local authoritative copies under `docs/System/CE_MAGIC_PROMPTS/` match the latest replica versions.
2. Update references (`docs/Tasks/AGENTS.md`, `docs/System/context-engineering.md`, SOPs) to point at `/Users/m/ai/projects/agentos/docs/System/CE_MAGIC_PROMPTS/*.md`.
3. Re-run this task whenever upstream prompt content changes in the replica workspace.
