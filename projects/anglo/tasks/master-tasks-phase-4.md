# MASTER TASKS: PHASE 4 — BACKEND + INTEGRATION (v1.3)
Updated: 2026-01-05

Phase 4 goal: provide **real backend behavior** that preserves the psychological loop:

- course looks real (map/sections/stories/checkpoints)
- lesson + review completion updates streak reliably
- spaced repetition has real per-item state + daily queue
- outage/offline does not destroy streak trust
- account upgrade merges local progress safely
- persistence is real (DB), not in-memory Maps

This revision is a direct response to Golden Path gaps identified in validation:
- No /me/review/queue and no persisted SRS state
- No course map API (sections/nodes)
- Streak uses UTC instead of user timezone; no repair semantics
- Audio and story content not represented in content schema

---

## Source of truth
- Feature specs: `projects/anglo/apps/pwa/tests/features/**`
- Tiering: `projects/anglo/FEATURE_TIERING_MATRIX.md`
- RU compliance: `projects/anglo/apps/pwa/tests/features/compliance/242fz-data-localization.feature`

---

## Hard rules for Phase 4

### 1) Real persistence for @core
No in-memory stores for:
- progress snapshot (XP, completions)
- streak state / activity days
- spaced repetition item states
- sync idempotency acks
- appeals/reports

Use **SQLite** for MVP (file-based, works on RU-hosted infra). Postgres can come later.

### 2) Time semantics
- Every completion event includes `occurredAt` (UTC ms) and `timezoneOffsetMinutes`.
- Streak day is computed using **the user’s local timezone** (offset at time of event).

### 3) Content is file-based (clean-room)
Course content lives in the repo (or in a mounted CONTENT_ROOT) and is loaded by the API.
No scraping / no Duolingo data.

### 4) Payments are @core (YooKassa Mir/SBP web checkout)
Ship entitlements + Max info endpoints and a **real provider-hosted checkout** flow for PWA + RuStore.
SBP must support bank-app handoff + return (TWA-safe return URL).
Entitlements must be granted only from **verified, idempotent webhook events**; CI uses a FakeBillingProvider (no external network).

---

# Locked Before Phase 4 (v1.3.1 payments)
- Webhook payload shape: YooKassa `notification` with `{ type, event, object }`
- Webhook verification: IP allowlist primary; API status verify optional; API-only if IP allowlist not feasible
- Receipt line item format (54-FZ): payment_subject="service", payment_mode="full_payment", vat_code mapping 1-6; default vat_code=1
- Plan: max_30d_pass at 500.00 RUB (non-renewing 30-day pass)
- Return URL supports SBP bank-app handoff + return in TWA
- Entitlements unlock within <10 seconds after confirmation (p95)
- Provide "Restore purchases / Sync entitlements" behavior if callback fails

---

# ============================================================
# CONTENT INTEGRATION (REQUIRED CLARITY)
# ============================================================

## Recommended on-disk format (JSON)
Use JSON (not TypeScript) so content can be generated from your curriculum pipeline.

### Repo location
Put RU→EN content in:
- `packages/content/courses/ru-en/`

Recommended structure:
```
packages/content/courses/ru-en/
  course.map.json                # CEFR sections, units, nodes, counts
  lessons/
    a1_u1_l1.json
    a1_u1_l2.json
    ...
  stories/
    a1_story_01.json
  checkpoints/
    a1_checkpoint.json
  placement/
    placement_test_v1.json
  assets/
    audio/
      a1/
        hello.mp3
        ...
```

### How endpoints read it
- Content service reads JSON files from `CONTENT_ROOT` (env override) or the default monorepo path.
- Validate JSON with Zod at load time (fail fast in dev).

### Minimum “credibility slice” required in repo
Even if the full curriculum is external, the repo must include:
- A1 Unit 1: **5 lessons**
- Each lesson: **6–12 exercises**
- At least **1 listening exercise** with a working audio URL
- At least **1 story** with per-line audio
- At least **1 checkpoint test** node visible in the map

---

# ============================================================
# SPACED REPETITION ALGORITHM (EXPLICIT)
# ============================================================

We will implement an SM-2-style model with an explicit “strength” proxy.

## Per-item stored state
For each `(userId, itemId)`:
- `reps` (int) — consecutive correct reviews (SM-2 repetitions)
- `intervalDays` (float)
- `ease` (float) — easiness factor (min 1.3)
- `dueAt` (UTC ms)
- `lastReviewedAt` (UTC ms)
- `lapses` (int)
- `strength` (0..5) — derived for UI (optional), e.g. `min(5, floor(reps/2)+1)`

## Inputs
Quality score `q` in 0..5.
Mapping:
- Lesson correct → q=4
- Lesson typo/close miss → q=3 (optional)
- Lesson wrong → q=1
- Review correct fast → q=5 (optional)
- Review wrong → q=1

## Pseudocode (SM-2)
```text
function review(itemState, q, now):
  if itemState is null:
    itemState = { reps:0, intervalDays:0, ease:2.5, dueAt: now, lapses:0 }

  if q < 3:
    itemState.lapses += 1
    itemState.reps = 0
    itemState.intervalDays = 1
    itemState.ease = max(1.3, itemState.ease - 0.2)   # gentle penalty
  else:
    itemState.reps += 1
    itemState.ease = max(1.3,
      itemState.ease + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
    )
    if itemState.reps == 1: itemState.intervalDays = 1
    else if itemState.reps == 2: itemState.intervalDays = 6
    else itemState.intervalDays = round(itemState.intervalDays * itemState.ease)

  itemState.lastReviewedAt = now
  itemState.dueAt = now + itemState.intervalDays * 86400s
  return itemState
```

## Daily queue generation
```text
function buildQueue(userId, now, limit=10):
  due = items where dueAt <= now
  sort due by (dueAt asc, ease asc, lastReviewedAt asc, itemId asc)

  if len(due) >= limit:
     return first limit of due, dueCount=len(due)

  # fill with weak items not due yet
  notDue = items where dueAt > now
  sort notDue by (dueAt asc, ease asc, lastReviewedAt asc, itemId asc)   # soonest + weakest first

  queue = due + take(notDue, limit - len(due))
  return queue, dueCount=len(due)
```

Tie-breakers:
- Use `dueAt`, then `ease`, then `lastReviewedAt`, then `itemId` for stable ordering.

Overdue backlog handling:
- If >200 items overdue, still return `limit` items; show dueCount to inform the UI.

"Weak" definition:
- Consider an item weak if `strength <= 2` OR `ease <= 2.0`.
- Only fill from weak items that are not due yet if the due queue is short.

---

# ============================================================
# STREAK REPAIR MECHANICS (EXPLICIT)
# ============================================================

Goal: protect streak trust during outages without letting users arbitrarily “undo” misses.

## Incidents model
Store incidents (global or region-tagged) in DB:
- `id`
- `startsAt` (UTC ms)
- `endsAt` (UTC ms)
- `title`
- `severity` (info|major)

## Grace window
A missed day affected by an incident can be repaired until:
- `incident.endsAt + 72 hours`

## Eligibility
A user can repair a specific local dayKey if:
- That dayKey intersects an incident window (converted to the user’s timezone)
- The user’s streak broke because that dayKey is missing in activity days
- The user had an active streak immediately before the missed day (streak >= 1)
- Anti-abuse evidence threshold (required):
  - at least one `app_open`, `lesson_started`, or `exercise_answered` event logged that day (synced later)

### Rate limiting (anti-abuse)
- Max 1 repair per user per 30 days.
- Max 3 repairs per user per rolling 365 days.

### Monitoring
- Alert if daily repair requests exceed baseline by 3x (or >50/day) and review for abuse.
- Baseline = rolling 7-day average per region (fallback to global if region unavailable).

## Repair action
Repair inserts a `repaired_day` record for that dayKey (similar to a “freeze day” but marked as incident repair), then recomputes streak.
Require a durable attempt marker for evidence checks:
- Table `study_attempt_days(userId, dayKey, firstAttemptAt, lastAttemptAt)`
- Upsert on any `app_open`, `lesson_started`, or `exercise_answered` event during sync

## User flow
- Client fetches `/status/incidents` and `/me/streak`
- If eligible days exist, show incident banner (CTA “Восстановить”; see Phase 3 05.4a for copy)
- CTA calls `POST /me/streak/repair { dayKey }`
- Server returns updated streak snapshot

---

# ============================================================
# AGENT TASKS
# ============================================================

# ============================================================
# AGENT_19 — API FOUNDATION + DB
# ============================================================

## Goal
Add SQLite persistence and shared DB layer.

## Tasks (@core)
- Add SQLite dependency (choose one):
  - `better-sqlite3` (fast, sync), or
  - `sqlite3` + promise wrapper
- Create `apps/api/src/db/db.ts`:
  - opens DB file from `DB_PATH` env (default `apps/api/data/dev.sqlite`)
  - runs migrations on startup
- Create migrations for tables required in this plan:
  - users
  - progress_snapshots
  - activity_days
  - placement_attempts
  - srs_items
  - streak_freezes
  - incidents
  - repaired_days
  - appeals_reports
  - sync_acks (or event_acks)
  - entitlements
  - billing_events
  - billing_payments

Acceptance criteria:
- Restart API server → progress/streak/SRS still present.

---

# ============================================================
# AGENT_20 — AUTH + USER SETTINGS (TIMEZONE)
# ============================================================

## Goal
Support anonymous and registered users; store timezone.

## Tasks (@core)
- Users table fields:
  - id
  - email (nullable for anonymous)
  - password_hash (nullable for anon)
  - created_at
  - timezone_offset_minutes (nullable)
- Add endpoint `POST /me/timezone`:
  - stores user timezone offset (minutes)
  - called by client on first launch and when offset changes

Acceptance criteria:
- Streak calculations can use stored timezone when events omit offset.

---

# ============================================================
# AGENT_21 — CONTENT SERVICE + COURSE MAP API
# ============================================================

## Goal
Provide content endpoints that match UI requirements.

## Tasks (@core)

