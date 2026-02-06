CREATE TABLE IF NOT EXISTS conversations (
  conversation_id TEXT PRIMARY KEY,
  desk_id TEXT NOT NULL,
  participant_user_id INTEGER NOT NULL,
  participant_display_name TEXT NOT NULL,
  participant_username TEXT,
  topic_thread_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'blocked', 'archived')),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL,
  UNIQUE (desk_id, participant_user_id),
  UNIQUE (desk_id, topic_thread_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_user_id
  ON conversations (desk_id, participant_user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_topic_thread_id
  ON conversations (desk_id, topic_thread_id);

CREATE TABLE IF NOT EXISTS relay_logs (
  relay_id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  desk_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (
    direction IN ('participant_to_organizers', 'organizers_to_participant')
  ),
  kind TEXT NOT NULL,
  from_chat_id INTEGER NOT NULL,
  from_message_id INTEGER NOT NULL,
  to_chat_id INTEGER,
  to_message_id INTEGER,
  created_at_ms INTEGER NOT NULL,
  ok INTEGER NOT NULL CHECK (ok IN (0, 1)),
  error_code TEXT,
  error_message TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
);
