# Project Brief

## Repo Snapshot
- This repo contains a production Salesforce-QuickBooks integration: Node.js middleware in `src/` and `deployment/`, Salesforce metadata in `force-app/` and `deployment-package*/`, plus extensive operational docs. It is currently optimized for integration maintenance and deployments, not a SaaS product UI.

## Current Goal
- Stand up SyncFlow, a local-only micro-SaaS product based on the existing integration, using the spec in `~/Downloads/qbsfsaas.md`.

## Constraints
- Localhost only; no external services or real API calls.
- Follow the SyncFlow spec (`~/Downloads/qbsfsaas.md`) as the primary source of truth.
- Use Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma + SQLite, Zustand.
- Keep existing QB/SF integration code and Salesforce metadata unchanged unless explicitly tasked.
- Do not commit secrets; use `.env` templates for any local config.
- Avoid destructive commands; preserve legacy assets.

## Non-goals
- Production deployment or real OAuth connections.
- Refactors of the existing middleware or Salesforce metadata.
- Migrating current integration logic into production services.
- Rewriting legacy docs or task histories.

## Success Signals
- A new local SyncFlow app exists (planned under `syncflow/`) and runs on localhost.
- Core pages from the spec render: landing, pricing, auth, dashboard, connections, automations, sync logs, billing (mock).
- Mock OAuth and sync flows work end-to-end with local SQLite data.
- Lint/tests for the new app pass (if present).
