# Project Brief

## Repo Snapshot
- Monorepo for SanghaDesk, a Telegram inbox dashboard for spiritual teachers. Expected structure: `frontend/` (Next.js + Tailwind UI), `backend/` (Express + TypeScript APIs), `shared/` for types, `data/` for SQLite, plus root scripts and docs.

## Current Goal
- Deliver the SanghaDesk MVP: a local-first Telegram inbox with auth, onboarding, dashboard messaging, settings, pricing, and a working Telegram relay flow.

## Constraints
- 100% local: no external services or APIs beyond Telegram bot relay; data stored in SQLite.
- Mock auth and mock payments only; no OAuth or real billing.
- Tech stack fixed: Next.js frontend + Express backend + TypeScript, single `npm run dev` startup.
- Primary language Russian with English fallback; responsive across desktop, tablet, and mobile.
- Reuse and adapt existing tgorgbot relay code as the messaging engine.

## Non-goals
- Production-grade payments, OAuth, or third-party integrations.
- New channels beyond Telegram or native mobile apps.
- Advanced enterprise features (assignment routing, deep analytics) beyond the MVP.

## Success Signals
- `npm run dev` boots frontend and backend locally with SQLite persistence.
- Telegram DM relay appears in the dashboard and replies send from the UI.
- MVP pages and flows match the spec: landing, auth, onboarding, dashboard, settings, pricing, checkout.
- Polling/real-time behavior and empty/loading states work as described.
