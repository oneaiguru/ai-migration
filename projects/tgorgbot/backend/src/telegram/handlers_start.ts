import type { Bot } from "gramio";

const WELCOME_MESSAGE = "Welcome! Send your message here to reach the organizers.";

export function registerStartHandler(bot: Bot): void {
  bot.command("start", (context) => {
    if (context.chat?.type !== "private") {
      return;
    }

    return context.send(WELCOME_MESSAGE);
  });
}
