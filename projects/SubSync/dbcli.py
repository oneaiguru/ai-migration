#!/usr/bin/env python3

import os
import dropbox
import requests
from dropbox import DropboxOAuth2FlowNoRedirect


APP_KEY = os.getenv("DROPBOX_APP_KEY")
APP_SECRET = os.getenv("DROPBOX_APP_SECRET")
REFRESH_TOKEN = os.getenv("DROPBOX_REFRESH_TOKEN")

if not APP_KEY or not APP_SECRET:
    raise RuntimeError("Missing DROPBOX_APP_KEY or DROPBOX_APP_SECRET environment variables")

auth_flow = DropboxOAuth2FlowNoRedirect(APP_KEY, APP_SECRET)


def get_access_token(refresh_token):
    token_url = "https://api.dropboxapi.com/oauth2/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": APP_KEY,
        "client_secret": APP_SECRET,
    }

    response = requests.post(token_url, headers=headers, data=payload)
    response.raise_for_status()
    return response.json()["access_token"]


if REFRESH_TOKEN is None:
    authorize_url = auth_flow.start() + "&token_access_type=offline"
    print("1. Go to: " + authorize_url)
    print("2. Click \"Allow\" (you might have to log in first).")
    print("3. Copy the authorization code.")
    auth_code = input("Enter the authorization code here: ").strip()

    try:
        oauth_result = auth_flow.finish(auth_code)
        REFRESH_TOKEN = oauth_result.refresh_token
    except Exception as e:
        print('Error: %s' % (e,))
        exit(1)

access_token = get_access_token(REFRESH_TOKEN)

with dropbox.Dropbox(oauth2_access_token=access_token) as dbx:
    dbx.users_get_current_account()
    print("Successfully set up client!")
