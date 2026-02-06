import os
import sys

import dropbox
from flask import Flask, jsonify, request

app = Flask(__name__)

TOKEN = os.getenv("DROPBOX_ACCESS_TOKEN")
if not TOKEN:
    print("Error: Dropbox token not found. Set DROPBOX_ACCESS_TOKEN.")
    sys.exit(1)


@app.route('/list_dropbox_folders', methods=['GET'])
def list_dropbox_folders_route():
    path = request.args.get('path', '')
    dbx = dropbox.Dropbox(TOKEN)
    try:
        result = dbx.files_list_folder(path)
        folder_list = [{'name': entry.name, 'path': entry.path_display} for entry in result.entries if
                       isinstance(entry, dropbox.files.FolderMetadata)]
        return jsonify(folder_list), 200
    except dropbox.exceptions.ApiError as err:
        return jsonify({'error': str(err)}), 400


if __name__ == '__main__':
    app.run(debug=True)
