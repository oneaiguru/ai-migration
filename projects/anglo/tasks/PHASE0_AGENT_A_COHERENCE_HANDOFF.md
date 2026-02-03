# PHASE 0: COHERENCE — Agent A (Onboarding + Lessons + Gamification + Payments)

This doc is the handoff for **Agent A’s half** of `projects/anglo/apps/pwa/tests/features/**`:
- `onboarding/`
- `lessons/`
- `gamification/`
- `payments/`

Goal of Phase 0: **feature files and task docs tell the same story** (even if that story is “MVP prototype”), with explicit deferrals.

---

## 0) Current Status (What We Already Solved)

### Tags now exist everywhere (Agent A scope)
- File-level tier tags are the default; scenario-level tags are used only when a file mixes tiers.
- Additional quality tag used: `@stub` = “implementation exists but is minimal/placeholder”.

### Anonymous-first onboarding is core (v1.3.1)
To match the PRD (no signup wall before the micro-win), the anonymous-first arc is core:
- `projects/anglo/apps/pwa/tests/features/onboarding/anonymous-start.feature`: core flow with one `@retention` reminder scenario
- `projects/anglo/apps/pwa/tests/features/onboarding/account-upgrade.feature`: core merge flow (verification deferred)
- `projects/anglo/apps/pwa/tests/features/onboarding/account-creation.feature`: core account creation; verification remains `@v2`

### Payments rails are core for v1.3.1
Mir/SBP checkout flows + Max upgrade are core; entitlement scaffolding remains required:
- `projects/anglo/apps/pwa/tests/features/payments/mir-payment.feature`: `@core`
- `projects/anglo/apps/pwa/tests/features/payments/sbp-payment.feature`: `@core`
- `projects/anglo/apps/pwa/tests/features/payments/max-upgrade.feature`: `@core`
- `projects/anglo/apps/pwa/tests/features/payments/lifetime-purchase.feature`: `@v2`
- `projects/anglo/apps/pwa/tests/features/payments/payment-refunds.feature`: `@v2`

---

## 1) Credibility Must-Haves (5–7 Load-Bearing “This Is Real” Capabilities)

These are the minimum for a user to believe “this is a Duolingo replacement” vs “a demo”.

1) **Account works end-to-end**: register → login → come back later still logged in  
   - `projects/anglo/apps/pwa/tests/features/onboarding/account-creation.feature` (core scenarios are `@core @stub`)  
   - `projects/anglo/apps/pwa/tests/features/onboarding/login-signin.feature` (core scenarios are `@core @stub`)

2) **Course feels like a course**: visible map with >1 lesson and a “next thing to do”  
   - `projects/anglo/apps/pwa/tests/features/lessons/start-lesson.feature` (core scenarios are `@core @stub`)

3) **Start lesson**: user can enter a lesson and see progress within it  
   - `projects/anglo/apps/pwa/tests/features/lessons/start-lesson.feature` (core start scenario is `@core @stub`)

4) **At least 2 exercise types work** with the Duolingo loop: answer → Check → feedback → Continue  
   - `projects/anglo/apps/pwa/tests/features/lessons/exercise-translate-tap.feature` (`@core @stub` scenarios)  
   - `projects/anglo/apps/pwa/tests/features/lessons/exercise-translate-type.feature` (`@core @stub` scenarios)

5) **Feedback is consistent and immediate** (correct/incorrect, show correct answer)  
   - `projects/anglo/apps/pwa/tests/features/lessons/lesson-grading.feature` (core scenarios are `@core @stub`)

6) **Lesson completion changes reality**: lesson becomes complete, next unlocks, XP/streak update  
   - `projects/anglo/apps/pwa/tests/features/lessons/complete-lesson.feature` (`@core` scenarios)

7) **XP + streak are real**: visible and persisted (not just “shown once”)  
   - `projects/anglo/apps/pwa/tests/features/gamification/xp-earning.feature` (`@core @stub` scenarios)  
   - `projects/anglo/apps/pwa/tests/features/gamification/streak-tracking.feature` (`@core @stub` scenarios)

---

## 2) Tiering (Core / Retention / v2) — v1.3.1

