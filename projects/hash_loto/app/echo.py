from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text("Hello! I am an echo bot. Send me a message, and I will echo it back to you.")

async def echo_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(update.message.text)

async def main() -> None:
    # Replace 'YOUR_BOT_TOKEN' with your actual bot token
    application = Application.builder().token("7012630493:AAGRrSeJPUSs3Hgu_Vyu_83DraMoJwTmfmI").build()
    
    # Register the command handler for /start
    application.add_handler(CommandHandler("start", start_command))
    
    # Register the message handler for echoing messages
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo_message))
    
    # Start the Bot
    await application.initialize()
    await application.start()
    await application.updater.start_polling()
    
    # Run the bot until you press Ctrl-C or the process receives SIGINT,
    # SIGTERM or SIGABRT. This should be used most of the time, since
    # start() is non-blocking and will stop the bot gracefully.
    await application.idle()

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
