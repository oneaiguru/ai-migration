# MASTER TASKS: PHASE 3 — UI + OFFLINE (v1.3)
Updated: 2026-01-05

Phase 3 goal: implement the **enhanced v1.2 specs** in the UI + offline layer so the product passes the **Golden Path** and preserves Duolingo’s psychological effects:

- **Feel smart fast** (30–90s micro‑win onboarding)
- **Loss aversion streak** (local‑timezone streak day + outage/offline safe)
- **Spaced repetition habit** (Review always available + daily due queue)
- **“Real course” credibility** (CEFR sections, visible depth, audio, stories, checkpoints)

This revision explicitly addresses gaps found in Phase 4 Golden Path analysis:
- Missing CEFR sections + depth signals
- Missing Story + Checkpoint nodes
- Missing audio in sample content flows
- Missing spaced repetition UI and API wiring
- Missing onboarding commitment ladder + timing test
- Missing “Why?” + “Report accepted answer” trust affordances
- Missing outage/incident streak repair UI flow
- Missing Day‑10 milestone celebration + reward
- Missing Max benefits explanation page (purchase remains @v2)

---

# RU Copy Glossary (Canonical)

Use these Russian terms consistently in user-facing copy:
- Streak: "серия"
- Streak freeze: "защита серии"
- Restore streak: "восстановить серию"
- Streak day: "дней подряд"
- Review CTA: "Повторение — N заданий"

---

# PSYCHOLOGICAL LOOP SPECIFICATIONS (v1.3.1)

These specifications define the moment-to-moment UX that drives retention.
All agents MUST implement these exactly.

## Micro-Loop: Answer → Feedback → Continue

On correct answer:
- Green flash / checkmark within 200ms
- "+10 XP" micro-animation (doesn't need to persist)
- Progress bar segment fills
- Auto-advance to next exercise after 1.2s (or tap to continue)
- Optional: subtle success sound (user-configurable)

On incorrect answer:
- Red/orange indicator within 200ms
- Show correct answer immediately
- "Почему?" link appears (taps to explanation)
- "Продолжить" button (user controls pace after mistake)
- Do NOT auto-advance after mistake
- No shame or guilt copy; use neutral tone

## Commitment Ladder: Goal → Micro-Win → Streak → Reminder

Trigger: Immediately after micro-win completion screen appears
Location: Modal overlay on completion screen (not a separate route)
Copy (Russian):
  - Header: "Напоминание о занятиях"
  - Body: "Хотите ежедневное напоминание, чтобы не потерять свою серию?"
  - Primary CTA: "Разрешить" (green button; triggers OS/browser prompt)
  - Secondary: "Не сейчас" (dismisses, does not ask again for 7 days)

If user grants permission:
  - Fire OS/browser notification permission request only after tapping "Разрешить"
  - If OS grants: show "Отлично! Мы напомним" toast + store preference
  - If OS denies: show "Вы можете включить позже в настройках" toast + store denial timestamp

If user declines:
  - No penalty
  - Dismiss modal
  - Do NOT show prompt again for 7 days
  - Store decline timestamp

## Fail-Safe: Never Let User Feel Stupid

- If user fails 2 consecutive exercises:
  - Next exercise MUST be difficulty 1 OR a review of already-mastered item
  - Show encouraging message: "Давай попробуем то, что ты уже знаешь"
- If user fails 3 consecutive: force review mode for remainder of session

## Source of truth

1) **Enhanced feature bundle** (Phase 2 output):
- `projects/anglo/FEATURE_TIERING_MATRIX.md`
- `projects/anglo/PHASE2_CHANGELOG.md`
- `projects/anglo/apps/pwa/tests/features/**`

2) **Research context** (why these are load‑bearing):
- `01-05-2_Duolingos_Psychological_Loops_and_User_Engagement_Deep.md`
- `01-05-4_v12_Psychological_Loop_Implementation_Review.md`

3) **RU constraints**
- Payments use RU web checkout; provider wiring may be `# FUTURE` (mock webhooks ok)
- 242‑FZ consent flows must exist for account creation
- No Duolingo copying (clean room)

---

## Non‑negotiable product rules (v1.2)

**Must not exist in Phase 3 UI:**
- ❌ Energy system / timers / “wait to continue”
- ❌ Ads, ad‑gated streak protection
- ❌ XP boosts / double XP events
- ❌ In‑app currency store loop
- ❌ Default‑on global leaderboards/leagues

**Must exist in Phase 3 UI:**
- ✅ Review always available (no hearts/energy gating)
- ✅ Audio works end‑to‑end (listening exercise + story line audio)
- ✅ Course map shows CEFR sections + visible depth
- ✅ Stories and checkpoints visible as nodes
- ✅ Streak day uses learner’s local timezone (not UTC)
- ✅ Offline completion credits the correct day and does not break streak
- ✅ Incident banner + streak repair flow exists (backend in Phase 4)

---

## Mascot assumption (v1.3)

- Mascot is **english.dance** (dancing character) and should appear on completion, error, tips/explanations, and reminder surfaces.
- Tone: encouraging, playful, never condescending; use informal "ты" in RU copy (not formal "вы").

---

## One‑time setup: feature files + tag fixes

