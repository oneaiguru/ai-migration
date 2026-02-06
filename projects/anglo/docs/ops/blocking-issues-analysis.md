# Blocking Issues Analysis: DuolingoRU Task Files

## Overview
After reviewing all phase files and the PRD, I've identified **20 issues** that will likely cause failures when passed to coding agents. Issues are ranked by severity.

---

## 🔴 CRITICAL BLOCKERS (Will definitely fail)

### 1. API Framework Switch: Express → Fastify (Phase 1 vs Phase 4)

**Location:** Phase 1 AGENT_02 vs Phase 4 AGENT_19

**Problem:**
- Phase 1 creates an **Express.js** API:
  ```typescript
  import express from 'express';
  app.use(express.json());
  router.get('/', (_req, res) => { res.json({...}) });
  ```
- Phase 4 completely **replaces it with Fastify**:
  ```typescript
  import Fastify from 'fastify';
  app.get('/health', async () => { return {...} });
  ```

**Why it blocks:** Phase 4 says "Modifies: 3 files" but actually requires a **complete rewrite** of the API. The coding agent will:
- Fail when trying to add Fastify plugins to an Express app
- Have incompatible route handlers (Express uses `(req, res)` callbacks; Fastify uses async returns)
- Break all Phase 1 API tests

**Fix:** Either:
1. Change Phase 1 to use Fastify from the start, OR
2. Add an explicit "AGENT_19_MIGRATE_TO_FASTIFY" task that acknowledges the full migration

---

### 2. BDD Test File Naming Mismatch (Phase 3)

**Location:** Phase 1 `vitest.bdd.config.ts` vs Phase 3 test files

**Problem:**
Phase 1 configures BDD tests to look for:
```typescript
include: ['tests/**/*.bdd.ts', 'tests/**/*.bdd.tsx']
```

But Phase 3 creates files named:
- `tests/bdd/settings-social-support.test.ts`
- `tests/bdd/offline.test.ts`

**Why it blocks:** The `pnpm test:bdd` command will find **zero tests** because the pattern doesn't match `.test.ts` files.

**Fix:** Change Phase 3 test filenames to use `.bdd.ts` extension:
- `tests/bdd/settings-social-support.bdd.ts`
- `tests/bdd/offline.bdd.ts`

OR update Phase 1's vitest.bdd.config.ts to include `tests/bdd/**/*.test.ts`.

**Status:** Applied in canonical tasks (BDD config includes `tests/bdd/**/*.test.ts`).

---

### 3. Phase 3 Uses Phase 4 Endpoints Without Fallback

**Location:** Phase 3 lib calls `/policy/config`, `/entitlements/me`, `/packs/manifest`, `/sync/reconcile`

**Problem:** These endpoints are introduced in Phase 4. In Phase 3 they return 404/401, so
pack downloads, entitlements gating, policy config, and sync all silently fail.

**Fix:** Add local fallbacks (e.g., `public/packs/manifest.json`, default policy/entitlements)
and ensure callers swallow fetch errors.

**Status:** Applied in Phase 3 (fallback manifest + default policy/entitlements).

---

### 4. Auth Headers Missing on Protected Endpoints

**Location:** Phase 3 client fetches `/entitlements/me`, `/sync/reconcile`

**Problem:** Phase 4 protects these endpoints with `app.authenticate`, so Phase 3
calls without `Authorization` will 401 once Phase 4 is live.

**Fix:** Centralize API fetch logic to attach bearer tokens when present and
gracefully downgrade entitlements when auth is missing.

**Status:** Applied in Phase 3 (`apiFetch` adds Authorization, 401 falls back to free tier).

---

### 5. Local Machine Path Reference (Phase 3)

**Location:** Phase 3 header

**Problem:**
```
- Canonical feature list: local machine path (now removed)
```

**Why it blocks:** This is your local Mac path. Coding agents won't have access to this file. Instructions say "If they do not [exist], create them by copying the gherkin blocks from the canonical feature file doc exactly."

**Fix:** Either:
1. Include the feature file content directly in the task document
2. Create a separate `features/` scaffold task in Phase 1 that creates these files
3. Remove the reference and have Phase 3 create features inline

**Status:** Applied in canonical docs (spec stored in repo, no local-only paths).

---