### 21.1 Content loader
Implement `content.ts` that:
- resolves `CONTENT_ROOT` or default monorepo path
- reads and validates JSON:
  - course.map.json
  - lessons/*.json
  - stories/*.json
  - checkpoints/*.json
  - placement/*.json

### 21.2 Endpoints
Implement:
- `GET /courses/:courseId/map` → returns full CourseMapDTO
- `GET /courses/:courseId/lessons/:lessonId` → returns lesson JSON
- `GET /courses/:courseId/stories/:storyId` → returns story JSON
- `GET /courses/:courseId/checkpoints/:checkpointId` → returns checkpoint JSON
- `GET /courses/:courseId/placement-test` → returns placement test content

### 21.3 Static assets (audio)
Serve `packages/content/courses/**/assets/` at `/assets/` via fastify static plugin.
Return audio URLs as `/assets/audio/...`.

### 21.4 Exercise difficulty metadata
- Each exercise in content JSON has `difficulty: 1-5`
- Validation: all exercises must have difficulty field
- A1 Unit 1 exercises are capped at difficulty 1-2
- Micro-win lesson exercises are ALL difficulty 1

### 21.5 Review Injection Rules (v1.3.1)
- `GET /courses/:courseId/lessons/:lessonId` accepts optional `userId` parameter
- If userId provided, inject review items per AGENT_22.5 rules:
  - Default: lessons are 100% new content (no interleaving)
  - Only interleave if review debt is high:
    - overdueCount > 20 AND lastReviewCompletedAt > 3 days ago
  - If interleaving is active:
    - Inject up to 30% review by exercise count
    - Pull due review items (dueAt <= now) first
    - If not enough due items, fill with weak items (strength <= 2, not reviewed in last 6h)
  - If user has <5 total learned items or no eligible review items, return `reviewCount = 0`
- Response includes:
  - `reviewCount` for analytics
  - per-exercise `isReview: boolean` flag (no `reviewExerciseIds`)
- Review exercises look identical to new exercises; no "Review" label in UI

Acceptance criteria:
- Curl a lesson → includes at least one audio URL
- Curl an audio URL → returns audio bytes

---

# ============================================================
# AGENT_21B — CONTENT DEPTH ENFORCEMENT (BUILD-TIME CHECK)
# ============================================================

## Goal
Prevent shipping “demo-like” content.

## Tasks (@core)
Add a dev-only script `pnpm content:validate` that asserts:
- A1 Unit 1 has ≥5 lessons
- Each lesson has 6–12 exercises
- ≥1 listen exercise exists in Unit 1
- ≥1 story exists in A1
- ≥1 checkpoint exists in course map

Acceptance criteria:
- CI fails if content slice is too shallow.

---

# ============================================================
# AGENT_22 — PROGRESS + STREAK + FREEZE (LOCAL TIMEZONE)
# ============================================================

## Goal
Make streak and progress correct and offline-safe.

## Tasks (@core)
- Store activity per local dayKey:
  - `activity_days(userId, dayKey, source, occurredAt)`
- Implement `POST /me/progress/lesson-complete` that writes:
  - completion event
  - XP update
  - activity day
  - optional milestone triggers (day 10)
- Implement `GET /me/progress` returns progress snapshot:
  - totalXp
  - completedLessons
  - currentSection/unit pointers
  - unlocked sections
- Implement `GET /me/streak` returns:
  - currentStreak
  - bestStreak
  - lastCompletedDayKey
  - atRisk (boolean)
- Streak calculation must use local dayKey from event timezone offset.

### Freeze (earned, not paid-only)
- Table `streak_freezes(userId, owned, equipped)`
- Auto-consume on missed day when equipped:
  - create frozen day record
  - decrement equipped/owned
- Grant 1 freeze at streak day 10 (or configurable milestone)
- Cap v1.3: max 1 freeze owned at a time; additional grants are ignored until consumed.

### 22.5 Review Injection Rules (v1.3.1)
Default: lessons are 100% new content (no interleaving).

Interleave only when review debt is high:
- Condition: overdueCount > 20 AND lastReviewCompletedAt > 3 days ago
- If condition met:
  - Inject up to 30% review by exercise count
  - Pull due review items (dueAt <= now) first
  - If not enough due items, fill with weak items (strength <= 2, not reviewed in last 6h)
- If user has <5 total learned items or no eligible review items, use 0 review (all new)

Exercise appearance:
- Review exercises look identical to new exercises
- No "Review" label in UI
- Only analytics knows which is which (track `isReview: boolean`)

### 22.6 Placement test submit + retake
- `POST /me/placement/submit`:
  - input: `{ attemptId, answers }`
  - output: `{ level, recommendedUnitId, unlockedUnits }`
- Store placement attempts in `placement_attempts` (attemptId unique).
- Retake cooldown: allow retake only if `now >= lastPlacementAt + 30 days`.
  - If not eligible, return `nextEligibleAt`.
- Apply results:
  - set `recommendedUnitId` + `placementLevel` in progress snapshot
  - unlock units up to recommendedUnitId
  - never remove completed lessons or lock existing progress (lower placement only changes recommendation)
 - Scoring rules (v1.3):
   - 10 questions total (A1→B1 difficulty ramp).
   - A1 placement: 0-5 correct → `level = A1`, `recommendedUnitId = A1-U1`.
   - A2 placement: 6-8 correct → `level = A2`, `recommendedUnitId = A2-U1` (unlock A1 units).
   - B1 placement: 9-10 correct → `level = B1`, `recommendedUnitId = B1-U1` (unlock A1+A2 units).
   - Users may place into later units; skipping Unit 1+2 is allowed by unlocking earlier units for optional review.

Acceptance criteria:
- User in UTC+3 practicing at 23:30 local credits correct dayKey.
- Freeze consumption prevents streak reset on a single missed day.
- Established learner sees 100% new content unless review debt is high; new learner (<5 items) gets `reviewCount = 0`.
- When interleaving is active, SRS item strength updates from interleaved answers same as explicit review.
- Analytics can distinguish new vs review performance.
- Day 1 with no due items returns `reviewCount = 0` and no duplicates.
- Placement retake is blocked before 30 days and does not delete progress when allowed.

---

# ============================================================
# AGENT_22B — INCIDENTS + STREAK REPAIR ENDPOINTS
# ============================================================

## Goal
Implement outage-safe streak repair.

## Tasks (@core)
- `GET /status/incidents` returns active/recent incidents (last 14 days)
- `GET /me/streak/repair/options` returns eligible dayKeys for this user
- `POST /me/streak/repair { dayKey }` performs repair if eligible

Acceptance criteria:
- A seeded incident allows repair for impacted day within 72 hours after end.
- Repair recomputes streak correctly and is idempotent.

---

# ============================================================
# AGENT_23 — MONETIZATION POLICY (NO HEARTS) + MAX INFO
# ============================================================

## Goal
Disable hearts for RU launch; provide Max info endpoints.

## Tasks
- Policy config endpoint includes:
  - `hearts_enabled` (default false for RU)
  - `hearts_start` (future-only, non-blocking)
- `GET /max/benefits` returns a static list of benefits (used by UI)

Acceptance criteria:
- No hearts gating in RU launch; review remains available.
- Max info endpoint works.
- Default config for RU: `hearts_enabled=false` (runtime-configurable, not build-time).

---

# ============================================================
# AGENT_23B — REAL CHECKOUT (MIR/SBP) via YooKassa
# ============================================================

## Goal
Ship production-grade MIR card + SBP checkout using YooKassa provider-hosted redirect pages
and webhook-driven entitlements. Replace "scaffold webhook" with real payments.

## Decisions (v1.3.1)
- Provider: YooKassa
- Billing model: non-renewing 30-day pass
- Plan:
  - max_30d_pass = 500.00 RUB (durationDays=30)
  - # FUTURE max_annual = 5_500.00 RUB (durationDays=365, keep disabled in UI)
- Return URL must support SBP bank-app handoff + return (TWA-safe).
- Payment methods exposed to UI:
  - "mir" => YooKassa payment_method_data.type = "bank_card"
  - "sbp" => YooKassa payment_method_data.type = "sbp"
- Webhook verification: IP allowlist primary; API verify optional; API-only if IP allowlist not feasible
- Entitlements are updated ONLY by provider-verified events (webhook or provider status fetch),
  never by client redirect alone.
- Entitlements must unlock within <10 seconds after confirmation (p95).
- Env: `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` (optional hardening: `BILLING_WEBHOOK_TOKEN`)

## Tasks (@backend)

### 23B.1 DB + migrations
- Add migration: `billing_payments` table
  - id (uuid, pk)                      -- internal payment id
  - provider (text)                    -- "yookassa"
  - provider_payment_id (text, unique) -- YooKassa payment.id
  - user_id (uuid, indexed)
  - plan_id (text)
  - method (text)                      -- "mir"|"sbp"
  - amount_rub (int)
  - status (text)                      -- created|pending|succeeded|canceled|failed
  - created_at (datetime)
  - updated_at (datetime)
  - provider_payload (json/text)

- Ensure `billing_events` (already in Phase 4) can store idempotency keys for webhook processing.
  If needed, add UNIQUE(provider, event_key).

### 23B.2 Billing plan config
- Add `apps/api/src/billing/plans.ts`:
  - define planId -> { priceRub, durationDays, title, receiptItemName }
  - ensure UI / paywall pulls from backend (avoid hardcoding prices in client)

### 23B.3 YooKassa client (server-side)
- Implement `apps/api/src/billing/providers/yookassa.ts`
  - Uses HTTP Basic Auth with shopId + secretKey (env)
  - Always send Idempotence-Key header (UUID v4) for create payment
  - Implement:
    - createPayment({ amountRub, methodType, returnUrl, description, metadata, receipt })
    - getPayment(providerPaymentId) (for verification / reconciliation)

### 23B.4 Implement POST /billing/checkout
- Route: `POST /billing/checkout`
- Input:
  { planId, method: "mir"|"sbp" }
- Server:
  - validate planId + method
  - create internal billing_payments row first (status="created")
  - derive returnUrl from config (e.g., `https://english.dance/billing/return`)
  - call YooKassa `POST /v3/payments` with:
    - amount: { value: "<rub>.00", currency: "RUB" }
    - payment_method_data:
        - mir => { type: "bank_card" }
        - sbp => { type: "sbp" }
    - confirmation: { type: "redirect", return_url: returnUrl }  # return_url only
    - capture: true
    - description: "english.dance — Max 30-day pass"
    - metadata: { plan_id: planId, user_id: userId, purchase_id: <internal uuid> }
    - receipt: (optional, only if 54-FZ enabled and customer email present)
        - customer.email = user email
        - items[0]:
          - description = receiptItemName
          - quantity = "1.00"
          - amount = { value: "<rub>.00", currency: "RUB" }
          - payment_mode = "full_payment"
          - payment_subject = "service"
          - vat_code mapping:
            - 1 = no VAT
            - 2 = VAT 0%
            - 3 = VAT 10%
            - 4 = VAT 20%
            - 5 = VAT 10/110
            - 6 = VAT 20/120
          - v1.3 default: vat_code=1 (no VAT) unless accountant specifies otherwise
  - persist provider_payment_id + full provider payload; set status="pending"
- Output:
  { checkoutUrl: <confirmation.confirmation_url> }
  (NOTE: for SBP the YooKassa page shows QR on desktop and bank list on mobile.)

Payload templates (redirect checkout):

SBP
```json
{
  "amount": { "value": "500.00", "currency": "RUB" },
  "capture": true,
  "payment_method_data": { "type": "sbp" },
  "confirmation": { "type": "redirect", "return_url": "https://english.dance/billing/return" },
  "description": "english.dance — Max 30-day pass",
  "metadata": { "plan_id": "max_30d_pass", "user_id": "USER_UUID", "purchase_id": "PURCHASE_UUID" }
}
```