### Core loop (credibility load-bearing)
- `projects/anglo/apps/pwa/tests/features/onboarding/anonymous-start.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/account-creation.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/login-signin.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/account-upgrade.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/placement-test.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/tutorial-first-launch.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/start-lesson.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-select-image.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-translate-tap.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-translate-type.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-match-pairs.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-fill-blank.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-listen.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/lesson-grading.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/complete-lesson.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/story-dialogue.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/xp-earning.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/streak-tracking.feature`
- `projects/anglo/apps/pwa/tests/features/payments/mir-payment.feature`
- `projects/anglo/apps/pwa/tests/features/payments/sbp-payment.feature`
- `projects/anglo/apps/pwa/tests/features/payments/max-upgrade.feature`

### Retention boosters (v1.1 targets, not credibility load-bearing)
- `projects/anglo/apps/pwa/tests/features/onboarding/password-reset.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-speak.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/achievements.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/daily-challenges.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/streak-freeze.feature`

### Explicit v2 (nice-to-have / heavy dependencies)
- `projects/anglo/apps/pwa/tests/features/onboarding/email-verification.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/leaderboard.feature`
- `projects/anglo/apps/pwa/tests/features/payments/lifetime-purchase.feature`
- `projects/anglo/apps/pwa/tests/features/payments/payment-refunds.feature`

---

## 3) Phase 0 Decisions by Gap/Mismatch (Agent A Half Only)

For each gap/mismatch from Agent A review: **one decision**:
- **`@v2`**: explicitly deferred
- **`@stub`**: exists but minimal (acceptable for now)
- **REQUIRED FOR V1**: load-bearing; needs task(s)

### A) Onboarding

#### 1) `onboarding/anonymous-start.feature` — anonymous flow
- Decision: **`@core`** (with one `@retention` reminder scenario)
- Why: v1.3.1 requires no signup wall before the micro-win; anonymous progress must be possible until account creation.
- Current tags: feature is `@core`; “Remind me later” is `@retention`.

#### 2) `onboarding/placement-test.feature` — real placement quiz not implemented
- Decision: **`@core @stub`** for the full placement flow
- Why: placement is a core credibility signal in v1.3.1; it must work end-to-end even if minimal.
- Current tags (snippet):
  - `@core @stub Scenario: Placement test option is offered`
  - `@core @stub Scenario: User completes placement test`
  - `@core @stub Scenario: User can skip placement test`

#### 3) `onboarding/account-creation.feature` — spec mismatch (confirm password, terms, >=8 chars, verification)
- Decision: **mixed**
  - **`@stub` (core)** for the basic register flow (so V1 can ship with “create account”)
  - **`@core`** for consent/terms checkbox (compliance)
  - **`@v2`** for password strength + email verification requirements
- Current tags (snippet):
  - `@core @stub Scenario: User sees account creation form`
  - `@core @stub Scenario: Successful account creation`
  - `@core @stub Scenario: Email validation on account creation`
  - `@v2 Scenario: Password strength validation`
  - `@core @stub Scenario: Passwords must match`
  - `@core @stub Scenario: Email already registered`
  - `@core Scenario: User must accept terms`
  - `@v2 Scenario: Email verification`

#### 4) `onboarding/account-upgrade.feature` — merge local progress into account
- Decision: **`@core`**
- Why: anonymous-first requires a clean merge into a created account (verification deferred).
- Current tags: all scenarios are `@core`.

#### 5) `onboarding/login-signin.feature` — session length, lockout, social login, etc.
- Decision: **mixed**
  - **`@stub` (core)**: basic login + “I reopen and I’m still logged in”
  - **`@v2`**: lockout, remember-me controls, session-timeout rules, social login, multi-device management
  - **`@stub` (retention)**: logout exists but minimal
- Current tags (snippet):
  - `@core @stub Scenario: Login screen displays`
  - `@core @stub Scenario: Successful login`
  - `@core @stub Scenario: Invalid credentials`
  - `@core @stub Scenario: Session persistence`
  - `@retention @stub Scenario: Logout`
  - `@v2 Scenario: Account locked after failed attempts`
  - `@v2 Scenario: Remember me checkbox`
  - `@v2 Scenario: Session timeout`

#### 6) `onboarding/password-reset.feature` — “token returned, no email, no expiry, etc.”
- Decision: **`@stub` (retention)**
- Why: important for real product, but not required for “first credibility loop”.
- Current tags: all scenarios `@retention @stub`.

