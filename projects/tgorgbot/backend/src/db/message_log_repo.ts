import type {
  RelayDirection,
  RelayErrorCode,
  RelayKind,
  RelayLog,
  UUID
} from "../../../shared/types";
import type { SqliteDatabase } from "./sqlite";

type RelayLogRow = {
  relay_id: string;
  conversation_id: string;
  desk_id: string;
  direction: string;
  kind: string;
  from_chat_id: number;
  from_message_id: number;
  to_chat_id: number | null;
  to_message_id: number | null;
  created_at_ms: number;
  ok: number;
  error_code: string | null;
  error_message: string | null;
};

type Statement = ReturnType<SqliteDatabase["prepare"]>;

const RELAY_DIRECTIONS: Record<RelayDirection, true> = {
  participant_to_organizers: true,
  organizers_to_participant: true
};

const RELAY_KINDS: Record<RelayKind, true> = {
  text: true,
  photo: true,
  document: true,
  voice: true,
  video: true,
  sticker: true,
  audio: true,
  animation: true,
  video_note: true,
  contact: true,
  location: true,
  venue: true,
  poll: true,
  dice: true,
  game: true,
  invoice: true,
  successful_payment: true,
  story: true,
  unknown: true
};

const RELAY_ERROR_CODES: Record<RelayErrorCode, true> = {
  TELEGRAM_429_RATE_LIMIT: true,
  TELEGRAM_FORBIDDEN: true,
  TELEGRAM_BAD_REQUEST: true,
  TELEGRAM_NETWORK: true,
  TOPIC_THREAD_NOT_FOUND: true,
  PARTICIPANT_BLOCKED_BOT: true,
  UNSUPPORTED_MESSAGE_KIND: true,
  INVARIANT_VIOLATION: true
};

function parseRelayDirection(value: string): RelayDirection {
  if (Object.prototype.hasOwnProperty.call(RELAY_DIRECTIONS, value)) {
    return value as RelayDirection;
  }
  throw new Error("Invalid relay direction: " + value);
}

function parseRelayKind(value: string): RelayKind {
  if (Object.prototype.hasOwnProperty.call(RELAY_KINDS, value)) {
    return value as RelayKind;
  }
  throw new Error("Invalid relay kind: " + value);
}

function parseRelayErrorCode(value: string | null): RelayErrorCode | undefined {
  if (value === null) {
    return undefined;
  }
  if (Object.prototype.hasOwnProperty.call(RELAY_ERROR_CODES, value)) {
    return value as RelayErrorCode;
  }
  throw new Error("Invalid relay error code: " + value);
}

function mapRelayLogRow(row: RelayLogRow): RelayLog {
  return {
    relay_id: row.relay_id,
    conversation_id: row.conversation_id,
    desk_id: row.desk_id,
    direction: parseRelayDirection(row.direction),
    kind: parseRelayKind(row.kind),
    from_chat_id: row.from_chat_id,
    from_message_id: row.from_message_id,
    to_chat_id: row.to_chat_id ?? undefined,
    to_message_id: row.to_message_id ?? undefined,
    created_at_ms: row.created_at_ms,
    ok: row.ok === 1,
    error_code: parseRelayErrorCode(row.error_code),
    error_message: row.error_message ?? undefined
  };
}

export class MessageLogRepo {
  private readonly insertStmt: Statement;
  private readonly getByRelayIdStmt: Statement;

  constructor(private readonly db: SqliteDatabase) {
    this.insertStmt = db.prepare(
      "INSERT INTO relay_logs (" +
        "relay_id, conversation_id, desk_id, direction, kind, " +
        "from_chat_id, from_message_id, to_chat_id, to_message_id, " +
        "created_at_ms, ok, error_code, error_message" +
      ") VALUES (" +
        "@relay_id, @conversation_id, @desk_id, @direction, @kind, " +
        "@from_chat_id, @from_message_id, @to_chat_id, @to_message_id, " +
        "@created_at_ms, @ok, @error_code, @error_message" +
      ")"
    );
    this.getByRelayIdStmt = db.prepare(
      "SELECT * FROM relay_logs WHERE relay_id = @relay_id"
    );
  }

  insert(log: RelayLog): void {
    this.insertStmt.run({
      relay_id: log.relay_id,
      conversation_id: log.conversation_id,
      desk_id: log.desk_id,
      direction: log.direction,
      kind: log.kind,
      from_chat_id: log.from_chat_id,
      from_message_id: log.from_message_id,
      to_chat_id: log.to_chat_id ?? null,
      to_message_id: log.to_message_id ?? null,
      created_at_ms: log.created_at_ms,
      ok: log.ok ? 1 : 0,
      error_code: log.error_code ?? null,
      error_message: log.error_message ?? null
    });
  }

  getByRelayId(relayId: UUID): RelayLog | null {
    const row = this.getByRelayIdStmt.get({
      relay_id: relayId
    }) as RelayLogRow | undefined;
    if (!row) {
      return null;
    }
    return mapRelayLogRow(row);
  }
}