## 🟠 HIGH SEVERITY (Likely to cause failures)

### 6. Workspace Dependencies Before Packages Exist

**Location:** Phase 1 AGENT_01 (PWA package.json)

**Problem:**
Workspace deps can break `pnpm install` when created in parallel.

**Fix:**
- Keep Phase 1 packages free of internal workspace deps, and add them in Phase 3 only.
- Do not add `@duolingoru/content` to lesson-engine in Phase 1 unless a concrete import requires it.

**Status:** Applied in canonical tasks (Phase 1 defers workspace deps and removes the lesson-engine content dependency).

---

### 7. API app.ts Incremental Modification Collision (Phase 4)

**Location:** Phase 4 agents 19-24

**Problem:** Six agents sequentially modify `apps/api/src/app.ts` to add imports:
- AGENT_19: Creates base app.ts with healthRoutes
- AGENT_20: Adds authRoutes, userRoutes
- AGENT_21: Adds contentRoutes, progressRoutes
- AGENT_22: Adds gamificationRoutes, socialRoutes
- AGENT_23: Adds paymentsRoutes, monetizationRoutes
- AGENT_24: Adds supportRoutes, reliabilityRoutes, analyticsRoutes

Each task shows only the **new lines** to add, not the full file.

**Why it blocks:** If a coding agent doesn't preserve previous modifications (common with LLMs), imports will be lost. The task format "Register routes:" followed by partial code is ambiguous.

**Fix:** For each agent, provide the **complete expected state** of app.ts after modification, OR use a more explicit "append these lines after line X" format.

---

### 8. PWA Relative API Calls Need a Dev Proxy

**Location:** Phase 1 `projects/anglo/apps/pwa/vite.config.ts` + Phase 3 API fetches

**Problem:** Phase 3 uses relative API paths (e.g., `/health`, `/packs/manifest`, `/policy/config`), which hit the Vite dev server unless proxied to the API host.

**Fix:** Add a Vite `server.proxy` mapping for `/health`, `/packs`, `/policy`, `/entitlements`, `/sync` that targets `VITE_API_BASE_URL`.

**Status:** Applied in canonical Phase 1 Vite config; Phase 3 now uses `apiFetch`/`getApiUrl`
to honor `VITE_API_BASE_URL` outside dev proxy contexts.

---

### 9. Duplicate Session Exports During Phase 2 Run Order

**Location:** Phase 2 AGENT_03 models vs Phase 1 session module

**Problem:** After AGENT_03, `models/index.ts` defines `Session`, while `session/index.ts` (from Phase 1) still exports its own `Session`. The barrel exports both, causing duplicate identifier errors if verification happens before AGENT_11 runs.

**Fix:** In AGENT_03, update `packages/lesson-engine/src/index.ts` to avoid `export *` from
`session/index.ts`; explicitly export session functions only and keep Session/SessionConfig
coming from models so verification passes before AGENT_11. Still run AGENT_11 immediately after
to replace the session module.

**Status:** Applied in Phase 2 canonical tasks (AGENT_03 barrel export update + run order note).

---

### 10. INITIAL_SM2_STATE Duplicate Re-Exports

**Location:** Phase 2 models + lesson-engine barrel

**Problem:** `SM2State` and `INITIAL_SM2_STATE` are defined in `spaced-rep/index.ts`, while Phase 2
models also defined `SM2State`. With barrel `export *`, this causes duplicate exports.

**Fix:** Keep `SM2State` defined in spaced-rep, re-export it from models, and make the barrel export
`INITIAL_SM2_STATE` + `updateSM2State` explicitly (no `export *` from spaced-rep). Avoid any
re-exports from progress.

**Status:** Applied in Phase 2 canonical tasks.

### 11. Missing `@types/uuid` in Multiple Packages

**Location:** Phase 1 AGENT_06 (lesson-engine), AGENT_02 (api)

**Problem:**
```json
"dependencies": {
  "uuid": "^9.0.1"
}
// Missing: "@types/uuid" in devDependencies
```

**Why it blocks:** TypeScript will fail with "Could not find declaration file for module 'uuid'" unless the types are installed. Modern uuid (v9) may have bundled types, but this isn't guaranteed.

**Fix:** Add to devDependencies:
```json
"@types/uuid": "^9.0.0"
```

---

