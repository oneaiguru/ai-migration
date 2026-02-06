import { Bot } from "gramio";

import type { Config } from "../config";
import { logger } from "../logger";
import { ConversationsRepo } from "../db/conversations_repo";
import { MessageLogRepo } from "../db/message_log_repo";
import { openSqliteDb } from "../db/sqlite";
import { registerOrganizerGroupHandlers } from "./handlers_organizer_group";
import { registerPrivateHandlers } from "./handlers_private";
import { registerStartHandler } from "./handlers_start";
import { createTelegramApi } from "./telegram_api";

export function createBot(config: Config): Bot {
  const bot = new Bot(config.bot_token);
  const db = openSqliteDb(config.sqlite_path);
  const conversationsRepo = new ConversationsRepo(db);
  const messageLogRepo = new MessageLogRepo(db);
  const telegramApi = createTelegramApi(bot);

  registerStartHandler(bot);
  registerPrivateHandlers(bot, {
    config,
    conversationsRepo,
    messageLogRepo,
    telegramApi,
    logger
  });
  registerOrganizerGroupHandlers(bot, {
    config,
    conversationsRepo,
    messageLogRepo,
    telegramApi,
    logger
  });

  return bot;
}

export async function startBot(config: Config): Promise<void> {
  const bot = createBot(config);

  await bot.start({
    longPolling: {
      timeout: 10
    },
    dropPendingUpdates: true
  });
}
