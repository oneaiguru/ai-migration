# PHASE 3/4 ENDPOINT MAP (UI <-> API)

Purpose: quick reference for Phase 3 UI calls and Phase 4 API contracts.

## Auth + User
- POST /auth/register -> { accessToken, refreshToken, verifyToken, user }
- POST /auth/login -> { accessToken, refreshToken, user }
- POST /auth/refresh -> { accessToken }
- GET /me (auth) -> { user }
- PUT /me (auth) -> { user }
- POST /auth/request-reset -> { ok, token } (Phase 4 stub)
- POST /auth/reset-password -> { ok }
- POST /auth/verify-email -> { ok }

## Content + Course
- GET /courses/:courseId -> course meta (Phase 3 may fall back to local sample course)

## Progress
- GET /me/progress (auth) -> { progress: ProgressResponse }
- POST /me/progress/lesson-complete (auth) body { lessonId, xpEarned } -> { progress: ProgressResponse }
- ProgressResponse fields: userId, totalXp, level, streak, longestStreak, lastActivityDate, completedLessons, lessonProgress

## Offline Sync + Packs
- POST /sync/reconcile (auth) body { items: [{ id, type, occurredAt, payload }] } -> { acked, failed }
- progress payload: { lessonId, xpEarned }
- GET /packs/manifest -> { packs: [...] }
- GET /packs/:packId/:version -> pack content

## Gamification
- GET /gamification/achievements (auth)
- GET /gamification/daily-quests (auth)
- POST /gamification/daily-quests/complete (auth) body { questId }
- GET /gamification/streak (auth)
- POST /gamification/streak/freeze (auth)

## Monetization + Entitlements
- GET /policy/config
- GET /monetization/policy (deprecated alias to /policy/config)
- GET /entitlements/me (auth)
- POST /promo/redeem (auth) body { code }

## Payments (Phase 4 endpoints, Phase 3 UI placeholder)
- POST /payments/upgrade (auth)
- POST /payments/mir (auth) body { paymentId }
- POST /payments/refund (auth) body { paymentId }

## Support, Analytics, Notifications (Phase 4 endpoints, Phase 3 UI placeholder)
- POST /support/bug-report
- POST /support/feedback
- POST /analytics/event
- POST /notifications/register (auth)
- GET /reliability/offline-fallback
- GET /reliability/data-export (auth)

## Health
- GET /health
