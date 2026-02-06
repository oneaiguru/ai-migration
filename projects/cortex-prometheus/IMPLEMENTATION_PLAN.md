# IMPLEMENTATION_PLAN

Project goal:
- Build the FleetPulse MVP per `specs/cortexfleet.md`, reusing existing monitoring assets where helpful.

P0
- [ ] Create backend scaffold (Flask app, SQLite init, config) under `backend/` and wire seed data (demo account + vehicles).
- [ ] Implement auth endpoints (signup/login/logout) with session/JWT cookies and user model.
- [ ] Implement vehicles API + metrics generation endpoints; include limits and vehicle detail.
- [ ] Frontend scaffold (Next.js + Tailwind) with layout shell and auth pages (landing, login, signup, verify).
- [ ] Fleet Overview + Vehicle Detail pages wired to API; include loading/empty/error states.
- [ ] Alerts API + UI (alerts list, acknowledge) and default alert rules mapped from `config/prometheus-rules.yml`.
- [ ] Settings + notifications + pricing/checkout flows (mocked payment and plan updates).
- [ ] Onboarding + Add Vehicle flow with install instructions derived from existing scripts.

P1
- [ ] Adapt `scripts/install_node_exporter.sh` and `scripts/install_windows_exporter.ps1` to register with the FleetPulse API.
- [ ] Add local dev `docker-compose` for frontend/backend (optional if needed).
- [ ] Document local dev steps in README if anything changes.

Notes
- Keep `config/`, `kubernetes/`, and existing scripts unchanged unless a task requires edits.
- No automated tests yet; track gaps as tasks land.
