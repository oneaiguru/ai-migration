# Product Requirements Document: English Learning App for Russian Speakers

**Version:** v1.3.1

## Executive Summary

**North star (v1.3.1):** win RU market displacement by making **audio work without VPN** while delivering a Duolingo-like psychological loop:
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
* DECISION: **Max** is the only paid tier in v1.3.1 (AI features); **Super is out of scope** for v1.3.1.

**Core loop we must serve (v1.3.1):**
1) Open app → 2) 30–90s micro-win → 3) Instant feedback/praise → 4) Progress tick (“I’m learning”) → 5) Streak/goal commitment → 6) Daily Review queue (spaced repetition) → back to micro-win.

**Key changes vs v1.2:**
* DECISION: Ship and validate a **Golden Path v1.3.1** with RU constraints as acceptance criteria (see below).
* DECISION: Make **audio reliability** a first-class requirement: first-session audio is bundled/pre-cached; audio served from RU-friendly hosting; credible fallbacks on failure.
* DECISION: Monetization is explicit: **Free = unlimited learning, no ads, no hearts gating**; **Max = paid AI features** (paywall only on value-add taps: Roleplay / Speaking coach / Ask-AI deeper coaching); **Super deferred**.
* DECISION: Payments must work via **RU rails (Mir/SBP) via web checkout** for PWA + RuStore Android; **TWA must support SBP bank-app handoff + return**.
* DECISION: Max AI must work without VPN and respect **242-FZ data localization**; enforce a strict AI data boundary (see below).
* DECISION: Keep learning loop clean: no energy/hearts gating, no XP boosts/double-XP events, no gem/store economy, no default-on global leagues.

## Target Audience and Language Scope

**Primary audience:** Native Russian speakers learning English (RU→EN).
* DECISION: Launch with RU→EN only for v1.3.1.
* DECISION: Cover CEFR **A1–B1** in the first release track, with explicit RU-native pain-point tracks (see Content).

**Primary job-to-be-done:**
* “I want to feel real progress quickly, keep a streak, and trust this is a real course (not a toy).”

RU copy glossary lives in `projects/anglo/tasks/master-tasks-phase-3.md`.

**Credibility threshold (v1.3.1):**
* DECISION: The product must communicate “this is a real course” early via course map, explanations, and outcomes signaling (checkpoint tests + shareable artifact).

## Platform Strategy and Distribution

* DECISION: Platforms remain **PWA + Android (RuStore)** as primary, iOS secondary.
* DECISION: v1.3.1 must support **offline learning** as a core parity feature (at least “download next ~20 lessons” free).
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

## Golden Path v1.3.1 (Russia-first acceptance criteria)

This is the shipped user journey. Each step has explicit RU constraints and acceptance criteria.

### Step 1: Open app → see course structure
**RU constraint:** Works without VPN from RU networks.

Acceptance:
- Course map renders A1/A2/B1 sections with visible depth signals:
  - total units per section, total lessons per unit, and section locked/unlocked state.
- Story nodes and checkpoint nodes visible in the path (even if only 1 exists in MVP).
- Placement test entrypoint is visible (optional in MVP, but visible).
- First render p95 < 3s on typical RU mobile network.
- No third-party critical-path calls to domains likely to be blocked (app usable with only our domains).

### Step 2: Start lesson → hear audio, answer questions
**RU constraint:** Audio MUST work without VPN. This is the wedge.

Acceptance:
- In the first-session micro-win, at least one exercise includes audio:
  - user taps play → audio starts within 500ms (p95).
- First-session audio is bundled or pre-cached at app open (micro-win does not depend on network).
- For normal lessons:
  - if online: audio served from RU-friendly hosting (RU region or RU providers),
  - if offline: audio plays for cached lessons/packs.
- If audio fails to start: auto-retry once, then auto-downgrade to text-only/skip; lesson can be completed.
- A1 Unit 1 credibility minimum:
  - ≥5 lessons
  - 6–12 exercises per lesson
  - ≥1 listening exercise per lesson (or ≥1 listening per 2 lessons if constrained).

### Step 3: Complete lesson → see XP/streak update
**RU constraint:** No “pay to keep learning.”

Acceptance:
- Completion screen shows:
  - XP earned
  - accuracy
  - streak state (starts at 1 after first win)
  - daily goal progress tick
- “Perfect lesson” gets a visible celebration (no XP boost events required).
- Day 10 milestone celebration grants one free streak freeze (earned, not paywalled).

