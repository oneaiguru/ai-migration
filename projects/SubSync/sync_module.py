import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Optional

from flask import Flask, jsonify, request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

DB_PATH = "user_data.db"
TOKEN_FILE = Path("token.pickle")

app = Flask(__name__)


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def create_table():
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS user_folders (
                user_id INTEGER PRIMARY KEY,
                folder_name TEXT NOT NULL,
                local_folder TEXT NOT NULL,
                unique_id TEXT NOT NULL
            )
            """
        )


create_table()


def insert_folder(user_id, folder_name, local_folder, unique_id):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO user_folders (user_id, folder_name, local_folder, unique_id)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, folder_name, local_folder, unique_id),
        )


def get_drive_service() -> Optional[object]:
    if not TOKEN_FILE.exists():
        return None
    creds = Credentials.from_authorized_user_file(TOKEN_FILE)
    return build("drive", "v3", credentials=creds)


@app.route("/sync_google_drive_folder", methods=["POST"])
def sync_folder():
    if not TOKEN_FILE.exists():
        return jsonify({"error": "Please authorize the app first by visiting /authorize endpoint"}), 401

    user_id = request.form.get("user_id")
    folder_name = request.form.get("folder_name")
    local_folder = request.form.get("local_folder")
    unique_id = request.form.get("unique_id")

    if not user_id or not folder_name or not local_folder or not unique_id:
        return jsonify({"error": "All fields (user_id, folder_name, local_folder, unique_id) are required"}), 400

    insert_folder(user_id, folder_name, local_folder, unique_id)

    # Placeholder: implement actual sync logic with Google Drive here.
    return jsonify({"message": f"Stored sync request for '{folder_name}' -> '{local_folder}/{unique_id}'"}), 200


if __name__ == "__main__":
    app.run(debug=True)
