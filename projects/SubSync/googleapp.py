import os
import pickle
import sqlite3
import sys

import google.oauth2.credentials
import google_auth_oauthlib.flow
import googleapiclient.discovery
import googleapiclient.errors
from flask import Flask, jsonify, redirect, request

DB_PATH = "user_data.db"


def get_conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)


app = Flask(__name__)

CLIENT_SECRETS_FILE = os.getenv("GOOGLE_CLIENT_SECRET_FILE")


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
        conn.commit()


create_table()


def insert_folder(user_id, folder_name, local_folder, unique_id):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO user_folders (user_id, folder_name, local_folder, unique_id)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, folder_name, local_folder, unique_id),
        )
        conn.commit()


def get_user_folders(user_id):
    with get_conn() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT folder_name, local_folder, unique_id FROM user_folders WHERE user_id=?",
            (user_id,),
        )
        return cursor.fetchall()


def sync_google_drive_folder(creds, folder_name, local_folder, unique_id):
    # Placeholder: implement Drive sync here when credentials are available.
    return None

@app.route('/sync_google_drive_folder', methods=['POST'])
def sync_folder():
    if not os.path.exists("token.pickle"):
        return jsonify({"error": "Please authorize the app first by visiting /authorize endpoint"}), 401

    with open("token.pickle", "rb") as token:
        creds = pickle.load(token)

    folder_name = request.form.get("folder_name")
    local_folder = request.form.get("local_folder")
    unique_id = request.form.get("unique_id")

    if not folder_name or not local_folder or not unique_id:
        return jsonify({"error": "All fields (folder_name, local_folder, unique_id) are required"}), 400

    sync_google_drive_folder(creds, folder_name, local_folder, unique_id)
    return jsonify({"message": f"Folder '{folder_name}' has been synced to '{local_folder}/{unique_id}'"}), 200

if not CLIENT_SECRETS_FILE or not os.path.exists(CLIENT_SECRETS_FILE):
    print("Error: Google Drive client secrets file not found. Set GOOGLE_CLIENT_SECRET_FILE.")
    sys.exit(1)

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
API_SERVICE_NAME = "drive"
API_VERSION = "v3"


@app.route('/authorize')
def authorize():
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES)
    flow.redirect_uri = request.url_root + "oauth2callback"
    authorization_url, state = flow.authorization_url(
        access_type="offline", include_granted_scopes="true")
    return redirect(authorization_url)


@app.route('/oauth2callback')
def oauth2callback():
    state = request.args['state']
    code = request.args['code']
    flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, state=state)
    flow.redirect_uri = request.url_root + "oauth2callback"
    flow.fetch_token(code=code)
    credentials = flow.credentials
    with open("token.pickle", "wb") as token:
        pickle.dump(credentials, token)
    return "Credentials saved. You can now use the /list_google_drive_folders endpoint."


@app.route('/list_google_drive_folders', methods=['GET'])
def list_google_drive_folders():
    if not os.path.exists("token.pickle"):
        return jsonify({"error": "Please authorize the app first by visiting /authorize endpoint"}), 401

    with open("token.pickle", "rb") as token:
        creds = pickle.load(token)

    service = googleapiclient.discovery.build(
        API_SERVICE_NAME, API_VERSION, credentials=creds)
    query = "mimeType='application/vnd.google-apps.folder'"
    results = service.files().list(
        q=query, fields="nextPageToken, files(id, name, mimeType, parents)").execute()
    items = results.get("files", [])
    folders = [{'name': item['name'], 'id': item['id'],
                'parents': item.get('parents', [])} for item in items]
    return jsonify(folders), 200


if __name__ == '__main__':
    app.run(debug=True)
    