Mir (bank card)
```json
{
  "amount": { "value": "500.00", "currency": "RUB" },
  "capture": true,
  "payment_method_data": { "type": "bank_card" },
  "confirmation": { "type": "redirect", "return_url": "https://english.dance/billing/return" },
  "description": "english.dance — Max 30-day pass",
  "metadata": { "plan_id": "max_30d_pass", "user_id": "USER_UUID", "purchase_id": "PURCHASE_UUID" }
}
```

### 23B.5 Implement POST /billing/webhook (YooKassa)
- Route: `POST /billing/webhook`
- Payload shape (YooKassa):
```json
{
  "type": "notification",
  "event": "payment.succeeded",
  "object": { "id": "...", "status": "succeeded", "paid": true }
}
```
- Security:
  - Verify sender authenticity per YooKassa docs (no signature header):
    - Primary: IP allowlist (CIDRs published by YooKassa docs)
    - Secondary (optional): verify current payment status via YooKassa API getPayment(payment.id)
    - If IP allowlist is not feasible in deployment, require API verification instead (document in ops)
- Idempotency:
  - event_key = `${event}:${object.id}:${object.status}`
  - INSERT into billing_events with UNIQUE(provider,event_key); if conflict -> return 200
- Processing:
  - parse body: { type, event, object } where object is payment
  - locate internal billing_payments by provider_payment_id = object.id (or metadata.purchase_id)
  - update billing_payments.status based on object.status
  - if event is payment.succeeded (or object.status=="succeeded"):
      - update entitlements for userId:
          - set max_active=true
          - max_expires_at = max(existing_expires_at, now) + plan.durationDays
      - record audit in billing_events
- Response:
  - Always return HTTP 200 once processed (YooKassa retries non-200 for up to 24h)

### 23B.6 Entitlements read endpoint for UI confirmation
- Ensure `GET /me/entitlements` exists and returns:
  - { maxActive: boolean, maxExpiresAt, ... }
- Client flow:
  - after returnUrl redirect, UI calls GET /me/entitlements and shows "Unlocked" only if active
  - surface "Restore purchases / Sync entitlements" if unlock is delayed

### 23B.7 Optional safety: reconciliation on return (provider-verified)
- Add endpoint `POST /billing/reconcile { providerPaymentId }`
  - Server calls YooKassa getPayment()
  - If succeeded and webhook not yet processed, run the same entitlement update code path
  - Keep idempotent using billing_events uniqueness

### 23B.8 FakeBillingProvider for CI/tests
- Implement `apps/api/src/billing/providers/fake.ts`
  - createPayment => returns checkoutUrl to a local test page or immediate "pending"
  - expose a helper endpoint for tests to emit a "payment.succeeded" event into webhook handler:
    - `POST /test/billing/webhook-emit`
    - payload: `{ "event": "payment.succeeded", "providerPaymentId": "uuid", "userId": "uuid" }`
- Env switch:
  - BILLING_PROVIDER = "yookassa" | "fake"

Acceptance criteria:
- Create checkout for mir => returns confirmation_url; payment success => entitlements updated only by webhook/provider-verified event.
- Create checkout for sbp => returns confirmation_url; SBP page works (QR on desktop, bank list on mobile); bank-app handoff + return works in TWA.
- Webhook is idempotent: retries do not double-extend entitlement.
- Entitlements unlock within <10 seconds after confirmation (p95).
- CI tests pass using FakeBillingProvider without external network.

---

# ============================================================
# AGENT_24 — APPEALS/REPORTS + RELIABILITY
# ============================================================

## Goal
Trust mechanics: “Why?” relies on content; “Report accepted” relies on endpoint.

## Tasks (@core)
- `POST /me/appeals` stores:
  - exerciseId
  - lessonId
  - userAnswer
  - expectedAnswer (if known)
  - createdAt
- Must accept offline-batched uploads (from sync) as well.
- Add `GET /status/health` and optionally incident seed endpoint (dev-only).

Acceptance criteria:
- Reports persist in DB and can be exported later for content improvement.

---

# ============================================================
# AGENT_27 — SYNC (LOCAL-FIRST EVENT LOG)
# ============================================================

## Goal
Idempotent sync so offline completions never double-apply.

## Tasks (@core)
- `POST /me/sync` accepts:
  - clientId (device id)
  - events: [{ id, type, occurredAt, timezoneOffsetMinutes, payload }]
- Server stores ack ids in DB and ignores duplicates.
- Applying events must be deterministic and safe.

### Conflict rules (must implement)
- Event de-duplication:
  - Primary key: `event.id` (UUID) scoped to user.
  - Reject any duplicate `event.id` (idempotent).
- Lesson attempt identity:
  - Each lesson session has `attemptId = clientId + lessonId + sessionStartedAt`.
  - Lesson completion is idempotent by `(userId, lessonId, attemptId)`.
- XP + completion dedupe:
  - Only the first completion per `(userId, lessonId, attemptId)` awards XP and marks completion.
  - If the same lesson is completed again (new attemptId), mark as replay: no XP, no streak day credit.
- Event ordering:
  - Apply events ordered by `occurredAt`, then `clientId` (stable tie-breaker).
- Overlapping sessions:
  - Allowed across devices; merge by event ordering above (no manual user resolution).
- SRS reconciliation:
  - Apply all answer events in order; for the same `(userId, itemId, attemptId)`, keep the last answer event.
  - If Device A marks correct and Device B marks wrong for the same item, the later `occurredAt` wins.

Acceptance criteria:
- Sending same sync batch twice does not double XP or duplicate completions.
- Two devices completing the same lesson only award XP once per attemptId.
- SRS state is identical regardless of sync order when events share the same occurredAt tie-breaker.

---

# ============================================================
# AGENT_28 — NOTIFICATIONS (NON-BLOCKING)
# ============================================================

Store reminder preferences; actual scheduler wiring can wait.
- `POST /me/notifications/preferences`
- `GET /me/notifications/preferences`

Mark cron/sending as `# NON-BLOCKING`.

---

# ============================================================
# AGENT_25 — INTEGRATION TESTS (GOLDEN PATH)
# ============================================================

Add API-level integration tests that cover:
- course map endpoint returns sections + node types
- lesson completion updates streak
- review completion updates streak
- streak repair eligibility and repair
- sync idempotency
- audio endpoint returns bytes for at least one A1 lesson
- audio URLs use RU-friendly hosting (no blocked CDN domains)
- Manual Golden Path assertion: audio plays without VPN on RU networks.

---

# APPENDIX A — Legacy Phase 4 Implementation (v1.2 baseline)

Source: `4dd1477cf5293adf0c8aa4a2adb37a6d4c42c0b9:projects/anglo/tasks/master-tasks-phase-4.md`

This appendix preserves the legacy Phase 4 spec that included complete Fastify route/code blocks.

Merge rule:
- **If anything in Appendix A conflicts with the v1.3/v1.3.1 requirements above (notably SQLite persistence, timezone dayKeys, and SRS), the v1.3/v1.3.1 text wins.**

# MASTER TASKS: PHASE 4 - BACKEND + INTEGRATION
# All tasks are executable with complete code. No TODOs or stubs.
# Run order: AGENT_19 -> AGENT_20 -> AGENT_21 -> AGENT_22 -> AGENT_23 -> AGENT_26 -> AGENT_27 -> AGENT_28 -> AGENT_24 -> AGENT_25
# Prereqs: Phase 1, 2, 3 completed.

# ============================================================
# STANDARDS
# ============================================================

- Canonical: This file is the single source of truth for Phase 4 tasks; ignore other variants.
- Use apps/api Fastify server and packages/types for request/response types.
- Keep storage in-memory for now; services are structured to allow DB replacement later.
- All endpoints validate input with zod and return JSON.
- AGENT_19 replaces the Phase 1 Express scaffold with Fastify (full migration).
- Avoid background processes in verification steps.

---

# ============================================================
# AGENT_19_API_FOUNDATION.md
# ============================================================

# Task: API Foundation, Plugins, Health

**Model:** haiku
**Task ID:** api_019
**Modifies:** 3 files
**Creates:** 6 files
**Deletes:** 1 file
**Depends On:** Phase 3 complete

## Modify File: apps/api/package.json

Add dependencies and devDependencies:

```json
{
  "dependencies": {
    "@duolingoru/types": "workspace:*",
    "@fastify/cors": "^9.0.1",
    "@fastify/cookie": "^9.4.0",
    "@fastify/jwt": "^7.3.0",
    "@fastify/rate-limit": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "fastify": "^4.27.0",
    "fastify-plugin": "^4.5.1",
    "nanoid": "^5.0.7",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/supertest": "^2.0.16",
    "supertest": "^7.0.0"
  }
}
```

Keep existing dependencies. Do not remove any.

## Create File: apps/api/src/plugins/jwt.ts

```typescript
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

export default fp(async (app) => {
  app.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret',
    sign: { expiresIn: '15m' },
  });
});
```

## Create File: apps/api/src/plugins/cookie.ts

```typescript
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';

export default fp(async (app) => {
  app.register(cookie, {
    secret: process.env.COOKIE_SECRET || 'dev-cookie',
  });
});
```

## Create File: apps/api/src/plugins/rate-limit.ts

```typescript
import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

export default fp(async (app) => {
  app.register(rateLimit, { max: 100, timeWindow: '1 minute' });
});
```

## Create File: apps/api/src/plugins/error-handler.ts

```typescript
import type { FastifyInstance } from 'fastify';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    const status = error.statusCode ?? 500;
    reply.status(status).send({
      error: true,
      message: error.message,
      status,
    });
  });
}
```

## Replace File: apps/api/src/routes/health.ts

```typescript
import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => {
    return {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0',
    };
  });
};
```

## Delete File: apps/api/src/routes/index.ts

Remove the obsolete Express barrel export; Fastify routes are registered directly in `app.ts`.

## Modify File: apps/api/src/app.ts

Replace with:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import cookiePlugin from './plugins/cookie.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import { healthRoutes } from './routes/health.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  registerErrorHandler(app);

  await app.register(healthRoutes);

  return app;
}
```

## Modify File: apps/api/src/index.ts

Replace with:

```typescript
import { createApp } from './app.js';

const PORT = Number(process.env.PORT || 3001);

