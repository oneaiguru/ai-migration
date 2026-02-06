# TELEGRAM_TOPICS.md

## What this doc is for
We route each participant DM into a forum topic inside the organizers' supergroup, then relay organizer replies back to the participant. This doc captures the exact Telegram Bot API mechanics that matter for that routing.

## Key facts (max 10)
- Forum topics exist only in forum-enabled supergroups. Telegram exposes this via `is_forum` on `Chat` / `ChatFullInfo`.
- Each forum topic has a stable numeric identifier: `ForumTopic.message_thread_id`.
- Each message posted inside a topic includes `Message.message_thread_id` (unique identifier of the message thread / topic).
- To send (or copy) a message into a topic, you pass `message_thread_id` along with `chat_id` of the forum supergroup.
- Topics are created via `createForumTopic` and it requires the bot to have admin rights plus `can_manage_topics` in that chat.
- If the topic is deleted (or becomes invalid), sending/copying to that `message_thread_id` may fail (commonly reported as "message thread not found") and you must recreate/remap.
- The bot must be in the organizer supergroup (obvious) and must be allowed to post in the topic (admin rights make this predictable).
- Topic creation is optional after the first DM: you should reuse the existing topic for that participant, not create new every time.

## Code implications for Vera pilot
### 1) Validate the support group is a forum (startup health check)
- On boot, call `getChat(support_group_id)` and verify `is_forum === true`.
- If not a forum, log a fatal config error and refuse to start (or start but reply to admins with "enable Topics").

### 2) DM -> topic mapping model
Store:
- `participant_user_id` (private chat id is the user id)
- `support_group_id`
- `topic_thread_id` (`message_thread_id` returned from `createForumTopic`)
- timestamps + status

Routing logic:
- If DM from user:
  - lookup conversation by `participant_user_id`
  - if not found -> create topic -> persist mapping
  - `copyMessage` from private chat -> to `support_group_id` with `message_thread_id = topic_thread_id`

### 3) Organizer reply detection
- On message event in the organizer supergroup:
  - ignore messages without `message_thread_id` (not in a topic)
  - use `message_thread_id` to lookup conversation
  - if found, relay via `copyMessage` from group -> to `participant_user_id`

### 4) Topic title convention (practical)
Use a deterministic title so humans can navigate:
- `"{Full Name} (@username) · {user_id}"` truncated to 128 chars

### 5) Recovery when a topic is missing
If any send/copy fails with an error indicating invalid thread:
- Create new topic
- Update mapping
- Retry the copy once

## Edge cases to explicitly handle
- Participant changes username: do not key on username. Key on numeric user id.
- Organizers write in the "General" chat (no thread id): ignore.
- Topic deleted manually: treat as "thread not found" -> recreate.
- Group converted / migrated (chat id changes): update config (see KNOWN_BUGS_AND_RECIPES.md).

## Sources (URLs)
- Telegram Bot API: createForumTopic + required rights (`can_manage_topics`): https://core.telegram.org/bots/api#createforumtopic
- Telegram Bot API: ForumTopic object (`message_thread_id`): https://core.telegram.org/bots/api#forumtopic
- Telegram Bot API: Message object (`message_thread_id`): https://core.telegram.org/bots/api#message
- Telegram Bot API: sendMessage parameter `message_thread_id`: https://core.telegram.org/bots/api#sendmessage
- Telegram Bot API: getChat / ChatFullInfo (`is_forum`): https://core.telegram.org/bots/api#getchat
- Community reports on "message thread not found" failures:
  - https://github.com/yagop/node-telegram-bot-api/issues/596
  - https://github.com/python-telegram-bot/python-telegram-bot/issues/472
