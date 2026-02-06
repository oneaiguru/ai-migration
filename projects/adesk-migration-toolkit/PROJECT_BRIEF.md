# Project Brief

## Repo Snapshot
- This repo is a PHP CLI toolkit that migrates VIPFLAT CSV exports into Adesk via API v1. The entrypoints are shell scripts and PHP scripts in the repo root (for example `run_migration.sh`, `migrate.php`, `migrate_simple.php`).
- Core logic lives in `classes/` (AdeskApi, DataExporter, IdMapper, Logger) plus configuration in `config.php`. CSV inputs live under `newfiles/`, logs in `logs/`, and ID mappings in `data/mappings/`.

## Current Goal
- Build the local-only MigrateFlow web app described in `specs/adesk.md`, porting the existing PHP migration logic into a new Next.js + Express + SQLite stack while keeping the legacy toolkit intact.

## Constraints
- Follow the product spec in `specs/adesk.md` as the single source of truth.
- No external services or real payments; all auth and billing are mocked and local-only.
- Keep the existing PHP migration toolkit unchanged so it remains a reference and fallback.
- Use Next.js 14 + Tailwind for the frontend, Express + Node.js for the backend, and SQLite for persistence.
- Preserve migration order and mapping behavior from `migrate.php` and `config.php`.

## Non-goals
- Shipping a production-ready SaaS or real Adesk integrations.
- Rewriting or refactoring the existing PHP CLI scripts.
- Adding new migration features outside the spec.

## Success Signals
- `migrateflow/` runs locally with a single `npm run dev` entrypoint and persists data in SQLite.
- Auth, onboarding, dashboard, and migration flows match the spec and work end-to-end with mocked data.
- Ported services (logger, id mapper, csv parser, validator, migration engine) behave consistently with the PHP originals.
