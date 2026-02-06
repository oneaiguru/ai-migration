# PRD v1.3.1 Delta — Russia-First Golden Path + Max Monetization

This delta is intended as a patch on top of **PRD_Enhanced_v1_3.md**.  
It tightens acceptance criteria for the **Russia-first wedge**, and updates monetization assumptions based on **Duolingo 2025–2026 behavior**.

---

## 0) Why this delta exists

### The wedge (non-negotiable)
**Duolingo is unreliable in Russia (especially audio) unless users use a VPN, which breaks the learning loop.**  
Our product wins if: *“It works without VPN, audio works every time, and it feels like a real course.”*

### The monetization truth for RU
- Russian users historically experienced “Duolingo paid features for free / hard to pay” dynamics, so **ads and punishment mechanics are a trust killer**.
- We monetize with **Max (AI)** via **RU payment rails** (Mir / SBP / local checkout).  
- **Super** is explicitly **future** (post-scale), not part of launch positioning.

### Key 2026 alignment note
Duolingo moved **“Explain My Answer” to free for all learners starting Jan 1, 2026**.  
To avoid feeling “worse than Duolingo,” we should **not** put the *basic* equivalent behind Max.

---

## 1) Golden Path v1.3.1 Acceptance Criteria (Russia-first)

These are the **Phase 4 validation** criteria. If we can’t pass them, we don’t ship.

### Step 1 — Open app → see course structure
**RU constraint:** Works without VPN from RU networks.

Acceptance (must-pass):
- Course map renders **A1 / A2 / B1** sections with *visible depth signals*:
  - total units per section, total lessons per unit, and section locked/unlocked state.
- **Story nodes** and **Checkpoint nodes** are visible on the path (even if only 1 exists in MVP).
- **Placement test entrypoint** is visible (can be “optional” in MVP, but visible).
- First render:
  - **P95 < 3 seconds** on typical RU mobile network.
- **No third-party critical-path calls** to domains likely to be blocked (fonts, analytics, CDNs).  
  (Rule of thumb: app is usable with only our domains allowed.)

### Step 2 — Start lesson → hear audio, answer questions
**RU constraint:** Audio MUST work without VPN. This is the wedge.

Acceptance (must-pass):
- In the **first-session micro-win**, at least one exercise includes audio:
  - user taps play → **audio starts within 500ms (p95)**.
- First-session audio is **bundled or pre-cached** at app open:
  - micro-win must not depend on network availability.
- For “normal” lessons:
  - if online: audio is served from RU-friendly hosting (RU region or RU providers).
  - if offline: audio plays for cached lessons/packs.
- Failure behavior:
  - if audio fails to start: auto-retry once, then auto-downgrade to text-only/skip,
    but *lesson can be completed* (no dead-end).
- A1 Unit 1 credibility minimum:
  - ≥5 lessons
  - **6–12 exercises per lesson**
  - ≥1 listening exercise per lesson (or ≥1 listening per 2 lessons if we’re resource-constrained).

### Step 3 — Complete lesson → see XP/streak update
**RU constraint:** No “pay to keep learning.”

Acceptance (must-pass):
- Completion screen shows:
  - XP earned
  - accuracy
  - streak state (starts at 1 after first win)
  - daily goal progress tick
- “Perfect lesson” gets a visible celebration (no XP-boost events required).
- Streak milestone:
  - Day 10 milestone celebration
  - Day 10 grants **one free streak freeze** (earned, not paywalled).

### Step 4 — Close and reopen → progress still there
**RU constraint:** Works through RU network instability and offline.

Acceptance (must-pass):
- Progress persists locally (IndexedDB / SQLite) and survives app restart:
  - completed lessons, XP totals, streak state, daily goal state.
- In airplane mode:
  - app opens
  - course map loads (cached)
  - user can replay cached lesson content (at least micro-win + downloaded pack).

