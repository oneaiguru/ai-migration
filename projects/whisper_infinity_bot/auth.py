import bcrypt
import sqlite3
import json
from database import get_db_connection
import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = f"{PROJECT_DIR}/config.json"

# Load configuration
with open(CONFIG_PATH, "r") as config_file:
    config = json.load(config_file)

def hash_password(password):
    """Generate a salted bcrypt hash for the given password."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password, hashed_password):
    """Verify if the given password matches the stored bcrypt hash."""
    return bcrypt.checkpw(password.encode(), hashed_password.encode())

def authenticate_teacher(teacher_code, password):
    """Check teacher login credentials."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT password_hash FROM teachers WHERE teacher_code = ?",
        (teacher_code,)
    )
    row = cursor.fetchone()
    conn.close()

    if row and verify_password(password, row["password_hash"]):
        return {"status": "success", "teacher_code": teacher_code}

    return {"status": "failure", "message": "Invalid credentials"}

def reset_teacher_password(teacher_code, new_password):
    """Reset a teacher's password immediately (without admin approval)."""
    conn = get_db_connection()
    cursor = conn.cursor()

    hashed_password = hash_password(new_password)
    cursor.execute(
        "UPDATE teachers SET password_hash = ? WHERE teacher_code = ?",
        (hashed_password, teacher_code)
    )
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Password reset successfully"}

if __name__ == "__main__":
    print("Auth module loaded.")
