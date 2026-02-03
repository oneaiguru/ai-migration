# Product Requirements Document: English Learning App for Russian Speakers

**Version:** v1.3

## Executive Summary

**North star (v1.3):** win RU market displacement by making **audio work without VPN** while delivering a Duolingo-like psychological loop:
**quick competence → streak/loss aversion → spaced repetition → identity**.

**Grounding tags (use throughout this PRD):**
* FACT: verifiable and cited.
* DECISION: chosen product or architecture direction.
* HYPOTHESIS: expected impact to validate via experiments.
* UNKNOWN: not yet researched or confirmed.

**RU reality (non-negotiables):**
* DECISION: Our wedge is **“Duolingo audio is broken in Russia; we work without VPN.”** Treat audio reliability as an infrastructure promise, not a feature.
* FACT: In Russia since March 2022, Duolingo is effectively “Super for free” (payment restrictions), which resets user expectations toward **“unlimited”** learning with fewer paywalls and fewer ads.
* FACT: Store billing is unreliable/unavailable for many RU users; assume **Google Play billing is not a viable payment rail**.
* DECISION: Compliance with **242‑FZ data localization** is mandatory. Personal data must be stored and processed in Russia.
* DECISION: **No ads** at launch.
* DECISION: **Max** is the only paid tier in v1.3 (AI features); **Super is out of scope** for v1.3.

**Core loop we must serve (v1.3):**
1) Open app → 2) 30–90s micro-win → 3) Instant feedback/praise → 4) Progress tick (“I’m learning”) → 5) Streak/goal commitment → 6) Daily Review queue (spaced repetition) → back to micro-win.

**Brand & mascot (v1.3):**
* DECISION: Brand/domain is **english.dance**; mascot identity is the **english.dance** dancing character.

**Key changes vs v1.2:**
* DECISION: Ship and validate a **Golden Path v1.3** with RU constraints as acceptance criteria (see below).
* DECISION: Make **audio reliability** a first-class requirement: first-session audio is bundled/pre-cached; audio served from RU-friendly hosting; credible fallbacks on failure.
* DECISION: Monetization is explicit: **Free = unlimited learning, no ads**; **Max = paid AI features** (paywall only on AI feature taps); **Super deferred**.
* DECISION: Payments must work via **RU rails (Mir/SBP) via web checkout** for PWA + RuStore Android.
* DECISION: Keep learning loop clean: no energy/hearts blocking review, no XP boosts/double-XP events, no gem/store economy, no default-on global leagues.

## Target Audience and Language Scope

**Primary audience:** Native Russian speakers learning English (RU→EN).
* DECISION: Launch with RU→EN only for v1.3.
* DECISION: Cover CEFR **A1–B1** in the first release track, with explicit RU-native pain-point tracks (see Content).

**Primary job-to-be-done:**
* “I want to feel real progress quickly, keep a streak, and trust this is a real course (not a toy).”

**Credibility threshold (v1.3):**
* DECISION: The product must communicate “this is a real course” early via course map, explanations, and outcomes signaling (checkpoint tests + shareable artifact).

## Platform Strategy and Distribution

* DECISION: Platforms remain **PWA + Android (RuStore)** as primary, iOS secondary.
* DECISION: v1.3 must support **offline learning** as a core parity feature (at least “download next ~20 lessons” free).
* DECISION: Core experiences (course map, lessons, **audio**) must work in Russia **without VPN** and without dependencies that can be blocked (see Golden Path + Audio Reliability Pack).
* DECISION: Reliability + offline are treated as retention and trust features, not Max-only perks.

## Onboarding and First-Session Loop

* DECISION: The first session must deliver a felt “I can do this” micro-win in **<60–90 seconds**.
* DECISION: The micro-win must include **working audio** (listening exercise) and must not depend on live network fetch (bundle or pre-cache first-session audio).
* DECISION: The user picks a goal in the first session: daily minutes (e.g., 5/10/15) or weekly frequency (e.g., 4 days/week).
* DECISION: Default goal mode starts a streak, but weekly-goal users must be supported without guilt/shame framing.
* DECISION: End of first session shows a “tomorrow hook” (preview of what’s next + review expectation).
* DECISION: Account creation is optional and deferred until after the micro-win (no sign-up wall before learning starts).
* DECISION: Offer an optional **placement test / test-out** after the first micro-win (never before it).
* DECISION: Notification permission request MUST occur AFTER micro-win completion (never before the first lesson is finished).
* DECISION: Prompt copy: "Want a daily reminder to keep your streak?"
* DECISION: If declined: no penalty, no repeated asks for 7 days.
* DECISION: Store notification preference immediately.

