import type { APIMethods, Bot, ContextType } from "gramio";
import { TelegramError } from "gramio";

import type { Config } from "../config";
import type { Logger } from "../logger";
import type { ConversationsRepo } from "../db/conversations_repo";
import type { MessageLogRepo } from "../db/message_log_repo";
import { recordRelayAttempt } from "../domain/relay";
import type {
  Conversation,
  InboundTelegramMessageRef,
  RelayErrorCode,
  SupportedRelayKind,
  UnsupportedRelayKind
} from "../../../shared/types";
import type { TelegramApi } from "./telegram_api";

export type OrganizerHandlersDeps = {
  config: Config;
  conversationsRepo: ConversationsRepo;
  messageLogRepo: MessageLogRepo;
  telegramApi: TelegramApi;
  logger: Logger;
};

type MessageContext = ContextType<Bot, "message">;

type RelayKindDetection =
  | { kind: SupportedRelayKind; supported: true }
  | { kind: UnsupportedRelayKind; supported: false };

export function registerOrganizerGroupHandlers(
  bot: Bot,
  deps: OrganizerHandlersDeps
): void {
  bot.on("message", async (context) => {
    if (context.chatId !== deps.config.organizer_forum_chat_id) {
      return;
    }

    const fromUser = context.from;
    if (!fromUser || fromUser.isBot()) {
      return;
    }

    const threadId = context.threadId;
    if (threadId === undefined) {
      return;
    }

    const conversation = deps.conversationsRepo.getByTopicThreadId(
      deps.config.desk_id,
      threadId
    );
    if (!conversation) {
      deps.logger.warn("no conversation for topic thread: " + threadId);
      return;
    }

    if (conversation.status !== "open") {
      deps.logger.warn(
        "conversation not open for thread: " + threadId + " status=" + conversation.status
      );
      return;
    }

    const relayKind = detectRelayKind(context);
    const textPreview = getTextPreview(context);
    const messageRef: InboundTelegramMessageRef = {
      chat_id: context.chatId,
      message_id: context.id,
      message_thread_id: context.threadId,
      kind: relayKind.kind,
      text_preview: textPreview
    };

    if (relayKind.supported) {
      await relaySupportedMessage(deps, messageRef, conversation);
    } else {
      await relayUnsupportedMessage(
        deps,
        messageRef,
        conversation,
        relayKind.kind,
        textPreview
      );
    }
  });
}

async function relaySupportedMessage(
  deps: OrganizerHandlersDeps,
  messageRef: InboundTelegramMessageRef,
  conversation: Conversation
): Promise<void> {
  try {
    const copied = await deps.telegramApi.copyMessage({
      chat_id: conversation.participant_user_id,
      from_chat_id: messageRef.chat_id,
      message_id: messageRef.message_id
    });

    recordRelayAttempt(deps.messageLogRepo, {
      conversation_id: conversation.conversation_id,
      desk_id: deps.config.desk_id,
      direction: "organizers_to_participant",
      kind: messageRef.kind,
      from_chat_id: messageRef.chat_id,
      from_message_id: messageRef.message_id,
      to_chat_id: conversation.participant_user_id,
      to_message_id: extractMessageId(copied),
      ok: true
    });
  } catch (error) {
    const relayError = toRelayError(error);
    if (relayError.code === "PARTICIPANT_BLOCKED_BOT") {
      const updatedAtMs = Date.now();
      deps.conversationsRepo.updateStatus(
        deps.config.desk_id,
        conversation.conversation_id,
        "blocked",
        updatedAtMs
      );
      deps.logger.warn(
        "participant blocked bot; marking conversation blocked: " +
          conversation.conversation_id
      );
    }
    recordRelayAttempt(deps.messageLogRepo, {
      conversation_id: conversation.conversation_id,
      desk_id: deps.config.desk_id,
      direction: "organizers_to_participant",
      kind: messageRef.kind,
      from_chat_id: messageRef.chat_id,
      from_message_id: messageRef.message_id,
      to_chat_id: conversation.participant_user_id,
      ok: false,
      error_code: relayError.code,
      error_message: relayError.message
    });

    deps.logger.error("organizer relay copy failed: " + relayError.message);
  }
}

