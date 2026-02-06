import { loadConfig } from "./config";
import { logger } from "./logger";
import { startBot } from "./telegram/bot";

const config = loadConfig();

startBot(config).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  logger.error("bot start failed: " + message);
});
logger.info("boot ok");