### Step 4: Close and reopen → progress still there
**RU constraint:** Works through RU network instability and offline.

Acceptance:
- Progress persists locally (IndexedDB/SQLite) and survives app restart:
  - completed lessons, XP totals, streak state, daily goal state.
- In airplane mode:
  - app opens
  - course map loads (cached)
  - user can replay cached lesson content (at least micro-win + downloaded pack).

### Step 5: Return next day → streak logic works + review available
**RU constraint:** Local timezone + outage-safe semantics; review never blocked.

Acceptance:
- Day boundary uses user local timezone (not UTC).
  - If timezone changes: use “home timezone” from first login unless user explicitly changes it.
- Home screen always shows:
  - Review button
  - Due count: “Review (N due)”
- Completing a review session:
  - counts toward daily goal
  - counts toward streak.
- Outage-safe streak:
  - If we declare an incident day: user sees incident banner + can repair streak for that day.
  - Offline completions later sync and credit the correct local day.

### Step 6: Hit paywall → understand what Max offers
**RU constraint:** Not “pay to continue.” It’s “unlock serious learner tools Russians couldn’t buy.”

Acceptance:
- Paywall triggers only on value-add surfaces, e.g.:
  - Roleplay / conversation practice
  - Speaking coach / pronunciation feedback
  - “Ask AI” deeper coaching
  - advanced analytics / progress insights (optional)
  - offline packs beyond free allowance (secondary, still value-add)
- Paywall never blocks:
  - next lesson
  - review
  - checkpoint tests.
- No paywall shown before first micro-win completion.
- Copy/tone:
  - framed as capability unlock, not punishment removal.
- “Why?” at moment of error is free (authored).
  Optional: limited AI explanation quota for Free, unlimited for Max.

### Step 7: Pay → Max unlocked via RU payment rails
**RU constraint:** Google Play billing is not the default; SBP/Mir must work.

Acceptance:
- Payment checkout supports:
  - Mir card payment
  - SBP (Fast Payments System).
- SBP flow is reliable:
  - user can open bank app and return to app successfully
  - entitlement unlocks within <10 seconds after confirmation (p95).
- User sees confirmation and can “Restore purchases / Sync entitlements” if callback fails.
- Cancellation & receipts:
  - user can access a “Manage subscription” page (web-based OK).
  - receipts/transaction IDs stored for support.

## Monetization Strategy and Tiers (v1.3.1)

**Principle (v1.3.1): value-add, not “pay to continue.”**
* DECISION: Free users must always be able to do something learning-positive (at minimum: review).
* DECISION: Paywall triggers only on **Max-only value-add** surfaces (Roleplay / Speaking coach / Ask-AI deeper coaching); it must never block the next lesson or review.
* DECISION: Avoid monetizing streak fear (no paid streak freezes as a primary monetization lever).
* DECISION: Avoid ad-gated learning or ad-based streak protection.
* DECISION: No Max pitch before the first micro-win.
* DECISION: No ads.

**Free tier (v1.3.1):**
* DECISION: Unlimited learning with no “wait to continue” mechanics.
* DECISION: Review is always available (no hard “you must stop” limiter).
* DECISION: No hearts/energy gating in RU launch; no rate-limiting of new lessons.
* DECISION: Core modalities (stories/listening) must exist in free tier at meaningful depth to avoid immediate “worse than Duolingo” comparison.
* DECISION: Offline: free users can download a limited pack (e.g., next ~20 lessons + required audio + rolling review buffer) with clear storage controls.

**Max (v1.3.1, paid):**
Max sells what Duolingo RU users could not access: AI learning tools.
* DECISION: Max unlocks AI features: Roleplay, Speaking coach, Ask-AI deeper coaching.
* DECISION: If AI explanations are offered, Free gets baseline “Why?” (authored) while Max may provide deeper AI coaching or unlimited AI quota.
* DECISION: Max may also include convenience expansions: larger offline packs, advanced practice modes, deeper diagnostics, and additional curated tracks.
* HYPOTHESIS: Max conversion improves when positioned as “serious learner toolkit” vs “remove punishment.”

**Out of scope (v1.3.1):**
* DECISION: Super tier is deferred to a future version.

**Removed from v1.3.1 monetization:**
* DECISION: No ads, no ad-based rewards, no ad-based streak freeze, no paid streak freezes.
* DECISION: No gem/store economy loop.
* DECISION: Do not gate basic “Why?” explanations behind Max.

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
  * choose “Review” vs “New,”
  * access stories/audio separately from the main path,
  * test out / re-place via placement test.