### First-Session Content Requirements (Can't-Fail Design)

#### Exercise 1-2 constraints
* DECISION: First 2 exercises in onboarding micro-win MUST be recognition-based:
  - Exercise 1: Select image (show 4 images, tap the one matching word)
  - Exercise 2: Tap translation (word bank, tap to form simple sentence)
* DECISION: These exercises have **>95% success rate** target
* DECISION: Accept broad correct answers (e.g., "hi" and "hello" both correct for "привет")

#### No typing in first session
* DECISION: First lesson contains ZERO typing exercises
* DECISION: First typing exercise appears in Lesson 2 or later
* RATIONALE: Typing is highest-friction, highest-failure exercise type

#### Audio in first session
* DECISION: At least 1 audio exercise in micro-win lesson
* DECISION: Audio is "listen and tap" (recognition), NOT "listen and type" (production)
* DECISION: Audio is pre-cached/bundled so it plays instantly

#### Difficulty ceiling
* DECISION: Micro-win lesson difficulty is capped at level 1 (easiest)
* DECISION: No exercise in micro-win lesson has <90% predicted success rate

## Golden Path v1.3 (Russia-first acceptance criteria)

This is the shipped user journey. Each step has explicit RU constraints and acceptance criteria.

### Step 1: Open app → see course structure
**RU constraint:** Loads from RU-hosted infrastructure, no VPN required.

Acceptance:
- Course map renders A1/A2/B1 sections with visible depth (unit/lesson counts).
- Story + checkpoint nodes visible in path.
- Page loads in <3s on typical RU mobile network.
- Zero external CDN calls that could be blocked.

### Step 2: Start lesson → hear audio, answer questions
**RU constraint:** Audio MUST work without VPN — this is the competitive wedge.

Acceptance:
- Audio plays on first tap, no VPN, on Beeline/MTS/Megafon networks.
- First-session audio is bundled or pre-cached at app open (no network dependency for micro-win).
- Audio served from RU-region hosting (not Cloudflare global, not AWS us-east).
- If audio fails to start: auto-retry once, then auto-downgrade to text-only/skip, but lesson remains credible.
- Micro-win lesson starts with 2 recognition-based exercises (no typing) and targets >95% success rate on exercises 1–2.
- At least 1 listening exercise per lesson in A1 Unit 1.

### Step 3: Complete lesson → see XP/streak update
**RU constraint:** No energy/hearts blocking; streak starts immediately.

Acceptance:
- XP earned + streak count visible on completion screen.
- Streak starts at 1 after first lesson (not after account creation).
- Perfect lesson shows “Perfect!” celebration (no XP boost events).
- Day 10 milestone grants free streak freeze (not paywalled).
- Day 10 milestone celebration is visibly larger than normal days and includes a distinct badge.
- No “wait to continue” mechanics.

### Step 4: Close and reopen → progress still there
**RU constraint:** Works offline and survives network instability.

Acceptance:
- Progress persists in IndexedDB.
- Reopening app shows correct completed lessons + streak.
- Works in airplane mode if content was cached.

### Step 5: Return next day → streak logic works + review available
**RU constraint:** Local timezone, outage-safe, review never blocked.

Acceptance:
- Streak day boundary uses user’s local timezone (not UTC).
- Review button always visible and functional (regardless of hearts).
- Due count shown (“Review (N due)”).
- Completing review counts toward streak/day goal.
- If server had incident yesterday: banner offers streak repair.
- Offline completions credit correct day when synced.

### Step 6: Hit paywall → understand what Max offers
**RU constraint:** Not “pay to continue” — it’s “get what Duolingo Russia never had.”

Acceptance:
- Paywall triggers when user taps AI feature: “Explain my mistake” / “Roleplay” / “Speaking coach”.
- Paywall shows clear value: “Max gives you AI explanations, roleplay practice, speaking feedback.”
- Never blocks next lesson or review.
- No Max pitch before first micro-win.
- Tone: “serious learner toolkit” not “remove punishment”.