### Step 5 — Return next day → streak logic works + review available
**RU constraint:** Local timezone + outage-safe semantics; review never blocked.

Acceptance (must-pass):
- Day boundary uses **user local timezone** (not UTC).  
  (If timezone changes: use “home timezone” from first login unless user explicitly changes it.)
- Home screen always shows:
  - Review button
  - Due count: “Review (N due)”
- Completing a review session:
  - counts toward daily goal
  - counts toward streak.
- Outage-safe streak:
  - If we declare an incident day: user sees incident banner + can repair streak for that day.
  - Offline completions later sync and credit the correct local day.

### Step 6 — Hit paywall → understand what Max offers
**RU constraint:** Not “pay to continue.” It’s “unlock serious learner tools Russians couldn’t buy.”

Acceptance (must-pass):
- Paywall triggers only on **value-add** surfaces, e.g.:
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
  - framed as **capability unlock**, not punishment removal.
- “Explain / Why?” at moment of error is **free** (authored).  
  Optional: limited AI explanation quota for Free, unlimited for Max.

### Step 7 — Pay → Max unlocked via RU payment rails
**RU constraint:** Google Play billing is not the default; SBP/Mir must work.

Acceptance (must-pass):
- Payment checkout supports:
  - Mir card payment
  - SBP (Fast Payments System).
- SBP flow is reliable:
  - user can open bank app and return to app successfully
  - entitlement unlocks within **< 10 seconds** after confirmation (p95).
- User sees confirmation and can “Restore purchases / Sync entitlements” if callback fails.
- Cancellation & receipts:
  - user can access a “Manage subscription” page (even if it’s web-based).
  - receipts/transaction IDs stored for support.

---

## 2) v1.3 → v1.3.1 PRD patch list (what to change in PRD_Enhanced_v1_3.md)

1) **Step 6 wording**
- Replace “Paywall triggers when user taps AI feature: Explain my mistake”  
  with:
  - “Paywall triggers on Roleplay / Speaking Coach / Ask-AI deeper coaching.”
- Keep “Why?/Explain” free (authored).

2) **Max feature definition**
- Ensure Max is defined as:
  - Roleplay / conversation
  - Speaking coach
  - Ask-AI coaching
  - (Optional) unlimited AI explain quota.
- Avoid calling the free feature “Explain my mistake” if we want parity with Duolingo’s now-free “Explain My Answer.”

3) **Add: AI Provider + Data Boundary**
Add a short section:
- AI must work without VPN from RU networks (same standard as audio).
- If using a third-party LLM outside RU:
  - forbid sending PII
  - require explicit consent
  - store personal data in RU per 242-FZ; store only minimal AI logs (or none) locally/RU.

4) **Add: Payment UX constraints**
- SBP requires external bank handoff → return reliability is part of Golden Path.

---

## 3) Task file impacts (high-level)

### master-tasks-phase-1.md
No required changes.

### master-tasks-phase-2.md
Small recommended deltas:
- Add explicit “hearts disabled for RU by default” config.
- Add content schema support for:
  - story nodes
  - checkpoint nodes
  - CEFR sections A1/A2/B1.
- Add audio manifest / pack bundling plan for micro-win.

### master-tasks-phase-5.md
Add release/QA checklist items for:
- SBP bank-app handoff + return in TWA
- Mir payment in web checkout
- Entitlement unlock and restore flow.

---

## 4) Feature file impacts (minimum set)

Even if you keep the full v1.2 feature set, v1.3.1 requires:
- `features/payments/sbp-payment.feature` → **@core**
- `features/payments/mir-payment.feature` → **@core**
- `features/payments/max-upgrade.feature` → **Max upgrade** (behavior)
- Add new feature spec(s):
  - `features/max/roleplay.feature`
  - `features/max/speaking-coach.feature`
  - `features/max/ask-ai-coach.feature`

(You can keep “Super” as a future note, but it shouldn’t appear in launch UX.)
