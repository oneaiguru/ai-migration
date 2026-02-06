# Task: FreeGate localhost demo (web + mock API + SQLite)

## Task brief
Build a localhost-only FreeGate VPN demo with a Next.js + Tailwind web UI and a Node/SQLite mock API that follow `vpn-saas-spec.md`, keeping `android/` assets unchanged.

## Constraints
- Localhost only; no external services or network dependencies.
- Use Next.js, Tailwind CSS, Node.js, and SQLite.
- Mock payments, metrics, and VPN sessions per the spec (no real integrations).
- Keep `android/` assets unchanged unless explicitly requested.
- Use a single source of truth for mock API responses.

## Required reading
- AGENTS.md
- HANDOFF_CODEX.md
- PROJECT_BRIEF.md
- vpn-saas-spec.md
- docs/INTEGRATION_GUIDE.md
- docs/VPN_PACKAGE_README.md
- specs/*
- android/

## Acceptance criteria
- Web UI implements the key flows and pages described in `vpn-saas-spec.md` (onboarding/auth/guest, dashboard, servers, pricing, settings, account, admin).
- Mock API endpoints match the spec and are backed by a SQLite schema + seed data.
- Local run instructions exist and the loop documentation remains consistent with repo workflow.
- Android assets remain untouched.