### Step 7: Pay → Max unlocked via RU payment rails
**RU constraint:** Mir/SBP, not Google Play billing.

Acceptance:
- Payment flow uses web checkout (YooKassa/CloudPayments/SBP).
- Works on Android (RuStore) and PWA.
- Instant unlock after successful payment.
- Receipt/confirmation shown.
- Entitlements sync to device immediately.

## Monetization Strategy and Tiers (v1.3)

**Principle (v1.3): value-add, not “pay to continue.”**
* DECISION: Free users must always be able to do something learning-positive (at minimum: review).
* DECISION: Paywall triggers only when the user taps a **Max (AI) feature**; it must never block the next lesson or review.
* DECISION: Avoid monetizing streak fear (no paid streak freezes as a primary monetization lever).
* DECISION: Avoid ad-gated learning or ad-based streak protection.
* DECISION: No Max pitch before the first micro-win.
* DECISION: No ads.

**Free tier (v1.3):**
* DECISION: Unlimited learning with no “wait to continue” mechanics.
* DECISION: Review is always available (no hard “you must stop” limiter).
* DECISION: If a limiter exists at all, it may only **rate-limit new lessons** and must never drain on correct answers; for RU launch, default posture is **extremely conservative (or disabled)** to match “unlimited” parity expectations.
* DECISION: Hearts/energy are **disabled by default for RU**; if they exist, they may only gate new lessons (never review) and must not punish correct answers.
* DECISION: Core modalities (stories/listening) must exist in free tier at meaningful depth to avoid immediate “worse than Duolingo” comparison.
* DECISION: Offline: free users can download a limited pack (e.g., next ~20 lessons + required audio + rolling review buffer) with clear storage controls.

**Max (v1.3, paid):**
Max sells what Duolingo RU users could not access: AI learning tools.
* DECISION: Max unlocks AI features: “Explain my mistake” (AI), Roleplay, Speaking coach.
* DECISION: Max may also include convenience expansions: larger offline packs, advanced practice modes, deeper diagnostics, and additional curated tracks.
* HYPOTHESIS: Max conversion improves when positioned as “serious learner toolkit” vs “remove punishment.”

**Out of scope (v1.3):**
* DECISION: Super tier is deferred to a future version.

**Removed from v1.3 monetization:**
* DECISION: No ads, no ad-based rewards, no ad-based streak freeze, no paid streak freezes.
* DECISION: No gem/store economy loop.

## Content and Curriculum

### Credibility Pack (first-class product surface)
* DECISION: Ship a “Credibility Pack” surface that signals “this is a real course,” not a demo:
  * course map segmented by CEFR bands (A1 → A2 → B1),
  * number of units/lessons publicly visible,
  * estimated hours/effort per section (rough but explicit),
  * placement test / test-out (start at the right level),
  * checkpoint tests + shareable progress artifacts (see below),
  * contextual “Explain / Why?” at the moment of error (see below).
* DECISION: Course depth must clear a “real course” threshold: do not ship/market the RU→EN course with **<50** publicly visible lesson-equivalents; target **100+** publicly visible lesson-equivalents across A1–B1 on the course map at launch.
* DECISION: Definitions used for depth targets:
  * Unit: a user-visible grouping on the course map.
  * Lesson: a user-visible learning chunk (typically ~2–5 minutes).
  * Story: a dialogue/story unit with comprehension questions.
  * Unique listening minutes: sum of unique audio minutes shipped for listening drills + stories (not counting repeats).
  * Lesson-equivalent: a user-visible learning chunk counted for “demo vs real course” depth (lessons + story/listening sessions surfaced as equivalent chunks).
* HYPOTHESIS: Initial per-band depth targets (validate with early cohorts; only the **100+** lesson-equivalent “not a demo” threshold is mandatory):

| CEFR band | Units (min) | Lessons (min) | Stories (min) | Unique listening minutes (min) |
| --- | ---: | ---: | ---: | ---: |
| A1 | 8 | 40 | 10 | 60 |
| A2 | 7 | 35 | 12 | 80 |
| B1 | 5 | 25 | 12 | 100 |
| **Total** | **20** | **100** | **34** | **240** |

