import os
import sys
import dropbox
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import time

# Read the Dropbox API access token
token_file = 'token.txt'
TOKEN = ''

if os.path.exists(token_file):
    with open(token_file, 'r') as f:
        TOKEN = f.read().strip()

if not TOKEN:
    print('Error: Dropbox token not found.')
    sys.exit(1)

# Initialize Dropbox client
dbx = dropbox.Dropbox(TOKEN)

# Set your local and remote folders
local_folder = Path("local_folder")
remote_folder = "/"


def download_file(remote_file, local_file):
    try:
        metadata, res = dbx.files_download(remote_file)
        with local_file.open("wb") as f:
            f.write(res.content)
            print(f"Downloaded {remote_file} to {local_file}")
    except dropbox.exceptions.ApiError as err:
        print(f"Error downloading {remote_file}: {err}")


def upload_file(local_file, remote_file):
    with local_file.open("rb") as f:
        try:
            dbx.files_upload(f.read(), remote_file,
                             mode=dropbox.files.WriteMode("overwrite"))
            print(f"Uploaded {local_file} to {remote_file}")
        except dropbox.exceptions.ApiError as err:
            print(f"Error uploading {local_file}: {err}")


def sync_folder(local_folder, remote_folder):
    remote_entries = {
        entry.name: entry for entry in dbx.files_list_folder(remote_folder).entries}

    for local_file in local_folder.glob("*"):
        remote_file = f"{remote_folder}/{local_file.name}"
        entry = remote_entries.get(local_file.name)

        if not entry or local_file.stat().st_mtime > entry.client_modified.timestamp():
            upload_file(local_file, remote_file)

    for entry in remote_entries.values():
        remote_file = f"{remote_folder}/{entry.name}"
        local_file = local_folder / entry.name
        if not local_file.exists() or local_file.stat().st_mtime < entry.client_modified.timestamp():
            download_file(remote_file, local_file)


class FolderHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            local_file = Path(event.src_path)
            remote_file = f"{remote_folder}/{local_file.name}"
            upload_file(local_file, remote_file)

    def on_created(self, event):
        if not event.is_directory:
            local_file = Path(event.src_path)
            remote_file = f"{remote_folder}/{local_file.name}"
            upload_file(local_file, remote_file)


if __name__ == "__main__":
    # Run an initial sync to ensure the folders are up to date
    sync_folder(local_folder, remote_folder)

    # Set up a watchdog observer to monitor the local folder
    observer = Observer()
    observer.schedule(FolderHandler(), str(local_folder), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()

    observer.join()
