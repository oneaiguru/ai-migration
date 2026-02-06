# Anglo Agent Handoff Checklist (Blocker Fixes)

Use this checklist to confirm the blocker fixes are reflected in the task docs and later in code.

Task doc updates
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` health route returns HealthResponse (status, timestamp, uptime, version)
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` health test asserts status is ok
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` auth plugin returns 401 when user is missing
- [ ] `projects/anglo/tasks/master-tasks-phase-2.md` auth types use LoginResponse/RegisterResponse union
- [ ] `projects/anglo/tasks/master-tasks-phase-1.md` verify.sh guards against static manifest.webmanifest
- [ ] `projects/anglo/tasks/master-tasks-phase-3.md` QueueItem aliases @duolingoru/types SyncItem
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` policy config supports hearts/energy via POLICY_LIMITER
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` daily quests endpoints exist in gamification routes
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` entitlements redeem endpoint handles promo codes
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` payments refund revokes Max entitlements
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` sync route includes /upload_progress alias
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` streak freeze endpoint enforces monthly limit
- [ ] `projects/anglo/tasks/master-tasks-phase-2.md` energy policy fields use rechargeHours/energyCostPerLesson
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` energy policy uses rechargeHours and streak bonus aligned with PRD
- [ ] `projects/anglo/tasks/master-tasks-phase-4.md` promo code redemption supports /promo/redeem alias
- [ ] `projects/anglo/apps/pwa/tests/features/lessons/*` wrong answers cost a heart on first incorrect attempt (free tier)
- [ ] `projects/anglo/apps/pwa/tests/features/gamification/xp-earning.feature` has no XP daily cap scenario
- [ ] `projects/anglo/apps/pwa/tests/features/gamification/daily-challenges.feature` matches simple daily quest scope
- [ ] `projects/anglo/apps/pwa/tests/features/gamification/achievements.feature` avoids rarity/tier systems
