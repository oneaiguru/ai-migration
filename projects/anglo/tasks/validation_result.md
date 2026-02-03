# Phase 4 Validation Analysis: Golden Path Test

I've analyzed the complete plan against the Golden Path requirements and the Phase 4 Validation Checklist. Here's my assessment:

## Executive Summary

**The plan has strong foundations but has critical gaps that would prevent a credible Duolingo-class product.** The infrastructure is solid, but several @core features from the PRD v1.2 and Phase 3/4 addenda are either missing or incompletely specified.

---

## Golden Path Trace

### ✅ 1. Open app → see course structure

**Status: PARTIAL**

**What's implemented:**
- CourseOverview page shows units and lessons (Phase 3 AGENT_15/16B)
- Sample course has 5 lessons in Unit 1
- Progress is displayed (XP, streak, completion counts)

**What's missing:**
- **CEFR section visualization** (A1/A2/B1 tabs or divisions) — the sample course only has `a1` content with a flat list, not the multi-section path GP-B1 requires
- **Story nodes** visible in the path (mentioned in FEATURE_TIERING_MATRIX as @core)
- **Checkpoint nodes** at section boundaries
- **Unit count "depth signals"** — users can't see "A1: 10 units, 50 lessons" upfront

**Risk:** Without visible course depth, users will perceive it as a "demo" per the research findings.

---

### ⚠️ 2. Start lesson → hear audio, answer questions

**Status: PARTIAL - AUDIO CRITICAL GAP**

**What's implemented:**
- Exercise components: TranslateTap, TranslateType, Listen, MatchPairs, FillBlank, SelectImage, Speak
- Grading system with typo detection
- Session management with hearts/XP

**What's missing:**
- **No audio content in sample course** — all exercises are text-only (translate_tap, translate_type). The Listen.tsx component exists but sample data has no `audio` URLs in prompts
- **No listening exercises** in the lesson flow despite being marked @core
- **Story dialogues with audio** are @core but not in sample content

**Evidence from sample-course.ts:**
```typescript
exercises: [
  { kind: 'translate_tap', prompt: { text: 'Privet' }, ... },
  { kind: 'translate_type', prompt: { text: 'Spasibo' }, ... },
]
// No listen exercises, no audio URLs
```

**Risk:** Per research, audio is critical for "real course" credibility. RU→EN Duolingo has thousands of audio lessons.

---

### ✅ 3. Complete lesson → see XP/streak update

**Status: MOSTLY COMPLETE**

**What's implemented:**
- Lesson completion screen shows XP earned and accuracy
- `applyLessonCompletion` updates streak correctly
- Progress persists via progressStore + API sync

**What's missing:**
- **Day 10 milestone celebration** (GP-C2 specifies "special milestone celebration")
- **Perfect lesson bonus XP** isn't visually celebrated

---

### ✅ 4. Close and reopen → progress still there

**Status: COMPLETE**

**What's implemented:**
- progressStore hydrates from API on mount
- Local fallback if API fails
- completedLessons persists correctly
- Lesson unlocking based on completedLessons

---

### ⚠️ 5. Return next day → streak logic works

**Status: PARTIAL - EDGE CASES MISSING**

**What's implemented:**
- Basic streak increment on consecutive days
- Streak reset on gap > 1 day
- UTC day calculation

**What's missing:**
- **Timezone handling** — uses UTC which may not match user's local midnight
- **Streak freeze consumption** — endpoint exists but isn't wired to streak update logic
- **Outage protection / streak repair** — GP-E2 requires:
  - `GET /status/incidents` endpoint (not in Phase 4)
  - `POST /me/streak/repair` endpoint (not in Phase 4)
  - Incident banner UI (mentioned in addendum but not implemented)
- **Grace window semantics** — addendum specifies 72-hour repair window, not implemented

**Risk:** Streak loss during outages causes "rage quit" per research. This is a retention-critical gap.

---

### ⚠️ 6. Hit paywall → understand what premium offers

**Status: INCOMPLETE**

