# TELEGRAM_COPY_FORWARD_PROTECTED.md

## What this doc is for
For all relays (participant -> organizers topic, and organizer reply -> participant), we must copy messages, not forward them. This avoids failures with protected content and avoids "Forwarded from" UI artifacts.

## Key facts (max 10)
- `forwardMessage` explicitly cannot forward messages with protected content (and also cannot forward service messages).
- `copyMessage` is "analogous" to forwarding but does not link to the original; it is the correct primitive for relaying.
- `copyMessage` has explicit exclusions: service messages, paid media messages, giveaway messages, giveaway winners messages, and invoice messages cannot be copied; quiz polls only copy if `correct_option_id` is known to the bot.
- Many `sendX` methods also accept `protect_content` to prevent forwarding/saving of messages you send.
- Chats may indicate protection via `Chat.has_protected_content` (useful as a signal; not sufficient to predict all per-message copy failures).
- `copyMessage` supports `message_thread_id`, so you can copy directly into a forum topic.
- `copyMessages` exists (batch copy) and keeps album grouping; may be useful later for media groups.

## Code implications for Vera pilot
### Decision: Always use copy, never forward
- For every relay operation, use:
  - `copyMessage` for single messages
  - optionally later: `copyMessages` for media groups / albums

### Required fallback behavior
When `copyMessage` fails:
- Do not try `forwardMessage` as a fallback.
- Instead:
  1) send a text message that summarizes what was received (type + optional caption + "unsupported content")
  2) log the failure details (Telegram error code/message, message type, ids)

Minimal fallback summaries:
- "Unsupported message type: {type}. Please resend as text or file."
- "Could not copy message (protected/unsupported). Please describe it in text."

### What to log for debugging
Log these fields at minimum on copy failure:
- `from_chat_id`, `to_chat_id`, `message_id`
- detected message type (text/photo/document/voice/video/etc.)
- `participant_user_id`, `topic_thread_id`
- Telegram error (code + description)

### Practical note
If you also want a visible "header" with participant identity inside the topic:
- Send a normal `sendMessage` to the topic with participant info
- Then `copyMessage` the content
This avoids trying to edit captions during copy.

## Sources (URLs)
- Telegram Bot API: forwardMessage limitations (protected content cannot be forwarded): https://core.telegram.org/bots/api#forwardmessage
- Telegram Bot API: copyMessage limitations + no link to original: https://core.telegram.org/bots/api#copymessage
- Telegram Bot API: copyMessages (batch copy, album grouping preserved): https://core.telegram.org/bots/api#copymessages
- Telegram Bot API: Chat.has_protected_content: https://core.telegram.org/bots/api#chat
- Telegram Bot API: message_thread_id parameter for copy/send into forum topics:
  - https://core.telegram.org/bots/api#copymessage
  - https://core.telegram.org/bots/api#sendmessage
