# PHASE 4 VALIDATION CHECKLIST (Golden Path v1.3.1 — Russia-First)

Use this after Phase 3+4 tasks are implemented to confirm the plan produces a **credible** Duolingo-class MVP for RU→EN.

> Key idea: validate **psychological effects** (feel smart fast, loss aversion streak, "this is a real course", review habit) AND the **RU competitive wedge** (audio works without VPN).

---

## Golden Path v1.3.1 Overview

| Step | What | RU Constraint |
|------|------|---------------|
| 1 | Open app → see course structure | Loads from RU-hosted infra, no VPN |
| 2 | Start lesson → hear audio | Audio works without VPN (competitive wedge) |
| 3 | Complete lesson → XP/streak update | No hearts/energy gating |
| 4 | Close and reopen → progress persists | Works offline |
| 5 | Return next day → streak + review | Local timezone, review never blocked |
| 6 | Hit paywall → understand Max | Triggers on Max value-add only |
| 7 | Pay → Max unlocked | RU rails (Mir/SBP), not Google Play |

---

## Psychological Acceptance Criteria (Must Pass)

- [ ] First-session micro-win completes in <90 seconds and feels "can't fail"
- [ ] Per-answer feedback appears within 200ms (correct/incorrect)
- [ ] Notification prompt appears only after the first win, never before
- [ ] Incident banner appears after outage day and offers "Восстановить серию"
- [ ] Day-10 celebration is full-screen and grants 1 "защита серии"

## A. First-session commitment ladder (cold start)

### GP-A1: Cold start → micro-win in <90s
- [ ] Install / open app from cold state
- [ ] App shows goal selection (≤4 choices)
- [ ] User selects goal and starts immediately
- [ ] Micro-win lesson completes
- [ ] Lesson id `onboarding_micro_1` exists in content and matches the 6-exercise sequence/difficulty in `projects/anglo/apps/pwa/tests/features/onboarding/tutorial-first-launch.feature`
- [ ] **Measure time from first render to completion < 90 seconds**
- [ ] Completion screen shows:
  - [ ] XP earned
  - [ ] streak started ("🔥 1 day")
- [ ] Reminder permission prompt appears **after** the win (never before)

### GP-A2: First 2 items are "can't fail"
- [ ] Exercise #1 is recognition-based (e.g., select-image)
- [ ] Exercise #2 is recognition-based (e.g., tap translation)
- [ ] In a 20-user test, ≥19/20 complete the first 2 items without error

### GP-A3: Early-win difficulty guarantees
- [ ] Micro-win uses difficulty 1 for exercises 1-2 and difficulty 2 for exercises 3-6 (no typing)
- [ ] Normal lessons start with difficulty 1–2 for the first 2 exercises

---

## B. Audio reliability (RU competitive wedge)

### GP-B1: Audio works without VPN
- [ ] Test on Beeline/MTS/Megafon mobile networks (no VPN)
- [ ] Audio plays on first tap in micro-win lesson
- [ ] Time-to-first-audio 500ms p95 (micro-win)
- [ ] If audio fails, auto-retry once, then auto-downgrade to text-only/skip (lesson remains credible)

### GP-B2: First-session audio is pre-cached
- [ ] Put device in airplane mode immediately after first app open
- [ ] Start micro-win lesson
- [ ] Audio plays from cache (no network dependency)
- [ ] Pre-cache bundle <= 2 MB; allowed on cellular unless data saver is enabled
- [ ] If pre-cache fails, lesson still works; audio does one auto-retry then downgrades to text-only/skip

### GP-B3: Audio hosting verification
- [ ] Audio URLs do not reference blocked CDNs (Cloudflare global, AWS us-east, etc.)
- [ ] Audio served from RU-region hosting
- [ ] Audio domain is `audio.english.dance` (Timeweb Cloud S3, RU region)
- [ ] Outbound domain allowlist verified in CI/release build
- [ ] If hosting changes: DNS cutover only (stable hostname), dual-host for 7 days, RU SIM re-verify

---

## C. Course credibility signals ("real course", not demo)

