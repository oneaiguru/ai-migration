## Best Practices – Orchestration, UAT, Integration (Session Consolidation)

Purpose
- Capture recurring findings and convert them into stable guidance for agents and orchestrators.

1) Outcome‑Based Execution
- Prefer single‑session Executor passes for bounded work (UAT, small behaviour fixes, integration mount). Skip Scout/Plan for trivial slices.
- Always update: tracker, Findings file, CodeMap, System reports + canonical checklist, SESSION_HANDOFF.md, PROGRESS.md.

2) UAT Handoff (Flat, Minimal)
- One prompt, flat folder under root `uat/` (no subfolders). Attach files only for Fail evidence.
- Demos template: `uat-agent-tasks/DEMOS_PROMPT_template.txt`.
- Real Naumen template: `uat-agent-tasks/NAUMEN_PROMPT_template.txt`.
- Results always pasted back into `uat/<date>_*.md` and linked from handoff.

3) Public Deploys Only
- Disable Vercel password protection before UAT. If staging must be protected, provide a truly public URL for UAT.
- Do not run Playwright against protected routes; fall back to manual packs and record text‑only Pass, screenshots only for Fails.

4) IDs & Findings Discipline
- Use readable Agent IDs: `<demo-slug>-<role>-<yyyy-mm-dd>-<handle>` (see `docs/SOP/agent-id-conventions.md`).
- Convert any UAT Fail into a Findings row with clear acceptance. Fix → deploy → re‑run only the failing check → mark Pass → sync docs.

5) Wrappers & Registrars
- Centralise Chart.js/i18n: provide a `setupRU()` registrar per demo; call once at host boot; keep idempotent.
- Do not register charts in each component; wrappers assume registration has occurred.
- Trends/dual‑axis: ensure `secondaryAxis` metadata and confidence band support are covered by adapter + wrapper API; include a terse UAT check.

6) Integration Prep (All Demos)
- Export `{ Root }` with no internal BrowserRouter; accept host routing and basename.
- Keep CSS scoped; avoid global resets that leak into host shell. Prefer package styles.
- Package exports: declare dist index in `package.json` `exports`.
- See `docs/SOP/integration-prep-guidelines.md` for acceptance.

7) Stack Guardrails (Tailwind)
- Lock Tailwind to ^3.4 for these demos until a v4 migration plan exists. v4 broke production styling in prior runs.
- Add Renovate ignore for Tailwind major bumps; perform migration in a dedicated branch with Storybook and UAT gates.

8) Evidence & Real‑System Screenshots
- Save real Naumen captures into `docs/UAT/real-naumen/<date>/` (flat). Map image→note in a README and keep the capture narrative (`LOG_notes.md`).
- Do not rely on expiring blob URLs in findings—copy key images into the repo folder if policy allows.

9) Repo Hygiene
- Do not commit backup folders (e.g., `node_modules.bak/`). Remove once a change is stable.
- Keep `scripts/` minimal and documented or prefer the “no‑tools path” in SOPs.

10) Auto‑Review (Lightweight)
- Before closing a pass, verify: tracker row updated; Findings updated; CodeMap has current breadcrumbs; System reports + canonical checklist synced; handoff entry added.
- Use the simple checklist from `docs/SOP/orchestrator-swarm-autoreview.md`.
