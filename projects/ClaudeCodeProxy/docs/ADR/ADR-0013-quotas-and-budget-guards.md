# docs/ADR/ADR-0013-quotas-and-budget-guards.md

Status: Accepted
Date: 2025-10-23 10:44 UTC

Decision
Enforce **warn/block** at two layers:
- Rolling window (token/time).
- Weekly cap (hours or tokens).

Rationale
- Mirrors vendor reality (5-hour windows + weekly caps).
- Gives operators heads-up before vendor failure.

Consequences
- Config via `~/.config/ccp/quotas.json` with hot reload (POST /v1/quotas/reload).
- CLI HUD surfaces warn at 80% and blocks at 100%; `decision:"quota_block"` is logged.
- Token parsing is best-effort per provider; fall back to time-based accounting.

Migration
- None. Add token extractors and extend QUOTAS.md with examples.
