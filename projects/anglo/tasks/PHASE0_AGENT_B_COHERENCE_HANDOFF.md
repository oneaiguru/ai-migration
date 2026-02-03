# PHASE 0: COHERENCE — Agent B (Monetization + Offline + Progress + Reliability + Settings + Social + Support + UI)

This doc is the handoff for Agent B’s half of `projects/anglo/apps/pwa/tests/features/**`:
- `monetization/`
- `offline/`
- `progress/`
- `reliability/`
- `settings/`
- `social/`
- `support/`
- `ui/`

Goal of Phase 0: feature files and task docs tell the same story (even if that story is "MVP prototype"), with explicit deferrals.

---

## 0) Current Status (What We Already Solved)

### Tags now exist everywhere (Agent B scope)
- File-level tier tags are the default; scenario-level tags are used only when a file mixes tiers.
- Additional quality tag used: `@stub` = implementation exists but is minimal/placeholder.

---

## 1) Credibility Must-Haves (Load-Bearing for v1.3.1)

These are required for the app to feel like a real course, not a demo.

1) **Course progress and unlocks are visible**
   - `projects/anglo/apps/pwa/tests/features/progress/course-progress.feature`
   - `projects/anglo/apps/pwa/tests/features/progress/unit-unlock.feature`

2) **Spaced repetition review exists and is always available**
   - `projects/anglo/apps/pwa/tests/features/progress/spaced-repetition.feature`

3) **Checkpoint tests signal real course structure**
   - `projects/anglo/apps/pwa/tests/features/progress/checkpoint-tests.feature`

4) **Offline fallback + progress sync + data recovery protect trust**
   - `projects/anglo/apps/pwa/tests/features/offline/progress-sync.feature`
   - `projects/anglo/apps/pwa/tests/features/reliability/offline-fallback.feature`
   - `projects/anglo/apps/pwa/tests/features/reliability/data-recovery.feature`

5) **Daily goal + notifications exist as habit scaffolding**
   - `projects/anglo/apps/pwa/tests/features/settings/daily-goal.feature`
   - `projects/anglo/apps/pwa/tests/features/settings/notifications.feature`

6) **Clear errors + explanations make learning feel real**
   - `projects/anglo/apps/pwa/tests/features/ui/error-handling-and-edge-cases.feature`
   - `projects/anglo/apps/pwa/tests/features/ui/tips-and-explanations.feature`

7) **Fair grading and appeals preserve trust**
   - `projects/anglo/apps/pwa/tests/features/support/answer-acceptance-and-appeals.feature`

---

## 2) Tiering (Core / Retention / v2)

### Core loop (credibility load-bearing)
- `projects/anglo/apps/pwa/tests/features/progress/course-progress.feature`
- `projects/anglo/apps/pwa/tests/features/progress/unit-unlock.feature`
- `projects/anglo/apps/pwa/tests/features/progress/spaced-repetition.feature`
- `projects/anglo/apps/pwa/tests/features/progress/checkpoint-tests.feature`
- `projects/anglo/apps/pwa/tests/features/offline/progress-sync.feature`
- `projects/anglo/apps/pwa/tests/features/reliability/offline-fallback.feature`
- `projects/anglo/apps/pwa/tests/features/reliability/data-recovery.feature`
- `projects/anglo/apps/pwa/tests/features/settings/daily-goal.feature`
- `projects/anglo/apps/pwa/tests/features/settings/notifications.feature`
- `projects/anglo/apps/pwa/tests/features/support/answer-acceptance-and-appeals.feature`
- `projects/anglo/apps/pwa/tests/features/ui/error-handling-and-edge-cases.feature`
- `projects/anglo/apps/pwa/tests/features/ui/tips-and-explanations.feature`

### Retention boosters (v1.1 targets, not credibility load-bearing)
- `projects/anglo/apps/pwa/tests/features/monetization/hearts-vs-energy.feature`
- `projects/anglo/apps/pwa/tests/features/offline/content-download.feature`
- `projects/anglo/apps/pwa/tests/features/offline/offline-lesson.feature`
- `projects/anglo/apps/pwa/tests/features/settings/account-settings.feature`
- `projects/anglo/apps/pwa/tests/features/settings/language-preferences.feature`
- `projects/anglo/apps/pwa/tests/features/social/add-friends.feature`
- `projects/anglo/apps/pwa/tests/features/social/share-progress.feature`
- `projects/anglo/apps/pwa/tests/features/support/bug-report-and-feedback.feature`

