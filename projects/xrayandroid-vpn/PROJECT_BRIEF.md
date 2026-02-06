# Project Brief

## Repo Snapshot
- This repo is a bundle of Android VPN implementation assets (Kotlin services/activities, JNI bridge, layout XML, config template) under `android/`, plus integration docs in `docs/`. The product vision for the FreeGate VPN micro-SaaS lives in `vpn-saas-spec.md`. There is no web/backend code yet.

## Current Goal
- Build a localhost-only FreeGate VPN demo (web UI + mock API + SQLite) that follows `vpn-saas-spec.md`, while keeping the Android assets intact for future reuse.

## Constraints
- Localhost only; no external services or network dependencies.
- Use the specified stack: React + Next.js + Tailwind CSS + Node.js + SQLite.
- Mock payments, metrics, and VPN sessions as described in the spec.
- Do not modify or move existing Android assets unless explicitly required for documentation.

## Non-goals
- Production-ready VPN infrastructure or real Xray server integration.
- Real payment processing, email, or third-party auth.
- iOS/desktop clients or server fleet management beyond mock data.

## Success Signals
- The repo contains a runnable local web app and API with the key flows in the spec (onboarding, auth/guest, dashboard, servers, settings, pricing, admin).
- SQLite schema and seed data mirror the spec endpoints and responses.
- Run instructions are documented and the Ralph loop can start cleanly.