* DECISION: Do not ship a hard single-path experience with no choice.

### Core modalities (core in v1.3.1)
* DECISION: **Stories/Dialogues** with comprehension questions.
* DECISION: **Audio-first listening drills** (short “radio-style” sessions can be phased in after initial listening drills).
* DECISION: Speaking can be staged, but listening must ship early to meet “real course” expectations.
* DECISION: A1 Unit 1: at least **1 listening exercise per lesson**.

### “Explain / Why?” (authored)
* DECISION: Every error state must be eligible for a human-authored explanation path:
  * why the correct answer is correct,
  * why the user’s answer is wrong (common RU-native pitfalls),
  * a short rule/heuristic + 1–2 examples.
* DECISION: Do not gate baseline explanations behind AI features in v1.3.1 (Max AI is additive, not required for credibility).
* DECISION: “Ask AI” deeper coaching is a separate Max-only value-add and must not replace the free “Why?” path.

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
* DECISION: Do not ship open-ended public forums in v1.3.1; Community-lite is structured and moderation-friendly.

## Technical Architecture and Implementation

### Data localization and compliance (242‑FZ)
* DECISION: Store personal data in Russia; architecture and vendors must support RU-hosted databases and backups.
* DECISION: Audit data flows to ensure no accidental export of personal data outside RU.

### AI provider + data boundary (Max)
* DECISION: Max AI features must work without VPN from RU networks.
* DECISION: If using a third-party LLM outside RU:
  * do not send PII,
  * require explicit user consent,
  * store personal data in RU per 242‑FZ,
  * store only minimal AI logs in RU (or none outside RU).
* DECISION: If the AI provider is unavailable, degrade gracefully (no blocked core learning).

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
* DECISION: SBP requires bank-app handoff + return; TWA must preserve the return path.
* DECISION: Entitlements unlock within <10 seconds after confirmation (p95) and sync across devices.
* DECISION: Purchase confirmation includes receipt/confirmation screen, transaction ID, and persistent entitlement state for offline access.
* DECISION: Provide “Restore purchases / Sync entitlements” and a Manage Subscription page (web-based OK).

### Community-lite pipelines (review + transparency)
* DECISION: Implement backend workflows for:
  * alternative translation suggestions (queue → review → publish),
  * issue reports with status changes and changelog linkage.
* DECISION: Provide minimal internal/admin tooling for triage and status updates.

### Learning engine: Spaced Repetition Engine (core)
* DECISION: Define an SRS “item” as a stable, reviewable memory unit that can appear in multiple exercise formats; v1.3.1 item types include:
  * vocabulary/phrases,
  * grammar/syntax patterns (including RU-native pitfalls),
  * listening comprehension prompts,
  * story comprehension checkpoints.
* DECISION: Implement a per-item memory model (HLR-like strength/half-life) and generate a **daily review queue**.
* DECISION: Review queue must be integrated into the home loop and be always accessible.
* DECISION: The system must record item outcomes and schedule future reviews deterministically and explainably.
* DECISION: Queue rules:
  * primary review happens via a dedicated "Повторение — N заданий" session; lessons are new-only by default,
  * prioritize overdue + low-strength items first,
  * review is never capped; show a recommended daily target, but allow more.
* DECISION: New-vs-review mixing:
  * if the user is behind on reviews, the app should recommend review-first (but not block new learning).
* DECISION: Daily caps (soft, not blocking):
  * recommend a maximum number of new items introduced per day (default: ~20) to prevent unmanageable review debt; warn when exceeding it.
* DECISION: User visibility/control:
  * show today’s due count + estimated time,
  * show strength/“needs review” indicators,
  * allow “review now” and short “snooze” on specific items.
* Metrics (v1.3.1):
  * HYPOTHESIS: Review completion rate correlates with 7/30-day retention lift.
  * DECISION: Track: daily review completions, review queue size, overdue rate, recall accuracy, time-to-first-micro-win, and reactivation lift attributable to review.

### Review Mode: Explicit + Safety Net (DECISION)

Primary: Separate "Повторение — N заданий" button on home screen (Duolingo parity)
- Button shows due count
- Tapping opens a dedicated review session
- Completion counts toward серия/day goal

