import type { Config as SharedConfig, DeskId } from "../../shared/types";

export type Config = SharedConfig;
export type LogLevel = Config["log_level"];

const LOG_LEVELS: Record<LogLevel, true> = {
  debug: true,
  info: true,
  warn: true,
  error: true
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error("Missing required env var: " + name);
  }
  return value;
}

function requireInt(name: string): number {
  const raw = requireEnv(name);
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) {
    throw new Error("Invalid env var " + name + ": expected integer");
  }
  return parsed;
}

function requireDeskId(name: string): DeskId {
  return requireEnv(name);
}

function requireLogLevel(name: string): LogLevel {
  const raw = requireEnv(name).toLowerCase();
  if (raw in LOG_LEVELS) {
    return raw as LogLevel;
  }
  throw new Error("Invalid env var " + name + ": expected debug|info|warn|error");
}

export function loadConfig(): Config {
  return {
    bot_token: requireEnv("bot_token"),
    organizer_forum_chat_id: requireInt("organizer_forum_chat_id"),
    desk_id: requireDeskId("desk_id"),
    sqlite_path: requireEnv("sqlite_path"),
    log_level: requireLogLevel("log_level")
  };
}
