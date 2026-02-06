import type {
  Conversation,
  ConversationStatus,
  DeskId,
  UUID
} from "../../../shared/types";
import type { SqliteDatabase } from "./sqlite";

type ConversationRow = {
  conversation_id: string;
  desk_id: string;
  participant_user_id: number;
  participant_display_name: string;
  participant_username: string | null;
  topic_thread_id: number;
  status: string;
  created_at_ms: number;
  updated_at_ms: number;
};

type Statement = ReturnType<SqliteDatabase["prepare"]>;

const STATUS_VALUES: Record<ConversationStatus, true> = {
  open: true,
  blocked: true,
  archived: true
};

function parseStatus(value: string): ConversationStatus {
  if (Object.prototype.hasOwnProperty.call(STATUS_VALUES, value)) {
    return value as ConversationStatus;
  }
  throw new Error("Invalid conversation status: " + value);
}

function mapConversationRow(row: ConversationRow): Conversation {
  return {
    conversation_id: row.conversation_id,
    desk_id: row.desk_id,
    participant_user_id: row.participant_user_id,
    participant_display_name: row.participant_display_name,
    participant_username: row.participant_username ?? undefined,
    topic_thread_id: row.topic_thread_id,
    status: parseStatus(row.status),
    created_at_ms: row.created_at_ms,
    updated_at_ms: row.updated_at_ms
  };
}

export class ConversationsRepo {
  private readonly insertStmt: Statement;
  private readonly getByParticipantStmt: Statement;
  private readonly getByTopicStmt: Statement;
  private readonly updateTopicStmt: Statement;
  private readonly updateStatusStmt: Statement;

  constructor(private readonly db: SqliteDatabase) {
    this.insertStmt = db.prepare(
      "INSERT INTO conversations (" +
        "conversation_id, desk_id, participant_user_id, participant_display_name, " +
        "participant_username, topic_thread_id, status, created_at_ms, updated_at_ms" +
      ") VALUES (" +
        "@conversation_id, @desk_id, @participant_user_id, @participant_display_name, " +
        "@participant_username, @topic_thread_id, @status, @created_at_ms, @updated_at_ms" +
      ")"
    );
    this.getByParticipantStmt = db.prepare(
      "SELECT * FROM conversations " +
      "WHERE desk_id = @desk_id AND participant_user_id = @participant_user_id"
    );
    this.getByTopicStmt = db.prepare(
      "SELECT * FROM conversations " +
      "WHERE desk_id = @desk_id AND topic_thread_id = @topic_thread_id"
    );
    this.updateTopicStmt = db.prepare(
      "UPDATE conversations SET topic_thread_id = @topic_thread_id, " +
      "updated_at_ms = @updated_at_ms " +
      "WHERE desk_id = @desk_id AND conversation_id = @conversation_id"
    );
    this.updateStatusStmt = db.prepare(
      "UPDATE conversations SET status = @status, updated_at_ms = @updated_at_ms " +
      "WHERE desk_id = @desk_id AND conversation_id = @conversation_id"
    );
  }

  create(conversation: Conversation): void {
    this.insertStmt.run({
      conversation_id: conversation.conversation_id,
      desk_id: conversation.desk_id,
      participant_user_id: conversation.participant_user_id,
      participant_display_name: conversation.participant_display_name,
      participant_username: conversation.participant_username ?? null,
      topic_thread_id: conversation.topic_thread_id,
      status: conversation.status,
      created_at_ms: conversation.created_at_ms,
      updated_at_ms: conversation.updated_at_ms
    });
  }

  getByParticipantUserId(
    deskId: DeskId,
    participantUserId: number
  ): Conversation | null {
    const row = this.getByParticipantStmt.get({
      desk_id: deskId,
      participant_user_id: participantUserId
    }) as ConversationRow | undefined;
    if (!row) {
      return null;
    }
    return mapConversationRow(row);
  }

  getByTopicThreadId(deskId: DeskId, topicThreadId: number): Conversation | null {
    const row = this.getByTopicStmt.get({
      desk_id: deskId,
      topic_thread_id: topicThreadId
    }) as ConversationRow | undefined;
    if (!row) {
      return null;
    }
    return mapConversationRow(row);
  }

  updateTopicThreadId(
    deskId: DeskId,
    conversationId: UUID,
    topicThreadId: number,
    updatedAtMs: number
  ): void {
    this.updateTopicStmt.run({
      desk_id: deskId,
      conversation_id: conversationId,
      topic_thread_id: topicThreadId,
      updated_at_ms: updatedAtMs
    });
  }

  updateStatus(
    deskId: DeskId,
    conversationId: UUID,
    status: ConversationStatus,
    updatedAtMs: number
  ): void {
    this.updateStatusStmt.run({
      desk_id: deskId,
      conversation_id: conversationId,
      status,
      updated_at_ms: updatedAtMs
    });
  }
}