#### 7) `onboarding/email-verification.feature` — resend/rate-limit/expiry/gating
- Decision: **`@v2`**
- Why: requires email infrastructure and product policy decisions; not credibility load-bearing.
- Current tags: all scenarios `@v2`.

#### 8) `onboarding/tutorial-first-launch.feature` — overlay/skip/resume/settings entry
- Decision: **`@core`** (with one `@retention` journey-depth scenario)
- Why: v1.3.1 requires the goal → micro-win → streak → reminder ladder.
- Current tags: feature is `@core`; “Show the journey so the course feels real” is `@retention`.

---

### B) Lessons

#### 9) `lessons/start-lesson.feature` — course structure, unlock logic, and “feels real”
- Decision:
  - **`@core`** for one-tap start + short intro lesson
  - **`@retention`** for mid-lesson resume
  - **REQUIRED FOR V1**: fast path into the next lesson without paywalls
- Current tags (snippet):
  - `Scenario: Continue button starts the next path lesson`
  - `Scenario: Intro lesson is intentionally short`
  - `@retention Scenario: Learner can resume a lesson after interruption`

#### 10) `lessons/exercise-translate-tap.feature` — placeholder vs real “tap-to-build”
- Decision:
  - **`@stub` (core)** for the answer→check→feedback→continue loop
  - **`@v2`** for undo/hints/punctuation and hearts-loss warnings
  - **`@retention`** for hearts depletion recovery (non-blocking, review CTA)
  - **REQUIRED FOR V1**: make the core “tap words → check” loop actually work
- Current tags (snippet):
  - `@core @stub Scenario: Translate tap exercise presents correctly`
  - `@core @stub Scenario: User taps words in order`
  - `@core @stub Scenario: User submits correct answer`
  - `@v2 Scenario: User can undo taps`
  - `@v2 Scenario: Free user loses heart on wrong answer`
  - `@retention Scenario: If a learner runs out of hearts, they can recover via review`

#### 11) `lessons/exercise-translate-type.feature` — placeholder vs real type-check
- Decision:
  - **`@stub` (core)** for basic input validation (trim/case-insensitive) + feedback screens
  - **`@v2`** for fuzzy matching, synonyms, capitalization, hearts-loss limits
  - **REQUIRED FOR V1**: make the core “type → check” loop actually work
- Current tags (snippet):
  - `@core @stub Scenario: Translate type exercise structure`
  - `@core @stub Scenario: Extra spaces are trimmed`
  - `@core @stub Scenario: Incorrect answer feedback`
  - `@v2 Scenario: Fuzzy matching tolerates typos`
  - `@v2 Scenario: Synonym acceptance`

#### 12) `lessons/exercise-listen.feature`, `exercise-match-pairs.feature`, `exercise-fill-blank.feature`, `exercise-select-image.feature`
- Decision: **`@stub` (core)**
- Why: v1.3.1 requires audio and the micro-win sequence; these exercise types must exist even if minimal.
- Current tags: feature headers are `@core`, with most scenarios still `@retention @stub`.

#### 13) `lessons/lesson-grading.feature` — feedback depth
- Decision:
  - **`@stub` (core)**: immediate correct/incorrect feedback + consistent pattern
  - **`@v2`**: deep grammar explanations, spaced repetition tracking, hearts warnings, etc.
- Current tags (snippet):
  - `@core @stub Scenario: Immediate feedback on correct answer`
  - `@core @stub Scenario: Immediate feedback on incorrect answer`
  - `@core @stub Scenario: Consistency across exercise types`
  - `@v2 Scenario: Explanation of grammar mistake`
  - `@v2 Scenario: Learning path feedback (spaced repetition)`

#### 14) `lessons/complete-lesson.feature` — completion currently “XP only” (not reality-changing)
- Decision:
  - **`@stub` (core)**: completion screen exists but minimal
  - **`@v2`**: hearts bonuses, ratings, unit completion ceremonies, review modes
  - **REQUIRED FOR V1**:
    - mark lesson complete in course overview
    - unlock next lesson
    - persist lesson completion + XP + streak to backend
- Current tags (snippet):
  - `@core @stub Scenario: Lesson completion screen displays`
  - `@core Scenario: Lesson marks as complete in course overview`
  - `@core Scenario: Lesson completion unlocks next`
  - `@core Scenario: Lesson completion data is saved`
  - `@v2 Scenario: Difficulty star rating`