async function start() {
  const app = await createApp();
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
```

## Replace File: apps/api/tests/health.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';

describe('health', () => {
  it('returns ok', async () => {
    const app = await createApp();
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('ok');
    await app.close();
  });
});
```

## Verification

```bash
pnpm -C apps/api typecheck
pnpm -C apps/api test
```

## Success Criteria

- Health route returns status ok
- apps/api test passes

---

# ============================================================
# AGENT_20_API_AUTH_USER.md
# ============================================================

# Task: Auth and User Endpoints

**Model:** sonnet
**Task ID:** api_020
**Modifies:** 1 file
**Creates:** 6 files
**Depends On:** AGENT_19

## Create File: apps/api/src/db/memory.ts

```typescript
export type UserRecord = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  verified: boolean;
  createdAt: string;
};

export type SessionRecord = {
  id: string;
  userId: string;
  refreshToken: string;
  createdAt: string;
};

export const memory = {
  users: new Map<string, UserRecord>(),
  sessions: new Map<string, SessionRecord>(),
  resetTokens: new Map<string, string>(),
  verifyTokens: new Map<string, string>(),
};
```

## Create File: apps/api/src/types.ts

```typescript
import type { FastifyRequest } from 'fastify';
import 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
  }

  interface FastifyRequest {
    currentUser?: unknown;
  }
}
```

## Create File: apps/api/src/services/auth.ts

```typescript
import bcrypt from 'bcryptjs';
import { memory, UserRecord } from '../db/memory.js';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createUser(data: {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
}): UserRecord {
  const user: UserRecord = {
    ...data,
    verified: false,
    createdAt: new Date().toISOString(),
  };
  memory.users.set(user.id, user);
  return user;
}

export function findUserByEmail(email: string) {
  return [...memory.users.values()].find((u) => u.email === email) || null;
}
```

## Create File: apps/api/src/plugins/auth.ts

```typescript
import fp from 'fastify-plugin';
import type { FastifyRequest } from 'fastify';
import { memory } from '../db/memory.js';

export default fp(async (app) => {
  app.decorate('authenticate', async (request: FastifyRequest) => {
    await request.jwtVerify();
    const userId = (request.user as { sub: string }).sub;
    const user = memory.users.get(userId);
    if (!user) {
      const error = new Error('user not found') as Error & { statusCode: number };
      error.statusCode = 401;
      throw error;
    }
    (request as any).currentUser = user;
  });
});
```

## Create File: apps/api/src/routes/auth.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { memory } from '../db/memory.js';
import { nanoid } from 'nanoid';
import { createUser, findUserByEmail, hashPassword, verifyPassword } from '../services/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/auth/register', async (request, reply) => {
    const data = registerSchema.parse(request.body);
    if (findUserByEmail(data.email)) {
      return reply.status(400).send({ error: true, message: 'email exists' });
    }
    const user = createUser({
      id: nanoid(),
      email: data.email,
      username: data.username,
      passwordHash: await hashPassword(data.password),
    });
    const accessToken = app.jwt.sign({ sub: user.id });
    const refreshToken = nanoid();
    const verifyToken = nanoid();
    memory.sessions.set(refreshToken, { id: nanoid(), userId: user.id, refreshToken, createdAt: new Date().toISOString() });
    memory.verifyTokens.set(verifyToken, user.id);
    return reply.send({ accessToken, refreshToken, verifyToken, user });
  });

  app.post('/auth/login', async (request, reply) => {
    const data = loginSchema.parse(request.body);
    const user = findUserByEmail(data.email);
    if (!user) return reply.status(401).send({ error: true, message: 'invalid' });
    const ok = await verifyPassword(data.password, user.passwordHash);
    if (!ok) return reply.status(401).send({ error: true, message: 'invalid' });
    const accessToken = app.jwt.sign({ sub: user.id });
    const refreshToken = nanoid();
    memory.sessions.set(refreshToken, { id: nanoid(), userId: user.id, refreshToken, createdAt: new Date().toISOString() });
    return reply.send({ accessToken, refreshToken, user });
  });

  app.post('/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };
    const session = memory.sessions.get(refreshToken);
    if (!session) return reply.status(401).send({ error: true, message: 'invalid' });
    const accessToken = app.jwt.sign({ sub: session.userId });
    return reply.send({ accessToken });
  });

  app.post('/auth/request-reset', async (request) => {
    const { email } = request.body as { email: string };
    const user = findUserByEmail(email);
    if (!user) return { ok: true };
    const token = nanoid();
    memory.resetTokens.set(token, user.id);
    return { ok: true, token };
  });

  app.post('/auth/reset-password', async (request, reply) => {
    const { token, password } = request.body as { token: string; password: string };
    const userId = memory.resetTokens.get(token);
    if (!userId) return reply.status(400).send({ error: true, message: 'invalid' });
    const user = memory.users.get(userId);
    if (!user) return reply.status(400).send({ error: true, message: 'invalid' });
    user.passwordHash = await hashPassword(password);
    memory.resetTokens.delete(token);
    return { ok: true };
  });

  app.post('/auth/verify-email', async (request, reply) => {
    const { token } = request.body as { token: string };
    const userId = memory.verifyTokens.get(token);
    if (!userId) return reply.status(400).send({ error: true, message: 'invalid' });
    const user = memory.users.get(userId);
    if (!user) return reply.status(400).send({ error: true, message: 'invalid' });
    user.verified = true;
    memory.verifyTokens.delete(token);
    return { ok: true };
  });
});
```

## Create File: apps/api/src/routes/users.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { memory } from '../db/memory.js';

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.get('/me', { preHandler: app.authenticate }, async (request) => {
    return { user: (request as any).currentUser };
  });

  app.put('/me', { preHandler: app.authenticate }, async (request) => {
    const schema = z.object({ username: z.string().min(3).optional() });
    const data = schema.parse(request.body);
    const user = (request as any).currentUser;
    const updated = { ...user, ...data };
    memory.users.set(updated.id, updated);
    (request as any).currentUser = updated;
    return { user: updated };
  });
};
```

## Modify File: apps/api/src/app.ts

Replace with:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import cookiePlugin from './plugins/cookie.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import './types.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  registerErrorHandler(app);

  // Auth plugin must be registered after jwtPlugin.
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);

  return app;
}
```

## Checklist

- [ ] /courses/:courseId returns course metadata
- [ ] GET /me/progress returns { progress: ... } with required fields
- [ ] POST /me/progress/lesson-complete updates XP, streak, completedLessons, and lessonProgress
- [ ] Responses use the progress key to match UI ProgressResponse
- [ ] Auth required for /me/progress endpoints
- [ ] progress store initializes a record per user

## Verification

```bash
pnpm -C apps/api typecheck
pnpm -C apps/api test
```

## Success Criteria

- register and login routes respond
- /me returns user when authenticated

---

# ============================================================
# AGENT_21_API_LESSON_PROGRESS.md
# ============================================================

# Task: Content and Progress Endpoints

**Model:** sonnet
**Task ID:** api_021
**Modifies:** 1 file
**Creates:** 5 files
**Depends On:** AGENT_20

## Create File: apps/api/src/services/content.ts

```typescript
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const contentRoot = fileURLToPath(
  new URL('../../../../packages/content/courses', import.meta.url),
);
const resolvedContentRoot = process.env.CONTENT_ROOT ?? contentRoot;

export async function getCourseMeta(courseId: string) {
  const raw = await readFile(path.join(resolvedContentRoot, courseId, 'meta.json'), 'utf-8');
  return JSON.parse(raw);
}

export async function getLesson(
  courseId: string,
  level: string,
  unitId: string,
  lessonId: string
) {
  const raw = await readFile(
    path.join(resolvedContentRoot, courseId, level, unitId, `${lessonId}.json`),
    'utf-8',
  );
  return JSON.parse(raw);
}
```

**NOTE:** `CONTENT_ROOT` can override the default monorepo path if the layout changes.

## Create File: apps/api/src/routes/courses.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { getCourseMeta } from '../services/content.js';

export const courseRoutes: FastifyPluginAsync = async (app) => {
  app.get('/courses/:courseId', async (request) => {
    const { courseId } = request.params as { courseId: string };
    return getCourseMeta(courseId);
  });
};
```

## Create File: apps/api/src/db/progress.ts

```typescript
export type LessonProgressRecord = {
  lessonId: string;
  completedCount: number;
  bestScore: number;
  lastCompletedAt: number;
  masteryLevel: 'learning' | 'practicing' | 'mastered';
};

export type UserProgressRecord = {
  userId: string;
  totalXp: number;
  level: number;
  streak: number;
  longestStreak: number;
  ownedStreakFreezes: number;
  lastActivityDate: number;
  completedLessons: string[];
  lessonProgress: Record<string, LessonProgressRecord>;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const progressStore = new Map<string, UserProgressRecord>();

export function getProgress(userId: string): UserProgressRecord {
  const existing = progressStore.get(userId);
  if (existing) return existing;
  const created: UserProgressRecord = {
    userId,
    totalXp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    ownedStreakFreezes: 0,
    lastActivityDate: 0,
    completedLessons: [],
    lessonProgress: {},
  };
  progressStore.set(userId, created);
  return created;
}

function dayNumber(timestamp: number): number {
  const date = new Date(timestamp);
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY);
}

export function applyLessonCompletion(
  userId: string,
  lessonId: string,
  xpEarned: number
): UserProgressRecord {
  const progress = getProgress(userId);
  const now = Date.now();

  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  }

  const previousLesson = progress.lessonProgress[lessonId];
  progress.lessonProgress[lessonId] = {
    lessonId,
    completedCount: (previousLesson?.completedCount ?? 0) + 1,
    bestScore: Math.max(previousLesson?.bestScore ?? 0, 100),
    lastCompletedAt: now,
    masteryLevel: 'learning',
  };

  if (!progress.lastActivityDate) {
    progress.streak = 1;
  } else {
    const diff = dayNumber(now) - dayNumber(progress.lastActivityDate);
    if (diff === 1) progress.streak += 1;
    if (diff > 1) progress.streak = 1;
  }

  if (progress.streak === 10 && progress.longestStreak < 10) progress.ownedStreakFreezes += 1;
  progress.longestStreak = Math.max(progress.longestStreak, progress.streak);
  progress.lastActivityDate = now;
  progress.totalXp += xpEarned;

  return progress;
}

export function addXp(userId: string, amount: number): UserProgressRecord {
  const progress = getProgress(userId);
  progress.totalXp += amount;
  return progress;
}
```

## Create File: apps/api/src/routes/progress.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { applyLessonCompletion, getProgress } from '../db/progress.js';

const schema = z.object({ lessonId: z.string(), xpEarned: z.number() });

export const progressRoutes: FastifyPluginAsync = async (app) => {
  app.get('/me/progress', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    return { progress: getProgress(userId) };
  });

  app.post('/me/progress/lesson-complete', { preHandler: app.authenticate }, async (request) => {
    const data = schema.parse(request.body);
    const userId = (request as any).currentUser.id;
    return { progress: applyLessonCompletion(userId, data.lessonId, data.xpEarned) };
  });
};
```

## Modify File: apps/api/src/app.ts

Replace with:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import cookiePlugin from './plugins/cookie.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import './types.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { courseRoutes } from './routes/courses.js';
import { progressRoutes } from './routes/progress.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  registerErrorHandler(app);

  // Auth plugin must be registered after jwtPlugin.
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(courseRoutes);
  await app.register(progressRoutes);

  return app;
}
```

## Checklist

- [ ] XP/streak endpoints read from progress store
- [ ] daily quests award XP via addXp
- [ ] friends endpoints respond for authenticated users

## Verification