### Copy enhanced feature files into UI BDD tests
```bash
mkdir -p projects/anglo/apps/pwa/tests/features
# Feature files already live in-repo at `projects/anglo/apps/pwa/tests/features/**`.
```

### Apply required tag fixes (scenario tags vs matrix)
Apply `TAG_FIXES.md` to the copied `.feature` files (tag‑only edits).

### Recommended gating while building core
```bash
pnpm -C projects/anglo/apps/pwa test:bdd -- --tags "@core and not @v2"
```

---

# Run order (recommended)

AGENT_05 → AGENT_14 → AGENT_14C → AGENT_16B → AGENT_15 → AGENT_16 → AGENT_14B → AGENT_17 → AGENT_18

Rationale: shell + onboarding first, then course map depth, then learning screens, then review, then upgrade/auth, then settings, then offline.

---

# ============================================================
# AGENT_05 — APP SHELL, ROUTING, GLOBAL STATUS
# ============================================================

## Goal
Make the app capable of expressing the Golden Path:
- Onboarding routes (goal → micro‑win → completion → reminders)
- Course map with CEFR sections + nodes (lesson/story/checkpoint)
- Review hub route
- Global offline + sync status + incident banner

## Tasks (@core)

### 05.1 Routes (add/verify)
Add routes (or ensure they exist):
- `/` (entry gate; routes to onboarding or course map)
- `/onboarding/goal`
- `/onboarding/micro-win` (or `/lesson/onboarding_micro_1`)
- `/onboarding/complete`
- `/onboarding/reminders`
- `/course` (course map)
- `/lesson/:lessonId`
- `/review`
- `/story/:storyId`
- `/checkpoint/:checkpointId`
- `/placement-test`
- `/max` (benefits info page)
- `/billing/return` (post-checkout status)

Mark these routes as `# FUTURE` (keep code path but not in primary nav):
- `/leaderboard` (global leagues)
- `/friends` (friend leaderboard)

### 05.2 First‑launch gate
Implement a simple gate in `/`:
- If `hasSeenOnboarding === false` → route to `/onboarding/goal`
- Else → route to `/course`

Persist `hasSeenOnboarding` in **IndexedDB** (not memory), so reload doesn’t reset.

### 05.3 Global status row
In `AppLayout` (or header):
- Offline indicator (“Offline mode”)
- Sync status (“Syncing…”, “Synced”, “Offline”)
- Streak tile: “🔥 X” (shows current streak even if not done today)

### 05.4 Incident Banner + Streak Repair Flow

Banner trigger:
- `GET /status/incidents` returns incident affecting yesterday
- User missed yesterday (no activity_day record)
- User had streak >= 1 before missed day
- Repair eligible (within 72h of incident end, rate limit not hit)

Banner UI:
- Position: Top of home screen, persistent until dismissed or repaired
- Background: Soft yellow (warning, not alarm)
- Copy: See 05.4a for final copy/styling
- CTA: "Восстановить" button
- Dismiss: "Х" (hides banner for 24h)

On CTA tap:
- Call `POST /me/streak/repair { dayKey }`
- If success:
  - Update streak tile immediately
  - Show toast: "Серия восстановлена! 🔥"
  - Hide banner
- If failure (rate limit, ineligible):
  - Show inline error: "Не удалось восстановить. Попробуйте позже."

Rate limit messaging:
- If user already repaired recently: "Восстановление доступно 1 раз в 30 дней"

Must not block learning if API fails (banner simply hidden).

### 05.4a Incident Banner Styling and Copy

Banner appearance:
- Position: Top of home screen, persistent
- Background: Yellow warning tone (e.g., #FFF3CD)
- Border: 1px darker yellow (e.g., #FFE69C)
- Padding: 12px 16px
- Z-index: above course map, below modals

Banner content (Russian):
- Icon: ⚠️ (left)
- Text: "Вчера произошёл сбой на сервере. Восстановить серию?"
- CTA button: "Восстановить" (green, right)
- Dismiss: "✕" (top right)

On CTA tap:
- Call `POST /me/streak/repair { dayKey }`
- On success:
  - Animate streak tile: old number → new number
  - Show toast: "Серия восстановлена! 🔥"
  - Hide banner immediately
- On failure (rate limit):
  - Replace banner text: "Восстановление доступно 1 раз в 30 дней"
  - Hide CTA button
  - Auto-dismiss after 5 seconds

On dismiss tap:
- Hide banner
- Store dismiss timestamp
- Do NOT show again for 24 hours

72-hour window:
- Banner eligibility expires at incident.endsAt + 72 hours
- After expiry: banner never shows for that incident

## Acceptance criteria
- Routes above compile and are navigable.
- First launch always goes to onboarding goal screen (until completed).
- Global offline indicator toggles reliably.
- Incident banner is hidden gracefully when backend is unavailable.

---

# ============================================================
# AGENT_14 — ONBOARDING COMMITMENT LADDER (+ TIMING TEST)
# ============================================================

## Goal
Implement the **commitment ladder** from `onboarding/tutorial-first-launch.feature`:

**Goal selection → micro‑win lesson → streak starts → reminder prompt → (later) account**

This is the single most important growth mechanic.

## Tasks (@core)

### 14.1 Goal selection screen
- Show ≤4 choices: 5 / 10 / 15 minutes + (optional) “Custom”
- Store chosen goal in user settings (`dailyGoalMinutes`)
- One tap continues to micro‑win (no forms)

### 14.2 Micro‑win lesson selection
Create a dedicated onboarding lesson id, e.g.:
- `onboarding_micro_1` (recommended), OR
- reuse `A1 Unit 1 Lesson 1` ONLY if it meets micro‑win constraints.

Micro‑win constraints:
- 6 exercises total
- Exercise 1–2 must be **recognition‑based** (select image / tap word bank)
- No typing in the micro‑win lesson; first typing exercise appears in Lesson 2 or later
- Must include at least 1 audio moment (listen‑and‑tap recognition; no listen‑and‑type), and in v1.3.1 this is exercise #4 per 14.2a
- If audio fails to load in the micro-win: auto-retry once, then auto-downgrade to text-only variant or skip the listening requirement (do not block)
- Designed to be completed in **<90 seconds**
- Content requirement:
  - Content source must include `onboarding_micro_1` with the exact 6-exercise sequence and difficulties in 14.2a.
  - If the codebase still uses `SAMPLE_COURSE`, update it to include this lesson (do not ship with a 3-exercise stub).
  - If no backend/content pipeline yet, use a local fixture/stub to satisfy UI/tests.

### 14.2a Micro‑Win Exercise Sequence (Exact Order)

The micro‑win lesson MUST follow this exact sequence:

1. **Select Image** (difficulty 1)
   - Show Russian word, 4 image choices
   - Target: >95% success rate
   - No typing

2. **Word Bank Translation** (difficulty 1)
   - Russian phrase → tap 2-3 English words from bank
   - All required words visible
   - No typing

3. **Match Pairs** (difficulty 2)
   - 3 pairs max (e.g., Hello↔Здравствуйте)
   - Tap-based matching
   - No typing

4. **Listen and Choose** (difficulty 2)
   - Play English audio, select Russian translation from 3 choices
   - CRITICAL: This is the audio wedge verification
   - No typing

5. **Multiple Choice Translation** (difficulty 2)
   - English phrase → select correct Russian from 3 options
   - No typing

6. **Word Bank Translation** (difficulty 2)
   - Russian phrase → tap English words from bank
   - Slightly longer than #2 (3-4 words)
   - No typing

Constraints:
- Total: exactly 6 exercises
- No typing in entire micro‑win lesson
- Audio exercise MUST be position 4 (not later)
- First 2 exercises MUST have obvious answers (no near‑synonyms in distractors)
- Exercises 1-2 are difficulty 1; exercises 3-6 are difficulty 2 (hardcoded)

### 14.3 Onboarding completion screen
After micro‑win:
- Show XP earned and a **старт серии** message:
  - "🔥 1 — серия началась!"
- Show “Continue” → route to `/course`
- Set `hasSeenOnboarding = true`

### 14.4 Notification Permission Flow
Trigger: Immediately after micro-win completion screen appears
Location: Modal overlay on completion screen (not a separate route)
Copy (Russian):
  - Header: "Напоминание о занятиях"
  - Body: "Хотите ежедневное напоминание, чтобы не потерять свою серию?"
  - Primary CTA: "Разрешить" (green button)
  - Secondary: "Не сейчас" (text link, not button)

If user grants permission:
  - Fire OS/browser notification permission request
  - If OS grants: show "Отлично! Мы напомним" toast + store preference
  - If OS denies: show "Вы можете включить позже в настройках" toast + store denial timestamp

If user declines:
  - No penalty
  - Dismiss modal
  - Store decline timestamp
  - Do NOT re‑prompt for 7 days
  - Continue to course map normally

Edge cases:
- If permission already granted: skip modal entirely
- If Notifications API unavailable (some PWA contexts): skip modal, log event
- If user force‑closes during modal: treat as decline, apply 7‑day cooldown

### 14.5 Optional placement test (post micro-win)
After the micro‑win completion screen:
- Show optional CTA: “Take a placement test” (secondary to “Continue”)
- Route to `/placement-test` and load content from `GET /courses/:courseId/placement-test`
- On completion, call `POST /me/placement/submit` and show the recommended start unit
- Continue to `/course` (no blocking if user skips)

### 14.6 Acceptance instrumentation (E2E)
Add Playwright (or equivalent) E2E test:

**Onboarding timing test**
- Cold start → complete micro‑win
- Measures time from first render to completion
- Must be **< 90 seconds** in CI run

**Micro‑win success test**
- First 2 exercises must have **>95% success** likelihood.
- For automated testing: ensure these items accept broad correct answers / have obvious choices.

**Notification permission timing test**
- Permission dialog cannot appear before lesson completion
- If user force-closes during micro‑win, reopening does NOT show prompt until micro‑win is completed

## Acceptance criteria
- A brand‑new user can complete the ladder without creating an account.
- Reminders are never asked before the first win.
- Automated E2E test fails if >90 seconds.

---

# ============================================================
# AGENT_14C — ADAPTIVE DIFFICULTY (SESSION-LEVEL)
# ============================================================

## Goal
Implement adaptive difficulty that ensures early wins, targets ~70-80% success mid-lesson, and prevents fail-streaks.

## Tasks (@core)

### 14C.1 First-Lesson Guarantee
- Micro-win lesson: exercises 1-2 difficulty 1; exercises 3-6 difficulty 2 (hardcoded)
- Normal lessons: first 2 exercises are difficulty 1-2 (recognition-based when possible)

### 14C.2 Fail-Streak Intervention
- If user fails 2 consecutive exercises:
  - Next exercise MUST be difficulty 1 OR a review of already-mastered item
  - Show encouraging message: "Давай попробуем то, что ты уже знаешь"
- If user fails 3 consecutive: force review mode for remainder of session

### 14C.3 Success-Streak Challenge (Optional)
- Only after 5 consecutive correct AND user is in lesson 3+
- Insert one stretch item (difficulty +1)
- Label it subtly: "Challenge" pill

## Acceptance criteria
- Micro-win uses difficulty 1 for exercises 1-2 and difficulty 2 for exercises 3-6; normal lessons start with difficulty 1-2.
- Two consecutive failures trigger a difficulty 1/review item and "Давай попробуем то, что ты уже знаешь".
- Three consecutive failures force review mode for the rest of the session.
- If enabled, after five consecutive correct in lesson 3+, a challenge item appears with "Challenge" pill.

---

# ============================================================
# AGENT_16B — COURSE MAP: CEFR SECTIONS + DEPTH SIGNALS + NODES
# ============================================================

## Goal
Fix the #1 credibility issue: course must look like a **real course**.

Implement `progress/course-progress.feature` and `progress/unit-unlock.feature` UI:
- CEFR sections A1/A2/B1
- Visible unit counts (depth)
- Story + Checkpoint nodes visible in the path
- Locked sections and preview scrolling

## Tasks (@core)

### 16B.1 Use Course Map DTO (from Phase 4)
Update `/course` to render data from:
- `GET /courses/:courseId/map`

Fallback behavior:
- If API unavailable, load `packages/content/courses/ru-en/course.map.json` bundled into the PWA build.

### 16B.2 CEFR section visualization
UI requirements:
- Clearly labeled sections:
  - A1 (Beginner)
  - A2 (Elementary)
  - B1 (Intermediate)
- Each section shows:
  - total units
  - total lessons (optional but recommended)
  - lock state (A2/B1 locked until checkpoint passed)

### 16B.3 Depth signals (anti-demo)
Add explicit depth copy:
- “Unit X of Y” (Y is total units in that section)
- On top-of-map: “A1: 10 units • 50 lessons” (example)

Even if only the first units are fully implemented, the counts must be visible.

### 16B.4 Node rendering (lesson/story/checkpoint)
Render nodes with distinct styling:
- Lesson node: standard
- Story node: distinct icon + “Story”
- Checkpoint node: distinct icon + “Checkpoint”
- Practice node: distinct icon + “Practice” (auto-generated review node)

Click routing:
- lesson → `/lesson/:lessonId`
- story → `/story/:storyId`
- checkpoint → `/checkpoint/:checkpointId`
- practice → `/review`

### 16B.5 Unlock logic
- Locked nodes are visible but disabled (tap shows “Complete previous items to unlock”)
- Checkpoint pass unlocks next section (Phase 4 writes); UI reads unlock state from progress snapshot.

## Acceptance criteria
- Course map shows A1/A2/B1 sections even on Day 1.
- Story + checkpoint nodes are visible (even if locked).
- User can see that the course is “big”, not a 1‑unit demo.

---

# ============================================================
# AGENT_15 — LESSON PLAYER: AUDIO, RESUME, “WHY?”, APPEALS, HEARTS
# ============================================================

## Goal
Make the lesson experience feel polished and trustworthy:
- Audio exercises actually play audio
- “Why?” explanations appear on mistakes
- “Report: should be accepted” exists
- Mid‑lesson resume works
- Hearts (optional) are visible and behave correctly
- Day‑10 milestone celebration exists

## Tasks (@core)

### 15.1 Audio end-to-end (lesson + story)
- For `exercise-listen` kinds: render audio player with:
  - tap-to-play
  - replay
  - loading state
- If audio fails to start: auto-retry once, then show calm fallback:
  - “Audio unavailable — continue with text”
  - Auto-downgrade to text-only variant or skip the listening requirement
  - Do not block the session

### 15.2 Session resume (mid‑lesson)
Persist session state in IndexedDB after every answer:
- lessonId
- current exercise index
- hearts state (if enabled)
- answers + grades (for review and analytics)

On reopening `/lesson/:lessonId`:
- If there is an unfinished session → show “Resume” CTA and resume at correct index.

### 15.3 “Why?” explanations (moment of error)
On incorrect grade:
- Show a “Почему?” (Why?) link
- Opens a modal/panel containing:
  - The correct answer (repeated)
  - Why it's correct (1-2 sentences in Russian)
  - Why the user's answer is wrong (if common mistake)
  - 1-2 example sentences
  - Related grammar rule (if applicable)

Content source:
- `exercise.explanationRu` (or similar field) in lesson JSON.

### 15.4 “Report: should be accepted”
On incorrect grade:
- Show “Report” button
- Modal asks:
  - “Your answer” (prefilled)
  - optional note
- Store report offline if needed; sync later via Phase 4 endpoint.

### 15.5 Hearts UI (optional mistake buffer)
v1.3.1: hearts are disabled for RU launch; do not show hearts UI.
If reintroduced post-launch:
- Hearts must never block lessons or review.
- No “wait to continue” timers or ad gating.

### 15.6 Completion reinforcement
On lesson completion:
- Show XP earned
- Show streak/day-goal update
- If accuracy == 100%: show “Perfect!” micro‑celebration (no XP boost events; just copy + badge)

Unit completion reinforcement (recommended, v1.3):
- After completing the final lesson in a unit, show a "Unit Chest" reward reveal
- Reward is variable (random from a small pool, e.g., badge or streak-freeze chance)
- One chest per unit; not shown for regular lesson completions

### 15.7 Per-Answer Feedback Loop
On correct answer:
- Green flash / checkmark within 200ms
- "+10 XP" micro-animation (doesn't need to persist)
- Progress bar segment fills
- Auto-advance to next exercise after 1.2s (or tap to continue)
- Optional: subtle success sound (user-configurable)
- Optional (hypothesis): if alternates exist, show "Также принимается: ..." with 1-3 alternatives

On incorrect answer:
- Red/orange indicator within 200ms
- Show correct answer immediately
- "Почему?" link appears (taps to explanation)
- "Продолжить" button (user controls pace after mistake)
- Do NOT auto-advance after mistake
- No shame or guilt copy; use neutral tone

Progress indicator inside lesson:
- Show X/Y progress (e.g., "3/10")
- Progress bar fills proportionally
- Visible at top of lesson screen throughout

### 15.8 Day‑10 milestone celebration
Trigger: When streak becomes exactly 10

UI:
- Full-screen celebration (not just toast)
- Confetti animation
- Large "🔥 10" with glow effect
- Message: "10 дней подряд! Ты формируешь привычку!"
- Show badge: "10 дней подряд" badge unlocked

Reward:
- Grant 1 streak freeze (owned, not equipped)
- Message: "Получи бесплатную защиту серии"
- Explain what it does in 1 sentence

CTA:
- Primary: "Продолжить" → Course map
- Secondary: "Поделиться" → Share card

### 15.8a Day‑10 Celebration UX

Trigger: streak becomes exactly 10 (not 11, not 9→10 later)

Screen type: Full-screen modal (not toast, not inline)

Visual elements:
- Confetti animation (full screen, 3 seconds)
- Large flame icon with glow: 🔥 scaled 3x normal
- Counter animation: 9 → 10 with bounce effect
- Badge unlock: "10 дней подряд" badge appears

Copy (Russian):
- Header: "10 дней подряд!"
- Subheader: "Ты формируешь привычку! 💪"
- Reward announcement: "Получи бесплатную защиту серии"
- Reward explanation: "Она сработает, если пропустишь один день"

Reward:
- Grant 1 streak freeze to user's inventory (owned, not equipped)
- Show freeze icon with "+1" animation

CTAs:
- Primary: "Продолжить" → dismiss modal, go to course map
- Secondary: "Поделиться" → generate share card with streak count + badge

## Acceptance criteria
- At least one lesson includes a working listening exercise with real audio URL.
- Resume works after closing the tab mid‑lesson.
- “Why?” + “Report” appear on wrong answers.
- Per-answer feedback shows within 200ms; incorrect answers do not auto-advance.
- Streak 10 triggers the full-screen celebration and grants a streak freeze.
- Unit completion shows a Unit Chest variable reward (recommended v1.3).
- No hearts gating in RU launch; review remains available.

---

# ============================================================
# AGENT_16 — REVIEW HUB UI (SPACED REPETITION SURFACE)
# ============================================================

## Goal
Implement the visible “Review habit” loop:
- Review button always available
- “N due items” visible
- Review completion counts for streak/day goal
- Review remains available regardless of any limiter state

## Tasks (@core)

### 16.1 Home screen Review CTA
On `/course` (or `/` home), show a prominent Review tile:
- “Повторение — N заданий”
- If N == 0: show “Повторение — 0 заданий” with subline “Чтобы не забыть” (still allowed)

### 16.2 Review session page
Route `/review`:
- Loads queue from `GET /me/review/queue`
- Shows session of ~10 items by default
- Selects due + weak items first (server decides)
- Uses same exercise renderer as lessons (reuse components)

### 16.2a Strength indicator (optional, hypothesis)
- If review items include strength metadata (0..5), show per-item strength or a "weak" indicator in the queue/session UI

### 16.3 Review completion semantics
On completion:
- Call `POST /me/review/complete` (batch or per item)
- Show completion screen
- Update streak tile and goal progress

### 16.4 Mistakes review (optional @retention)
Add “Review mistakes” CTA if server provides `mistakeCount` in queue response.

## Acceptance criteria
- Review is reachable from home without any paywall or limiter.
- Due count is visible.
- Completing review increments “practice day” for streak.
- Optional (hypothesis): Review UI shows per-item strength (0..5) or "weak" indicator when provided.

---

# ============================================================
# AGENT_14B — ACCOUNT UPGRADE + MERGE (SAVE PROGRESS)
# ============================================================

## Goal
Turn anonymous users into registered users via loss aversion:
- Prompt “Save your progress” after value is proven
- Merge local progress into server account safely
- Preserve streak + completions

## Tasks (@core)

### 14B.1 Upgrade trigger moments
Show a non‑annoying prompt:
- After finishing **Unit 1** OR
- After reaching **Day 3–5 streak** (configurable)
Copy: "Сохрани прогресс, чтобы не потерять серию."

### 14B.2 Consent + 242‑FZ links
Account creation screen must include:
- Terms link
- Privacy link
- explicit consent checkbox (required)

### 14B.3 Local → server merge
When user creates account/logs in:
- Sync local event log to server (`/me/sync`)
- Server applies events idempotently
- After merge:
  - same completed lessons
  - same streak state
  - same SRS item state

### 14B.4 Multi-device restore
After login on another device:
- `/me/progress` and `/me/review/state` hydrate UI correctly.

## Acceptance criteria
- Upgrading to account never reduces streak or deletes progress.
- Consent checkbox required before account creation.

---

# ============================================================
# AGENT_17 — SETTINGS + MAX INFO + ACCOUNT RIGHTS
# ============================================================

## Goal
Make the app feel “real product”:
- Settings for daily goal + notifications
- Max benefits page + upgrade entry point
- Account deletion request UI (242‑FZ)

## Tasks

### 17.1 Settings: daily goal
- Daily goal minutes editable
- Changes reflect in day progress UI

### 17.2 Settings: notifications (non-blocking wiring)
- UI to enable/disable and set reminder time
- Store preference locally + send to server
- Actual scheduler wiring is **non‑blocking** (Phase 4 optional)

### 17.2a Hearts UI (runtime-configurable)
- v1.3.1: hearts are disabled for RU; no hearts UI or gating.
- If a future rollout enables hearts, it must never gate lessons or review.

### 17.2b Placement test retake (settings)
- Settings → Assessment: “Retake placement test” (disabled if cooldown not met).
- On click: route to `/placement-test` and run the same flow as onboarding.
- Show result + recommended start; completed lessons are never removed.

### 17.3 Max benefits page + upgrade flow
Users must understand:
- what Max is
- what it unlocks (AI features + convenience; not pay-to-continue)

Implement `/max` page:
- List benefits:
  - Ask-AI deeper coaching
  - Roleplay practice
  - Speaking coach feedback
  - Larger offline packs
  - Advanced practice modes
- Primary CTA: “Upgrade to Max”
- Payment method picker: Mir / SBP
- On CTA click: call `POST /billing/checkout` with `{ planId: "max_30d_pass", method: "mir"|"sbp" }` and open `checkoutUrl`
- Add `/billing/return` route:
  - Poll `GET /me/entitlements` until Max unlocks (or timeout + “We’re confirming”)

Trigger points:
- When user taps a Max value-add feature (Roleplay / Speaking coach / Ask-AI deeper coaching)
- From Settings (optional)

Paywall cancel behavior:
- If checkout is canceled/failed, return to prior screen and keep AI feature locked (no preview).
- Allow immediate retry, but rate-limit paywall reopen to once per 60s.

### 17.4 Account rights
Add account deletion request UI:
- Explains what will be deleted
- Calls Phase 4 deletion request endpoint (or sends email; future)

---

# ============================================================
# AGENT_18 — OFFLINE, SYNC STATUS, CACHING (CORE TRUST)
# ============================================================

## Goal
Offline must not break the habit loop:
- Lessons can be completed offline
- Progress is queued and synced
- Streak credit uses completion timestamp
- Cached content exists for next actions (at least the next lesson + review queue)

## Tasks (@core)

### 18.1 Local-first event log (IndexedDB)
Persist an append-only event log:
- app_open
- lesson_started
- exercise_answered (optional; can compress)
- lesson_completed
- review_completed
- story_completed
- checkpoint_completed
- appeal_submitted

Each event includes:
- id (uuid)
- type
- occurredAt (UTC ms)
- timezoneOffsetMinutes
- payload

### 18.2 Sync loop (UI side)
On reconnect:
- send pending events to `/me/sync`
- apply acks idempotently
- update progress snapshot from server

Non-blocking (can ship after Golden Path):
- partial ack handling / resume (fine-grained)

### 18.3 Cached content minimum
Cache at least:
- the micro‑win lesson
- the next lesson after current
- latest review queue (or a small pool)

### 18.3a Audio Pre-Caching (First Launch)

Note: Micro-win audio failure is non-blocking: auto-retry once, then auto-downgrade to text-only variant or skip the listening requirement.

On first app open (before any user action):
1. Check if micro-win audio is already in Cache Storage
2. If not cached:
   - Start background fetch of micro-win audio assets
   - Target: all audio files for `onboarding_micro_1` lesson
   - Budget: <= 2 MB total

Pre-cache policy:
- On cellular (no data saver): pre-cache immediately
- On Wi-Fi: pre-cache immediately
- On cellular with data saver: defer; if audio fails, auto-retry once then auto-downgrade to text-only/skip in micro-win

Completion signal:
- When pre-cache completes, set `microWinAudioCached: true` in IndexedDB
- Micro-win lesson player checks this flag before playing audio

Failure handling:
- If pre-cache fails mid-download: lesson still playable with text fallback
- If audio fails to play: auto-retry once, then auto-downgrade to text-only/skip and continue
- Show "Скачать аудио" button on exercises with missing audio
- Auto-retry on next connectivity change

Verification (for release checklist):
- Airplane mode test: open app, start micro-win, audio plays from cache
- If audio doesn't play: auto-retry once, then text fallback appears; lesson still completable

### 18.4 Offline completion streak credit
When a completion happens offline:
- update streak UI locally immediately for that day key
- do not wait for server
- on later sync, reconcile server streak without decrementing

### 18.5 Audio reliability verification (manual, documented)
- Document which audio files are bundled vs fetched (paths + size)
- Confirm micro-win lesson audio plays in airplane mode
- Add these checks to Golden Path E2E assertions or release checklist

## Acceptance criteria
- Airplane mode: user can complete a cached lesson and see streak update locally.
- After first launch, micro‑win lesson audio plays in airplane mode (pre‑cached/bundled).
- Reconnect: sync succeeds and streak remains valid.
- No progress loss on refresh/reopen.

---

## Explicit non-blocking items (do later)
These should not block Golden Path sign-off:
- Notification scheduler wiring (actual sending)
- Audio fallback edge cases beyond basic retry
- Partial sync ack/resume handling

---

# APPENDIX A — Legacy Phase 3 Implementation (v1.2 baseline)

Source: `4dd1477cf5293adf0c8aa4a2adb37a6d4c42c0b9:projects/anglo/tasks/master-tasks-phase-3.md`

This appendix preserves the legacy Phase 3 spec that included **complete file-by-file code blocks**.

Merge rule:
- **If anything in Appendix A conflicts with the v1.3/v1.3.1 requirements above, the v1.3/v1.3.1 text wins.**

# MASTER TASKS: PHASE 3 - UI + OFFLINE
# All tasks are executable with complete code. No TODOs or stubs.
# Run order: AGENT_05 -> AGENT_14 -> AGENT_15 -> AGENT_14B -> AGENT_16 -> AGENT_16B -> AGENT_17 -> AGENT_18
# Prereqs: Phase 1 and Phase 2 completed.

# ============================================================
# STANDARDS AND ALIGNMENT
# ============================================================

- Canonical: This file is the single source of truth for Phase 3 tasks; ignore other variants.
- Feature files live under `projects/anglo/apps/pwa/tests/features/` and are sourced from
  `projects/anglo/docs/bdd/duolingoru_feature_files-3.md` (extract each `## features/...` heading
  and its ```gherkin block).
- Use root pnpm installs only. Do not run pnpm install inside apps/* or packages/*.
- BDD uses Cucumber (test:bdd/test:bdd:all/test:bdd:dry) and parses Gherkin
  feature files; step definitions live under `projects/anglo/apps/pwa/tests/bdd`.
  Do not create vitest-based BDD tests in Phase 3.
- API calls must use `apiFetch` so `VITE_API_BASE_URL` + auth headers are applied; when Phase 4
  endpoints are missing, fall back to local assets/defaults instead of failing.
- Keep UI text in ASCII for now. Use string constants in a single place to enable later
  localization updates. Feature files may include non-ASCII text; do not rewrite them.
- Avoid background dev servers in verification steps.

# ============================================================
# PRECHECK: PHASE 2 ARTIFACTS (RUN ONCE)
# ============================================================

Ensure Phase 2 builds completed before running Phase 3 tasks:

```bash
test -f packages/lesson-engine/dist/index.js || { echo "Missing lesson-engine build (run Phase 2)"; exit 1; }
test -f packages/types/dist/index.js || { echo "Missing types build (run Phase 2)"; exit 1; }
```

Optional check for Session name collisions in app imports:

```bash
grep -R "from '@duolingoru/types'" projects/anglo/apps/pwa/src | grep -q "Session" && \
grep -R "from '@duolingoru/lesson-engine'" projects/anglo/apps/pwa/src | grep -q "Session" && \
echo "⚠ Session import collision risk - use aliases (AuthSession vs LearningSession)" || \
echo "✓ No Session import collision detected"
```

# ============================================================
# PRECHECK: ENGINE IMPORT FIX (RUN ONCE IF NEEDED)
# ============================================================

If packages/lesson-engine/src/grading/index.ts imports DEFAULT_GRADING_CONFIG as a type-only
import, replace the import lines with the following:

```typescript
import type { Exercise, GradeResult, GradingConfig } from '../models/index.js';
import { DEFAULT_GRADING_CONFIG } from '../models/index.js';
```

Verification:
```bash
pnpm -C packages/lesson-engine typecheck
```

# ============================================================
# FEATURE FILES (CREATE ONCE)
# ============================================================

Create the feature files under `projects/anglo/apps/pwa/tests/features/` by extracting each
`## features/...` heading and its ```gherkin block from
`projects/anglo/docs/bdd/duolingoru_feature_files-3.md`. Do not edit the Gherkin content.

## Directory Structure
```bash
mkdir -p projects/anglo/apps/pwa/tests/features/{ui,onboarding,lessons,gamification,settings,social,support,offline,progress,reliability,payments,monetization}
```

## Feature Files (exact paths)
- projects/anglo/apps/pwa/tests/features/onboarding/anonymous-start.feature
- projects/anglo/apps/pwa/tests/features/onboarding/placement-test.feature
- projects/anglo/apps/pwa/tests/features/onboarding/account-creation.feature
- projects/anglo/apps/pwa/tests/features/onboarding/account-upgrade.feature
- projects/anglo/apps/pwa/tests/features/onboarding/login-signin.feature
- projects/anglo/apps/pwa/tests/features/onboarding/password-reset.feature
- projects/anglo/apps/pwa/tests/features/onboarding/email-verification.feature
- projects/anglo/apps/pwa/tests/features/onboarding/tutorial-first-launch.feature
- projects/anglo/apps/pwa/tests/features/lessons/start-lesson.feature
- projects/anglo/apps/pwa/tests/features/lessons/exercise-translate-tap.feature
- projects/anglo/apps/pwa/tests/features/lessons/exercise-translate-type.feature
- projects/anglo/apps/pwa/tests/features/lessons/exercise-listen.feature
- projects/anglo/apps/pwa/tests/features/lessons/exercise-match-pairs.feature
- projects/anglo/apps/pwa/tests/features/lessons/exercise-fill-blank.feature
- projects/anglo/apps/pwa/tests/features/lessons/exercise-select-image.feature
- projects/anglo/apps/pwa/tests/features/lessons/exercise-speak.feature
- projects/anglo/apps/pwa/tests/features/lessons/complete-lesson.feature
- projects/anglo/apps/pwa/tests/features/lessons/lesson-grading.feature
- projects/anglo/apps/pwa/tests/features/gamification/xp-earning.feature
- projects/anglo/apps/pwa/tests/features/gamification/streak-tracking.feature
- projects/anglo/apps/pwa/tests/features/gamification/streak-freeze.feature
- projects/anglo/apps/pwa/tests/features/gamification/leaderboard.feature
- projects/anglo/apps/pwa/tests/features/gamification/achievements.feature
- projects/anglo/apps/pwa/tests/features/gamification/daily-challenges.feature
- projects/anglo/apps/pwa/tests/features/progress/course-progress.feature
- projects/anglo/apps/pwa/tests/features/progress/unit-unlock.feature
- projects/anglo/apps/pwa/tests/features/progress/spaced-repetition.feature
- projects/anglo/apps/pwa/tests/features/offline/offline-lesson.feature
- projects/anglo/apps/pwa/tests/features/offline/progress-sync.feature
- projects/anglo/apps/pwa/tests/features/offline/content-download.feature
- projects/anglo/apps/pwa/tests/features/payments/max-upgrade.feature
- projects/anglo/apps/pwa/tests/features/payments/mir-payment.feature
- projects/anglo/apps/pwa/tests/features/payments/sbp-payment.feature
- projects/anglo/apps/pwa/tests/features/payments/lifetime-purchase.feature
- projects/anglo/apps/pwa/tests/features/payments/payment-refunds.feature
- projects/anglo/apps/pwa/tests/features/settings/daily-goal.feature
- projects/anglo/apps/pwa/tests/features/settings/notifications.feature
- projects/anglo/apps/pwa/tests/features/settings/language-preferences.feature
- projects/anglo/apps/pwa/tests/features/settings/account-settings.feature
- projects/anglo/apps/pwa/tests/features/social/add-friends.feature
- projects/anglo/apps/pwa/tests/features/social/friend-leaderboard.feature
- projects/anglo/apps/pwa/tests/features/social/share-progress.feature
- projects/anglo/apps/pwa/tests/features/reliability/offline-fallback.feature
- projects/anglo/apps/pwa/tests/features/reliability/data-recovery.feature
- projects/anglo/apps/pwa/tests/features/monetization/hearts-vs-energy.feature
- projects/anglo/apps/pwa/tests/features/monetization/promo-codes.feature
- projects/anglo/apps/pwa/tests/features/ui/theme-and-accessibility.feature
- projects/anglo/apps/pwa/tests/features/ui/tips-and-explanations.feature
- projects/anglo/apps/pwa/tests/features/ui/error-handling-and-edge-cases.feature

---

# ============================================================
# AGENT_05_UI_FOUNDATION.md
# ============================================================

# Task: UI Foundation, Routing, Providers, UI Kit

**Model:** haiku
**Task ID:** ui_005
**Modifies:** 6 files
**Creates:** 13 files
**Depends On:** Phase 1 and Phase 2 complete

## Directory Structure
```bash
mkdir -p projects/anglo/apps/pwa/src/{pages,pages/onboarding,components/ui,components/exercises,components/gamification,layouts,lib,stores,hooks,data}
```

## Modify File: projects/anglo/apps/pwa/package.json

Add these entries to the existing `dependencies` object:
- `"@duolingoru/lesson-engine": "workspace:*"`
- `"@duolingoru/types": "workspace:*"`
- `"@tanstack/react-query": "^5.59.0"`
- `"@tanstack/react-router": "^1.66.0"`

Add these entries to the existing `devDependencies` object:
- `"@testing-library/jest-dom": "^6.4.5"`
- `"fake-indexeddb": "^5.0.2"`

Keep existing dependencies. Do not remove any.

## Modify File: projects/anglo/apps/pwa/src/App.tsx

```typescript
import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { ErrorBoundary } from './lib/error-boundary';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

export default function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/styles/index.css

Append the following styles:

```css
:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #f7f7f7;
  color: #111827;
}

a {
  color: inherit;
  text-decoration: none;
}
```

## Create File: projects/anglo/apps/pwa/src/routes.tsx

```typescript
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import AppLayout from './layouts/AppLayout';
import WelcomePage from './pages/Welcome';
import CourseOverviewPage from './pages/CourseOverview';
import LessonPage from './pages/Lesson';
import ProgressPage from './pages/Progress';
import LeaderboardPage from './pages/Leaderboard';
import SettingsPage from './pages/Settings';
import SocialPage from './pages/Social';
import SupportPage from './pages/Support';
import OfflinePage from './pages/Offline';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WelcomePage,
});

const courseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/course',
  component: CourseOverviewPage,
});

const lessonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lesson/$lessonId',
  component: LessonPage,
});

const progressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/progress',
  component: ProgressPage,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/leaderboard',
  component: LeaderboardPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const socialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/social',
  component: SocialPage,
});

const supportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support',
  component: SupportPage,
});

const offlineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/offline',
  component: OfflinePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  courseRoute,
  lessonRoute,
  progressRoute,
  leaderboardRoute,
  settingsRoute,
  socialRoute,
  supportRoute,
  offlineRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

**NOTE:** Keep the switch exhaustive as new exercise kinds are added; update this file
when new kinds land to avoid incorrect fallthroughs.

## Create File: projects/anglo/apps/pwa/src/layouts/AppLayout.tsx

```typescript
import React from 'react';
import { Link } from '@tanstack/react-router';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <div className="font-bold">Yazychok</div>
          <nav className="flex gap-3 text-sm">
            <Link to="/">Home</Link>
            <Link to="/course">Course</Link>
            <Link to="/progress">Progress</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
```

## Create File: projects/anglo/apps/pwa/src/lib/error-boundary.tsx

```typescript
import React from 'react';

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-white border rounded">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="text-sm text-gray-600">{this.state.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Create File: projects/anglo/apps/pwa/src/lib/strings.ts

```typescript
export const STRINGS = {
  appName: 'Yazychok',
  startLearning: 'Start Learning',
  createAccount: 'Create Account',
  logIn: 'Log In',
  courseTitle: 'English for Russian speakers',
};
```

## Create UI Components

Create the following files:

### projects/anglo/apps/pwa/src/components/ui/Button.tsx
```typescript
import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export default function Button({ variant = 'primary', ...props }: Props) {
  const base = 'px-4 py-2 rounded text-sm font-medium';
  const style =
    variant === 'primary'
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200';
  return <button className={`${base} ${style}`} {...props} />;
}
```

### projects/anglo/apps/pwa/src/components/ui/Card.tsx
```typescript
import React from 'react';

export default function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white border rounded p-4">{children}</div>;
}
```

### projects/anglo/apps/pwa/src/components/ui/Input.tsx
```typescript
import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
  return (
    <input
      className="border rounded px-3 py-2 text-sm w-full"
      {...props}
    />
  );
}
```

### projects/anglo/apps/pwa/src/components/ui/ProgressBar.tsx
```typescript
import React from 'react';

export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 bg-gray-200 rounded">
      <div
        className="h-2 bg-green-600 rounded"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
```

### projects/anglo/apps/pwa/src/components/ui/Badge.tsx
```typescript
import React from 'react';

export default function Badge({ label }: { label: string }) {
  return (
    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
      {label}
    </span>
  );
}
```

## Create Placeholder Pages (to be replaced by later agents)

Create these files with minimal content:

- projects/anglo/apps/pwa/src/pages/Welcome.tsx
- projects/anglo/apps/pwa/src/pages/CourseOverview.tsx
- projects/anglo/apps/pwa/src/pages/Lesson.tsx
- projects/anglo/apps/pwa/src/pages/Progress.tsx
- projects/anglo/apps/pwa/src/pages/Leaderboard.tsx
- projects/anglo/apps/pwa/src/pages/Settings.tsx
- projects/anglo/apps/pwa/src/pages/Social.tsx
- projects/anglo/apps/pwa/src/pages/Support.tsx
- projects/anglo/apps/pwa/src/pages/Offline.tsx

Use this template for each:

```typescript
import React from 'react';
import Card from '../components/ui/Card';

export default function WelcomePage() {
  return (
    <Card>
      <h1 className="text-lg font-semibold">Welcome</h1>
      <p className="text-sm text-gray-600">Placeholder page</p>
    </Card>
  );
}
```

Adjust the component name and heading to match the page.

## BDD Note

Cucumber config and BDD support files are created in Phase 1. Do not add
vitest-based BDD tests in Phase 3.

## Verification

```bash
pnpm -C projects/anglo/apps/pwa typecheck
pnpm -C projects/anglo/apps/pwa test
```

## Success Criteria

- typecheck passes for projects/anglo/apps/pwa
- routes render without runtime errors

---

# ============================================================
# AGENT_14_UI_ONBOARDING.md
# ============================================================

# Task: Onboarding and Auth UI

**Model:** sonnet
**Task ID:** ui_014
**Modifies:** 3 files
**Creates:** 9 files
**Depends On:** AGENT_05

## Modify File: projects/anglo/apps/pwa/src/pages/Welcome.tsx

Replace with:

```typescript
import React from 'react';
import { Link } from '@tanstack/react-router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { STRINGS } from '../lib/strings';

export default function WelcomePage() {
  return (
    <Card>
      <h1 className="text-xl font-semibold" data-testid="welcome-title">
        {STRINGS.appName}
      </h1>
      <p className="text-sm text-gray-600">{STRINGS.courseTitle}</p>
      <div className="mt-4 flex gap-2">
        <Link to="/course">
          <Button>{STRINGS.startLearning}</Button>
        </Link>
        <Link to="/auth/register">
          <Button variant="secondary">{STRINGS.createAccount}</Button>
        </Link>
        <Link to="/auth/login">
          <Button variant="secondary">{STRINGS.logIn}</Button>
        </Link>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        <Link to="/tutorial">Tutorial</Link>
        <span className="mx-2">|</span>
        <Link to="/placement-test">Placement Test</Link>
      </div>
    </Card>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/routes.tsx

Add the following routes under the rootRoute:

**NOTE:** Replace the `routeTree` assignment entirely with the block below; do not append.

```typescript
import LoginPage from './pages/onboarding/Login';
import RegisterPage from './pages/onboarding/Register';
import EmailVerificationPage from './pages/onboarding/EmailVerification';
import PasswordResetPage from './pages/onboarding/PasswordReset';
import AccountUpgradePage from './pages/onboarding/AccountUpgrade';
import TutorialPage from './pages/onboarding/Tutorial';
import PlacementTestPage from './pages/onboarding/PlacementTest';

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/register',
  component: RegisterPage,
});

const verifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/verify',
  component: EmailVerificationPage,
});

const resetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/reset',
  component: PasswordResetPage,
});

const upgradeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/upgrade',
  component: AccountUpgradePage,
});

const tutorialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tutorial',
  component: TutorialPage,
});

const placementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/placement-test',
  component: PlacementTestPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  courseRoute,
  lessonRoute,
  progressRoute,
  leaderboardRoute,
  settingsRoute,
  socialRoute,
  supportRoute,
  offlineRoute,
  loginRoute,
  registerRoute,
  verifyRoute,
  resetRoute,
  upgradeRoute,
  tutorialRoute,
  placementRoute,
]);
```

## Create File: projects/anglo/apps/pwa/src/lib/device.ts

```typescript
const KEY = 'duolingoru_device_id';

export function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(KEY, id);
  return id;
}
```

## Create File: projects/anglo/apps/pwa/src/stores/onboardingStore.ts

```typescript
import { create } from 'zustand';
import { getOrCreateDeviceId } from '../lib/device';

type State = {
  deviceId: string;
  hasSeenTutorial: boolean;
  placementLevel: 'a1' | 'a2' | 'b1' | null;
  setTutorialSeen: (seen: boolean) => void;
  setPlacementLevel: (level: 'a1' | 'a2' | 'b1' | null) => void;
};

export const useOnboardingStore = create<State>((set) => ({
  deviceId: getOrCreateDeviceId(),
  hasSeenTutorial: false,
  placementLevel: null,
  setTutorialSeen: (seen) => set({ hasSeenTutorial: seen }),
  setPlacementLevel: (level) => set({ placementLevel: level }),
}));
```

## Create Onboarding Pages

Create the following files under projects/anglo/apps/pwa/src/pages/onboarding:

- Login.tsx
- Register.tsx
- EmailVerification.tsx
- PasswordReset.tsx
- AccountUpgrade.tsx
- Tutorial.tsx
- PlacementTest.tsx

Use this minimal pattern (example Login.tsx):

```typescript
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Card>
      <h1 className="text-lg font-semibold">Log In</h1>
      <div className="mt-4 space-y-2">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button data-testid="login-submit">Continue</Button>
      </div>
    </Card>
  );
}
```

Follow the same structure for other pages using appropriate headings and form fields:
- Register: email, password, username
- EmailVerification: input for code
- PasswordReset: email and new password
- AccountUpgrade: summary and confirm button
- Tutorial: a short list of steps with a Done button
- PlacementTest: select level buttons (A1/A2/B1) and a Start button

## Verification

```bash
pnpm -C projects/anglo/apps/pwa typecheck
```

## Success Criteria

- onboarding routes render without errors

---

# ============================================================
# AGENT_15_UI_LESSONS.md
# ============================================================

# Task: Course Overview, Lesson Flow, Exercise Components

**Model:** sonnet
**Task ID:** ui_015
**Modifies:** 2 files
**Creates:** 11 files
**Depends On:** AGENT_14

## Create File: projects/anglo/apps/pwa/src/data/sample-course.ts

```typescript
import type { Course } from '@duolingoru/lesson-engine';

export const SAMPLE_COURSE: Course = {
  id: 'ru-en',
  name: 'English for Russian speakers',
  fromLang: 'ru',
  toLang: 'en',
  levels: ['a1', 'a2', 'b1'],
  units: [
    {
      id: 'a1_unit_01',
      courseId: 'ru-en',
      level: 'a1',
      title: 'Unit 1',
      description: 'Basics',
      order: 1,
      estimatedMinutes: 10,
      lessons: [
        {
          id: 'a1_u1_l1',
          unitId: 'a1_unit_01',
          title: 'Lesson 1: Greetings',
          order: 1,
          exercises: [
            {
              id: 'ex-1',
              kind: 'translate_tap',
              prompt: { text: 'Hello' },
              choices: ['Hello', 'Bye', 'Thanks'],
              correct: 'Hello',
              difficulty: 1,
            },
            {
              id: 'ex-2',
              kind: 'translate_type',
              prompt: { text: 'Thanks' },
              correct: ['Thanks', 'Thank you'],
              difficulty: 1,
            },
            {
              id: 'ex-3',
              kind: 'match_pairs',
              prompt: { text: 'Match pairs' },
              correct: [
                ['hello', 'hello'],
                ['bye', 'bye'],
              ] as const,
              difficulty: 1,
            }
          ]
        }
      ]
    }
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
```

## Modify File: projects/anglo/apps/pwa/src/pages/CourseOverview.tsx

Replace with:

```typescript
import React from 'react';
import { Link } from '@tanstack/react-router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SAMPLE_COURSE } from '../data/sample-course';

export default function CourseOverviewPage() {
  const unit = SAMPLE_COURSE.units[0];
  const lesson = unit.lessons[0];

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-lg font-semibold">Course Overview</h1>
        <p className="text-sm text-gray-600">{SAMPLE_COURSE.name}</p>
      </Card>
      <Card>
        <h2 className="font-medium">{unit.title}</h2>
        <p className="text-sm text-gray-600">{unit.description}</p>
        <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }}>
          <Button className="mt-3">Start Lesson</Button>
        </Link>
      </Card>
    </div>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/pages/Lesson.tsx

Replace with:

```typescript
import React, { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SAMPLE_COURSE } from '../data/sample-course';
import ExerciseRenderer from '../components/ExerciseRenderer';
import {
  createSession,
  getCurrentExercise,
  submitAnswer,
  isSessionComplete,
  getSessionSummary,
  gradeAnswer,
  gradeMatchPairs,
  DEFAULT_SESSION_CONFIG,
} from '@duolingoru/lesson-engine';
import type { GradeResult, MatchPair, Session } from '@duolingoru/lesson-engine';
import {
  fetchPolicyConfig,
  getCachedPolicyConfig,
  policyToSessionConfig,
} from '../lib/policy';

export default function LessonPage() {
  const lesson = SAMPLE_COURSE.units[0].lessons[0];
  const [session, setSession] = useState<Session>(() => {
    const cachedPolicy = getCachedPolicyConfig();
    const config = cachedPolicy
      ? policyToSessionConfig(cachedPolicy)
      : DEFAULT_SESSION_CONFIG;
    return createSession(lesson.id, 'local-user', lesson.exercises, config);
  });
  const current = getCurrentExercise(session);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchPolicyConfig()
      .then((policy) => {
        if (!active) return;
        const config = policyToSessionConfig(policy);
        setSession(createSession(lesson.id, 'local-user', lesson.exercises, config));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lesson.id, lesson.exercises]);

  const onSubmit = (answer: string | MatchPair[]) => {
    if (!current) return;

    let grade: GradeResult;
    let storedAnswer: string | MatchPair[];

    if (current.kind === 'match_pairs') {
      if (!Array.isArray(answer)) return;
      const matchResult = gradeMatchPairs(answer, current.correct);
      const isCorrect = matchResult.correct === matchResult.total;
      grade = {
        type: isCorrect ? 'correct' : 'incorrect',
        isCorrect,
        feedback: isCorrect
          ? 'Great job!'
          : `Matched ${matchResult.correct} of ${matchResult.total}`,
      };
      storedAnswer = answer;
    } else {
      const textAnswer = String(answer);
      grade = gradeAnswer(current, textAnswer);
      storedAnswer = textAnswer;
    }

    const result = submitAnswer(session, storedAnswer, grade);
    setSession({ ...result.session });
    setLastFeedback(grade.feedback);
  };

  if (isSessionComplete(session)) {
    const summary = getSessionSummary(session);
    return (
      <Card>
        <h1 className="text-lg font-semibold">Lesson Complete</h1>
        <p className="text-sm text-gray-600">XP: {summary.xpEarned}</p>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-lg font-semibold">{lesson.title}</h1>
      {current && (
        <ExerciseRenderer exercise={current} onSubmit={onSubmit} />
      )}
      {lastFeedback && (
        <div className="mt-2 text-sm text-gray-600">{lastFeedback}</div>
      )}
      <div className="mt-4">
        <Button onClick={() => onSubmit(current?.kind === 'match_pairs' ? [] : 'test')}>
          Submit
        </Button>
      </div>
    </Card>
  );
}
```

## Create File: projects/anglo/apps/pwa/src/lib/api.ts

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const ACCESS_TOKEN_KEY = 'duolingoru_access_token';

export function getApiUrl(path: string): string {
  if (!API_BASE_URL) return path;
  return new URL(path, API_BASE_URL).toString();
}

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(getApiUrl(path), { ...init, headers });
}
```

## Create File: projects/anglo/apps/pwa/src/lib/policy.ts

```typescript
import type { PolicyConfig } from '@duolingoru/types';
import { DEFAULT_SESSION_CONFIG, type SessionConfig } from '@duolingoru/lesson-engine';
import { apiFetch } from './api';

const STORAGE_KEY = 'policy-config';
const FALLBACK_POLICY: PolicyConfig = {
  limiterType: 'hearts',
  maxHearts: 3,
  refillHours: 20,
  practiceRefillEnabled: true,
  updatedAt: new Date().toISOString(),
};

export function getCachedPolicyConfig(): PolicyConfig | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PolicyConfig;
  } catch {
    return null;
  }
}

export async function fetchPolicyConfig(): Promise<PolicyConfig> {
  try {
    const res = await apiFetch('/policy/config');
    if (!res.ok) throw new Error('policy config fetch failed');
    const data = (await res.json()) as { policy: PolicyConfig };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.policy));
    return data.policy;
  } catch {
    const cached = getCachedPolicyConfig();
    return cached ?? FALLBACK_POLICY;
  }
}

export function policyToSessionConfig(policy: PolicyConfig): SessionConfig {
  if (policy.limiterType === 'hearts') {
    return { ...DEFAULT_SESSION_CONFIG, maxHearts: policy.maxHearts };
  }
  return { ...DEFAULT_SESSION_CONFIG, maxHearts: policy.maxEnergy };
}
```

**NOTE:** `/policy/config` may not exist until Phase 4. `fetchPolicyConfig` now falls back
to cached/default policy, and callers should still tolerate failures.

## Create File: projects/anglo/apps/pwa/src/components/ExerciseRenderer.tsx

```typescript
import React from 'react';
import type { Exercise } from '@duolingoru/lesson-engine';
import TranslateTap from './exercises/TranslateTap';
import TranslateType from './exercises/TranslateType';
import Listen from './exercises/Listen';
import FillBlank from './exercises/FillBlank';
import MatchPairs from './exercises/MatchPairs';
import SelectImage from './exercises/SelectImage';
import Speak from './exercises/Speak';

export default function ExerciseRenderer({
  exercise,
  onSubmit,
}: {
  exercise: Exercise;
  onSubmit: (answer: string | [string, string][]) => void;
}) {
  switch (exercise.kind) {
    case 'translate_tap':
      return <TranslateTap exercise={exercise} onSubmit={onSubmit} />;
    case 'translate_type':
      return <TranslateType exercise={exercise} onSubmit={onSubmit} />;
    case 'listen_tap':
    case 'listen_type':
      return <Listen exercise={exercise} onSubmit={onSubmit} />;
    case 'fill_blank':
      return <FillBlank exercise={exercise} onSubmit={onSubmit} />;
    case 'match_pairs':
      return <MatchPairs exercise={exercise} onSubmit={onSubmit} />;
    case 'select_image':
      return <SelectImage exercise={exercise} onSubmit={onSubmit} />;
    default:
      return <Speak exercise={exercise} onSubmit={onSubmit} />;
  }
}
```

## Create Exercise Components

Create files under projects/anglo/apps/pwa/src/components/exercises with minimal UI:

- TranslateTap.tsx
- TranslateType.tsx
- Listen.tsx
- FillBlank.tsx
- MatchPairs.tsx
- SelectImage.tsx
- Speak.tsx

Example (TranslateType.tsx):

```typescript
import React, { useState } from 'react';
import type { Exercise } from '@duolingoru/lesson-engine';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function TranslateType({
  exercise,
  onSubmit,
}: {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
}) {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-2">
      <div className="text-sm">{exercise.prompt.text}</div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={() => onSubmit(value)}>Check</Button>
    </div>
  );
}
```

Use similar patterns for the other components.

## Verification

```bash
pnpm -C projects/anglo/apps/pwa typecheck
```

## Success Criteria

- Course overview renders
- Lesson flow renders without runtime errors

---

# ============================================================
# AGENT_14B_UI_AUTH_INTEGRATION.md
# ============================================================

# Task: Auth Integration and Session Persistence

**Model:** sonnet
**Task ID:** ui_014b
**Modifies:** 4 files
**Creates:** 1 file
**Depends On:** AGENT_15

## Create File: projects/anglo/apps/pwa/src/stores/authStore.ts

```typescript
import { create } from 'zustand';
import { apiFetch, clearTokens, getAccessToken, getRefreshToken, setTokens } from '../lib/api';

type User = {
  id: string;
  email: string;
  username: string;
};

type AuthState = {
  user: User | null;
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: 'idle',
  error: null,
  login: async (email, password) => {
    set({ status: 'loading', error: null });
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        set({ status: 'ready', error: 'Email or password is incorrect' });
        return false;
      }
      const data = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
        user: User;
      };
      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, status: 'ready', error: null });
      return true;
    } catch (err) {
      set({ status: 'ready', error: 'Login failed' });
      return false;
    }
  },
  register: async (email, password, username) => {
    set({ status: 'loading', error: null });
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username }),
      });
      if (!res.ok) {
        const message =
          res.status === 400 ? 'This email is already registered' : 'Registration failed';
        set({ status: 'ready', error: message });
        return false;
      }
      const data = (await res.json()) as {
        accessToken: string;
        refreshToken: string;
        user: User;
      };
      setTokens(data.accessToken, data.refreshToken);
      set({ user: data.user, status: 'ready', error: null });
      return true;
    } catch (err) {
      set({ status: 'ready', error: 'Registration failed' });
      return false;
    }
  },
  logout: () => {
    clearTokens();
    set({ user: null, status: 'ready', error: null });
  },
  hydrate: async () => {
    if (get().status !== 'idle') return;
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (!accessToken && !refreshToken) {
      set({ status: 'ready' });
      return;
    }
    set({ status: 'loading' });
    try {
      const res = await apiFetch('/me');
      if (!res.ok) {
        clearTokens();
        set({ status: 'ready', user: null });
        return;
      }
      const data = (await res.json()) as { user: User };
      set({ user: data.user, status: 'ready', error: null });
    } catch (err) {
      clearTokens();
      set({ status: 'ready', user: null });
    }
  },
}));
```

## Modify File: projects/anglo/apps/pwa/src/lib/api.ts

Replace with:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const ACCESS_TOKEN_KEY = 'duolingoru_access_token';
const REFRESH_TOKEN_KEY = 'duolingoru_refresh_token';

export function getApiUrl(path: string): string {
  if (!API_BASE_URL) return path;
  return new URL(path, API_BASE_URL).toString();
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  const res = await fetch(getApiUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = (await res.json()) as { accessToken: string };
  if (!data.accessToken) return null;
  setTokens(data.accessToken);
  return data.accessToken;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const requestInit = { ...init, headers };
  const res = await fetch(getApiUrl(path), requestInit);
  if (res.status !== 401) return res;
  const newToken = await refreshAccessToken();
  if (!newToken) return res;
  headers.set('Authorization', `Bearer ${newToken}`);
  return fetch(getApiUrl(path), { ...init, headers });
}
```

## Modify File: projects/anglo/apps/pwa/src/pages/onboarding/Login.tsx

Replace with:

```typescript
import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

const isValidEmail = (value: string) => /\\S+@\\S+\\.\\S+/.test(value);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const status = useAuthStore((state) => state.status);

  const onSubmit = async () => {
    setClientError(null);
    if (!email.trim()) {
      setClientError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setClientError('Please enter a valid email');
      return;
    }
    if (!password) {
      setClientError('Password is required');
      return;
    }
    const ok = await login(email, password);
    if (ok) {
      navigate({ to: '/course' });
    }
  };
  const errorMessage = clientError ?? error;

  return (
    <Card>
      <h1 className="text-lg font-semibold">Log In</h1>
      <div className="mt-4 space-y-2">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
        <Button data-testid="login-submit" onClick={onSubmit} disabled={status === 'loading'}>
          Log In
        </Button>
        <div className="flex gap-3 text-xs text-gray-600">
          <Link to="/auth/register">Create Account</Link>
          <Link to="/auth/reset">Forgot Password?</Link>
        </div>
      </div>
    </Card>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/pages/onboarding/Register.tsx

Replace with:

```typescript
import React, { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

const isValidEmail = (value: string) => /\\S+@\\S+\\.\\S+/.test(value);

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const error = useAuthStore((state) => state.error);
  const status = useAuthStore((state) => state.status);

  const onSubmit = async () => {
    setClientError(null);
    if (!email.trim()) {
      setClientError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setClientError('Please enter a valid email');
      return;
    }
    if (!username.trim()) {
      setClientError('Username is required');
      return;
    }
    if (!password) {
      setClientError('Password is required');
      return;
    }
    if (password !== confirmPassword) {
      setClientError('Passwords do not match');
      return;
    }
    const ok = await register(email, password, username);
    if (ok) {
      navigate({ to: '/course' });
    }
  };
  const errorMessage = clientError ?? error;

  return (
    <Card>
      <h1 className="text-lg font-semibold">Create Account</h1>
      <div className="mt-4 space-y-2">
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}
        <Button onClick={onSubmit} disabled={status === 'loading'}>
          Create Account
        </Button>
        <div className="text-xs text-gray-600">
          <Link to="/auth/login">Log In Instead</Link>
        </div>
      </div>
    </Card>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/App.tsx

Replace with:

```typescript
import React, { useEffect } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { ErrorBoundary } from './lib/error-boundary';
import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function AuthHydrator() {
  const hydrate = useAuthStore((state) => state.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

export default function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthHydrator />
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
```

## Checklist

- [ ] authStore handles login, register, logout, and hydrate
- [ ] apiFetch refreshes access token on 401 and retries once
- [ ] Login/Register pages show errors and navigate on success
- [ ] Login form includes auth links (create account, forgot password)
- [ ] Register form includes confirm password and Log In Instead link
- [ ] Client-side validation covers required fields, valid email, and password match
- [ ] Register success routes to /course
- [ ] AuthHydrator runs before initial route render

## Verification

```bash
pnpm -C projects/anglo/apps/pwa typecheck
```

## Success Criteria

- Login and registration call API and store tokens
- Session hydrates on refresh using /me

---

# ============================================================
# AGENT_16_UI_GAMIFICATION_PROGRESS.md
# ============================================================

# Task: Gamification and Progress UI

**Model:** sonnet
**Task ID:** ui_016
**Modifies:** 1 file
**Creates:** 8 files
**Depends On:** AGENT_15

## Create File: projects/anglo/apps/pwa/src/stores/progressStore.ts

```typescript
import { create } from 'zustand';
import type { UserProgress } from '@duolingoru/lesson-engine';

const createDefaultProgress = (): UserProgress => ({
  userId: 'local-user',
  totalXp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastActivityDate: Date.now(),
  completedLessons: [],
  lessonProgress: {},
  wordStrengths: {},
  achievements: [],
});

type State = {
  progress: UserProgress;
  addXp: (amount: number) => void;
  setStreak: (days: number) => void;
};

export const useProgressStore = create<State>((set, get) => ({
  progress: createDefaultProgress(),
  addXp: (amount) =>
    set({ progress: { ...get().progress, totalXp: get().progress.totalXp + amount } }),
  setStreak: (days) =>
    set({ progress: { ...get().progress, streak: days } }),
}));
```

## Create Gamification Components

- projects/anglo/apps/pwa/src/components/gamification/StreakBar.tsx
- projects/anglo/apps/pwa/src/components/gamification/XpBar.tsx
- projects/anglo/apps/pwa/src/components/gamification/Achievements.tsx
- projects/anglo/apps/pwa/src/components/gamification/DailyChallenge.tsx
- projects/anglo/apps/pwa/src/components/gamification/Leaderboard.tsx

Example (XpBar.tsx):

```typescript
import React from 'react';
import ProgressBar from '../ui/ProgressBar';

export default function XpBar({ xp }: { xp: number }) {
  const nextLevel = Math.floor(xp / 100 + 1) * 100;
  const progress = Math.round(((xp % 100) / 100) * 100);
  return (
    <div>
      <div className="text-sm">XP: {xp} / {nextLevel}</div>
      <ProgressBar value={progress} />
    </div>
  );
}
```

### projects/anglo/apps/pwa/src/components/gamification/StreakBar.tsx
```typescript
import React from 'react';

export default function StreakBar({ streak }: { streak: number }) {
  return <div className="text-sm">Streak: {streak} days</div>;
}
```

### projects/anglo/apps/pwa/src/components/gamification/Achievements.tsx
```typescript
import React from 'react';
import type { Achievement } from '@duolingoru/lesson-engine';

export default function Achievements({ achievements }: { achievements: Achievement[] }) {
  if (achievements.length === 0) {
    return <div className="text-sm text-gray-600">No achievements yet</div>;
  }
  return (
    <ul className="text-sm">
      {achievements.map((a) => (
        <li key={a.id}>{a.title}</li>
      ))}
    </ul>
  );
}
```

### projects/anglo/apps/pwa/src/components/gamification/DailyChallenge.tsx
```typescript
import React from 'react';

export default function DailyChallenge() {
  return (
    <div className="text-sm">
      Daily challenge: complete 1 lesson
    </div>
  );
}
```

### projects/anglo/apps/pwa/src/components/gamification/Leaderboard.tsx
```typescript
import React from 'react';

const sample = [
  { rank: 1, name: 'You', xp: 120 },
  { rank: 2, name: 'Alex', xp: 110 },
];

export default function Leaderboard() {
  return (
    <div className="text-sm">
      {sample.map((row) => (
        <div key={row.rank} className="flex justify-between">
          <span>#{row.rank} {row.name}</span>
          <span>{row.xp} XP</span>
        </div>
      ))}
    </div>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/pages/Leaderboard.tsx

Replace with:

```typescript
import React from 'react';
import Card from '../components/ui/Card';
import Leaderboard from '../components/gamification/Leaderboard';

export default function LeaderboardPage() {
  return (
    <Card>
      <h1 className="text-lg font-semibold">Leaderboard</h1>
      <Leaderboard />
    </Card>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/pages/Progress.tsx

Replace with:

```typescript
import React from 'react';
import Card from '../components/ui/Card';
import XpBar from '../components/gamification/XpBar';
import StreakBar from '../components/gamification/StreakBar';
import Achievements from '../components/gamification/Achievements';
import DailyChallenge from '../components/gamification/DailyChallenge';
import { useProgressStore } from '../stores/progressStore';

export default function ProgressPage() {
  const { progress } = useProgressStore();

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-lg font-semibold">Progress</h1>
        <XpBar xp={progress.totalXp} />
        <StreakBar streak={progress.streak} />
      </Card>
      <Card>
        <Achievements achievements={progress.achievements} />
      </Card>
      <Card>
        <DailyChallenge />
      </Card>
    </div>
  );
}
```

## Verification

```bash
pnpm -C projects/anglo/apps/pwa typecheck
```

## Success Criteria

- Progress and gamification widgets render

---

# ============================================================
# AGENT_16B_UI_CORE_LOOP_PERSISTENCE.md
# ============================================================

# Task: Core Loop Coherence (Course Map, Lesson Completion, Persistence)

**Model:** sonnet
**Task ID:** ui_016b
**Modifies:** 8 files
**Creates:** 1 file
**Depends On:** AGENT_16, AGENT_14B

## Create File: projects/anglo/apps/pwa/src/lib/progress.ts

```typescript
import type { UserProgress } from '@duolingoru/lesson-engine';
import { apiFetch } from './api';

type ProgressResponse = {
  progress?: Partial<UserProgress>;
};

const DEFAULT_PROGRESS: UserProgress = {
  userId: 'local-user',
  totalXp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastActivityDate: 0,
  completedLessons: [],
  lessonProgress: {},
  wordStrengths: {},
  achievements: [],
};

function mergeProgress(input?: Partial<UserProgress>): UserProgress {
  if (!input) return DEFAULT_PROGRESS;
  return {
    ...DEFAULT_PROGRESS,
    ...input,
    completedLessons: input.completedLessons ?? DEFAULT_PROGRESS.completedLessons,
    lessonProgress: input.lessonProgress ?? DEFAULT_PROGRESS.lessonProgress,
    wordStrengths: input.wordStrengths ?? DEFAULT_PROGRESS.wordStrengths,
    achievements: input.achievements ?? DEFAULT_PROGRESS.achievements,
  };
}

export async function fetchProgress(): Promise<UserProgress | null> {
  try {
    const res = await apiFetch('/me/progress');
    if (!res.ok) return null;
    const data = (await res.json()) as ProgressResponse;
    return mergeProgress(data.progress);
  } catch (err) {
    return null;
  }
}

export async function completeLesson(
  lessonId: string,
  xpEarned: number
): Promise<UserProgress | null> {
  try {
    const res = await apiFetch('/me/progress/lesson-complete', {
      method: 'POST',
      body: JSON.stringify({ lessonId, xpEarned }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ProgressResponse;
    return mergeProgress(data.progress);
  } catch (err) {
    return null;
  }
}
```

## Modify File: projects/anglo/apps/pwa/src/stores/progressStore.ts

Replace with:

```typescript
import { create } from 'zustand';
import type { UserProgress } from '@duolingoru/lesson-engine';
import { completeLesson, fetchProgress } from '../lib/progress';

const createDefaultProgress = (): UserProgress => ({
  userId: 'local-user',
  totalXp: 0,
  level: 1,
  streak: 0,
  longestStreak: 0,
  lastActivityDate: 0,
  completedLessons: [],
  lessonProgress: {},
  wordStrengths: {},
  achievements: [],
});

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function dayNumber(timestamp: number): number {
  const date = new Date(timestamp);
  return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY);
}

function applyLocalCompletion(
  progress: UserProgress,
  lessonId: string,
  xpEarned: number
): UserProgress {
  const now = Date.now();
  const nextCompleted = progress.completedLessons.includes(lessonId)
    ? progress.completedLessons
    : [...progress.completedLessons, lessonId];

  let nextStreak = progress.streak;
  if (!progress.lastActivityDate) {
    nextStreak = 1;
  } else {
    const diff = dayNumber(now) - dayNumber(progress.lastActivityDate);
    if (diff === 1) nextStreak = progress.streak + 1;
    if (diff > 1) nextStreak = 1;
  }

  const lessonProgress = {
    ...progress.lessonProgress,
    [lessonId]: {
      lessonId,
      completedCount: (progress.lessonProgress[lessonId]?.completedCount ?? 0) + 1,
      bestScore: Math.max(progress.lessonProgress[lessonId]?.bestScore ?? 0, 100),
      lastCompletedAt: now,
      masteryLevel: 'learning',
    },
  };

  return {
    ...progress,
    completedLessons: nextCompleted,
    totalXp: progress.totalXp + xpEarned,
    streak: nextStreak,
    longestStreak: Math.max(progress.longestStreak, nextStreak),
    lastActivityDate: now,
    lessonProgress,
  };
}

type State = {
  progress: UserProgress;
  status: 'idle' | 'loading' | 'ready';
  hydrate: () => Promise<void>;
  applyLessonCompletion: (lessonId: string, xpEarned: number) => Promise<void>;
};

export const useProgressStore = create<State>((set, get) => ({
  progress: createDefaultProgress(),
  status: 'idle',
  hydrate: async () => {
    if (get().status !== 'idle') return;
    set({ status: 'loading' });
    const remote = await fetchProgress();
    if (remote) {
      set({ progress: remote, status: 'ready' });
      return;
    }
    set({ status: 'ready' });
  },
  applyLessonCompletion: async (lessonId, xpEarned) => {
    const remote = await completeLesson(lessonId, xpEarned);
    if (remote) {
      set({ progress: remote });
      return;
    }
    set({ progress: applyLocalCompletion(get().progress, lessonId, xpEarned) });
  },
}));
```

## Modify File: projects/anglo/apps/pwa/src/data/sample-course.ts

Replace with:

```typescript
import type { Course } from '@duolingoru/lesson-engine';

export const SAMPLE_COURSE: Course = {
  id: 'ru-en',
  name: 'English for Russian speakers',
  fromLang: 'ru',
  toLang: 'en',
  levels: ['a1', 'a2', 'b1'],
  units: [
    {
      id: 'a1_unit_01',
      courseId: 'ru-en',
      level: 'a1',
      title: 'Unit 1',
      description: 'Basics',
      order: 1,
      estimatedMinutes: 10,
      lessons: [
        {
          id: 'a1_u1_l1',
          unitId: 'a1_unit_01',
          title: 'Lesson 1: Greetings',
          order: 1,
          exercises: [
            {
              id: 'a1_u1_l1_ex1',
              kind: 'translate_tap',
              prompt: { text: 'Privet' },
              choices: ['Hello', 'Bye', 'Thanks'],
              correct: 'Hello',
              difficulty: 1,
            },
            {
              id: 'a1_u1_l1_ex2',
              kind: 'translate_type',
              prompt: { text: 'Spasibo' },
              correct: ['Thanks', 'Thank you'],
              difficulty: 1,
            },
          ],
        },
        {
          id: 'a1_u1_l2',
          unitId: 'a1_unit_01',
          title: 'Lesson 2: Basic Verbs',
          order: 2,
          exercises: [
            {
              id: 'a1_u1_l2_ex1',
              kind: 'translate_tap',
              prompt: { text: 'Ya idu' },
              choices: ['I', 'go', 'am', 'walk'],
              correct: 'I go',
              difficulty: 1,
            },
            {
              id: 'a1_u1_l2_ex2',
              kind: 'translate_type',
              prompt: { text: 'On pyet vodu' },
              correct: 'He drinks water',
              difficulty: 1,
            },
          ],
        },
        {
          id: 'a1_u1_l3',
          unitId: 'a1_unit_01',
          title: 'Lesson 3: Family',
          order: 3,
          exercises: [
            {
              id: 'a1_u1_l3_ex1',
              kind: 'translate_tap',
              prompt: { text: 'Moya mama' },
              choices: ['My', 'mother', 'father', 'is'],
              correct: 'My mother',
              difficulty: 1,
            },
            {
              id: 'a1_u1_l3_ex2',
              kind: 'translate_type',
              prompt: { text: 'Eto moi brat' },
              correct: 'This is my brother',
              difficulty: 1,
            },
          ],
        },
        {
          id: 'a1_u1_l4',
          unitId: 'a1_unit_01',
          title: 'Lesson 4: Common Phrases',
          order: 4,
          exercises: [
            {
              id: 'a1_u1_l4_ex1',
              kind: 'translate_tap',
              prompt: { text: 'Kak dela' },
              choices: ['How', 'are', 'you', 'today'],
              correct: 'How are you',
              difficulty: 1,
            },
            {
              id: 'a1_u1_l4_ex2',
              kind: 'translate_type',
              prompt: { text: 'Ochen horosho' },
              correct: 'Very well',
              difficulty: 1,
            },
          ],
        },
        {
          id: 'a1_u1_l5',
          unitId: 'a1_unit_01',
          title: 'Lesson 5: Travel',
          order: 5,
          exercises: [
            {
              id: 'a1_u1_l5_ex1',
              kind: 'translate_tap',
              prompt: { text: 'Ya v gorode' },
              choices: ['I', 'am', 'in', 'the', 'city'],
              correct: 'I am in the city',
              difficulty: 1,
            },
            {
              id: 'a1_u1_l5_ex2',
              kind: 'translate_type',
              prompt: { text: 'Gde vokzal' },
              correct: 'Where is the station',
              difficulty: 1,
            },
          ],
        },
      ],
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
```

## Modify File: projects/anglo/apps/pwa/src/pages/CourseOverview.tsx

Replace with:

```typescript
import React, { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SAMPLE_COURSE } from '../data/sample-course';
import { useProgressStore } from '../stores/progressStore';

export default function CourseOverviewPage() {
  const unit = SAMPLE_COURSE.units[0];
  const { progress, status, hydrate } = useProgressStore();

  useEffect(() => {
    if (status === 'idle') {
      hydrate();
    }
  }, [status, hydrate]);

  const completed = new Set(progress.completedLessons);
  const completedCount = unit.lessons.filter((lesson) => completed.has(lesson.id)).length;

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-lg font-semibold">Course Overview</h1>
        <p className="text-sm text-gray-600">{SAMPLE_COURSE.name}</p>
        <div className="mt-2 text-sm text-gray-600">
          XP: {progress.totalXp} | Streak: {progress.streak} days
        </div>
      </Card>
      <Card>
        <h2 className="font-medium">{unit.title}</h2>
        <p className="text-sm text-gray-600">{unit.description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {completedCount} / {unit.lessons.length} lessons completed
        </p>
        <div className="mt-4 space-y-2">
          {unit.lessons.map((lesson, index) => {
            const isCompleted = completed.has(lesson.id);
            const isUnlocked = index === 0 || completed.has(unit.lessons[index - 1].id);
            return (
              <div key={lesson.id} className="flex items-center justify-between border rounded px-3 py-2">
                <div>
                  <div className="text-sm font-medium">{lesson.title}</div>
                  <div className="text-xs text-gray-500">
                    {isCompleted ? 'Completed' : isUnlocked ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
                {isUnlocked ? (
                  <Link to="/lesson/$lessonId" params={{ lessonId: lesson.id }}>
                    <Button>{isCompleted ? 'Review' : 'Start'}</Button>
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400">Complete previous lesson</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/pages/Lesson.tsx

Replace with:

```typescript
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { SAMPLE_COURSE } from '../data/sample-course';
import ExerciseRenderer from '../components/ExerciseRenderer';
import {
  createSession,
  getCurrentExercise,
  submitAnswer,
  isSessionComplete,
  getSessionSummary,
  gradeAnswer,
  gradeMatchPairs,
  DEFAULT_SESSION_CONFIG,
} from '@duolingoru/lesson-engine';
import type { GradeResult, MatchPair, Session } from '@duolingoru/lesson-engine';
import {
  fetchPolicyConfig,
  getCachedPolicyConfig,
  policyToSessionConfig,
} from '../lib/policy';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';

function findLesson(lessonId: string) {
  for (const unit of SAMPLE_COURSE.units) {
    const lesson = unit.lessons.find((item) => item.id === lessonId);
    if (lesson) return { unit, lesson };
  }
  return null;
}

export default function LessonPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams({ from: '/lesson/$lessonId' });
  const found = findLesson(lessonId);
  const userId = useAuthStore((state) => state.user?.id ?? 'local-user');
  const applyLessonCompletion = useProgressStore((state) => state.applyLessonCompletion);

  if (!found) {
    return (
      <Card>
        <h1 className="text-lg font-semibold">Lesson not found</h1>
      </Card>
    );
  }

  const { lesson } = found;

  const [session, setSession] = useState<Session>(() => {
    const cachedPolicy = getCachedPolicyConfig();
    const config = cachedPolicy
      ? policyToSessionConfig(cachedPolicy)
      : DEFAULT_SESSION_CONFIG;
    return createSession(lesson.id, userId, lesson.exercises, config);
  });
  const [pendingSession, setPendingSession] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState<GradeResult | null>(null);

  useEffect(() => {
    let active = true;
    fetchPolicyConfig()
      .then((policy) => {
        if (!active) return;
        const config = policyToSessionConfig(policy);
        setSession(createSession(lesson.id, userId, lesson.exercises, config));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [lesson.id, lesson.exercises, userId]);

  const onSubmit = (answer: string | MatchPair[]) => {
    const current = getCurrentExercise(session);
    if (!current) return;

    let grade: GradeResult;
    let storedAnswer: string | MatchPair[];

    if (current.kind === 'match_pairs') {
      if (!Array.isArray(answer)) return;
      const matchResult = gradeMatchPairs(answer, current.correct);
      const isCorrect = matchResult.correct === matchResult.total;
      grade = {
        type: isCorrect ? 'correct' : 'incorrect',
        isCorrect,
        feedback: isCorrect
          ? 'Great job!'
          : `Matched ${matchResult.correct} of ${matchResult.total}`,
      };
      storedAnswer = answer;
    } else {
      const textAnswer = String(answer);
      grade = gradeAnswer(current, textAnswer);
      storedAnswer = textAnswer;
    }

    const result = submitAnswer(session, storedAnswer, grade);
    setPendingSession(result.session);
    setFeedback(grade);
  };

  const onContinue = () => {
    if (!pendingSession) return;
    setSession(pendingSession);
    setPendingSession(null);
    setFeedback(null);
  };

  if (isSessionComplete(session)) {
    const summary = getSessionSummary(session);
    const onFinish = async () => {
      await applyLessonCompletion(lesson.id, summary.xpEarned);
      navigate({ to: '/course' });
    };
    return (
      <Card>
        <h1 className="text-lg font-semibold">Lesson Complete</h1>
        <p className="text-sm text-gray-600">XP: {summary.xpEarned}</p>
        <p className="text-sm text-gray-600">Accuracy: {summary.accuracy}%</p>
        <div className="mt-4">
          <Button onClick={onFinish}>Continue</Button>
        </div>
      </Card>
    );
  }

  const current = getCurrentExercise(session);
  const totalExercises = session.exercises.length;
  const currentNumber = Math.min(session.currentIndex + 1, totalExercises);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{lesson.title}</h1>
        <div className="text-xs text-gray-500">
          {currentNumber} / {totalExercises}
        </div>
      </div>
      {current && (
        <ExerciseRenderer exercise={current} onSubmit={onSubmit} />
      )}
      {feedback && (
        <div className="mt-3 rounded border bg-gray-50 p-3 text-sm">
          <div className="font-medium">
            {feedback.isCorrect ? 'Correct' : 'Not quite'}
          </div>
          {feedback.correctAnswer && (
            <div className="text-gray-600">Correct: {feedback.correctAnswer}</div>
          )}
          <div className="text-gray-600">{feedback.feedback}</div>
        </div>
      )}
      {feedback && (
        <div className="mt-4">
          <Button onClick={onContinue}>Continue</Button>
        </div>
      )}
    </Card>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/components/ExerciseRenderer.tsx

Replace with:

```typescript
import React from 'react';
import type { Exercise } from '@duolingoru/lesson-engine';
import TranslateTap from './exercises/TranslateTap';
import TranslateType from './exercises/TranslateType';
import Listen from './exercises/Listen';
import FillBlank from './exercises/FillBlank';
import MatchPairs from './exercises/MatchPairs';
import SelectImage from './exercises/SelectImage';
import Speak from './exercises/Speak';

export default function ExerciseRenderer({
  exercise,
  onSubmit,
}: {
  exercise: Exercise;
  onSubmit: (answer: string | [string, string][]) => void;
}) {
  switch (exercise.kind) {
    case 'translate_tap':
      return <TranslateTap exercise={exercise} onSubmit={onSubmit} />;
    case 'translate_type':
      return <TranslateType exercise={exercise} onSubmit={onSubmit} />;
    case 'listen_tap':
    case 'listen_type':
      return <Listen exercise={exercise} onSubmit={onSubmit} />;
    case 'fill_blank':
      return <FillBlank exercise={exercise} onSubmit={onSubmit} />;
    case 'match_pairs':
      return <MatchPairs exercise={exercise} onSubmit={onSubmit} />;
    case 'select_image':
      return <SelectImage exercise={exercise} onSubmit={onSubmit} />;
    default:
      return <Speak exercise={exercise} onSubmit={onSubmit} />;
  }
}
```

## Modify File: projects/anglo/apps/pwa/src/components/exercises/TranslateTap.tsx

Replace with:

```typescript
import React, { useState } from 'react';
import type { Exercise } from '@duolingoru/lesson-engine';
import Button from '../ui/Button';

export default function TranslateTap({
  exercise,
  onSubmit,
}: {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
}) {
  const choices = exercise.choices ?? [];
  const [selected, setSelected] = useState<number[]>([]);

  const onTap = (index: number) => {
    if (selected.includes(index)) return;
    setSelected((prev) => [...prev, index]);
  };

  const onClear = () => setSelected([]);
  const answer = selected.map((index) => choices[index]).join(' ');

  return (
    <div className="space-y-3">
      <div className="text-sm">{exercise.prompt.text}</div>
      <div className="min-h-[40px] rounded border px-3 py-2 text-sm">
        {answer || 'Tap words to build the answer'}
      </div>
      <div className="flex flex-wrap gap-2">
        {choices.map((word, index) => (
          <button
            key={`${word}-${index}`}
            type="button"
            onClick={() => onTap(index)}
            className={`rounded border px-2 py-1 text-sm ${
              selected.includes(index) ? 'bg-gray-200 text-gray-500' : 'bg-white'
            }`}
          >
            {word}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onSubmit(answer)} disabled={answer.length === 0}>
          Check
        </Button>
        <Button variant="secondary" onClick={onClear} disabled={answer.length === 0}>
          Clear
        </Button>
      </div>
    </div>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/components/exercises/TranslateType.tsx

Replace with:

```typescript
import React, { useState } from 'react';
import type { Exercise } from '@duolingoru/lesson-engine';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function TranslateType({
  exercise,
  onSubmit,
}: {
  exercise: Exercise;
  onSubmit: (answer: string) => void;
}) {
  const [value, setValue] = useState('');
  const trimmed = value.trim();

  return (
    <div className="space-y-2">
      <div className="text-sm">{exercise.prompt.text}</div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button onClick={() => onSubmit(trimmed)} disabled={trimmed.length === 0}>
        Check
      </Button>
    </div>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/pages/Progress.tsx

Replace with:

```typescript
import React, { useEffect } from 'react';
import Card from '../components/ui/Card';
import XpBar from '../components/gamification/XpBar';
import StreakBar from '../components/gamification/StreakBar';
import Achievements from '../components/gamification/Achievements';
import DailyChallenge from '../components/gamification/DailyChallenge';
import { useProgressStore } from '../stores/progressStore';

export default function ProgressPage() {
  const { progress, status, hydrate } = useProgressStore();

  useEffect(() => {
    if (status === 'idle') {
      hydrate();
    }
  }, [status, hydrate]);

  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-lg font-semibold">Progress</h1>
        <XpBar xp={progress.totalXp} />
        <StreakBar streak={progress.streak} />
      </Card>
      <Card>
        <Achievements achievements={progress.achievements} />
      </Card>
      <Card>
        <DailyChallenge />
      </Card>
    </div>
  );
}
```

## Checklist

- [ ] Progress store hydrates on Course/Progress pages (no stale "idle" state)
- [ ] Progress API client uses /me/progress endpoints (with fallback)
- [ ] Course overview uses completedLessons for unlocks and progress counts
- [ ] Course overview surfaces XP/streak from progress
- [ ] Lesson completion triggers applyLessonCompletion and redirects to /course
- [ ] UI handles empty progress (no crashes on first load)
- [ ] Translate tap/type use check → feedback → continue loop

## Verification

```bash
pnpm -C projects/anglo/apps/pwa typecheck
```

## Success Criteria

- Course overview shows multiple lessons with locked/unlocked states
- Lesson completion persists and unlocks the next lesson
- XP and streak are visible and persist across reload

---

# ============================================================
# AGENT_17_UI_SETTINGS_SOCIAL_SUPPORT.md
# ============================================================

# Task: Settings, Social, Support UI

**Model:** sonnet
**Task ID:** ui_017
**Modifies:** 3 files
**Creates:** 7 files
**Depends On:** AGENT_16

## Modify File: projects/anglo/apps/pwa/src/pages/Settings.tsx

Replace with:

```typescript
import React from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <h1 className="text-lg font-semibold">Settings</h1>
        <div className="mt-3 space-y-2">
          <Input placeholder="Daily goal minutes" data-testid="daily-goal" />
          <label className="text-sm flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            Notifications enabled
          </label>
          <Input placeholder="Interface language" data-testid="language-pref" />
          <Input placeholder="Account email" data-testid="account-email" />
          <Button>Save</Button>
        </div>
      </Card>
    </div>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/pages/Social.tsx

Replace with:

```typescript
import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function SocialPage() {
  return (
    <Card>
      <h1 className="text-lg font-semibold">Friends</h1>
      <p className="text-sm text-gray-600">No friends yet</p>
      <div className="mt-3 space-y-2">
        <Button>Add Friend</Button>
        <Button variant="secondary">Share Progress</Button>
      </div>
    </Card>
  );
}
```

## Modify File: projects/anglo/apps/pwa/src/pages/Support.tsx

Replace with:

```typescript
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SupportPage() {
  const [message, setMessage] = useState('');
  return (
    <Card>
      <h1 className="text-lg font-semibold">Feedback</h1>
      <div className="mt-3 space-y-2">
        <select className="border rounded px-3 py-2 text-sm w-full">
          <option>Bug report</option>
          <option>Feedback</option>
        </select>
        <Input
          placeholder="Describe your issue"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button>Submit</Button>
      </div>
    </Card>
  );
}
```

## Verification

```bash
pnpm -C projects/anglo/apps/pwa typecheck
```

## Success Criteria

- Settings, Social, Support pages render

---

# ============================================================
# AGENT_18_OFFLINE.md
# ============================================================

# Task: Offline Packs, Entitlements Gate, Sync Queue, Zombie Mode UI

**Model:** sonnet
**Task ID:** offline_018
**Modifies:** 2 files
**Creates:** 8 files
**Depends On:** AGENT_17

**Note:** Phase 4 owns `/policy/config`, `/entitlements/me`, `/packs/manifest`, and
`/sync/reconcile`. Phase 3 must fall back to local defaults/`public/packs/manifest.json`
when these endpoints are missing.
**Note:** Offline queue items with type `progress` use payload `{ lessonId: string; xpEarned: number }`
to match `/me/progress/lesson-complete` and `/sync/reconcile`.

## Modify File: projects/anglo/apps/pwa/vite.config.ts

Add Workbox cache for /packs:

Keep the existing `server.proxy` entries so relative API calls continue to route
to `VITE_API_BASE_URL` during local dev.

```typescript
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
  runtimeCaching: [
    {
      urlPattern: /\/packs\//,
      handler: 'CacheFirst',
      options: { cacheName: 'content-packs' },
    },
    {
      urlPattern: /^https:\/\/api\./i,
      handler: 'NetworkFirst',
      options: { cacheName: 'api-cache', expiration: { maxEntries: 100 } },
    },
  ],
},
```

## Modify File: projects/anglo/apps/pwa/src/pages/Offline.tsx

Replace with:

```typescript
import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { apiFetch } from '../lib/api';
import { downloadPack, fetchPackManifest, listPacks } from '../lib/packs';
import { enqueue, drain } from '../lib/offline-queue';
import { fetchEntitlements, getCachedEntitlements } from '../lib/entitlements';
import type { CoursePackMeta, EntitlementsResponse } from '@duolingoru/types';

const SAMPLE_PACK_ID = 'ru-en-a1-unit-01';

export default function OfflinePage() {
  const onlineStatus = useOnlineStatus();
  const [packs, setPacks] = useState<Awaited<ReturnType<typeof listPacks>>>([]);
  const [manifest, setManifest] = useState<CoursePackMeta[]>([]);
  const [entitlements, setEntitlements] = useState<EntitlementsResponse | null>(() =>
    getCachedEntitlements()
  );

  useEffect(() => {
    listPacks().then(setPacks);
    fetchPackManifest().then(setManifest).catch(() => {});
    fetchEntitlements().then(setEntitlements).catch(() => {});
  }, []);

  const isPremium = entitlements?.isPremium ?? false;
  const availablePacks = isPremium
    ? manifest
    : manifest.filter((pack) => pack.packId === SAMPLE_PACK_ID);
  const statusLabel = onlineStatus.status === 'zombie' ? 'zombie' : onlineStatus.status;
  const reasonText =
    onlineStatus.reason === 'no-internet'
      ? 'No internet'
      : onlineStatus.reason === 'service-outage'
      ? 'Service outage'
      : '';

  return (
    <Card>
      <h1 className="text-lg font-semibold">Offline</h1>
      <p className="text-sm text-gray-600">
        Status: {statusLabel}
        {reasonText ? ` (${reasonText})` : ''}
      </p>
      {onlineStatus.status === 'zombie' && (
        <p className="mt-1 text-sm text-amber-600">Zombie Mode: backend unavailable</p>
      )}
      {!isPremium && (
        <p className="mt-2 text-sm text-gray-600">
          Max required for full downloads. Sample pack available.
        </p>
      )}
      <div className="mt-3 space-y-2">
        {availablePacks.map((pack) => (
          <Button
            key={`${pack.packId}@${pack.version}`}
            onClick={async () => {
              await downloadPack(pack);
              setPacks(await listPacks());
            }}
          >
            Download {pack.packId} ({pack.version})
          </Button>
        ))}
        {availablePacks.length === 0 && (
          <p className="text-sm text-gray-600">No packs available</p>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          variant="secondary"
          onClick={() => enqueue('progress', { lessonId: 'a1_u1_l1', xpEarned: 10 })}
        >
          Queue Progress
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            drain(async (items) => {
              const res = await apiFetch('/sync/reconcile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
              });
              if (!res.ok) {
                return {
                  acked: [],
                  failed: items.map((item) => ({ id: item.id, reason: 'sync failed' })),
                };
              }
              return (await res.json()) as {
                acked: string[];
                failed: { id: string; reason: string }[];
              };
            })
          }
        >
          Sync Now
        </Button>
      </div>
      <div className="mt-3 text-sm">
        Packs: {packs.map((pack) => `${pack.packId}@${pack.version}`).join(', ') || 'none'}
      </div>
      {packs.length > 0 && (
        <div className="mt-2 text-sm">
          <Link to="/lesson/$lessonId" params={{ lessonId: 'a1_u1_l1' }}>
            Open Offline Lesson
          </Link>
        </div>
      )}
    </Card>
  );
}
```

## Create File: projects/anglo/apps/pwa/src/hooks/useOnlineStatus.ts

```typescript
import { useEffect, useState } from 'react';
import { getApiUrl } from '../lib/api';

type OnlineStatus = {
  status: 'online' | 'offline' | 'zombie';
  reason: 'no-internet' | 'service-outage' | null;
};

const HEALTH_URL = '/health';

export function useOnlineStatus(pingIntervalMs: number = 15000): OnlineStatus {
  const [navigatorOnline, setNavigatorOnline] = useState<boolean>(navigator.onLine);
  const [backendOk, setBackendOk] = useState<boolean>(true);

  useEffect(() => {
    const on = () => setNavigatorOnline(true);
    const off = () => setNavigatorOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    async function ping() {
      if (!navigator.onLine) {
        if (active) setBackendOk(false);
        return;
      }
      try {
        const res = await fetch(getApiUrl(HEALTH_URL), { cache: 'no-store' });
        if (active) setBackendOk(res.ok);
      } catch {
        if (active) setBackendOk(false);
      }
    }

    ping();
    timer = window.setInterval(ping, pingIntervalMs);
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, [navigatorOnline, pingIntervalMs]);

  if (!navigatorOnline) {
    return { status: 'offline', reason: 'no-internet' };
  }
  if (!backendOk) {
    return { status: 'zombie', reason: 'service-outage' };
  }
  return { status: 'online', reason: null };
}
```

## Create File: projects/anglo/apps/pwa/src/lib/db.ts

```typescript
import Dexie, { Table } from 'dexie';
import type { SyncItem } from '@duolingoru/types';

export type QueueItem = SyncItem;
export type PackItem = {
  id: string;
  packId: string;
  version: string;
  checksum: string;
  data: unknown;
};

class AppDB extends Dexie {
  queue!: Table<QueueItem>;
  packs!: Table<PackItem>;

  constructor() {
    super('duolingoru');
    this.version(1).stores({
      queue: 'id,type',
      packs: 'id,packId,version',
    });
  }
}

export const db = new AppDB();
```

## Create File: projects/anglo/apps/pwa/src/lib/packs.ts

```typescript
import type { CoursePack, CoursePackMeta } from '@duolingoru/types';
import { apiFetch, getApiUrl } from './api';
import { db, type PackItem } from './db';

const FALLBACK_MANIFEST_URL = '/packs/manifest.json';

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function checksumForContent(content: unknown): Promise<string> {
  const payload = JSON.stringify(content);
  const bytes = new TextEncoder().encode(payload);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return bufferToHex(digest);
}

async function fetchFallbackManifest(): Promise<CoursePackMeta[]> {
  const res = await fetch(FALLBACK_MANIFEST_URL);
  if (!res.ok) return [];
  const data = (await res.json()) as { packs: CoursePackMeta[] };
  return data.packs;
}

export async function fetchPackManifest(): Promise<CoursePackMeta[]> {
  try {
    const res = await apiFetch('/packs/manifest');
    if (!res.ok) throw new Error('pack manifest fetch failed');
    const data = (await res.json()) as { packs: CoursePackMeta[] };
    return data.packs;
  } catch {
    return fetchFallbackManifest();
  }
}

export async function downloadPack(meta: CoursePackMeta) {
  const packUrl = meta.url.startsWith('http') ? meta.url : getApiUrl(meta.url);
  const res = await fetch(packUrl);
  if (!res.ok) throw new Error('pack download failed');
  const pack = (await res.json()) as CoursePack;
  const checksum = await checksumForContent(pack.content);
  if (checksum !== meta.checksum || checksum !== pack.meta.checksum) {
    throw new Error('pack checksum mismatch');
  }
  const id = `${meta.packId}@${meta.version}`;
  await db.packs.put({
    id,
    packId: meta.packId,
    version: meta.version,
    checksum: meta.checksum,
    data: pack,
  });
  await db.packs
    .where('packId')
    .equals(meta.packId)
    .and((item) => item.version !== meta.version)
    .delete();
}

export async function listPacks(): Promise<PackItem[]> {
  return db.packs.toArray();
}
```

## Create File: projects/anglo/apps/pwa/src/lib/entitlements.ts

```typescript
import type { EntitlementsResponse } from '@duolingoru/types';
import { apiFetch } from './api';

const STORAGE_KEY = 'entitlements';
const FALLBACK_ENTITLEMENTS: EntitlementsResponse = {
  userId: 'anonymous',
  isPremium: false,
  features: [],
};

export function getCachedEntitlements(): EntitlementsResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EntitlementsResponse;
  } catch {
    return null;
  }
}

export async function fetchEntitlements(): Promise<EntitlementsResponse> {
  const cached = getCachedEntitlements();
  try {
    const res = await apiFetch('/entitlements/me');
    if (res.status === 401 || res.status === 403) {
      return cached ?? FALLBACK_ENTITLEMENTS;
    }
    if (!res.ok) throw new Error('entitlements fetch failed');
    const data = (await res.json()) as EntitlementsResponse;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch {
    return cached ?? FALLBACK_ENTITLEMENTS;
  }
}
```

## Create File: projects/anglo/apps/pwa/src/lib/offline-queue.ts

```typescript
import { db } from './db';

export async function enqueue(type: string, payload: Record<string, unknown>) {
  const id = crypto.randomUUID();
  const occurredAt = new Date().toISOString();
  await db.queue.put({ id, type, payload, occurredAt });
  return id;
}

export async function drain(
  processor: (
    items: { id: string; type: string; payload: Record<string, unknown>; occurredAt: string }[]
  ) => Promise<{ acked: string[]; failed: { id: string; reason: string }[] }>
) {
  const items = await db.queue.toArray();
  if (items.length === 0) return { acked: [], failed: [] };
  const result = await processor(items);
  for (const id of result.acked) {
    await db.queue.delete(id);
  }
  return result;
}
```

## Directory Structure (packs)

```bash
mkdir -p projects/anglo/apps/pwa/public/packs/ru-en-a1-unit-01
```

## Create File: projects/anglo/apps/pwa/public/packs/ru-en-a1-unit-01/v1

**NOTE:** If the pack content changes, recompute the checksum using:
```bash
node -e "const crypto=require('crypto');const content={courseId:'ru-en',level:'a1',units:[{id:'a1_unit_01',title:'Unit 1',lessons:[{id:'a1_u1_l1',unitId:'a1_unit_01',title:'Lesson 1',order:1,exercises:[{id:'ex-1',kind:'translate_tap',prompt:{text:'Hello'},choices:['Hello','Bye'],correct:'Hello',difficulty:1}]}]}]};console.log(crypto.createHash('sha256').update(JSON.stringify(content)).digest('hex'));"
```

```json
{
  "meta": {
    "packId": "ru-en-a1-unit-01",
    "version": "v1",
    "checksum": "1fc99cfb6ee397f3826721f7585b13e45ae15ec8111ef1cf1d88f9002aecf87f",
    "sizeBytes": 297,
    "url": "/packs/ru-en-a1-unit-01/v1"
  },
  "content": {
    "courseId": "ru-en",
    "level": "a1",
    "units": [
      {
        "id": "a1_unit_01",
        "title": "Unit 1",
        "lessons": [
          {
            "id": "a1_u1_l1",
            "unitId": "a1_unit_01",
            "title": "Lesson 1",
            "order": 1,
            "exercises": [
              {
                "id": "ex-1",
                "kind": "translate_tap",
                "prompt": { "text": "Hello" },
                "choices": ["Hello", "Bye"],
                "correct": "Hello",
                "difficulty": 1
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## Create File: projects/anglo/apps/pwa/public/packs/manifest.json

```json
{
  "packs": [
    {
      "packId": "ru-en-a1-unit-01",
      "version": "v1",
      "checksum": "1fc99cfb6ee397f3826721f7585b13e45ae15ec8111ef1cf1d88f9002aecf87f",
      "sizeBytes": 297,
      "url": "/packs/ru-en-a1-unit-01/v1"
    }
  ]
}
```

## Verification

```bash
pnpm -C projects/anglo/apps/pwa typecheck
pnpm -C projects/anglo/apps/pwa build
```

## Success Criteria

- Offline page renders
- Pack manifest download + checksum verification works in tests
- Sync reconcile drains only acked items
- build succeeds

---

# PHASE 3 COMPLETE CHECKLIST

- projects/anglo/apps/pwa typecheck passes
- Policy config fetched/cached and applied to session config
- Offline downloads gated by entitlements (sample pack for free tier)
- Pack downloads use manifest + checksum with versioned storage
- Online status checks /health and shows Zombie Mode on outage
- Sync uses /sync/reconcile with acked-only deletion
- Auth session hydrates via /me with refresh tokens
- Progress uses /me/progress and /me/progress/lesson-complete
- All UI pages render without runtime errors
- No TODOs or placeholder stubs remain in UI files


---

# ============================================================
# PHASE 3 v1.2.1 ADDENDUM — REQUIRED UPDATES FROM FEEDBACK
# (Applies on top of the tasks above; supersedes conflicting lines)
# ============================================================

## 1) Fix Tag Inconsistencies (Required)

After copying the enhanced feature files into `projects/anglo/apps/pwa/tests/features/**`, apply **tag-only** edits per:

- `TAG_FIXES.md`

This resolves conflicts between `projects/anglo/FEATURE_TIERING_MATRIX.md` and scenario tags for:

- `onboarding/account-upgrade.feature`
- `onboarding/placement-test.feature`
- `onboarding/account-creation.feature` (consent scenario)

> Only tier tags change. Given/When/Then step text stays identical.

---

## 2) Commitment Ladder First Session (Core)

Update onboarding tasks (AGENT_14 + AGENT_14B) so the first session follows:

**Goal selection → micro-win → streak start → reminder permission → (later) account**

### Required behavioral constraints
- **No forced account creation** in the first session.
- Reminder permission prompt happens **after** micro-win completion.
- Micro-win uses **exactly 6 exercises**, first 2 are recognition-based (select-image, translate-tap).

### Implementation mapping
- Modify `WelcomePage` / initial route:
  - If `firstLaunchCompleted !== true` → redirect to goal selection.
- Add goal selection UI (3–4 choices).
- Add micro-win lesson ID `onboarding_micro_1` and ensure it is trivially winnable.
- On completion screen:
  - start streak immediately
  - show XP + streak
  - then offer reminders

---

## 3) “Feel smart fast” measurable acceptance criteria (Required)

Add these acceptance criteria to the onboarding task definition:

- **E2E test measures time from cold start to lesson completion**
  - Must be **< 90 seconds** for the onboarding flow.
- **First 2 exercises must have >95% success rate across test users**
  - Define as: in a 20-user moderated test, ≥19/20 complete first 2 items without error.
- Micro-win lesson has **exactly 6 exercises**.

### Where to implement
- Add a Playwright E2E test **or** a Cucumber + Playwright runner that:
  - launches `/`
  - goes through goal selection + micro-win completion
  - asserts duration < 90s
- If Playwright integration is too heavy right now, add a minimal timing harness in BDD step definitions and keep the 90s assertion.

---

## 4) Content Depth and Credibility (Core)

Update any “sample course” tasks so that **even placeholder content** meets credibility thresholds:

- A1 Unit 1 contains **≥5 lessons**
- Each lesson contains **6–12 exercises**
- At least one lesson includes:
  - a listening exercise with audio reference
- At least one story/dialogue node exists in the map

> This is a core credibility requirement; avoid “demo feel.”

---

## 5) Spaced Repetition UI (Core)

Add missing Phase 3 UI tasks (AGENT_16 / AGENT_16B / new AGENT_16C if needed):

- Home screen always shows **Review** button
- Review button displays **N items due**
- Review session:
  - consumes `GET /me/review/queue` (Phase 4)
  - falls back to local queue when offline
  - counts toward streak/day goal
- Review remains available even if hearts are depleted

---

## 6) Tips/Why + Appeals (Core)

Add missing UI work (AGENT_15):

- “Why?” link at moment of error:
  - opens short grammar explanation (Russian) + example
- “Report: should be accepted” button:
  - sends appeal (online) or queues event (offline)
  - include exerciseId, lessonId, userAnswer, expectedAnswers, timestamp, device/localUserId

---

## 7) Streak Repair UX Hooks (Core)

Add Phase 3 UI hooks (AGENT_17):

- Incident banner fetched from backend: `GET /status/incidents`
- If backend reports repair eligibility:
  - show CTA “Restore streak”
  - call `POST /me/streak/repair`
- Grace + outage detection are Phase 4 rules; Phase 3 only needs UI path.

---

## 8) Not Blocking (explicit deferrals)

Mark these tasks as **POST-Phase4** (do not block Golden Path):

- Notification scheduler wiring (server-side)
- Audio fallback edge cases (missing audio, codec weirdness)
- Partial sync ack handling (fine-grained resume); basic ack deletion is enough

---

## 9) Mark @v2 tasks as FUTURE

Ensure tasks implementing these are tagged `# FUTURE` / moved to backlog:

- Global leagues / leaderboards
- Promo codes
- Email verification hard gate
- Lifetime purchase + refunds
- Theme/accessibility polish

---

# APPENDIX B — v1.3.1 Implementation Overrides (Apply on top of Appendix A)

This appendix supplies **updated drop-in code blocks** for the specific legacy implementation points
that must change to satisfy v1.3.1 psychological loop requirements.

## B.1 Update: Micro‑Win sample content (exact 6‑exercise sequence + difficulties)

Replace the `SAMPLE_COURSE` definition in `projects/anglo/apps/pwa/src/data/sample-course.ts` with:

```typescript
import type { Course } from '@duolingoru/lesson-engine';

// NOTE: This is a UI/dev fallback. Phase 4 becomes canonical via /courses/:courseId/map + content JSON.
// v1.3.1 requirement: onboarding micro-win has EXACTLY 6 exercises in the exact order below.

export const SAMPLE_COURSE: Course = {
  id: 'ru-en',
  name: 'English for Russian speakers',
  fromLang: 'ru',
  toLang: 'en',
  levels: ['a1', 'a2', 'b1'],
  units: [
    {
      id: 'a1_unit_01',
      courseId: 'ru-en',
      level: 'a1',
      title: 'Unit 1',
      description: 'Basics',
      order: 1,
      estimatedMinutes: 10,
      lessons: [
        {
          // Dedicated onboarding micro-win lesson id.
          id: 'onboarding_micro_1',
          unitId: 'a1_unit_01',
          title: 'Micro‑win: First steps',
          order: 0,
          exercises: [
            // 1) Select Image (difficulty 1)
            {
              id: 'onb_micro_ex1',
              kind: 'select_image',
              prompt: { text: 'кот' },
              // UI fallback: map these ids to bundled images.
              choices: ['cat', 'dog', 'coffee', 'book'],
              correct: 'cat',
              difficulty: 1,
            },

            // 2) Word Bank Translation (difficulty 1)
            {
              id: 'onb_micro_ex2',
              kind: 'translate_tap',
              prompt: { text: 'Привет' },
              choices: ['Hello', 'Bye', 'Thanks'],
              correct: 'Hello',
              difficulty: 1,
            },

            // 3) Match Pairs (difficulty 2)
            {
              id: 'onb_micro_ex3',
              kind: 'match_pairs',
              prompt: { text: 'Сопоставь пары' },
              // Exact type depends on lesson-engine; keep as tuple pairs.
              correct: [
                ['Hello', 'Привет'],
                ['Bye', 'Пока'],
                ['Thanks', 'Спасибо'],
              ] as const,
              difficulty: 2,
            },

            // 4) Listen and Choose (difficulty 2) — audio wedge
            {
              id: 'onb_micro_ex4',
              kind: 'listen_tap',
              prompt: { text: 'Listen' },
              // UI expects to render an <audio> from this URL.
              // Phase 4 serves /assets/audio/...; Phase 3 may bundle under public/.
              audioUrl: '/assets/audio/a1/hello.mp3',
              choices: ['Привет', 'Пока', 'Спасибо'],
              correct: 'Привет',
              difficulty: 2,
            },

            // 5) Multiple Choice Translation (difficulty 2)
            {
              id: 'onb_micro_ex5',
              kind: 'translate_tap',
              prompt: { text: 'Hello' },
              // Treat as single-choice MCQ: the renderer may accept a one-tap answer.
              choices: ['Привет', 'Пока', 'Спасибо'],
              correct: 'Привет',
              difficulty: 2,
            },

            // 6) Word Bank Translation (difficulty 2)
            {
              id: 'onb_micro_ex6',
              kind: 'translate_tap',
              prompt: { text: 'Как дела' },
              choices: ['How', 'are', 'you', 'today'],
              correct: 'How are you',
              difficulty: 2,
            },
          ],
        },
      ],
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
```

Notes:
- Exercises 1–2 are difficulty 1; exercises 3–6 are difficulty 2.
- No typing exercises exist in `onboarding_micro_1`.
- Audio exercise is position #4.

## B.2 Update: Review CTA copy (Russian, exact)

Ensure any home/course review CTA string is exactly:

```text
Повторение — N заданий
```

If using a central strings file (e.g. `projects/anglo/apps/pwa/src/lib/strings.ts`), add:

```typescript
export const STRINGS = {
  // ...existing...
  reviewCta: (n: number) => `Повторение — ${n} заданий`,
};
```

## B.3 Update: Day‑10 celebration trigger + freeze grant

When streak becomes exactly 10:
- Show the full-screen celebration spec in Phase 3 section **15.8 / 15.8a**.
- Grant **+1 streak freeze** (owned inventory), capped at 1 owned at a time.

Implementation guidance (UI-side fallback until Phase 4 persistence exists):
- Store `ownedStreakFreezes` in IndexedDB.
- After applying a lesson/review completion that increments streak, if `newStreak === 10` and `ownedStreakFreezes === 0`, set it to 1 and show the modal.

## B.4 Update: Notification prompt timing

Reminder permission prompt MUST be triggered **only after** the micro‑win completion screen appears (Phase 3 section **14.4**).
Do not request notification permission earlier in onboarding.