Secondary: Auto-interleaving only when review debt is high
- If user has >20 overdue items AND hasn't done review in 3 days
- Inject up to 30% review into next lesson
- No "Review" label in UI (seamless)
- Otherwise: lessons are 100% new content

### Streak system: outage-safe + repairable (core)
* DECISION: Streak starts at 1 after the first completed lesson (not after account creation).
* DECISION: Streak day boundary uses the user’s local timezone (not UTC).
* DECISION: Completing review counts toward the streak/day goal.
* DECISION: Day 10 milestone grants a free streak freeze (earned, not paywalled).
* DECISION: Known outage/sync failure days must not break streaks.
* DECISION: Provide a streak repair mechanism (e.g., automatic grace on incident days and/or user-initiated make-up within a window).
* DECISION: Ensure offline sessions reconcile without punitive streak loss.
* DECISION: Define and communicate streak day boundaries and timezone behavior; timezone/DST changes must not unfairly break streaks.

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
  * do not ship public leaderboards in v1.3.1,
  * do not ship timed XP events/multipliers,
  * do not reward repeating identical content with meaningful XP.
* DECISION: Remove double-XP boosts and default-on leagues from core surfaces in v1.3.1.
* DECISION: Reminders remain, but must be opt-in and goal-based (tied to the user’s chosen commitment).
* DECISION: Notification frequency and control rules:
  * default maximum **≤1 notification/day** (user-configurable down to 0),
  * always provide opt-out,
  * respect user-set quiet hours and OS Do Not Disturb.
* DECISION: Notification tone guidelines:
  * supportive, never shame,
  * “snooze for X days,”
  * allow weekly goals (e.g., 4 days/week) for anti-streak users.

### Success metrics and KPIs (v1.3.1)
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

### v1.3.1 Core (must ship)
* Golden Path v1.3.1 acceptance criteria (course map → audio → streak/review → Max paywall → RU checkout).
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
* Max monetization: Roleplay / Speaking coach / Ask-AI deeper coaching + paywall on tap + RU web checkout (Mir/SBP) + entitlement sync.

### vNext / Backlog (explicitly not core for v1.3.1)
* Super tier (deferred).
* Optional leagues / competitive surfaces (off by default).
* XP boost events / double XP.
* Gem/store economy.
* Referral program.
* Human feedback/tutor add-ons (as a monetization expansion).

### Reprioritization rationale (v1.3.1)
* DECISION: Lead with the RU wedge: **audio works without VPN** (infra promise) to capture displaced Duolingo users.
* DECISION: Make Max the only paid tier because AI features are the “missing tier” RU users couldn’t access; keep Free unlimited/no ads to meet expectations.
* DECISION: Make SRS + review always available because it’s the retention engine under streaks; never block learning.
* DECISION: Treat offline + reliability + streak repair as trust features because outages/streak loss are rage-quit moments.
* DECISION: Add autonomy + Community-lite to preserve control/nuance without full forums and avoid “hard path” backlash.
* DECISION: Defer leagues/boosts/gems because they increase complexity and encourage XP farming (learning distortion) and backlash risk.

## Conclusion

v1.3.1 makes the wedge explicit: **Duolingo audio is broken in Russia; we work without VPN.** Audio reliability becomes an infrastructure promise backed by the Golden Path acceptance criteria. The paid tier is **Max** (Roleplay / Speaking coach / Ask-AI deeper coaching), while Free remains unlimited/no-ads/no-hearts to match RU expectations. The retention engine remains SRS + always-available review with outage-safe, locally-timed streaks.

## Open Questions / Research Backlog

* UNKNOWN: Choose the exact RU payment provider + flow details (YooKassa vs CloudPayments, SBP UX, webhook semantics) and subscription model.
* UNKNOWN: Select a RU-compatible AI provider and hosting approach that meets no-VPN availability and 242‑FZ data boundary requirements.
* UNKNOWN: 54‑FZ fiscal receipt obligations and which provider will handle fiscalization.
* UNKNOWN: Push notification delivery strategy in RU distribution reality (FCM availability vs alternatives) and fallback policy.
* UNKNOWN: Exact definition/handling of “personal data” in telemetry for 242‑FZ compliance (event schema classification, retention periods, access controls, exports, and deletion requests).
* UNKNOWN: Validate whether the minimum depth targets (lessons/stories/audio) are sufficient to pass RU “real course” credibility thresholds in early cohorts.
* UNKNOWN: If/when to introduce optional mistake-stakes (hearts) post v1.3.1; requires RU user research and must not gate core learning.