```bash
pnpm -C apps/api typecheck
pnpm -C apps/api test
```

## Success Criteria

- /courses/:courseId returns course meta
- /me/progress returns progress summary for authenticated user
- /me/progress/lesson-complete updates XP, streak, and completed lessons

---

# ============================================================
# AGENT_22_API_GAMIFICATION_SOCIAL.md
# ============================================================

# Task: Gamification and Social Endpoints

**Model:** sonnet
**Task ID:** api_022
**Modifies:** 1 file
**Creates:** 4 files
**Depends On:** AGENT_21

## Create File: apps/api/src/db/gamification.ts

```typescript
export const achievementsStore: Record<string, string[]> = {};
export const friendsStore: Record<string, string[]> = {};
export const dailyQuestStore: Record<string, { date: string; completed: string[] }> = {};
export const streakFreezeStore: Record<string, string | null> = {};
```

## Create File: apps/api/src/routes/gamification.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { achievementsStore, dailyQuestStore } from '../db/gamification.js';
import { addXp, getProgress } from '../db/progress.js';

const DAILY_QUESTS = [
  { id: 'daily-xp-30', title: 'Earn 30 XP', reward: { xp: 30 } },
  { id: 'daily-practice', title: 'Complete 1 practice', reward: { hearts: 1 } },
];

type QuestState = { date: string; completed: string[] };

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getQuestState(userId: string): QuestState {
  const today = getTodayKey();
  const state = dailyQuestStore[userId];
  if (!state || state.date !== today) {
    dailyQuestStore[userId] = { date: today, completed: [] };
  }
  return dailyQuestStore[userId];
}

export const gamificationRoutes: FastifyPluginAsync = async (app) => {
  app.get('/gamification/xp', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    return { xp: getProgress(userId).totalXp };
  });

  app.post('/gamification/xp', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    const { amount } = request.body as { amount: number };
    const progress = addXp(userId, amount);
    return { xp: progress.totalXp };
  });

  app.get('/gamification/streak', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    const progress = getProgress(userId);
    return { streak: progress.streak, longestStreak: progress.longestStreak };
  });

  app.get('/gamification/achievements', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    return { achievements: achievementsStore[userId] || [] };
  });

  app.get('/gamification/daily-quests', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    const state = getQuestState(userId);
    return {
      date: state.date,
      quests: DAILY_QUESTS.map((quest) => ({
        ...quest,
        completed: state.completed.includes(quest.id),
      })),
    };
  });

  app.post('/gamification/daily-quests/complete', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request as any).currentUser.id;
    const { questId } = request.body as { questId: string };
    const quest = DAILY_QUESTS.find((item) => item.id === questId);
    if (!quest) return reply.status(404).send({ error: true, message: 'quest not found' });
    const state = getQuestState(userId);
    if (!state.completed.includes(questId)) {
      state.completed.push(questId);
      if (quest.reward.xp) {
        addXp(userId, quest.reward.xp);
      }
    }
    return { ok: true, questId, reward: quest.reward, completed: state.completed };
  });
};
```

## Create File: apps/api/src/routes/social.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { friendsStore } from '../db/gamification.js';

export const socialRoutes: FastifyPluginAsync = async (app) => {
  app.get('/friends', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    return { friends: friendsStore[userId] || [] };
  });

  app.post('/friends', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    const { friendId } = request.body as { friendId: string };
    friendsStore[userId] = [...(friendsStore[userId] || []), friendId];
    return { ok: true };
  });
};
```

## Modify File: apps/api/src/app.ts

Replace with:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import cookiePlugin from './plugins/cookie.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import './types.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { courseRoutes } from './routes/courses.js';
import { progressRoutes } from './routes/progress.js';
import { gamificationRoutes } from './routes/gamification.js';
import { socialRoutes } from './routes/social.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  registerErrorHandler(app);

  // Auth plugin must be registered after jwtPlugin.
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(courseRoutes);
  await app.register(progressRoutes);
  await app.register(gamificationRoutes);
  await app.register(socialRoutes);

  return app;
}
```

## Verification

```bash
pnpm -C apps/api typecheck
pnpm -C apps/api test
```

## Success Criteria

- XP and streak endpoints respond using progress store
- daily quests endpoints respond
- friends endpoints respond

---

# ============================================================
# AGENT_23_API_PAYMENTS_MONETIZATION.md
# ============================================================

# Task: Payments and Monetization

**Model:** sonnet
**Task ID:** api_023
**Modifies:** 1 file
**Creates:** 3 files
**Depends On:** AGENT_22

## Create File: apps/api/src/services/payments.ts

```typescript
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

type PaymentRecord = { id: string; userId: string; amount: number; status: PaymentStatus };

const payments = new Map<string, PaymentRecord>();

export function createPayment(id: string, userId: string, amount: number) {
  const record = { id, userId, amount, status: 'pending' as const };
  payments.set(id, record);
  return record;
}

export function markPaid(id: string) {
  const record = payments.get(id);
  if (!record) return null;
  record.status = 'paid';
  return record;
}

export function markRefunded(id: string) {
  const record = payments.get(id);
  if (!record) return null;
  record.status = 'refunded';
  return record;
}
```

## Create File: apps/api/src/routes/payments.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { nanoid } from 'nanoid';
import { createPayment, markPaid, markRefunded } from '../services/payments.js';

export const paymentsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/payments/upgrade', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    const payment = createPayment(nanoid(), userId, 499);
    return { paymentId: payment.id, status: payment.status };
  });

  app.post('/payments/mir', { preHandler: app.authenticate }, async (request) => {
    const { paymentId } = request.body as { paymentId: string };
    const payment = markPaid(paymentId);
    return { status: payment?.status || 'pending' };
  });

  app.post('/payments/refund', { preHandler: app.authenticate }, async (request) => {
    const { paymentId } = request.body as { paymentId: string };
    const payment = markRefunded(paymentId);
    return { status: payment?.status || 'pending' };
  });
};
```

## Create File: apps/api/src/routes/monetization.ts

```typescript
import { FastifyPluginAsync } from 'fastify';

export const monetizationRoutes: FastifyPluginAsync = async (app) => {
  app.get('/monetization/policy', async () => {
    return {
      policy: 'hearts',
      maxHearts: 3,
      refillHours: 20,
    };
  });
};
```

## Modify File: apps/api/src/app.ts

Replace with:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import cookiePlugin from './plugins/cookie.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import './types.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { courseRoutes } from './routes/courses.js';
import { progressRoutes } from './routes/progress.js';
import { gamificationRoutes } from './routes/gamification.js';
import { socialRoutes } from './routes/social.js';
import { paymentsRoutes } from './routes/payments.js';
import { monetizationRoutes } from './routes/monetization.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  registerErrorHandler(app);

  // Auth plugin must be registered after jwtPlugin.
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(courseRoutes);
  await app.register(progressRoutes);
  await app.register(gamificationRoutes);
  await app.register(socialRoutes);
  await app.register(paymentsRoutes);
  await app.register(monetizationRoutes);

  return app;
}
```

## Verification

```bash
pnpm -C apps/api typecheck
pnpm -C apps/api test
```

## Success Criteria

- payment endpoints respond
- monetization policy endpoint responds

---

# ============================================================
# AGENT_26_API_POLICY_ENTITLEMENTS.md
# ============================================================

# Task: Policy Config and Entitlements

**Model:** sonnet
**Task ID:** api_026
**Modifies:** 4 files
**Creates:** 5 files
**Depends On:** AGENT_23

## Create File: apps/api/src/services/policy.ts

```typescript
import type { PolicyConfig } from '@duolingoru/types';

const heartsPolicy: PolicyConfig = {
  limiterType: 'hearts',
  maxHearts: 3,
  refillHours: 20,
  practiceRefillEnabled: true,
};

const energyPolicy: PolicyConfig = {
  limiterType: 'energy',
  maxEnergy: 10,
  rechargeHours: 6,
  energyCostPerLesson: 1,
  bonusEnergy: 1,
  correctStreakForBonus: 5,
};

export function getPolicyConfig(): PolicyConfig {
  const base = process.env.POLICY_LIMITER === 'energy' ? energyPolicy : heartsPolicy;
  return { ...base, updatedAt: new Date().toISOString() };
}
```

## Create File: apps/api/src/routes/policy.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { getPolicyConfig } from '../services/policy.js';

export const policyRoutes: FastifyPluginAsync = async (app) => {
  app.get('/policy/config', async () => {
    return { policy: getPolicyConfig() };
  });
};
```

## Create File: apps/api/src/db/entitlements.ts

```typescript
export type EntitlementRecord = {
  userId: string;
  isPremium: boolean;
  planId?: 'monthly' | 'annual' | 'lifetime';
  expiresAt?: string;
  features: string[];
  updatedAt: string;
};

export const entitlementsStore = new Map<string, EntitlementRecord>();
export const redeemedPromoCodes = new Set<string>();
export const redeemedPromoCodesByUser = new Map<string, string[]>();
```

## Create File: apps/api/src/services/entitlements.ts

```typescript
import {
  entitlementsStore,
  redeemedPromoCodes,
  redeemedPromoCodesByUser,
  type EntitlementRecord,
} from '../db/entitlements.js';

const premiumFeatures = ['offline_downloads', 'unlimited_attempts'];

const promoCodes = new Map<string, { planId: 'monthly' | 'annual' | 'lifetime'; expiresInDays?: number }>([
  ['PROMO-30D', { planId: 'monthly', expiresInDays: 30 }],
  ['PROMO-LIFE', { planId: 'lifetime' }],
]);

export function getEntitlements(userId: string): EntitlementRecord {
  return (
    entitlementsStore.get(userId) || {
      userId,
      isPremium: false,
      features: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export function grantPremium(
  userId: string,
  planId: 'monthly' | 'annual' | 'lifetime',
  expiresAt?: string
) {
  const record: EntitlementRecord = {
    userId,
    isPremium: true,
    planId,
    expiresAt,
    features: premiumFeatures,
    updatedAt: new Date().toISOString(),
  };
  entitlementsStore.set(userId, record);
  return record;
}

export function revokePremium(userId: string) {
  const record: EntitlementRecord = {
    userId,
    isPremium: false,
    features: [],
    updatedAt: new Date().toISOString(),
  };
  entitlementsStore.set(userId, record);
  return record;
}

export function redeemPromoCode(userId: string, code: string) {
  const normalized = code.trim().toUpperCase();
  const promo = promoCodes.get(normalized);
  if (!promo) return { ok: false, reason: 'invalid' as const };
  if (redeemedPromoCodes.has(normalized)) return { ok: false, reason: 'already_used' as const };

  const expiresAt = promo.expiresInDays
    ? new Date(Date.now() + promo.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : undefined;
  grantPremium(userId, promo.planId, expiresAt);
  redeemedPromoCodes.add(normalized);
  const history = redeemedPromoCodesByUser.get(userId) || [];
  redeemedPromoCodesByUser.set(userId, [...history, normalized]);
  return { ok: true, code: normalized };
}
```