### Explicit v2 (nice-to-have / heavy dependencies)
- `projects/anglo/apps/pwa/tests/features/monetization/promo-codes.feature`
- `projects/anglo/apps/pwa/tests/features/social/friend-leaderboard.feature`
- `projects/anglo/apps/pwa/tests/features/ui/theme-and-accessibility.feature`
- All other advanced scenarios in offline/progress/settings/social/support/ui files are `@v2`

---

## 3) Phase 0 Decisions by Gap/Mismatch (Agent B Half Only)

For each gap/mismatch: one decision applied in the feature files.

### A) Monetization
- `monetization/hearts-vs-energy.feature`: **`@retention`** (non-blocking mistake buffer; RU default hearts disabled).
- `monetization/promo-codes.feature`: **all scenarios `@v2`** (v2 scope).

### B) Offline
- `offline/offline-lesson.feature`: **`@retention @stub`** for indicator/back-online/download; remaining scenarios **`@v2`**.
- `offline/content-download.feature`: **`@retention @stub`** for download option/completion/free-limit; remaining scenarios **`@v2`**.
- `offline/progress-sync.feature`: **`@core @stub`** for auto-sync start + cache preservation; remaining scenarios **`@v2`**.

### C) Progress
- `progress/course-progress.feature`: **core scenarios `@core @stub`** (minimal progress UI only); analytics/extras **`@v2`**; reset policy **`@retention`**.
- `progress/unit-unlock.feature`: **core scenarios `@core @stub`** (lesson-level gating only); extras **`@v2`**.
- `progress/spaced-repetition.feature`: **`@core`** for review queue + always-available review; deeper analytics **`@v2`**.
- `progress/checkpoint-tests.feature`: **`@core @stub`** (credibility signal).

### D) Reliability
- `reliability/offline-fallback.feature`: **`@core`** (graceful offline behavior).
- `reliability/data-recovery.feature`: **`@core`** (recover progress after loss).

### E) Settings
- `settings/daily-goal.feature`: **`@core @stub`** for goal selection UI; remaining scenarios **`@v2`**.
- `settings/notifications.feature`: **`@core @stub`** for overview + master toggle; remaining scenarios **`@v2`**.
- `settings/language-preferences.feature`: **`@retention @stub`** for language selector; remaining scenarios **`@v2`**.
- `settings/account-settings.feature`: **`@retention`** (compliance + trust).

### F) Social
- `social/add-friends.feature`: **friends menu `@retention @stub`**; remaining scenarios **`@v2`**.
- `social/share-progress.feature`: **`@retention`**.
- `social/friend-leaderboard.feature`: **`@v2`** (competitive extension).

### G) Support
- `support/answer-acceptance-and-appeals.feature`: **`@core`** (trust + fairness).
- `support/bug-report-and-feedback.feature`: bug report + general feedback **`@retention @stub`**; remaining scenarios **`@v2`**.

### H) UI
- `ui/tips-and-explanations.feature`: **`@core`** (guidebooks + "Почему?").
- `ui/error-handling-and-edge-cases.feature`: **`@core`** (reliable fallbacks).
- `ui/theme-and-accessibility.feature`: **`@v2`**.

---

## 4) V1 Blockers (Agent B Half)

1) **Course progress UI is stub-only**
   - No progress bar/CEFR cue/percent; only minimal counts shown.

2) **Unit unlock is stub-only**
   - Only lesson-level gating exists; unit-level lock/unlock messaging is missing.

3) **Course data still SAMPLE_COURSE**
   - Progress totals and CEFR labels are not grounded in real course content.

## 5) Task Additions Required for V1 Credibility

Core blockers to add to the task backlog:
- Replace `SAMPLE_COURSE` with API/content-backed course meta so totals and CEFR labels are real.
- Add progress bars + percent/CEFR cues for course/unit/lesson progress (not just counts).
- Implement unit-level lock/unlock states and messaging across multiple units (beyond lesson-only gating).