### Course structure (RU→EN)
* DECISION: Course content aligns to CEFR A1–B1, with unit maps and clear learning outcomes per unit.
* DECISION: Each unit includes: new learning + practice + review integration (spaced repetition).

### Course map and learner autonomy (anti-backlash constraint)
* DECISION: Users can always:
  * jump back to prior units,
  * choose “Review” vs “Continue” (lessons always interleave review),
  * access stories/audio separately from the main path,
  * test out / re-place via placement test.
* DECISION: Do not ship a hard single-path experience with no choice.

### Core modalities (core in v1.3)
* DECISION: **Stories/Dialogues** with comprehension questions.
* DECISION: **Audio-first listening drills** (short “radio-style” sessions can be phased in after initial listening drills).
* DECISION: Speaking can be staged, but listening must ship early to meet “real course” expectations.
* DECISION: Minimum credible slice: A1 Unit 1 ships with **≥5 lessons**, ~**6–12 exercises per lesson**, and **audio in every lesson**.
* DECISION: A1 Unit 1: at least **1 listening exercise per lesson**.

### “Explain / Why?” (authored)
* DECISION: Every error state must be eligible for a human-authored explanation path:
  * why the correct answer is correct,
  * why the user’s answer is wrong (common RU-native pitfalls),
  * a short rule/heuristic + 1–2 examples.
* DECISION: Every incorrect answer shows "Почему?" (Why?) link.
* DECISION: "Why?" opens modal/panel with:
  1. The correct answer (repeated)
  2. Why it's correct (1-2 sentences in Russian)
  3. Why user's answer is wrong (if common mistake)
  4. 1-2 example sentences
  5. Related grammar rule (if applicable)
* DECISION: Explanations are human-authored, not AI-generated.
* DECISION: Each exercise type has an explanation template.
* DECISION: Common RU-native mistakes have specific explanations:
  - Missing articles (a/an/the)
  - Wrong tense (present simple vs continuous)
  - Word order errors
  - Preposition mistakes
* DECISION: Do not gate baseline explanations behind AI features in v1.3 (Max AI is additive, not required for credibility).
* DECISION: Basic "Why?" explanations are NOT paywalled; Max (AI) provides extended explanations on top of basic ones.

### RU-native “pain point tracks” (structured micro-courses)
* DECISION: Ship named tracks surfaced in UI:
  * Articles Bootcamp (a/an/the),
  * “To be” + word order coach,
  * Tenses map for RU speakers,
  * Phrasal verbs & prepositions drills.
* HYPOTHESIS: Explicit tracks improve early perceived personalization and reduce churn from “this doesn’t address my problems.”

### Checkpoint tests + shareable progress artifact (outcomes signal)
* DECISION: Add internal checkpoint tests at unit/level boundaries (aligned to CEFR bands used in the course).
* DECISION: Generate a shareable progress artifact (e.g., “A1 Checkpoint Passed” card) with transparent disclaimers (“not an official certificate”).
* HYPOTHESIS: Outcomes signaling improves activation and retention by increasing course credibility.

### Community-lite (trust without full forums)
Because full forums are risky/heavy (moderation + compliance), but losing discussion harms perceived quality:
* DECISION: Per-exercise surface includes:
  * “Common valid answers”
  * “Common mistakes” (with short guidance when possible)
* DECISION: Provide “Suggest an alternative translation” with a review pipeline.
* DECISION: Provide “Report issue” with user-visible status (e.g., “received,” “in review,” “fixed in version X”).
* DECISION: Do not ship open-ended public forums in v1.3; Community-lite is structured and moderation-friendly.

## Technical Architecture and Implementation

### Data localization and compliance (242‑FZ)
* DECISION: Store personal data in Russia; architecture and vendors must support RU-hosted databases and backups.
* DECISION: Audit data flows to ensure no accidental export of personal data outside RU.

### RU-hosted delivery (no VPN, no blocked dependencies)
* DECISION: Core flows (course map, lessons, audio, auth/entitlements) must load in Russia without VPN.
* DECISION: Do not depend on external CDNs that can be blocked; bundle or serve all core assets (fonts/scripts/audio) from RU-friendly infrastructure.
* DECISION: Maintain an allowlist of required outbound domains and verify it via automated network logging in CI/release builds.

