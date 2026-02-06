import type { APIMethods, Bot, ContextType, User } from "gramio";
import { TelegramError } from "gramio";

import type { Config } from "../config";
import type { Logger } from "../logger";
import type { ConversationsRepo } from "../db/conversations_repo";
import type { MessageLogRepo } from "../db/message_log_repo";
import type { CreateTopicInput } from "../domain/conversations";
import { getOrCreateConversation } from "../domain/conversations";
import { formatInitialHeaderMessage, formatTopicTitle } from "../domain/format";
import { recordRelayAttempt } from "../domain/relay";
import type {
  Conversation,
  InboundTelegramMessageRef,
  RelayErrorCode,
  SupportedRelayKind,
  UnsupportedRelayKind
} from "../../../shared/types";
import type { TelegramApi } from "./telegram_api";

export type PrivateHandlersDeps = {
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

export function registerPrivateHandlers(bot: Bot, deps: PrivateHandlersDeps): void {
  bot.on("message", async (context) => {
    if (!context.isPM()) {
      return;
    }

    const fromUser = context.from;
    if (!fromUser || fromUser.isBot()) {
      return;
    }

    const relayKind = detectRelayKind(context);
    const textPreview = getTextPreview(context);
    const messageRef: InboundTelegramMessageRef = {
      chat_id: context.chatId,
      message_id: context.id,
      message_thread_id: context.threadId,
      from_user_id: fromUser.id,
      from_user_display_name: buildDisplayName(fromUser),
      from_user_username: fromUser.username,
      kind: relayKind.kind,
      text_preview: textPreview
    };

    let conversationResult;
    try {
      conversationResult = await getOrCreateConversation(
        deps.conversationsRepo,
        deps.config.desk_id,
        messageRef,
        (input) => createTopic(deps, input)
      );
    } catch (error) {
      deps.logger.error(
        "conversation get/create failed: " + formatErrorMessage(error)
      );
      return;
    }

    if (relayKind.supported) {
      await relaySupportedMessage(deps, messageRef, conversationResult.conversation);
    } else {
      await relayUnsupportedMessage(
        deps,
        messageRef,
        conversationResult.conversation,
        relayKind.kind,
        textPreview
      );
    }
  });
}

async function createTopic(
  deps: PrivateHandlersDeps,
  input: CreateTopicInput
): Promise<number> {
  const topic = await deps.telegramApi.createForumTopic({
    chat_id: deps.config.organizer_forum_chat_id,
    name: input.topic_title
  });

  await deps.telegramApi.sendMessage({
    chat_id: deps.config.organizer_forum_chat_id,
    message_thread_id: topic.message_thread_id,
    text: input.header_message
  });

  return topic.message_thread_id;
}

async function relaySupportedMessage(
  deps: PrivateHandlersDeps,
  messageRef: InboundTelegramMessageRef,
  conversation: Conversation,
  allowRecovery: boolean = true
): Promise<void> {
  try {
    const copied = await deps.telegramApi.copyMessage({
      chat_id: deps.config.organizer_forum_chat_id,
      message_thread_id: conversation.topic_thread_id,
      from_chat_id: messageRef.chat_id,
      message_id: messageRef.message_id
    });

    recordRelayAttempt(deps.messageLogRepo, {
      conversation_id: conversation.conversation_id,
      desk_id: deps.config.desk_id,
      direction: "participant_to_organizers",
      kind: messageRef.kind,
      from_chat_id: messageRef.chat_id,
      from_message_id: messageRef.message_id,
      to_chat_id: deps.config.organizer_forum_chat_id,
      to_message_id: extractMessageId(copied),
      ok: true
    });
  } catch (error) {
    const relayError = toRelayError(error);
    if (allowRecovery && relayError.code === "TOPIC_THREAD_NOT_FOUND") {
      const recovered = await recoverMissingTopic(deps, messageRef, conversation);
      if (recovered) {
        await relaySupportedMessage(deps, messageRef, recovered, false);
        return;
      }
    }
    recordRelayAttempt(deps.messageLogRepo, {
      conversation_id: conversation.conversation_id,
      desk_id: deps.config.desk_id,
      direction: "participant_to_organizers",
      kind: messageRef.kind,
      from_chat_id: messageRef.chat_id,
      from_message_id: messageRef.message_id,
      to_chat_id: deps.config.organizer_forum_chat_id,
      ok: false,
      error_code: relayError.code,
      error_message: relayError.message
    });

    deps.logger.error(
      "relay copy failed: " + relayError.message
    );
  }
}

async function recoverMissingTopic(
  deps: PrivateHandlersDeps,
  messageRef: InboundTelegramMessageRef,
  conversation: Conversation
): Promise<Conversation | null> {
  deps.logger.warn(
    "topic thread not found; recreating topic for conversation " +
      conversation.conversation_id
  );

  const input = buildRecoveryTopicInput(messageRef, conversation);
  try {
    const newThreadId = await createTopic(deps, input);
    const updatedAtMs = Date.now();
    deps.conversationsRepo.updateTopicThreadId(
      deps.config.desk_id,
      conversation.conversation_id,
      newThreadId,
      updatedAtMs
    );
    return {
      ...conversation,
      topic_thread_id: newThreadId,
      updated_at_ms: updatedAtMs
    };
  } catch (error) {
    deps.logger.error("topic recovery failed: " + formatErrorMessage(error));
    return null;
  }
}

function buildRecoveryTopicInput(
  messageRef: InboundTelegramMessageRef,
  conversation: Conversation
): CreateTopicInput {
  return {
    topic_title: formatTopicTitle(
      conversation.participant_display_name,
      conversation.participant_username
    ),
    header_message: formatInitialHeaderMessage({
      participant_display_name: conversation.participant_display_name,
      participant_username: conversation.participant_username,
      participant_user_id: conversation.participant_user_id,
      text_preview: messageRef.text_preview
    })
  };
}

async function relayUnsupportedMessage(
  deps: PrivateHandlersDeps,
  messageRef: InboundTelegramMessageRef,
  conversation: Conversation,
  kind: UnsupportedRelayKind,
  textPreview: string | undefined
): Promise<void> {
  deps.logger.warn("unsupported relay kind: " + kind);

  const summary = buildUnsupportedSummary(kind, textPreview);
  try {
    const sent = await deps.telegramApi.sendMessage({
      chat_id: deps.config.organizer_forum_chat_id,
      message_thread_id: conversation.topic_thread_id,
      text: summary
    });

    recordRelayAttempt(deps.messageLogRepo, {
      conversation_id: conversation.conversation_id,
      desk_id: deps.config.desk_id,
      direction: "participant_to_organizers",
      kind,
      from_chat_id: messageRef.chat_id,
      from_message_id: messageRef.message_id,
      to_chat_id: deps.config.organizer_forum_chat_id,
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
      direction: "participant_to_organizers",
      kind,
      from_chat_id: messageRef.chat_id,
      from_message_id: messageRef.message_id,
      to_chat_id: deps.config.organizer_forum_chat_id,
      ok: false,
      error_code: relayError.code,
      error_message: "Unsupported message kind: " + kind + ". " + relayError.message
    });

    deps.logger.error(
      "relay summary failed: " + relayError.message
    );
  }
}

function detectRelayKind(context: MessageContext): RelayKindDetection {
  if (context.text !== undefined) {
    return { kind: "text", supported: true };
  }

  if (context.photo !== undefined) {
    return { kind: "photo", supported: true };
  }

  if (context.animation !== undefined) {
    return { kind: "animation", supported: false };
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

function buildDisplayName(user: User): string {
  const parts = [user.firstName, user.lastName]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
  const joined = parts.join(" ").trim();
  if (joined.length > 0) {
    return joined;
  }
  const username = user.username?.trim();
  if (username) {
    return username;
  }
  return "Participant";
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

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
