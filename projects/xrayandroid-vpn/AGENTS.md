# AGENTS

Update this file before first run. This is repo-specific guidance for the loop.

Run/test commands
- install: `npm install` (once the web app exists)
- lint: `npm run lint` (once configured)
- typecheck: `npm run typecheck` (once configured)
- test: `npm test` (if added)
- other: `./loop.sh plan 1`, `./loop.sh 1`

Tooling
- node: 20.x
- npm: 10.x (pnpm ok if added later)
- python: not required
- docker: not required

Workflow
- Use the Ralph loop (PROMPT_build.md).
- One role per loop; stop after each role.
- Do not edit specs unless explicitly asked.
- Keep `android/` assets unchanged unless explicitly requested.

Git/push
- No push/PR unless explicitly requested.
