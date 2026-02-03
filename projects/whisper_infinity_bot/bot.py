import os
import json
import logging
import asyncio
import nest_asyncio
import sqlite3

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    ContextTypes,
    filters
)

nest_asyncio.apply()

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = f"{PROJECT_DIR}/config.json"

with open(CONFIG_PATH, "r") as config_file:
    config = json.load(config_file)

TELEGRAM_BOT_TOKEN = config["telegram_bot_token"]

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

from auth import authenticate_teacher, reset_teacher_password, hash_password
from courses import register_course, get_registered_courses, approve_course, reject_course, get_pending_courses
from payments import record_payment, update_payment_status
from admin import add_admin, approve_teacher, reject_teacher, approve_password_reset, notify_admins_about_signup, is_admin, is_superadmin, set_admin_chat_id
from database import get_db_connection, initialize_database

def get_teacher_profile(teacher_code):
    """Retrieve teacher details from the teachers table."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT teacher_code, name, courses FROM teachers WHERE teacher_code = ?
    """, (teacher_code,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"teacher_code": row["teacher_code"], "name": row["name"], "courses": row["courses"]}
    return None

# ------------------------- Command: /start -------------------------
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.user_data.get("teacher"):
        teacher = context.user_data["teacher"]
        text = f"👋 Welcome back, {teacher['name']}!\n🔹 Status: Logged In"
        keyboard = [
            [InlineKeyboardButton("📚 My Courses", callback_data="my_courses"),
             InlineKeyboardButton("💳 Payments", callback_data="payments")],
            [InlineKeyboardButton("⚙️ Settings", callback_data="settings"),
             InlineKeyboardButton("❓ Help", callback_data="help")],
            [InlineKeyboardButton("🔄 Logout", callback_data="logout")]
        ]
    else:
        text = ("👋 Welcome to Art of Living Russia! Please log in or sign up.\n"
                "🔹 Name: Not Logged In\n"
                "🔹 Status: Guest")
        keyboard = [
            [InlineKeyboardButton("🔑 Log in", callback_data="login"),
             InlineKeyboardButton("🆕 Register as a Teacher", callback_data="register")]
        ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    if update.message:
        await update.message.reply_text(text, reply_markup=reply_markup)
    else:
        await update.callback_query.edit_message_text(text, reply_markup=reply_markup)

# ------------------------- Inline Button Callback Handler -------------------------
async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data

    if data == "login":
        context.user_data["awaiting_login"] = True
        await query.edit_message_text(
            "📝 Please enter your credentials in the format:\n"
            "`<Teacher Code> <Password>`\n"
            "Example: `RUS0007 srisri`",
            parse_mode="Markdown"
        )
    elif data == "register":
        await query.edit_message_text(
            "To register as a teacher, please use the /signup command:\n"
            "`/signup <teacher_code> <full_name>`\n\n"
            "Example:\n"
            "`/signup RUS0105 Misha`",
            parse_mode="Markdown"
        )
    elif data == "logout":
        context.user_data.pop("teacher", None)
        await query.edit_message_text("🔒 You have been logged out. See you soon!")
    elif data == "my_courses":
        teacher = context.user_data.get("teacher")
        if not teacher:
            await query.edit_message_text("Please log in first.")
            return
        result = get_registered_courses(teacher["teacher_code"])
        if result["status"] == "success":
            courses_list = result.get("courses", [])
            courses_text = "\n".join([f"🔹 {course}" for course in courses_list]) if courses_list else "No courses registered yet."
            text = ("📚 **My Courses**\n"
                    f"{courses_text}\n\n"
                    "➕ To request a new course registration, use:\n"
                    "`/register <teacher_code> <course_name>`")
            await query.edit_message_text(text, parse_mode="Markdown")
        else:
            await query.edit_message_text("Error retrieving courses.")
    elif data == "payments":
        await query.edit_message_text("💳 Payments feature coming soon!")
    elif data == "settings":
        await query.edit_message_text("⚙️ Settings feature coming soon!")
    elif data == "help":
        help_text = (
            "❓ **Help Menu**\n\n"
            "User Commands:\n"
            "- /signup <teacher_code> <full_name>: Request a teacher account\n"
            "- /login <teacher_code> <password>: Log in\n"
            "- /register <teacher_code> <course_name>: Request course registration\n"
            "- /pay <teacher_code> <course_name> <amount>: Make a payment\n"
            "- /reset <teacher_code> <new_password>: Reset password\n\n"
            "Admin Commands:\n"
            "- /pending_signups: List pending teacher signups\n"
            "- /approve_teacher <teacher_code>: Approve a teacher signup\n"
            "- /reject_teacher <teacher_code>: Reject a teacher signup\n"
            "- /list_teachers: List all registered teachers\n"
            "- /list_admins: List all admins\n"
            "- /approve_course <teacher_code> <course_name>: Approve course registration\n"
            "- /reject_course <teacher_code> <course_name>: Reject course registration\n"
            "- /list_pending_courses: List pending course registrations\n"
            "- /approve_payment <payment_id>: Approve a payment\n"
            "- /list_pending_payments: List pending payments\n"
            "- /addadmin <admin_code> <admin_name> <role> <admin_chat_id>: Add an admin (SuperAdmin only)"
        )
        await query.edit_message_text(help_text, parse_mode="Markdown")
    else:
        await query.edit_message_text("Unknown action.")

# ------------------------- Message Handler for Login Credentials -------------------------
async def handle_credentials(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.user_data.get("awaiting_login"):
        text = update.message.text.strip()
        parts = text.split(maxsplit=1)
        if len(parts) != 2:
            await update.message.reply_text("Invalid format. Please enter: `<Teacher Code> <Password>`", parse_mode="Markdown")
            return
        teacher_code, password = parts
        auth_response = authenticate_teacher(teacher_code, password)
        if auth_response["status"] == "success":
            teacher_profile = get_teacher_profile(teacher_code)
            if teacher_profile:
                context.user_data["teacher"] = teacher_profile
                if is_admin(teacher_code):
                    set_admin_chat_id(teacher_code, update.effective_user.id)
                context.user_data.pop("awaiting_login", None)
                profile_text = (
                    "✅ Successfully Logged In!\n\n"
                    "👤 **Your Profile**\n"
                    f"🔹 Name: {teacher_profile['name']}\n"
                    f"🔹 Teacher Code: {teacher_profile['teacher_code']}\n"
                    f"🔹 Courses: {teacher_profile['courses'] if teacher_profile['courses'] else 'None'}"
                )
                keyboard = [
                    [InlineKeyboardButton("📚 My Courses", callback_data="my_courses"),
                     InlineKeyboardButton("💳 Payments", callback_data="payments")],
                    [InlineKeyboardButton("⚙️ Settings", callback_data="settings"),
                     InlineKeyboardButton("❓ Help", callback_data="help")],
                    [InlineKeyboardButton("🔄 Logout", callback_data="logout")]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                await update.message.reply_text(profile_text, parse_mode="Markdown", reply_markup=reply_markup)
            else:
                await update.message.reply_text("Error retrieving your profile.")
        else:
            await update.message.reply_text("❌ Invalid credentials. Please try again.")
    else:
        await update.message.reply_text("I'm sorry, I didn't understand that. Please use the menu or available commands.")

# ------------------------- Command: /login -------------------------
async def login_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if context.user_data.get("teacher"):
        await update.message.reply_text("You are already logged in.")
        return
    if len(context.args) != 2:
        await update.message.reply_text("Usage: /login <Teacher Code> <Password>")
        return
    teacher_code, password = context.args
    auth_response = authenticate_teacher(teacher_code, password)
    if auth_response["status"] == "success":
        teacher_profile = get_teacher_profile(teacher_code)
        if teacher_profile:
            context.user_data["teacher"] = teacher_profile
            if is_admin(teacher_code):
                set_admin_chat_id(teacher_code, update.effective_user.id)
            profile_text = (
                "✅ Successfully Logged In!\n\n"
                "👤 **Your Profile**\n"
                f"🔹 Name: {teacher_profile['name']}\n"
                f"🔹 Teacher Code: {teacher_profile['teacher_code']}\n"
                f"🔹 Courses: {teacher_profile['courses'] if teacher_profile['courses'] else 'None'}"
            )
            keyboard = [
                [InlineKeyboardButton("📚 My Courses", callback_data="my_courses"),
                 InlineKeyboardButton("💳 Payments", callback_data="payments")],
                [InlineKeyboardButton("⚙️ Settings", callback_data="settings"),
                 InlineKeyboardButton("❓ Help", callback_data="help")],
                [InlineKeyboardButton("🔄 Logout", callback_data="logout")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            await update.message.reply_text(profile_text, parse_mode="Markdown", reply_markup=reply_markup)
        else:
            await update.message.reply_text("Error retrieving profile.")
    else:
        await update.message.reply_text("❌ Invalid credentials. Please try again.")

# ------------------------- Command: /signup -------------------------
async def signup(update: Update, context: ContextTypes.DEFAULT_TYPE):
    args = context.args
    if len(args) < 2:
        await update.message.reply_text("Usage: /signup <teacher_code> <full_name>")
        return
    teacher_code = args[0]
    full_name = " ".join(args[1:])
    telegram_user_id = update.effective_user.id
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT teacher_code FROM teachers WHERE teacher_code = ?", (teacher_code,))
    existing_teacher = cursor.fetchone()
    cursor.execute("SELECT teacher_code FROM pending_teachers WHERE teacher_code = ?", (teacher_code,))
    pending_teacher = cursor.fetchone()
    if existing_teacher or pending_teacher:
        await update.message.reply_text("This teacher code is already registered or pending approval.")
        conn.close()
        return
    cursor.execute("""
        INSERT INTO pending_teachers (teacher_code, name, telegram_user_id, status)
        VALUES (?, ?, ?, 'Pending')
    """, (teacher_code, full_name, telegram_user_id))
    conn.commit()
    conn.close()
    await update.message.reply_text("✅ Signup request submitted. An admin will review and approve your account.")
    await notify_admins_about_signup(teacher_code, full_name, telegram_user_id)

# ------------------------- Command: /approve_teacher -------------------------
async def approve_teacher_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to approve signups.")
        return
    if len(context.args) != 1:
        await update.message.reply_text("Usage: /approve_teacher <teacher_code>")
        return
    teacher_code = context.args[0]
    result = approve_teacher(context.user_data["teacher"]["teacher_code"], teacher_code)
    if result["status"] == "success":
        await update.message.reply_text(
            f"✅ Teacher {teacher_code} approved!\nDefault password set to: `{result['default_password']}`\nThey can log in using: `/login {teacher_code} {result['default_password']}`",
            parse_mode="Markdown"
        )
    else:
        await update.message.reply_text(f"❌ {result['message']}")

# ------------------------- Command: /reject_teacher -------------------------
async def reject_teacher_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to reject signups.")
        return
    if len(context.args) != 1:
        await update.message.reply_text("Usage: /reject_teacher <teacher_code>")
        return
    teacher_code = context.args[0]
    result = reject_teacher(context.user_data["teacher"]["teacher_code"], teacher_code)
    if result["status"] == "success":
        await update.message.reply_text(f"Teacher {teacher_code} signup request has been rejected.")
    else:
        await update.message.reply_text(f"❌ {result['message']}")

# ------------------------- Command: /pending_signups -------------------------
async def pending_signups(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to view pending signups.")
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT teacher_code, name FROM pending_teachers WHERE status = 'Pending'")
    pending_teachers = cursor.fetchall()
    conn.close()
    if not pending_teachers:
        await update.message.reply_text("✅ No pending signups at the moment.")
        return
    message = "📌 *Pending Teacher Signups:*\n"
    for idx, teacher in enumerate(pending_teachers, start=1):
        message += f"{idx}. {teacher['teacher_code']} - {teacher['name']}\n"
    message += "\nTo approve: `/approve_teacher <teacher_code>`\nTo reject: `/reject_teacher <teacher_code>`"
    await update.message.reply_text(message, parse_mode="Markdown")

# ------------------------- Command: /list_teachers -------------------------
async def list_teachers(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to view the list of teachers.")
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT teacher_code, name FROM teachers")
    teachers = cursor.fetchall()
    conn.close()
    if not teachers:
        await update.message.reply_text("No registered teachers found.")
        return
    message = "👨‍🏫 *Registered Teachers:*\n"
    for idx, teacher in enumerate(teachers, start=1):
        message += f"{idx}. {teacher['teacher_code']} - {teacher['name']}\n"
    await update.message.reply_text(message, parse_mode="Markdown")

# ------------------------- Command: /list_admins -------------------------
async def list_admins(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to view the list of admins.")
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT teacher_code, admin_name, role FROM admins")
    admins = cursor.fetchall()
    conn.close()
    if not admins:
        await update.message.reply_text("No admins found.")
        return
    message = "👑 *Admins & SuperAdmins:*\n"
    for idx, admin in enumerate(admins, start=1):
        message += f"{idx}. {admin['teacher_code']} - {admin['admin_name']} ({admin['role']})\n"
    await update.message.reply_text(message, parse_mode="Markdown")

# ------------------------- Command: /approve_course -------------------------
async def approve_course_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to approve courses.")
        return
    if len(context.args) < 2:
        await update.message.reply_text("Usage: /approve_course <teacher_code> <course_name>")
        return
    teacher_code = context.args[0]
    course_name = " ".join(context.args[1:])
    result = approve_course(teacher_code, course_name)
    if result["status"] == "success":
        await update.message.reply_text(f"✅ {result['message']}")
    else:
        await update.message.reply_text(f"❌ {result['message']}")

# ------------------------- Command: /reject_course -------------------------
async def reject_course_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to reject courses.")
        return
    if len(context.args) < 2:
        await update.message.reply_text("Usage: /reject_course <teacher_code> <course_name>")
        return
    teacher_code = context.args[0]
    course_name = " ".join(context.args[1:])
    result = reject_course(teacher_code, course_name)
    if result["status"] == "success":
        await update.message.reply_text(f"✅ {result['message']}")
    else:
        await update.message.reply_text(f"❌ {result['message']}")

# ------------------------- Command: /list_pending_courses -------------------------
async def list_pending_courses(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to view pending course registrations.")
        return
    pending = get_pending_courses()
    if not pending:
        await update.message.reply_text("✅ No pending course registrations.")
        return
    message = "📌 *Pending Course Registrations:*\n"
    for idx, course in enumerate(pending, start=1):
        message += f"{idx}. {course['teacher_code']} - {course['course_name']}\n"
    message += "\nTo approve: /approve_course <teacher_code> <course_name>\nTo reject: /reject_course <teacher_code> <course_name>"
    await update.message.reply_text(message, parse_mode="Markdown")

# ------------------------- Command: /approve_payment -------------------------
async def approve_payment_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to approve payments.")
        return
    if len(context.args) != 1:
        await update.message.reply_text("Usage: /approve_payment <payment_id>")
        return
    try:
        payment_id = int(context.args[0])
    except ValueError:
        await update.message.reply_text("❌ Payment ID must be a number.")
        return
    result = update_payment_status(payment_id, "Paid")
    if result["status"] == "success":
        await update.message.reply_text(f"✅ {result['message']}")
    else:
        await update.message.reply_text(f"❌ {result['message']}")

# ------------------------- Command: /list_pending_payments -------------------------
async def list_pending_payments(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if "teacher" not in context.user_data or not is_admin(context.user_data["teacher"]["teacher_code"]):
        await update.message.reply_text("❌ You are not authorized to view pending payments.")
        return
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT payment_id, teacher_code, course_name, amount FROM payments WHERE status = 'Pending'")
    payments = cursor.fetchall()
    conn.close()
    if not payments:
        await update.message.reply_text("✅ No pending payments.")
        return
    message = "💳 *Pending Payments:*\n"
    for idx, payment in enumerate(payments, start=1):
        message += f"{idx}. ID: {payment['payment_id']} - {payment['teacher_code']} paid {payment['amount']} for {payment['course_name']}\n"
    message += "\nTo approve: /approve_payment <payment_id>"
    await update.message.reply_text(message, parse_mode="Markdown")

# ------------------------- Command: /reset -------------------------
async def reset_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    teacher = context.user_data.get("teacher")
    actor_code = teacher["teacher_code"] if teacher else None
    if actor_code is None:
        await update.message.reply_text("❌ Please log in before resetting a password.")
        return
    if len(context.args) < 2:
        await update.message.reply_text("Usage: /reset <teacher_code> <new_password>")
        return
    teacher_code = context.args[0]
    new_password = " ".join(context.args[1:])
    # Only the matching teacher or an admin can reset passwords
    if actor_code != teacher_code and not is_admin(actor_code):
        await update.message.reply_text("❌ You are not authorized to reset this password.")
        return
    result = reset_teacher_password(teacher_code, new_password)
    if result["status"] == "success":
        await update.message.reply_text("✅ Password reset successfully!")
    else:
        await update.message.reply_text("❌ Failed to reset password.")

# ------------------------- Command: /addadmin -------------------------
async def addadmin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    teacher = context.user_data.get("teacher")
    actor_code = teacher["teacher_code"] if teacher else None
    if not actor_code or not is_superadmin(actor_code):
        await update.message.reply_text("❌ You must be logged in as a SuperAdmin to add admins.")
        return
    if len(context.args) < 4:
        await update.message.reply_text("Usage: /addadmin <new_admin_code> <admin_name> <role> <admin_chat_id>")
        return
    new_admin_code = context.args[0]
    role = context.args[-2]
    admin_chat_id = context.args[-1]
    admin_name_parts = context.args[1:-2]
    if not admin_name_parts:
        await update.message.reply_text("Usage: /addadmin <new_admin_code> <admin_name> <role> <admin_chat_id>")
        return
    admin_name = " ".join(admin_name_parts)
    result = add_admin(actor_code, new_admin_code, admin_name, role, admin_chat_id)
    if result["status"] == "success":
        await update.message.reply_text(f"✅ {result['message']}")
    else:
        await update.message.reply_text(f"❌ {result['message']}")

# ------------------------- Main Function -------------------------
async def main():
    initialize_database()
    application = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("login", login_command))
    application.add_handler(CommandHandler("signup", signup))
    application.add_handler(CommandHandler("approve_teacher", approve_teacher_command))
    application.add_handler(CommandHandler("reject_teacher", reject_teacher_command))
    application.add_handler(CommandHandler("pending_signups", pending_signups))
    application.add_handler(CommandHandler("list_teachers", list_teachers))
    application.add_handler(CommandHandler("list_admins", list_admins))
    # Require a logged-in teacher (or admin) to request course registration
    async def register_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
        teacher = context.user_data.get("teacher")
        actor_code = teacher["teacher_code"] if teacher else None
        if actor_code is None:
            await update.message.reply_text("❌ Please log in before requesting a course registration.")
            return
        if len(context.args) < 2:
            await update.message.reply_text("Usage: /register <teacher_code> <course_name>")
            return
        teacher_code = context.args[0]
        course_name = " ".join(context.args[1:])
        if actor_code != teacher_code and not is_admin(actor_code):
            await update.message.reply_text("❌ You are not authorized to register courses for this teacher.")
            return
        result = register_course(teacher_code, course_name)
        if result["status"] == "success":
            await update.message.reply_text(f"✅ {result['message']}")
        else:
            await update.message.reply_text(f"❌ {result['message']}")

    application.add_handler(CommandHandler("register", register_command))
    application.add_handler(CommandHandler("pay", lambda update, context:
        update.message.reply_text(record_payment(context.args[0], " ".join(context.args[1:-1]), float(context.args[-1]))["message"])
        if len(context.args) >= 3 else update.message.reply_text("Usage: /pay <teacher_code> <course_name> <amount>")
    ))
    application.add_handler(CommandHandler("reset", reset_command))
    application.add_handler(CommandHandler("addadmin", addadmin_command))
    application.add_handler(CommandHandler("approve_course", approve_course_command))
    application.add_handler(CommandHandler("reject_course", reject_course_command))
    application.add_handler(CommandHandler("list_pending_courses", list_pending_courses))
    application.add_handler(CommandHandler("approve_payment", approve_payment_command))
    application.add_handler(CommandHandler("list_pending_payments", list_pending_payments))
    application.add_handler(CallbackQueryHandler(button_handler))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_credentials))
    await application.run_polling()

if __name__ == "__main__":
    asyncio.run(main())
