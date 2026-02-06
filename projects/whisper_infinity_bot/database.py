import sqlite3
import json
import os

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = f"{PROJECT_DIR}/config.json"

# Load configuration
with open(CONFIG_PATH, "r") as config_file:
    config = json.load(config_file)

DB_FILE = config["database_file"]

def get_db_connection():
    """Establish and return a connection to the SQLite database."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Enables dict-like row access
    return conn

def initialize_database():
    """Create necessary tables if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Teachers Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS teachers (
            teacher_code TEXT PRIMARY KEY,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            courses TEXT NOT NULL
        )
    """)

    # Courses Table (approved courses)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS courses (
            course_id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_code TEXT NOT NULL,
            course_name TEXT NOT NULL,
            UNIQUE(teacher_code, course_name),
            FOREIGN KEY (teacher_code) REFERENCES teachers(teacher_code)
        )
    """)

    # Payments Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_code TEXT NOT NULL,
            course_name TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT CHECK(status IN ('Paid', 'Pending', 'Failed')) NOT NULL DEFAULT 'Pending',
            FOREIGN KEY (teacher_code) REFERENCES teachers(teacher_code),
            FOREIGN KEY (course_name) REFERENCES courses(course_name)
        )
    """)

    # Admins Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_name TEXT NOT NULL,
            teacher_code TEXT UNIQUE NOT NULL,
            admin_chat_id TEXT,
            role TEXT CHECK(role IN ('SuperAdmin', 'OrgAdmin')) NOT NULL
        )
    """)

    # Lightweight migration: add admin_chat_id if the column is missing
    cursor.execute("PRAGMA table_info(admins)")
    admin_columns = {row["name"] for row in cursor.fetchall()}
    if "admin_chat_id" not in admin_columns:
        cursor.execute("ALTER TABLE admins ADD COLUMN admin_chat_id TEXT")

    # Password Reset Requests Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS password_resets (
            request_id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_code TEXT NOT NULL,
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            approved_by TEXT,
            status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
            FOREIGN KEY (teacher_code) REFERENCES teachers(teacher_code),
            FOREIGN KEY (approved_by) REFERENCES admins(teacher_code)
        )
    """)

    # Pending Teachers Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pending_teachers (
            pending_id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_code TEXT NOT NULL,
            name TEXT NOT NULL,
            telegram_user_id TEXT NOT NULL,
            status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) NOT NULL DEFAULT 'Pending'
        )
    """)

    # Pending Courses Table (for course registration requests)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pending_courses (
            pending_id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_code TEXT NOT NULL,
            course_name TEXT NOT NULL,
            status TEXT CHECK(status IN ('Pending', 'Approved', 'Rejected')) NOT NULL DEFAULT 'Pending',
            UNIQUE(teacher_code, course_name),
            FOREIGN KEY (teacher_code) REFERENCES teachers(teacher_code)
        )
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    initialize_database()
    print("Database initialized successfully.")