**What's implemented:**
- `/entitlements/me` endpoint returns isPremium, features
- Offline page gates pack downloads by entitlements
- Policy config endpoint exists

**What's missing:**
- **Premium upgrade page** showing benefits (PRD specifies "convenience + depth, not pay-to-continue")
- **Clear premium value proposition UI** — current implementation only shows "Premium required for full downloads"
- **No hearts UI that would make users want premium** — hearts policy exists but isn't rendered in lesson flow

**Note:** Payment rails (Mir/SBP) are correctly marked @v2, but the premium *benefits explanation* should be @core.

---

### 🚫 7. (Optional) Pay → premium unlocked

**Status: NOT IN SCOPE (Correctly)**

Payments are @v2 per FEATURE_TIERING_MATRIX. The infrastructure is scaffolded but not production-ready:
- `POST /payments/upgrade`, `/payments/mir`, `/payments/refund` exist
- `grantPremium/revokePremium` functions exist
- But actual payment provider integration is future work

This is acceptable for MVP validation.

---

## Validation Checklist Gaps

### Section A: First-Session Commitment Ladder ❌

| Check | Status | Issue |
|-------|--------|-------|
| GP-A1: Cold start → micro-win in <90s | ❌ | No goal selection step, no micro-win lesson, WelcomePage goes straight to course |
| GP-A2: First 2 items are "can't fail" | ❌ | No `onboarding_micro_1` lesson with recognition-based exercises |
| E2E timing test | ❌ | No Playwright/timing harness per addendum |

**The commitment ladder (goal → micro-win → streak → reminders → account) is specified in the Phase 3 addendum but not implemented in the actual task code.**

---

### Section B: Course Credibility ⚠️

| Check | Status | Issue |
|-------|--------|-------|
| CEFR sections visible | ❌ | Flat lesson list, no A1/A2/B1 divisions |
| Unit counts shown | ⚠️ | Shows "X/Y lessons completed" but not total course depth |
| A1 Unit 1 ≥5 lessons | ✅ | Has 5 lessons |
| 6-12 exercises per lesson | ❌ | Sample has 2 exercises per lesson |
| Listening with audio | ❌ | No audio content |
| Story/dialogue nodes | ❌ | Types exist, no UI or content |
| Checkpoint test nodes | ❌ | Types exist, no UI or content |

---

### Section C: Core Learning Loop ✅

| Check | Status |
|-------|--------|
| GP-C1: Start lesson one-tap | ✅ |
| Mid-lesson resume | ⚠️ Lesson restarts from beginning |
| GP-C2: Completion reinforcement | ✅ |
| Day 10 milestone | ❌ Not implemented |

---

### Section D: Spaced Repetition ❌

| Check | Status | Issue |
|-------|--------|-------|
| GP-D1: Review always available | ❌ | No Review button on home screen |
| GP-D2: Daily queue generation | ❌ | No `/me/review/queue` endpoint |
| GP-D3: Per-item SRS state | ❌ | SM2 types exist but no storage/API |

**This is a critical gap.** The PRD v1.2 marks spaced repetition as @core for retention. The lesson-engine has SM2 math but it's not wired to any backend storage or API.

---

### Section E: Streak Integrity ⚠️

| Check | Status | Issue |
|-------|--------|-------|
| GP-E1: Offline-safe streak | ⚠️ | Local update works but sync reconciliation unclear |
| GP-E2: Streak repair (incident) | ❌ | No `/status/incidents` or `/me/streak/repair` |

---

### Section F: Account Upgrade ⚠️

| Check | Status | Issue |
|-------|--------|-------|
| GP-F1: Deferred account creation | ✅ | Anonymous start works |
| GP-F2: Upgrade prompt at right moment | ⚠️ | No "save progress" prompt after Unit 1 or day 3-5 |
| Local→server merge | ⚠️ | Auth flow exists but merge logic unclear |

---

### Section G: Appeals + Tips ❌

| Check | Status | Issue |
|-------|--------|-------|
| GP-G1: "Why?" at moment of error | ❌ | Not implemented in Lesson.tsx |
| GP-G2: "Report: should be accepted" | ❌ | Not implemented |

