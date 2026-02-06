# Plan: freegate-localhost-demo

## Metadata
- Task: docs/Tasks/freegate-localhost-demo.task.md
- Research: docs/Tasks/freegate-localhost-demo.research.md
- Related docs: vpn-saas-spec.md, docs/INTEGRATION_GUIDE.md, docs/VPN_PACKAGE_README.md, PROJECT_BRIEF.md, AGENTS.md

## Desired End State
- Next.js + Tailwind web UI delivers the onboarding/auth/guest, dashboard, servers, pricing, settings, account, and admin flows described in the spec, with real data from the mock API.
- Node/SQLite mock API implements the full endpoint surface and persists to a SQLite database seeded from the spec.
- Local run instructions are documented; `android/` assets remain unchanged.

## Key Discoveries
- vpn-saas-spec.md:476-1036 — user journeys to map into UI flow/state transitions.
- vpn-saas-spec.md:1067-1877 — web/mobile screen components, states, and API calls to implement in UI.
- vpn-saas-spec.md:1970-2917 — complete mock API endpoints to implement.
- vpn-saas-spec.md:2924-3115 — SQLite schema to use as the single source of truth.
- docs/INTEGRATION_GUIDE.md:1-131 — Android integration context; web work must not touch Android assets.
- docs/VPN_PACKAGE_README.md:1-53 — Android package contents; keep assets unchanged.
- PROJECT_BRIEF.md:3-23 — stack/localhost constraints.
- AGENTS.md:5-25 — workflow constraints, no push/PR without request.

## What We're NOT Doing
- No external services, real payments, or production VPN integration.
- No modifications to `android/` assets or JNI integration.
- No deployment work beyond localhost.

## Implementation Approach
- Scaffold a Next.js app with Tailwind, then implement route-based pages for the required flows.
- Implement mock API route handlers in Node (Next.js route handlers) backed by SQLite, using the spec schema and seed data as the single source of truth.
- Build UI states to consume API data directly, avoiding placeholders or stubs unless explicitly allowed by the spec.
- Document local run instructions and keep loop docs consistent with repo workflow.

## Phase 1
### Overview
Set up the app scaffold, database, API routes, and core UI flows aligned with the spec.
### Changes Required
1. **File**: package.json
   **Changes**: Add Next.js, Tailwind, SQLite deps and scripts for dev/lint/typecheck/seed.
   ```
   npm install
   npm run lint
   npm run typecheck
   ```
2. **File**: next.config.js, tailwind.config.js, postcss.config.js
   **Changes**: Configure Next.js and Tailwind for the web UI stack.
3. **File**: app/**
   **Changes**: Create landing, pricing, signup, login, dashboard, servers, settings, account, and admin pages with shared UI components and data loading.
4. **File**: app/api/**
   **Changes**: Implement endpoints listed in vpn-saas-spec.md:1970-2917 using Node runtime and SQLite.
5. **File**: lib/db/** (or similar)
   **Changes**: Initialize SQLite, apply schema from vpn-saas-spec.md:2924-3115, and seed data.
6. **File**: README.md (or docs/SESSION_HANDOFF.md)
   **Changes**: Add local run instructions and a short API overview.

## Tests & Validation
- `npm run lint`
- `npm run typecheck`
- Manual smoke: `npm run dev`, visit key routes, and hit a few API endpoints to confirm responses.

## Rollback
- Use `git status` to list files and `git restore` to revert; delete the SQLite db file if created.

## Handoff
- Update docs/SESSION_HANDOFF.md with touched files and test results.
