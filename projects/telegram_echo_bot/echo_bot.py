import asyncio
import logging
import os
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Request
from telegram import Update
try:
    from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters
except ImportError as exc:  # python-telegram-bot not installed or wrong version
    Application = CommandHandler = ContextTypes = MessageHandler = filters = None
    logging.warning("python-telegram-bot>=20 required; import failed (%s)", exc)
try:
    import modal
    modal_available = True
except ImportError:
    modal = None
    modal_available = False

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI and Modal apps
fastapi_app = FastAPI()
if modal_available:
    app = modal.App(name="telegram-webhook-app")
    modal_asgi_app = modal.asgi_app
else:
    class _ModalAppStub:
        def __init__(self, name: str):
            self.name = name

        def function(self):
            def decorator(fn):
                return fn
            return decorator

    def modal_asgi_app():
        def decorator(fn):
            return fn
        return decorator

    app = _ModalAppStub(name="telegram-webhook-app")
    logger.warning("modal not installed; ASGI bindings are disabled in this environment.")

ContextType = ContextTypes.DEFAULT_TYPE if ContextTypes else Any

# Telegram bot token (may be missing locally; validated at startup)
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TOKEN:
    logger.warning("TELEGRAM_BOT_TOKEN not set; bot will fail to start until provided.")

application: Optional["Application"] = None

# Define command handler functions
async def start(update: Update, context: ContextType):
    await update.message.reply_text('Hello! Welcome to our bot.')


async def echo(update: Update, context: ContextType):
    await update.message.reply_text(update.message.text)


def build_application(token: str) -> "Application":
    app_instance = Application.builder().token(token).build()
    app_instance.add_handler(CommandHandler('start', start))
    app_instance.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
    return app_instance


if Application and TOKEN:
    application = build_application(TOKEN)
elif not TOKEN:
    logger.warning("TELEGRAM_BOT_TOKEN not set; bot disabled.")
else:
    logger.warning("python-telegram-bot Application unavailable; install python-telegram-bot>=20 to enable the bot.")

@fastapi_app.on_event("startup")
async def startup_event():
    global application

    if application is None:
        if not Application:
            raise RuntimeError("python-telegram-bot>=20 is not installed")
        token = os.getenv("TELEGRAM_BOT_TOKEN")
        if not token:
            raise RuntimeError("Missing TELEGRAM_BOT_TOKEN environment variable")
        application = build_application(token)

    logger.info("Initializing Telegram Application")
    await application.initialize()
    await application.start()
    logger.info("Telegram Application started")


@fastapi_app.on_event("shutdown")
async def shutdown_event():
    if not application:
        return
    logger.info("Shutting down Telegram Application")
    await application.stop()
    await application.shutdown()
    logger.info("Telegram Application shut down")

# Webhook endpoint for receiving updates
@fastapi_app.post("/webhook")
async def webhook_handler(request: Request):
    if not application:
        raise HTTPException(status_code=503, detail="Bot not configured")
    update = await request.json()
    update = Update.de_json(update, application.bot)
    await application.process_update(update)
    return {"status": "ok"}

# Bind the FastAPI app with Modal
@app.function()
@modal_asgi_app()
def get_asgi_app():
    return fastapi_app

# Start the bot (if needed for local testing, not required in webhook mode)
if __name__ == "__main__":
    if application:
        asyncio.run(application.run_polling())
    else:
        logger.error("Bot is not configured; set TELEGRAM_BOT_TOKEN and install python-telegram-bot.")