### Audio Reliability Pack (no-VPN wedge)
* DECISION: Audio must play without VPN across major RU mobile operators (Beeline/MTS/Megafon) and typical RU networks.
* DECISION: Serve audio from RU-region hosting and RU-friendly delivery; avoid “global” CDNs/origins that may be blocked or degraded in RU.
* DECISION: First-session audio is bundled or pre-cached at app open (micro-win does not depend on a network fetch).
* DECISION: Playback fallback: if audio does not start, auto-retry once, then auto-downgrade to text-only/skip while preserving lesson credibility.
* DECISION: Instrumentation: track audio start success rate, time-to-first-audio, and failures by ISP/operator.
* DECISION: Validation: include a Golden Path test assertion “**audio plays without VPN** on RU networks” (manual initially, automated later).
* DECISION: Development/staging infra is RU-hosted so we can run in-country verification (no VPN, no simulation required).

#### Audio hosting decision (v1.3)
* DECISION: Host audio on **Timeweb (RU region)** and serve via **audio.english.dance**.
* DECISION: Allowlist `audio.english.dance` in outbound domain checks; do not call global CDNs.
* DECISION: Fallback if primary host is blocked or degraded:
  * maintain the stable hostname `audio.english.dance` and switch the origin via DNS (CNAME),
  * keep a parallel origin on **Yandex Cloud** or **Beget** ready for cutover,
  * run RU SIM verification (Beeline/MTS/Megafon, no VPN) before and after any cutover,
  * keep dual-host serving for 7 days (or until error rate stabilizes),
  * update CI allowlist and release notes when the origin changes.

### Offline mode (core parity, operational rules)
* DECISION: Offline packs must include everything required to learn without connectivity (content + audio + review queue).
* DECISION: Free users can download at least one “Next Pack” (e.g., next ~20 lessons + included stories + required audio, capped at ~250MB) plus a rolling buffer of due review items (e.g., next 3 days); Max can download larger/multiple packs.
* DECISION: Storage UI must include: total size, per-pack size, Wi‑Fi only toggle, clear downloads, and “auto-download next pack” option.
* DECISION: Offline attempts are stored as append-only events with unique IDs; on sync, the server de-duplicates and merges progress deterministically.
* DECISION: Sync and conflict rules:
  * if content/accepted answers change while offline, keep completion credit and re-evaluate SRS scheduling after sync,
  * if multiple devices create overlapping progress, merge attempts (do not silently drop) and show last-sync status.
* DECISION: Offline must not cause unfair streak loss:
  * offline completions count toward the streak day they occurred (even if synced later),
  * if day-credit is uncertain until sync, mark streak as protected until confirmed.

### Payments: RU rails (Mir/SBP) via web checkout
* DECISION: Do not depend on Google Play billing. Use web checkout that works for PWA and RuStore Android.
* DECISION: Support RU payment rails: Mir cards and SBP (provider options: YooKassa/CloudPayments).
* DECISION: Entitlements unlock immediately after successful payment and sync across devices.
* DECISION: Purchase confirmation includes receipt/confirmation screen and persistent entitlement state for offline access.

### Community-lite pipelines (review + transparency)
* DECISION: Implement backend workflows for:
  * alternative translation suggestions (queue → review → publish),
  * issue reports with status changes and changelog linkage.
* DECISION: Provide minimal internal/admin tooling for triage and status updates.

### Learning engine: Spaced Repetition Engine (core)
* DECISION: Define an SRS “item” as a stable, reviewable memory unit that can appear in multiple exercise formats; v1.3 item types include:
  * vocabulary/phrases,
  * grammar/syntax patterns (including RU-native pitfalls),
  * listening comprehension prompts,
  * story comprehension checkpoints.
* DECISION: Implement a per-item memory model (HLR-like strength/half-life) and generate a **daily review queue**.
* DECISION: Review is ALWAYS visible on home screen, with due count (“Review (N due)”) and the same visual prominence as “Continue” (not hidden).
* DECISION: Review queue must be integrated into the home loop and be always accessible.
* DECISION: The system must record item outcomes and schedule future reviews deterministically and explainably.
* DECISION: Queue rules:
  * default daily session starts with review (micro-win) and then interleaves review + new; users can choose Review-only, but lessons are never New-only (interleaving is mandatory),
  * prioritize overdue + low-strength items first,
  * review is never capped; show a recommended daily target, but allow more.
