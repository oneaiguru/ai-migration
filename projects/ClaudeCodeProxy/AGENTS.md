# Agent Onboarding Notes

Welcome! Before touching the codebase, skim these essentials and stick to the shared structure (no ad-hoc folders elsewhere):

1. **Docs overview** – `docs/README.md` outlines the major tracks (MITM P0, research archive, etc.).
2. **Standard Operating Procedures** – `docs/SOP/README.md` is the entry point for repeatable playbooks (profiles, deployments, smoke tests). Add new SOPs there when you formalize a process.
3. **System docs** – `docs/System/README.md` (with backlog in `docs/System/TODO.md`) tracks long-lived references we still need to port. Inspiration: `~/git/tools/agentos/docs/System/` and `~/git/tools/agentos/docs/CE_MAGIC_PROMPTS/`.
4. **Tasks backlog** – `docs/Tasks/` holds exploratory notes and implementation plans (e.g., thinking-sanitizer plan).
5. **Current handoff** – `docs/SESSION_HANDOFF.md` summarizes the latest window, outstanding tasks, and where artifacts live.
6. **Next-agent TODOs** – `docs/TODO-NEXT-AGENT.md` tracks follow-ups beyond the formal SOPs.
7. **Progress log** – `docs/Progress.md` records session highlights; update it when you wrap a window.

Install the latest aliases with `./scripts/install-shell-aliases.sh` to get `ccp-start`, `ccp-env`, `ccp-logs`, etc., without manual sourcing.

All new docs should live in the existing `docs/` subfolders (SOP, System, Tasks, ops, etc.) to avoid fragmentation.

Tip: set your shell profile (`source scripts/env/prod.sh` or `scripts/env/dev.sh`) before running any scripts so logs/results land in the correct directories.

Credentials (local dev)
- Z.ai key: place it in the repo‑root `.env` file so our scripts and the Go shim can load it automatically. Two supported formats:
  - Single line key: `sk-...` (no key name)
  - Key=value: `ZAI_API_KEY=sk-...`
- `scripts/run-go-shim.sh` and `make go-proxy` read `.env` and export `ZAI_API_KEY` if set. You can also export it directly in the shell.
