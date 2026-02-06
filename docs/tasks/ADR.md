# ADR.md — Vera Pilot: Architectural Decisions (Phase 1)

## [ADR-001] Framework: GramIO (Non-negotiable)
**Decision:** Use **GramIO** as the Telegram bot framework.

**Context:** Development is agent-driven and type-first. We require maximal compile-time correctness and a clean, typed surface area for Telegram API operations.

**Consequences:**
- The codebase is optimized for strict typing and agent implementation loops (compiler feedback as reviewer).
- We accept fewer community examples in exchange for stronger type guarantees.
- We mitigate documentation gaps by vendoring GramIO docs in-repo (already available via `documentation-main.zip`).

---

## [ADR-002] Language & Type System: TypeScript strict mode
**Decision:** Use TypeScript with strict compiler settings. No `any`, no disabling strictness.

**Context:** Agents generate implementation. Strict TS provides a hard constraint system and deterministic feedback loop.

**Consequences:**
- Domain types become the primary spec (`shared/types.ts`).
- Implementation must satisfy types, reducing ambiguity and drift.

---

## [ADR-003] Database: SQLite (Week 1)
**Decision:** Use SQLite as a single-file local database for Phase 1.

**Context:** Phase 1 is single-tenant and small-scale. SQLite minimizes infra and speeds deployment.

**Consequences:**
- Store the minimum required state: participant_user_id ↔ topic_thread_id mapping.
- Add optional message logs for debugging and future alignment, but do not build analytics/UI now.
- PostgreSQL is explicitly deferred until Week 3+ (triggered only by a paying B2B pilot).

---

## [ADR-004] Delivery mode: Long polling (no webhook)
**Decision:** Use long polling (getUpdates) for Phase 1.

**Context:** No public endpoint, no TLS, no webhook infrastructure, minimal ops.

**Consequences:**
- Bot must run continuously (VPS + restart policy) to avoid missed updates.
- We will run exactly one instance (to avoid polling conflicts).
- Webhooks are explicitly out of scope for Phase 1.

---

## [ADR-005] Deployment: Docker Compose on VPS
**Decision:** Deploy using Docker Compose on a VPS, not a laptop.

**Context:** Pilot must be stable during real course operations. VPS reduces risk from sleep mode, home internet issues, and local restarts.

**Consequences:**
- Docker Compose includes restart policy.
- SQLite DB stored on a mounted volume.
- Operational runbook will be included (start/stop/logs/backup).

---

## [ADR-006] Framework-agnostic domain logic
**Decision:** Separate “domain logic” from Telegram framework objects.

**Context:** Even with GramIO fixed, isolating domain logic reduces accidental coupling and keeps code understandable for agents and future refactors.

**Consequences:**
- Create a small domain layer that exposes functions like:
  - `getOrCreateConversation(participant_user_id) -> topic_thread_id`
  - `relayParticipantMessage(...)`
  - `relayOrganizerReply(...)`
- GramIO layer becomes a thin adapter translating Telegram updates into domain calls.

---

## [ADR-007] Future alignment (non-scope): data structures for AI + experimentation
**Decision:** Shape Phase 1 storage so Phase 2+ can safely build on it without migrations pain.

**Context:** We will rewrite/extend later for GetCourse, AI training, and A/B testing. We do NOT implement any of that now, but we avoid painting ourselves into a corner.

**Consequences (Phase 1 only stores what is safe/needed):**
- Every record includes `desk_id` even in single-tenant mode.
- Conversations have a stable `conversation_id` (UUID) to anchor future logs.
- Message logs (optional) store metadata needed for future analytics/AB testing:
  - direction (participant→org / org→participant)
  - timestamps
  - Telegram message ids (from/to)
  - error fields when relays fail
- No consent flows or AI usage is implemented in Phase 1; those are deferred.

---

## [ADR-008] Message relay: copyMessage (not forwardMessage)
**Decision:** Use `copyMessage` for all relay operations, never `forwardMessage`.

**Context:** Telegram allows users to enable "protected content" which blocks forwarding. Additionally, `forwardMessage` shows "Forwarded from" header which breaks the illusion of direct communication.

**Consequences:**
- All relay uses `copyMessage` with `message_thread_id` parameter
- If `copyMessage` fails for unsupported message type, fall back to text summary
- Never attempt `forwardMessage`

**Source:** Telegram Bot API docs explicitly state protected content cannot be forwarded.