**These are @core per FEATURE_TIERING_MATRIX (support/answer-acceptance-and-appeals.feature)**

---

### Section H: Persistence ✅

| Check | Status |
|-------|--------|
| GP-H1: Close and reopen | ✅ |
| GP-H2: Sync idempotency | ✅ (ackedSyncIds in Phase 4) |

---

## Critical Path to "Credible MVP"

Based on this analysis, here are the **must-fix items** before the plan produces a believable product:

### Tier 1: Blocks Golden Path (Fix Before Any User Testing)

1. **Add audio content** — At minimum, 1 listen exercise per lesson in sample course with actual audio URLs (can be placeholder paths initially)

2. **Implement spaced repetition API** — Add `GET /me/review/queue` that returns due items based on SM2 state

3. **Add Review button to home screen** — Users must always be able to review even if hearts are depleted

4. **Expand exercises per lesson** — 6-12 per lesson for credibility

5. **Add "Why?" explanation UI** — Simple modal/expansion on wrong answer showing grammar tip

### Tier 2: Blocks "Real Course" Perception

6. **CEFR section visualization** — Course map should show A1/A2/B1 divisions with locked sections

7. **Story node (at least 1)** — Implement StoryPage.tsx and add 1 story to sample course

8. **Checkpoint test (at least 1)** — Implement CheckpointPage.tsx and add A1 checkpoint

9. **First-session commitment ladder** — Goal selection → micro-win flow before main course

### Tier 3: Blocks Retention Mechanics

10. **Streak repair endpoints** — `GET /status/incidents`, `POST /me/streak/repair`

11. **Day 10 milestone celebration** — Special animation/message at streak thresholds

12. **Premium benefits page** — Explain value proposition clearly

---

## Structural Recommendations

### 1. Content Schema Gap

The Phase 2 types include `Story`, `CheckpointTest`, `CourseSection`, `CourseNode` but Phase 3/4 don't use them. Recommend adding:

```typescript
// Phase 4: GET /courses/:courseId/map
interface CourseMapResponse {
  sections: CourseSectionDTO[];
  currentNodeId: string | null;
}
```

### 2. Review Queue Missing

Add to Phase 4:

```typescript
// GET /me/review/queue
interface ReviewQueueResponse {
  items: ReviewItemDTO[];
  dueCount: number;
}

// POST /me/review/complete
interface ReviewCompleteRequest {
  itemId: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // SM2 quality score
}
```

### 3. Sample Course Needs Audio

The sample-course.ts should include at least:

```typescript
{
  id: 'a1_u1_l1_ex3',
  kind: 'listen_tap',
  prompt: { 
    text: 'What did you hear?',
    audio: '/audio/a1/hello.mp3' 
  },
  choices: ['Hello', 'Goodbye', 'Thanks'],
  correct: 'Hello',
  difficulty: 1,
}
```

---

## Verdict

| Category | Score | Notes |
|----------|-------|-------|
| Infrastructure | ✅ Strong | Solid TypeScript monorepo, proper auth, sync |
| Core Loop | ⚠️ Partial | Works but missing audio, explanations |
| Credibility Signals | ❌ Weak | Feels like demo without CEFR structure, stories |
| Retention Mechanics | ❌ Incomplete | Spaced repetition not wired, streak repair missing |
| Onboarding | ❌ Missing | Commitment ladder not implemented |
| Monetization | ⚠️ Scaffolded | Premium gate exists, no compelling upgrade flow |

**Bottom Line:** The plan would produce a *functional* app but not a *credible Duolingo-class* product. A real user could complete lessons and see progress, but would likely conclude "this is just a prototype" due to:

1. No audio (fatal for language learning)
2. Flat course structure (no visible depth)
3. No spaced repetition (retention cliff)
4. No "feel smart fast" onboarding

**Recommendation:** Before user testing, prioritize the Tier 1 fixes (audio, review queue, exercise count, "Why?" explanations). These are ~2-3 days of focused work and dramatically change perception.