## Create File: apps/api/src/routes/entitlements.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { getEntitlements, redeemPromoCode } from '../services/entitlements.js';

export const entitlementsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/entitlements/me', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    return getEntitlements(userId);
  });

  const redeemHandler = async (request: any, reply: any) => {
    const userId = (request as any).currentUser.id;
    const { code } = request.body as { code: string };
    const result = redeemPromoCode(userId, code);
    if (!result.ok) {
      return reply.status(400).send({ error: true, reason: result.reason });
    }
    return { ok: true, code: result.code, entitlements: getEntitlements(userId) };
  };

  app.post('/entitlements/redeem', { preHandler: app.authenticate }, redeemHandler);
  app.post('/promo/redeem', { preHandler: app.authenticate }, redeemHandler);
};
```

## Modify File: apps/api/src/routes/gamification.ts

Replace with:

```typescript
import { FastifyPluginAsync } from 'fastify';
import {
  achievementsStore,
  dailyQuestStore,
  streakFreezeStore,
} from '../db/gamification.js';
import { addXp, getProgress } from '../db/progress.js';

const DAILY_QUESTS = [
  { id: 'daily-xp-30', title: 'Earn 30 XP', reward: { xp: 30 } },
  { id: 'daily-practice', title: 'Complete 1 practice', reward: { hearts: 1 } },
];

type QuestState = { date: string; completed: string[] };

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getQuestState(userId: string): QuestState {
  const today = getTodayKey();
  const state = dailyQuestStore[userId];
  if (!state || state.date !== today) {
    dailyQuestStore[userId] = { date: today, completed: [] };
  }
  return dailyQuestStore[userId];
}

export const gamificationRoutes: FastifyPluginAsync = async (app) => {
  app.get('/gamification/xp', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    return { xp: getProgress(userId).totalXp };
  });

  app.post('/gamification/xp', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    const { amount } = request.body as { amount: number };
    const progress = addXp(userId, amount);
    return { xp: progress.totalXp };
  });

  app.get('/gamification/streak', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    const progress = getProgress(userId);
    return { streak: progress.streak, longestStreak: progress.longestStreak };
  });

  app.post('/gamification/streak/freeze', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request as any).currentUser.id;
    const progress = getProgress(userId);
    if ((progress.ownedStreakFreezes ?? 0) < 1) {
      return reply.status(403).send({ error: true, message: 'no streak freeze available' });
    }
    progress.ownedStreakFreezes -= 1;
    const lastUsed = streakFreezeStore[userId];
    if (lastUsed) {
      const last = new Date(lastUsed).getTime();
      const daysSince = (Date.now() - last) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) {
        return reply.status(429).send({ error: true, message: 'streak freeze already used this month' });
      }
    }
    const frozenAt = new Date().toISOString();
    streakFreezeStore[userId] = frozenAt;
    return { ok: true, frozenAt };
  });

  app.get('/gamification/achievements', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    return { achievements: achievementsStore[userId] || [] };
  });

  app.get('/gamification/daily-quests', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    const state = getQuestState(userId);
    return {
      date: state.date,
      quests: DAILY_QUESTS.map((quest) => ({
        ...quest,
        completed: state.completed.includes(quest.id),
      })),
    };
  });

  app.post('/gamification/daily-quests/complete', { preHandler: app.authenticate }, async (request, reply) => {
    const userId = (request as any).currentUser.id;
    const { questId } = request.body as { questId: string };
    const quest = DAILY_QUESTS.find((item) => item.id === questId);
    if (!quest) return reply.status(404).send({ error: true, message: 'quest not found' });
    const state = getQuestState(userId);
    if (!state.completed.includes(questId)) {
      state.completed.push(questId);
      if (quest.reward.xp) {
        addXp(userId, quest.reward.xp);
      }
    }
    return { ok: true, questId, reward: quest.reward, completed: state.completed };
  });
};
```

## Modify File: apps/api/src/routes/monetization.ts

Replace with:

```typescript
import { FastifyPluginAsync } from 'fastify';
import { getPolicyConfig } from '../services/policy.js';

export const monetizationRoutes: FastifyPluginAsync = async (app) => {
  app.get('/monetization/policy', async () => {
    return {
      deprecated: true,
      use: '/policy/config',
      policy: getPolicyConfig(),
    };
  });
};
```

## Modify File: apps/api/src/routes/payments.ts

Replace with:

```typescript
import { FastifyPluginAsync } from 'fastify';
import { nanoid } from 'nanoid';
import { createPayment, markPaid, markRefunded } from '../services/payments.js';
import { grantPremium, revokePremium } from '../services/entitlements.js';

export const paymentsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/payments/upgrade', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    const payment = createPayment(nanoid(), userId, 499);
    return { paymentId: payment.id, status: payment.status };
  });

  app.post('/payments/mir', { preHandler: app.authenticate }, async (request) => {
    const { paymentId } = request.body as { paymentId: string };
    const payment = markPaid(paymentId);
    if (payment?.status === 'paid') {
      grantPremium(payment.userId, 'monthly');
    }
    return { status: payment?.status || 'pending' };
  });

  app.post('/payments/refund', { preHandler: app.authenticate }, async (request) => {
    const { paymentId } = request.body as { paymentId: string };
    const payment = markRefunded(paymentId);
    if (payment?.status === 'refunded') {
      revokePremium(payment.userId);
    }
    return { status: payment?.status || 'pending' };
  });
};
```

## Modify File: apps/api/src/app.ts

Replace with:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import cookiePlugin from './plugins/cookie.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import './types.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { courseRoutes } from './routes/courses.js';
import { progressRoutes } from './routes/progress.js';
import { gamificationRoutes } from './routes/gamification.js';
import { socialRoutes } from './routes/social.js';
import { paymentsRoutes } from './routes/payments.js';
import { monetizationRoutes } from './routes/monetization.js';
import { policyRoutes } from './routes/policy.js';
import { entitlementsRoutes } from './routes/entitlements.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  registerErrorHandler(app);

  // Auth plugin must be registered after jwtPlugin.
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(courseRoutes);
  await app.register(progressRoutes);
  await app.register(gamificationRoutes);
  await app.register(socialRoutes);
  await app.register(paymentsRoutes);
  await app.register(monetizationRoutes);
  await app.register(policyRoutes);
  await app.register(entitlementsRoutes);

  return app;
}
```

## Verification

```bash
pnpm -C apps/api typecheck
pnpm -C apps/api test
```

## Success Criteria

- policy config endpoint responds
- entitlements endpoint responds for authenticated user
- promo code redemption returns entitlements
- promo code redemption works at /promo/redeem
- streak freeze endpoint enforces monthly limit
- monetization policy endpoint returns deprecated alias

---

# ============================================================
# AGENT_27_API_PACKS_SYNC.md
# ============================================================

# Task: Packs Manifest + Sync Reconcile

**Model:** sonnet
**Task ID:** api_027
**Modifies:** 1 file
**Creates:** 4 files
**Depends On:** AGENT_26

## Create File: apps/api/src/services/packs.ts

```typescript
import crypto from 'crypto';

type PackContent = {
  courseId: string;
  level: string;
  units: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      unitId: string;
      title: string;
      order: number;
      exercises: unknown[];
    }>;
  }>;
};

type PackRecord = {
  meta: {
    packId: string;
    version: string;
    checksum: string;
    sizeBytes: number;
    url: string;
  };
  content: PackContent;
};

function checksumForContent(contentJson: string): string {
  return crypto.createHash('sha256').update(contentJson).digest('hex');
}

const packContent: PackContent = {
  courseId: 'ru-en',
  level: 'a1',
  units: [
    {
      id: 'a1_unit_01',
      title: 'Unit 1',
      lessons: [
        {
          id: 'a1_u1_l1',
          unitId: 'a1_unit_01',
          title: 'Lesson 1',
          order: 1,
          exercises: [
            {
              id: 'ex-1',
              kind: 'translate_tap',
              prompt: { text: 'Hello' },
              choices: ['Hello', 'Bye'],
              correct: 'Hello',
              difficulty: 1,
            },
          ],
        },
      ],
    },
  ],
};

const packContentJson = JSON.stringify(packContent);
const packChecksum = checksumForContent(packContentJson);
const packSizeBytes = Buffer.byteLength(packContentJson, 'utf-8');

const packs: PackRecord[] = [
  {
    meta: {
      packId: 'ru-en-a1-unit-01',
      version: 'v1',
      checksum: packChecksum,
      sizeBytes: packSizeBytes,
      url: '/packs/ru-en-a1-unit-01/v1',
    },
    content: packContent,
  },
];

export function getPackManifest() {
  return packs.map((pack) => pack.meta);
}

export function getPack(packId: string, version: string) {
  return packs.find((pack) => pack.meta.packId === packId && pack.meta.version === version) || null;
}
```

## Create File: apps/api/src/routes/packs.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { getPack, getPackManifest } from '../services/packs.js';

export const packsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/packs/manifest', async () => {
    return { packs: getPackManifest() };
  });

  app.get('/packs/:packId/:version', async (request, reply) => {
    const { packId, version } = request.params as { packId: string; version: string };
    const pack = getPack(packId, version);
    if (!pack) return reply.status(404).send({ error: true, message: 'pack not found' });
    return pack;
  });
};
```

## Create File: apps/api/src/db/sync.ts

```typescript
export const ackedSyncIds = new Set<string>();
```

## Create File: apps/api/src/routes/sync.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { applyLessonCompletion } from '../db/progress.js';
import { ackedSyncIds } from '../db/sync.js';

const syncItemSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  occurredAt: z.string().min(1),
  payload: z.record(z.unknown()),
});

const reconcileSchema = z.object({
  items: z.array(syncItemSchema).max(100),
});

const progressPayloadSchema = z.object({
  lessonId: z.string().min(1),
  xpEarned: z.number(),
});

export const syncRoutes: FastifyPluginAsync = async (app) => {
  const handler = async (request: any) => {
    const { items } = reconcileSchema.parse(request.body);
    const userId = (request as any).currentUser.id;
    const acked: string[] = [];
    const failed: { id: string; reason: string }[] = [];

    for (const item of items) {
      if (ackedSyncIds.has(item.id)) {
        acked.push(item.id);
        continue;
      }
      if (item.type === 'progress') {
        const parsed = progressPayloadSchema.safeParse(item.payload);
        if (!parsed.success) {
          failed.push({ id: item.id, reason: 'invalid payload' });
          continue;
        }
        applyLessonCompletion(userId, parsed.data.lessonId, parsed.data.xpEarned);
      }
      ackedSyncIds.add(item.id);
      acked.push(item.id);
    }

    return { acked, failed };
  };

  app.post('/sync/reconcile', { preHandler: app.authenticate }, handler);
};
```

## Modify File: apps/api/src/app.ts