#### 15) `lessons/exercise-speak.feature`
- Decision: **`@retention`**
- Why: speaking depth is valuable but not required for the core loop; keep skippable.

---

### C) Gamification

#### 16) `gamification/xp-earning.feature` — XP exists but not truly “account-real”
- Decision:
  - **`@stub` (core)**: XP is awarded and visible
  - **`@v2`**: XP history, XP for non-lesson activities, crash guarantees, multipliers
- REQUIRED FOR V1: XP must persist to the user account and be shown in at least one stable place (home/profile).
- Current tags (snippet):
  - `@core @stub Scenario: XP awarded for correct answer`
  - `@core @stub Scenario: Lesson completion XP`
  - `@core @stub Scenario: XP is displayed consistently`
  - `@v2 Scenario: XP history and log`

#### 17) `gamification/streak-tracking.feature` — streak logic exists but needs product-level “truth”
- Decision:
  - **`@stub` (core)**: streak increments/breaks and is visible
  - **`@v2`**: notifications, Max freeze interactions, hearts-related streak breaks, etc.
  - **Retention**: Day 10 milestone + “streak restored on login” remain `@retention`
- REQUIRED FOR V1: streak should update on lesson completion and be persisted.
- Current tags (snippet):
  - `@core @stub Scenario: Streak extends on first lesson`
  - `@core @stub Scenario: Streak breaks if no activity in 24 hours`
  - `@core @stub Scenario: Streak visible prominently`
  - `@retention Scenario: Streak not lost on account/device issues`
  - `@v2 Scenario: Notifications remind of streak`

#### 18) `gamification/streak-freeze.feature`
- Decision: **`@retention`**
- Why: churn prevention add-on; not required for the core loop.

#### 19) `gamification/leaderboard.feature`
- Decision: **`@v2`**
- Why: competition is optional and can distort learning; ship later with guardrails.

#### 20) `gamification/achievements.feature`
- Decision: **`@stub` (retention)** for 2 basic achievements; rest `@v2`.
- Current tags (snippet):
  - `@retention @stub Scenario: First lesson achievement`
  - `@retention @stub Scenario: Perfect lesson achievement`

#### 21) `gamification/daily-challenges.feature`
- Decision: **`@stub` (retention)** for display/complete/miss; notification remains `@v2`.
- Current tags (snippet):
  - `@retention @stub Scenario: Daily challenge display`
  - `@retention @stub Scenario: Completing a challenge`
  - `@v2 Scenario: Daily challenge notification`

---

### D) Payments

#### 22) `payments/*` — Mir/SBP/lifetime/refunds + Max upgrade
- Decision: **mixed**
  - **`@core`** for Mir/SBP rails + Max upgrade (v1.3.1)
  - **`@v2`** for lifetime + refunds
- Current tags: Mir/SBP/Max are `@core`; lifetime/refunds remain `@v2`.

---

## 4) What Blocks V1 Credibility (Agent A Half)

These are the “make or break” gaps for the **learn → reward → progress feels real** loop.

1) **Progress persistence is missing / not authoritative**
   - Lesson completion must persist (server-side when logged in; local persistence for anonymous).
   - XP and streak must persist and be visible.

2) **Course map is too “sample”**
   - Needs multiple lessons and a visible locked/unlocked progression.

3) **Exercises are placeholders (core interaction quality)**
   - Translate tap/type must feel polished: clear prompt, answer building/typing, Check button state, feedback panel, Continue.

4) **Completion does not change the course**
   - Must mark completed, unlock next, reflect progress on overview.

5) **Auth is “present” but not product-real**
   - Must support: register, login, session persistence (already tagged `@core @stub`).
   - Everything else (email verification, password reset, lockout) can wait.

---

## 5) Task Additions Needed (Agent A Half) — To Make V1 Credible

These additions are now mapped into master task docs:
- Phase 3: `AGENT_14B_UI_AUTH_INTEGRATION.md`, `AGENT_16B_UI_CORE_LOOP_PERSISTENCE.md`
- Phase 4: updated `AGENT_21_API_LESSON_PROGRESS.md` and `AGENT_22_API_GAMIFICATION_SOCIAL.md`

These are “add to tasks” items required to satisfy the load-bearing scenarios above.

### V1-A1: Persist user learning progress (server-authoritative)
**Why:** Without persistence, users will not believe progress is real.