async function relayUnsupportedMessage(
  deps: OrganizerHandlersDeps,
  messageRef: InboundTelegramMessageRef,
  conversation: Conversation,
  kind: UnsupportedRelayKind,
  textPreview: string | undefined
): Promise<void> {
  deps.logger.warn("unsupported organizer relay kind: " + kind);

  const summary = buildUnsupportedSummary(kind, textPreview);
  try {
    const sent = await deps.telegramApi.sendMessage({
      chat_id: conversation.participant_user_id,
      text: summary
    });

    recordRelayAttempt(deps.messageLogRepo, {
      conversation_id: conversation.conversation_id,
      desk_id: deps.config.desk_id,
      direction: "organizers_to_participant",
      kind,
      from_chat_id: messageRef.chat_id,
      from_message_id: messageRef.message_id,
      to_chat_id: conversation.participant_user_id,
      to_message_id: extractMessageId(sent),
      ok: false,
      error_code: "UNSUPPORTED_MESSAGE_KIND",
      error_message: "Unsupported message kind: " + kind
    });
  } catch (error) {
    const relayError = toRelayError(error);
    recordRelayAttempt(deps.messageLogRepo, {
      conversation_id: conversation.conversation_id,
      desk_id: deps.config.desk_id,
      direction: "organizers_to_participant",
      kind,
      from_chat_id: messageRef.chat_id,
      from_message_id: messageRef.message_id,
      to_chat_id: conversation.participant_user_id,
      ok: false,
      error_code: relayError.code,
      error_message: "Unsupported message kind: " + kind + ". " + relayError.message
    });

    deps.logger.error("organizer relay summary failed: " + relayError.message);
  }
}

function detectRelayKind(context: MessageContext): RelayKindDetection {
  if (context.text !== undefined) {
    return { kind: "text", supported: true };
  }

  if (context.photo !== undefined) {
    return { kind: "photo", supported: true };
  }

  if (context.document !== undefined) {
    return { kind: "document", supported: true };
  }

  if (context.voice !== undefined) {
    return { kind: "voice", supported: true };
  }

  if (context.video !== undefined) {
    return { kind: "video", supported: true };
  }

  if (context.sticker !== undefined) {
    return { kind: "sticker", supported: true };
  }

  if (context.audio !== undefined) {
    return { kind: "audio", supported: false };
  }

  if (context.animation !== undefined) {
    return { kind: "animation", supported: false };
  }

  if (context.videoNote !== undefined) {
    return { kind: "video_note", supported: false };
  }

  if (context.contact !== undefined) {
    return { kind: "contact", supported: false };
  }

  if (context.location !== undefined) {
    return { kind: "location", supported: false };
  }

  if (context.venue !== undefined) {
    return { kind: "venue", supported: false };
  }

  if (context.poll !== undefined) {
    return { kind: "poll", supported: false };
  }

  if (context.dice !== undefined) {
    return { kind: "dice", supported: false };
  }

  if (context.game !== undefined) {
    return { kind: "game", supported: false };
  }

  if (context.invoice !== undefined) {
    return { kind: "invoice", supported: false };
  }

  if (context.successfulPayment !== undefined) {
    return { kind: "successful_payment", supported: false };
  }

  if (context.story !== undefined) {
    return { kind: "story", supported: false };
  }

  return { kind: "unknown", supported: false };
}

function getTextPreview(context: MessageContext): string | undefined {
  const raw = context.text ?? context.caption;
  if (raw === undefined) {
    return undefined;
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  return trimmed;
}

function buildUnsupportedSummary(
  kind: UnsupportedRelayKind,
  textPreview: string | undefined
): string {
  const lines = [`Unsupported message type: ${kind}`];
  if (textPreview) {
    lines.push(textPreview);
  }
  return lines.join("\n");
}

type RelayErrorInfo = {
  code: RelayErrorCode;
  message: string;
};

function toRelayError(error: unknown): RelayErrorInfo {
  const message = formatErrorMessage(error);
  const lowered = message.toLowerCase();
  if (lowered.includes("message thread") && lowered.includes("not found")) {
    return { code: "TOPIC_THREAD_NOT_FOUND", message };
  }
  if (lowered.includes("bot was blocked") || lowered.includes("blocked by the user")) {
    return { code: "PARTICIPANT_BLOCKED_BOT", message };
  }

  const numericCode = extractNumericErrorCode(error);
  if (numericCode === 429) {
    return { code: "TELEGRAM_429_RATE_LIMIT", message };
  }
  if (numericCode === 403) {
    return { code: "TELEGRAM_FORBIDDEN", message };
  }
  if (numericCode === 400) {
    return { code: "TELEGRAM_BAD_REQUEST", message };
  }

  if (error instanceof TelegramError) {
    return { code: "TELEGRAM_NETWORK", message: error.message };
  }
  if (error instanceof Error) {
    return { code: "TELEGRAM_NETWORK", message: error.message };
  }
  return { code: "TELEGRAM_NETWORK", message };
}

type ErrorWithCode = {
  code?: unknown;
  response?: {
    error_code?: unknown;
  };
};

function extractNumericErrorCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }
  const maybeError = error as ErrorWithCode;
  if (typeof maybeError.code === "number") {
    return maybeError.code;
  }
  if (typeof maybeError.response?.error_code === "number") {
    return maybeError.response?.error_code;
  }
  return undefined;
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function extractMessageId(value: unknown): number | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const messageId = value.message_id;
  if (typeof messageId === "number") {
    return messageId;
  }
  const id = value.id;
  if (typeof id === "number") {
    return id;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