### 12. Auth Plugin Registration Order (Phase 4)

**Location:** Phase 4 AGENT_19 + AGENT_20

**Problem:**
- AGENT_19 creates `plugins/jwt.ts` and registers it
- AGENT_20 creates `plugins/auth.ts` which calls `request.jwtVerify()` (from jwt plugin)
- `auth.ts` uses `app.decorate('authenticate', ...)` which must be called AFTER jwt plugin is registered

The registration order in app.ts matters, but AGENT_20 doesn't specify where to add the auth plugin registration relative to jwt.

**Fix:** AGENT_20 should explicitly state:
```typescript
// Register AFTER jwtPlugin
await app.register(authPlugin);  // Add after line: await app.register(jwtPlugin);
```

---

### 13. MatchPairs Grading Stub + Answer Type Mismatch (Phase 2/3)

**Location:** Phase 2 session types + Phase 3 Lesson page

**Problem:**
- Session `UserAnswer.answer` is typed as `string`, but match_pairs answers are tuple arrays.
- Phase 3 Lesson page stubs match_pairs grading (`isCorrect: true`) and stringifies answers.

**Why it blocks:** Match-pairs exercises are always marked correct, and answers are stored in a lossy format.

**Fix:**
- Update `UserAnswer.answer` to `string | MatchPair[]` and accept that type in `submitAnswer`.
- In Phase 3, call `gradeMatchPairs()` for match_pairs and pass tuple answers through without stringifying.

---

### 14. BDD Tests Missing Router Context (Phase 3)

**Location:** Phase 3 BDD tests for progress/settings/social/support pages

**Problem:** Pages use TanStack Router links and hooks. Rendering without a router
provider can fail once route context is accessed.

**Fix:** Use `renderRoute`/`renderWithProviders` so tests run inside a router.

**Status:** Applied in Phase 3 tests (`renderRoute` used for route pages).

---

## 🟡 MEDIUM SEVERITY (May cause issues)

### 15. Content Validation Script Execution Context

**Location:** Phase 1 AGENT_08

**Problem:**
```typescript
const coursesDir = fileURLToPath(new URL('../courses', import.meta.url));
```

When run via `pnpm validate` from the workspace root vs from `packages/content`, the path resolution differs.

**Fix:** Add explicit working directory in package.json script:
```json
"validate": "cd packages/content && tsx scripts/validate-all.ts"
```

Or use an ESM-safe path that does not depend on cwd:
```typescript
const coursesDir = fileURLToPath(new URL('../courses', import.meta.url));
```

---

### 16. Test Count Expectations Are Fragile

**Location:** Phase 2 verification steps

**Problem:**
```bash
# Expected: "36 passed" (13 grading + 13 session + 10 progress)
pnpm test
```

If any agent adds/removes tests or a test fails for other reasons, the verification will fail even if the core task succeeded.

**Fix:** Change to less fragile assertions:
```bash
pnpm test || exit 1  # Just verify tests pass, not exact count
```

**Status:** Applied in Phase 1/2 canonical tasks (verification relies on exit codes).

---

### 17. Gamification Store Missing Export (Phase 4)

**Location:** Phase 4 AGENT_22

**Problem:** `socialRoutes.ts` imports:
```typescript
import { friendsStore } from '../db/gamification.js';
```

But AGENT_22 only shows the creation of `routes/gamification.ts`, not the full `db/gamification.ts` file (truncated). Need to verify `friendsStore` is exported.

**Fix:** Ensure `db/gamification.ts` exports `friendsStore`:
```typescript
export const friendsStore: Record<string, string[]> = {};
```

---

### 18. Missing `@duolingoru/types` Creation Timing

**Location:** Phase 1 AGENT_08B creates `@duolingoru/types`, but Phase 4 AGENT_19 expects to use it

**Problem:** The types package is created in Phase 1 as a placeholder:
```typescript
// Placeholder - populated by AGENT_09
export {};
```

But Phase 2 AGENT_09 populates it. If Phase 4 runs before Phase 2 completes, API types won't exist.

**Fix:** Already handled by phase ordering (Phase 4 depends on Phases 1-3), but verify the dependency chain is clear in instructions.

---

## 🟢 LOW SEVERITY (Minor issues)

### 19. Hardcoded Port Conflicts