### GP-C1: Course map depth
- [ ] Course map shows CEFR sections (A1/A2/B1) visibly
- [ ] Shows unit count + lesson counts per section
- [ ] Placement test entrypoint is visible (optional in MVP, but visible)
- [ ] A1 Unit 1 contains exactly 5 lesson nodes visible (including micro-win)
- [ ] Story/dialogue nodes are visible in the path
- [ ] Checkpoint test nodes exist at section boundaries
- [ ] Page loads in <3s on typical RU mobile network
- [ ] No third-party critical-path calls required (app usable with only our domains)

### GP-C2: Content depth reality check
- [ ] Each normal lesson has 6–12 exercises
- [ ] At least 1 listening exercise per lesson in A1 Unit 1
- [ ] Story node includes audio per line + comprehension questions

---

## D. Core learning loop (lesson start → complete → reward)

### GP-D1: Start lesson one-tap
- [ ] Tap lesson node → lesson starts without extra steps
- [ ] Close lesson mid-way → reopen → resume at correct exercise index

### GP-D2: Completion reinforcement
- [ ] Complete lesson → completion screen shown
- [ ] XP increases immediately
- [ ] Accuracy is shown on completion screen
- [ ] Streak/day goal updates immediately
- [ ] Streak starts at 1 after first lesson (not after account creation)
- [ ] Perfect lesson shows "Perfect!" celebration (no XP boost events)
- [ ] Day 10 milestone grants free streak freeze (not paywalled)

### GP-D3: Per-answer feedback timing
- [ ] Correct answers show feedback within 200ms
- [ ] Incorrect answers show feedback within 200ms and do not auto-advance
- [ ] Correct answers auto-advance after ~1.2s (or tap to continue)

### GP-D4: Fail-streak intervention (lesson-level)
- [ ] Two consecutive failures trigger an easier/review item
- [ ] Three consecutive failures force review mode for the remainder of the session

### GP-D5: No blocking mechanics
- [ ] No "wait to continue" timers
- [ ] No hearts/energy gating in RU launch

---

## E. Spaced repetition (review habit formation)

### GP-E1: Review is always available
- [ ] Home screen shows Review button
- [ ] Review shows "N items due"
- [ ] Review is reachable regardless of any limiter state

### GP-E1a: Review Mode decision checks (Explicit + Safety Net)
- [ ] Primary review surface is a separate "Повторение — N заданий" button
- [ ] Tapping opens a dedicated review session
- [ ] Lessons are 100% new content by default
- [ ] Interleaving happens only if overdueCount > 20 AND last review > 3 days ago
- [ ] Interleaving (when active) is ≤30% of lesson items and is unlabeled

### GP-E2: Daily queue semantics
- [ ] After learning a new item, it appears in the review system
- [ ] Next day: queue contains due items (nextDueAt <= now)
- [ ] Completing review counts as practice day for streak

### GP-E3: Per-item state persistence
- [ ] SRS state persists across app restart (local DB)
- [ ] If logged-in, SRS state persists across devices (server DB)

---

## F. Streak integrity (offline-safe + local timezone + repair)

### GP-F1: Local timezone streak
- [ ] User in UTC+3 practicing at 23:30 local time
- [ ] Streak credits correct local day (not UTC day)
- [ ] Timezone/DST changes do not unfairly break streak

### GP-F2: Offline-safe streak update
- [ ] Put device in airplane mode
- [ ] Complete cached lesson or review
- [ ] Streak UI updates locally (today credited)
- [ ] Reconnect network → sync occurs → server streak matches local

### GP-F3: Streak repair (incident-driven)
- [ ] Configure an incident window impacting a day
- [ ] User attempts to study that day (app_open or lesson_started event recorded)
- [ ] User misses completion due to incident
- [ ] Next day user sees incident banner + "Восстановить"
- [ ] Repair works within grace window (≤72h after incident end)
- [ ] Streak recomputed correctly after repair

---

## G. Account upgrade (save progress without breaking habit)

### GP-G1: Deferred account creation
- [ ] User can complete onboarding + Unit 1 anonymously
- [ ] Progress persists locally across app restarts

