# Import Task Template

Use this for each repo import. Fill in the placeholders and keep PRs ≤ 1MB.

- 🧩 Source repo: `/Users/m/git/<group>/<repo>`
- 🏁 Destination: `projects/<repo>/`
- 🔗 Verification: `python scripts/dev/verify_import_files.py <repo> --dest-ref HEAD`
- 📦 Exclude: node_modules, venv/.venv, dist/build, data dumps, egg-info, DS_Store, logs.

## Steps
1) Prepare worktree  
   `git worktree add -b import-<repo>-01-all /Users/m/ai/.worktrees/<repo> origin/main`

2) Copy tracked files from source into `projects/<repo>/` (respect exclusions). Add `AGENTS.md` and `.gitignore` if missing.

3) Validations  
   - `python -m py_compile ...` or project tests as applicable.  
   - Adjust setup.py/requirements if imports fail.

4) Open PR  
   - Title: `import:<repo>:01-all` (or :02/:03 for follow-ups)  
   - Body: scope, size, validations, known defers (P1/P2).

5) Push & trigger Codex  
   `scripts/dev/push_with_codex.sh`

6) Handle Codex feedback  
   - Fix P0/critical in the PR.  
   - Note deferred P1/P2 in PR body.

7) Merge path  
   - Coordinator adds `codex-approved` → Mergify auto-merge.

8) Post-merge verification on main  
   `python scripts/dev/verify_import_files.py <repo>`  
   Update dashboards with status/notes.