Replace with:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import cookiePlugin from './plugins/cookie.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import './types.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { courseRoutes } from './routes/courses.js';
import { progressRoutes } from './routes/progress.js';
import { gamificationRoutes } from './routes/gamification.js';
import { socialRoutes } from './routes/social.js';
import { paymentsRoutes } from './routes/payments.js';
import { monetizationRoutes } from './routes/monetization.js';
import { policyRoutes } from './routes/policy.js';
import { entitlementsRoutes } from './routes/entitlements.js';
import { packsRoutes } from './routes/packs.js';
import { syncRoutes } from './routes/sync.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  registerErrorHandler(app);

  // Auth plugin must be registered after jwtPlugin.
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(courseRoutes);
  await app.register(progressRoutes);
  await app.register(gamificationRoutes);
  await app.register(socialRoutes);
  await app.register(paymentsRoutes);
  await app.register(monetizationRoutes);
  await app.register(policyRoutes);
  await app.register(entitlementsRoutes);
  await app.register(packsRoutes);
  await app.register(syncRoutes);

  return app;
}
```

## Verification

```bash
pnpm -C apps/api typecheck
pnpm -C apps/api test
```

## Success Criteria

- packs manifest endpoint responds
- pack version endpoint returns a pack
- sync reconcile responds with acked ids
- progress sync items apply lesson completion when type=progress

---

# ============================================================
# AGENT_28_API_NOTIFICATIONS.md
# ============================================================

# Task: Notifications Provider Abstraction

**Model:** sonnet
**Task ID:** api_028
**Modifies:** 1 file
**Creates:** 3 files
**Depends On:** AGENT_27

## Create File: apps/api/src/db/notifications.ts

```typescript
export type DeviceRegistration = {
  userId: string;
  provider: 'webpush' | 'fcm' | 'rustore';
  token: string;
  deviceId: string;
  platform: 'web' | 'android' | 'ios';
  createdAt: string;
};

export const deviceStore = new Map<string, DeviceRegistration[]>();
```

## Create File: apps/api/src/services/notifications.ts

```typescript
import { deviceStore, type DeviceRegistration } from '../db/notifications.js';

export type NotificationProvider = 'webpush' | 'fcm' | 'rustore';

export function registerDevice(registration: DeviceRegistration) {
  const existing = deviceStore.get(registration.userId) || [];
  const index = existing.findIndex(
    (entry) => entry.deviceId === registration.deviceId && entry.provider === registration.provider
  );
  if (index >= 0) {
    existing[index] = registration;
  } else {
    existing.push(registration);
  }
  deviceStore.set(registration.userId, existing);
  return registration;
}

export function listDevices(userId: string) {
  return deviceStore.get(userId) || [];
}
```

## Create File: apps/api/src/routes/notifications.ts

```typescript
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { registerDevice } from '../services/notifications.js';

const registrationSchema = z.object({
  provider: z.enum(['webpush', 'fcm', 'rustore']),
  token: z.string().min(1),
  deviceId: z.string().min(1),
  platform: z.enum(['web', 'android', 'ios']),
});

export const notificationsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/notifications/register', { preHandler: app.authenticate }, async (request) => {
    const data = registrationSchema.parse(request.body);
    const userId = (request as any).currentUser.id;
    registerDevice({ userId, ...data, createdAt: new Date().toISOString() });
    return { ok: true };
  });
};
```

## Modify File: apps/api/src/app.ts

Replace with:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import cookiePlugin from './plugins/cookie.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import './types.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { courseRoutes } from './routes/courses.js';
import { progressRoutes } from './routes/progress.js';
import { gamificationRoutes } from './routes/gamification.js';
import { socialRoutes } from './routes/social.js';
import { paymentsRoutes } from './routes/payments.js';
import { monetizationRoutes } from './routes/monetization.js';
import { policyRoutes } from './routes/policy.js';
import { entitlementsRoutes } from './routes/entitlements.js';
import { packsRoutes } from './routes/packs.js';
import { syncRoutes } from './routes/sync.js';
import { notificationsRoutes } from './routes/notifications.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  registerErrorHandler(app);

  // Auth plugin must be registered after jwtPlugin.
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(courseRoutes);
  await app.register(progressRoutes);
  await app.register(gamificationRoutes);
  await app.register(socialRoutes);
  await app.register(paymentsRoutes);
  await app.register(monetizationRoutes);
  await app.register(policyRoutes);
  await app.register(entitlementsRoutes);
  await app.register(packsRoutes);
  await app.register(syncRoutes);
  await app.register(notificationsRoutes);

  return app;
}
```

## Verification

```bash
pnpm -C apps/api typecheck
pnpm -C apps/api test
```

## Success Criteria

- notifications registration endpoint responds

---

# ============================================================
# AGENT_24_API_SUPPORT_RELIABILITY_ANALYTICS.md
# ============================================================

# Task: Support, Reliability, Analytics

**Model:** sonnet
**Task ID:** api_024
**Modifies:** 1 file
**Creates:** 3 files
**Depends On:** AGENT_28

## Create File: apps/api/src/routes/support.ts

```typescript
import { FastifyPluginAsync } from 'fastify';

export const supportRoutes: FastifyPluginAsync = async (app) => {
  app.post('/support/bug-report', async (request) => {
    const { message } = request.body as { message: string };
    return { ok: true, message };
  });

  app.post('/support/feedback', async (request) => {
    const { message } = request.body as { message: string };
    return { ok: true, message };
  });
};
```

## Create File: apps/api/src/routes/reliability.ts

```typescript
import { FastifyPluginAsync } from 'fastify';

export const reliabilityRoutes: FastifyPluginAsync = async (app) => {
  app.get('/reliability/offline-fallback', async () => {
    return { status: 'fallback', message: 'serving cached content' };
  });

  app.get('/reliability/data-export', { preHandler: app.authenticate }, async (request) => {
    const userId = (request as any).currentUser.id;
    return { userId, exportedAt: new Date().toISOString(), data: {} };
  });
};
```

## Create File: apps/api/src/routes/analytics.ts

```typescript
import { FastifyPluginAsync } from 'fastify';

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/analytics/event', async (request) => {
    const { name } = request.body as { name: string };
    return { ok: true, name };
  });
};
```

## Modify File: apps/api/src/app.ts

Replace with:

```typescript
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwtPlugin from './plugins/jwt.js';
import cookiePlugin from './plugins/cookie.js';
import rateLimitPlugin from './plugins/rate-limit.js';
import { registerErrorHandler } from './plugins/error-handler.js';
import './types.js';
import authPlugin from './plugins/auth.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { userRoutes } from './routes/users.js';
import { courseRoutes } from './routes/courses.js';
import { progressRoutes } from './routes/progress.js';
import { gamificationRoutes } from './routes/gamification.js';
import { socialRoutes } from './routes/social.js';
import { paymentsRoutes } from './routes/payments.js';
import { monetizationRoutes } from './routes/monetization.js';
import { policyRoutes } from './routes/policy.js';
import { entitlementsRoutes } from './routes/entitlements.js';
import { packsRoutes } from './routes/packs.js';
import { syncRoutes } from './routes/sync.js';
import { notificationsRoutes } from './routes/notifications.js';
import { supportRoutes } from './routes/support.js';
import { reliabilityRoutes } from './routes/reliability.js';
import { analyticsRoutes } from './routes/analytics.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: process.env.CORS_ORIGIN || '*' });
  await app.register(cookiePlugin);
  await app.register(jwtPlugin);
  await app.register(rateLimitPlugin);
  registerErrorHandler(app);

  // Auth plugin must be registered after jwtPlugin.
  await app.register(authPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(courseRoutes);
  await app.register(progressRoutes);
  await app.register(gamificationRoutes);
  await app.register(socialRoutes);
  await app.register(paymentsRoutes);
  await app.register(monetizationRoutes);
  await app.register(policyRoutes);
  await app.register(entitlementsRoutes);
  await app.register(packsRoutes);
  await app.register(syncRoutes);
  await app.register(notificationsRoutes);
  await app.register(supportRoutes);
  await app.register(reliabilityRoutes);
  await app.register(analyticsRoutes);

  return app;
}
```

## Verification

```bash
pnpm -C apps/api typecheck
pnpm -C apps/api test
```

## Success Criteria

- support and reliability endpoints respond
- analytics endpoint responds

---

# ============================================================
# AGENT_25_INTEGRATION.md
# ============================================================

# Task: Integration Tests and Verification Script

**Model:** opus
**Task ID:** api_025
**Modifies:** 1 file
**Creates:** 1 file
**Depends On:** AGENT_24

## Create File: apps/api/tests/integration.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { createApp } from '../src/app.js';

async function registerAndAuth(app: Awaited<ReturnType<typeof createApp>>) {
  const register = await app.inject({
    method: 'POST',
    url: '/auth/register',
    payload: {
      email: `test-${Date.now()}@example.com`,
      username: 'tester',
      password: 'Pass1234',
    },
  });
  const { accessToken } = register.json() as { accessToken: string };
  return accessToken;
}

