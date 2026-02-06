import asyncio
import logging
import os
from typing import Any, Optional

import requests
from fastapi import FastAPI, HTTPException, Request
from telegram import Update
try:
    from telegram.ext import (
        Application,
        CommandHandler,
        ContextTypes,
        MessageHandler,
        filters,
    )
except ImportError:  # python-telegram-bot not installed or wrong version
    Application = CommandHandler = ContextTypes = MessageHandler = filters = None
try:
    import modal
    modal_available = True
except ImportError:
    modal = None
    modal_available = False

# ----------------------------
# Logging Setup
# ----------------------------
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# ----------------------------
# Configuration
# ----------------------------
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEBHOOK_URL = os.getenv("TELEGRAM_WEBHOOK_URL")
if not TOKEN:
    logger.warning("TELEGRAM_BOT_TOKEN not set; bot will fail to start until provided.")

ContextType = ContextTypes.DEFAULT_TYPE if ContextTypes else Any

# ----------------------------
# Initialize FastAPI App
# ----------------------------
web_app = FastAPI()

# ----------------------------
# Initialize Modal App
# ----------------------------
if modal_available:
    app = modal.App(name="telegram-bot-app")
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

    app = _ModalAppStub(name="telegram-bot-app")
    logger.warning("modal not installed; ASGI bindings are disabled in this environment.")

# ----------------------------
# Define Bot Command Handlers
# ----------------------------
async def start(update: Update, context: ContextType) -> None:
    """Handle the /start command."""
    logger.info("Received /start command from user %s", update.effective_user.id)
    await update.message.reply_text('Hi! Send me a message and I will echo it back.')

async def echo(update: Update, context: ContextType) -> None:
    """Echo the user's message."""
    user_message = update.message.text
    user_id = update.effective_user.id
    logger.info("Echoing message from user %s: %s", user_id, user_message)
    await update.message.reply_text(user_message)

def build_application(token: str) -> "Application":
    app_instance = Application.builder().token(token).build()
    app_instance.add_handler(CommandHandler("start", start))
    app_instance.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))
    return app_instance


# ----------------------------
# Initialize Telegram Application
# ----------------------------
application: Optional["Application"] = None
if Application and TOKEN:
    application = build_application(TOKEN)
elif not TOKEN:
    logger.warning("TELEGRAM_BOT_TOKEN not set; bot disabled.")
else:
    logger.warning("python-telegram-bot Application unavailable; bot disabled.")

@web_app.on_event("startup")
async def startup_event():
    """Initialize and start the Telegram application."""
    global application

    if application is None:
        if not Application:
            raise RuntimeError("python-telegram-bot is not installed")
        token = os.getenv("TELEGRAM_BOT_TOKEN")
        if not token:
            raise RuntimeError("Missing TELEGRAM_BOT_TOKEN environment variable")
        application = build_application(token)

    logger.info("Initializing Telegram Application")
    await application.initialize()
    await application.start()
    logger.info("Telegram Application started")


@web_app.on_event("shutdown")
async def shutdown_event():
    """Stop the Telegram application."""
    if not application:
        return
    logger.info("Shutting down Telegram Application")
    await application.stop()
    await application.shutdown()
    logger.info("Telegram Application shut down")

# ----------------------------
# Define Webhook Handler Route
# ----------------------------
@web_app.post("/telegram_webhook")
async def webhook_handler(request: Request):
    """Handle incoming webhook updates from Telegram."""
    if not application:
        raise HTTPException(status_code=503, detail="Bot not configured")
    try:
        data = await request.json()
        logger.info(f"Received update: {data}")
        update = Update.de_json(data, application.bot)
        await application.process_update(update)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error processing update: {e}")
        return {"status": "error", "message": str(e)}

# ----------------------------
# Bind FastAPI to Modal using ASGI
# ----------------------------
@modal_asgi_app()
def asgi_app():
    return web_app

# ----------------------------
# Optional: Function to Set Webhook via Modal Function
# ----------------------------
@app.function()
def set_webhook():
    """Set the webhook for the Telegram bot."""
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    webhook_url = os.getenv("TELEGRAM_WEBHOOK_URL")
    if not token or not webhook_url:
        logger.error("Cannot set webhook: missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_URL")
        return {"status": "failure", "description": "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_URL"}
    response = requests.post(f"https://api.telegram.org/bot{token}/setWebhook", data={"url": webhook_url})
    if response.status_code == 200:
        logger.info("Webhook set successfully!")
        return {"status": "success", "description": "Webhook set successfully!"}
    else:
        logger.error(f"Failed to set webhook: {response.text}")
        return {"status": "failure", "description": f"Failed to set webhook: {response.text}"}

# ----------------------------
# No Need for Local Entrypoint
# Modal handles the ASGI app automatically
# ----------------------------
