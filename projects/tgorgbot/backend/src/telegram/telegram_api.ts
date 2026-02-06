import type { APIMethodParams, APIMethodReturn, Bot } from "gramio";
import { withTelegramRetry } from "./retry";

type ForcedRateLimitError = Error & {
  code: number;
  parameters: {
    retry_after: number;
  };
};

const FORCE_429_EVERY_N = Number.parseInt(
  process.env.FORCE_429_EVERY_N ?? "",
  10
);
let apiCallCount = 0;

function maybeForceRateLimit(): void {
  if (!Number.isFinite(FORCE_429_EVERY_N) || FORCE_429_EVERY_N <= 0) {
    return;
  }
  apiCallCount += 1;
  if (apiCallCount % FORCE_429_EVERY_N !== 0) {
    return;
  }
  const error = new Error("forced 429") as ForcedRateLimitError;
  error.code = 429;
  error.parameters = { retry_after: 2 };
  throw error;
}

function wrap<TParams, TResult>(
  fn: (params: TParams) => Promise<TResult>
): (params: TParams) => Promise<TResult> {
  return (params: TParams) =>
    withTelegramRetry(async () => {
      maybeForceRateLimit();
      return fn(params);
    });
}

export type TelegramApi = {
  createForumTopic: (
    params: APIMethodParams<"createForumTopic">
  ) => Promise<APIMethodReturn<"createForumTopic">>;
  sendMessage: (
    params: APIMethodParams<"sendMessage">
  ) => Promise<APIMethodReturn<"sendMessage">>;
  copyMessage: (
    params: APIMethodParams<"copyMessage">
  ) => Promise<APIMethodReturn<"copyMessage">>;
};

export function createTelegramApi(bot: Bot): TelegramApi {
  return {
    createForumTopic: wrap((params: APIMethodParams<"createForumTopic">) =>
      bot.api.createForumTopic(params)
    ),
    sendMessage: wrap((params: APIMethodParams<"sendMessage">) =>
      bot.api.sendMessage(params)
    ),
    copyMessage: wrap((params: APIMethodParams<"copyMessage">) =>
      bot.api.copyMessage(params)
    )
  };
}
