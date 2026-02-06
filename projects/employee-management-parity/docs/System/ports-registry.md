# Local Ports Registry (Demos + Unified Shell)

Purpose
- Keep local dev ports unique across all demos and the unified shell. Agents must edit this file to claim/confirm a port. One line per demo, flat list.

Rules
- Only edit this file when claiming/confirming a port.
- Use `http://127.0.0.1:<port>/` in your local dev/preview scripts.
- Pick a unique port (not used below). If a port is marked Reserved, use it and flip Status → Confirmed.

Registry
| Demo | Local URL | Port | Status | Owner/Agent ID | Notes |
| --- | --- | --- | --- | --- | --- |
| Employee Portal (WFM) | http://127.0.0.1:4180/ | 4180 | Confirmed | employee-portal-exec-2025-10-28-codex | Use `npm run dev -- --port 4180` or Vite config |
| Manager Portal | http://127.0.0.1:4147/ | 4147 | Confirmed | manager-portal-exec-2025-10-31-codex | As before; keep 4147 |
| Schedule Grid System | http://127.0.0.1:4174/ | 4174 | Reserved | scheduling-exec-YYYY-MM-DD-<handle> | Pilot default (Vite preview often used 4174) |
| Analytics Dashboard | http://127.0.0.1:4160/ | 4160 | Confirmed | analytics-dashboard-exec-2025-10-26-codex | Listening via `npm run dev -- --port 4160` |
| Forecasting & Analytics | http://127.0.0.1:4155/ | 4155 | Confirmed | forecasting-analytics-scout-2025-10-27-codex | Use `npm run preview -- --host 127.0.0.1 --port 4155` |
| Employee Management (library/demo) | http://127.0.0.1:4170/ | 4170 | Confirmed | employee-management-exec-2025-10-13-codex | Use `npm run dev -- --port 4170` |
| Unified Demo (shell) | http://127.0.0.1:4190/ | 4190 | Confirmed | unified-demo-exec-2025-10-14-codex | Run shell via `npm run dev -- --port 4190` |

How to claim a port
1) Pick the line for your demo. If Status = Reserved, use that port.
2) Update Status → Confirmed and set Owner/Agent ID (see `docs/SOP/agent-id-conventions.md`).
3) Run your dev server on the assigned port, e.g. `npm run dev -- --port <port>` (or configure Vite to use it).
4) Do not reuse ports already marked Confirmed.