* DECISION: New-vs-review mixing:
  * each lesson session includes ~30% review exercises mixed with new content (user does NOT know which exercises are review vs new),
  * if user has >20 items overdue, next lesson is 50% review / 50% new,
  * if user has >50 items overdue, show "Review recommended" banner but don't block.
* DECISION: Path integration: after every 3-5 lessons completed, the course map shows an auto-generated "Practice" node that pulls from the SRS queue; completing it counts toward streak/day goal.
* DECISION: Review is accessible regardless of hearts, daily lesson limit, or subscription status; review can ALWAYS be done.
* DECISION: Completing review counts toward daily goal, streak maintenance, and XP earnings (same rate as lessons).
* DECISION: Daily caps (soft, not blocking):
  * recommend a maximum number of new items introduced per day (default: ~20) to prevent unmanageable review debt; warn when exceeding it.
* DECISION: User visibility/control:
  * show today’s due count + estimated time,
  * show strength/“needs review” indicators,
  * allow “review now” and short “snooze” on specific items.
* Metrics (v1.3):
  * HYPOTHESIS: Review completion rate correlates with 7/30-day retention lift.
  * DECISION: Track: daily review completions, review queue size, overdue rate, recall accuracy, time-to-first-micro-win, and reactivation lift attributable to review.

### Learning engine: Adaptive Difficulty Engine (Birdbrain-equivalent)

#### Target success rate
* DECISION: Exercise selection targets **~70% predicted success probability** per exercise
* DECISION: This creates "flow state" - challenging enough to engage, easy enough to not frustrate
* HYPOTHESIS: 70% success rate maximizes both retention and learning efficacy

#### Real-time adaptation within session
* DECISION: Track rolling success rate during lesson
* DECISION: If user gets **3+ wrong in a row**, next exercise is from easier pool (items with >85% predicted success)
* DECISION: If user gets **5+ correct quickly** (<3s average), next exercise is from harder pool (items with ~60% predicted success)
* DECISION: Adaptation is invisible to user - no UI indicating difficulty adjustment

#### Item difficulty modeling
* DECISION: Each exercise/item has a difficulty score (1-5) set by content team
* DECISION: User has a "current level" per skill area updated after each answer
* DECISION: Match user level to item difficulty for ~70% success prediction
* HYPOTHESIS: Simple level-matching is sufficient for v1.3; ML model (true Birdbrain) is v2

#### Anti-gaming measures
* DECISION: Repeating identical content yields diminishing XP (50% → 25% → 10%)
* DECISION: SRS strength only increases if time since last review > minimum interval
* DECISION: "Easy" lessons (where user has >95% mastery) are marked complete but don't count toward daily goal

### Streak system: outage-safe + repairable (core)
* DECISION: Streak starts at 1 after the first completed lesson (not after account creation).
* DECISION: Streak day boundary uses the user’s local timezone (not UTC).
* DECISION: Completing review counts toward the streak/day goal.
* DECISION: Day 10 milestone grants a free streak freeze (earned, not paywalled).
* DECISION: Known outage/sync failure days must not break streaks.
* DECISION: Provide a streak repair mechanism (e.g., automatic grace on incident days and/or user-initiated make-up within a window).
* DECISION: Ensure offline sessions reconcile without punitive streak loss.
* DECISION: Define and communicate streak day boundaries and timezone behavior; timezone/DST changes must not unfairly break streaks.

#### Incident definition
* DECISION: An "incident" is any server-side issue that could prevent streak maintenance:
  - API downtime >5 minutes
  - Payment system outage
  - Sync failures affecting >1% of users
  - Audio CDN outage (RU-specific)

#### Automatic protection
* DECISION: During known incidents, all active streaks are "protected"
* DECISION: Protection means: if user attempted to practice but couldn't complete, streak is preserved
* DECISION: "Attempted" = any app_open or lesson_start event logged that day

#### Manual repair
* DECISION: After incident ends, affected users see banner for 72 hours:
  - "We had issues on [date]. Your streak is safe."
  - Or: "We had issues on [date]. Restore your streak?" (if it broke)
* DECISION: One-tap repair for eligible users
* DECISION: Repair is FREE (not paid)

