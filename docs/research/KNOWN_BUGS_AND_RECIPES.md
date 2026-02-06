# KNOWN_BUGS_AND_RECIPES.md

## What this doc is for
A short "don't get burned" checklist of Telegram Bot API pitfalls that commonly break support bots using forum topics and long polling.

## Known bugs / pitfalls (with recipes)
### 1) Bot does not receive group messages
**Symptoms**
- DMs work, but messages in the organizers group never arrive to the bot.

**Root causes**
- Privacy mode blocks non-command messages unless bot is admin or privacy disabled.
- Bot lacks permissions / not added correctly.

**Recipe**
- Add bot as admin in the organizer supergroup.
- Verify privacy mode state (Bot API exposes `can_read_all_group_messages` as an indicator when privacy mode is disabled).
- Ensure your long polling runner is not filtering out "message" updates (allowed_updates).

**Sources**
- Privacy mode indicator (`can_read_all_group_messages`): https://core.telegram.org/bots/api#user
- Practical discussions:
  - https://stackoverflow.com/questions/50204633/telegram-bot-not-receiving-messages
  - https://github.com/yagop/node-telegram-bot-api/issues/673

---

### 2) "Bad Request: message thread not found"
**Symptoms**
- Sending/copying to an existing `message_thread_id` suddenly starts failing.

**Root causes**
- Topic deleted manually by admins.
- Topic invalid due to group state changes or edge Telegram behavior.

**Recipe**
- On this error:
  1) mark conversation "stale_thread"
  2) create a new forum topic via `createForumTopic`
  3) update mapping
  4) retry copy once
- Also: consider a periodic "thread health check" (optional, later).

**Sources**
- Community reports:
  - https://github.com/yagop/node-telegram-bot-api/issues/596
  - https://github.com/python-telegram-bot/python-telegram-bot/issues/472

---

### 3) Bot cannot create topics
**Symptoms**
- `createForumTopic` fails.

**Root causes**
- Support group is not a forum (`is_forum` false).
- Bot not admin or missing `can_manage_topics`.

**Recipe**
- Enable Topics in the supergroup settings (must be a forum).
- Grant the bot admin rights plus "Manage Topics".
- Run a startup health check:
  - `getChat(support_group_id)` and verify `is_forum === true`.

**Sources**
- createForumTopic requires `can_manage_topics`: https://core.telegram.org/bots/api#createforumtopic
- Chat/ChatFullInfo includes `is_forum`: https://core.telegram.org/bots/api#chatfullinfo

---

### 4) Long polling misses updates after downtime (over 24h)
**Symptoms**
- You restart the bot and it never processes older events.
- Users say "we wrote yesterday, nothing happened."

**Root cause**
- Telegram does not keep updates longer than 24 hours for `getUpdates`.

**Recipe**
- For Vera pilot: accept this risk (scope is minimal).
- Operational mitigations:
  - keep the bot process running 24/7 (systemd or docker restart policy)
  - alert on downtime
- Later (Phase 2/3): switch to webhooks for stronger delivery.

**Source**
- getUpdates retention: https://core.telegram.org/bots/api#getupdates

---

### 5) Confusing chat IDs (negative IDs, -100...)
**Symptoms**
- You copied a group id from UI and API calls fail ("chat not found").
- IDs look like `-1001234567890`.

**Root cause**
- Telegram uses signed or encoded identifiers for different dialog types.

**Recipe**
- Always use the `chat.id` you receive from Telegram updates.
- Store it exactly (as a 64-bit integer).
- If you must convert between formats, use Telegram's official dialog id rules.

**Source**
- Official dialog id reference: https://core.telegram.org/api/bots/ids

---

### 6) "Forbidden: bot was blocked by the user"
**Symptoms**
- Relaying organizer replies to a participant fails.

**Root cause**
- User blocked the bot (or revoked permissions).

**Recipe**
- On this error:
  - mark conversation as `blocked`
  - stop retrying sends to that user
  - optionally notify organizers in-topic: "User blocked bot; cannot deliver replies."

**Sources**
- Practical references:
  - https://stackoverflow.com/questions/54867303/telegram-bot-cant-send-messages-to-user
  - https://github.com/yagop/node-telegram-bot-api/issues/404

---

### 7) Supergroup migration breaks stored IDs
**Symptoms**
- After admins "upgrade group", bot starts failing to send to old group id.

**Root cause**
- Group id changes on migration; Telegram emits migration fields in updates.

**Recipe**
- If you observe migration in updates, update stored `support_group_id` to the new id.
- Keep config editable so you can hot-fix.

**Sources**
- Practical references:
  - https://stackoverflow.com/questions/47445539/telegram-supergroup-migration-bot-api

## Minimal operational checklist (pilot)
- [ ] Bot is admin in the organizer supergroup
- [ ] Organizer supergroup has Topics enabled (`is_forum`)
- [ ] Only ONE polling instance is running (avoid conflicts)
- [ ] Docker restart policy enabled (auto-restart)
- [ ] Logs persist to disk (so failures are diagnosable)
