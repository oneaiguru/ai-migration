# IMPLEMENTATION_PLAN

Project goal:
- Build the local-only MigrateFlow web app described in `specs/adesk.md`, porting the PHP migration toolkit into a Next.js + Express + SQLite stack while keeping the legacy CLI intact.

P0
- [ ] Scaffold `migrateflow/` with `frontend/` (Next.js 14 + Tailwind) and `backend/` (Express), plus a root `package.json` that runs both with `npm run dev`.
- [ ] Add SQLite schema and seed data per spec; create a backend db helper for queries and migrations.
- [ ] Port `Logger.php` and `IdMapper.php` into `backend/src/utils/` with SQLite-backed mappings.
- [ ] Port `DataExporter.php` and `csv-validator.php` into `backend/src/services/` (CSV parsing + validation).
- [ ] Implement `migrationEngine.js` and `mockDestination.js`, preserving entity order and mapping behavior from `migrate.php`.

P1
- [ ] Implement mocked auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`) and user model.
- [ ] Implement projects + files endpoints for onboarding (`/api/projects`, `/api/files/upload`, `/api/files/:id/preview`).
- [ ] Build shared UI components (Button, Input, Card, Modal) and global styles.
- [ ] Create Auth modal, Onboarding wizard, and Dashboard shell using mocked data.

Notes
- Keep existing PHP CLI scripts untouched as reference and fallback.
- All auth, billing, and destination calls are mocked; no external APIs.