describe('integration', () => {
  it('health, policy, packs, and progress endpoints respond', async () => {
    const app = await createApp();
    const health = await app.inject({ method: 'GET', url: '/health' });
    const policy = await app.inject({ method: 'GET', url: '/policy/config' });
    const alias = await app.inject({ method: 'GET', url: '/monetization/policy' });
    const packs = await app.inject({ method: 'GET', url: '/packs/manifest' });
    const accessToken = await registerAndAuth(app);
    const progress = await app.inject({
      method: 'GET',
      url: '/me/progress',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    const complete = await app.inject({
      method: 'POST',
      url: '/me/progress/lesson-complete',
      headers: { authorization: `Bearer ${accessToken}` },
      payload: { lessonId: 'a1_u1_l1', xpEarned: 10 },
    });
    expect(health.statusCode).toBe(200);
    expect(policy.statusCode).toBe(200);
    expect(alias.statusCode).toBe(200);
    expect(packs.statusCode).toBe(200);
    expect(register.statusCode).toBe(200);
    expect(progress.statusCode).toBe(200);
    expect(complete.statusCode).toBe(200);
    await app.close();
  });
});
```

## Checklist

- [ ] integration test covers /me/progress and /me/progress/lesson-complete
- [ ] auth helper returns a valid access token
- [ ] health/policy/packs still return 200

## Modify File: scripts/verify.sh

Append:

```bash
pnpm -C apps/api test
pnpm -C projects/anglo/apps/pwa test:bdd
```

## Verification

```bash
pnpm -C apps/api test
pnpm -C projects/anglo/apps/pwa test:bdd
```

## Success Criteria

- integration test passes
- verify.sh covers api and pwa tests

---

# PHASE 4 COMPLETE CHECKLIST

- apps/api typecheck passes
- apps/api tests pass (unit + integration)
- Auth, content, progress, gamification, payments, policy, entitlements, packs, sync, notifications, support endpoints respond
- /me/progress and /me/progress/lesson-complete update progress state
- Gamification XP/streak reads from progress store
- scripts/verify.sh runs api and pwa checks


---

# ============================================================
# PHASE 4 v1.2.1 ADDENDUM — REQUIRED CLARIFICATIONS FROM FEEDBACK
# (Applies on top of the tasks above; supersedes conflicting lines)
# ============================================================

## 2) Content Integration Clarity (Required)

You have clean-room curriculum content (Modules 5–8, 179 blocks). Integrate it as **versioned JSON files** consumed by content endpoints.

### Required content file format

Use **JSON (UTF‑8)**.

**Canonical file layout (recommended):**
```
packages/content/courses/ru-en/
  meta.json
  a1/unit_01/lesson_01.json
  a1/unit_01/lesson_02.json
  ...
  a1/unit_01/story_01.json
  a1/unit_01/checkpoint_01.json
  a2/unit_01/...
  b1/unit_01/...
```

### What goes in meta.json

- courseId, courseName
- visible CEFR sections (A1/A2/B1)
- unit list per section
- lesson node list per unit (with counts)
- story nodes per unit
- checkpoint node references per section boundary
- optional: placement-test reference

### How endpoints read it

- `apps/api/src/services/content.ts` reads the filesystem under `packages/content/courses/<courseId>`
- validates with schemas (zod)
- caches parsed content in-memory (safe because content files are immutable per build)

Endpoints to support UI:
- `GET /courses/:courseId/meta` (and/or `/courses/:courseId`)
- `GET /courses/:courseId/lessons/:lessonId`
- `GET /courses/:courseId/stories/:storyId`
- `GET /courses/:courseId/checkpoints/:checkpointId`
- (optional) `GET /courses/:courseId/path` returning prebuilt map nodes

---

## 3) Spaced Repetition Algorithm (Required)

Implement an explicit SM2-style per-item model.

### State per user/item

```
ef: number (default 2.5, clamp [1.3, 3.0])
intervalDays: number
reps: number
lapses: number
lastReviewedAtMs: number
nextDueAtMs: number
```

### Initialization

```
ef=2.5
intervalDays=0
reps=0
lapses=0
lastReviewedAtMs=0
nextDueAtMs=nowMs
```

### Update pseudocode

```pseudo
function gradeItem(state, quality, nowMs):
  state.ef = state.ef + (0.1 - (5-quality) * (0.08 + (5-quality)*0.02))
  state.ef = clamp(state.ef, 1.3, 3.0)

  if quality < 3:
    state.reps = 0
    state.lapses += 1
    state.intervalDays = 1
  else:
    state.reps += 1
    if state.reps == 1: state.intervalDays = 1
    else if state.reps == 2: state.intervalDays = 6
    else state.intervalDays = round(state.intervalDays * state.ef)

  state.lastReviewedAtMs = nowMs
  state.nextDueAtMs = nowMs + state.intervalDays * DAY_MS
  return state
```

### Daily queue “due” threshold

An item is due if:

```
nextDueAtMs <= nowMs
```

Queue build:
- start with due items sorted by nextDueAt
- fill with weak items (low ef / high lapses) until limit (e.g., 20)

---

## 4) Streak Repair Logic (Required)

### Grace window duration

- Repair is available until **72 hours after incident end** (configurable), for impacted days only.

### Detect outage day vs user didn’t practice

- Outage days derive from `incidents` windows (ops-configured).
- Eligible only if:
  1) missed day is inside incident window days
  2) user had an active streak the day before
  3) user has at least one `app_open` or `lesson_start` event recorded that day (from `/sync/reconcile`)
     - prevents giving repairs to users who never showed up.

### User flow

- Client fetches incidents + streak status.
- If eligible, show banner “Restore streak”.
- CTA calls `POST /me/streak/repair { dayUtc }`.
- Server inserts a synthetic `activity_day` record for that day and recomputes streak.

---

## 5) Persistence is real (reinforce)

The current Phase 4 tasks include in-memory stores in places (e.g., Maps / global Sets). For **@core** flows, add a task to replace these with real persistence:

- SQLite is acceptable for MVP
- For production, swap to RU-located Postgres (242‑FZ)

At minimum persist:
- user progress
- activity days / streak state
- SRS item states
- sync event idempotency keys (acked IDs per user)

---

## 6) Not blocking (explicit deferrals)

These can wait until after Golden Path validation:

- Notification scheduler wiring (push/cron)
- Partial sync ack/resume handling
- Audio fallback edge cases

---

## 7) Mark RU-incompatible or @v2 work as FUTURE

If present in Phase 4 tasks, mark as `# FUTURE` for RU MVP:
- payments rails + refunds
- promo codes
- global leaderboards
- email verification hard gate

---

# APPENDIX B — v1.3.1 Implementation Overrides (Apply on top of Appendix A)

This appendix provides **drop-in code blocks** that replace the major legacy contradictions.

## B.1 Override: Replace in-memory stores with SQLite (better-sqlite3)

Legacy used global Maps/Sets (e.g. `memory`, `progressStore`, `ackedSyncIds`). For v1.3.1, replace those with SQLite.

### Add dependency
In `apps/api/package.json` add:
- `better-sqlite3`

### Create File: apps/api/src/db/db.ts

```typescript
import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const DEFAULT_DB_PATH = path.join(process.cwd(), 'apps/api/data/dev.sqlite');

export type DB = Database.Database;

export function openDb(): DB {
  const dbPath = process.env.DB_PATH ?? DEFAULT_DB_PATH;
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function migrate(db: DB): void {
  // Single migration block to keep the task executable.
  db.exec(`
    create table if not exists users (
      id text primary key,
      email text,
      username text,
      password_hash text,
      created_at text not null,
      timezone_offset_minutes integer
    );

    create table if not exists progress_snapshots (
      user_id text primary key,
      total_xp integer not null default 0,
      completed_lessons_json text not null default '[]',
      updated_at_ms integer not null default 0,
      foreign key(user_id) references users(id) on delete cascade
    );

    create table if not exists activity_days (
      user_id text not null,
      day_key text not null,
      source text not null,
      occurred_at_ms integer not null,
      primary key (user_id, day_key),
      foreign key(user_id) references users(id) on delete cascade
    );

    create table if not exists srs_items (
      user_id text not null,
      item_id text not null,
      reps integer not null default 0,
      interval_days real not null default 0,
      ease real not null default 2.5,
      due_at_ms integer not null,
      last_reviewed_at_ms integer not null default 0,
      lapses integer not null default 0,
      primary key (user_id, item_id),
      foreign key(user_id) references users(id) on delete cascade
    );

    create table if not exists sync_acks (
      user_id text not null,
      event_id text not null,
      occurred_at_ms integer not null,
      primary key (user_id, event_id),
      foreign key(user_id) references users(id) on delete cascade
    );

    create table if not exists incidents (
      id text primary key,
      starts_at_ms integer not null,
      ends_at_ms integer not null,
      title text not null,
      severity text not null
    );

    create table if not exists repaired_days (
      user_id text not null,
      day_key text not null,
      incident_id text,
      repaired_at_ms integer not null,
      primary key (user_id, day_key),
      foreign key(user_id) references users(id) on delete cascade,
      foreign key(incident_id) references incidents(id) on delete set null
    );

    create table if not exists streak_freezes (
      user_id text primary key,
      owned integer not null default 0,
      equipped integer not null default 0,
      updated_at_ms integer not null default 0,
      foreign key(user_id) references users(id) on delete cascade
    );

    create table if not exists appeals_reports (
      id text primary key,
      user_id text not null,
      lesson_id text not null,
      exercise_id text not null,
      user_answer text not null,
      expected_answer text,
      note text,
      created_at_ms integer not null,
      foreign key(user_id) references users(id) on delete cascade
    );

    create table if not exists entitlements (
      user_id text primary key,
      max_active integer not null default 0,
      max_expires_at_ms integer,
      updated_at_ms integer not null default 0,
      foreign key(user_id) references users(id) on delete cascade
    );

    create table if not exists billing_payments (
      id text primary key,
      provider text not null,
      provider_payment_id text unique,
      user_id text not null,
      plan_id text not null,
      method text not null,
      amount_rub integer not null,
      status text not null,
      created_at_ms integer not null,
      updated_at_ms integer not null,
      provider_payload_json text,
      foreign key(user_id) references users(id) on delete cascade
    );

    create table if not exists billing_events (
      id text primary key,
      provider text not null,
      event_key text not null unique,
      created_at_ms integer not null,
      payload_json text
    );
  `);
}

export const db = openDb();
```

### Modify File: apps/api/src/app.ts (startup DB)

After creating Fastify instance, call:

```typescript
import { db, migrate } from './db/db.js';

migrate(db);
```

## B.2 Override: Local-time streak dayKey helper

Create `apps/api/src/services/dayKey.ts`:

```typescript
const MS_PER_MIN = 60_000;

// dayKey format: YYYY-MM-DD in the user's *local* calendar day.
export function dayKeyFromEvent(occurredAtMs: number, timezoneOffsetMinutes: number): string {
  const localMs = occurredAtMs + timezoneOffsetMinutes * MS_PER_MIN;
  return new Date(localMs).toISOString().slice(0, 10);
}
```

Use this helper everywhere you write/read `activity_days.day_key`.

## B.3 Override: SM-2 SRS update function (server-side)

Create `apps/api/src/services/srs.ts`:

```typescript
const DAY_MS = 86_400_000;

export type SrsState = {
  reps: number;
  intervalDays: number;
  ease: number;
  dueAtMs: number;
  lastReviewedAtMs: number;
  lapses: number;
};

export function clamp(num: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, num));
}

export function sm2Update(state: SrsState | null, quality: number, nowMs: number): SrsState {
  const base: SrsState =
    state ??
    ({ reps: 0, intervalDays: 0, ease: 2.5, dueAtMs: nowMs, lastReviewedAtMs: 0, lapses: 0 } as const);

  const q = clamp(quality, 0, 5);
  let reps = base.reps;
  let intervalDays = base.intervalDays;
  let ease = base.ease;
  let lapses = base.lapses;

  // EF update
  ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  ease = clamp(ease, 1.3, 3.0);

  if (q < 3) {
    reps = 0;
    lapses += 1;
    intervalDays = 1;
  } else {
    reps += 1;
    if (reps == 1) intervalDays = 1;
    else if (reps == 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * ease);
  }

  const dueAtMs = nowMs + intervalDays * DAY_MS;
  return {
    reps,
    intervalDays,
    ease,
    dueAtMs,
    lastReviewedAtMs: nowMs,
    lapses,
  };
}
```

## B.4 Override: /me/review/queue and /me/review/complete endpoints

Legacy Phase 4 did not implement review. Add a new route file `apps/api/src/routes/review.ts` and register it in `app.ts`.

The route MUST:
- Build queue per Phase 4 “Daily queue generation” rules.
- Return `dueCount` so Phase 3 UI can render “Повторение — N заданий”.
- Persist review results into `srs_items`.

(Implementation is straightforward once `db` and `sm2Update` exist.)
