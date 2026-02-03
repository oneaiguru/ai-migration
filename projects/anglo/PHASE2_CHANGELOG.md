# Phase 2 Design Enhancements — Changelog

## What changed (high-level)

### Core loop alignment
- Reworked onboarding to follow a **commitment ladder** (goal → micro-win → streak → reminders → later account save).
- Made **spaced repetition** a **@core** engine with a daily review queue and "review always available".
- Reworked **streak** to be outage/offline-safe and **not dependent on ads or paywalls**.

### Removed / explicitly avoided (scope control)
- **No Energy system** (mistake buffer is optional hearts, and review is always available).
- No ad-gated continuation mechanics (removed from exercises and streak flows).

### Credibility signals added
- Added **Story/Dialogue nodes** as a @core feature (contextual learning).
- Added **Checkpoint tests** at section boundaries (A1/A2/B1) as @core.
- Added **Answer acceptance & appeals** feature to protect trust when users feel unfairly graded.
- Added **RU data localization / user rights** requirements feature (242-FZ) for compliance.

### Monetization re-framed (v2)
- Max upgrade spec changed to "convenience + depth" (no "pay to keep learning" promises).

## Files most heavily rewritten
- onboarding/anonymous-start.feature
- onboarding/tutorial-first-launch.feature
- settings/daily-goal.feature
- settings/notifications.feature
- progress/spaced-repetition.feature
- progress/course-progress.feature
- progress/unit-unlock.feature
- gamification/streak-tracking.feature
- gamification/streak-freeze.feature
- monetization/hearts-vs-energy.feature
- ui/tips-and-explanations.feature
- lessons/start-lesson.feature
- lessons/complete-lesson.feature
- payments/max-upgrade.feature
- reliability/offline-fallback.feature
- reliability/data-recovery.feature
- ui/error-handling-and-edge-cases.feature
- offline/progress-sync.feature
- offline/content-download.feature
- gamification/daily-challenges.feature

