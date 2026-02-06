## Docs Packet – Unified Demo (Pilot)

Goal
- Mount Employee Management and Scheduling under one shell with routes `/employees` and `/schedule`. Single Vercel deploy.

Where
- Shell repo: `${UNIFIED_DEMO_REPO}`
- Packages: `packages/employee-management`, `packages/schedule`

Order of Work
1. Integrator: scaffold workspaces and the shell; add routes; call RU registrar at root.
2. Prep agents: export `Root` from each package; avoid internal routers; confirm basename routing.
3. First deploy; run smoke UAT; fix any shell/hydration issues.
4. Document CodeMap and outcome in SESSION_HANDOFF.md.

Acceptance
- /employees and /schedule render without console errors; visuals unchanged.
- UAT smoke confirms “looks like a single product”.
