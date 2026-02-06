// shared/types.ts
// Phase 1 ONLY: DM ↔ Topic relay types (single-tenant but future-proofed with desk_id)
// Strict TS: no any, no implicit any.

export type DeskId = string;
export type UUID = string;
export type UnixMs = number;

/**
 * Environment-based configuration loaded at startup.
 * Validates all required env vars are present.
 */
export interface Config {
  bot_token: string;
  organizer_forum_chat_id: number;
  desk_id: DeskId;
  sqlite_path: string;
  log_level: "debug" | "info" | "warn" | "error";
}

/**
 * Single-tenant in Phase 1 (Vera), but keep desk_id everywhere so Phase 2+ is trivial.
 */
export interface DeskConfig {
  desk_id: DeskId;
  organizer_forum_chat_id: number;
  created_at_ms: UnixMs;
}

/**
 * Telegram message kinds we explicitly support in Phase 1.
 */
export type SupportedRelayKind =
  | "text"
  | "photo"
  | "document"
  | "voice"
  | "video"
  | "sticker";

/**
 * Telegram message kinds we may encounter but do not guarantee full fidelity.
 */
export type UnsupportedRelayKind =
  | "audio"
  | "animation"
  | "video_note"
  | "contact"
  | "location"
  | "venue"
  | "poll"
  | "dice"
  | "game"
  | "invoice"
  | "successful_payment"
  | "story"
  | "unknown";

export type RelayKind = SupportedRelayKind | UnsupportedRelayKind;

/**
 * Conversation lifecycle for Phase 1.
 */
export type ConversationStatus = "open" | "blocked" | "archived";

/**
 * A participant DM is mapped to exactly one forum topic in the organizer group.
 */
export interface Conversation {
  conversation_id: UUID;
  desk_id: DeskId;

  participant_user_id: number;
  participant_display_name: string;  // For topic title + logging
  participant_username?: string;     // Optional @username

  topic_thread_id: number;
  status: ConversationStatus;

  created_at_ms: UnixMs;
  updated_at_ms: UnixMs;
}

/**
 * Direction of relay.
 */
export type RelayDirection = "participant_to_organizers" | "organizers_to_participant";

/**
 * A minimal immutable record of each relay attempt.
 */
export interface RelayLog {
  relay_id: UUID;
  conversation_id: UUID;
  desk_id: DeskId;

  direction: RelayDirection;
  kind: RelayKind;

  from_chat_id: number;
  from_message_id: number;

  to_chat_id?: number;
  to_message_id?: number;

  created_at_ms: UnixMs;

  ok: boolean;
  error_code?: RelayErrorCode;
  error_message?: string;
}

/**
 * Normalized error codes.
 */
export type RelayErrorCode =
  | "TELEGRAM_429_RATE_LIMIT"
  | "TELEGRAM_FORBIDDEN"
  | "TELEGRAM_BAD_REQUEST"
  | "TELEGRAM_NETWORK"
  | "TOPIC_THREAD_NOT_FOUND"
  | "PARTICIPANT_BLOCKED_BOT"
  | "UNSUPPORTED_MESSAGE_KIND"
  | "INVARIANT_VIOLATION";

/**
 * Result from domain services.
 */
export interface GetOrCreateConversationResult {
  conversation: Conversation;
  was_created: boolean;
}

/**
 * Framework-agnostic message reference for domain logic.
 */
export interface InboundTelegramMessageRef {
  chat_id: number;
  message_id: number;
  message_thread_id?: number;
  from_user_id?: number;
  from_user_display_name?: string;  // Added for topic creation
  from_user_username?: string;      // Added for topic creation
  kind: RelayKind;
  text_preview?: string;
}

/**
 * Commands supported in Phase 1.
 */
export type SupportedCommand = "start";

/**
 * Pilot metrics (optional, computed from RelayLog).
 */
export interface PilotMetrics {
  total_conversations: number;
  total_relay_attempts: number;
  total_relay_success: number;
  total_relay_fail: number;
  first_reply_median_ms?: number;
}
