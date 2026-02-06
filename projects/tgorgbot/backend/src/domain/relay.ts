import { randomUUID } from "crypto";

import type {
  DeskId,
  RelayDirection,
  RelayErrorCode,
  RelayKind,
  RelayLog,
  UUID
} from "../../../shared/types";
import { MessageLogRepo } from "../db/message_log_repo";

export type RelayAttemptInput = {
  conversation_id: UUID;
  desk_id: DeskId;
  direction: RelayDirection;
  kind: RelayKind;
  from_chat_id: number;
  from_message_id: number;
  to_chat_id?: number;
  to_message_id?: number;
  ok: boolean;
  error_code?: RelayErrorCode;
  error_message?: string;
};

export function recordRelayAttempt(
  messageLogRepo: MessageLogRepo,
  input: RelayAttemptInput
): RelayLog {
  const log: RelayLog = {
    relay_id: randomUUID(),
    conversation_id: input.conversation_id,
    desk_id: input.desk_id,
    direction: input.direction,
    kind: input.kind,
    from_chat_id: input.from_chat_id,
    from_message_id: input.from_message_id,
    to_chat_id: input.to_chat_id,
    to_message_id: input.to_message_id,
    created_at_ms: Date.now(),
    ok: input.ok,
    error_code: input.error_code,
    error_message: input.error_message
  };

  messageLogRepo.insert(log);

  return log;
}
