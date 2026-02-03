import sqlite3
import logging
import json
from database import get_db_connection
from telegram import Bot
import bcrypt
import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = f"{PROJECT_DIR}/config.json"

# Load configuration
with open(CONFIG_PATH, "r") as config_file:
    config = json.load(config_file)

TELEGRAM_BOT_TOKEN = config["telegram_bot_token"]
bot = Bot(token=TELEGRAM_BOT_TOKEN)

def is_admin(teacher_code):
    """Check if a user is an Admin or SuperAdmin."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role FROM admins WHERE teacher_code = ?",
        (teacher_code,)
    )
    row = cursor.fetchone()
    conn.close()
    return row is not None  # Admin or SuperAdmin if found

def is_superadmin(teacher_code):
    """Check if a user is a SuperAdmin."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role FROM admins WHERE teacher_code = ? AND role = 'SuperAdmin'",
        (teacher_code,)
    )
    row = cursor.fetchone()
    conn.close()
    return row is not None

def add_admin(actor_code, new_admin_code, admin_name, role, admin_chat_id):
    """Allow SuperAdmins to add new admins."""
    if not is_superadmin(actor_code):
        return {
            "status": "failure",
            "message": "Unauthorized: Only SuperAdmins can create admins."
        }

    if role not in {"SuperAdmin", "OrgAdmin"}:
        return {
            "status": "failure",
            "message": "Invalid role. Use 'SuperAdmin' or 'OrgAdmin'."
        }

    if not admin_chat_id:
        return {
            "status": "failure",
            "message": "Admin chat ID is required."
        }

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO admins (admin_name, teacher_code, admin_chat_id, role) VALUES (?, ?, ?, ?)",
            (admin_name, new_admin_code, admin_chat_id, role)
        )
        conn.commit()
        logging.info(
            f"New {role} {admin_name} ({new_admin_code}) added by {actor_code} with chat_id {admin_chat_id}."
        )
        return {
            "status": "success",
            "message": f"{role} '{admin_name}' added successfully."
        }
    except sqlite3.IntegrityError:
        return {
            "status": "failure",
            "message": "Admin already exists or teacher_code is taken."
        }
    finally:
        conn.close()

def set_admin_chat_id(teacher_code, admin_chat_id):
    """Update admin_chat_id for an existing admin."""
    if not admin_chat_id:
        return False
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE admins SET admin_chat_id = ? WHERE teacher_code = ?",
        (str(admin_chat_id), teacher_code)
    )
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated

async def notify_admins_about_signup(teacher_code, full_name, telegram_user_id):
    """Send a message to all Admins about the new signup request."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Get all Admins (both OrgAdmin and SuperAdmin)
    cursor.execute("SELECT teacher_code, admin_chat_id FROM admins")
    admins = cursor.fetchall()
    conn.close()

    message = (
        f"🚨 *New Teacher Signup Request*\n\n"
        f"🔹 *Teacher Code:* {teacher_code}\n"
        f"🔹 *Name:* {full_name}\n"
        f"🔹 *Telegram ID:* {telegram_user_id}\n\n"
        f"To approve, use: `/approve_teacher {teacher_code}`\n"
        f"To reject, use: `/reject_teacher {teacher_code}`"
    )

    for admin in admins:
        admin_code = admin["teacher_code"]
        chat_id = admin["admin_chat_id"]
        if not chat_id:
            logging.warning(f"Skipping admin {admin_code}: missing chat_id.")
            continue
        try:
            await bot.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode="Markdown"
            )
        except Exception as e:
            logging.error(f"Failed to notify admin {admin_code} at chat_id {chat_id}: {e}")

def generate_default_password():
    """Generate a simple default password (or you could make it random)."""
    return "defaultpass"

def hash_password(password):
    """Generate a salted bcrypt hash for the given password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def approve_teacher(approver_code, teacher_code):
    """
    Move a teacher from pending_teachers to teachers with a default password.
    Must be called by an Admin or SuperAdmin.
    """
    if not is_admin(approver_code):
        return {
            "status": "failure",
            "message": "Unauthorized: Only Admins can approve teachers."
        }

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if teacher_code is in pending_teachers
    cursor.execute(
        "SELECT teacher_code, name, telegram_user_id FROM pending_teachers WHERE teacher_code = ? AND status = 'Pending'",
        (teacher_code,)
    )
    pending = cursor.fetchone()
    if not pending:
        conn.close()
        return {
            "status": "failure",
            "message": f"No pending signup found for {teacher_code}."
        }

    # Move teacher from pending_teachers to teachers
    default_pass = generate_default_password()
    hashed_pass = hash_password(default_pass)

    try:
        cursor.execute(
            "INSERT INTO teachers (teacher_code, password_hash, name, courses) VALUES (?, ?, ?, ?)",
            (pending["teacher_code"], hashed_pass, pending["name"], "")
        )
        # Mark the pending request as 'Approved'
        cursor.execute(
            "UPDATE pending_teachers SET status = 'Approved' WHERE teacher_code = ?",
            (teacher_code,)
        )
        conn.commit()
        logging.info(f"Teacher {teacher_code} approved by {approver_code}.")
        response = {
            "status": "success",
            "teacher_code": teacher_code,
            "default_password": default_pass
        }
    except sqlite3.IntegrityError:
        response = {
            "status": "failure",
            "message": f"Teacher code {teacher_code} already exists in teachers."
        }

    conn.close()
    return response

def reject_teacher(approver_code, teacher_code):
    """
    Reject a teacher signup request (removes entry from pending_teachers).
    Must be called by an Admin or SuperAdmin.
    """
    if not is_admin(approver_code):
        return {
            "status": "failure",
            "message": "Unauthorized: Only Admins can reject teachers."
        }

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT teacher_code FROM pending_teachers WHERE teacher_code = ? AND status = 'Pending'",
        (teacher_code,)
    )
    pending = cursor.fetchone()
    if not pending:
        conn.close()
        return {
            "status": "failure",
            "message": f"No pending signup found for {teacher_code}."
        }

    # Delete from pending_teachers
    cursor.execute(
        "DELETE FROM pending_teachers WHERE teacher_code = ?",
        (teacher_code,)
    )
    conn.commit()
    conn.close()

    logging.info(f"Teacher {teacher_code} rejected by {approver_code}.")
    return {
        "status": "success",
        "teacher_code": teacher_code
    }

def approve_password_reset(admin_code, request_id):
    """Allow an admin to approve a password reset request."""
    if not is_admin(admin_code):
        return {
            "status": "failure",
            "message": "Unauthorized: Only Admins can approve password resets."
        }

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT teacher_code FROM password_resets WHERE request_id = ? AND status = 'Pending'",
        (request_id,)
    )
    request = cursor.fetchone()
    if not request:
        conn.close()
        return {
            "status": "failure",
            "message": "No pending request found."
        }

    teacher_code = request["teacher_code"]
    cursor.execute(
        "UPDATE password_resets SET status = 'Approved', approved_by = ? WHERE request_id = ?",
        (admin_code, request_id)
    )
    conn.commit()
    conn.close()

    logging.info(
        f"Password reset approved for {teacher_code} by {admin_code}."
    )
    return {
        "status": "success",
        "message": f"Password reset approved for {teacher_code}."
    }

if __name__ == "__main__":
    print("Admin module loaded.")
