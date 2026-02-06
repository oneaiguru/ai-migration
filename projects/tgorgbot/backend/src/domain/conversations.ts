import { randomUUID } from "crypto";

import type {
  Conversation,
  DeskId,
  GetOrCreateConversationResult,
  InboundTelegramMessageRef
} from "../../../shared/types";
import { ConversationsRepo } from "../db/conversations_repo";
import { formatInitialHeaderMessage, formatTopicTitle } from "./format";

export type CreateTopicInput = {
  topic_title: string;
  header_message: string;
};

export type CreateTopicFn = (input: CreateTopicInput) => number | Promise<number>;

export async function getOrCreateConversation(
  conversationsRepo: ConversationsRepo,
  deskId: DeskId,
  message: InboundTelegramMessageRef,
  createTopic: CreateTopicFn
): Promise<GetOrCreateConversationResult> {
  const participantUserId = message.from_user_id;
  if (participantUserId === undefined) {
    throw new Error("Inbound message missing from_user_id");
  }

  const existing = conversationsRepo.getByParticipantUserId(
    deskId,
    participantUserId
  );
  if (existing) {
    return { conversation: existing, was_created: false };
  }

  const participantDisplayName = normalizeDisplayName(
    message.from_user_display_name
  );
  const participantUsername = normalizeUsername(message.from_user_username);

  const topicTitle = formatTopicTitle(
    participantDisplayName,
    participantUsername
  );
  const headerMessage = formatInitialHeaderMessage({
    participant_display_name: participantDisplayName,
    participant_username: participantUsername,
    participant_user_id: participantUserId,
    text_preview: message.text_preview
  });

  const topicThreadId = await createTopic({
    topic_title: topicTitle,
    header_message: headerMessage
  });

  const now = Date.now();
  const conversation: Conversation = {
    conversation_id: randomUUID(),
    desk_id: deskId,
    participant_user_id: participantUserId,
    participant_display_name: participantDisplayName,
    participant_username: participantUsername,
    topic_thread_id: topicThreadId,
    status: "open",
    created_at_ms: now,
    updated_at_ms: now
  };

  conversationsRepo.create(conversation);

  return { conversation, was_created: true };
}

function normalizeDisplayName(value: string | undefined): string {
  if (value === undefined) {
    throw new Error("Inbound message missing from_user_display_name");
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error("Inbound message missing from_user_display_name");
  }
  return trimmed;
}

function normalizeUsername(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  return trimmed;
}