#### Eligibility rules
* DECISION: User can repair if:
  - They had active streak before incident day
  - Incident window overlaps their local timezone day
  - They have evidence of attempt (app_open event that day)
  - Repair requested within 72 hours of incident end

#### Timezone handling
* DECISION: Streak day boundary is user's local timezone, not UTC
* DECISION: Timezone is captured from device on each session
* DECISION: DST transitions do NOT cause unfair streak breaks

### Reliability Pack (user-facing trust signals)
* DECISION: Surface reliability and sync state:
  * Audio download/cached status + audio failure messaging,
  * Offline saved indicator and storage management,
  * Sync status / last sync time,
  * Incident banner (“We’re down / BRB”) during outages,
  * “Streak protected today” messaging when protections apply.
* HYPOTHESIS: Visibility reduces streak-loss panic and rage-quits during incidents.

### Engagement design: keep the loop clean
* DECISION: XP is a private feedback/progress signal, not a competitive currency.
* DECISION: Avoid XP farming incentives:
  * do not ship public leaderboards in v1.3,
  * do not ship timed XP events/multipliers,
  * do not reward repeating identical content with meaningful XP.
* DECISION: Remove double-XP boosts and default-on leagues from core surfaces in v1.3.

#### Variable Rewards (Surprise Mechanics)

##### Unit completion rewards
* DECISION: Completing a unit (not just lesson) triggers surprise reward
* DECISION: Reward is randomized from pool:
  - Bonus XP (20-50)
  - Badge unlock
  - Streak freeze (rare, ~10% chance)
  - Cosmetic item (if cosmetics exist)
* HYPOTHESIS: Variable rewards increase dopamine response vs predictable rewards

##### Milestone surprises
* DECISION: Certain milestones have elevated celebration:
  - Day 1 streak: Small animation + "You started!"
  - Day 7 streak: Medium celebration + badge
  - Day 10 streak: Large celebration + free streak freeze + distinct badge
  - Day 30 streak: Major celebration + shareable card
  - Day 100 streak: Exceptional celebration
* DECISION: Celebration scale increases with milestone significance
* DECISION: Day 10 is the critical threshold - must feel special

##### Random encouragement
* DECISION: Occasionally (1 in 10 lessons) show unexpected encouragement mid-lesson
* DECISION: Examples: "You're on fire!", "3 in a row!", mascot animation
* DECISION: These are NOT tied to actual streaks - just random positive reinforcement

#### Mascot and Personality

##### Character design
* DECISION: Mascot identity is **english.dance** (dancing character) for v1.3.
* DECISION: App has a mascot character that appears throughout
* DECISION: Mascot has personality: encouraging, slightly playful, never condescending
* DECISION: Mascot appears:
  - On completion screens (celebrating)
  - On error screens (encouraging, not disappointed)
  - In tips/explanations (teaching)
  - In notifications (reminding)

##### Tone guidelines
* DECISION: Mascot never says "You failed" or "Wrong!"
* DECISION: Mascot says "Almost!" or "Not quite - try again!"
* DECISION: Mascot celebrates mistakes as learning: "Mistakes help you learn!"
* DECISION: Mascot uses first-person: "Let's try that again" not "Try again"

##### Russian localization
* DECISION: Mascot speaks Russian naturally (not translated English)
* DECISION: Mascot uses informal "ты" not formal "вы" (friendly peer, not authority)
* DECISION: Mascot humor matches Russian sensibility (can be slightly deadpan/ironic like Lily)

* DECISION: Reminders remain, but must be opt-in and goal-based (tied to the user’s chosen commitment).
* DECISION: Notification frequency and control rules:
  * default maximum **≤1 notification/day** (user-configurable down to 0),
  * always provide opt-out,
  * respect user-set quiet hours and OS Do Not Disturb.
* DECISION: Notification tone guidelines:
  * supportive, never shame,
  * “snooze for X days,”
  * allow weekly goals (e.g., 4 days/week) for anti-streak users.

### Success metrics and KPIs (v1.3)
These targets are used for go/no-go decisions and iteration priorities.
* Activation:
  * HYPOTHESIS: p90 time-to-first-micro-win ≤ 90 seconds.
  * HYPOTHESIS: ≥70% of new users complete the first session micro-win.
  * HYPOTHESIS: ≥60% set a goal; ≥50% start a streak or weekly goal tracking.