**Location:** Phase 1 PWA (port 3000), API (port 3001)

**Problem:** If both services run during integration testing, they use different ports. The PWA's API calls assume `https://api.` pattern but local dev might use `localhost:3001`.

**Fix:** Add `.env.example` files with clear port configuration, and ensure vite proxy config exists for local development.

---

### 20. ASCII Manifest Strings (Resolved)

**Location:** Phase 1 AGENT_01 vite.config.ts

**Status:** Manifest strings now use ASCII values (e.g., `Yazychok`) to align with Phase 3 UI text and avoid encoding concerns.

---

## Summary Table

| Issue | Phase | Severity | Type |
|-------|-------|----------|------|
| Express→Fastify switch | 1→4 | 🔴 CRITICAL | Breaking change |
| BDD test naming (resolved) | 1+3 | 🔴 CRITICAL | Tests won't run |
| Phase 3 endpoints missing (resolved) | 3→4 | 🔴 CRITICAL | Missing data |
| Auth headers missing (resolved) | 3→4 | 🔴 CRITICAL | 401s |
| Local path reference (resolved) | 3 | 🔴 CRITICAL | Missing dependency |
| Workspace deps timing (resolved) | 1 | 🟠 HIGH | No action |
| app.ts modification collision | 4 | 🟠 HIGH | Lost code |
| PWA API base/proxy (resolved) | 1/3 | 🟠 HIGH | Wrong host |
| Duplicate Session exports (resolved) | 2 | 🟠 HIGH | No action |
| INITIAL_SM2_STATE re-export (resolved) | 2 | 🟠 HIGH | No action |
| Missing @types/uuid | 1 | 🟠 HIGH | Type errors |
| Auth plugin order | 4 | 🟠 HIGH | Runtime error |
| MatchPairs grading + answer type | 2-3 | 🟠 HIGH | Silent correctness bug |
| BDD router context (resolved) | 3 | 🟠 HIGH | Test failures |
| Validation script path | 1 | 🟡 MEDIUM | Script failure |
| Fragile test counts (resolved) | 1-2 | 🟡 MEDIUM | False failures |
| Missing friendsStore export | 4 | 🟡 MEDIUM | Import error |
| Types package timing | 1-4 | 🟡 MEDIUM | Type errors |
| Port conflicts | 1 | 🟢 LOW | Dev friction |
| ASCII manifest strings (resolved) | 1 | 🟢 LOW | No action |

---

## Recommended Priority Fixes

1. **Immediately**: Decide Express vs Fastify and update Phase 1 or Phase 4
2. **Immediately**: Provide complete app.ts file states for each Phase 4 agent
3. **Before running**: Ensure missing `@types/uuid` is added in lesson-engine + API
4. **Before Phase 4**: Verify auth plugin registration order is explicit in app.ts
5. **Before handoff**: Confirm feature file spec references are in-repo (no local paths)

---

## Reviewer Feedback Reconciliation (Verified)

Note: This section reflects the canonical phase docs in this worktree. If other
variants exist outside the repo, treat them as deprecated and reconcile differences
against these files before handing off.

### Confirmed blockers in the task docs

- Express → Fastify mismatch (handled via explicit Phase 4 full replacements)
- BDD naming mismatch (config includes `tests/bdd/**/*.test.ts`)
- Local Mac path reference (spec stored in-repo under `projects/anglo/docs/bdd/`)
- Phase 3 endpoint dependency (fallback manifest/default policy/entitlements added)
- Auth headers for entitlements/sync (handled via `apiFetch`)
- BDD router context (tests now use `renderRoute`)
- MatchPair tuple mismatch (MatchPair is a tuple type; grading uses tuples)
- GradeResult export/duplicate (GradeResult is re-exported from models; duplicate type removed)
- Match_pairs grading + session answer type (no stringification; gradeMatchPairs used)

### Not present in current canonical task docs

- Missing ESLint deps in root `package.json`
- Duplicate `compilerOptions` in `apps/api/tsconfig.json`
- API vitest include limited to `src/**` only
- `calculateSM2` naming mismatch (Phase 2 uses `updateSM2State`)

### Still important coordination risks

- Workspace dependency ordering between Phase 1 scaffold and later packages
- app.ts incremental modification collisions (keep full-file replacements)