### GP-G2: Upgrade prompt appears at right moment
- [ ] After Unit 1 completion OR day 3–5 streak, app prompts "Save your progress"
- [ ] User registers/logs in with consent checkbox (242-FZ)
- [ ] Local progress merges to server via sync
- [ ] Streak preserved (no loss)

---

## H. Max paywall (value-add, not core learning)

### GP-H1: Paywall triggers on Max value-add only
- [ ] User taps "Roleplay" → Max paywall shown
- [ ] User taps "Speaking coach" → Max paywall shown
- [ ] User taps "Ask AI" deeper coaching → Max paywall shown
- [ ] Lesson remains playable without paying
- [ ] Review remains available without paying

### GP-H2: Max paywall copy
- [ ] Paywall shows clear value: "Max gives you roleplay practice, speaking feedback, deeper AI coaching"
- [ ] Does NOT promise "unlimited learning" as paid-only benefit
- [ ] Tone: "serious learner toolkit" not "remove punishment"
- [ ] “Why?” explanations remain free (authored)

### GP-H3: No Max pitch before first micro-win
- [ ] Complete onboarding flow without seeing Max upsell
- [ ] Max upsell only appears after value is proven

---

## I. RU Payment rails (not Google Play)

### GP-I1: Web checkout works
- [ ] Payment flow uses web checkout (not in-app Google Play billing)
- [ ] Works in PWA
- [ ] Works in RuStore Android (TWA)
- [ ] SBP bank-app handoff + return works in TWA

### GP-I2: RU payment methods available
- [ ] Mir card option visible
- [ ] SBP option visible
- [ ] Payment completes successfully (use test/mock in dev)

### GP-I3: Entitlement sync
- [ ] After successful payment, Max unlocks within <10 seconds
- [ ] Receipt/confirmation and transaction ID shown
- [ ] “Restore purchases / Sync entitlements” available if callback fails
- [ ] Manage subscription page reachable (web OK)
- [ ] Entitlements sync to device (works offline after sync)

---

## J. Appeals + tips ("trust the grader")

### GP-J1: Why/explanation at moment of error
- [ ] Wrong answer shows "Why?"
- [ ] "Why?" shows short RU explanation + example

### GP-J2: Report accepted answer
- [ ] Wrong answer shows "Report: should be accepted"
- [ ] Report is stored (online) or queued (offline) and later synced

---

## K. Persistence (non-negotiable)

### GP-K1: Close and reopen
- [ ] Complete a lesson
- [ ] Close app completely
- [ ] Reopen → progress is still there (local persistence)

### GP-K2: Sync idempotency
- [ ] Send same sync batch twice
- [ ] Server acks idempotently (no double XP, no duplicate completions)

---

## L. Non-blocking checks (can be skipped for initial sign-off)

- [ ] Notification scheduler actually sends reminders
- [ ] Audio fallback edge cases handled (missing audio, codec quirks)
- [ ] Partial sync ack/resume (fine-grained) implemented
- [ ] Full RU network test across all major operators

---

## Sign-off criteria

Phase 4 can be signed off when:

1. **Sections A–K all pass**, and
2. **Audio reliability (Section B) passes on at least one RU network** (manual test OK), and
3. **Max paywall (Section H) never blocks lessons or review**, and
4. Any failures are either fixed or explicitly accepted as *non-blocking* with a dated follow-up plan.

---

## Test Environment Notes

For RU-specific validation:
- Use RU-hosted staging environment (not global CDN)
- Audio hosting (v1.3): Timeweb Cloud S3 (RU region, Standard class), domain `audio.english.dance`
- Migration protocol (if changing host, e.g., Timeweb → Yandex Cloud Object Storage):
  - Keep `audio.english.dance` stable (CNAME switch only)
  - Dual-host until error rate stabilizes (≥7 days)
  - Re-verify on RU SIMs (Beeline/MTS/Megafon), no VPN
  - Update CI allowlist + release notes
  - Follow `projects/anglo/docs/ops/audio-hosting-runbook.md`
- Test on actual RU SIM cards (Beeline/MTS/Megafon) if possible
- VPN must be OFF during audio tests
- Mock webhooks acceptable for payment flow in dev; real provider test before release
