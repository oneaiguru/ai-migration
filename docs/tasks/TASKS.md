# TASKS.md — Phase 1 Task Decomposition (GramIO + TS strict + SQLite + polling)

## Task 0: Repository structure + vendor docs
**Dependencies:** None  
**Files to create:**  
- `vera-pilot-support-bot/` (root)
- `shared/` directory
- `backend/` directory
- `docs/` directory
- `vendor/gramio-docs/` (copy from documentation-main.zip)
- `vendor/telegram-bot-api.html` (curl from core.telegram.org/bots/api)
- `.gitignore`

**What to build:**  
Create folder structure per spec. Vendor GramIO docs and Telegram Bot API reference into repo so agents have local access.

**Success criteria:**  
- Folder structure matches spec exactly  
- `vendor/gramio-docs/` contains GramIO documentation  
- `vendor/telegram-bot-api.html` is readable HTML  
- `.gitignore` excludes `node_modules`, `.env`, `*.sqlite`

**Estimated time:** 30 minutes

---

## Task 1: Define domain types (HUMAN REVIEW)
**Dependencies:** None  
**Files to create:**  
- `shared/types.ts`  

**What to build (1–2 sentences):**  
Define the minimal domain types required for Phase 1: desk config, conversation mapping, message relay log records, and error/result types. Include `desk_id` on all records.

**Success criteria:**  
- `shared/types.ts` exists and compiles under strict TS rules (no `any`, no implicit any).  
- Types cover: conversation mapping (participant_user_id ↔ topic_thread_id), and minimal message log metadata.
- Human reviews and approves `shared/types.ts` before Task 2 begins.

**Estimated time:** < 2 hours

---

## Task 2: Project skeleton + strict TS config
**Dependencies:** Task 1  
**Files to create:**  
- `backend/package.json`  
- `backend/tsconfig.json`  
- `backend/src/index.ts`  
- `backend/src/config.ts`  
- `backend/src/logger.ts`  
- `.env.example`  

**What to build:**  
Create a minimal Node + TypeScript strict project structure with env-based config loading (bot token, organizer chat id, sqlite path, desk_id) and a basic logger.

**Success criteria:**  
- `tsc --noEmit` succeeds.
- Running `node dist/index.js` (or equivalent) prints “boot ok” and loads config without crashing.

**Estimated time:** < 2 hours

---

## Task 3: SQLite persistence layer (schema + repository)
**Dependencies:** Task 2  
**Files to create:**  
- `backend/src/db/schema.sql`  
- `backend/src/db/sqlite.ts`  
- `backend/src/db/conversations_repo.ts`  
- `backend/src/db/message_log_repo.ts` (optional but recommended)  

**What to build:**  
Implement SQLite schema and small repositories:
- create/get conversation by participant_user_id
- get conversation by topic_thread_id
- insert message log entries (success/error)

**Success criteria:**  
- `tsc --noEmit` succeeds.
- A small local script (or minimal test harness) can:
  - create conversation
  - fetch it by user_id and by topic_thread_id
  - write/read a message log row

**Estimated time:** < 2 hours

---

## Task 4: Domain services (framework-agnostic)
**Dependencies:** Task 3  
**Files to create:**  
- `backend/src/domain/conversations.ts`  
- `backend/src/domain/relay.ts`  
- `backend/src/domain/format.ts`  

**What to build:**  
Create pure domain functions:
- `getOrCreateConversation(...)` (returns topic_thread_id; creates mapping when needed)
- `recordRelayAttempt(...)` (writes message log)
- formatting helpers for topic names and the first “header” message in a topic

**Success criteria:**  
- Domain layer imports only `shared/types.ts` and DB repos (no GramIO types).
- `tsc --noEmit` succeeds.

**Estimated time:** < 2 hours

---

## Task 5: GramIO bot bootstrap (long polling) + /start
**Dependencies:** Task 2  
**Files to create:**  
- `backend/src/telegram/bot.ts`  
- `backend/src/telegram/handlers_start.ts`  

**What to build:**  
Initialize GramIO bot in long polling mode. Implement `/start` in private chat to send a short welcome and instructions (“write your question here; organizers reply”).

**Success criteria:**  
- Bot starts and stays running (polling loop active).
- `/start` works in DM and responds correctly.
- `tsc --noEmit` succeeds.

**Estimated time:** < 2 hours

---

## Task 6: DM → Topic routing (participant inbound relay)
**Dependencies:** Tasks 3, 4, 5  
**Files to create:**  
- `backend/src/telegram/handlers_private.ts`  
- `backend/src/telegram/telegram_api.ts` (thin wrapper for Telegram calls)  

**What to build:**  
Handle any private message:
- get/create conversation mapping
- if new: create forum topic in organizer group and post a header
- copy participant message into organizer group topic using `message_thread_id`
- log success/error

**Success criteria:**  
- Sending a DM creates exactly one topic per participant (reused across messages).  
- Participant message appears inside the correct topic for these types:  
  - text ✅  
  - photo ✅  
  - document ✅  
  - voice ✅  
  - video ✅ (best effort)  
  - sticker ✅ (best effort)  
- Unsupported types: log warning, send text summary to the topic.  
- Errors are logged (no silent drops).  
- `tsc --noEmit` succeeds.  

**Estimated time:** < 2 hours

---

## Task 7: Topic → DM routing (organizer reply relay)
**Dependencies:** Tasks 3, 4, 6  
**Files to create:**  
- `backend/src/telegram/handlers_organizer_group.ts`  

**What to build:**  
Handle messages from the organizer forum group:
- require presence of `message_thread_id`
- map topic_thread_id → participant_user_id
- copy organizer message to participant DM
- log success/error
- avoid loops (ignore bot’s own messages)

**Success criteria:**  
- Organizer reply in a topic is delivered back to the correct participant DM.
- Replies work for text and at least one media type.
- Bot does not relay its own messages back (no loops).
- `tsc --noEmit` succeeds.

**Estimated time:** < 2 hours

---

## Task 8: Resilience and guardrails (minimal)
**Dependencies:** Tasks 6, 7  
**Files to create:**  
- `backend/src/telegram/retry.ts`  
- `backend/src/domain/errors.ts` (optional)  

**What to build:**  
Implement minimal safety handling:
- retry/backoff for Telegram API 429 / transient errors
- if topic missing (thread not found): create a new topic and update mapping, then retry copy
- if participant blocked bot: mark conversation status and stop retrying

**Success criteria:**  
- Known transient errors do not crash the process.
- Testing 429 behavior: implement a **local injectable rate-limit hook** in the Telegram API wrapper (e.g., env `FORCE_429_EVERY_N=5`) that throws a synthetic `{ retry_after: 2 }` error so the retry/backoff path is exercised without real Telegram spam.
- Failures are logged with reason.

**Estimated time:** < 2 hours

---

## Task 9: Docker Compose deployment + smoke test (LAST TASK)
**Dependencies:** Tasks 5–8  
**Files to create:**  
- `backend/Dockerfile`  
- `docker-compose.yml`  
- `docs/RUNBOOK.md`  
- `README.md`  

**What to build:**  
Create Docker image and Compose config with mounted SQLite volume and restart policy. Provide a 5-minute operator runbook: env vars, start/stop, logs, and a smoke test checklist.

**Success criteria:**  
- `docker compose up -d --build` runs cleanly on a VPS.
- Bot stays running after restart.
- Smoke test passes:
  1) DM bot → topic created  
  2) DM copied into topic  
  3) organizer reply copied back to DM

**Estimated time:** < 2 hours
# TASKS.md … ( existing content ) 
