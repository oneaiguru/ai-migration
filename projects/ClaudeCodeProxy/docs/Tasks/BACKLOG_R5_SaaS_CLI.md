Title
Backlog — R5 SaaS for CLI Tools

Legend: S (≤0.5d), M (1–2d), L (3–5d)

Epics
1) Identity & Licensing (MVP)
- [M] Device flow OAuth stub; CLI `ccp login` (AC: persist pack; renew; logout).
- [M] License pack issue/verify (Ed25519); entitlements: zai_offload, dashboards, privacy tier (AC: e2e verify).
- [S] License status API + CLI `ccp status` (AC: plan/features/expiry shown; errors clear).

2) Ingest & Dashboards (MVP)
- [M] /v1/ingest/rollups (Minimized) + org/seat attribution (AC: idempotent, authenticated, k-safety).
- [M] Model health API + simple server‑rendered charts (AC: 24h/7d views; CSV export).
- [S] CLI `ccp export rollups` (AC: sends last N hours; handles backoff).

3) Billing (MVP — Polar first)
- [M] Polar checkout/paywall; webhook → license activation (AC: license issued on payment; seat mapping by GitHub handle/email).
- [S] Grace periods/downgrade path (AC: license deactivated on webhook events; friendly messaging).
- [L] Stripe alt path (fallback) (AC: basic subscription, webhook to license state).

4) Policy Packs (Beta)
- [M] Hosted policy distribution; dev/prod channels; signature verification (AC: hot reload; cache fallback).
- [S] CLI `ccp policy status/reload` (AC: shows active channel & version).

5) Org Admin (Beta)
- [M] Seats & invites; audit log (AC: basic UI).
- [S] SSO/SAML stub + plan for GA (AC: design + placeholder).

6) IDE/Bot/Slack (GA)
- [M] VS Code thin extension (approve steps; diffs; commit) (AC: works with local CCP & SaaS).
- [M] GitHub reviewer bot (Checks API + comments) (AC: minimal rule set; rate‑limit safe).
- [S] Slack `/ccp run` + progress updates (AC: slash command; simple interactivity).

7) Packaging/Signing (GA)
- [M] brew tap + notarize; winget; deb (AC: signed installers; CI pipeline).

R4 items moved to backlog (optional polish)
- [S] CLI: `cc db status/export/import`; sample TTL/import tool.
- [S] Quotas: source long horizon from store (read path already in‑memory).

Acceptance (R5 MVP)
- Login works; paid plan enables entitlements; Minimized ingest stable; billing updates license state; basic dashboards usable.