* Audio reliability:
  * DECISION: Track audio start success rate and time-to-first-audio on RU networks/operators; treat regressions as P0.
* Retention:
  * HYPOTHESIS: D1 ≥ 35%, D7 ≥ 15%, D30 ≥ 5% (overall).
* Spaced repetition:
  * HYPOTHESIS: ≥40% of DAUs complete the recommended daily review target.
  * DECISION: Monitor overdue rate and review debt growth; if overdue rate rises, reduce new-item recommendations.
* Reliability + streak integrity:
  * DECISION: Track “unfair streak breaks” attributable to outages/sync/timezone; target is as close to zero as possible.
  * DECISION: Track streak repairs (eligible vs successful) and incident banner time-to-display during outages.
* Offline:
  * DECISION: Track offline session sync success rate and conflict rate requiring user intervention.

## Roadmap and Future Plans

### v1.3 Core (must ship)
* Golden Path v1.3 acceptance criteria (course map → audio → streak/review → Max paywall → RU checkout).
* “Feel smart in 30–90 seconds” onboarding + commitment ladder (goal + streak in first session).
* Placement test / test-out (offered after the first micro-win).
* Audio Reliability Pack: RU-hosted audio delivery + first-session pre-cache + credible fallbacks.
* Streak with local-timezone semantics, outage-safe semantics + repairability, and day-10 free streak freeze.
* Spaced repetition engine with daily review queue.
* Credibility pack: course map (CEFR bands + visible depth), checkpoint tests + shareable artifact, authored explanations.
* Community-lite (common answers/mistakes + suggestions + issue reporting with status).
* RU→EN parity modalities: stories/dialogues + listening-first units.
* Offline mode (limited but meaningful) for free users.
* Reliability Pack (audio/offline/sync/incident messaging).
* Max monetization: AI feature surfaces + paywall on tap + RU web checkout (Mir/SBP) + entitlement sync.

### vNext / Backlog (explicitly not core for v1.3)
* Super tier (deferred).
* Optional leagues / competitive surfaces (off by default).
* XP boost events / double XP.
* Gem/store economy.
* Referral program.
* Human feedback/tutor add-ons (as a monetization expansion).

### Reprioritization rationale (v1.3)
* DECISION: Lead with the RU wedge: **audio works without VPN** (infra promise) to capture displaced Duolingo users.
* DECISION: Make Max the only paid tier because AI features are the “missing tier” RU users couldn’t access; keep Free unlimited/no ads to meet expectations.
* DECISION: Make SRS + review always available because it’s the retention engine under streaks; never block learning.
* DECISION: Treat offline + reliability + streak repair as trust features because outages/streak loss are rage-quit moments.
* DECISION: Add autonomy + Community-lite to preserve control/nuance without full forums and avoid “hard path” backlash.
* DECISION: Defer leagues/boosts/gems because they increase complexity and encourage XP farming (learning distortion) and backlash risk.

## Conclusion

v1.3 makes the wedge explicit: **Duolingo audio is broken in Russia; we work without VPN.** Audio reliability becomes an infrastructure promise backed by the Golden Path acceptance criteria. The paid tier is **Max** (AI learning tools RU users could not access), while Free remains unlimited/no-ads to match RU expectations. The retention engine remains SRS + always-available review with outage-safe, locally-timed streaks.

## Open Questions / Research Backlog

* UNKNOWN: Choose the exact RU payment provider + flow details (YooKassa vs CloudPayments, SBP UX, webhook semantics) and subscription model.
* UNKNOWN: 54‑FZ fiscal receipt obligations and which provider will handle fiscalization.
* UNKNOWN: Push notification delivery strategy in RU distribution reality (FCM availability vs alternatives) and fallback policy.
* UNKNOWN: Exact definition/handling of “personal data” in telemetry for 242‑FZ compliance (event schema classification, retention periods, access controls, exports, and deletion requests).
* UNKNOWN: Validate whether the minimum depth targets (lessons/stories/audio) are sufficient to pass RU “real course” credibility thresholds in early cohorts.
* UNKNOWN: Decide final limiter posture for RU launch (ship with limiter/hearts disabled by default vs conservative new-lesson rate limit) and define criteria/triggers for enabling/disabling.