Acceptance criteria:
- When a logged-in user completes a lesson, the server records completion and updated totals.
- After refresh/reopen/login, course overview shows the same completed lessons + unlocked next lesson.
- XP total and streak are stable after refresh/reopen.

Suggested implementation outline:
- Backend: add a persistent `user_progress` model (completed lessons, unlocked lessons, XP total, streak/current/best, last-activity date).
- API: `GET /me/progress` and `POST /me/progress/lesson-complete` (or equivalent) called on lesson completion.
- Frontend: hydrate progress store on login/app start; update after completion.

### V1-A2: Make course overview feel like a course (not a sample)
**Why:** Credibility needs visible structure + next steps.

Acceptance criteria:
- Course overview shows at least **1 unit with multiple lessons** (e.g., 5 lessons), with locked states beyond current progress.
- Completing lesson 1 unlocks lesson 2 (and UI reflects this immediately).

### V1-A3: Translate Tap core loop is functional (not placeholder)
Acceptance criteria:
- Word bank selectable; tapped words appear in answer area in order tapped.
- “Check” enabled only when there is an answer.
- Correct answer → success feedback → Continue/auto-advance.
- Incorrect answer → shows correct answer (minimum) → Continue.

### V1-A4: Translate Type core loop is functional (not placeholder)
Acceptance criteria:
- Input supports trim + case-insensitivity.
- Correct/incorrect feedback uses the same feedback UX as tap.

### V1-A5: Lesson completion changes reality
Acceptance criteria:
- “Lesson complete” screen happens at end.
- After “Continue”, overview shows lesson completed and next unlocked.
- XP and streak update (at least on lesson completion).

### V1-A6: Streak is real and visible
Acceptance criteria:
- Streak increments on “first lesson completed today”.
- Streak breaks after >24h no completion (or a defined day-boundary rule).
- Streak is visible on home/profile.

### V1-A7: XP is real and visible
Acceptance criteria:
- XP awarded on correct answers and/or on lesson completion.
- Total XP visible on at least one screen (profile/home).
- XP persists across refresh/reopen.

---

## 6) Notes / Product Intent (So Tasks + Features Stay Coherent)

### Explicitly NOT V1 (by tag)
- Email verification flows (`@v2`)
- Lifetime purchase + refunds (`@v2`)
- Leaderboards (`@v2`)
- Hearts/ads-based gating across lesson flows (out of scope; hearts must remain non-blocking and disabled for RU by default)

### V1.1 candidates (retention boosters)
- Password reset (`@retention @stub`)
- Speaking exercises (`@retention`)
- Simple achievements, daily challenges, streak-freeze (`@retention`)

---

## 7) Phase 1 (Research) — Not Done Yet (Requested Next)

You asked for deep research on:
1) What makes Duolingo’s core loop work psychologically?
2) What do users of failed Duolingo alternatives complain about most?

Recommended deliverable format:
- 1-page “Core Loop Psychology” brief: triggers, variable rewards, streak loss aversion, friction placement, confidence calibration, habit formation.
- 1-page “Failure Modes” brief: content quality, pacing, boring feedback, lack of progression, too much friction (hearts/paywalls), bugs/persistence, lack of trust.
- 1 prioritized list of “must copy” mechanics for V1 (only those that increase credibility *without* heavy infra).

---

## 8) Files Changed (Agent A Half)

Onboarding:
- `projects/anglo/apps/pwa/tests/features/onboarding/anonymous-start.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/account-upgrade.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/placement-test.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/account-creation.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/login-signin.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/password-reset.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/email-verification.feature`
- `projects/anglo/apps/pwa/tests/features/onboarding/tutorial-first-launch.feature`

Lessons:
- `projects/anglo/apps/pwa/tests/features/lessons/start-lesson.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-translate-tap.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-translate-type.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-listen.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-match-pairs.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-fill-blank.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/exercise-select-image.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/lesson-grading.feature`
- `projects/anglo/apps/pwa/tests/features/lessons/complete-lesson.feature`

Gamification:
- `projects/anglo/apps/pwa/tests/features/gamification/xp-earning.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/streak-tracking.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/streak-freeze.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/leaderboard.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/achievements.feature`
- `projects/anglo/apps/pwa/tests/features/gamification/daily-challenges.feature`

Payments:
- `projects/anglo/apps/pwa/tests/features/payments/max-upgrade.feature`
